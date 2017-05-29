**Update:** Some time after I wrote this post, Airbnb published their excellent [enzyme](https://github.com/airbnb/enzyme) library which does all the stuff described in this post and a lot more. You should definitely look into using it!

The React TestUtils [shallow rendering](https://facebook.github.io/react/docs/test-utils.html#shallow-rendering) feature allows us to test React components in true isolation from other component classes, and removes the need for a DOM in the test environment. It does this by allowing us to test the return value of a component's `render` method, without instantiating any subcomponents.

A basic example of how it can be used, assuming we're testing a component called `<Page />`:

```js
import React from 'react/addons';

const headingElement = <h1 className="title">title text</h1>;

// shallow render the component under test
const renderer = React.addons.TestUtils.createRenderer();
renderer.render(<Page heading={headingElement} />);
const renderedTree = renderer.getRenderedOutput();

// make assertions about the shallow rendered tree
assert(renderedTree.type === 'div');
assert(renderedTree.props.className === 'page');
assert(renderedTree.props.children[0] === headingElement);

```

If we're testing a stateless component, we can use a helper function to simplify things a bit, as the rendered output will always be the same given the same props:

```js
import React from 'react';
import shallowRender from 'react-shallow-render';

const headingElement = <h1 className="title">title text</h1>;

// shallow render the component under test
const renderedTree = shallowRender(<Page heading={headingElement} />);

// and then do your assertions as before

```

However, if we are asserting directly on the root `ReactElement` returned by the renderer (or a specific child or descendant of it), then we're coupling our test to the exact structure of the tree returned by the component's render method. This means that the test will break even if we change something superficial, like wrapping the rendered child in a `<div>`.

Instead, we can query the rendered tree to find the nodes we're interested in:

```js
import { findWithClass } from 'react-shallow-testutils';

const pageContentElement = findWithClass(renderedTree, 'page-content');
assert(pageContentElement != null);

```

You can use a utility like the `findAll` function provided by the [react-shallow-testutils](https://www.npmjs.com/package/react-shallow-testutils) npm package to traverse the rendered tree returned by `shallowRender`, finding all nodes which match a function. On top of that a number of useful finder utilities can be built, such as `findWithClass` shown in the example above (also included in the react-shallow-testutils package). `findWithClass`, as you might guess, is used to find an node with a `className` prop which includes the specified class.

You can draw a parallel between the finder functions which the React [TestUtils](https://facebook.github.io/react/docs/test-utils.html) provide for finding `ReactComponent` instances in the rendered component tree and these utilties which allow finding `ReactElement` objects in the rendered element tree for a component. If you're still unclear on the difference between React components and elements, see [React (Virtual) DOM Terminology](https://facebook.github.io/react/docs/glossary.html) in the React docs.

Another particularly useful approach is to find nodes in the rendered tree which are equal to an expected node, specified by the test. However, usually you want to compare the nodes via value equality, not reference equality. Additionally, often it is preferable to match the rendered node on only a specified subset of its props. For example:

```js
import findMatching from './findMatching'; // we'll implement this later

class Page extends React.Component {
  render() {
    return (
      <div>
        <div className="page-head">
          <PageHeader title={this.props.title} unimportant="something" />
        </div>
        <div className="page-body">
          {this.props.children}
        </div>
      </div>
    );
  }
}

const titleText = 'My Page';
const renderedTree = shallowRender(<Page title={titleText} />);

// matches any PageHeader element where the 'title' prop equals the value titleText
assert(findMatching(renderedTree, <PageHeader title={titleText} />) != null);

// matches an element of any type where the 'title' prop equals the value titleText
assert(findMatching(renderedTree, {props: {title: titleText}}) != null);

```

In this example, we're finding an element of type `PageHeader`, which a matching `title` prop.

In addition to being a clearer syntax for declaring the shape of the element you want to match, this approach allows us to ignore inconsequential details when finding matches, like the `unimportant` prop on the `<PageHeader />` in the example above.

A simple implementation of `findMatching` in the previous example might be something like:

```js
import { findAll } from 'react-shallow-testutils';
import objectMatches from 'object-matches';

function findAllMatching(tree, match) {
  return findAll(tree, (el) =>
    (match.type ? el.type === match.type : true) && // match type if specified
    objectMatches(el.props, match.props) // match subset of props
  );
}

function findMatching(tree, match) {
  const found = findAllMatching(tree, match);
  if (found.length !== 1) throw new Error('Did not find exactly one match');
  return found[0];
}

```

Additionally, you can make the output of failing tests a bit easier to read by pretty-printing the `ReactElement`s which are involved, for which you could use a module I wrote called [inspect-react-element](https://www.npmjs.com/package/inspect-react-element).

Now when an assertion fails, like:

```js
expect(renderedTree).toContainReactNodeInTreeLike(<PageHeader nonExistentProp />);

```

You would see the message:

```
Expected
  <div>
    <div className="page-head">
      <PageHeader title={undefined} unimportant="something" />
    </div>
    <div className="page-body" />
  </div>
to contain a ReactNode in its tree like
  <PageHeader nonExistentProp={true} />

```

Here's the implementation of the custom `toContainReactNodeInTreeLike` Jasmine/Jest matcher used above, which prints an informative error message when a match is not found:

```js
jasmine.addMatchers({
  toContainReactNodeInTreeLike(expectedChild) {
    const {actual, isNot} = this;
    this.message = () =>
      clean`
        Expected
        ${indent(inspectReactElement(actual), 1)}
        ${isNot ? 'not ' : ''}to contain a ReactNode in its tree like
        ${indent(inspectReactElement(expectedChild), 1)}
      `;

    const found = findAllMatching(actual, expectedChild);
    return found.length > 0;
  },
});

```

In conclusion, try to write your shallow-render tests the way you'd write tests using `TestUtils.findAllInRenderedTree` etc, but use utilities which do the same thing for shallow-rendered trees as the TestUtils do for rendered DOM components.
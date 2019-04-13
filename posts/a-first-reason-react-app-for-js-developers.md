_This post has been updated to use the Reason 4 syntax, and to account for API changes in Reason React. It is up-to-date as of April 2019. A Traditional Chinese translation of an older version of this article is available [here](http://987.tw/a-first-reason-react-app-for-javascript-developers/)._

[Reason](https://reasonml.github.io/) is a statically-typed functional programming language from Facebook which can be compiled to Javascript. [Reason React](https://reasonml.github.io/reason-react/) is a wrapper for [React](https://reactjs.org/) which makes it easy to use from Reason.

We're going to build a small single page web app to put Reason React through its paces. The app will display a list of top [Reason-related Github repos](https://github.com/topics/reasonml). It's a small enough task that we can complete it in a few hours, but also has enough complexity that we can kick the tires of this new language. This tutorial expects no existing knowledge of Reason, though a basic familiarity with static types would be helpful.

### Before we get started

Make sure you have your editor set up for Reason. You're not getting the full benefit of a statically typed language if you haven't got type information, inline errors and autocomplete in your editor. You can find recommended packages on the [Editor Plugins page of the Reason website](https://reasonml.github.io/docs/en/editor-plugins.html). The VS Code integration is popular in the Reason community.

### A new project

We're going to use `bsb`, the Reason-to-Javascript compiler/build tool, to create a starting point for our app, which is going to be called `reason-repo-list`:

```bash
# first we globally install 'bs-platform', which includes the Reason-to-JS compiler
npm install --global bs-platform

# The Reason-to-JS compiler tool is called 'bsb' (short for BuckleScript Build)
# We can use it to create a new project called 'reason-repo-list', set up to use React
bsb -init reason-repo-list -theme react-hooks

# install dependecies
cd reason-repo-list
npm install

npm start # start the bsb compiler in watch mode
```

Now we have the `bsb` compiler running in watch mode. It will watch for changes to our Reason (`.re`) files and automatically compile them into Javascript (`.bs.js`) files.

Next, we need to open another terminal window to start Webpack's dev server:

```bash
# in a second terminal window
npm run server
```
Yeah, it's a bit janky that these two aren't more integrated.

Open [http://localhost:8000/](http://localhost:8000/) and you should see this:

![Screenshot of reason-react blank slate](/files/reason-react-hooks.png)

This page is being rendered using React, from a component written in Reason. In your editor, open the project folder and open up `src/Index.re`. Just delete and replace the whole contents of the file with this:

```reason
ReactDOMRe.renderToElementWithId(<App />, "root");
```

If you've built many React apps this should look pretty familiar. The above Reason code is doing roughly the same thing as this Javascript equivalent:

```js
ReactDOM.render(<App />, document.getElementById('root'));
```

Upon saving the file, your editor might show an error saying that the `App` component doesn't exist. We'll fix that in a minute.

Before continuing, let's get some boilerplate out of the way. Replace the contents of `src/index.html` with the following:
```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reason Projects</title>
  <style>
    body {
      font-family: sans-serif
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script src="Index.js"></script>
</body>
</html>

```

### JSX in Reason

Create another file called `src/App.re`. This is the top level component of our app. Dump this stuff in there:

```reason
[@react.component]
let make = () => <div> <h1>{ReasonReact.string("Reason Projects")}</h1> </div>;
```

Hit save and look at your browser window showing [http://localhost:8000](http://localhost:8000). You should see a page which just says 'Reason Projects'.

Jump back to your editor and we'll walk through the code. It looks somewhat like the React JSX you're used to, with a few differences.

In Reason React, some things are a bit more explicit than normal Javascript React. Reason's JSX doesn't allow you to display text by simply putting it directly between JSX tags. Instead we use a function called `ReasonReact.string`, and we call it with the string of text we want to display: `"Reason Projects"`. In Reason strings are always double quoted.

You can think of the above code as being more or less equivalent to this JS React code:

```js
function App () {
  return ( 
    <div>
      <h1>{'Reason Projects'}</h1> 
    </div>
  );
}
```

### A record type

Next, our list of repos. First we'll build out the UI components with fake data, and then replace it with data from this API request:
https://api.github.com/search/repositories?q=topic%3Areasonml&type=Repositories

We'll define a 'record' type to represent each repo item from the JSON. A record is like a JS object, except that the list of properties that it has, and what their types are, is fixed. This is how we might define a record type for Github API data about a Github repo:

```reason
type repo = {
  full_name: string,
  stargazers_count: int,
  html_url: string
};
```

Create a new file called `RepoData.re` and add the above code into it.

### Files are modules

We've defined our type at the top level of the file. In Reason, every file is a module, and all the things defined at the top level of the file using the keywords `let`, `type`, and `module` are exposed to be used from other files (that is, other modules). In this case, other modules can reference our `repo` type as `RepoData.repo`. Unlike in Javascript, in Reason there is no need for `import` statements to reference things from other modules.

Let's use our type in `App.re`. The repos page is just a list of repos, with each item in the list consisting of the name of the repo (linking to the repo on Github), and the number of stars the repo has. We'll define some dummy data and render a new component called `<RepoItem />`, which will represent an item in the list of repos. Replace the contents of `App.re` with the following:

```reason
[@react.component]
let make = () => {
  /* our dummy data */
  let dummyRepo: RepoData.repo = {
    full_name: "jsdf/reason-react-hacker-news",
    stargazers_count: 27,
    html_url: "https://github.com/jsdf/reason-react-hacker-news",
  };

  <div>
    <h1> {ReasonReact.string("Reason Projects")} </h1>
    <RepoItem repo=dummyRepo />
  </div>;
};
```

In the statement beginning `let dummyRepo: RepoData.repo =`, `dummyRepo` is the name of the value we're defining and `RepoData.repo` is the type we're annotating it with. Reason can infer the types of most things we declare, but here it's useful to include the annotation so that the typechecker can let us know if we've made a mistake in our test data. Note that in Reason, the `let` keyword [works a little differently](https://reasonml.github.io/docs/en/let-binding) to the `let` keyword in Javascript.

### Return values in Reason

Note that the body of the render function is now wrapped in `{}` braces, because it contains multiple statements. In Javascript, if we used braces around the body of an `=>` arrow function we'd need to add a `return` statement to return a value. However in Reason, value resulting from the last statement in the function automatically becomes the return value. If you don't want to return anything from a function, you can make the last statement `()` (which is called 'unit').

### Defining components in Reason React

You might now see an error saying `Unbound module RepoItem`. That's because we added `<RepoItem repo=dummyRepo />` in the render function of the App component, but we haven't created that module yet. Add a new file called `RepoItem.re` containing:

```reason
[@react.component]
let make = (~repo: RepoData.repo) =>
  <div> {ReasonReact.string(repo.full_name)} </div>;
```

Let's take the time here to dissect what's happening in this file.

What we have here is a component which takes one prop called `repo` (annotated with the type `repo` from the `RepoData` module), and renders a `<div />`.

Each Reason React component is a Reason module which defines a function called `make`. The props are specified as [Labeled Arguments](https://reasonml.github.io/docs/en/function.html#labeled-arguments), which effectively work a lot like JS React's props object.

We have preceded the function with `[@react.component]`, which is just a sort of annotation that sets up the function as a Reason React component.

Next we'll flesh out the render function to display the fields of the `repo` record:

```reason
[@react.component]
let make = (~repo: RepoData.repo) =>
  <div>
    <a href={repo.html_url}>
      <h2> {ReasonReact.string(repo.full_name)} </h2>
    </a>
    {ReasonReact.string(string_of_int(repo.stargazers_count) ++ " stars")}
  </div>;
```

Note that we have to convert the `int` (integer) value of `repo.stargazers_count` to a string using the `string_of_int` function. We then use the `++` string concatenation operator to combine it with the string `" stars"`. In Reason, `++` is like `+` in Javascript, except that it only works on strings.

Now is a good time to save and take a look at our progress in the browser.

### A stateful React component

Our app is going to load some data and then render it, which means we need a place to put the data after it's loaded. React component state seems like an obvious choice. So we'll use the useState hook from the React Hooks API to store our state.

In `App.re`:

```reason
// our dummy data
let dummyRepo: RepoData.repo = {
  full_name: "jsdf/reason-react-hacker-news",
  stargazers_count: 27,
  html_url: "https://github.com/jsdf/reason-react-hacker-news",
};

[@react.component]
let make = () => {
  let (repoData, _setRepoData) = React.useState(() => dummyRepo);

  <div>
    <h1> {ReasonReact.string("Reason Projects")} </h1>
    <RepoItem repo=repoData />
  </div>;
};
```

The statement:
```reason
let (repoData, _setRepoData) = React.useState(() => dummyRepo);
```
might look familiar if you're used to the `useState` hook in JS React. However, you'll notice that instead of using `[ ]` for [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) the state value and update function from the hook, we use `( )`. This is because in Reason React, the hook functions return [Tuples](https://reasonml.github.io/docs/en/tuple), instead of Arrays. Apart from the different syntax however, the `useState` hook works just as you would expect.

As we are not yet making use of `setRepoData` function returned from the `useState` hook, we put an `_` underscore at the start of the `_setRepoData` variable name. That just lets Reason know we're not currently using that argument. Despite the fact we're not using this argument, it does still need to be included in the tuple destructuring or you'll get an error.

### Option and pattern matching

Currently we have our `repoData` dummy data already available when we define the initial state of the component, but once we are loading it from the server it will initially be null. However, in Reason you can't just have the value of a record field be `null`, as you can in Javascript. Instead, values which sometimes might not be present need to be 'wrapped' in another type called `option`. We can change the initial value passed to our `useState`hook to represent this like so:

```reason
let optionalDummyRepo: option(RepoData.repo) = Some(dummyRepo);

let (repoData, _setRepoData) = React.useState(() => optionalDummyRepo);
```

The above is written in an intentionally verbose way to make it clear what the type of `optionalDummyRepo` is. We can simplify it to:
```reason
let (repoData, _setRepoData) = React.useState(() => Some(dummyRepo));
```

In Reason `option` is a type which is made up of '[Variants](https://reasonml.github.io/docs/en/variant)'. A Variant is a type which can only be one of several possible variations which have been explicitly defined. In the case of `option`, the variants are `Some` and `None`. `Some` is used when a value is present (and contains the value itself), whereas `None` represents the absence of a value (like `null` in Javascript). Here we've 'wrapped' `dummyRepo` in the `Some` variant, because we have a value present.

So why use this wrapper, instead of just allowing our `repoData` field to contain either a value or `null`? The reason is to force us to handle both possible cases when actually using the value. This is good because it means we can't accidentally forget to deal with the 'null' case, resulting in a bug.

This means we also need to make a change at the place where the `repoData` field in our state is used. As usual, the type checker is one step ahead of us, and is giving us an error pointing to `<RepoItem repo=repoData />` which hints at the next change we need to make:

```
Error: This expression has type option(ReactHooksTemplate.RepoData.repo)
       but an expression was expected of type
         ReactHooksTemplate.RepoData.repo = ReactHooksTemplate.RepoData.repo
```

We can't pass `repoData` directly as the `repo` prop of `<RepoItem />`, because it's wrapped in an `option()`, but `<RepoItem />` expects it without the `option` wrapper. So how do we unwrap it? We use _pattern matching_. This is where Reason forces use to cover all possible cases (or at least explicitly throw an error for cases we've decided not to handle). Pattern matching makes use of the `switch` statement. Unlike a switch statement in Javascript however, the cases of a switch statement in Reason can match against the _types_ of the values (eg. `Some` and `None`), not just the values themselves. We'll change our render method to use a `switch` to provide logic to render our repo item in each possible case:

```reason
[@react.component]
let make = () => {
  let (repoData, _setRepoData) = React.useState(() => Some(dummyRepo));

  let repoItem =
    switch (repoData) {
    | Some(repo) => <RepoItem repo />
    | None => ReasonReact.string("Loading")
    };

  <div>
    <h1> {ReasonReact.string("Reason Projects")} </h1>
    repoItem
  </div>;
};
```

Here you can see the switch statement has a case to match a `repoData` value with the type `Some`, and pulls out the actual repo record into a variable called `repo`, which it then uses in the expression to the right of the `=>`, returning a `<RepoItem />` element. This expression will only be used in the case where `repoData` is `Some`. Alternatively, if `repoData` is `None`, the text "Loading" will be displayed instead.

Let's change our component to start with no `repoData` value loaded initially, and add a button to simulate loading it:

First we change our `useState` hook to start with no repo data:

```reason
let (repoData, setRepoData) = React.useState(() => None);
```

Then, we add the button in the render function, with a handler for the button's `onClick` prop to update the `repoData` state.

```reason
let loadedReposButton =
  <button onClick={_event => setRepoData(_prev => Some(dummyRepo))}>
    {ReasonReact.string("Load Repos")}
  </button>;
```

We can display this `loadReposButton` in place of the rendered `<RepoItem />` in the initial blank state (when `repoData` is `None`):

```reason
[@react.component]
let make = () => {
  let (repoData, setRepoData) = React.useState(() => None);

  let loadedReposButton =
    <button onClick={_event => setRepoData(_prev => Some(dummyRepo))}>
      {ReasonReact.string("Load Repos")}
    </button>;

  let repoItem =
    switch (repoData) {
    | Some(repo) => <RepoItem repo />
    | None => loadedReposButton
    };

  <div>
    <h1> {ReasonReact.string("Reason Projects")} </h1>
    repoItem
  </div>;
};
```

Reloading the page will now show a 'Load Repos' button which can be clicked to update the component state and show the `<RepoItem />`.

Okay, now we know how to do state changes, let's make this into a more realistic app.

### Arrays

Before we get into loading our data from JSON, there's one more change to make to the component. We actually want to show a list of repos, not just a single one, so we need to change the type of our state, and our dummy data.

Our dummyRepo variable:
```reason
let dummyRepo: RepoData.repo =
```
Will change to be an array of repos:
```reason
let dummyRepos: array(RepoData.repo) = 
```

And we'll update our dummy data:

```reason
let dummyRepos: array(RepoData.repo) = [|
  {
    stargazers_count: 27,
    full_name: "jsdf/reason-react-hacker-news",
    html_url: "https://github.com/jsdf/reason-react-hacker-news"
  },
  {
    stargazers_count: 93,
    full_name: "reasonml/reason-tools",
    html_url: "https://github.com/reasonml/reason-tools"
  }
|];
```

Err, what's with the `[| ... |]` syntax? That's Reason's [array literal syntax](https://reasonml.github.io/docs/en/list-and-array#array). If you didn't have the `|` pipe characters there (so it would look like the normal JS array syntax) then you would be defining a [List](https://reasonml.github.io/docs/en/list-and-array#list) instead of an array. In Reason lists are immutable, whereas arrays are mutable (like Javascript arrays). There are some other minor differences between them which don't matter for our purposes. Anyway here we're using an array.

We'll update our component to render an array of `RepoItem`s instead of just one, by mapping over the array of repos and creating a `<RepoItem />` for each. We have to use `ReasonReact.array` to turn the array of elements into an element itself so it can be used in the JSX below.

```reason
[@react.component]
let make = () => {
  let (repoData, setRepoData) = React.useState(() => None);

  let loadedReposButton =
    <button onClick={_event => setRepoData(_prev => Some(dummyRepos))}>
      {ReasonReact.string("Load Repos")}
    </button>;

  let repoItems =
    switch (repoData) {
    | Some(repos) =>
      ReasonReact.array(
        Array.map(
          (repo: RepoData.repo) => <RepoItem key={repo.full_name} repo />,
          repos,
        ),
      )
    | None => loadedReposButton
    };

  <div>
    <h1> {ReasonReact.string("Reason Projects")} </h1>
    repoItems
  </div>;
};
```

Now, to load some real data.

### BuckleScript

Before fetching our JSON and turning it into a record, first we need to install some extra dependencies. Run:

```bash
npm install --save bs-fetch @glennsl/bs-json
```

Here's what these packages do:

* buckletypes/bs-fetch: wraps the browser Fetch API so we can use it from Reason
* buckletypes/bs-json: allows use to turn JSON fetched from the server into Reason records

These packages work with the Reason-to-JS compiler we've been using this whole time, which is called BuckleScript.

Before we can use these newly installed BuckleScript packages we need to let BuckleScript know about them. To do that we need to make some changes to the `.bsconfig` file in the root of our project. In the `bs-dependencies` section, add `"bs-fetch"` and `"bs-json"`:

```json
{
  "bs-dependencies": [
    "reason-react",
    "bs-fetch", // add this
    "@glennsl/bs-json" // and this too
  ],

  // ...more stuff
}
```

You'll need to kill and restart your `npm start` command so that the build system can pick up the changes to `.bsconfig`.

### Reading JSON

Now we've installed `bs-json` we can use `Json.Decode` to read JSON and turn it into a record.

We'll define a function called `parseRepoJson` at the end of `RepoData.re`:

```reason
type repo = {
  full_name: string,
  stargazers_count: int,
  html_url: string
};

let parseRepoJson = json => {
  full_name: Json.Decode.field("full_name", Json.Decode.string, json),
  stargazers_count: Json.Decode.field("stargazers_count", Json.Decode.int, json),
  html_url: Json.Decode.field("html_url", Json.Decode.string, json)
};
```

This defines a function called `parseRepoJson` which takes one argument called `json` and returns a value of the type `RepoData.repo`. The `Json.Decode` module provides a bunch of functions which we are composing together to extract the fields of the JSON, and assert that the values we're getting are of the correct type.

### Don't repeat yourself

This is looking a bit wordy. Do we really have to write `Json.Decode` over and over again?

Nope, Reason has some handy syntax to help us when we need to refer to the exports of a particular module over and over again. One option is to 'open' the module, which means that all of its exports become available in the current scope, so we can ditch the `Json.Decode` qualifier:

```reason
open Json.Decode;

let parseRepoJson = json =>
  {
    full_name: field("full_name", string, json),
    stargazers_count: field("stargazers_count", int, json),
    html_url: field("html_url", string, json)
  };
```

However this does introduce the risk of name collisions if you're opening multiple modules. Another option is to use the module name, followed by a period `.` before an expression. Inside the expression we can use any export of the module without qualifying it with the module name:

```reason
let parseRepoJson = json =>
  Json.Decode.{
    full_name: field("full_name", string, json),
    stargazers_count: field("stargazers_count", int, json),
    html_url: field("html_url", string, json),
  };
```

Now let's test it out by adding some code which defines a string of JSON and uses our `parseRepoJson` function to parse it.

In `App.re`:

```reason
let dummyRepos: array(RepoData.repo) = [|
  RepoData.parseRepoJson(
    Js.Json.parseExn(
      {js|
        {
          "stargazers_count": 93,
          "full_name": "reasonml/reason-tools",
          "html_url": "https://github.com/reasonml/reason-tools"
        }
      |js}
    )
  )
|];
```

Don't worry about understanding what `Js.Json.parseExn` does or the weird `{js| ... |js}` thing (if you must know, that's a [multiline string literal](https://bucklescript.github.io/bucklescript/Manual.html#_bucklescript_annotations_for_unicode_and_js_ffi_support)). Returning to the browser you should see the page successfully render from this JSON input.

### Fetching data

Looking at the form of the [Github API response](https://api.github.com/search/repositories?q=topic%3Areasonml&type=Repositories), we're interested in the `items` field. This field contains an array of repos. We'll add another function which uses our `parseRepoJson` function to parse the `items` field into an array of records.

In `RepoData.re`:

```reason
let parseReposResponseJson = json =>
Json.Decode.(field("items", array(parseRepoJson), json));
```

Finally we'll make use of the `bs-fetch` package to make our HTTP request to the API.

But first, more new syntax! I promise this is the last bit. The pipe operator `|>` simply takes the result of the expression on the left of the `|>` operator and calls the function on the right of the `|>` operator with that value.

For example, instead of:

```reason
doThing3(doThing2(doThing1(arg)))
```

with the pipe operator we can do:

```reason
arg |> doThing1 |> doThing2 |> doThing3
```

This lets us simulate something like the chaining API of Promises in Javascript, by piping our promise objects through the `Js.Promise.then_` function. Note that we are actually calling the `Js.Promise.then_` function with the promise as the argument, instead calling a `.then()` method on the promise object as in Javascript.

In `RepoData.re`:

```reason
let reposUrl = "https://api.github.com/search/repositories?q=topic%3Areasonml&type=Repositories";

let fetchRepos = () =>
  Bs_fetch.fetch(reposUrl)
    |> Js.Promise.then_(Bs_fetch.Response.text)
    |> Js.Promise.then_(
      jsonText =>
        Js.Promise.resolve(parseReposResponseJson(Js.Json.parseExn(jsonText)))
    );
```

If you like, you can make the Promise chaining code in `fetchRepos` a bit more terse by temporarily opening up `Js.Promise`:

```reason
let fetchRepos = () =>
  Js.Promise.(
    Bs_fetch.fetch(reposUrl)
      |> then_(Bs_fetch.Response.text)
      |> then_(
        jsonText =>
          resolve(parseReposResponseJson(Js.Json.parseExn(jsonText)))
      )
  );
```

Finally, back in `App.re` we'll add a `useEffect` hook to load the data and store it in component state:

```reason
[@react.component]
let make = () => {
  let (repoData, setRepoData) = React.useState(() => None);

  React.useEffect0(
    () => {
      RepoData.fetchRepos()
      |> Js.Promise.then_(repoData => {
           setRepoData(_prev => Some(repoData));
           Js.Promise.resolve();
         })
      |> Js.Promise.catch(err => {
           Js.log("An error occurred: " ++ Js.String.make(err));
           Js.Promise.resolve();
         })
      |> ignore;
      None;
    },
    None // so the effect will only run once, on mount
  );

  let repoItems =
    switch (repoData) {
    | Some(repos) =>
      ReasonReact.array(
        Array.map(
          (repo: RepoData.repo) => <RepoItem key={repo.full_name} repo />,
          repos,
        ),
      )
    | None => React.string("Loading...")
    };

  <div>
    <h1> {ReasonReact.string("Reason Projects")} </h1>
    repoItems
  </div>;
};
```

The useEffect hook loads data using our `RepoData.fetchRepos()` function, piping this into `Js.Promise.then_` and calling the `setRepoData(_prev => Some(repoData))` to update the component state with the loaded data once it has been received. Note that we're using the `React.useEffect0` version of the function because we are passing `None` instead of a depency array as the second argument. There are additional versions which take dependency arrays as the second argument for different numbers of dependencies (`useEffect1`, `useEffect2`, etc.) which you can use as needed, but `useEffect0` just takes `None` instead of an array.

Additionally, now that the data is loaded automatically, we've removed the `loadReposButton` and reverted back to the simple "Loading..." placeholder while data is fetching.

We end the promise chain by returning `Js.Promise.resolve()`. We then implement a `catch` block for any errors, which logs the error as string using `Js.log()`. The whole expression defining the promise chain is then `|>` piped to a special function called `ignore`, which just tells Reason that we don't intend to do anything further with the value that the promise chain expression evaluates to (we only care about the side effect it has of calling the `setRepoData` function). Without this, you would get an error message like this:

```
Warning 10: this expression should have type unit.
```

### Add some CSS

You can require CSS files just as you're already used to doing with Webpack. First go [configure Webpack to load CSS files](https://webpack.js.org/guides/asset-management/#loading-css). Done? Wow.

Let's go back to `Index.re`. Add this code to the top of the file:

```reason
%bs.raw
{|

require('./index.css');

|};
```

This `%bs.raw` thing allows us to include some plain Javascript code between the `{|` and `|}`. In this case we're just using it to require a CSS file in the usual Webpack way. After creating `src/index.css` and adding some styles to it, you should see some styling changes applied to the app.

You can also use inline styles in your React component by passing a style prop created with `ReactDOMRe.Style.make`:

```reason
<div style={ReactDOMRe.Style.make(~color="red", ~fontSize="68px")()}></div>
```

And that's it!

You can see the completed app running [here](/projects/github-reason-react-tutorial/). The completed source is available [on Github](https://github.com/jsdf/github-reason-react-tutorial/).

If you have any feedback about this article you can tweet me: [@ur_friend_james](https://twitter.com/ur_friend_james)

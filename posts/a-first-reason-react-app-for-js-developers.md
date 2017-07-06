
*A Traditional Chinese translation of this article is available [here](http://987.tw/a-first-reason-react-app-for-javascript-developers/).*

[Reason](https://facebook.github.io/reason/) is a new statically-typed functional programming language from Facebook which can be compiled to Javascript. [Reason React](https://reasonml.github.io/reason-react/) is a wrapper for [React](https://facebook.github.io/react/) which makes it easy to use from Reason.

We're going to build a small single page web app to put Reason React through its paces. The app will display a list of top Reason-related Github repos. It's a small enough task that we can complete it in a few hours, but also has enough complexity that we can kick the tires of this new language. This tutorial expects no existing knowledge of Reason, though a basic familiarity with static types would be helpful.

### Before we get started

Make sure you have your editor set up for Reason. You're not getting the full benefit of a statically typed language if you haven't got type information, inline errors and autocomplete in your editor. For a quick editor setup, I can recommend [Atom packages described on the Reason website](http://facebook.github.io/reason/tools.html#editor-integration-atom), with the addition of my package [linter-refmt](https://atom.io/packages/linter-refmt) which integrates much better syntax error messages with Atom. Without this, you'll have to look at the compiler console output to debug some syntax errors.

If you haven't done so, you probably also need to install the Reason CLI tools.

**There is a newly released version of the Reason CLI tools which is required to use this tutorial.**

You can find install instructions [here](https://github.com/reasonml/reason-cli#1-install-reason-cli-globally). If you are on macOS and have npm, all you need to do to install the tools is:

```bash
npm install -g https://github.com/reasonml/reason-cli/archive/beta-v-1.13.6-bin-darwin.tar.gz
```

### A new project

We're going to use [create-reason-react-app](https://github.com/knowbody/crra), which will create a starting point for our app:

```bash
npm install -g create-reason-react-app
create-reason-react-app github-reason-list
cd github-reason-list
# install dependencies: the reason-to-js compiler (bucklescript), webpack, react and more
npm install
# starts 'bsb' which compiles reason to js, and also webpack-dev-server, in parallel
npm start
```

If you're using [yarn](https://yarnpkg.com) you can instead do:

```bash
yarn create reason-react-app github-reason-list
cd github-reason-list
yarn install
yarn start
```

I'll go into more detail about what's going on under the hood later, right now we just want to get something on the screen.

Open http://localhost:8080 and you should see this:

![Screenshot of Create Reason React App blank slate](/files/crra.png)

This page is being rendered using React, from a component written in Reason. In your editor, open the project folder and open up `src/index.re`. If you've built many React apps this should look pretty familiar. The Reason code:

```reason
ReactDOMRe.renderToElementWithId <App name="Welcome to Create Reason React App!" /> "root";
```

is doing roughly the same thing as this Javascript equivalent:

```js
ReactDOM.render(<App name="Welcome to Create Reason React App!" />, document.getElementById('root'));
```

### Function calls in Reason

When comparing the Reason and Javascript code above, you'll notice that the Reason version omits the parentheses `()` around the function call, and also the commas between the arguments. In Reason, each space-separated value after the function name is an argument to the function. Parentheses are only needed if you want to call one function and use the result as an argument to another function, eg.

```reason
myFunctionB (myFunctionA arg1 arg2) arg3
```

which is equivalent to this Javascript:

```js
myFunctionB(myFunctionA(arg1, arg2), arg3)
```

### JSX in Reason

Let's move over to `src/app.re`. Don't worry too much about all the stuff going on here, we'll go through the pieces one by one as we need them.

Let's start making some changes. We're going to start building the front page of our app, starting with the render method of our top level component. Replace the entire contents of the file with:

```reason
let component = ReasonReact.statelessComponent "App";

let make ::name _children => {
  ...component,
  render: fun self =>
    <div className="App">
      <div className="App-header">
        <h1> (ReasonReact.stringToElement "Reason Projects") </h1>
      </div>
    </div>
};
```

Hit save and jump back to your browser window showing [http://localhost:8080](http://localhost:8080). You should see a page which just says 'Reason Projects'. Jump back to your editor and let's walk through this code, which looks somewhat like the JSX you're used to, but not quite.

In Reason React, some things are a bit more explicit than normal Javascript React. Reason's JSX doesn't allow you to display text by simply putting it directly between JSX tags. Instead we use a function called `ReasonReact.stringToElement`, and we call it with the string of text we want to display: `"Reason Projects"`. In Reason strings are always double quoted. Finally, we wrap it in parens so that Reason knows that `"Reason Projects"` is an argument to `ReasonReact.stringToElement`, but the following `</h1>` is not.

You can think of the above code as being more or less equivalent to this JS React code:

```js
class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>{'Reason Projects'}</h1>
        </div>
      </div>
    );
  }
}
```

If you don't see any change, it's possible that you have a syntax error. Errors won't show in the browser, just in the editor and `yarn start`/`npm start` command output.

### Debugging syntax errors

If you're new to Reason, it can be a bit difficult to spot where exactly you've made a syntax error. This is especially true with some of the current editor integrations, because they sometimes display an error further down in the file than where the incorrect piece of syntax is.

If the first error message in the file is 'Invalid token', you're dealing with a syntax error. If you take a look at the terminal output of the `yarn start`/`npm start` command you should see a more helpful error message, including the file, line, and character position of the error. As Reason editor integration improves this should no longer be necessary.

### A record type

Next, our list of repos. First we'll build out the UI components with fake data, and then replace it with data from this API request:
https://api.github.com/search/repositories?q=topic%3Areasonml&type=Repositories

We'll define a record type to represent each repo item from the JSON. A record is like a JS object, except that the list of properties that it has and what their types are is fixed. This is how we might define a record type for Github API data about a Github repo:

```reason
type repo = {
  full_name: string,
  stargazers_count: int,
  html_url: string
};
```

Create a new file called `RepoData.re` and add the above code into it.

### Files are modules

We've defined our type at the top level of the file. In Reason, every file is a module, and all the things defined at the top level of the file using the keywords `let`, `type`, and `module` are exposed to be used from other files (that is, other modules). In this case, other modules can reference our `repo` type as `RepoData.repo`. Unlike in Javascript, no imports are required to reference things from other modules.

Let's use our type in `app.re`. The repos page is just a list of repos, with each item in the list consisting of the name of the repo (linking to the repo on Github), and the number of stars the repo has. We'll define some dummy data and sketch out a new component called `RepoItem` to represent an item in the list of repos:

```reason
let component = ReasonReact.statelessComponent "App";

let make ::title _children => {
  ...component,
  render: fun self => {
    /* our dummy data */
    let dummyRepo: RepoData.repo = {
      stargazers_count: 27,
      full_name: "jsdf/reason-react-hacker-news",
      html_url: "https://github.com/jsdf/reason-react-hacker-news"
    };

    <div className="App">
      <div className="App-header"> <h1> (ReasonReact.stringToElement "Reason Projects") </h1> </div>
      <RepoItem repo=dummyRepo />
    </div>
  }
};
```

In the statement beginning `let dummyRepo: RepoData.repo =`, `dummyRepo` is the name of the constant we're defining and `RepoData.repo` is the type we're annotating it with. Reason can infer the types of most things we declare, but here it's useful to include the annotation so that the typechecker can let us know if we've made a mistake in our test data.

### Return values in Reason

Note that the body of the render function is now wrapped in `{}` braces, because it contains multiple statements. In Javascript, if we used braces around the body of an `=>` arrow function we'd need to add a `return` statement to return a value. However in Reason, value resulting from the last statement in the function automatically becomes the return value. If you don't want to return anything from a function, you can make the last statement `()` (which is pronounced 'unit').

### A stateless React component

You might now see an error saying `unbound module RepoItem`. That's because we haven't created that module yet. We'll add the new file called `RepoItem.re`:

```reason
let component = ReasonReact.statelessComponent "RepoItem";

let make repo::(repo: RepoData.repo) _children => {
  ...component,
  render: fun self =>
    <div className="RepoItem" />
};
```

Here we have a minimal stateless component which takes one prop called `repo`. Each Reason React component is a Reason module which defines a function called `make`. This function returns a record, and merges in the return value of `ReasonReact.statefulComponent` or `ReasonReact.statelessComponent` (for components which do and don't use state, respectively). If this seems a bit weird, just think of if like `class Foo extends React.Component` in JS React.

Next we'll flesh out the render method to present the fields of the `repo` record:

```reason
let component = ReasonReact.statelessComponent "RepoItem";

let make repo::(repo: RepoData.repo) _children => {
  ...component,
  render: fun self =>
    <div className="RepoItem">
      <a href=repo.html_url> <h2> (ReasonReact.stringToElement repo.full_name) </h2> </a>
      (ReasonReact.stringToElement (string_of_int repo.stargazers_count ^ " stars"))
    </div>
};
```

Now is a good time to save and take a look at our progress in the browser.

Note that we convert the int value of `repo.stargazers_count` to a string using the `string_of_int` function, before concatenating it with the string `" stars"` with the `^` string concatenation operator.

In JS React we define a `render` method on a class, and inside it we can access `this.props`, which is an instance property of the component class instance. In Reason React we receive the props as labeled arguments to `make` (the weird `::` syntax signified labeled arguments), and `render` is just a function defined inside `make`, and returned as part of the record returned from `make`.

### A stateful React component

Our app is going to load some data and then render it, which means we need a place to put the data after it's loaded. React component state seems like an obvious choice. So we'll make our App component stateful.

In `app.re`:
```reason
type componentState = {repo: RepoData.repo};

let component = ReasonReact.statefulComponent "App";

let dummyRepo: RepoData.repo = {
  stargazers_count: 27,
  full_name: "jsdf/reason-react-hacker-news",
  html_url: "https://github.com/jsdf/reason-react-hacker-news"
};

let make ::title _children => {
  ...component,
  initialState: fun () :componentState => {
    repo: dummyRepo
  },
  render: fun {state} => {
    <div className="App">
      <div className="App-header"> <h1> (ReasonReact.stringToElement "Reason Projects") </h1> </div>
      <RepoItem repo=state.repo />
    </div>
  }
};
```
We've changed some key things: we've defined a type for the state of our component, called `componentState`, `ReasonReact.statelessComponent` has become `ReasonReact.statefulComponent`, we've added an `initialState` method to the component, annotated with a return type of `componentState`, and we've changed `render` to take `state` as it's first argument, which is now being used to pass `state.repo` as a prop to `RepoItem`.

Note that the `componentState` type must be defined before the call to `ReasonReact.statefulComponent` or you'll get an error saying something like "The type constructor state would escape its scope".

### Option and pattern matching

Currently we have our `repo` dummy data already available when we define the initial state of the component, but once we are loading it from the server it will initially be null. However, in Reason you can't just have the value of a record field be `null`, as you can in Javascript. Instead, things which might not be present need to be 'wrapped' in another type called `option`. We can change our `componentState` type to represent this like so:

```reason
type componentState = {repo: option RepoData.repo};
```

and in our `initialState` function we add `Some` before our repo record:
```reason
initialState: fun () :componentState => {
  repo: Some dummyRepo
},
```

`option` is a kind of type which is made up of what Reason calls 'Variants'. That basically means that a value of this type can be one of several possible, well, variants. In the case of `option`, the variants are `Some` and `None`. `Some` is used to contain a value, whereas `None` represents the absence of a value (like `null` in Javascript). Here we've 'wrapped' `dummyRepo` in the `Some` variant.

So why this wrapper, instead of just allowing our `repo` field to contain either a value or `null`? The reason is to force us to handle both possible cases when actually using the value. This is good because it means we can't accidentally forget to deal with the 'null' case.

This means we also need to change the place where the `repo` field in our state is used. As usual, the type checker is one step ahead of us, and is giving us an error pointing to `<RepoItem repo=state.repo />` which hints at the next change we need to make:

```
Error: The types don't match.
This is: RepoData.repo option
Wanted:  RepoData.repo
```

We can't pass `state.repo` directly as the `repo` prop to `RepoItem`, because it's wrapped in an `option`. So how do we unwrap it? We use *pattern matching*. This is where Reason forces use to cover all possible cases (or at least explicitly throw an error). Pattern matching makes use of the `switch` statement. Unlike a switch statement in Javascript however, a switch statement in Reason matches the *types* of the values (eg. `Some` and `None`), not just the values themselves. We'll change our render method to use a `switch` to provide logic to render our repo item in each possible case:

```reason
  render: fun {state} => {
    let repoItem =
      switch (state.repo) {
      | Some repo => <RepoItem repo=repo />
      | None => ReasonReact.stringToElement "Loading"
      };
    <div className="App">
      <div className="App-header"> <h1> (ReasonReact.stringToElement "Reason Projects") </h1> </div>
      repoItem
    </div>
  }
```
Here you can see the switch statement has a case to match a `state.repo` value with the type `Some`, and pulls out the actual repo record into a variable called `repo`, which it then uses in the expression to the right of the `=>`, which creates a `<RepoItem>`  element. This expression will only be used in the `Some` case. Alternatively, if `state.repo` is `None`, the text "Loading" will be displayed instead.

### Arrays

Before we get into loading our data from JSON, there's one more change to make to the component. We actually want to show a list of repos, not just a single one, so we need to change the type of our state:

```reason
type componentState = {repos: option (array RepoData.repo)};
```

And a corresponding change to our dummy data:

```reason
let dummyRepos: array RepoData.repo = [|
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

Err, what's with the `[| ... |]` syntax? That's Reason's array literal syntax. If you didn't have the  `|` pipe characters there (so it would look like the normal JS array syntax) then you would be defining a List instead of an array. In Reason lists are immutable, whereas arrays are mutable (like Javascript arrays). Anyway here we're using an array.

Finally, we'll change our render method to render an array of `RepoItem`s instead of just one, by mapping over the `repos` and creating a `RepoItem` for each. We have to use `ReasonReact.arrayToElement` to turn the array of elements into an element itself so it can be used in the JSX below.

```reason
  render: fun {state} => {
    let repoItem = switch (state.repos) {
      | Some repos => ReasonReact.arrayToElement (Array.map
          (fun (repo: RepoData.repo) => <RepoItem key=repo.full_name repo=repo />)
          repos
        )
      | None => ReasonReact.stringToElement "Loading"
    };
    <div className="App">
      <div className="App-header"> <h1> (ReasonReact.stringToElement "Reason Projects") </h1> </div>
      repoItem
    </div>
  }
```

Now, to load some real data.

### BuckleScript

Before fetching our JSON and turning it into a record, first we need to install some extra dependencies. Run:

```bash
npm install --save buckletypes/bs-fetch buckletypes/bs-json
```

Here's what these packages do:
- buckletypes/bs-fetch: wraps the browser Fetch API so we can use it from Reason
- buckletypes/bs-json: allows use to turn JSON fetched from the server into Reason records

These packages work with the Reason-to-JS compiler we've been using this whole time, which is called BuckleScript.

Before we can use these newly installed BuckleScript packages we need to let BuckleScript know about them. To do that we need to make some changes to the .bsconfig file in the root of our project. In the `bs-dependencies` section, add `"bs-fetch"` and `"bs-json"`:

```json
{
  "name": "create-reason-react-app",
  "reason": {
    "react-jsx": 2
  },
  "bs-dependencies": [
    "reason-react",
    "bs-director",
    "bs-fetch", // add this
    "bs-json" // and this too
  ],
  // ...more stuff
```

You'll need to kill and restart your `yarn start`/`npm start` command so that the build system can pick up the changes to `.bsconfig`.

### Reading JSON

Now we've installed `bs-json` we can use `Json.Decode` to read JSON and turn it into a record.

We'll define a function called `parseRepoJson` at the end of `RepoData.re`:
```reason
type repo = {
  full_name: string,
  stargazers_count: int,
  html_url: string
};

let parseRepoJson json :repo => {
  full_name: Json.Decode.field "full_name" Json.Decode.string json,
  stargazers_count: Json.Decode.field "stargazers_count" Json.Decode.int json,
  html_url: Json.Decode.field "html_url" Json.Decode.string json
};
```

This defines a function called `parseRepoJson` which takes one argument called `json` and returns a value of the type `RepoData.repo`. The `Json.Decode` module provides a bunch of functions which we are composing together to extract the fields of the JSON, and assert that the values we're getting are of the correct type.

### Don't repeat yourself

This is looking a bit wordy. Do we really have to write `Json.Decode` over and over again?

Nope, Reason has some handy syntax to help us when we need to refer to the exports of a particular module over and over again. One option is to 'open' the module, which means that all of its exports become available in the current scope, so we can ditch the `Json.Decode` qualifier:

```reason
open Json.Decode

let parseRepoJson json :repo =>
  {
    full_name: field "full_name" string json,
    stargazers_count: field "stargazers_count" int json,
    html_url: field "html_url" string json
  };
```

However this does introduce the risk of name collisions if you're opening multiple modules. Another option is to use the module name, followed by a period `.` before an expression. Inside the expression we can use any export of the module without qualifying it with the module name:

```reason
let parseRepoJson json :repo =>
  Json.Decode.{
    full_name: field "full_name" string json,
    stargazers_count: field "stargazers_count" int json,
    html_url: field "html_url" string json
  };
```

Now let's test it out by adding some code which defines a string of JSON and uses our `parseRepoJson` function to parse it.

In `app.re`:
```reason
let dummyRepos: array RepoData.repo = [|
  RepoData.parseRepoJson (
    Js.Json.parseExn {js|
      {
        "stargazers_count": 93,
        "full_name": "reasonml/reason-tools",
        "html_url": "https://github.com/reasonml/reason-tools"
      }
    |js}
  )
|];
```

Don't worry about understanding what `Js.Json.parseExn` does or the weird `{js| ... |js}` thing (it's an alternative [string literal syntax](http://bucklescript.github.io/bucklescript/Manual.html#_bucklescript_annotations_for_unicode_and_js_ffi_support)). Returning to the browser you should see the page successfully render from this JSON input.

### Fetching data

Looking at the form of the Github API response, we're interested in the `items` field. This field contains an array of repos. We'll add another function which uses our `parseRepoJson` function to parse the `items` field into an array of records.

In `RepoData.re`:
```reason
let parseReposResponseJson json => (Json.Decode.field "items" (Json.Decode.array parseRepoJson) json);
```

Finally we'll make use of the `bs-fetch` package to make our HTTP request to the API.

But first, more new syntax! I promise this is the last bit. The pipe operator `|>` simply takes the result of the expression on the left of the operator and calls the function on the right of the operator with that value.

For example, instead of:

```reason
(doThing3 (doThing2 (doThing1 arg)))
```

with the pipe operator we can do:

```reason
arg |> doThing1 |> doThing2 |> doThing3
```

This lets us simulate something like the chaining API of Promises in Javascript, except that `Js.Promise.then_` is a function we call with the promise as the argument, instead of being a method on the promise object.

In `RepoData.re`:
```reason
let reposUrl = "https://api.github.com/search/repositories?q=topic%3Areasonml&type=Repositories";

let fetchRepos () =>
  Bs_fetch.fetch reposUrl
    |> Js.Promise.then_ Bs_fetch.Response.text
    |> Js.Promise.then_ (fun jsonText =>
      Js.Promise.resolve (parseReposResponseJson (Js.Json.parseExn jsonText))
    );
```

Finally, back in `app.re` we'll add some code to load the data and store it in component state:

```reason
type componentState = {repos: option (array RepoData.repo)};

let component = ReasonReact.statefulComponent "App";

let handleReposLoaded repos _self => {
  ReasonReact.Update {
    repos: Some repos
  };
};

let make ::title _children => {
  ...component,
  initialState: fun () :componentState => {
    repos: None
  },
  didMount: fun self => {
    RepoData.fetchRepos ()
      |> Js.Promise.then_ (fun repos => {
          (self.update handleReposLoaded) repos;
          Js.Promise.resolve ();
        })
      |> ignore;

    ReasonReact.NoUpdate;
  },
  render: fun {state} => {
    let repoItem = switch (state.repos) {
      | Some repos => ReasonReact.arrayToElement (Array.map
          (fun (repo: RepoData.repo) => <RepoItem key=repo.full_name repo=repo />) repos
        )
      | None => ReasonReact.stringToElement "Loading"
    };
    <div className="App">
      <div className="App-header"> <h1> (ReasonReact.stringToElement "Reason Projects") </h1> </div>
      repoItem
    </div>
  }
};
```
 we load our data in the `didMount` method of our `App` component, using our `RepoData.fetchRepos`.

Then, in the promise `then_` block, we use `self.update` to create an 'updater' function from `handleReposLoaded`. This is Reason React's equivalent of `this.setState`.

We immediately call that updater function with our loaded `repos` data, which updates the state.

We end the promise chain by returning `Js.Promise.resolve ()` (remember `()` is called 'unit' and it just means 'no value'). The whole expression defining the promise chain is then piped to a special function called `ignore`, which just tells Reason that we don't intend to do anything with the value that the whole expression evaluates to (we only care about the side effect it has of calling the updater function). You can leave this out, but it stops the typechecker from complaining with: `Warning 10: this expression should have type unit.`.

And that's it!

You can see the completed app running [here](/projects/github-reason-react-tutorial/). The completed source is [on Github](https://github.com/jsdf/github-reason-react-tutorial/).

If you have any feedback about this article you can tweet me: [@ur_friend_james](https://twitter.com/ur_friend_james)

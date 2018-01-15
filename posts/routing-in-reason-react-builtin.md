Reason React recently added a routing feature to the framework itself, so you don't need to use an additional routing library like [bs-director](https://github.com/reasonml-community/bs-director) to add client-side routes to your Reason React app (as I described my [previous tutorial on routing in Reason React](https://jamesfriend.com.au/routing-in-reason-react)).

The advantage of this new built-in routing feature is that it leverages Reason's pattern matching feature, which allows it to be performant while also more idiomatic: in Reason you use pattern matching to, well, match patterns, and routes are just a specific case of taking some input (the url string) and matching some patterns (combinations of paths and variables).

To start with, imagine we have a file `index.re` which just renders a React component `<Home />` defined in `home.re`.

```reason
ReactDOMRe.renderToElementWithId(<Home />, "root");
```

```reason
let component = ReasonReact.statelessComponent("Home");

let make = (_children) => {
  ...component,
  render: (_self) => {
    <div>
      <h1>{ReasonReact.stringToElement("Home")}</h1>
    </div>
  }
};
```

Now say we want to add another page called 'User' at the path `/user`. We'll add a file `user.re`:

```reason
let component = ReasonReact.statelessComponent("User");

let make = (_children) => {
  ...component,
  render: (_self) => {
    <div>
      <h1>{ReasonReact.stringToElement("User")}</h1>
    </div>
  }
};
```

And we'll change `index.re` to create a router and conditionally render one component or the other depending on the matched route:

```reason
let renderForRoute = (element) =>
  ReactDOMRe.renderToElementWithId(element, "index");


let urlWatcherID = ReasonReact.Router.watchUrl(url => {
  switch (url.path) {
  | ["user"] => renderForRoute(<User />)
  | [] => renderForRoute(<Home />)
  /* NOTE: in a real app you probably want to render an error page instead */
  | _ => failwith "invalid url"
  }
});
```

And we'll change our components so that each has a link to the other page:

`home.re`

```reason
let component = ReasonReact.statelessComponent("Home");

let make = (_children) => {
  ...component,
  render: (_self) => {
    let gotoUser = (event) => {
      ReactEventRe.Mouse.preventDefault(event);
      ReasonReact.Router.push("/user");
    };
    <div>
      <h1>{ReasonReact.stringToElement("Home")}</h1>
      <a href="#" onClick=gotoUser>{ReasonReact.stringToElement("User")}</a>
    </div>
  }
};
```

`user.re`

```reason
let component = ReasonReact.statelessComponent("User");

let make = (_children) => {
  ...component,
  render: (_self) => {
    let gotoHome = (event) => {
      ReactEventRe.Mouse.preventDefault(event);
      ReasonReact.Router.push("/");
    };
    <div>
      <h1>{ReasonReact.stringToElement("User")}</h1>
      <a href="#" onClick=gotoHome>{ReasonReact.stringToElement("Home")}</a>
    </div>
  }
};
```

If you load up the app you'll see the Home component, and if you click the "User" link, you'll see the User component.

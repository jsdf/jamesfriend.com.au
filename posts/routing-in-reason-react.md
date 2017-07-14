In my [previous tutorial](https://jamesfriend.com.au/a-first-reason-react-app-for-js-developers) about [Reason React](https://reasonml.github.io/reason-react/), I covered most of the elements one might need for a typical web app, but one I left out was routing, so this is a quick guide to adding client-side routes to your Reason app.

We're going to use a library called [Director](https://github.com/flatiron/director), which is a simple and mature routing library for Javascript. We're actually going to install a version of the package called [bs-director](https://github.com/BuckleTypes/bs-director) which also contains bindings to Reason/BuckleScript, which means we can use it easily from our Reason code.

To start with, install `bs-director` with npm or yarn:

```bash
yarn add bs-director
```

Now in bsconfig.json, add `bs-director` to the `bs-dependencies` section:

```json
  "bs-dependencies": ["reason-react", "bs-director"],
```

To start with, imagine we have a file `index.re` which just renders a React component `<Home />` defined in `home.re`.

```reason
ReactDOMRe.renderToElementWithId <Home /> "root";
```

```reason
let component = ReasonReact.statelessComponent "Home";

let make _children => {
  ...component,
  render: fun _self => {
    <div>
      <h1> (ReasonReact.stringToElement "Home") </h1>
    </div>
  }
};
```

Now say we want to add another page called 'User' at the path `/user`. We'll add a file `user.re`:

```reason
let component = ReasonReact.statelessComponent "User";

let make _children => {
  ...component,
  render: fun _self => {
    <div>
      <h1> (ReasonReact.stringToElement "User") </h1>
    </div>
  }
};
```

And we'll change `index.re` to create a router and conditionally render one component or the other depending on the matched route:

```reason
let renderForRoute element => ReactDOMRe.renderToElementWithId element "index";

let router =
  DirectorRe.makeRouter {
    "/": fun () => renderForRoute <Home />,
    "/user": fun () => renderForRoute <User />
  };

DirectorRe.init router "/";
```

And we'll change our components so that each has a link to the other page:

`home.re`
```reason
<div>
  <h1> (ReasonReact.stringToElement "Home") </h1>
  <a href="#/user"> (ReasonReact.stringToElement "User") </a>
</div>
```

`user.re`
```reason
<div>
  <h1> (ReasonReact.stringToElement "User") </h1>
  <a href="#/"> (ReasonReact.stringToElement "Home") </a>
</div>
```

If you load up the app you'll see the Home component, and if you click the "User" link, you'll see the User component.

### pushState routing

You might have noticed that we are using the URL's 'hash fragment' or 'fragment identifier' for routing. This is useful if our server can't serve up actual server-generated pages for each of our routes, but if we have that capability, then we might instead want to use the HTML History API (pushState) to change the whole path of the URL instead. To do that, we need to add some more configuration, and also we need  to intercept link clicks and call a function on the router to change route.

First, we need to configure Director to use HTML History API:

In `index.re`
```
DirectorRe.configure router {"html5history": true};
```

Additionally, now we need to pass our router object down to each component as a prop, so we can call the `setRoute` function on it when we want to navigate. In Javascript we could just do this:

```js
var router = new director.Router({
  "/": () => renderForRoute(<Home router={router} />,
  "/user": () => renderForRoute(<User router={router} />,
});
```

However, the equivalent Reason code fails to compile:

```reason

let router =
  DirectorRe.makeRouter {
    "/": fun () => renderForRoute <Home router={router} />,
    "/user": fun () => renderForRoute <User router={router} />
  };
```

This is because in Reason we can't refer to the `router` variable inside the route handler functions, because it doesn't yet exist when those functions are defined.

Instead we can use the `resource` configuration feature of Director which lets us define the route paths with names, and then define the route handler functions afterwards:


```reason
let router =
  DirectorRe.makeRouter {
    "/": "home",
    "/user": "user"
  };

let handlers = {
  "home": fun () => {
    renderForRoute <Home router={router} />
  },
  "user": fun () => {
    renderForRoute <User router={router} />
  }
};

DirectorRe.configure router {
  "html5history": true,
  /* this is where we connect the handlers to the routes */
  "resource": handlers
};

```

In our components we can now pass in a `router` prop, which we can use to navigate from an event handler (making sure to also `preventDefault` on the mouse event):

```reason
let component = ReasonReact.statelessComponent "User";

let make ::router  _children => {
  ...component,
  render: fun _self => {
    let gotoHome event => {
      ReactEventRe.Mouse.preventDefault event;
      DirectorRe.setRoute router "/";
    };

    <div>
      <h1> (ReasonReact.stringToElement "User ") </h1>
      <a href="#" onClick={gotoHome}> (ReasonReact.stringToElement "Home") </a>
    </div>
  }
};

```

We can add a path parameter to our routes:


```reason
let router =
  DirectorRe.makeRouter {
    "/": "home",
    "/user/:user_id": "user"
  };

let handlers = {
  "home": fun () => {
    renderForRoute <Home router={router} />
  },
  "user": fun (user_id: string) => {
    renderForRoute <User router={router} user_id={int_of_string user_id} />
  }
};
```

We could, for example, display the user id from the url in the User component:

```reason
let component = ReasonReact.statelessComponent "User";

let make ::router ::userID  _children => {
  ...component,
  render: fun _self => {
    let gotoHome event => {
      ReactEventRe.Mouse.preventDefault event;
      DirectorRe.setRoute router "/";
    };

    <div>
      <h1> (ReasonReact.stringToElement "User " ^ (string_of_int userID)) </h1>
      <a href="#" onClick={gotoHome}> (ReasonReact.stringToElement "Home") </a>
    </div>
  }
};
```

If we navigate to `/user/4` we'll see "User 4" on the page.

### Enscapsulating routing state with variants

Now, what if we want to pass information about the current route around in our app? This seems like a great use case for Reason's 'variants' feature.

We could add another type which simply describes the different routing states which can exist as variants, and then use pattern matching to decide what to render:

`index.re`

```reason
type routes =
  | HomeRoute
  | UserRoute int;

let router =
  DirectorRe.makeRouter {
    "/": "home",
    "/user/:userID": "user"
  };

let renderForRoute route => {
  let element = switch route {
    | HomeRoute => <Home router={router} />
    | UserRoute userID => <User router={router} userID=(userID) />
  };
  ReactDOMRe.renderToElementWithId element "root";
};

let handlers = {
  "home": fun () => {
    renderForRoute HomeRoute
  },
  "user": fun (userID: string) => {
    renderForRoute (UserRoute (int_of_string userID))
  }
};
```

This might be particularly useful if you have a single top level 'App' component which you could pass the route value into as a prop.

And that's it!

You can find the code implemented in this tutorial [here](https://github.com/jsdf/reason-routing-tutorial).


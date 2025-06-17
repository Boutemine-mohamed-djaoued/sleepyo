# Sleepyo 🌙

A lightweight, modern frontend framework with virtual DOM, component-based architecture, and built-in routing.

## Features

- 🚀 **Virtual DOM** - Efficient DOM updates with intelligent diffing
- 🧩 **Component-Based** - Reusable components with props and state
- 🛣️ **Built-in Router** - Hash-based routing with navigation guards
- 🔄 **State Management** - Simple and reactive state handling
- 📦 **Lightweight** - Minimal bundle size

## ⚠️ Current Status

Sleepyo is currently in its **runtime-only phase**. All the core functionality you see today - virtual DOM, components, routing, and state management - runs entirely in the browser runtime and
you will find the code in packages/runtime .

**Coming Soon:**

- 🔧 **Compiler** - Template compilation
- 📦 **Custom Loader** - Enhanced development experience with hot reload

The framework is fully functional as-is, but these upcoming features will significantly improve performance and developer experience. Stay tuned! 🚀

## Installation

```bash
npm install sleepyo
```

## Examples

```bash
# Clone the repository
git clone https://github.com/Boutemine-mohamed-djaoued/sleepyo.git

# Navigate to the project directory
cd sleepyo

# Install dependencies
npm install

# Run the development server with examples
npm run server:examples
```

## Quick Start

**note :** all the imports in here work only when you download the framework from npm
.If you want to use the code in the repo check examples.

```javascript
import {
  createApp,
  defineComponent,
  hElement,
} from "./node_modules/sleepyo/dist/sleepyo.js";

// Define a component
const App = defineComponent({
  state() {
    return {
      count: 0,
    };
  },

  increment() {
    this.updateState({ count: this.state.count + 1 });
  },

  render() {
    return hElement("div", {}, [
      hElement("h1", {}, ["Counter App"]),
      hElement("p", {}, [`Count: ${this.state.count}`]),
      hElement(
        "button",
        {
          on: { click: this.increment },
        },
        ["Increment"]
      ),
    ]);
  },
});

// Create and mount the app
const app = createApp({ rootComponent: App });
app.mount(document.body);
```

## Core Concepts

### Components

Components are the building blocks of your Sleepyo application. Use `defineComponent` to create reusable components:

```javascript
const MyComponent = defineComponent({
  // Initial state
  state(props) {
    return {
      message: props.initialMessage || "Hello World",
    };
  },

  // Lifecycle hooks
  onMounted() {
    console.log("Component mounted!");
  },

  onUnmounted() {
    console.log("Component unmounted!");
  },

  // Custom methods
  updateMessage() {
    this.updateState({ message: "Updated!" });
  },

  // Render function
  render() {
    return hElement(
      "div",
      {
        class: "my-component",
      },
      [
        hElement("p", {}, [this.state.message]),
        hElement(
          "button",
          {
            on: { click: this.updateMessage },
          },
          ["Update"]
        ),
      ]
    );
  },
});
```

### Virtual DOM Elements

Use the `h` functions to create virtual DOM elements:

```javascript
import {
  hElement,
  hText,
  hFragment,
  hSlot,
} from "./node_modules/sleepyo/dist/sleepyo.js";

// Element with attributes and children
hElement(
  "div",
  {
    class: "container",
    style: { color: "blue" },
    on: { click: handleClick },
  },
  [
    hElement("h1", {}, ["Title"]),
    hText("Some text"),
    hFragment([
      hElement("p", {}, ["Paragraph 1"]),
      hElement("p", {}, ["Paragraph 2"]),
    ]),
  ]
);
```

### Props and Events

Components can receive props and emit events:

```javascript
const ChildComponent = defineComponent({
  render() {
    return hElement(
      "button",
      {
        on: {
          click: () => {
            this.emit("custom-event", { data: "Hello Parent!" });
          },
        },
      },
      [this.props.buttonText || "Click me"]
    );
  },
});

const ParentComponent = defineComponent({
  handleCustomEvent(payload) {
    console.log("Received:", payload.data);
  },

  render() {
    return hElement(ChildComponent, {
      buttonText: "Custom Button",
      on: {
        "custom-event": this.handleCustomEvent,
      },
    });
  },
});
```

### Slots

Use slots for content composition:

```javascript
const Card = defineComponent({
  render() {
    return hElement("div", { class: "card" }, [
      hElement("div", { class: "card-header" }, [
        hElement("h2", {}, [this.props.title]),
      ]),
      hElement("div", { class: "card-body" }, [
        hSlot(), // Content will be inserted here
      ]),
    ]);
  },
});

// Usage
hElement(Card, { title: "My Card" }, [
  hElement("p", {}, ["This content goes in the slot"]),
  hElement("button", {}, ["Action"]),
]);
```

## Routing

Sleepyo includes a built-in hash router:

```javascript
import {
  createApp,
  HashRouter,
  RouterLink,
  RouterOutlet,
} from "./node_modules/sleepyo/dist/sleepyo.js";

// Define route components
const Home = defineComponent({
  render() {
    return hElement("h1", {}, ["Home Page"]);
  },
});

const About = defineComponent({
  render() {
    return hElement("h1", {}, ["About Page"]);
  },
});

const User = defineComponent({
  render() {
    const { id } = this.appContext.router.params;
    return hElement("h1", {}, [`User: ${id}`]);
  },
});

// Setup routes
const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/user/:id", component: User },
  { path: "/old-path", redirect: "/new-path" },
];

const router = new HashRouter(routes);

// Main app component
const App = defineComponent({
  render() {
    return hElement("div", {}, [
      hElement("nav", {}, [
        hElement(RouterLink, { to: "/" }, ["Home"]),
        hElement(RouterLink, { to: "/about" }, ["About"]),
        hElement(RouterLink, { to: "/user/123" }, ["User 123"]),
      ]),
      hElement(RouterOutlet),
    ]);
  },
});

// Create app with router
const app = createApp({
  rootComponent: App,
  options: { router },
});

app.mount(document.getElementById("app"));
```

### Route Guards

Add navigation guards to protect routes:

```javascript
const routes = [
  {
    path: "/admin",
    component: AdminPanel,
    beforeEnter: (from, to) => {
      if (!isAuthenticated()) {
        return "/login"; // Redirect to login
      }
      return true; // Allow navigation
    },
  },
];
```

### Programmatic Navigation

Navigate programmatically using the router:

```javascript
const MyComponent = defineComponent({
  goToUser() {
    this.appContext.router.navigateTo("/user/456");
  },

  goBack() {
    this.appContext.router.back();
  },

  render() {
    return hElement("div", {}, [
      hElement("button", { on: { click: this.goToUser } }, ["Go to User"]),
      hElement("button", { on: { click: this.goBack } }, ["Go Back"]),
    ]);
  },
});
```

## Advanced Features

### Custom Equality Function

For complex state objects, provide a custom equality function:

```javascript
import { defineComponent } from "./node_modules/sleepyo/dist/sleepyo.js";

const MyComponent = defineComponent({
  state() {
    return {
      users: [
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
      ],
    };
  },

  // The framework uses fast-deep-equal internally for prop comparison
  // State updates trigger re-renders when state objects change

  render() {
    return hElement("div", {}, [
      ...this.state.users.map((user) =>
        hElement("p", { key: user.id }, [user.name])
      ),
    ]);
  },
});
```

### Async Operations

Handle async operations in lifecycle hooks:

```javascript
const DataComponent = defineComponent({
  state() {
    return {
      data: null,
      loading: true,
    };
  },

  async onMounted() {
    try {
      const response = await fetch("/api/data");
      const data = await response.json();
      this.updateState({ data, loading: false });
    } catch (error) {
      this.updateState({ loading: false, error: error.message });
    }
  },

  render() {
    if (this.state.loading) {
      return hElement("div", {}, ["Loading..."]);
    }

    return hElement("div", {}, [JSON.stringify(this.state.data, null, 2)]);
  },
});
```

## API Reference

### Core Functions

- `createApp(options)` - Create a new application instance
- `defineComponent(config)` - Define a new component
- `hElement(tag, props, children)` - Create a virtual element
- `hText(value)` - Create a text node
- `hFragment(children)` - Create a document fragment
- `hSlot(children)` - Create a slot for content projection
- `nextTick()` - Wait for the next DOM update cycle

### Router

- `HashRouter(routes)` - Create a hash-based router
- `RouterLink` - Component for creating navigation links
- `RouterOutlet` - Component for rendering matched routes

### Component Lifecycle

- `onMounted()` - Called after component is mounted
- `onUnmounted()` - Called before component is unmounted
- `updateState(newState)` - Update component state
- `updateProps(newProps)` - Update component props
- `emit(eventName, payload)` - Emit a custom event

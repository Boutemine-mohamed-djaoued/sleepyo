function withoutNulls(arr) {
  return arr.filter((el) => el != null);
}

const DOM_TYPES = {
  TEXT: "text",
  ELEMENT: "element",
  FRAGMENT: "fragment",
};
function hElement(tag, props = {}, children = []) {
  return {
    tag,
    props,
    children: mapTextNodes(withoutNulls(children)),
    type: DOM_TYPES.ELEMENT,
  };
}
function mapTextNodes(children) {
  return children.map((child) => (typeof child === "string" ? hText(child) : child));
}
function hText(value) {
  return {
    value,
    type: DOM_TYPES.TEXT,
  };
}

function setAttributes(el, attrs) {
  const { class: className, style, ...otherAttrs } = attrs;
  if (className) {
    setClass(el, className);
  }
  if (style) {
    Object.entries(style).forEach(([prop, value]) => {
      setStyle(el, prop, value);
    });
  }
  for (const [name, value] of Object.entries(otherAttrs)) {
    setAttribute(el, name, value);
  }
}
function setClass(el, className) {
  el.className = "";
  if (typeof className === "string") {
    el.className = className;
  }
  if (Array.isArray(className)) {
    el.classList.add(...className);
  }
}
function setStyle(el, name, value) {
  el.style[name] = value;
}
function setAttribute(el, name, value) {
  if (value == null) {
    removeAttribute(el,name);
  } else if (name.startsWith("data-")) {
    el.setAttribute(name, value);
  } else {
    el[name] = value;
  }
}
function removeAttribute(el,name){
  el[name] = null;
  el.removeAttribute(name);
}

function addEventListeners(listeners = {},el){
  const addedListeneres = {};
  Object.entries(listeners).forEach(([eventName,handler])=>{
    const listener = addEventListener(eventName,handler,el);
    addedListeneres[eventName] = listener;
  });
  return addedListeneres
}
function addEventListener(eventName, handler, el) {
  console.log({el,eventName,handler});
  el.addEventListener(eventName, handler);
  return handler;
}
function removeEventListeners(listeners, el) {
  Object.entries(listeners).forEach(([eventName, handler]) => {
    el.removeEventListener(eventName, handler);
  });
}

function mountDOM(vdom, parentEl) {
  switch (vdom.type) {
    case DOM_TYPES.ELEMENT: {
      createElementNode(vdom, parentEl);
      break;
    }
    case DOM_TYPES.TEXT: {
      createTextNode(vdom, parentEl);
      break;
    }
    case DOM_TYPES.FRAGMENT: {
      createFragmentNode(vdom, parentEl);
      break;
    }
    default: {
      throw new Error(`Can't mount DOM of type: ${vdom.type}`);
    }
  }
}
function createElementNode(vdom, parentEl) {
  const elementNode = document.createElement(vdom.tag);
  vdom.el = elementNode;
  addProps(elementNode,vdom.props,vdom);
  vdom.children.forEach((child)=>{
    mountDOM(child, elementNode);
  });
  parentEl.append(elementNode);
}
function addProps(el,props,vdom){
  const {on : events , ...attributes} = props;
  vdom.listeners = addEventListeners(events,el);
  setAttributes(el,attributes);
}
function createTextNode(vdom, parentEl) {
  const textNode = document.createTextNode(vdom.value);
  vdom.el = textNode ;
  parentEl.append(textNode);
}
function createFragmentNode(vdom, parentEl) {
  const fragmentNode = document.createFragmentNode();
  vdom.el = parentEl;
  vdom.children.forEach((child) => {
    mountDOM(child, fragmentNode);
  });
  parentEl.append(fragmentNode);
}

function destroyDom(vdom) {
  switch (vdom.type) {
    case DOM_TYPES.ELEMENT: {
      removeElementNode(vdom);
      break;
    }
    case DOM_TYPES.TEXT: {
      removeTextNode(vdom);
      break;
    }
    case DOM_TYPES.FRAGMENT: {
      removeFragmentNode(vdom);
      break;
    }
    default: {
      throw new Error("Can't destroy DOM of type: ${type}");
    }
  }
  delete vdom.el;
}
function removeElementNode(vdom) {
  const { el, children, listeners } = vdom;
  el.remove();
  children.forEach(destroyDom);
  if (listeners) {
    removeEventListeners(listeners, el);
    delete vdom.listeners;
  }
}
function removeTextNode(vdom) {
  const { el } = vdom;
  el.remove();
}
function removeFragmentNode(vdom) {
  const { children } = vdom;
  children.forEach(destroyDom);
}

class Dispatcher {
  #subs = new Map()
  #afterHandlers = []
  subscribe(commandName,handler){
    if(!this.#subs.has(commandName)){
      this.#subs.set(commandName,[]);
    }
    const handlers = this.#subs.get(commandName);
    if (handlers.includes(handler)){
      return ()=>{}
    }
    handlers.push(handler);
    return ()=>{
      const idx = handlers.indexOf(handler);
      handlers.splice(idx,1);
    }
  }
  afterEveryCommand(handler){
    this.#afterHandlers.push(handler);
    return ()=>{
      const idx = this.#afterHandlers.indexOf(handler);
      this.#afterHandlers.splice(idx,1);
    }
  }
  dispatch(commandName,payload){
    if (this.#subs.has(commandName)){
      this.#subs.get(commandName).forEach((handler) => handler(payload));
    }else {
      console.warn(`No handlers for command: ${commandName}`);
    }
    this.#afterHandlers.forEach((handler) => handler());
  }
}

function createApp({ state, view, reducers = {} }) {
  let parentEl = null;
  let vdom = null;
  const dispatcher = new Dispatcher();
  const subscriptions = [dispatcher.afterEveryCommand(renderApp)];
  function emit(eventName, payload) {
    dispatcher.dispatch(eventName, payload);
  }
  for (const actionName in reducers) {
    const reducer = reducers[actionName];
    const sub = dispatcher.subscribe(actionName, (payload) => {
      state = reducer(state, payload);
    });
    subscriptions.push(sub);
  }
  function renderApp() {
    if (vdom) destroyDom(vdom);
    vdom = view(state, emit);
    mountDOM(vdom, parentEl);
  }
  return {
    mount(_parentEl) {
      parentEl = _parentEl;
      renderApp();
    },
    unmount() {
      destroyDom(vdom);
      vdom = null;
      subscriptions.forEach((unsubscribe) => unsubscribe());
    },
  };
}

console.log("This will soon be a frontend framework!");
createApp({
  state: 0,
  reducers: {
    add: (state, amount) => state + amount,
  },
  view: (state, emit) => hElement("button", { on: { click: () => emit("add", 1) } }, [hText(state)]),
}).mount(document.body);

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
  el.addEventListener(eventName, handler);
  return handler;
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

console.log("This will soon be a frontend framework!");
const login = () => {
  console.log("Logging in...");
};
const VDOM = hElement("form", { class: "login-form", action: "login" }, [
  hElement("input", { type: "text", name: "user" }),
  hElement("input", { type: "password", name: "pass" }),
  hElement("button", { on: { click: login } }, ["Login"]),
]);
mountDOM(VDOM, document.querySelector("body"));

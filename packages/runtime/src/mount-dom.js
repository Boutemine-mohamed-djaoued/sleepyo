import { DOM_TYPES } from "./h";
import { setAttributes } from "./attributes";
import { addEventListeners } from "./events";

export function mountDOM(vdom, parentEl, index, hostComponent = null) {
  switch (vdom.type) {
    case DOM_TYPES.ELEMENT: {
      createElementNode(vdom, parentEl, index, hostComponent);
      break;
    }
    case DOM_TYPES.TEXT: {
      createTextNode(vdom, parentEl, index);
      break;
    }
    case DOM_TYPES.FRAGMENT: {
      createFragmentNode(vdom, parentEl, index, hostComponent);
      break;
    }
    default: {
      throw new Error(`Can't mount DOM of type: ${vdom.type}`);
    }
  }
}

export function insert(el, parentEl, index) {
  if (index == null) {
    parentEl.append(el);
  }
  if (index < 0) {
    throw new Error(`index must be a positive integer ,got ${index}`);
  }

  const children = parentEl.childNodes;
  console.log({index , children });

  if (index > children.length) {
    parentEl.append(el);
  } else {
    parentEl.insertBefore(el, children[index]);
  }
}

function createElementNode(vdom, parentEl, index, hostComponent) {
  const elementNode = document.createElement(vdom.tag);
  vdom.el = elementNode;

  addProps(elementNode, vdom.props, vdom, hostComponent);

  vdom.children.forEach((child) => {
    mountDOM(child, elementNode, null, hostComponent);
  });

  insert(elementNode, parentEl, index);
}

function addProps(el, props, vdom, hostComponent) {
  const { on: events, ...attributes } = props;
  vdom.listeners = addEventListeners(events, el, hostComponent);
  setAttributes(el, attributes);
}

function createTextNode(vdom, parentEl, index) {
  const textNode = document.createTextNode(vdom.value);
  vdom.el = textNode;
  insert(textNode, parentEl, index);
}

function createFragmentNode(vdom, parentEl, index, hostComponent) {
  const fragmentNode = document.createDocumentFragment();
  vdom.el = parentEl;
  vdom.children.forEach((child, i) => {
    mountDOM(child, fragmentNode, index ? index + i : null, hostComponent);
  });
  parentEl.append(fragmentNode);
}

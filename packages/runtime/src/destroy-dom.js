import { DOM_TYPES } from "./h";
import { removeEventListeners } from "./events";

export function destroyDom(vdom) {
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

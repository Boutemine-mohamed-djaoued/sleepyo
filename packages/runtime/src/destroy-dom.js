import { DOM_TYPES } from "./h";
import { removeEventListeners } from "./events";
import { enqueueJob } from "./scheduler";

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
    case DOM_TYPES.COMPONENT: {
      removeComponentNode(vdom);
      enqueueJob(() => vdom.component.onUnmounted());
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

function removeComponentNode(vdom) {
  vdom.component.unmount();
}

import { DOM_TYPES } from "./h";
import { setAttributes } from "./attributes";
import { addEventListeners } from "./events";

export function mountDOM(vdom, parentEl) {
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
  vdom.el = elementNode

  addProps(elementNode,vdom.props,vdom)

  vdom.children.forEach((child)=>{
    mountDOM(child, elementNode);
  })

  parentEl.append(elementNode);
}

function addProps(el,props,vdom){
  const {on : events , ...attributes} = props
  vdom.listeners = addEventListeners(events,el)
  setAttributes(el,attributes)
}

function createTextNode(vdom, parentEl) {
  const textNode = document.createTextNode(vdom.value);
  vdom.el = textNode ;
  parentEl.append(textNode);
}

function createFragmentNode(vdom, parentEl) {
  const fragmentNode = document.createDocumentFragment();
  vdom.el = parentEl
  vdom.children.forEach((child) => {
    mountDOM(child, fragmentNode);
  });
  parentEl.append(fragmentNode)
}

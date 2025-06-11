import { ARRAY_DIFF_OP, arrayDiffSequence, arraysDiff } from "../utils/arrays";
import { objectsDiff } from "../utils/objects";
import { isNotBlankOrEmptyString } from "../utils/strings";
import {
  removeAttribute,
  removeStyle,
  setAttribute,
  setStyle,
} from "./attributes";
import { destroyDom } from "./destroy-dom";
import { addEventListener } from "./events";
import { DOM_TYPES, extractChildren } from "./h";
import { mountDOM } from "./mount-dom";
import { areNodesEqual } from "./nodes-equal";

export function patchDom(oldVdom, newVdom, parentEl, hostComponent = null) {
  if (!areNodesEqual(oldVdom, newVdom)) {
    const index = findIndexInParent(parentEl, oldVdom.el);
    destroyDom(oldVdom);
    mountDOM(newVdom, parentEl, index, hostComponent);
    return newVdom;
  }

  newVdom.el = oldVdom.el;

  switch (newVdom.type) {
    case DOM_TYPES.TEXT: {
      patchText(oldVdom, newVdom);
      return newVdom;
    }
    case DOM_TYPES.ELEMENT: {
      patchElement(oldVdom, newVdom, hostComponent);
      break;
    }
  }

  patchChildren(oldVdom, newVdom, hostComponent);

  return newVdom;
}

function findIndexInParent(parentEl, el) {
  const index = Array.from(parentEl.childNodes).indexOf(el);

  if (index < 0) return null;

  return index;
}

function patchText(oldVdom, newVdom) {
  const el = newVdom.el;
  if (oldVdom.value != newVdom.value) {
    el.nodeValue = newVdom.value;
  }
}

function patchElement(oldVdom, newVdom , hostComponent) {
  const el = oldVdom.el;
  const {
    class: oldClass,
    style: oldStyle,
    on: oldEvents,
    ...oldAttrs
  } = oldVdom.props;

  const {
    class: newClass,
    style: newStyle,
    on: newEvents,
    ...newAttrs
  } = newVdom.props;

  const { listeners: oldListeners } = oldVdom;

  patchAttrs(el, oldAttrs, newAttrs);
  patchClasses(el, oldClass, newClass);
  patchStyle(el, oldStyle, newStyle);

  newVdom.listeners = patchEvents(el, oldListeners, oldEvents, newEvents,hostComponent);
}

function patchAttrs(el, oldAttrs, newAttrs) {
  const { added, removed, updated } = objectsDiff(oldAttrs, newAttrs);

  for (const attr of removed) {
    removeAttribute(el, attr);
  }

  for (const attr of added.concat(updated)) {
    setAttribute(el, attr, newAttrs[attr]);
  }
}

function patchClasses(el, oldClass, newClass) {
  const oldClasses = toClassList(oldClass);
  const newClasses = toClassList(newClass);

  const { added, removed } = arraysDiff(oldClasses, newClasses);

  if (removed.length > 0) {
    el.classList.remove(...removed);
  }

  if (added.length > 0) {
    el.classList.add(...added);
  }
}

function toClassList(classes = "") {
  return Array.isArray(classes)
    ? classes.filter(isNotBlankOrEmptyString)
    : classes.split(/(\s+)/).filter(isNotBlankOrEmptyString);
}

function patchStyle(el, oldStyle = {}, newStyle = {}) {
  const { added, removed, updated } = objectsDiff(oldStyle, newStyle);

  for (const style of removed) {
    removeStyle(el, style);
  }

  for (const style of added.concat(updated)) {
    setStyle(el, style, newStyle[style]);
  }
}

function patchEvents(el, oldListners = {}, oldEvents = {}, newEvents = {} , hostComponent) {
  const { added, removed, updated } = objectsDiff(oldEvents, newEvents);

  for (const eventName of removed.concat(updated)) {
    el.removeEventListener(eventName, oldListners[eventName]);
  }

  const addedListeners = {};

  for (const eventName of added.concat(updated)) {
    const listener = addEventListener(eventName, newEvents[eventName], el , hostComponent);
    addedListeners[eventName] = listener;
  }

  return addedListeners;
}

function patchChildren(oldVdom, newVdom, hostComponent) {
  const oldChildren = extractChildren(oldVdom);
  const newChildren = extractChildren(newVdom);

  const parentEl = oldVdom.el;

  const diffSeq = arrayDiffSequence(oldChildren, newChildren, areNodesEqual);

  for (const operation of diffSeq) {
    const { originalIndex, index, item } = operation;
    const offset = hostComponent?.offset ?? 0;
    console.log(offset);
    switch (operation.op) {
      case ARRAY_DIFF_OP.ADD: {
        mountDOM(item, parentEl, index + offset, hostComponent);
        break;
      }
      case ARRAY_DIFF_OP.REMOVE: {
        destroyDom(item);
        break;
      }
      case ARRAY_DIFF_OP.MOVE: {
        const oldChild = oldChildren[originalIndex];
        const newChild = newChildren[index];
        const el = oldChild.el;
        const elAtTargetElement = parentEl.childNodes[index + offset];
        parentEl.insertBefore(el, elAtTargetElement);
        patchDom(oldChild, newChild, parentEl, hostComponent);
        break;
      }
      case ARRAY_DIFF_OP.NOOP: {
        patchDom(
          oldChildren[originalIndex],
          newChildren[index],
          parentEl,
          hostComponent
        );
        break;
      }
    }
  }
}

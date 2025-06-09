function withoutNulls(arr) {
  return arr.filter((el) => el != null);
}
function arraysDiff(oldArray, newArray) {
  return {
    added: newArray.filter((newItem) => !oldArray.includes(newItem)),
    removed: oldArray.filter((oldItem) => !newArray.includes(oldItem)),
  };
}
const ARRAY_DIFF_OP = {
  ADD: "add",
  REMOVE: "remove",
  MOVE: "move",
  NOOP: "noop",
};
class ArrayWithOriginalIndices {
  #array = [];
  #originalIndices = [];
  #equalFn;
  constructor(array, equalFn) {
    this.#array = [...array];
    this.#equalFn = equalFn;
    this.#originalIndices = array.map((_, i) => i);
  }
  get length() {
    return this.#array.length;
  }
  originalIndexAt(index) {
    return this.#originalIndices[index];
  }
  findIndexFrom(item, fromIndex) {
    for (let i = fromIndex; i < this.length; i++) {
      if (this.#equalFn(this.#array[i], item)) return i;
    }
    return -1;
  }
  isRemoval(index, newArray) {
    if (index >= this.length) return false;
    const item = this.#array[index];
    const indexInNewArray = newArray.findIndex((newItem) =>
      this.#equalFn(newItem, item)
    );
    return indexInNewArray === -1;
  }
  removeItem(index) {
    const operation = {
      op: ARRAY_DIFF_OP.REMOVE,
      index,
      item: this.#array[index],
    };
    this.#array.splice(index, 1);
    this.#originalIndices.splice(index, 1);
    return operation;
  }
  isNoop(index, newArray) {
    if (index >= this.length) return false;
    const item = newArray[index];
    const oldItem = this.#array[index];
    return this.#equalFn(item, oldItem);
  }
  noopItem(index) {
    return {
      op: ARRAY_DIFF_OP.NOOP,
      index,
      originalIndex: this.originalIndexAt(index),
      item: this.#array[index],
    };
  }
  isAddition(item, fromIndex) {
    return this.findIndexFrom(item, fromIndex) === -1;
  }
  addItem(item, index) {
    const operation = {
      op: ARRAY_DIFF_OP.ADD,
      index,
      item,
    };
    this.#array.splice(index, 0, item);
    this.#originalIndices.splice(index, 0, -1);
    return operation;
  }
  moveItem(item, toIndex) {
    const fromIndex = this.findIndexFrom(item, toIndex);
    const operation = {
      op: ARRAY_DIFF_OP.MOVE,
      originalIndex: this.originalIndexAt(fromIndex),
      fromIndex,
      index: toIndex,
      item: this.#array[fromIndex],
    };
    const [_item] = this.#array.splice(fromIndex, 1);
    this.#array.splice(toIndex, 0, _item);
    const [originalIndex] = this.#originalIndices.splice(fromIndex, 1);
    this.#originalIndices.splice(toIndex, 0, originalIndex);
    return operation;
  }
  removeItemsAfter(index) {
    const operations = [];
    while (this.length > index) {
      operations.push(this.removeItem(index));
    }
    return operations;
  }
}
function arrayDiffSequence(
  oldArray,
  newArray,
  equalFn = (a, b) => a === b
) {
  const sequence = [];
  const array = new ArrayWithOriginalIndices(oldArray, equalFn);
  for (let index = 0; index < newArray.length; index++) {
    if (array.isRemoval(index, newArray)) {
      sequence.push(array.removeItem(index));
      index--;
      continue;
    }
    if (array.isNoop(index, newArray)) {
      sequence.push(array.noopItem(index));
      continue;
    }
    const item = newArray[index];
    if (array.isAddition(item, index)) {
      sequence.push(array.addItem(item, index));
      continue;
    }
    sequence.push(array.moveItem(item, index));
  }
  sequence.push(...array.removeItemsAfter(newArray.length));
  return sequence;
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
  return children.map((child) =>
    typeof child === "string" ? hText(child) : child
  );
}
function hText(value) {
  return {
    value,
    type: DOM_TYPES.TEXT,
  };
}
function hFragment(children = {}) {
  return {
    children: mapTextNodes(withoutNulls(children)),
    type: DOM_TYPES.FRAGMENT,
  };
}
function extractChildren(vdom) {
  if (vdom.children == null) {
    return [];
  }
  const children = [];
  for (const child of vdom.children) {
    if (child.type === DOM_TYPES.FRAGMENT) {
      children.push(...extractChildren(child));
    } else {
      children.push(child);
    }
  }
  return children;
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
function removeEventListeners(listeners, el) {
  Object.entries(listeners).forEach(([eventName, handler]) => {
    el.removeEventListener(eventName, handler);
  });
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
function removeStyle(el, name) {
  el.style[name] = null;
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

function mountDOM(vdom, parentEl, index) {
  switch (vdom.type) {
    case DOM_TYPES.ELEMENT: {
      createElementNode(vdom, parentEl, index);
      break;
    }
    case DOM_TYPES.TEXT: {
      createTextNode(vdom, parentEl, index);
      break;
    }
    case DOM_TYPES.FRAGMENT: {
      createFragmentNode(vdom, parentEl, index);
      break;
    }
    default: {
      throw new Error(`Can't mount DOM of type: ${vdom.type}`);
    }
  }
}
function insert(el, parentEl, index) {
  if (index == null) {
    parentEl.append(el);
  }
  if (index < 0) {
    throw new Error(`index must be a positive integer ,got ${index}`);
  }
  const children = parentEl.childNodes;
  if (index > children.length) {
    parentEl.append(el);
  } else {
    parentEl.insertBefore(el, children[index]);
  }
}
function createElementNode(vdom, parentEl, index) {
  const elementNode = document.createElement(vdom.tag);
  vdom.el = elementNode;
  addProps(elementNode, vdom.props, vdom);
  vdom.children.forEach((child) => {
    mountDOM(child, elementNode);
  });
  insert(elementNode, parentEl, index);
}
function addProps(el, props, vdom) {
  const { on: events, ...attributes } = props;
  vdom.listeners = addEventListeners(events, el);
  setAttributes(el, attributes);
}
function createTextNode(vdom, parentEl, index) {
  const textNode = document.createTextNode(vdom.value);
  vdom.el = textNode;
  insert(textNode, parentEl, index);
}
function createFragmentNode(vdom, parentEl, index) {
  const fragmentNode = document.createDocumentFragment();
  vdom.el = parentEl;
  vdom.children.forEach((child, i) => {
    mountDOM(child, fragmentNode, index ? index + i : null);
  });
  parentEl.append(fragmentNode);
}

function objectsDiff(oldObj = {}, newObj = {} ) {
  const oldKeys = Object.keys(oldObj);
  const newKeys = Object.keys(newObj);
  return {
    added: newKeys.filter((key) => !oldKeys.includes(key)),
    removed: oldKeys.filter((key) => !newKeys.includes(key)),
    updated: newKeys.filter(
      (key) => oldKeys.includes(key) && oldObj[key] !== newObj[key]
    ),
  };
}

function isNotEmptyString(str) {
  return str !== "";
}
function isNotBlankOrEmptyString(str) {
  return isNotEmptyString(str.trim());
}

function areNodesEqual(nodeOne, nodeTwo) {
  if (nodeOne.type !== nodeTwo.type) return false;
  if (nodeOne.type === DOM_TYPES.ELEMENT) {
    return nodeOne.tag === nodeTwo.tag;
  }
  return true;
}

function patchDom(oldVdom, newVdom, parentEl) {
  if (!areNodesEqual(oldVdom, newVdom)) {
    const index = findIndexInParent(parentEl, oldVdom.el);
    destroyDom(oldVdom);
    mountDOM(newVdom, parentEl, index);
    return newVdom;
  }
  newVdom.el = oldVdom.el;
  switch (newVdom.type) {
    case DOM_TYPES.TEXT: {
      patchText(oldVdom, newVdom);
      return newVdom;
    }
    case DOM_TYPES.ELEMENT: {
      patchElement(oldVdom, newVdom);
      break;
    }
  }
  patchChildren(oldVdom, newVdom);
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
function patchElement(oldVdom, newVdom) {
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
  newVdom.listeners = patchEvents(el, oldListeners, oldEvents, newEvents);
}
function patchAttrs(el, oldAttrs, newAttrs ) {
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
function patchEvents(el, oldListners = {}, oldEvents = {}, newEvents = {}) {
  const { added, removed, updated } = objectsDiff(oldEvents, newEvents);
  for (const eventName of removed.concat(updated)) {
    el.removeEventListener(eventName, oldListners[eventName]);
  }
  const addedListeners = {};
  for (const eventName of added.concat(updated)) {
    const listener = addEventListener(eventName, newEvents[eventName], el);
    addedListeners[eventName] = listener;
  }
  return addedListeners;
}
function patchChildren(oldVdom, newVdom) {
  const oldChildren = extractChildren(oldVdom);
  const newChildren = extractChildren(newVdom);
  const parentEl = oldVdom.el;
  const diffSeq = arrayDiffSequence(oldChildren, newChildren, areNodesEqual);
  for (const operation of diffSeq) {
    const { originalIndex, index, item } = operation;
    switch (operation.op) {
      case ARRAY_DIFF_OP.ADD: {
        mountDOM(item, parentEl, index);
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
        const elAtTargetElement = parentEl.childNodes[index];
        parentEl.insertBefore(el, elAtTargetElement);
        patchDom(oldChild, newChild, parentEl);
        break;
      }
      case ARRAY_DIFF_OP.NOOP: {
        patchDom(oldChildren[originalIndex], newChildren[index], parentEl);
        break;
      }
    }
  }
}

function createApp({ state, view, reducers = {} }) {
  let parentEl = null;
  let vdom = null;
  let isMounted = false;
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
    const newVdom = view(state, emit);
    vdom = patchDom(vdom, newVdom, parentEl);
  }
  return {
    mount(_parentEl) {
      if(isMounted) {
        throw new Error("App is already mounted");
      }
      parentEl = _parentEl;
      vdom = view(state, emit);
      mountDOM(vdom, parentEl);
      isMounted = true;
    },
    unmount() {
      destroyDom(vdom);
      vdom = null;
      subscriptions.forEach((unsubscribe) => unsubscribe());
      isMounted = false;
    },
  };
}

export { createApp, hElement, hFragment, hText };

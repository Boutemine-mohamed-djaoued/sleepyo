import { withoutNulls } from "../utils/arrays";

export const DOM_TYPES = {
  TEXT: "text",
  ELEMENT: "element",
  FRAGMENT: "fragment",
  COMPONENT: "component",
  SLOT: "slot",
};

export function hElement(tag, props = {}, children = []) {
  const type =
    typeof tag === "string" ? DOM_TYPES.ELEMENT : DOM_TYPES.COMPONENT;
  return {
    tag,
    props,
    children: mapTextNodes(withoutNulls(children)),
    type,
  };
}

export function mapTextNodes(children) {
  return children.map((child) =>
    typeof child === "string" ? hText(child) : child
  );
}

export function hText(value) {
  return {
    value,
    type: DOM_TYPES.TEXT,
  };
}

export function hFragment(children = {}) {
  return {
    children: mapTextNodes(withoutNulls(children)),
    type: DOM_TYPES.FRAGMENT,
  };
}

let hSlotCalled = false;

export function didCreateSlot() {
  return hSlotCalled;
}

export function resetDidCreateSlot() {
  hSlotCalled = false;
}

export function hSlot(children = []) {
  hSlotCalled = true;
  return {
    children,
    type: DOM_TYPES.SLOT,
  };
}

export function extractChildren(vdom) {
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

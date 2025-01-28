import { withoutNulls } from "../utils/arrays";

export const DOM_TYPES = {
  TEXT: "text",
  ELEMENT: "element",
  FRAGMENT: "fragment",
};

export function hElement(tag, props = {}, children = []) {
  return {
    tag,
    props,
    children: mapTextNodes(withoutNulls(children)),
    type: DOM_TYPES.ELEMENT,
  };
}

export function mapTextNodes(children) {
  return children.map((child) => (typeof child === "string" ? hText(child) : child));
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

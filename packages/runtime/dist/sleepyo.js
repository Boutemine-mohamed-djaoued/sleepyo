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

console.log("This will soon be a frontend framework!");
const VDOM = hElement("form", { class: "login-form", action: "login" }, [
  hElement("input", { type: "text", name: "user" }),
  hElement("input", { type: "password", name: "pass" }),
  hElement("button", { on: { click: "login" } }, ["Login"]),
]);
console.log(VDOM.children[2].children[0]);

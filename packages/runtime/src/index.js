import { hElement } from "./h";
import { mountDOM } from "./mount-dom";
import { destroyDom } from "./destroy-dom";
console.log("This will soon be a frontend framework!");

const login = () => {
  console.log("Logging in...");
};

const VDOM = hElement("div", { class: "hello there" }, [
  hElement("input", { type: "text", name: "user" }),
  hElement("input", { type: "password", name: "pass" }),
  hElement("button", { on: { click: login } }, ["Login"]),
]);

// console.log(VDOM.children[2].props.on.click//

mountDOM(VDOM, document.body);

setTimeout(() => {
  destroyDom(VDOM);
}, 3000);

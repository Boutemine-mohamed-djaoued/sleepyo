import { hElement } from "./h";
console.log("This will soon be a frontend framework!");

const VDOM = hElement("form", { class: "login-form", action: "login" }, [
  hElement("input", { type: "text", name: "user" }),
  hElement("input", { type: "password", name: "pass" }),
  hElement("button", { on: { click: "login" } }, ["Login"]),
]);

console.log(VDOM.children[2].children[0])
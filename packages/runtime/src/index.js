import { hElement } from "./h";
import { mountDOM } from "./mount-dom";
console.log("This will soon be a frontend framework!");

const login = () => {
  console.log("Logging in...");
};

const VDOM = hElement("form", { class: "login-form", action: "login" }, [
  hElement("input", { type: "text", name: "user" }),
  hElement("input", { type: "password", name: "pass" }),
  hElement("button", { on: { click: login } }, ["Login"]),
]);

mountDOM(VDOM, document.querySelector("body"));

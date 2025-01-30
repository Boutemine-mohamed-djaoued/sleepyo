import { hElement , hText } from "./h";
import { mountDOM } from "./mount-dom";
import { destroyDom } from "./destroy-dom";
import { createApp } from "./app";
console.log("This will soon be a frontend framework!");

createApp({
  state: 0,
  reducers: {
    add: (state, amount) => state + amount,
  },
  view: (state, emit) => hElement("button", { on: { click: () => emit("add", 1) } }, [hText(state)]),
}).mount(document.body);
import {
  hElement,
  hText,
  hFragment,
} from "../../packages/runtime/dist/sleepyo.js";

export function CreateTodo({ currentTodo }, emit) {
  return hElement("div", {}, [
    hElement("label", { for: "todo-input" }, ["NEW TODO"]),
    hElement("input", {
      type: "text",
      id: "todo-input",
      value: currentTodo,
      on: {
        input: ({ target }) => emit("update-current-todo", target.value),
      },
    }),
    hElement("button" , {
      disabled : currentTodo.length < 3 ,
      on : {
        click : () => emit("add-todo")
      }
    }, ['Add']),
  ]);
}

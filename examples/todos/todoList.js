import {
  hElement,
  hText,
  hFragment,
} from "../../packages/runtime/dist/sleepyo.js";

export function TodoList({ todos, edit }, emit) {
  return hElement(
    "ul",
    {},
    todos.map((todo, i) => TodoItem({ todo, i, edit }, emit))
  );
}

function TodoItem({ todo, i, edit }, emit) {
  const isEditing = (edit.idx == i);
  return isEditing
    ? hElement("li", {}, [
        hElement("input", {
          value: edit.edited,
          on: {
            input: ({ target }) => emit("edit-todo", target.value),
          },
        }),
        hElement(
          "button",
          {
            on: {
              click: () => emit("save-edited-todo"),
            },
          },
          ["Save"]
        ),
        hElement(
          "button",
          {
            on: {
              click: () => emit("cancel-editing-todo"),
            },
          },
          ["Cancel"]
        ),
      ])
    : hElement("li", {}, [
        hElement(
          "span",
          {
            on: {
              dblclick: () => emit("start-editing-todo",i),
            },
          },
          [todo]
        ),
        hElement(
          "button",
          {
            on: {
              click: () => emit("remove-todo",i),
            },
          },
          ["Done"]
        ),
      ]);
}

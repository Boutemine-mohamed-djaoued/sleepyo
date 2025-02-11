import {
  createApp,
  hElement,
  hText,
  hFragment,
} from "../../packages/runtime/dist/sleepyo.js";

import { CreateTodo } from "./createTodo.js";
import { TodoList } from "./todoList.js";

const state = {
  currentTodo: "",
  edit: {
    idx: null,
    original: null,
    edited: null,
  },
  todos: [],
};

const reducers = {
  "update-current-todo": (state, currentTodo) => ({
    ...state,
    currentTodo,
  }),
  "add-todo": (state) => ({
    ...state,
    todos: [...state.todos, state.currentTodo],
    currentTodo: "",
  }),
  "start-editing-todo": (state, idx) => ({
    ...state,
    edit: { idx, origin: state.todos[idx], edited: state.todos[idx] },
  }),
  "edit-todo": (state, edited) => ({
    ...state,
    edit: { ...state.edit, edited },
  }),
  "save-edited-todo": (state) => {
    const todos = [...state.todos];
    todos[state.edit.idx] = state.edit.edited;
    return {
      ...state,
      edit: {
        idx: null,
        original: null,
        edited: null,
      },
      todos,
    };
  },
  "cancel-editing-todo": (state) => ({
    ...state,
    edit: { idx: null, original: null, edited: null },
  }),
  "remove-todo": (state, idx) => ({
    ...state,
    todos: state.todos.filter((_, i) => i !== idx),
  }),
};

function App(state, emit) {
  return hFragment([
    hElement("h1", {}, ["My TODOs"]),
    CreateTodo(state, emit),
    TodoList(state,emit)
  ]);
}

createApp({ state, reducers, view: App }).mount(document.body);

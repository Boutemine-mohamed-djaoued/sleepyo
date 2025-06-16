import { test, expect, beforeEach, afterEach } from "vitest";
import { createApp } from "../app";

import {
  createApp,
  defineComponent,
  hElement,
  hFragment,
  hText,
  nextTick,
} from "../index";

const Counter = defineComponent({
  state() {
    return { count: 0 };
  },
  onMounted() {
    setTimeout(() => this.updateState({ count: 69 }));
  },
  render() {
    const { count } = this.state;
    return hFragment([
      hElement("span", { "data-qa": "counter" }, [hText(count)]),
      hElement(
        "button",
        {
          "data-qa": "increment",
          on: {
            click: () => this.updateState({ count: count + 1 }),
          },
        },
        ["Increment"]
      ),
    ]);
  },
});

let app = null;
beforeEach(() => {
  app = createApp({ rootComponent: Counter });
  app.mount(document.body);
});
afterEach(async () => {
  await nextTick();
  app.unmount();
  await nextTick();
});
test("the counter starts at 69", async () => {
  const counter = document.querySelector('[data-qa="counter"]');
  await nextTick();
  expect(counter.textContent).toBe("69");
});
test("the counter increments when the button is clicked", () => {
  const button = document.querySelector('[data-qa="increment"]');
  const counter = document.querySelector('[data-qa="counter"]');

  button.click();
  expect(counter.textContent).toBe("1");
});

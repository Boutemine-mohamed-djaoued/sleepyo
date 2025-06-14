import { destroyDom } from "./destroy-dom";
import { mountDOM } from "./mount-dom";
import { hElement } from "./h";
export function createApp({ rootComponent, props = {} }) {
  let parentEl = null;
  let isMounted = false;
  let vdom = null;

  function reset() {
    parentEl = null;
    isMounted = false;
    vdom = null;
  }

  return {
    mount(_parentEl) {
      if (isMounted) {
        throw new Error("The application is already mounted");
      }
      parentEl = _parentEl;
      vdom = hElement(rootComponent, props);
      mountDOM(vdom, parentEl);
      isMounted = true;
    },
    unmount() {
      if (!isMounted) {
        throw new Error("The application is not mounted");
      }
      destroyDom(vdom);
      reset();
    },
  };
}

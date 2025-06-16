import { destroyDom } from "./destroy-dom";
import { mountDOM } from "./mount-dom";
import { hElement } from "./h";
import { NoopRouter } from "./router";

export function createApp({ rootComponent, props = {}, options = {} }) {
  let parentEl = null;
  let isMounted = false;
  let vdom = null;

  const context = {
    router: options.router || new NoopRouter(),
  };

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
      mountDOM(vdom, parentEl, null, { appContext: context });
      context.router.init();
      isMounted = true;
    },
    unmount() {
      if (!isMounted) {
        throw new Error("The application is not mounted");
      }
      destroyDom(vdom);
      context.router.destroy();
      reset();
    },
  };
}

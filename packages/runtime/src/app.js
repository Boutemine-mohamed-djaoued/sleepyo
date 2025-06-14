import { destroyDom } from "./destroy-dom";
import { Dispatcher } from "./dispatcher";
import { mountDOM } from "./mount-dom";
import { patchDom } from "./patch-dom";

export function createApp({ state, view, reducers = {} }) {
  let parentEl = null;
  let vdom = null;
  let isMounted = false;

  const dispatcher = new Dispatcher();
  const subscriptions = [dispatcher.afterEveryCommand(renderApp)];

  function emit(eventName, payload) {
    dispatcher.dispatch(eventName, payload);
  }

  for (const actionName in reducers) {
    const reducer = reducers[actionName];
    const sub = dispatcher.subscribe(actionName, (payload) => {
      state = reducer(state, payload);
    });
    subscriptions.push(sub);
  }

  function renderApp() {
    const newVdom = view(state, emit);
    vdom = patchDom(vdom, newVdom, parentEl);
  }

  return {
    mount(_parentEl) {
      if (isMounted) {
        throw new Error("App is already mounted");
      }
      parentEl = _parentEl;
      vdom = view(state, emit);
      mountDOM(vdom, parentEl);
      isMounted = true;
    },
    unmount() {
      destroyDom(vdom);
      vdom = null;
      subscriptions.forEach((unsubscribe) => unsubscribe());
      isMounted = false;
    },
  };
}

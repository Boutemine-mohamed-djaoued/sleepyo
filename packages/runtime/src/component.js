import { mountDOM } from "./mount-dom";
import { destroyDom } from "./destroy-dom";
import { patchDom } from "./patch-dom";
import { DOM_TYPES, extractChildren } from "./h";
import { hasOwnPropery } from "../utils/objects";

export function defineComponent({ render, state, ...methods }) {
  class Component {
    #vdom = null;
    #hostEl = null;
    #isMounted = false;

    render() {
      return render.call(this);
    }

    constructor(props = {}) {
      this.props = props;
      this.state = state ? state(props) : {};
    }

    get elements() {
      if (this.#vdom == null) {
        return [];
      }
      if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
        return extractChildren(this.#vdom).map((child) => child.el);
      }

      return [this.#vdom.el];
    }

    get firstElement() {
      return this.elements[0];
    }

    get offset() {
      if (this.#vdom.type === DOM_TYPES.FRAGMENT)
        return Array.from(this.#hostEl.children).indexOf(this.firstElement);
      return 0;
    }

    updateState(state) {
      this.state = { ...this.state, ...state };
      this.#patch();
    }

    mount(hostEl, index = null) {
      if (this.#isMounted) {
        throw new Error("Component is already mounted");
      }
      this.#vdom = this.render();
      mountDOM(this.#vdom, hostEl, index, this);
      this.#hostEl = hostEl;
      this.#isMounted = true;
    }

    #patch() {
      if (!this.#isMounted) {
        throw new Error("Component is not mounted");
      }
      const newVdom = this.render();
      this.#vdom = patchDom(this.#vdom, newVdom, this.#hostEl, this);
    }

    unmount() {
      if (!this.#isMounted) {
        throw new Error("Component is not mounted");
      }
      destroyDom(this.#vdom);
      this.#vdom = null;
      this.#hostEl = null;
      this.#isMounted = false;
    }
  }
  for (const methodName in methods) {
    if (hasOwnPropery(Component, methodName)) {
      throw new Error(`method ${methodName} already exists in component.`);
    }
    Component.prototype[methodName] = methods[methodName];
  }
  return Component;
}

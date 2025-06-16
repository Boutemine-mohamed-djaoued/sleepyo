import { mountDOM } from "./mount-dom";
import { destroyDom } from "./destroy-dom";
import { patchDom } from "./patch-dom";
import {
  DOM_TYPES,
  extractChildren,
  didCreateSlot,
  resetDidCreateSlot,
} from "./h";
import { hasOwnPropery } from "../utils/objects";
import { Dispatcher } from "./dispatcher";
import { fillSlots } from "./slots";
import equal from "fast-deep-equal";

const emptyFn = () => {};

export function defineComponent({
  render,
  state,
  onMounted = emptyFn,
  onUnmounted = emptyFn,
  ...methods
}) {
  class Component {
    #vdom = null;
    #hostEl = null;
    #isMounted = false;
    #eventHandlers = null;
    #parentComponent = null;
    #dispatcher = new Dispatcher();
    #subscriptions = [];
    #children = [];

    setExternalContent(children) {
      this.#children = children;
    }

    render() {
      const vdom = render.call(this);
      if (didCreateSlot) {
        fillSlots(vdom, this.#children);
        resetDidCreateSlot();
      }
      return vdom;
    }

    constructor(props = {}, eventHandlers = {}, parentComponent = null) {
      this.props = props;
      this.state = state ? state(props) : {};
      this.#eventHandlers = eventHandlers;
      this.#parentComponent = parentComponent;
    }

    get elements() {
      if (this.#vdom == null) {
        return [];
      }

      if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
        return extractChildren(this.#vdom).flatMap((child) => {
          if (child.type === DOM_TYPES.COMPONENT) {
            return child.component.elements;
          }
          return [child.el];
        });
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

    updateProps(props) {
      const newProps = { ...this.props, ...props };

      if (equal(this.props, newProps)) {
        return;
      }

      this.props = newProps;
      this.#patch();
    }

    mount(hostEl, index = null) {
      if (this.#isMounted) {
        throw new Error("Component is already mounted");
      }
      this.#vdom = this.render();
      mountDOM(this.#vdom, hostEl, index, this);
      this.#wireEventHandlers();
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
      this.#subscriptions.forEach((unsubscribe) => unsubscribe());
      this.#vdom = null;
      this.#hostEl = null;
      this.#isMounted = false;
      this.#subscriptions = [];
    }

    #wireEventHandler(eventName, handler) {
      return this.#dispatcher.subscribe(eventName, (payload) => {
        if (this.#parentComponent) {
          handler.call(this.#parentComponent, payload);
        } else {
          handler(payload);
        }
      });
    }

    #wireEventHandlers() {
      this.#subscriptions = Object.entries(this.#eventHandlers).map(
        ([eventName, handler]) => {
          return this.#wireEventHandler(eventName, handler);
        }
      );
    }

    emit(eventName, payload) {
      this.#dispatcher.dispatch(eventName, payload);
    }
    onMounted() {
      return Promise.resolve(onMounted.call(this));
    }
    onUnmounted() {
      return Promise.resolve(onUnmounted.call(this));
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

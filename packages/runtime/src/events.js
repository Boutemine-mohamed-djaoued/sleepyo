export function addEventListeners(listeners = {}, el, hostComponent = null) {
  const addedListeneres = {};

  Object.entries(listeners).forEach(([eventName, handler]) => {
    const listener = addEventListener(eventName, handler, el, hostComponent);
    addedListeneres[eventName] = listener;
  });
  return addedListeneres;
}

export function addEventListener(eventName, handler, el, hostComponent = null) {
  function boundHandler() {
    hostComponent
      ? handler.apply(hostComponent, arguments)
      : handler(...arguments);
  }

  el.addEventListener(eventName, boundHandler);

  return boundHandler;
}

export function removeEventListeners(listeners, el) {
  Object.entries(listeners).forEach(([eventName, handler]) => {
    el.removeEventListener(eventName, handler);
  });
}

export function addEventListeners(listeners = {},el){
  const addedListeneres = {}

  Object.entries(listeners).forEach(([eventName,handler])=>{
    const listener = addEventListener(eventName,handler,el)
    addedListeneres[eventName] = listener
  })

  return addedListeneres
}

export function addEventListener(eventName, handler, el) {
  console.log({el,eventName,handler})
  el.addEventListener(eventName, handler);
  return handler;
}


export function removeEventListeners(listeners, el) {
  Object.entries(listeners).forEach(([eventName, handler]) => {
    el.removeEventListener(eventName, handler);
  });
}

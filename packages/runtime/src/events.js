export function addEventListeners(listeners = {},el){
  const addedListeneres = {}

  Object.entries(listeners).forEach(([eventName,handler])=>{
    const listener = addEventListener(eventName,handler,el)
    addedListeneres[eventName] = listener
  })

  return addedListeneres
}

export function addEventListener(eventName, handler, el) {
  el.addEventListener(eventName, handler);
  return handler;
}

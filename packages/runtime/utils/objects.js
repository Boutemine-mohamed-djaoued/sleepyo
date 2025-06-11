export function objectsDiff(oldObj = {}, newObj = {}) {
  const oldKeys = Object.keys(oldObj);
  const newKeys = Object.keys(newObj);

  return {
    added: newKeys.filter((key) => !oldKeys.includes(key)),
    removed: oldKeys.filter((key) => !newKeys.includes(key)),
    updated: newKeys.filter(
      (key) => oldKeys.includes(key) && oldObj[key] !== newObj[key]
    ),
  };
}

export function hasOwnPropery(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

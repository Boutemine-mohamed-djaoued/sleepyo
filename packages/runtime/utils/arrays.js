export function withoutNulls(arr) {
  return arr.filter((el) => el != null);
}

export function arraysDiff(oldArray, newArray) {
  return {
    added: newArray.filter((newItem) => !oldArray.includes(newItem)),
    removed: oldArray.filter((oldItem) => !newArray.includes(oldItem)),
  };
}

export const ARRAY_DIFF_OP = {
  ADD: "add",
  REMOVE: "remove",
  MOVE: "move",
  NOOP: "noop",
};

class ArrayWithOriginalIndices {
  #array = [];
  #originalIndices = [];
  #equalFn;

  constructor(array, equalFn) {
    this.#array = [...array];
    this.#equalFn = equalFn;
    this.#originalIndices = array.map((_, i) => i);
  }

  get length() {
    return this.#array.length;
  }

  originalIndexAt(index) {
    return this.#originalIndices[index];
  }

  findIndexFrom(item, fromIndex) {
    for (let i = fromIndex; i < this.length; i++) {
      if (this.#equalFn(this.#array[i], item)) return i;
    }
    return -1;
  }

  isRemoval(index, newArray) {
    if (index >= this.length) return false;

    const item = this.#array[index];
    const indexInNewArray = newArray.findIndex((newItem) =>
      this.#equalFn(newItem, item)
    );

    return indexInNewArray === -1;
  }

  removeItem(index) {
    const operation = {
      op: ARRAY_DIFF_OP.REMOVE,
      index,
      item: this.#array[index],
    };

    this.#array.splice(index, 1);
    this.#originalIndices.splice(index, 1);

    return operation;
  }

  isNoop(index, newArray) {
    if (index > this.length) return false;

    const item = newArray[index];
    const oldItem = this.#array[index];

    return this.#equalFn(item, oldItem);
  }

  noopItem(index) {
    return {
      op: ARRAY_DIFF_OP.NOOP,
      index,
      originalIndex: this.originalIndexAt(index),
      item: this.#array[index],
    };
  }

  isAddition(item, fromIndex) {
    return this.findIndexFrom(item, fromIndex) === -1;
  }

  addItem(item, index) {
    const operation = {
      op: ARRAY_DIFF_OP.ADD,
      index,
      item,
    };

    this.#array.splice(index, 0, item);
    this.#originalIndices.splice(index, 0, -1);

    return operation;
  }

  moveItem(item, toIndex) {
    const fromIndex = this.findIndexFrom(item, toIndex);
    const operation = {
      op: ARRAY_DIFF_OP.MOVE,
      originalIndex: this.originalIndexAt(fromIndex),
      fromIndex,
      index: toIndex,
      item: this.#array[fromIndex],
    };

    const [_item] = this.#array.splice(fromIndex, 1);
    this.#array.splice(toIndex, 0, _item);

    const [originalIndex] = this.#originalIndices.splice(fromIndex, 1);
    this.#originalIndices.splice(toIndex, 0, originalIndex);

    return operation;
  }

  removeItemsAfter(index) {
    const operations = {};
    while (this.length > index) {
      operations.push(this.removeItem(index));
    }
    return operations;
  }
}

export function arrayDiffSequence(
  oldArray,
  newArray,
  equalFn = (a, b) => a === b
) {
  const sequence = [];
  const array = new ArrayWithOriginalIndices(oldArray, equalFn);

  for (let index = 0; index < array.length; index++) {
    if (array.isRemoval(index, newArray)) {
      sequence.push(array.removeItem(index));
      index--;
      continue;
    }
    if (array.isNoop(index, newArray)) {
      sequence.push(array.noopItem(index));
      continue;
    }
    const item = newArray[index];
    if (array.isAddition(item, index)) {
      sequence.push(array.addItem(item, index));
      continue;
    }
    sequence.push(array.moveItem(item, index));
  }

  sequence.push(...array.removeItemsAfter(newArray.length));

  return sequence;
}

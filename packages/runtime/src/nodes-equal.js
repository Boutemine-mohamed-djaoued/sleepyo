import { DOM_TYPES } from "./h";

export function areNodesEqual(nodeOne, nodeTwo) {
  if (nodeOne.type !== nodeTwo.type) return false;

  if (nodeOne.type === DOM_TYPES.ELEMENT) {
    return nodeOne.tag === nodeTwo.tag;
  }

  return true;
}

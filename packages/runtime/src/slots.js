import { DOM_TYPES, hFragment } from "./h";
import { traverseDFS } from "./traverse-dom";

export function fillSlots(vdom, externalCotent = []) {
  function processNode(node, parent, index) {
    insertViewInSlot(node, parent, index, externalCotent);
  }

  traverseDFS(vdom, shoudlSkipBranch, processNode);
}

function insertViewInSlot(node, parent, index, externalCotent) {
  if (node.type !== DOM_TYPES.SLOT) {
    return;
  }

  const defaultContent = node.children;

  const views = externalCotent.length > 0 ? externalCotent : defaultContent;

  const hasContent = views.length > 0;

  if (hasContent) {
    parent.children.splice(index, 1, hFragment(views));
  } else {
    parent.children.splice(index, 1);
  }
}

function shoudlSkipBranch(vdom) {
  return vdom.type === DOM_TYPES.COMPONENT;
}

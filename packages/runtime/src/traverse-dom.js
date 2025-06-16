import { DOM_TYPES } from "./h";

export function traverseDFS(
  vdom,
  shoudlSkipBranch = () => false,
  processNode,
  parentNode = null,
  index = null
) {
  if (shoudlSkipBranch(vdom)) return;

  processNode(vdom, parentNode, index);

  if (vdom.children) {
    vdom.children.forEach((child, i) => {
      traverseDFS(child, shoudlSkipBranch, processNode, vdom, i);
    });
  }
}

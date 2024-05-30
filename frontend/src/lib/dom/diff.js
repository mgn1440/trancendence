import { createElement } from "./client";

const diff = (vOldNode, vNewNode) => {
  if (vNewNode === undefined || vNewNode === null) {
    // if new node is undefined, remove the old node
    return ($node) => {
      $node.remove();
      return undefined;
    };
  }

  if (
    typeof vOldNode === "string" ||
    typeof vNewNode === "string" ||
    typeof vOldNode === "number" ||
    typeof vNewNode === "number"
  ) {
    // if more than one of the nodes is a string
    if (vOldNode !== vNewNode) {
      console.log("vOldNode", vOldNode, vNewNode);
      // if the strings are different, replace
      return ($node) => {
        const $newNode = createElement(vNewNode);
        $node.replaceWith($newNode);
        return $newNode;
      };
    } else {
      // if the strings are the same, do nothing
      return ($node) => $node;
    }
  }

  if (vOldNode.type !== vNewNode.type) {
    // if the tags are different, replace
    return ($node) => {
      const $newNode = createElement(vNewNode);
      $node.replaceWith($newNode);
      return $newNode;
    };
  }

  const patchAttrs = diffAttrs(vOldNode.props, vNewNode.props);
  const patchChildren = diffChildren(vOldNode.children, vNewNode.children);

  return ($node) => {
    patchAttrs($node);
    patchChildren($node);
    return $node;
  };
};

const diffAttrs = (oldAttrs, newAttrs) => {
  const patches = [];

  if (newAttrs) {
    for (const [k, v] of Object.entries(newAttrs)) {
      // push into
      patches.push(($node) => {
        // push newAttrs into patches
        $node.setAttribute(k, v);
        return $node;
      });
    }
  }

  for (const k in oldAttrs) {
    if (!(k in newAttrs)) {
      patches.push(($node) => {
        // delete props
        $node.removeAttribute(k);
        return $node;
      });
    }
  }

  return ($node) => {
    for (const patch of patches) {
      patch($node);
    }
    return $node;
  };
};

const diffChildren = (vOldChildren, vNewChildren) => {
  const childPatches = [];
  vOldChildren.forEach((vOldChild, i) => {
    childPatches.push(diff(vOldChild, vNewChildren[i]));
  });

  const additionalPatches = [];
  for (const additionalChild of vNewChildren.slice(vOldChildren.length)) {
    additionalPatches.push(($node) => {
      $node.appendChild(createElement(additionalChild));
      return $node;
    });
  }

  return ($parent) => {
    for (const [patch, child] of zip(childPatches, $parent.childNodes)) {
      patch(child);
    }

    for (const patch of additionalPatches) {
      patch($parent);
    }
    return $parent;
  };
};

const zip = (xs, ys) => {
  const zipped = [];
  for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
    zipped.push([xs[i], ys[i]]);
  }
  return zipped;
};

export default diff;

import { createElement } from "./client";

const diffTextVDOM = (newVDOM, currentVDOM) => {
  if (
    (typeof newVDOM === "string" && typeof currentVDOM === "string") ||
    (typeof newVDOM === "number" && typeof currentVDOM === "number") ||
    (typeof newVDOM === "string" && typeof currentVDOM === "number") ||
    (typeof newVDOM === "number" && typeof currentVDOM === "string")
  ) {
    return true;
  }
  // if (newVDOM === currentVDOM) return false;
  return false;
};

const updateElement = (parent, newVDOM, currentVDOM, index = 0) => {
  let removeIndex;
  const hasOnlyCurrentVDOM =
    (newVDOM === null || newVDOM === undefined) &&
    currentVDOM !== null &&
    currentVDOM !== undefined;

  const hasOnlyNewVDOM =
    (currentVDOM === null || currentVDOM === undefined) &&
    newVDOM !== null &&
    newVDOM !== undefined;

  if (parent.childNodes) {
    if (hasOnlyCurrentVDOM) {
      parent.removeChild(parent.childNodes[index]);
      return index;
    }
  }

  if (hasOnlyNewVDOM) {
    parent.appendChild(createElement(newVDOM));
    return;
  }

  // if (diffTextVDOM(newVDOM, currentVDOM)) {
  if (diffTextVDOM(newVDOM, currentVDOM) && newVDOM != currentVDOM) {
    parent.replaceChild(createElement(newVDOM), parent.childNodes[index]);
    return;
  }

  if (
    (typeof newVDOM === "number" || typeof newVDOM === "string") &&
    (typeof currentVDOM === "number" || typeof currentVDOM === "string")
  )
    return;
  if (!newVDOM || !currentVDOM) return;
  if (newVDOM.type !== currentVDOM.type) {
    parent.replaceChild(createElement(newVDOM), parent.childNodes[index]);
    return;
  }

  updateAttributes(
    parent.childNodes[index],
    newVDOM.props ?? {},
    currentVDOM.props ?? {}
  );

  const maxLength = Math.max(
    newVDOM.children.length,
    currentVDOM.children.length
  );

  for (let i = 0; i < maxLength; i++) {
    const _removeIndex = updateElement(
      parent.childNodes[index],
      newVDOM.children[i],
      currentVDOM.children[i],
      removeIndex ?? i
    );
    removeIndex = _removeIndex;
  }
};

const updateAttributes = (target, newProps, currentProps) => {
  for (const [attr, value] of Object.entries(newProps)) {
    if (currentProps[attr] !== newProps[attr])
      // target.setAttribute(attr, value);
      target[attr] = value;
  }

  for (const attr of Object.keys(currentProps)) {
    if (newProps[attr] !== undefined) continue;
    if (attr.startsWith("on")) {
      // target.setAttribute(attr, null);
      target[attr] = null;
    } else if (attr.startsWith("class")) {
      target.removeAttribute("class");
    } else {
      target.removeAttribute(attr);
    }
  }
};

export { updateElement };

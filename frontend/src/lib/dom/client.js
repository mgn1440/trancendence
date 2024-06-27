const createElement = (node) => {
  if (node === null || node === undefined) {
    return document.createDocumentFragment();
  }
  if (typeof node === "string" || typeof node === "number") {
    return document.createTextNode(String(node));
  }

  const isFragment = node.type === "fragment";
  if (isFragment) {
    return document.createDocumentFragment();
  }

  const element = document.createElement(node.type);
  Object.entries(node.props || {}).forEach(([attr, value]) => {
    if (attr.startsWith("data-")) {
      // element.dataset[attr] = value;
      element.setAttribute(attr, value);
    } else {
      if (attr === "onclick") {
        element.onclick = value;
      } else if (attr === "onchange") {
        element.onchange = value;
      } else {
        // element.dataset[attr] = value;
        element.setAttribute(attr, value);
      }
    }
  });

  node.children.forEach((child) => element.appendChild(createElement(child)));

  return element;
};

export { createElement };

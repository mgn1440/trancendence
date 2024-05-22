const createElement = (node) => {
  if (node === null || node === undefined) {
    return document.createDocumentFragment();
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(String(node));
  }

  const isFragment = node.type === 'fragment';
  if (isFragment) {
    return document.createDocumentFragment();
  }

  const element = document.createElement(node.type);
  Object.entries(node.props || {}).forEach(([attr, value]) => {
    if (attr.startsWith('data-')) {
      element.setAttribute(attr.slice(5), value);
    }
    else {
      element.setAttribute(attr, value);
    }
  });

  node.children.forEach((child) => element.appendChild(createElement(child)));

  return element;
}

export { createElement };
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
    // console.log(`attr: ${attr}, value: ${value}`);
    if (attr.startsWith('data-')) {
      element.setAttribute(attr, value);
      // element.dataset[attr.slice(5)] = value;
    }
    else {
      element.setAttribute(attr, value);
    }
  });

  node.children.forEach((child) => element.appendChild(createElement(child)));

  return element;
}

export { createElement };
export const VNode = null;
export const VDOM = {
  type: null,
  props: null,
  children: [],
};

export const createElement = (type, props, ...children) => {
  if (typeof type === "function") {
    return type({ ...props, children });
  }
  return { type: type, props, children: children.flat() };
};

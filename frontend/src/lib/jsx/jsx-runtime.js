export const VNode = null;
export const VDOM = {
  type: null,
  props: null,
  children: [],
} 
export const h = (component, props, ...children) => {
  if (typeof component === "function") {
    return component({ ...props, children });
  }
  return {
      type: component.toString(),
      props,
      children: children.flat(),
  }
};
export const VNode = null;
export const VDOM = {
  type: null,
  props: null,
  children: [],
};

export let currentComponent = null;

export const setCurrentComponent = (component) => {
  currentComponent = component;
};

export const h = (component, props, ...children) => {
  if (typeof component === "function") {
    currentComponent = component.name;
    return component({ ...props, children });
  }
  return {
    type: component.toString(),
    props,
    children: children.flat(),
  };
};

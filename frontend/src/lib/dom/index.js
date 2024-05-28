import updateElement from "./diff";
import { shallowEqual } from "./utils/object";
import { createElement } from "./client";

const frameRunner = (callback) => {
  let requestId;
  return () => {
    requestId && cancelAnimationFrame(requestId);
    requestId = requestAnimationFrame(callback);
  };
};

const domRenderer = () => {
  const options = {
    states: [],
    stateHook: 0,
    dependencies: [],
    effectHook: 0,
    effectList: [],
  };
  const renderInfo = {
    $root: null,
    component: null,
    currentVDOM: null,
  };

  const resetOptions = () => {
    options.states = [];
    options.stateHook = 0;
    options.dependencies = [];
    options.effectHook = 0;
    options.effectList = [];
  };

  const _render = frameRunner(() => {
    const { $root, component, currentVDOM } = renderInfo;
    if (!$root || !component) return;

    const newVDOM = component();
    while ($root.firstChild) $root.removeChild($root.firstChild);
    $root.appendChild(createElement(newVDOM));
    // if (!currentVDOM) {
    //   $root.replaceWith(createElement(newVDOM));
    //   // first render
    // } else {
    //   console.log(currentVDOM, newVDOM);
    //   const patch = updateElement(currentVDOM, newVDOM);
    //   console.log(patch);
    //   patch($root);
    // }
    options.stateHook = 0;
    options.effectHook = 0;
    renderInfo.currentVDOM = newVDOM;

    options.effectList.forEach((effect) => effect());
    options.effectList = [];
  });

  const render = (root, component) => {
    console.log("render");
    resetOptions();
    renderInfo.$root = root;
    renderInfo.component = component;
    _render();
  };

  const useState = (initialState) => {
    const { stateHook: index, states } = options;
    if (states.length === index) states.push(initialState);
    const state = states[index];
    const setState = (newState) => {
      // console.log(options.states); // debug
      if (shallowEqual(state, newState)) return;
      states[index] = newState;
      // queueMicrotask(_render);
      _render();
    };
    options.stateHook += 1;
    return [state, setState];
  };

  const useEffect = (callback, dependencies) => {
    const index = options.effectHook;
    options.effectList[index] = () => {
      const hasNoDeps = !dependencies;
      const prevDeps = options.dependencies[index];
      const hasChangedDeps = prevDeps
        ? dependencies?.some((deps, i) => !shallowEqual(deps, prevDeps[i]))
        : true;

      if (hasNoDeps || hasChangedDeps) {
        options.dependencies[index] = dependencies;
        callback();
      }
    };
    options.effectHook += 1;
  };

  return { useState, useEffect, render };
};
export const { useState, useEffect, render } = domRenderer();

import { updateElement } from "./diff";
import { shallowEqual } from "./utils/object";

const frameRunner = (callback) =>{
  let requestId;
  return () =>{
    requestId && cancelAnimationFrame(requestId);
    requestId = requestAnimationFrame(callback);
  }
}

const domRenderer = () => {
  const options = {
    states: [],
    stateHook: 0,
    dependencies: [],
    effectList: [],
    effectHook: 0,
    refs: [],
    refHook: 0,
  }
  const renderInfo = {
    $root: null,
    component: null,
    currentVDOM: null,
  }

  const resetOptions = () => {
    options.states = [];
    options.stateHook = 0;
    options.dependencies = [];
    options.effectList = [];
    options.effectHook = 0;
    options.refs = [];
    options.refHook = 0;
  }

  const _render = frameRunner(() => {
    const { $root, component, currentVDOM } = renderInfo;
    if (!$root || !component) return;

    const newVDOM = component();
    updateElement($root, newVDOM, currentVDOM);
    options.stateHook = 0;
    options.effectHook = 0;
    options.refHook = 0;
    renderInfo.currentVDOM = newVDOM;

    options.effectList.forEach((effect) => effect());
    options.effectList = [];
  });

  const render = (root, component) => {
    resetOptions();
    renderInfo.$root = root;
    renderInfo.component = component;
    _render();
  }

  const useState = (initialState) => {
    const { stateHook: index, states } = options;
    const state = (states[index] ?? initialState);
    const setState = (newState) => {
      if (shallowEqual(state, newState)) return;
      states[index] = newState;
      // queueMicrotask(_render);
      _render();
    }
    options.stateHook += 1;
    return [state, setState];
  }

  const useEffect = (callback, dependencies) => {
    const index = options.effectHook;
    options.effectList[index] = () => {
      const hasNoDeps = !dependencies;
      const prevDeps = options.dependencies[index];
      const hasChangedDeps = prevDeps ? dependencies?.some((deps, i) => !shallowEqual(deps, prevDeps[i])) : true;

      if (hasNoDeps || hasChangedDeps) {
        options.dependencies[index] = dependencies;
        callback();
      }
    }
    options.effectHook += 1;
  }

  const useRef = (initialValue) => {
    const { refHook: index, refs } = options;
    refs[index] = refs[index] ?? initialValue;
    options.refHook += 1;
    return refs[index];
  }

  return { useState, useEffect, useRef, render };
}
export const { useState, useEffect, useRef, render } = domRenderer();
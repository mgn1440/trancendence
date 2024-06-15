import { updateElement } from "./diff";
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
    refs: [],
    refHook: 0,
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
    options.refs = [];
    options.refHook = 0;
    options.dependencies = [];
    options.effectHook = 0;
    options.effectList = [];
  };

  const _render = frameRunner(() => {
    const { $root, component, currentVDOM } = renderInfo;
    if (!$root || !component) return;

    const newVDOM = component();
    // 통째로 다 바꾸는 방법
    // while ($root.firstChild) $root.removeChild($root.firstChild);
    // $root.appendChild(createElement(newVDOM));
    updateElement($root, newVDOM, currentVDOM);
    renderInfo.currentVDOM = newVDOM;
    options.stateHook = 0;
    options.refHook = 0;
    options.effectHook = 0;

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
      // TODO: diff알고리즘과 shallowEqual 함수 객체일 때 제대로 확인이 안되는 문제 발생 => 재정비 필요
      // 문제 발생 시 shallowEqual 함수를 주석처리하시오
      if (shallowEqual(state, newState)) return;
      states[index] = newState;
      // queueMicrotask(_render);
      _render();
    };
    options.stateHook += 1;
    return [state, setState];
  };

  const useRef = (initialState) => {
    const { refHook: index, refs } = options;
    if (refs.length === index) refs.push(initialState);
    const getRef = () => refs[index];
    const setRef = (newRef) => {
      // TODO: Create Room 안되는 문제
      // if (shallowEqual(getRef(), newRef)) return;
      refs[index] = newRef;
    };
    options.refHook += 1;
    // console.log(refs);
    return [getRef, setRef];
    // return { current: refs[index] };
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

  return { useState, useEffect, useRef, render };
};
export const { useState, useEffect, useRef, render } = domRenderer();

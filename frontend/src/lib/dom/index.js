import { updateElement } from "./diff";
import { shallowEqual } from "./utils/object";
import { createElement } from "./client";
import { currentComponent, setCurrentComponent } from "@/lib/jsx/jsx-runtime";
import { disconnectGameLogicWebSocket } from "@/store/gameLogicWS";

const frameRunner = (callback) => {
  let requestId;
  return () => {
    requestId && cancelAnimationFrame(requestId);
    requestId = requestAnimationFrame(callback);
  };
};
const domRenderer = () => {
  const options = {
    states: {},
    stateHook: {},
    refs: {},
    refHook: {},
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
    options.states = {};
    options.stateHook = {};
    options.refs = {};
    options.refHook = {};
    options.dependencies = [];
    options.effectHook = 0;
    options.effectList = [];
  };

  const _render = frameRunner(() => {
    console.log("_render");
    const { $root, component, currentVDOM } = renderInfo;
    if (!$root || !component) return;

    setCurrentComponent(component.name);
    const newVDOM = component();
    // 통째로 다 바꾸는 방법
    // while ($root.firstChild) $root.removeChild($root.firstChild);
    // $root.appendChild(createElement(newVDOM));
    updateElement($root, newVDOM, currentVDOM);
    renderInfo.currentVDOM = newVDOM;
    options.stateHook = {};
    options.refHook = {};
    options.effectHook = 0;

    options.effectList.forEach((effect) => effect());
    options.effectList = [];
  });

  const render = (root, component) => {
    console.log("render");
    resetOptions();
    renderInfo.$root = root;
    renderInfo.component = component;
    disconnectGameLogicWebSocket();
    _render();
  };

  const useState = (initialState) => {
    const { stateHook, states } = options;
    const component = currentComponent;
    if (!stateHook[component]) {
      stateHook[component] = 0;
    }
    // console.log("states", states[component]); // debug
    if (states[component] === undefined) {
      states[component] = [];
    }
    const index = stateHook[component];
    if (states[component].length === index)
      states[component].push(initialState);
    const state = states[component][index];
    // console.log("useState", component, initialState, states[component], state); // debug
    const setState = (newState) => {
      // console.log(options.states); // debug
      // TODO: diff알고리즘과 shallowEqual 함수 객체일 때 제대로 확인이 안되는 문제 발생 => 재정비 필요
      // 문제 발생 시 shallowEqual 함수를 주석처리하시오
      if (shallowEqual(state, newState)) return;
      // console.log("shallowEqual Passed"); // debug
      states[component][index] = newState;
      // queueMicrotask(_render);
      // console.log(
      //   "setState",
      //   component,
      //   states[component],
      //   states[component][index]
      // );
      _render();
    };
    options.stateHook[component] += 1;
    return [state, setState];
  };

  const useRef = (initialState) => {
    const { refHook, refs } = options;
    const component = currentComponent;
    if (!refHook[component]) {
      refHook[component] = 0;
    }
    if (!refs[component]) {
      refs[component] = [];
    }
    const index = refHook[component];
    if (refs.length === index) refs[component].push(initialState);
    const getRef = () => refs[component][index];
    const setRef = (newRef) => {
      // TODO: Create Room 안되는 문제
      // console.log("before shallowEqual", getRef(), newRef); // debug
      if (shallowEqual(getRef(), newRef)) return;
      // console.log("shallowEqual Passed"); // debug
      refs[component][index] = newRef;
    };
    options.refHook[component] += 1;
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

import { createElement } from "./client";

const diffTextVDOM = (newVDOM, currentVDOM) => {
  // if (
  //   (typeof newVDOM === "string" && typeof currentVDOM === "string") ||
  //   (typeof newVDOM === "number" && typeof currentVDOM === "number") ||
  //   (typeof newVDOM === "string" && typeof currentVDOM === "number") ||
  //   (typeof newVDOM === "number" && typeof currentVDOM === "string")
  // ) {
  if (
    (typeof newVDOM === "number" || typeof newVDOM === "string") &&
    (typeof currentVDOM === "number" || typeof currentVDOM === "string")
  ) {
    return true;
  }
  // if (newVDOM === currentVDOM) return false;
  return false;
};

const updateElement = (parent, newVDOM, currentVDOM, index = 0) => {
  // let removeIndex;
  let removeIndex = 0;
  const hasOnlyCurrentVDOM =
    (newVDOM === null || newVDOM === undefined) &&
    currentVDOM !== null &&
    currentVDOM !== undefined;

  const hasOnlyNewVDOM =
    (currentVDOM === null || currentVDOM === undefined) &&
    newVDOM !== null &&
    newVDOM !== undefined;

  // 새로운 VDOM이 없으면 기존 VDOM을 삭제
  if (parent.childNodes) {
    if (hasOnlyCurrentVDOM) {
      parent.removeChild(parent.childNodes[index]);
      return index;
    }
  }

  // 새로운 VDOM만 있으면 기존 VDOM을 삭제할 필요 없이 새로운 VDOM 추가
  if (hasOnlyNewVDOM) {
    parent.appendChild(createElement(newVDOM));
    return;
  }

  // 둘 다 텍스트 노드(Strig, Number)이면서
  if (diffTextVDOM(newVDOM, currentVDOM)) {
    // 값이 다르면 서로 바꾸고
    if (String(newVDOM) !== String(currentVDOM)) {
      parent.replaceChild(createElement(newVDOM), parent.childNodes[index]);
    }
    // 반환
    return;
  }

  // 둘 중에 하나라도 비어있으면 반환
  if (!newVDOM || !currentVDOM) return;

  // 타입이 다르면 새로운 VDOM으로 교체
  if (
    newVDOM.type !== currentVDOM.type
    // newVDOM.type !== parent.childNodes[index].tagName.toLowerCase()
  ) {
    parent.replaceChild(createElement(newVDOM), parent.childNodes[index]);
    return;
  }

  // 타입이 같으면 속성 비교
  updateAttributes(
    parent.childNodes[index],
    newVDOM.props ?? {},
    currentVDOM.props ?? {}
  );

  const maxLength = Math.max(
    newVDOM.children.length,
    currentVDOM.children.length
  );

  for (let i = 0; i < maxLength; i++) {
    const _removeIndex = updateElement(
      parent.childNodes[index],
      newVDOM.children[i],
      currentVDOM.children[i],
      i - removeIndex
    );
    // removeIndex = _removeIndex;
    removeIndex += typeof _removeIndex === "number" ? 1 : 0;
    // console.log("removeIndex", _removeIndex, removeIndex); // debug(important!!)
  }
};

const sameFunction = (foo1, foo2) => {
  if (typeof foo1 !== "function" || typeof foo2 !== "function") return false;
  return foo1.toString() === foo2.toString();
};

const sameObject = (obj1, obj2) => {
  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

const updateAttributes = (target, newProps, currentProps) => {
  // 새로운 속성 중 기존 속성과 다른 것만 업데이트
  for (const [attr, value] of Object.entries(newProps)) {
    if (
      // sameFunction(currentProps[attr], newProps[attr]) ||
      // sameObject(currentProps[attr], newProps[attr]) ||
      currentProps[attr] === newProps[attr]
    )
      continue;
    if (attr === "onclick") {
      target.onclick = value;
    } else if (attr === "onchange") {
      target.onchange = value;
    } else {
      target.setAttribute(attr, value);
      // target[attr] = value;
    }
    // console.log("attr", attr, "value", value, "target", target);
  }

  // TODO: onclick, onchange 이외에도 on event는 추가해 줘야 함
  // 기존 속성 중 새로운 속성에 없는 것은 삭제
  for (const attr of Object.keys(currentProps)) {
    if (newProps[attr] !== undefined) continue;
    // if (attr.startsWith("on")) {
    //   // target.setAttribute(attr, null);
    //   target[attr] = null;
    if (attr === "onclick") {
      target.onclick = null;
    } else if (attr === "onchange") {
      target.onchange = null;
    } else if (attr.startsWith("class")) {
      target.removeAttribute("class");
    } else {
      target.removeAttribute(attr);
    }
  }
};

export { updateElement };

const shallowEqual = (obj1, obj2) => {
  if (Object.is(obj1, obj2)) {
    return true;
  }

  // null 처리 및 객체 타입 확인
  if (
    obj1 === null ||
    obj2 === null ||
    typeof obj1 !== "object" ||
    typeof obj2 !== "object"
  ) {
    return false;
  }

  const keysA = Reflect.ownKeys(obj1); // Object.keys 대신 Reflect.ownKeys 사용으로 심볼 속성 포함
  const keysB = Reflect.ownKeys(obj2);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(obj2, keysA[i]) ||
      !Object.is(obj1[keysA[i]], obj2[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
};

export { shallowEqual };

const shallowEqual = (obj1, obj2) => {  
  if (Object.is(obj1, obj2))
    return true;
  // TODO: obj1, obj2가 null인 경우 처리 생각해보기
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' ||
      typeof obj1 === null || typeof obj2 === null)
    return false;

    const keysA = Object.keys(obj1);
    const keysB = Object.keys(obj2);

    if (keysA.length !== keysB.length)
      return false;
    for (let i = 0; i < keysA.length; i++) {
      if (!Object.hasOwnProperty.call(obj2, keysA[i]) || 
          !Object.is(obj1[keysA[i]], obj2[keysA[i]]))
        return false;
    }
    return true;
}

export { shallowEqual };
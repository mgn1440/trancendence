import { shallowEqual } from "./src/lib/dom/utils/object";

const parcelElement = () => {
  console.log("parcelElement");
  const parcelElement = document.getElementById("app");
  parcelElement.innerHTML = "Parcel Element";
};

parcelElement();

const logicalTest = () => {
  console.log(shallowEqual(1, 1));
  console.log(shallowEqual(1, 2));
  console.log(shallowEqual([1, 2], [1, 2]));
  console.log(shallowEqual([1], [1, 2]));
  console.log(shallowEqual({ key: 1 }, { key: 1, key: 2 }));
};

logicalTest();

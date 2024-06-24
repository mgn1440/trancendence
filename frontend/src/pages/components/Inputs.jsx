import { useState, useEffect, useRef } from "@/lib/dom";

export const InputBox = (props) => {
  return (
    <div class="input body-element">
      <h6>{props.text}</h6>
      <input type={props.type} placeholder={props.defaultValue} />
    </div>
  );
};

export const RadioCheck = (props) => {
  const toggleInputFields = () => {
    const radios = document.querySelectorAll("input[type=radio]");
    const inputs = document.querySelectorAll("input[type=text]");
    if (radios[0].checked) {
      inputs[1].disabled = true;
      inputs[1].value = "";
    } else {
      inputs[1].disabled = false;
      inputs[1].focus();
    }
  };
  return (
    <div class="form-check">
      <input
        class="form-check-input"
        type="radio"
        name={props.name}
        id={props.id}
        tabIndex="-1"
        onchange={toggleInputFields}
      />
      <label class="form-check-label" for={props.id}>
        {props.text}
      </label>
    </div>
  );
};

export const ToggleBtn = (props) => {
  return (
    <label class="toggle-button">
      <input type="checkbox" />
      <div class="toggle-text">{props.text}</div>
    </label>
  );
};

export const NumberStepper = (props) => {
  let isHolding = false;
  let modifier = 0;
  let cnt = 0;
  let delay = 100;
  const updateNumber = () => {
    const numberDisplay = document.getElementById("Number");
    if (isHolding) {
      numberDisplay.innerText = parseInt(numberDisplay.innerText) + modifier;
      cnt++;
      if (cnt > 10) {
        delay = 50;
      }
      if (parseInt(numberDisplay.innerText) < 1) {
        numberDisplay.innerText = 1;
      }
      if (parseInt(numberDisplay.innerText) > 30) {
        numberDisplay.innerText = 30;
      }
      setTimeout(() => {
        if (isHolding) requestAnimationFrame(updateNumber);
      }, delay);
    }
  };

  const startHolding = (mod) => {
    if (!isHolding) {
      isHolding = true;
      modifier = mod;
      requestAnimationFrame(updateNumber);
    }
  };

  const stopHolding = () => {
    isHolding = false;
    delay = 100;
    cnt = 0;
  };

  useEffect(() => {
    const increaseButton = document.getElementById("Increase");
    const decreaseButton = document.getElementById("Decrease");
    increaseButton.addEventListener("mousedown", () => startHolding(1));
    increaseButton.addEventListener("mouseup", stopHolding);
    increaseButton.addEventListener("mouseleave", stopHolding);
    increaseButton.addEventListener("touchstart", () => startHolding(1));
    increaseButton.addEventListener("touchend", stopHolding);

    decreaseButton.addEventListener("mousedown", () => startHolding(-1));
    decreaseButton.addEventListener("mouseup", stopHolding);
    decreaseButton.addEventListener("mouseleave", stopHolding);
    decreaseButton.addEventListener("touchstart", () => startHolding(-1));
    decreaseButton.addEventListener("touchend", stopHolding);
  }, []);
  return (
    <div>
      <div class="stepper-text">{props.text}</div>
      <div class={props.type}>
        <button class="mod-btn" id="Decrease">
          -
        </button>
        <div id="Number">{props.defaultValue}</div>
        <button class="mod-btn" id="Increase">
          +
        </button>
      </div>
    </div>
  );
};

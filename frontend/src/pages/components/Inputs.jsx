import { useEffect } from "@/lib/dom";

export const InputBox = (props) => {
  return (
    <div class="input body-element">
      <h6>{props.text}</h6>
      <input type="text" placeholder={props.defaultValue} />
    </div>
  );
};

export const RadioCheck = (props) => {
  useEffect (() => {
    const modalElement = document.getElementById("CreateRoomModal");
    const radios = modalElement.querySelectorAll("input[type=radio]");
    radios[0].checked = true;
    radios[2].checked = true;
  }, []);

  const toggleInputFields = () => {
    const radios = document.querySelectorAll("input[type=radio]");
    const inputs = document.querySelectorAll("input[type=text]");
    if (radios[0].checked) {
      inputs[1].disabled = true;
      inputs[1].value = "";
    } else {
      inputs[1].disabled = false;
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

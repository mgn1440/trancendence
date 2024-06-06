export const InputBox = (props) => {
  return (
    <div class="input body-element">
      <h6>{props.text}</h6>
      <input type="text" />
    </div>
  );
}

export const RadioCheck = (props) => {
  return (
    <div class="form-check" >
      <input
        class="form-check-input"
        type="radio"
        name={props.name}
        id={props.id}
        tabIndex="-1"
      />
      <label class="form-check-label" for={props.id}>
        {props.text}
      </label>
    </div>
  );
}
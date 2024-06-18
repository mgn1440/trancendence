const ItemInput = (props) => {
  return (
    <div class="item">
      <h6>{props.ItemName}</h6>
      <input type="text" placeholder={props.defaultValue}></input>
    </div>
  );
};

const ItemToggle = (props) => {
  return (
    <div class="item">
      <h6>{props.ItemName}</h6>
      <div class="toggle">
        <label class="switch">
          {props.isOn ? (
            <input type="checkbox" checked />
          ) : (
            <input type="checkbox" />
          )}
          <span class="slider"></span>
        </label>
      </div>
    </div>
  );
};

export { ItemInput, ItemToggle };

const ItemInput = (props) => {
  return (
	<div class="item">
		<h6>{props.ItemName}</h6>
		<input type="text"></input>
	</div>
  );
};
const ItemToggle = (props) => {
  return (
    <div class="item">
      <h6>{props.ItemName}</h6>
	  <div class="toggle"></div>
    </div>
  );
};

export {ItemInput, ItemToggle};
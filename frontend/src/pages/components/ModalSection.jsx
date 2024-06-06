export const TitleSection = (props) => {
  return (
    <div class="modal-title">
      <div class="modal-title-text">
        <img src={props.IconPath}></img>
        <h3>{props.Title}</h3>
      </div>
      <div class="modal-title-close">
        <img src="/icon/close.svg" data-bs-dismiss="modal"></img>
      </div>
    </div>
  );
};

export const BottomSection = (props) => {
  return (
    <button
      class="small-btn"
      data-bs-dismiss="modal"
      onclick={props.ClickEvent}
    >
      {props.ButtonName}
    </button>
  );
};

export default TitleSection;

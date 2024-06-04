const Modal = (props) => {
  return (
    <div id={props.id} class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">{props.title ? props.title() : null}</div>
          <div class="modal-body">{props.body ? props.body() : null}</div>
          <div class="modal-footer">{props.footer ? props.footer() : null}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

import { useEffect, useState } from "@/lib/dom";
import Modal from "@/pages/components/Modal";
import { TitleSection, BottomSection } from "./components/ModalSection";

const TestPage = () => {
  const handleModal = () => {
    document.getElementById("exampleModal");
    let testmodal = new bootstrap.Modal(
      document.getElementById("exampleModal")
    );

    testmodal.show();
    // .addEventListener("show.bs.modal", function (event) {
    //   console.log("show.bs.modal");
    // });
  };
  return (
    <div>
      <button
        type="button"
        class="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
      >
        Launch demo modal
      </button>
      <button type="button" class="btn btn-primary" onclick={handleModal}>
        click me!
      </button>

      <div
        class="modal fade"
        id="exampleModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Modal title
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">...</div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="button" class="btn btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;

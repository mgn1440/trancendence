import { useState, useEffect } from "../lib/dom";

const TestModal = () => {
  return (
    <div
      class="modal fade"
      id="staticBackdrop"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="staticBackdropLabel">
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
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestPage = () => {
  const [count, setCount] = useState(0); // [state, setState
  const [chk, setChk] = useState(false);

  const handleModal = () => {
    if (chk === true) {
      console.log("modal open");
      $("#staticBackdrop").modal("show");
    }
  };

  return (
    <div>
      <TestModal />
      <button onclick={() => setCount(count + 1)}>click Me!</button>
      <p>{count}</p>
      <button
        class="btn btn-primary"
        style="margin-right: 0.5rem;"
        onclick={() => setChk(!chk)}
      >
        {chk.toString()}
      </button>
      <button type="button" class="btn btn-primary" onclick={handleModal}>
        Launch static backdrop modal
      </button>
      <div>
        <button
          class="btn btn-primary"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapseExample"
          aria-expanded="false"
          aria-controls="collapseExample"
        >
          Button with data-bs-target
        </button>
      </div>
      <div class="collapse collaspe-horizontal" id="collapseExample">
        Some placeholder content for the collapse component. This panel is
        hidden by default but revealed when the user activates the relevant
        trigger.
      </div>
      <p>
        <button
          class="btn btn-primary"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapseWidthExample"
          aria-expanded="false"
          aria-controls="collapseWidthExample"
        >
          Toggle width collapse
        </button>
      </p>
      <div style="min-height: 120px;">
        <div class="collapse collapse-horizontal" id="collapseWidthExample">
          <div class="card card-body" style="width: 300px;">
            This is some placeholder content for a horizontal collapse. It's
            hidden by default and shown when triggered.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;

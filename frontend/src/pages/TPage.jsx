import { useEffect, useState } from "@/lib/dom";
import Modal from "@/pages/components/Modal";
import { TitleSection, BottomSection } from "./components/ModalSection";

const TestPage = () => {
  function toggleInputFields() {
    const enableRadio = document.getElementById("enable");
    const textInput = document.getElementById("textInput");

    if (enableRadio.checked) {
      textInput.disabled = false;
    } else {
      textInput.disabled = true;
    }
  }
  return (
    <div>
      <div class="form-check">
        <input
          type="radio"
          id="enable"
          name="toggle"
          value="enable"
          onchange={toggleInputFields}
        />
        <label class="form-check-label" for="enable">
          Enable
        </label>
      </div>
      <div class="form-check">
        <input
          type="radio"
          id="disable"
          name="toggle"
          value="disable"
          onchange={toggleInputFields}
        />
        <label class="form-check-label" for="disable">
          Disable
        </label>
      </div>
      <input
        type="text"
        id="textInput"
        placeholder="This will be enabled or disabled"
      />
    </div>
  );
};

export default TestPage;

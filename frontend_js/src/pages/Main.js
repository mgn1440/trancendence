import { useEffect, useState } from "../lib/dom";
import { createElement } from "../lib/createElement";

const OTPInput = () => {
  return (
    createElement("input", { class: "m-2 text-center", type: "text", maxLength: "1" } )
  );
}

const OTP = ({ len }) => {
  let arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(createElement(OTPInput));
  }
  return (createElement("div", { class: "otp" }, ...arr));
}

const TwoFAModal = () => {
  return (
    createElement("div", { class: "modal fade", id: "twoFAModal", "data-bs-backdrop":"static", "data-bs-keyboard": "false", tabindex: "-1", "aria-labelledby":"twoFAModalLabel", "aria-hidden":"true"},
      createElement("div", { class: "modal-dialog" },
        createElement("div", { class: "modal-content" },
          createElement("div", { class: "modal-header" },
            createElement("h5", { class: "modal-title", id:"twoFAModalLabel" }, "2FA"),
            createElement("button", { type: "button", class: "btn-close btn-close-white", "data-bs-dismiss": "modal", "aria-label":"Close" })),
            // Q: difference between justify-content-center and align-items-center
          createElement("div", { class: "modal-body d-flex jusitfy-content-center align-items-center flex-column" },
            createElement(OTP, { len: 6 })),
          createElement("div", { class: "modal-footer" },
            createElement("a", { class: "mdSizeBtn", href:"/match", "data-link":true, "data-bs-dismiss": "modal" }, "Submit"),
            // createElement("button", { type: "button", class: "btn", "data-bs-dismiss": "modal" }, "Submit"),
          ))
    ))
  );
}

const MainPage = () => {

  return (
    createElement("div", null,
      createElement(TwoFAModal),
      createElement("div", { class: "d-flex justify-content-center align-items-center flex-column", style:"width: 100vw; height: 100vh;" },
        createElement("h1", { style: "font-size: 7vw;"  }, "TRAnscendence"),
        createElement("button", { type: "button", class: "mdSizeBtn btn", "data-bs-toggle": "modal", "data-bs-target": "#twoFAModal" }, "42 login"),
  )));
};

export default MainPage;

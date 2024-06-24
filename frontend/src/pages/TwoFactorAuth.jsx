import { useEffect, useState } from "../lib/dom";
import { createElement } from "../lib/createElement";
import { axiosVerfiyOTP } from "@/api/axios.custom";
import axios from "axios";
import { gotoPage } from "../lib/libft";

const isFull = (inputs) => {
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].value === "") {
      return false;
    }
  }
  return true;
};

const OTP = ({ len }) => {
  const VerifyOTP = async (inputs) => {
    inputs.forEach((input) => {
      input.classList.toggle("bg-gray30"); // css toggle
    });
    let ret = await axiosVerfiyOTP(
      Array.from(inputs)
        .map((input) => input.value)
        .join("")
    );
    if (ret.status === 200) {
      MoveToLobby();
    } else {
      setTimeout(() => {
        window.location.href = "/2fa";
      }, 1500);
    }
  };
  const MoveToLobby = () => {
    window.location.href = "/lobby";
  };
  useEffect(() => {
    const inputs = document.querySelectorAll(".otp .input");
    let backspacePressed = false;
    const blurEvent = (e) => {
      if ((e.target.value === "" && !backspacePressed) || isFull(inputs)) {
        if (!isResendClicked) {
          e.preventDefault();
          e.target.focus();
        }
        isResendClicked = false;
      }
      backspacePressed = false;
    };
    inputs[0].focus();
    inputs.forEach((input, index) => {
      input.addEventListener("input", async (e) => {
        const value = e.target.value;
        if (value != "") {
          if (value.match(/[^0-9]/g)) {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
            return;
          } else if (index !== len - 1) {
            inputs[index + 1].focus();
          } else if (isFull(inputs)) {
            VerifyOTP(inputs);
          }
        }
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
          backspacePressed = true;
          if (index > 0 && index !== len - 1) {
            inputs[index - 1].focus();
            inputs[index - 1].value = "";
          } else if (index === len - 1 && inputs[index].value === "") {
            inputs[index - 1].focus();
            inputs[index - 1].value = "";
          } else if (index === len - 1 && inputs[index].value !== "") {
            inputs[index].value = "";
            backspacePressed = false;
          }
        } else if (
          ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].includes(e.key) ||
          e // temp
        ) {
          backspacePressed = false;
        } else {
          e.preventDefault();
          backspacePressed = false;
        }
      });
      input.addEventListener("blur", blurEvent);
      input.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });
      input.addEventListener("paste", (e) => {
        let pastedData = e.clipboardData.getData("text");
        let pastedDatalen = pastedData.length;
        if (pastedData.match(/[^0-9]/g)) {
          e.preventDefault();
          return;
        }
        for (let i = 0; i < Math.min(pastedDatalen, 6); i++) {
          if (index + i >= 6) {
            break;
          }
          if (index + i !== 5) {
            inputs[index + i].removeEventListener("blur", blurEvent);
          }
          inputs[index + i].value = pastedData[i];
        }
        let foucusIndex = index + pastedDatalen;
        if (foucusIndex > 6) {
          foucusIndex = 6;
          VerifyOTP(inputs);
          return;
        }
        inputs[index + pastedDatalen - 1].addEventListener("blur", blurEvent);
        inputs[index + pastedDatalen - 1].focus();
      });
    });
  }, []);
  return (
    <div class="otp">
      {[...Array(parseInt(len))].map((n) => (
        <input class="input" maxlength="1" />
      ))}
    </div>
  );
};

const TwoFactorAuthPage = () => {
  useEffect(() => {
    const timer = document.querySelector(".timer");
    timer.addEventListener("load", resendBtn());
  });
  return (
    <div class="two-factor-auth-page" onDragStart={(e) => e.preventDefault()}>
      <h2 class="mention">Please check your otp!</h2>
      <OTP len={6} />
      <div class="bottom">
        <div class="timer"></div>
      </div>
    </div>
  );
};

let isResendClicked = false;
const resendBtn = () => {
  if (document.querySelector(".small-btn")) {
    document.querySelector(".small-btn").remove();
  }
  clearInputs();
  setTimeout(() => {
    const bottom = document.getElementsByClassName("bottom")[0];
    const resendBtn = document.createElement("button");
    resendBtn.className = "small-btn";
    resendBtn.innerText = "resend";
    resendBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
    });
    resendBtn.onclick = () => {
      isResendClicked = true;
      // /api/auth/otp #get 요청
      axios({
        method: "get",
        url: "https://localhost/api/auth/otp/",
        withCredentials: true,
      }).then(console.log("resend"));
      resendBtn();
    };
    bottom.appendChild(resendBtn);
  }, 5000); // 5000 밀리초 = 5초
};

const clearInputs = () => {
  const inputs = document.querySelectorAll(".otp input");
  inputs.forEach((input) => {
    input.value = "";
  });
  inputs[0].focus();
};

export default TwoFactorAuthPage;

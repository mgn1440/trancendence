import { useEffect, useState } from "../lib/dom";
import { createElement } from "../lib/createElement";

// const axios = require("axios");


const isFull = (inputs) => {
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].value === "") {
      return false;
    }
  }
  return true;
};

const OTP = ({ len }) => {
  useEffect(() => {
    const inputs = document.querySelectorAll(".otp .input");
    let backspacePressed = false;
    inputs[0].focus();
    inputs.forEach((input, index) => {
      input.addEventListener("input", (e) => {
        const value = e.target.value;
        if (value != "") {
          if(value.match(/[^0-9]/g)){
            e.target.value =  e.target.value.replace(/[^0-9]/g, '');
            return;
          }
          else if (index !== len - 1) {
            inputs[index + 1].focus();
          } else if (isFull(inputs)) {
            // axios.post("backend_server", { otp: Array.from(inputs).map((input) => input.value).join("")});
            console.log(Array.from(inputs).map((input) => input.value).join(""));
          }
        }
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
          backspacePressed = true;
          if (index > 0 && index !== len - 1) {
            inputs[index - 1].focus();
            inputs[index - 1].value = "";
          }
          else if (index === len - 1 && inputs[index].value === "") {
            inputs[index - 1].focus();
            inputs[index - 1].value = "";
          }
          else if (index === len - 1 && inputs[index].value !== "") {
            inputs[index].value = "";
            backspacePressed = false;
          }
        }
        else if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].includes(e.key)) {
          backspacePressed = false;
        }
        else {
          e.preventDefault();
          backspacePressed = false;
        }
      });
      input.addEventListener("blur", (e) => {
        if ((e.target.value === "" && !backspacePressed) || isFull(inputs)) {
          e.preventDefault();
          e.target.focus();
        }
        backspacePressed = false;
      }
      );
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

//   const TwoFAModal = () => {
// 	return (
// 	  <div
// 		class="modal fade"
// 		id="twoFAModal"
// 		data-bs-backdrop="static"
// 		data-bs-keyboard="false"
// 		tabindex="-1"
// 		aria-labelledby="twoFAModalLabel"
// 		aria-hidden="true"
// 	  >
// 		<div class="modal-dialog">
// 		  <div class="modal-content">
// 			<div class="modal-header">
// 			  <h5 class="modal-title" id="twoFAModalLabel">
// 				2FA
// 			  </h5>
// 			  <button
// 				type="button"
// 				class="btn-close btn-close-white"
// 				data-bs-dismiss="modal"
// 				aria-label="Close"
// 			  ></button>
// 			</div>
// 			<div class="modal-body d-flex justify-content-center align-items-center flex-column">
// 			  <OTP len={6} />
// 			</div>
// 			<div class="modal-footer">
// 			  <a class="mdSizeBtn" href="/match" data-link="true">
// 				Submit
// 			  </a>
// 			</div>
// 		  </div>
// 		</div>
// 	  </div>
// 	);
//   };

const TwoFactorAuthPage = () => {
  useEffect(() => {
    const timer = document.querySelector(".timer");
    timer.addEventListener("load", startTimer());
    timer.addEventListener("load", resendBtn());
  });
  return (
    <div class="two-factor-auth-page" onDragStart={(e) => e.preventDefault()}>
      <h2 class="mention">Please check your otp!</h2>
      <OTP len={6} />
      <div class="bottom">
        <div class="timer">
          <span id="remaining__min">03</span>:<span id="remaining__sec">00</span>
        </div>
      </div>
    </div>
  );
};

let timerId = null;
const startTimer = () => {
  if (timerId !== null) {
    clearInterval(timerId);
    resendBtn();
  }
  const inputs = document.querySelectorAll(".otp .input");
  inputs.forEach((input) => {
    input.classList.remove("bg-gray");
    input.removeAttribute("disabled"); 
  });
  inputs[0].focus();
  const timer = document.querySelector(".timer");
  timer.innerHTML = "<span id='remaining__min'>03</span>:<span id='remaining__sec'>00</span>";
  const remainingMin = document.getElementById("remaining__min");
  const remainingSec = document.getElementById("remaining__sec");
  // let time = 180;
  let time = 5;
  timerId = setInterval(() => {
    if (time > 0) {
      time = time - 1;
      let min = Math.floor(time / 60);
      let sec = String(time % 60).padStart(2, "0");
      remainingMin.innerText = min;
      remainingSec.innerText = sec;
    }
    else {
      clearInterval(timerId);
      clearInputs();
      inputs.forEach((input) => {
        input.classList.add("bg-gray");
        input.setAttribute("disabled", "true");
      });
      document.querySelector(".timer").innerHTML = "<span class='expired'>expired</span>"
      console.log("time out");
    }
  }, 1000);
};

const resendBtn = () => {
  if (document.querySelector(".small-btn")) {
    document.querySelector(".small-btn").remove();
  }
  clearInputs();
  setTimeout(() => {
    const bottom = document.getElementsByClassName("bottom")[0];
    const z = document.createElement("button");
    z.className = "small-btn";
    z.innerText = "resend";
    z.onclick = () => {
      startTimer();
    };
    bottom.appendChild(z);
  }, 5000); // 5000 밀리초 = 5초
};


const clearInputs = () => {
  const inputs = document.querySelectorAll(".otp input");
  inputs.forEach((input) => {
    input.value = "";
  });
};

export default TwoFactorAuthPage;
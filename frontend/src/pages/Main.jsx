import { useEffect, useState } from "../lib/dom";
import { createElement } from "../lib/createElement";
import '../../style.css';

const OTP = ({ len }) => {
  return (
  <div class="otp">
    {[...Array(parseInt(len))].map((n, index) =>
      <input class="m-2 text-center" type="text" maxLength="1" />
    )}</div>);
}

const TwoFAModal = () => {
  return (
    <div class="modal fade" id="twoFAModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="twoFAModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="twoFAModalLabel">2FA</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body d-flex justify-content-center align-items-center flex-column">
            <OTP len={6} />
          </div>
          <div class="modal-footer">
            <a class="mdSizeBtn" href="/match" data-link="true" data-bs-dismiss="modal">Submit</a>
          </div>
        </div>
      </div>
    </div>
  );
}

const MainPage = () => {
  return (
    <div>
      <TwoFAModal />
      <div class="d-flex justify-content-center align-items-center flex-column" style="width: 100vw; height: 100vh;">
        <h1 style="font-size: 7vw;">TRAnscendence</h1>
        <button type="button" class="btn mdSizeBtn" data-bs-toggle="modal" data-bs-target="#twoFAModal">42 login</button>
      </div>
    </div>
  );
};

export default MainPage;

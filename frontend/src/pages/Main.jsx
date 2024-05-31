import { useEffect, useState } from "../lib/dom";
import { createElement } from "../lib/createElement";

const MainPage = () => {
  const MoveTo2FA = () => {
    window.location.href = "http://localhost:8000/api/auth/login";
  };
  return (
    <div class="main-page">
      <h1 class="title">TRAnscendence</h1>
      <button type="button" class="large-btn" onclick={MoveTo2FA}>
        42 login
      </button>
    </div>
  );
};

export default MainPage;

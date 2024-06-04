import { gotoPage } from "@/lib/libft";

const TopNavBar = () => {
  return (
    <div class="top-nav-bar">
      <div>
        <img
          onclick={() => gotoPage("/lobby")}
          class="main-logo"
          src="/img/main_logo.svg"
        ></img>
      </div>
      <div>
        <img onclick={() => gotoPage("/profile/me")} src="/icon/user.svg"></img>
        <img src="/icon/logout.svg"></img>
      </div>
    </div>
  );
};

export default TopNavBar;

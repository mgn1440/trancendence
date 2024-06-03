import Modal from "./Modal";
import { TitleSection, BottomSection } from "./ModalSection";

const TopNavBar = () => {
  return (
    <div class="top-nav-bar">
      <Modal
        id="LogoutModal"
        title={() =>
          TitleSection({ IconPath: "/icon/logout.svg", Title: "Logout" })
        }
        body={() => <h6>Are you sure you want to logout?</h6>}
        footer={() =>
          BottomSection({
            ButtonName: "Logout",
            ClickEvent: () => {
              console.log("logout");
            },
          })
        }
      />
      <div>
        <img class="main-logo" src="/img/main_logo.svg"></img>
      </div>
      <div>
        <img src="/icon/user.svg"></img>
        <img
          src="/icon/logout.svg"
          data-bs-toggle="modal"
          data-bs-target="#LogoutModal"
        ></img>
      </div>
    </div>
  );
};

export default TopNavBar;

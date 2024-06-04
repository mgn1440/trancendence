import { ItemInput, ItemToggle } from "./Items.jsx";

const LobbyProfile = () => {
  const name = "Hyungjuk";
  const multiName = "Hyungjuk_multi";
  const win = 6;
  const lose = 4;
  const rate = 60;
  const logSingleNum = 7;
  const logMultiNum = 8;
  return (
    <div class="profile-config-main">
      <div class="top">
        <h3>{name}</h3>
        <div class="profile-config-list">
          <ItemInput ItemName="Nickname" />
          <ItemInput ItemName="Multi-nickname" />
          <ItemToggle ItemName="2FA" /> {/* and so on... */}
        </div>
      </div>
      <div class="bottom">
		<button class="config-btn bg-gray50">
			<img src="/icon/close.svg"></img>
			cancel
		</button>
		<button class="config-btn bg-gray70">
			<img src="/icon/done.svg"></img>
			save change
		</button>
	  </div>
    </div>
  );
};

export default LobbyProfile;

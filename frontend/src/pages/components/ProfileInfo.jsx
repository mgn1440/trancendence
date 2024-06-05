import { useState, useEffect } from "@/lib/dom";

const LogSingleItem = () => {
  const name = "Minji";
  const date = "9th May";
  const myScore = 6;
  const opponentScore = 4;
  return (
    <div class="log-single-item">
      <div>
        <img src="/img/minji_2.jpg"></img>
        <h4>{name}</h4>
      </div>
      <h6>
        {myScore}:{opponentScore}
      </h6>
      <div class="log-result flex-column">
        <h3>{myScore > opponentScore ? "WIN!" : "LOSE"}</h3>
        <p>{date}</p>
      </div>
    </div>
  );
};

const LogMultiItem = () => {
  const name = "Hyungjuk";
  const opponent = "Minji";
  const date = "9th May";
  const myScore = 6;
  const opponentScore = 4;
  return (
    <div class="log-multi-item">
      <div class="log-multi-info">
        <div class="flex-row">
          <div class="flex-column">
            <img class="my-profile" src="/img/minji_2.jpg"></img>
            <img src="/img/minji_2.jpg"></img>
          </div>
          <div class="flex-column">
            <img src="/img/minji_2.jpg"></img>
            <img src="/img/minji_2.jpg"></img>
          </div>
        </div>
        <div class="flex-row">
          <div class="flex-column">
            <h6 class="my-profile">{name}</h6>
            <h6>{opponent}</h6>
          </div>
          <div class="flex-column">
            <h6>{opponent}</h6>
            <h6>{opponent}</h6>
          </div>
        </div>
      </div>
      <div class="log-result flex-column">
        <h3>{myScore > opponentScore ? "WIN!" : "LOSE"}</h3>
        <p>{date}</p>
      </div>
    </div>
  );
};

const PlayStat = {
  SINGLE: true,
  MULTI: false,
};

const LobbyProfile = ({ data }) => {
  const [logStat, setLogStat] = useState(PlayStat.SINGLE);

  const myProfile = data.user_info;
  const matchNum = myProfile.win + myProfile.lose;
  const multiName = "Hyungjuk_multi";
  const logSingleNum = 7;
  const logMultiNum = 8;
  const handleLogStat = (stat) => {
    if (stat !== logStat) setLogStat(stat);
  };
  return (
    <div class="profile-main">
      <div class="profile-info">
        <div>
          <h3>{myProfile.username}</h3>
          <p>{multiName}</p>
        </div>
        <p>Win: {myProfile.win}</p>
        <p>Lose: {myProfile.lose}</p>
        <p>Rate: {matchNum ? (myProfile.win / matchNum) * 100 : 0}%</p>
      </div>
      <div class="profile-log">
        <div>
          <button
            onclick={() => handleLogStat(PlayStat.SINGLE)}
            class={logStat ? "selected" : ""}
          >
            <span class="vertical-text">Single</span>
          </button>
          <button
            onclick={() => handleLogStat(PlayStat.MULTI)}
            class={!logStat ? "selected" : ""}
          >
            <span class="vertical-text">Multi</span>
          </button>
        </div>
        <div class="log-container">
          {logStat ? (
            <div>
              {[...Array(parseInt(logSingleNum))].map((n) => (
                <LogSingleItem />
              ))}
            </div>
          ) : (
            <div>
              {[...Array(parseInt(logSingleNum))].map((n) => (
                <LogMultiItem />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LobbyProfile;

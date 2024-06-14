import { useState, useEffect } from "@/lib/dom";
import { axiosGameRecords } from "@/api/axios.custom";

const LogSingleItem = ({ record }) => {
  const name = "Minji";
  const date = "9th May";
  return (
    <div class="log-single-item">
      <div>
        <img src="/img/minji_2.jpg"></img>
        <h4>{name}</h4>
      </div>
      <h6>
        {record.user_score}:{record.opponent_score}
      </h6>
      <div class="log-result flex-column">
        <h3>{record.user_score > record.opponent_score ? "WIN!" : "LOSE"}</h3>
        <p>{date}</p>
      </div>
    </div>
  );
};

const LogMultiItem = ({ record }) => {
  const name = "Hyungjuk";
  const opponent = "Minji";
  const date = "9th May";
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
        <h3>{record.user_score > record.opponent_score ? "WIN!" : "LOSE"}</h3>
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
  const [gameRecords, setGameRecords] = useState([]);

  useEffect(() => {
    // axios
    const getGameHistory = async () => {
      const gameRecordsApi = await axiosGameRecords({
        username: data.user_info.username,
        isSingle: logStat ? "SINGLE" : "MULTI",
      });
      setGameRecords(gameRecordsApi.data.record_list);
    };
    getGameHistory();
  }, [logStat]);

  const profile = data.user_info;
  const matchNum = profile.win + profile.lose;
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
          <h3>{profile.username}</h3>
          <p>{profile.multi_nickname}</p>
        </div>
        <p>Win: {profile.win}</p>
        <p>Lose: {profile.lose}</p>
        <p>
          Rate: {matchNum ? ((profile.win / matchNum) * 100).toFixed(2) : 0}%
        </p>
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
          {gameRecords ? (
            logStat ? (
              <div>
                {gameRecords.map((record) => (
                  <LogSingleItem record={record} />
                ))}
              </div>
            ) : (
              <div>
                {gameRecords.map((record) => (
                  <LogMultiItem record={record} />
                ))}
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LobbyProfile;

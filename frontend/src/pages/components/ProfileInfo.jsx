import { useState, useEffect } from "@/lib/dom";
import { axiosGameRecords } from "@/api/axios.custom";

function convertOrdinalNumber(n) {
  n = parseInt(n, 10);
  const suffix = ["th", "st", "nd", "rd"];
  const mod100 = n % 100;

  return n + (suffix[(mod100 - 20) % 10] || suffix[mod100] || suffix[0]);
}

function convertDate(date) {
  var monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const date_type = new Date(date);
  const date_text = `${convertOrdinalNumber(date_type.getDate())} ${
    monthNames[date_type.getMonth()]
  }`;

  return date_text;
}

const LogSingleItem = ({ record }) => {
  return (
    <div class="log-single-item">
      <div>
        <img src="/img/minji_2.jpg"></img>
        <h4>{record.opponent_name}</h4>
      </div>
      <h6>
        {record.user_score}:{record.opponent_score}
      </h6>
      <div class="log-result flex-column">
        <h3>{record.user_score > record.opponent_score ? "WIN!" : "LOSE"}</h3>
        <p>{convertDate(record.created_at)}</p>
      </div>
    </div>
  );
};

const LogMultiItem = ({ name, record }) => {
  return (
    <div class="log-multi-item">
      <div class="log-multi-info">
        <div class="flex-row">
          <div class="flex-column">
            <img class="my-profile" src="/img/minji_2.jpg"></img>
            <img src="/img/minji_2.jpg"></img>
            {/* <img src={record.record_list.opponent1_profile}></img> */}
          </div>
          <div class="flex-column">
            <img src="/img/minji_2.jpg"></img>
            <img src="/img/minji_2.jpg"></img>
            {/* <img src={record.record_list.opponent2_profile}></img>
            <img src={record.record_list.opponent3_profile}></img> */}
          </div>
        </div>
        <div class="flex-row">
          <div class="flex-column">
            <h6 class="my-profile">{name}</h6>
            {/* <h6>{record.record_list.opponent1_name}</h6> */}
          </div>
          <div class="flex-column">
            {/* <h6>{record.record_list.opponent2_name}</h6> */}
            {/* <h6>{record.record_list.opponent3_name}</h6> */}
          </div>
        </div>
      </div>
      <div class="log-result flex-column">
        <h3>{record.user_score > record.opponent_score ? "WIN!" : "LOSE"}</h3>
        <p>{convertDate(record.created_at)}</p>
      </div>
    </div>
  );
};

const PlayStat = {
  SINGLE: true,
  MULTI: false,
};

const LobbyProfile = ({ profile }) => {
  const [logStat, setLogStat] = useState(PlayStat.SINGLE);
  const [gameRecords, setGameRecords] = useState([]);

  console.log(logStat);

  useEffect(() => {
    // axios
    const getGameHistory = async () => {
      const gameRecordsApi = await axiosGameRecords({
        username: profile.username,
        isSingle: logStat ? "SINGLE" : "MULTI",
      });
      setGameRecords(gameRecordsApi.data.record_list);
    };
    getGameHistory();
  }, [logStat]);

  const matchNum = profile.win + profile.lose;
  const multiName = "Hyungjuk_multi";
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
        <div class="select-bar">
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
        {gameRecords ? (
          logStat ? (
            <div class="log-container">
              {gameRecords.map((record) => (
                <LogSingleItem record={record} />
              ))}
            </div>
          ) : (
            <div class="log-container">
              {gameRecords.map(
                (record) => (
                  console.log(record),
                  (<LogMultiItem name={profile.username} record={record} />)
                )
              )}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};

export default LobbyProfile;

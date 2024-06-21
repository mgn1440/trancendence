import { useState, useEffect } from "@/lib/dom";
import {
  axiosGameRecords,
  axiosUserDayStat,
  axiosUserRecentOpponent,
  axiosGameDetail,
} from "@/api/axios.custom";
import { Chart } from "chart.js";
import { isEmpty } from "@/lib/libft";

let canvas;
let routeInfo;
let ctx;
let ratio;
let step = 0;
let requestId;

const drawLine = (stX, stY, edX, edY, color) => {
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(stX * ratio, stY * ratio);
  ctx.lineTo(edX * ratio, edY * ratio);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.closePath();
};

const drawLineDash = (stX, stY, edX, edY, color) => {
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(stX * ratio, stY * ratio);
  ctx.lineTo(edX * ratio, edY * ratio);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.closePath();
};

const drawBall = (x, y, radius) => {
  // ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x * ratio, y * ratio, Math.max(radius * ratio, 7), 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
};

const drawRoute = (start, end, stepX) => {
  let slopeSt = start.speedY / start.speedX;
  let dir = 1;
  if (start.speedX < 0) {
    dir = -1;
  }

  const calcY = (slope, x0, y0, x) => {
    return slope * (x - x0) + y0;
  };
  let xDir = (0 - start.y) / slopeSt + start.x;
  let xDir2 = (900 - start.y) / slopeSt + start.x;
  let delta = Math.abs(xDir2 - xDir) * dir;
  let x = start.x;
  let y = start.y;
  let ex = slopeSt * dir < 0 ? xDir : xDir2;
  let ey = slopeSt * dir < 0 ? 0 : 900;
  drawLineDash(
    x,
    y,
    Math.abs(ex - x) < Math.abs(stepX - x) ? ex : stepX,
    Math.abs(ex - x) < Math.abs(stepX - x) ? ey : calcY(slopeSt, x, y, stepX),
    "#ffffff"
  );
  x = slopeSt * dir < 0 ? xDir : xDir2;
  y = slopeSt * dir < 0 ? 0 : 900;
  while (x * dir < stepX * dir) {
    ex = x + delta;
    ey = y === 900 ? 0 : 900;
    slopeSt = -slopeSt;
    drawLineDash(
      x,
      y,
      Math.abs(ex - x) < Math.abs(stepX - x) ? ex : stepX,
      Math.abs(ex - x) < Math.abs(stepX - x) ? ey : calcY(slopeSt, x, y, stepX),
      "#ffffff"
    );
    x += delta;
    y = start.y === 900 ? 0 : 900;
  }
};

// const drawBallRoute = () => {
//   console.log("drawBallRoute", routeInfo);
//   ratio = canvas.width / 1200;
//   ctx.fillStyle = "#181818";
//   ctx.fillRect(0, 0, canvas.width, canvas.height);
//   ctx.fillStyle = "#ffffff";
//   drawLine(600, 0, 600, 900, "#ffffff");
//   for (let info of routeInfo) {
//     console.log(info);
//     drawRoute(info.ball_start_position, info.ball_end_position);
//     drawBall(
//       info.ball_end_position.x,
//       info.ball_end_position.y,
//       info.ball_end_position.radius
//     );
//   }
// };

const drawBallRoute = (doneIdx, gameRecords, setGameRecords) => {
  step++;
  if (doneIdx >= routeInfo.length) {
    return;
  }
  ratio = canvas.width / 1200;
  ctx.fillStyle = "#181818";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  drawLine(600, 0, 600, 900, "#ffffff");
  for (let idx = 0; idx < doneIdx; idx++) {
    const info = routeInfo[idx];
    drawRoute(
      info.ball_start_position,
      info.ball_end_position,
      info.ball_end_position.x
    );
    drawBall(
      info.ball_end_position.x,
      info.ball_end_position.y,
      info.ball_end_position.radius
    );
  }
  const info = routeInfo[doneIdx];
  const stepX =
    info.ball_start_position.x +
    ((info.ball_end_position.x - info.ball_start_position.x) / 50) * step;
  // console.log(info.ball_start_position.x, step, stepX);
  drawRoute(info.ball_start_position, info.ball_end_position, stepX);
  if (step >= 50) {
    step = 0;
    drawBall(
      info.ball_end_position.x,
      info.ball_end_position.y,
      info.ball_end_position.radius
    );
    setGameRecords({
      ...gameRecords,
      gameDetail: routeInfo.slice(0, doneIdx + 1),
    });
    requestId = requestAnimationFrame(() =>
      drawBallRoute(doneIdx + 1, gameRecords, setGameRecords)
    );
    return;
  }
  requestId = requestAnimationFrame(() =>
    drawBallRoute(doneIdx, gameRecords, setGameRecords)
  );
};

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

const LogSingleItem = ({ record, setLogStat, gameRecords, setGameRecords }) => {
  const handleGameDetail = async (id) => {
    const gameDetail = await axiosGameDetail({ gameId: id });
    console.log("handleGameDetail", gameDetail.data);
    routeInfo = gameDetail.data.goal_list;

    routeInfo.forEach((info, idx) => {
      info.left = routeInfo
        .slice(0, idx + 1)
        .reduce(
          (accu, value) =>
            value.goal_user_position === "left" ? accu + 1 : accu,
          0
        );
      info.right = routeInfo
        .slice(0, idx + 1)
        .reduce(
          (accu, value) =>
            value.goal_user_position === "right" ? accu + 1 : accu,
          0
        );
    });
    setLogStat(PlayStat.DETAIL);
  };
  return (
    <div class="log-single-item" onclick={() => handleGameDetail(record.id)}>
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
  SINGLE: "single",
  MULTI: "multi",
  DASHBOARD: "dashboard",
  DETAIL: "detail",
};

const LobbyProfile = ({ profile }) => {
  const [logStat, setLogStat] = useState(PlayStat.SINGLE);
  const [gameRecords, setGameRecords] = useState({});

  console.log(logStat);

  useEffect(() => {
    const getGameRecords = async () => {
      const dayStatApi = await axiosUserDayStat({
        username: profile.username,
      });

      const recentOpponentApi = await axiosUserRecentOpponent({
        username: profile.username,
      });

      const singleRecordsApi = await axiosGameRecords({
        username: profile.username,
        isSingle: "SINGLE",
      });

      const multiRecordsApi = await axiosGameRecords({
        username: profile.username,
        isSingle: "MULTI",
      });

      console.log("recentOpponentApi", recentOpponentApi.data);
      setGameRecords({
        playOfWeek: dayStatApi.data.day_count_stats,
        recentOpponent: recentOpponentApi.data.opponent_records,
        singleRecords: singleRecordsApi.data.record_list,
        multiRecords: multiRecordsApi.data.record_list,
      });
    };
    getGameRecords();
  }, []);

  console.log("gameRecords", gameRecords);
  useEffect(() => {
    console.log("gameRecords useEffect", gameRecords);
    if (logStat === PlayStat.DASHBOARD) {
      const labels = gameRecords.playOfWeek.map((data) => data.day);
      const numOfRound = gameRecords.playOfWeek.map((data) => data.count);
      const numOfWins = gameRecords.playOfWeek.map((data) => data.wins);
      const numOfLoses = gameRecords.playOfWeek.map(
        (data) => data.count - data.wins
      );
      const rateOfWins = gameRecords.playOfWeek.map((data) =>
        data.count ? (data.wins / data.count) * 100 : 0
      );
      let ctx = document.getElementById("myChartCnt");
      new Chart(ctx, {
        data: {
          labels: labels,
          datasets: [
            {
              type: "bar",
              label: "Rounds",
              data: numOfRound,
              borderWidth: 1,
            },
            {
              type: "bar",
              label: "Win",
              data: numOfWins,
              borderWidth: 1,
            },
            {
              type: "bar",
              label: "Loses",
              data: numOfLoses,
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              grid: {
                color: (context) => {
                  return "rgba(255,255,255,0.4)";
                },
              },
              ticks: {
                stepSize: (context) => {
                  return Math.max(Math.max(...numOfRound) / 5, 1);
                },
              },
              beginAtZero: true,
            },
          },
        },
      });

      ctx = document.getElementById("myChartRate");
      new Chart(ctx, {
        data: {
          labels: labels,
          datasets: [
            {
              type: "line",
              tension: 0.3,
              label: "# of Votes",
              data: rateOfWins,
              borderWidth: 1,
              fill: true,
              backgroundColor: "rgba(255,255,255,0.3)",
            },
          ],
        },
        options: {
          scales: {
            y: {
              grid: {
                color: (context) => {
                  // if (context.tick.value % 20 === 0) {
                  //   return "rgba(255,255,255,0.8)";
                  // }
                  return "rgba(255,255,255,0.4)";
                },
                lineWidth: (context) => {
                  return 1;
                },
              },
              ticks: {
                stepSize: 20,
              },
              beginAtZero: true,
            },
          },
        },
      });
    } else if (logStat === PlayStat.DETAIL) {
      canvas = document.querySelector("#gameDetail > canvas");
      ctx = canvas.getContext("2d");

      ctx.scale(1, 1);
      canvas.width = document.querySelector("#gameDetail").clientWidth;
      canvas.height = document.querySelector("#gameDetail").clientHeight;
      routeInfo.forEach((info) => {
        info.ball_start_position = JSON.parse(info.ball_start_position);
        info.ball_end_position = JSON.parse(info.ball_end_position);
      });
      drawBallRoute(0, gameRecords, setGameRecords);
    }
  }, [logStat]);

  const matchNum = profile.win + profile.lose;
  const handleLogStat = (stat) => {
    if (logStat === PlayStat.DETAIL) {
      setGameRecords({
        ...gameRecords,
        gameDetail: [],
      });
      cancelAnimationFrame(requestId);
    }
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
            class={logStat === PlayStat.SINGLE ? "selected" : ""}
          >
            <span class="vertical-text">Single</span>
          </button>
          <button
            onclick={() => handleLogStat(PlayStat.MULTI)}
            class={logStat === PlayStat.MULTI ? "selected" : ""}
          >
            <span class="vertical-text">Multi</span>
          </button>
          <button
            onclick={() => handleLogStat(PlayStat.DASHBOARD)}
            class={`dashboardBtn ${
              logStat === PlayStat.DASHBOARD ? "selected" : ""
            }`}
          >
            <span class="vertical-text">DashBoard</span>
          </button>
        </div>
        {!isEmpty(gameRecords) ? (
          logStat === PlayStat.SINGLE ? (
            <div class="log-container">
              {gameRecords.singleRecords.map((record) => (
                <LogSingleItem
                  record={record}
                  setLogStat={setLogStat}
                  gameRecords={gameRecords}
                  setGameRecords={setGameRecords}
                />
              ))}
            </div>
          ) : logStat === PlayStat.MULTI ? (
            <div class="log-container">
              {gameRecords.multiRecords.map(
                (record) => (
                  console.log(record),
                  (<LogMultiItem name={profile.username} record={record} />)
                )
              )}
            </div>
          ) : logStat === PlayStat.DASHBOARD ? (
            <div class="log-container forward">
              <h4>Play of Week</h4>
              <canvas id="myChartCnt"></canvas>
              <h4>Winning Rate of Week</h4>
              <canvas id="myChartRate"></canvas>
              {/* <h4>Recent Opponents</h4>
              {Object.keys(gameRecords.recentOpponent).map((key) => {
                console.log(key);
                return (
                  <RecentOpponentItem
                    name={key}
                    info={gameRecords.recentOpponent[key]}
                  />
                );
              })} */}
            </div>
          ) : (
            <div class="log-container forward">
              <div id="gameDetail">
                <canvas></canvas>
              </div>
              <h4>Game Details</h4>
              <div class="goal-info-item main">
                <h5 class="no">no.</h5>
                <h5>Username</h5>
                <h5>Score</h5>
                <h5>Time</h5>
              </div>
              {gameRecords.gameDetail &&
                gameRecords.gameDetail.map((goal, idx) => (
                  <div class="goal-info-item">
                    <h5 class="no">{idx + 1}</h5>
                    <h5>{goal.goal_user_name}</h5>
                    <h5>
                      {goal.left}:{goal.right}
                    </h5>
                    <h5>{goal.timestamp.toFixed(2)}</h5>
                  </div>
                ))}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};

export default LobbyProfile;

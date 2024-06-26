import { useState, useEffect } from "@/lib/dom";
import {
  axiosGameRecords,
  axiosUserDayStat,
  axiosUserRecentOpponent,
  axiosGameDetail,
  axiosAvgGameLine,
} from "@/api/axios.custom";
import { Chart, registerables } from "chart.js";
import { isEmpty } from "@/lib/libft";
import { eventType, addEventArray, addEventHandler } from "@/lib/libft";

let canvas;
let routeInfo;
let ctx;
let ratio;
let step = 0;
let gameMaxIdx = 0;
let requestId;
let canvasDone = false;

Chart.register(...registerables);

const drawLine = (stX, stY, edX, edY, color, gameIdx) => {
  ctx[gameIdx].setLineDash([]);
  ctx[gameIdx].beginPath();
  ctx[gameIdx].moveTo(stX * ratio, stY * ratio);
  ctx[gameIdx].lineTo(edX * ratio, edY * ratio);
  ctx[gameIdx].strokeStyle = color;
  ctx[gameIdx].lineWidth = 1;
  ctx[gameIdx].stroke();
  ctx[gameIdx].closePath();
};

const drawLineDash = (stX, stY, edX, edY, color, gameIdx) => {
  ctx[gameIdx].setLineDash([5, 5]);
  ctx[gameIdx].beginPath();
  ctx[gameIdx].moveTo(stX * ratio, stY * ratio);
  ctx[gameIdx].lineTo(edX * ratio, edY * ratio);
  ctx[gameIdx].strokeStyle = color;
  ctx[gameIdx].lineWidth = 1;
  ctx[gameIdx].stroke();
  ctx[gameIdx].closePath();
};

const drawBall = (x, y, radius, gameIdx) => {
  // ctx[gameIdx].fillStyle = "#ffffff";
  ctx[gameIdx].beginPath();
  ctx[gameIdx].arc(
    x * ratio,
    y * ratio,
    Math.max(radius * ratio, 7),
    0,
    Math.PI * 2
  );
  ctx[gameIdx].fill();
  ctx[gameIdx].closePath();
};

const drawRoute = (start, end, stepX, gameIdx) => {
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
    "#ffffff",
    gameIdx
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
      "#ffffff",
      gameIdx
    );
    x += delta;
    y = start.y === 900 ? 0 : 900;
  }
};

const drawBallRouteDone = () => {
  for (let gameIdx = 0; gameIdx < gameMaxIdx; gameIdx++) {
    // 몇경기인지
    ratio = canvas[gameIdx].width / 1200;
    ctx[gameIdx].fillStyle = "#181818";
    ctx[gameIdx].fillRect(0, 0, canvas[gameIdx].width, canvas[gameIdx].height);
    ctx[gameIdx].fillStyle = "#ffffff";
    drawLine(600, 0, 600, 900, "#ffffff", gameIdx);
    for (let idx = 0; idx < routeInfo[gameIdx].length; idx++) {
      const info = routeInfo[gameIdx][idx];
      drawRoute(
        info.ball_start_position,
        info.ball_end_position,
        info.ball_end_position.x,
        gameIdx
      );
      drawBall(
        info.ball_end_position.x,
        info.ball_end_position.y,
        info.ball_end_position.radius,
        gameIdx
      );
    }
  }
};

const drawBallRoute = (doneIdx) => {
  step++;
  let countDone = 0;
  for (let gameIdx = 0; gameIdx < gameMaxIdx; gameIdx++) {
    if (doneIdx >= routeInfo[gameIdx].length) {
      countDone++;
      continue;
    }
    ratio = canvas[gameIdx].width / 1200;
    ctx[gameIdx].fillStyle = "#181818";
    ctx[gameIdx].fillRect(0, 0, canvas[gameIdx].width, canvas[gameIdx].height);
    ctx[gameIdx].fillStyle = "#ffffff";
    drawLine(600, 0, 600, 900, "#ffffff", gameIdx);
    for (let idx = 0; idx < doneIdx; idx++) {
      const info = routeInfo[gameIdx][idx];
      drawRoute(
        info.ball_start_position,
        info.ball_end_position,
        info.ball_end_position.x,
        gameIdx
      );
      drawBall(
        info.ball_end_position.x,
        info.ball_end_position.y,
        info.ball_end_position.radius,
        gameIdx
      );
    }
    const info = routeInfo[gameIdx][doneIdx];
    const stepX =
      info.ball_start_position.x +
      ((info.ball_end_position.x - info.ball_start_position.x) / 50) * step;
    drawRoute(info.ball_start_position, info.ball_end_position, stepX, gameIdx);
    if (step >= 50) {
      drawBall(
        info.ball_end_position.x,
        info.ball_end_position.y,
        info.ball_end_position.radius,
        gameIdx
      );
    }
  }
  if (countDone === gameMaxIdx) {
    canvasDone = true;
    return;
  }
  if (step >= 50) {
    step = 0;
    requestId = requestAnimationFrame(() => drawBallRoute(doneIdx + 1));
    return;
  }
  requestId = requestAnimationFrame(() => drawBallRoute(doneIdx));
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

const convertRouteInfo = (data) => {
  const routeInfo = data.data.goal_list;
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
    info.ball_start_position = JSON.parse(info.ball_start_position);
    info.ball_end_position = JSON.parse(info.ball_end_position);
  });
  return routeInfo;
};

const LogSingleItem = ({ record, setLogStat, gameRecords, setGameRecords }) => {
  const defaultImg = `/img/minji_${
    (record.opponent_name[0].charCodeAt(0) % 5) + 1
  }.jpg`;

  const handleGameDetail = async (id) => {
    const gameDetail = await axiosGameDetail({ gameId: id });
    routeInfo = [convertRouteInfo(gameDetail)];
    setGameRecords({
      ...gameRecords,
      gameDetail: {},
    });
    setLogStat(PlayStat.DETAIL);
  };
  return (
    <div class="log-single-item" onclick={() => handleGameDetail(record.id)}>
      <div>
        <img src={record.opponent_profile ?? defaultImg}></img>
        <div>
          <h4>{record.opponent_name}</h4>
          <p>
            {record.user_score}:{record.opponent_score}
          </p>
        </div>
      </div>
      <div class="log-result flex-column">
        <h3>{record.user_score > record.opponent_score ? "WIN!" : "LOSE"}</h3>
        <p>{convertDate(record.created_at)}</p>
      </div>
    </div>
  );
};

const getDefaultImg = (name) => {
  return `/img/minji_${(name[0].charCodeAt(0) % 5) + 1}.jpg`;
};

const LogMultiItem = ({
  name,
  record,
  setLogStat,
  gameRecords,
  setGameRecords,
}) => {
  const handleGameDetail = async (idArr) => {
    routeInfo = [];
    for (let id of idArr) {
      const gameDetail = await axiosGameDetail({ gameId: id });
      routeInfo.push(convertRouteInfo(gameDetail));
    }
    setLogStat(PlayStat.DETAILS);
    setGameRecords({
      ...gameRecords,
      gameDetail: {},
    });
  };

  return (
    <div
      class="log-multi-item"
      onclick={() =>
        handleGameDetail([record.game1_id, record.game2_id, record.game3_id])
      }
    >
      <div class="log-multi-info">
        <div class="flex-row">
          <div class="flex-column">
            <img class="my-profile" src="/img/minji_2.jpg"></img>
            <img
              src={
                record.opponent1_profile ?? getDefaultImg(record.opponent1_name)
              }
            ></img>
          </div>
          <div class="flex-column">
            <img
              src={
                record.opponent2_profile ?? getDefaultImg(record.opponent2_name)
              }
            ></img>
            <img
              src={
                record.opponent3_profile ?? getDefaultImg(record.opponent3_name)
              }
            ></img>
          </div>
        </div>
        <div class="flex-row">
          <div class="flex-column">
            <h6 class="my-profile">{name}</h6>
            <h6>{record.opponent1_name}</h6>
          </div>
          <div class="flex-column">
            <h6>{record.opponent2_name}</h6>
            <h6>{record.opponent3_name}</h6>
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
  DETAILS: "details",
};

const LobbyProfile = ({ profile }) => {
  const [logStat, setLogStat] = useState(PlayStat.SINGLE);
  const [gameRecords, setGameRecords] = useState({});

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

      const avgGameLineApi = await axiosAvgGameLine({
        username: profile.username,
      });

      setGameRecords({
        playOfWeek: dayStatApi.data.day_count_stats,
        recentOpponent: recentOpponentApi.data.opponent_records,
        singleRecords: singleRecordsApi.data.record_list,
        multiRecords: multiRecordsApi.data.record_list,
        avgGameLine: avgGameLineApi.data,
      });
    };
    getGameRecords();
  }, []);

  useEffect(() => {
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
              label: "Rate of Week",
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

      const avgLabels = gameRecords.avgGameLine.index;
      const avgRates = gameRecords.avgGameLine.rates_total;
      const avgRates3 = gameRecords.avgGameLine.rates_3play;
      const avgRates5 = gameRecords.avgGameLine.rates_5play;
      ctx = document.getElementById("myChartAvgRates");
      new Chart(ctx, {
        data: {
          labels: avgLabels,
          datasets: [
            {
              type: "line",
              tension: 0.3,
              label: "3plays avg",
              data: avgRates3,
              borderWidth: 1,
              fill: true,
              backgroundColor: "rgba(255,130,130,0.5)",
            },
            {
              type: "line",
              tension: 0.3,
              label: "Total avg",
              data: avgRates,
              borderWidth: 1,
              fill: true,
              backgroundColor: "rgba(255,255,255,0.2)",
            },
            {
              type: "line",
              tension: 0.3,
              label: "5plays avg",
              data: avgRates5,
              borderWidth: 1,
              fill: true,
              backgroundColor: "rgba(130,130,255,0.5)",
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
    } else if (logStat === PlayStat.DETAIL || logStat === PlayStat.DETAILS) {
      canvas = document.querySelectorAll(".game-detail > canvas");
      ctx = [...canvas].map((cvsComponent) => cvsComponent.getContext("2d"));

      for (let context of ctx) {
        context.scale(1, 1);
      }

      canvas.forEach((cvsComponent) => {
        let rate = 1;
        if (document.querySelector(".game-detail").clientWidth > 600) {
          rate = document.querySelector(".game-detail").clientWidth / 600;
        }
        cvsComponent.width =
          document.querySelector(".game-detail").clientWidth / rate;
        cvsComponent.height = cvsComponent.width * 0.75;
      });
      // routeInfo.forEach((info) => {
      //   info.ball_start_position = JSON.parse(info.ball_start_position);
      //   info.ball_end_position = JSON.parse(info.ball_end_position);
      // });
      gameMaxIdx = routeInfo.length;
      canvasDone = false;
      drawBallRoute(0);
    }
  }, [logStat]);

  useEffect(() => {
    addEventArray(eventType.RESIZE, () => {
      canvas = document.querySelectorAll(".game-detail > canvas");
      if (canvas.length === 0) return;
      canvas.forEach((cvsComponent) => {
        let rate = 1;
        if (document.querySelector(".game-detail").clientWidth > 600) {
          rate = document.querySelector(".game-detail").clientWidth / 600;
        }
        cvsComponent.width =
          document.querySelector(".game-detail").clientWidth / rate;
        cvsComponent.height = cvsComponent.width * 0.75;
      });
      if (canvasDone) {
        gameMaxIdx = routeInfo.length;
        drawBallRouteDone();
      }
    });
    addEventHandler();
  }, []);

  const matchNum = profile.win + profile.lose;
  const handleLogStat = (stat) => {
    if (logStat === PlayStat.DETAIL || logStat === PlayStat.DETAILS) {
      cancelAnimationFrame(requestId);
      setGameRecords({
        ...gameRecords,
        gameDetail: {},
      });
    }
    setLogStat(stat);
  };
  return (
    <div class="profile-main">
      <div class="profile-info">
        <div>
          <h3>{profile.username}</h3>
          {/* <p>{profile.multi_nickname}</p> */}
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
              {gameRecords.singleRecords
                .slice()
                .reverse()
                .map((record) => (
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
              {gameRecords.multiRecords
                .slice()
                .reverse()
                .map((record) => (
                  <LogMultiItem
                    name={profile.username}
                    record={record}
                    setLogStat={setLogStat}
                    gameRecords={gameRecords}
                    setGameRecords={setGameRecords}
                  />
                ))}
            </div>
          ) : logStat === PlayStat.DASHBOARD ? (
            <div class="log-container detail">
              <h4>Play of Week</h4>
              <canvas id="myChartCnt"></canvas>
              <h4>Winning Rate of Week</h4>
              <canvas id="myChartRate"></canvas>
              <h4>Average Winning Rates</h4>
              <canvas id="myChartAvgRates"></canvas>
              {/* <h4>Recent Opponents</h4>
              {Object.keys(gameRecords.recentOpponent).map((key) => {
                return (
                  <RecentOpponentItem
                    name={key}
                    info={gameRecords.recentOpponent[key]}
                  />
                );
              })} */}
            </div>
          ) : gameRecords.gameDetail ? (
            <div class="log-container detail">
              {routeInfo.map((value, idx) => (
                <div class="game-detail-page">
                  <div class="game-detail">
                    <canvas></canvas>
                  </div>
                  <h4>Game Details</h4>
                  <div class="goal-info-item main">
                    <p class="no">no.{idx}</p>
                    <p>Username</p>
                    <p>Score</p>
                    <p>Time</p>
                  </div>
                  {routeInfo[idx] &&
                    routeInfo[idx].map((goal, idx) => (
                      <div key={idx} class="goal-info-item">
                        <p class="no">{idx + 1}</p>
                        <p>{goal.goal_user_name}</p>
                        <p>
                          {goal.left}:{goal.right}
                        </p>
                        <p>{goal.timestamp.toFixed(2)}</p>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          ) : (
            <div></div>
          )
        ) : null}
      </div>
    </div>
  );
};

export default LobbyProfile;

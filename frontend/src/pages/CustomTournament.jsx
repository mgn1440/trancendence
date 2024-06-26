import { useEffect, useState, useRef } from "@/lib/dom";
import { gotoPage, isEmpty } from "@/lib/libft";
import { history } from "@/lib/router";
import { ws_gamelogic, connectGameLogicWebSocket } from "@/store/gameLogicWS";
import { addEventArray, addEventHandler, eventType } from "@/lib/libft";
import { clientUserStore } from "@/store/clientUserStore";
import { WinMessage, LoseMessage } from "./components/ResultMessage";
import Bracket from "./components/Bracket";

let gameState;
let canvas;
let context;
let ratio;
let role;
let match;

let users;

const drawPaddle = (x, y, bar_size) => {
  context.fillStyle = "red";
  context.fillRect(x * ratio, y * ratio, 20 * ratio, canvas.height / bar_size);
};

const drawBall = (x, y) => {
  context.fillStyle = "#ffffff";
  // context.fillRect(x, y, 20, 20);
  context.beginPath();
  context.arc(
    gameState.ball.x * ratio,
    gameState.ball.y * ratio,
    gameState.ball.radius * ratio,
    0,
    Math.PI * 2
  );
  context.fill();
  context.closePath();
};

const drawLine = () => {
  context.beginPath();
  context.moveTo(canvas.width / 2, 0);
  context.lineTo(canvas.width / 2, canvas.height);
  context.strokeStyle = "#ffffff";
  context.lineWidth = 2;
  context.stroke();
  context.closePath();
};

var img1 = new Image();
var img2 = new Image();
var img3 = new Image();
var img4 = new Image();
img1.src = "/icon/ball_speed_up.svg";
img2.src = "/icon/ball_speed_down.svg";
img3.src = "/icon/expand_arrow.svg";
img4.src = "/icon/reduct_arrow.svg";
var imgs = { speed_up: img1, speed_down: img2, bar_up: img3, bar_down: img4 };
const drawItems = (items) => {
  items.forEach((item) => {
    switch (item.type) {
      case "speed_up":
        context.fillStyle = "rgba(255, 0, 0, 0.75)";
        break;
      case "speed_down":
        context.fillStyle = "rgba(0, 0, 255, 0.75)";
        break;
      case "bar_up":
        context.fillStyle = "rgba(255, 0, 255, 0.75)";
        break;
      case "bar_down":
        context.fillStyle = "rgba(255, 165, 0, 0.75)";
        break;
      default:
        context.fillStyle = "white";
    }
    context.fillRect(
      item.x * ratio - 25 * ratio,
      item.y * ratio - 25 * ratio,
      50 * ratio,
      50 * ratio
    );
    context.drawImage(
      imgs[item.type],
      item.x * ratio - 25 * ratio,
      item.y * ratio - 25 * ratio,
      50 * ratio,
      50 * ratio
    );
  });
};

const draw = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#181818";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  drawPaddle(20, gameState.player_bar.left, gameState.bar_size.left);
  drawPaddle(1160, gameState.player_bar.right, gameState.bar_size.right);
  drawBall(gameState.ball.x, gameState.ball.y);
  drawItems(gameState.items);
  drawLine();
  // context.font = "20px Quantico";
  // context.fillText("User1", 10, 20);
};

const update = () => {
  draw();
  // requestAnimationFrame(() => update());
};

const dirStat = {
  STOP: 0,
  UP: 1,
  DOWN: 2,
};
const GamePage = () => {
  const [gameStat, setGameStat] = useState([]);
  const [userStat, setUserStat] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  let direction = dirStat.STOP;
  let startFlag = false;
  useEffect(() => {
    const socketAsync = async () => {
      connectGameLogicWebSocket(
        ws_gamelogic.dispatch,
        `/ws/custom-tournament/${history.currentPath().split("/")[2]}/`
      );

      ws_gamelogic.getState().socket.onopen = (e) => {
        const waitOpponent = async () => {
          await new Promise((resolve) => setTimeout(resolve, 10000));
          if (!startFlag) {
            ws_gamelogic
              .getState()
              .socket.send(
                JSON.stringify({ type: "error", message: "timeout" })
              );
          }
        };
        waitOpponent();
      };

      ws_gamelogic.getState().socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log(data);
        if (data.type === "game_start") {
          startFlag = true;
          gameState = data.game;
          setGameStat([data.game.scores, data.roles]);
          users = [
            data.match_a_player[0],
            data.match_a_player[1],
            data.match_b_player[0],
            data.match_b_player[1],
            "tbd",
            "tbd",
            "tbd",
          ];
          setUserStat(users);
          role = data.role;
          match = data.match;
          let timer = 3;
          let interval = setInterval(() => {
            console.log(timer);
            timer--;
            const counter = document.querySelector(".pong-game-info h1");
            if (counter) {
              counter.innerText = timer;
              if (timer <= 0) {
                counter.style.display = "none";
                clearInterval(interval);
                ws_gamelogic.getState().socket.send(
                  JSON.stringify({
                    type: "start_game",
                    role: role,
                    match: match,
                  })
                );
              }
            } else {
              timer++;
            }
          }, 1000);
          addEventArray(eventType.KEYDOWN, (e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              direction = e.key === "ArrowUp" ? dirStat.UP : dirStat.DOWN;
              ws_gamelogic.getState().socket.send(
                JSON.stringify({
                  type: "move_bar",
                  direction: direction === dirStat.UP ? "up" : "down",
                  role: role,
                  match: match,
                })
              );
            }
          });
          addEventArray(eventType.KEYUP, (e) => {
            if (
              direction !== dirStat.STOP &&
              ((e.key === "ArrowUp" && direction === dirStat.UP) ||
                (e.key === "ArrowDown" && direction === dirStat.DOWN))
            ) {
              direction = dirStat.STOP;
              ws_gamelogic.getState().socket.send(
                JSON.stringify({
                  type: "stop_bar",
                  role: role,
                  match: match,
                })
              );
            }
          });
          addEventHandler();
        } else if (data.type === "update_game") {
          gameState = data.game;
          setGameStat([data.game.scores, data.roles]);
        } else if (data.type === "game_over") {
          const newUsers = [...users];
          if (data.match === "f") {
            for (let i = 0; i < 7; i++) {
              if (newUsers[i] === data.winner) {
                newUsers[6] = data.winner;
                newUsers[i] = "";
                break;
              }
            }
            users = newUsers;
            setUserStat(newUsers);
            if (clientUserStore.getState().client.username === data.winner) {
              setGameResult(1);
            } else {
              setGameResult(2);
            }
            setTimeout(() => {
              gotoPage(`/lobby/${data.room_id}`);
            }, 5000);
          } else {
            if (data.winner === data.you) {
              ws_gamelogic.getState().socket.send(
                JSON.stringify({
                  type: "final_ready",
                })
              );
            }
            if (data.match === "a") {
              const newUsers = [...users];
              for (let i = 0; i < 7; i++) {
                if (newUsers[i] === data.winner) {
                  newUsers[4] = data.winner;
                  newUsers[i] = "";
                  break;
                }
              }
              users = newUsers;
              setUserStat(newUsers);
            } else {
              const newUsers = [...users];
              for (let i = 0; i < 7; i++) {
                if (newUsers[i] === data.winner) {
                  newUsers[5] = data.winner;
                  newUsers[i] = "";
                  break;
                }
              }
              users = newUsers;
              setUserStat(newUsers);
            }
          }
        } else if (data.type === "error") {
          alert(data.message);
          console.log(data.message);
          gotoPage("/lobby");
        } else if (data.type === "final_game_start") {
          gameState = data.game;
          setGameStat([data.game.scores, data.roles]);
          role = data.role;
          match = data.match;
          let timer = 3;
          const counter = document.querySelector(".pong-game-info h1");
          counter.innerText = timer;
          counter.style.display = "inline";
          let interval = setInterval(() => {
            timer--;
            counter.innerText = timer;
            if (timer <= 0) {
              counter.style.display = "none";
              clearInterval(interval);
              console.log(role, match);
              ws_gamelogic.getState().socket.send(
                JSON.stringify({
                  type: "start_final_game",
                  role: role,
                  match: match,
                })
              );
            }
          }, 1000);
        }
      };
    };
    socketAsync();
  }, []);

  useEffect(() => {
    if (isEmpty(gameStat)) return;
    document.getElementById("pong-game").style.display = "block";
    canvas = document.getElementById("pong-game");
    let windowH = window.innerHeight;
    if (window.innerHeight > 800) {
      windowH = window.innerHeight - 400;
    }
    if (windowH / 3 > window.innerWidth / 4) {
      canvas.width = window.innerWidth - 10;
      canvas.height = (window.innerWidth * 3) / 4 - 10;
    } else {
      canvas.height = windowH - 10;
      canvas.width = (windowH * 4) / 3 - 10;
    }
    context = canvas.getContext("2d");
    context.scale(1, 1);

    document.querySelector(
      ".pong-game-info > p.user1"
    ).style.left = `calc(52% - ${canvas.width / 2}px)`;
    document.querySelector(
      ".pong-game-info > p.user2"
    ).style.right = `calc(52% - ${canvas.width / 2}px)`;

    ratio = canvas.width / 1200;
    update();
  }, [gameStat, userStat]);
  return (
    <div class="game-display">
      <div class="tournament">
        <Bracket users={userStat} />
        <div class="pong-game-main">
          <canvas id="pong-game"></canvas>
          {isEmpty(gameStat) ? null : (
            <div class="pong-game-info">
              <p class="user1">{gameStat[1].left}</p>
              <p class="user2">{gameStat[1].right}</p>
              <h6 class="user1">{gameStat[0].left}</h6>
              <h6 class="user2">{gameStat[0].right}</h6>
              <h1>3</h1>
            </div>
          )}
        </div>
      </div>
      {gameResult == 1 ? (
        <WinMessage />
      ) : gameResult == 2 ? (
        <LoseMessage />
      ) : (
        <div />
      )}
    </div>
  );
};

export default GamePage;

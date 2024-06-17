import { useEffect, useState, useRef } from "@/lib/dom";
import { gotoPage, isEmpty } from "@/lib/libft";
import { history } from "@/lib/router";
import { ws_gamelogic, connectGameLogicWebSocket } from "@/store/gameLogicWS";

let gameState;
let canvas;
let context;
let ratio;
let gameRoles;

const drawPaddle = (x, y) => {
  context.fillStyle = "#ffffff";
  context.fillRect(x * ratio, y * ratio, 20 * ratio, canvas.height / 5);
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

const draw = () => {
  context.fillStyle = "#181818";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  drawPaddle(20, gameState.player_bar.left);
  drawPaddle(1160, gameState.player_bar.right);
  drawBall(gameState.ball.x, gameState.ball.y);
  drawLine();
  // context.font = "20px Quantico";
  // context.fillText("User1", 10, 20);
};

const update = () => {
  draw();
  requestAnimationFrame(() => update());
};

const dirStat = {
  STOP: 0,
  UP: 1,
  DOWN: 2,
};
const GamePage = () => {
  const [gameStat, setGameStat] = useState([]);
  // const [gameScore, setGameScore] = useState({});
  console.log(gameStat);
  let direction = dirStat.STOP;
  let startFlag = false;
  useEffect(() => {
    const socketAsync = async () => {
      connectGameLogicWebSocket(
        ws_gamelogic.dispatch,
        `/ws/tournament/${history.currentPath().split("/")[2]}/`
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
          // setGameScore(data.game.scores);
          // setGameUsers(data.game.roles);
          gameRoles = data.roles;
          setGameStat([data.game.scores, data.role, data.match]);
          let timer = 3;
          let interval = setInterval(() => {
            console.log(timer);
            timer--;
            const counter = document.querySelector(".pong-game-info h1");
            counter.innerText = timer;
            if (timer <= 0) {
              counter.style.display = "none";
              clearInterval(interval);
              ws_gamelogic.getState().socket.send(
                JSON.stringify({
                  type: "start_game",
                  role: data.role,
                  match: data.match,
                })
              );
            }
          }, 1000);
          document.addEventListener("keydown", (e) => {
            if (
              // direction === dirStat.STOP &&
              e.key === "ArrowUp" ||
              e.key === "ArrowDown"
            ) {
              direction = e.key === "ArrowUp" ? dirStat.UP : dirStat.DOWN;
              ws_gamelogic.getState().socket.send(
                JSON.stringify({
                  type: "move_bar",
                  direction: direction === dirStat.UP ? "up" : "down",
                  role: data.you,
                })
              );
            }
          });
          document.addEventListener("keyup", (e) => {
            if (
              direction !== dirStat.STOP &&
              // (e.key === "ArrowUp" || e.key === "ArrowDown")
              ((e.key === "ArrowUp" && direction === dirStat.UP) ||
                (e.key === "ArrowDown" && direction === dirStat.DOWN))
            ) {
              direction = dirStat.STOP;
              ws_gamelogic.getState().socket.send(
                JSON.stringify({
                  type: "stop_bar",
                  role: data.you,
                })
              );
            }
          });
        } else if (data.type === "update_game") {
          gameState = data.game;
          // setGameScore(data.game.scores);
          // setGameUsers(data.game.roles);
          setGameStat([data.game.scores, data.role, data.match]);
        } else if (data.type === "game_over") {
          alert(data.winner + " win!");
          gotoPage(`/lobby`);
        } else if (data.type === "error") {
          alert(data.message);
          gotoPage("/lobby");
        }
      };
    };
    socketAsync();
  }, []);

  useEffect(() => {
    if (isEmpty(gameStat)) return;
    document.getElementById("pong-game").style.display = "block";
    canvas = document.getElementById("pong-game");
    if (window.innerHeight / 3 > window.innerWidth / 4) {
      canvas.width = window.innerWidth - 10;
      canvas.height = (window.innerWidth * 3) / 4 - 10;
    } else {
      canvas.height = window.innerHeight - 10;
      canvas.width = (window.innerHeight * 4) / 3 - 10;
    }
    context = canvas.getContext("2d");
    context.scale(1, 1);

    ratio = canvas.width / 1200;
    // } else
    update();
  }, [gameStat]);
  return (
    <div>
      <div class="pong-game-main">
        <canvas id="pong-game"></canvas>
        {isEmpty(gameStat) ? null : (
          <div class="pong-game-info">
            <p class="user1">{gameRoles.left}</p>
            <p class="user2">{gameRoles.right}</p>
            <h6 class="user1">{gameStat[0].left}</h6>
            <h6 class="user2">{gameStat[0].right}</h6>
            <h1>3</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;

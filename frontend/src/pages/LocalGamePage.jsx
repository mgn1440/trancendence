import { useEffect, useState, useRef } from "@/lib/dom";
import { gotoPage, isEmpty } from "@/lib/libft";
import { history } from "@/lib/router";
import { ws_gamelogic, connectGameLogicWebSocket } from "@/store/gameLogicWS";
import { addEventArray, addEventHandler, eventType } from "@/lib/libft";

let gameState;
let canvas;
let context;
let ratio;

const drawPaddle = (x, y) => {
  context.fillStyle = "#ffffff";
  context.fillRect(x * ratio, y * ratio, 20 * ratio, canvas.height / 5);
};

const drawBall = (x, y) => {
  context.fillStyle = "#ffffff";
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

const LocalGamePage = () => {
  const [gameStat, setGameStat] = useState([]);
  let directionRight = dirStat.STOP;
  let directionLeft = dirStat.STOP;
  let startFlag = false;

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      directionRight = e.key === "ArrowUp" ? dirStat.UP : dirStat.DOWN;
      ws_gamelogic.getState().socket.send(
        JSON.stringify({
          type: "move_bar",
          direction: directionRight === dirStat.UP ? "up" : "down",
          role: "right",
        })
      );
    }
    if (e.key === "w" || e.key === "s") {
      directionLeft = e.key === "w" ? dirStat.UP : dirStat.DOWN;
      ws_gamelogic.getState().socket.send(
        JSON.stringify({
          type: "move_bar",
          direction: directionLeft === dirStat.UP ? "up" : "down",
          role: "left",
        })
      );
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      directionRight = dirStat.STOP;
      ws_gamelogic.getState().socket.send(
        JSON.stringify({
          type: "move_bar",
          direction: "stop",
          role: "right",
        })
      );
    }
    if (e.key === "w" || e.key === "s") {
      directionLeft = dirStat.STOP;
      ws_gamelogic.getState().socket.send(
        JSON.stringify({
          type: "move_bar",
          direction: "stop",
          role: "left",
        })
      );
    }
  };

  useEffect(() => {
    const socketAsync = async () => {
      connectGameLogicWebSocket(
        ws_gamelogic.dispatch,
        `/ws/localgame/${history.currentPath().split("/")[2]}/`
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
          setGameStat([data.game.scores, data.game.roles]);
          let timer = 3;
          let interval = setInterval(() => {
            console.log(timer);
            timer--;
            const counter = document.querySelector(".pong-game-info h1");
            counter.innerText = timer;
            if (timer <= 0) {
              counter.style.display = "none";
              clearInterval(interval);
              ws_gamelogic
                .getState()
                .socket.send(JSON.stringify({ type: "start_game" }));
            }
          }, 1000);
          window.addEventListener("keydown", handleKeyDown);
          window.addEventListener("keyup", handleKeyUp);
        } else if (data.type === "update_game") {
          gameState = data.game;
          setGameStat([data.game.scores, data.game.roles]);
        } else if (data.type === "game_over") {
          alert(data.winner + " win!");
          gotoPage(`/lobby`);
        } else if (data.type === "error") {
          alert(data.message);
          console.log(data.message);
          gotoPage("/lobby");
        }
      };
    };
    socketAsync();
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
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

    document.querySelector(
      ".pong-game-info > p.user1"
    ).style.left = `calc(52% - ${canvas.width / 2}px)`;
    document.querySelector(
      ".pong-game-info > p.user2"
    ).style.right = `calc(52% - ${canvas.width / 2}px)`;

    ratio = canvas.width / 1200;
    update();
  }, [gameStat]);

  return (
    <div>
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
  );
};

export default LocalGamePage;

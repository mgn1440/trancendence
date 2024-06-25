import { useEffect, useState, useRef } from "@/lib/dom";
import { gotoPage, isEmpty } from "@/lib/libft";
import { history } from "@/lib/router";
import { ws_gamelogic, connectGameLogicWebSocket } from "@/store/gameLogicWS";
import { addEventArray, addEventHandler, eventType } from "@/lib/libft";
import { clientUserStore } from "@/store/clientUserStore";
import { LoseMessage, WinMessage } from "./components/ResultMessage";
import {
  draw,
  setGameState,
  canvas,
  setCanvas,
  setRatio,
} from "./utils/GameLogic";

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
  const [gameResult, setGameResult] = useState(null);
  // const [gameScore, setGameScore] = useState({});
  let direction = dirStat.STOP;
  let startFlag = false;
  useEffect(() => {
    const socketAsync = async () => {
      connectGameLogicWebSocket(
        ws_gamelogic.dispatch,
        `/ws/game/${history.currentPath().split("/")[2]}/`
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
        if (data.type === "game_start") {
          startFlag = true;
          setGameState(data.game);
          // setGameScore(data.game.scores);
          // setGameUsers(data.game.roles);
          setGameStat([data.game.scores, data.game.roles]);
          let timer = 3;
          let interval = setInterval(() => {
            timer--;
            const counter = document.querySelector(".pong-game-info h1");
            if (counter) {
              counter.innerText = timer;
              if (timer <= 0) {
                counter.style.display = "none";
                clearInterval(interval);
                ws_gamelogic
                  .getState()
                  .socket.send(JSON.stringify({ type: "start_game" }));
              }
            } else {
              timer++;
              clearInterval(interval);
            }
          }, 1000);
          addEventArray(eventType.KEYDOWN, (e) => {
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
          addEventArray(eventType.KEYUP, (e) => {
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
          addEventHandler();
        } else if (data.type === "update_game") {
          setGameState(data.game);
          // setGameScore(data.game.scores);
          // setGameUsers(data.game.roles);
          setGameStat([data.game.scores, data.game.roles]);
        } else if (data.type === "game_over") {
          if (clientUserStore.getState().client.username === data.winner) {
            setGameResult(1);
          } else {
            setGameResult(2);
          }
          setTimeout(() => {
            gotoPage(`/lobby/${data.room_id}`);
          }, 5000);
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
    if (window.innerHeight / 3 > window.innerWidth / 4) {
      setCanvas(
        document.getElementById("pong-game"),
        window.innerWidth - 10,
        (window.innerWidth * 3) / 4 - 10
      );
    } else {
      setCanvas(
        document.getElementById("pong-game"),
        (window.innerHeight * 4) / 3 - 10,
        window.innerHeight - 10
      );
    }

    document.querySelector(
      ".pong-game-info > p.user1"
    ).style.left = `calc(52% - ${canvas.width / 2}px)`;
    document.querySelector(
      ".pong-game-info > p.user2"
    ).style.right = `calc(52% - ${canvas.width / 2}px)`;

    setRatio(canvas.width / 1200);
    update();
  }, [gameStat]);
  return (
    <div class="game-display">
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

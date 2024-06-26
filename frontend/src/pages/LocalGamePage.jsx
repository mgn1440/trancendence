import { useEffect, useState, useRef } from "@/lib/dom";
import { gotoPage, isEmpty } from "@/lib/libft";
import { history } from "@/lib/router";
import { ws_gamelogic, connectGameLogicWebSocket } from "@/store/gameLogicWS";
import { addEventArray, addEventHandler, eventType } from "@/lib/libft";
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
        if (data.type === "game_start") {
          startFlag = true;
          setGameState(data.game);
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
          window.addEventListener("keydown", handleKeyDown);
          window.addEventListener("keyup", handleKeyUp);
        } else if (data.type === "update_game") {
          setGameState(data.game);
          setGameStat([data.game.scores, data.game.roles]);
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
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
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

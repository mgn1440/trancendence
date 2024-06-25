import { useEffect, useState, useRef } from "@/lib/dom";
import { gotoPage, isEmpty } from "@/lib/libft";
import { history } from "@/lib/router";
import { ws_gamelogic, connectGameLogicWebSocket } from "@/store/gameLogicWS";
import { addEventArray, addEventHandler, eventType } from "@/lib/libft";
import { clientUserStore } from "@/store/clientUserStore";
import { LoseMessage, WinMessage } from "./components/ResultMessage";
import Bracket from "./components/Bracket";
import {
  draw,
  setGameState,
  canvas,
  setCanvas,
  setRatio,
} from "./utils/GameLogic";

let role;
let match;
let users;

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
        // console.log(data);
        if (data.type === "game_start") {
          startFlag = true;
          setGameState(data.game);
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
          setGameState(data.game);
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
          setGameState(data.game);
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
    let windowH = window.innerHeight;
    if (window.innerHeight > 800) {
      windowH = window.innerHeight - 400;
    }
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

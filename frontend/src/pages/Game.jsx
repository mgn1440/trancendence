import { useEffect, useState } from "@/lib/dom";
import { isEmpty } from "@/lib/libft";
import { history } from "@/lib/router";
// game
// :
// ball
// :
// {x: 500, y: 500, radius: 10, speedX: 10, speedY: 10}
// player_bar
// :
// {left: 400, right: 400}
// players
// :
// (2) ['hyungjuk', 'surkim']
// roles
// :
// {left: 'hyungjuk', right: 'surkim'}
// scores
// :
// {left: 0, right: 0}
// [[Prototype]]
// :
// Object
// type
// :
// "game_start"
// [[Prototype]]
// :
// Object
let gameState;
let canvas;
let context;

const drawPaddle = (x, y) => {
  context.fillStyle = "#ffffff";
  context.fillRect(x, (canvas.height * y) / 900, 20, canvas.height / 5);
};

const drawBall = (x, y) => {
  context.fillStyle = "#ffffff";
  // context.fillRect(x, y, 20, 20);
  context.beginPath();
  context.arc(
    (gameState.ball.x * canvas.width) / 1200,
    (gameState.ball.y * canvas.height) / 900,
    gameState.ball.radius,
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
  drawPaddle(canvas.width - 40, gameState.player_bar.right);
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
  const [gameUsers, setGameUsers] = useState({});
  const [gameScore, setGameScore] = useState({});
  let direction = dirStat.STOP;
  let startFlag = false;
  useEffect(() => {
    const socketAsync = async () => {
      const socket = new WebSocket(
        "ws://" +
          "localhost:8000" +
          `/ws/game/${history.currentPath().split("/")[2]}/`
      );

      socket.onopen = (e) => {
        const waitOpponent = async () => {
          await new Promise((resolve) => setTimeout(resolve, 10000));
          if (!startFlag) {
            socket.send(JSON.stringify({ type: "error", message: "timeout" }));
          }
        };
        waitOpponent();
      };

      socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "game_start") {
          startFlag = true;
          gameState = data.game;
          setGameScore(data.game.scores);
          setGameUsers(data.game.roles);
          setInterval(() => {}, 1000);
          socket.send(JSON.stringify({ type: "start_game" }));
          document.addEventListener("keydown", (e) => {
            if (
              // direction === dirStat.STOP &&
              e.key === "ArrowUp" ||
              e.key === "ArrowDown"
            ) {
              direction = e.key === "ArrowUp" ? dirStat.UP : dirStat.DOWN;
              socket.send(
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
              socket.send(
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
        } else if (data.type === "game_over") {
          alert(data.winner + " win!");
          window.location.href = `/lobby/${data.host_username}`;
        } else if (data.type === "error") {
          alert(data.message);
          window.location.href = "/lobby";
        }
      };
    };
    socketAsync();
  }, []);

  useEffect(() => {
    // if (isEmpty(gameUsers) || isEmpty(gameScore)) return;
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

    update();
  }, [gameUsers, gameScore]);
  return (
    <div>
      <div class="pong-game-main">
        <canvas id="pong-game"></canvas>
        {isEmpty(gameUsers) || isEmpty(gameScore) ? null : (
          <div class="pong-game-info">
            <p class="user1">{gameUsers.left}</p>
            <p class="user2">{gameUsers.right}</p>
            <h6 class="user1">{gameScore.left}</h6>
            <h6 class="user2">{gameScore.right}</h6>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;

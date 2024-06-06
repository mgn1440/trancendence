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
  context.fillRect(x, y, 20, canvas.height / 5);
};

const drawBall = (x, y) => {
  context.fillStyle = "#ffffff";
  // context.fillRect(x, y, 20, 20);
  context.beginPath();
  context.arc(x, y, 10, 0, Math.PI * 2);
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
  drawPaddle(20, 200);
  drawPaddle(canvas.width - 40, 500);
  drawBall(400, 400);
  drawLine();
  // context.font = "20px Quantico";
  // context.fillText("User1", 10, 20);
};

const update = () => {
  console.log("update");
  draw();
  // requestAnimationFrame(() => update());
};

const GamePage = () => {
  const [gameUsers, setGameUsers] = useState({});
  const [gameScore, setGameScore] = useState({});
  useEffect(() => {
    const socketAsync = async () => {
      const socket = new WebSocket(
        "ws://" +
          "localhost:8000" +
          `/ws/game/${history.currentPath().split("/")[2]}/`
      );

      socket.onopen = (e) => {
        console.log("Game Socket Connected");
      };

      socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log(data);
        if (data.type === "game_start") {
          gameState = data.game;
          console.log(gameState);
          setGameScore(data.game.scores);
          setGameUsers(data.game.roles);
          setInterval(() => {}, 1000);
        }
      };
    };
    socketAsync();
  }, []);

  useEffect(() => {
    canvas = document.getElementById("pong-game");
    console.log(window.innerHeight, window.innerWidth);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context = canvas.getContext("2d");
    context.scale(1, 1);

    update();
  }, [gameUsers, gameScore]);
  return (
    <div>
      <div>
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

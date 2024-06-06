import { useEffect } from "@/lib/dom";

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
  draw();
  requestAnimationFrame(() => update());
};

const GamePage = () => {
  useEffect(() => {
    canvas = document.getElementById("pong-game");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context = canvas.getContext("2d");
    context.scale(1, 1);

    update();
  }, []);
  return (
    <div>
      <canvas id="pong-game"></canvas>
      <div class="pong-game-info">
        <p class="user1">User1</p>
        <p class="user2">User2</p>
        <h6 class="user1">Score 1</h6>
        <h6 class="user2">Score 2</h6>
      </div>
    </div>
  );
};

export default GamePage;

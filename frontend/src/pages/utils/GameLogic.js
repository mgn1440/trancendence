let gameState;
export let canvas;
let context;
let ratio;

export const setGameState = (state) => {
  gameState = state;
};

export const setCanvas = (canvasElem, width, height) => {
  canvas = canvasElem;
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext("2d");
  context.scale(1, 1);
};

export const setRatio = (value) => {
  ratio = value;
};

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

export const draw = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#181818";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  drawPaddle(20, gameState.player_bar.left);
  drawPaddle(1160, gameState.player_bar.right);
  drawBall(gameState.ball.x, gameState.ball.y);
  drawLine();
};

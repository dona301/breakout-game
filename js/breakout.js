const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_WIDTH = 45;
const BRICK_HEIGHT = 15;
const BRICK_PADDING_HORIZONTAL = 30;
const BRICK_PADDING_VERTICAL = 15;
const BRICK_OFFSET_TOP = 60;
const BRICK_COLORS = [
    "rgb(153, 51, 0)",
    "rgb(255, 0, 0)",
    "rgb(255, 153, 204)",
    "rgb(0, 255, 0)",
    "rgb(255, 255, 153)"
];

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const PADDLE_COLOR = "rgb(143,142,142)";
const PADDLE_SPEED = 4;
const PADDLE_Y = CANVAS_HEIGHT - 60;

const BALL_SIZE = 10;
const INITIAL_BALL_SPEED = 2;
const BALL_COLOR = "rgb(255, 255, 255)";

let canvas, ctx;
let bricks = [];
let score = 0;
let highScore = 0;
let gameState = "start";

let paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
let rightPressed = false;
let leftPressed = false;

let ballX = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
let ballY = CANVAS_HEIGHT - 60 - BALL_SIZE - 5;
let dx = INITIAL_BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
let dy = -INITIAL_BALL_SPEED;
let ballLaunched = false;

window.onload = function () {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    initGame();

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    requestAnimationFrame(gameLoop);
};
function initGame() {
    highScore = getHighestScore();
    drawStartScreen();
    initBricks();
    drawPaddle();
    drawBall();
}
function gameLoop() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    switch (gameState) {
        case "start":
            drawStartScreen();
            drawBricks();
            drawPaddle();
            drawBall();
            break;
        case "playing":
            updatePaddle();
            updateBall();
            collisionDetection();
            drawBricks();
            drawPaddle();
            drawBall();
            drawScore();
            break;
        case "gameover":
            drawGameOverScreen();
            drawScore();
            updateHighScore();
            break;
        case "win":
            drawWinScreen();
            drawScore();
            updateHighScore();
            break;
    }

    requestAnimationFrame(gameLoop);
}

function getHighestScore() {
    const stored = localStorage.getItem("highestScore");
    return stored ? parseInt(stored) : 0;
}

function drawStartScreen() {
    const titleText = "BREAKOUT";
    const subtitleText = "Press SPACE to begin";

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 36px Verdana";
    ctx.fillText(titleText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    ctx.font = "italic bold 18px Verdana";
    ctx.fillText(subtitleText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10 + 18 + 9);
}

function drawGameOverScreen() {
    ctx.fillStyle = "yellow";
    ctx.font = "bold 40px Verdana";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 );
}

function drawWinScreen() {
    ctx.fillStyle = "yellow";
    ctx.font = "bold 40px Verdana";
    ctx.textAlign = "center";
    ctx.fillText("YOU WIN!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}

function drawScore() {
    ctx.font = "20px Verdana";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, 20, 20);

    ctx.textAlign = "right";
    ctx.fillText(" High score: " + highScore, CANVAS_WIDTH - 100, 20);
}

function drawPaddle() {
    ctx.fillStyle = PADDLE_COLOR;
    apply3DShadow();
    ctx.fillRect(paddleX, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    resetShadow();
}

function drawBall() {
    ctx.fillStyle = BALL_COLOR;
    apply3DShadow();
    ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);
    resetShadow();
}

function drawBricks() {
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            const brick = bricks[row][col];
            if (brick.visible) {
                apply3DShadow();
                ctx.fillStyle = brick.color;
                ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                resetShadow();

            }
        }
    }
}

function apply3DShadow() {
    ctx.shadowBlur = 5;
    ctx.shadowColor = "grey";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
}

function resetShadow() {
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}
function initBricks() {
    bricks = [];
    const totalBrickWidth = BRICK_COLS * BRICK_WIDTH + (BRICK_COLS - 1) * BRICK_PADDING_HORIZONTAL;
    const startX = (CANVAS_WIDTH - totalBrickWidth) / 2;

    for (let row = 0; row < BRICK_ROWS; row++) {
        bricks[row] = [];
        for (let col = 0; col < BRICK_COLS; col++) {
            const brickX = startX + col * (BRICK_WIDTH + BRICK_PADDING_HORIZONTAL);
            const brickY = BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING_VERTICAL);

            bricks[row][col] = {
                x: brickX,
                y: brickY,
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                color: BRICK_COLORS[row],
                visible: true
            };
        }
    }
    drawBricks();
}

function handleKeyDown(e) {
    switch (e.code) {
        case "ArrowRight":
        case "KeyD":
            rightPressed = true;
            break;
        case "ArrowLeft":
        case "KeyA":
            leftPressed = true;
            break;
        case "Space":
            if (gameState === "start") {
                gameState = "playing";
                ballLaunched = true;
            } else if (gameState === "gameover" || gameState === "win") {
                resetGame();
            }
            break;
    }
}

function handleKeyUp(e) {
    switch (e.code) {
        case "ArrowRight":
        case "KeyD":
            rightPressed = false;
            break;
        case "ArrowLeft":
        case "KeyA":
            leftPressed = false;
            break;
    }
}

function updatePaddle() {
    if (rightPressed && paddleX < CANVAS_WIDTH - PADDLE_WIDTH) {
        paddleX += PADDLE_SPEED;
    }
    if (leftPressed && paddleX > 0) {
        paddleX -= PADDLE_SPEED;
    }
}
function updateBall() {
    if (!ballLaunched) {
        ballX = paddleX + PADDLE_WIDTH / 2 - BALL_SIZE / 2;
        ballY = CANVAS_HEIGHT - 60 - BALL_SIZE - 5;
        return;
    }
    ballX += dx;
    ballY += dy;

    if (ballX < 0) {
        ballX = 0;
        dx = -dx;
    } else if (ballX + BALL_SIZE > CANVAS_WIDTH) {
        ballX = CANVAS_WIDTH - BALL_SIZE;
        dx = -dx;
    }

    if (ballY < 0) {
        ballY = 0;
        dy = -dy;
    }

    const paddleY = CANVAS_HEIGHT - 60;
    if (ballY + BALL_SIZE >= paddleY &&
        ballX + BALL_SIZE > paddleX &&
        ballX < paddleX + PADDLE_WIDTH) {
        dy = -dy;
        let hitPoint = (ballX + BALL_SIZE / 2) - (paddleX + PADDLE_WIDTH / 2);
        dx = hitPoint * 0.05;
    }

    if (ballY + BALL_SIZE > CANVAS_HEIGHT) {
        gameState = "gameover";
    }

    collisionDetection();
}

function collisionDetection() {
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            const b = bricks[row][col];
            if (!b.visible) continue;

            if (
                ballX + BALL_SIZE < b.x ||
                ballX > b.x + b.width ||
                ballY + BALL_SIZE < b.y ||
                ballY > b.y + b.height
            ) {
                continue;
            }

            const overlapLeft = (ballX + BALL_SIZE) - b.x;
            const overlapRight = (b.x + b.width) - ballX;
            const overlapTop = (ballY + BALL_SIZE) - b.y;
            const overlapBottom = (b.y + b.height) - ballY;

            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            if (minOverlap === overlapLeft) {
                dx = -Math.abs(dx);
            }
            else if (minOverlap === overlapRight) {
                dx = Math.abs(dx);
            }
            else if (minOverlap === overlapTop) {
                dy = -Math.abs(dy);
            }
            else if (minOverlap === overlapBottom) {
                dy = Math.abs(dy);
            }

            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                dx *= 1.02;
            } else {
                dy *= 1.02;
            }

            b.visible = false;
            score++;

            if (score === BRICK_ROWS * BRICK_COLS) {
                gameState = "win";
            }

            return;
        }
    }
}

function resetGame() {
    paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    ballX = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
    ballY = CANVAS_HEIGHT - 60 - BALL_SIZE - 5;
    dx = INITIAL_BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
    dy = -INITIAL_BALL_SPEED;
    ballLaunched = false;
    initBricks();
    score = 0;
    gameState = "start";
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highestScore", highScore);
    }
}


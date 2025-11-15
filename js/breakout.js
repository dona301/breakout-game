const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_WIDTH = 45;
const BRICK_HEIGHT = 15;
const BRICK_PADDING_HORIZONTAL = 30;
const BRICK_PADDING_VERTICAL = 15;
const BRICK_OFFSET_TOP = 60;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const PADDLE_COLOR = "rgb(143,142,142)";
const BALL_SIZE = 10;
const INITIAL_BALL_SPEED = 2;
const PADDLE_SPEED = 4;
const BALL_COLOR = "rgb(255, 255, 255)";
const BRICK_COLORS = [
    "rgb(153, 51, 0)",
    "rgb(255, 0, 0)",
    "rgb(255, 153, 204)",
    "rgb(0, 255, 0)",
    "rgb(255, 255, 153)"
];

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
    highScore = getHighestScore();
    drawStartScreen();
    initBricks();
    initBall();
    initPaddle();
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    requestAnimationFrame(gameLoop);
};

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
    if(localStorage.getItem("highestScore") == null) {
        localStorage.setItem("highestScore", "0");
        return "0"
    } else {
        return localStorage.getItem("highestScore");
    }
}

function drawStartScreen() {
    ctx.fillStyle = "white";
    ctx.font = "50px Helvetica";
    ctx.textAlign = "center";
    ctx.fillText("BREAKOUT", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

    ctx.font = "25px Helvetica";
    ctx.fillText("Pritisni SPACE", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
}

function drawGameOverScreen() {
    ctx.fillStyle = "white";
    ctx.font = "50px Helvetica";
    ctx.textAlign = "center";
    ctx.fillText("KRAJ", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

    ctx.font = "25px Helvetica";
    ctx.fillText("Pritisni SPACE za ponovni pokušaj!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
}

function drawWinScreen() {
    ctx.fillStyle = "white";
    ctx.font = "50px Helvetica";
    ctx.textAlign = "center";
    ctx.fillText("BRAVO!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

    ctx.font = "25px Helvetica";
    ctx.fillText("Pritisni SPACE za ponovni pokušaj!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
}


function drawScore() {
    ctx.font = "20px Helvetica";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText("Trenutno: " + score, 20, 20);

    ctx.textAlign = "right";
    ctx.fillText("Najbolji: " + highScore, CANVAS_WIDTH - 100, 20);
}

function drawPaddle() {
    const paddleY = CANVAS_HEIGHT - 60;
    ctx.fillStyle = PADDLE_COLOR;
    ctx.shadowBlur = 5;
    ctx.shadowColor = "white";
    ctx.fillRect(paddleX, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
}

function drawBall() {
    ctx.fillStyle = BALL_COLOR;
    ctx.shadowBlur = 5;
    ctx.shadowColor = "white";
    ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);
}

function drawBricks() {
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            const brick = bricks[row][col];
            if (brick.visible) {
                ctx.shadowBlur = 5;
                ctx.shadowColor = "white";
                ctx.fillStyle = brick.color;
                ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            }
        }
    }
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

function initPaddle() {
    drawPaddle();
}

function initBall() {
    drawBall();
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
            if (b.visible) {
                if (ballX + BALL_SIZE > b.x &&
                    ballX < b.x + b.width &&
                    ballY + BALL_SIZE > b.y &&
                    ballY < b.y + b.height) {

                    dy = -dy;
                    b.visible = false;
                    score++;

                    if (score === BRICK_ROWS * BRICK_COLS) {
                        gameState = "win";
                    }
                }
            }
        }
    }
}

function resetGame() {
    paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    ballX = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
    ballY = CANVAS_HEIGHT - 60 - BALL_SIZE - 5;
    dx = INITIAL_BALL_SPEED;
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


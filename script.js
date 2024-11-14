const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const ballRadius = 10;

let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

const paddleHeight = 10;
const paddleWidth = 75;

let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

const brickRowCount = 5;
const brickColumnCount = 3;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let score = 0;
let lives = 3;

let bricks = [];
let items = []; // 用于存放道具

let isSpeedUp = false;
let isPaddleWide = false;
let isMultipleBalls = false;
let isSlowMotion = false;

let balls = [{ x, y, dx, dy, radius: ballRadius }]; // 多球模式的支持

// 初始化砖块
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

// 监听事件
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

// 键盘按下事件
function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  }
}

// 键盘抬起事件
function keyUpHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
  }
}

// 鼠标移动事件
function mouseMoveHandler(e) {
  let relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

// 碰撞检测
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status == 1) {
        if (balls[0].x > b.x && balls[0].x < b.x + brickWidth && balls[0].y > b.y && balls[0].y < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          score++;
          if (score == brickRowCount * brickColumnCount) {
            alert("YOU WIN, CONGRATS!");
            document.location.reload();
          }
          
          // 随机生成道具
          if (Math.random() < 0.3) { // 30%几率掉落道具
            generateItem(b.x, b.y);
          }
        }
      }
    }
  }
}

// 生成道具
function generateItem(brickX, brickY) {
  const type = Math.floor(Math.random() * 4); // 随机选择道具类型（4种道具）
  items.push({ x: brickX, y: brickY, type, width: 20, height: 20, active: true });
}

// 绘制小球
function drawBall() {
  balls.forEach(ball => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.closePath();
  });
}

// 绘制挡板
function drawPaddle() {
  const width = isPaddleWide ? paddleWidth * 1.5 : paddleWidth; // 如果是扩展挡板，调整宽度
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, width, paddleHeight);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.closePath();
}

// 绘制砖块
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status == 1) {
        const brickX = r * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = c * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

// 绘制道具
function drawItems() {
  items.forEach(item => {
    if (item.active) {
      ctx.beginPath();
      ctx.rect(item.x, item.y, item.width, item.height);
      ctx.fillStyle = item.type === 0 ? "red" : item.type === 1 ? "green" : item.type === 2 ? "blue" : "yellow";
      ctx.fill();
      ctx.closePath();
    }
  });
}

// 绘制分数和生命值
function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

// 检查道具是否与挡板碰撞
function itemCollisionDetection() {
  items.forEach(item => {
    if (item.active) {
      if (balls[0].x > item.x && balls[0].x < item.x + item.width && balls[0].y + ballRadius > item.y) {
        item.active = false;
        if (item.type === 0) {
          isSpeedUp = true;
        } else if (item.type === 1) {
          isPaddleWide = true;
          setTimeout(() => isPaddleWide = false, 5000); // 扩展挡板持续5秒
        } else if (item.type === 2) {
          isMultipleBalls = true;
          balls.push({ x: balls[0].x, y: balls[0].y, dx: 1.5, dy: -2, radius: ballRadius });
          balls.push({ x: balls[0].x, y: balls[0].y, dx: -1.5, dy: -2, radius: ballRadius });
          // 在多球模式结束后，5秒内恢复原始状态
          setTimeout(() => {
            isMultipleBalls = false;
            balls = balls.slice(0, 1);  // 保留原来的一个球
          }, 3000); // 多球效果持续3秒
        } else if (item.type === 3) {
          isSlowMotion = true;
          setTimeout(() => isSlowMotion = false, 5000); // 慢动作模式持续5秒
        }
      }
    }
  });
}

// 游戏主绘制函数
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
  drawItems();
  collisionDetection();
  itemCollisionDetection();

  if (isSlowMotion) {
    dx = dx * 0.5;
    dy = dy * 0.5;
  }

  balls.forEach(ball => {
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
      ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
      if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
        ball.dy = -ball.dy;
      } else {
        lives--;
        if (!lives) {
          alert("GAME OVER");
          document.location.reload();
        } else {
          ball.x = canvas.width / 2;
          ball.y = canvas.height - 30;
          ball.dx = 3;
          ball.dy = -3;
          paddleX = (canvas.width - paddleWidth) / 2;
        }
      }
    }
  });

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  balls.forEach(ball => {
    ball.x += ball.dx;
    ball.y += ball.dy;
  });

  requestAnimationFrame(draw);
}

document.getElementById("runButton").addEventListener("click", function () {
    draw();
    this.disabled = true;
  });
  

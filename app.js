const c = document.getElementById("myCanvas");
const canvasWidth = c.width;
const canvasHeight = c.height;
const ctx = c.getContext("2d");
let count = 0;

// -----參數設定-----

//彈跳版設定
let groundX = 500;
let groundY = c.height - 50;
let groundHeight = 5;
let groungWidth = 100;

//球位置及半徑設定
let radius = 10;
let circle_x = groundX + groungWidth / 2;
let circle_y = groundY - radius;

//球方向及速度設定
let xSpeed = 5;
let ySpeed = -5;

//磚塊設定
let brickArray = [];
let brickWidth = 50;
let brickHeight = 25;
let brickTotal = 100;
let brickBlock = 10;
let itemBrick = 20;
let remainBlock = brickBlock;
let brickSpawnRange = [50, c.width - 50, 100, c.height - 300];

class Brick {
  constructor() {
    this.pickALocation();
    this.visible = true;
    if (remainBlock != 0) {
      this.state = 10;
      brickArray.push(this);
      remainBlock--;
    } else if (itemBrick != 0) {
      this.state = 5;
      brickArray.push(this);
      itemBrick--;
    } else {
      if (Math.floor(Math.random() * 2) == 1) {
        this.state = 2;
      } else {
        this.state = 1;
      }
      brickArray.push(this);
    }
  }

  drawBrick() {
    if (this.state == 10) {
      ctx.fillStyle = "grey";
    } else if (this.state == 2 || this.state == 5) {
      ctx.fillStyle = "red";
    } else if (this.state == 1 || this.state == 4) {
      ctx.fillStyle = "pink";
    }
    ctx.fillRect(this.x, this.y, brickWidth, brickHeight);
    ctx.strokeStyle = "black";
    ctx.strokeRect(this.x, this.y, brickWidth, brickHeight);
  }

  getRandomArbitrary(min, max, unit) {
    return min + Math.floor((Math.random() * (max - min)) / unit) * unit;
  }

  pickALocation() {
    let overLapping = false;
    let new_x;
    let new_y;

    function checkOverLapping(new_x, new_y) {
      for (let i = 0; i < brickArray.length; i++) {
        if (new_x == brickArray[i].x && new_y == brickArray[i].y) {
          overLapping = true;
          return;
        } else {
          overLapping = false;
        }
      }
    }

    do {
      new_x = this.getRandomArbitrary(
        brickSpawnRange[0],
        brickSpawnRange[1],
        brickWidth
      );
      new_y = this.getRandomArbitrary(
        brickSpawnRange[2],
        brickSpawnRange[3],
        brickHeight
      );
      checkOverLapping(new_x, new_y);
    } while (overLapping);

    this.x = new_x;
    this.y = new_y;
  }

  touchingDot(dotX, dotY) {
    return (
      dotX >= this.x &&
      dotX <= this.x + brickWidth &&
      dotY >= this.y &&
      dotY <= this.y + brickHeight
    );
  }

  checkBrickState(brick) {
    if (brick.state != 10) {
      brick.state--;
    }
    if (brick.state == 0) {
      brick.visible = false;
      count++;
    }
    if (brick.state == 3) {
      brick.visible = false;
      count++;
      new Item(brick);
    }
  }
}

//掉落物設定
let itemArray = [];
let itemRadius = 10;
let itemSpeed = 2;

class Item {
  constructor(brick) {
    this.x = brick.x + brickWidth / 2;
    this.y = brick.y + brickHeight / 2;
    if (Math.floor(Math.random() * 2) == 0) {
      this.type = "good";
    } else {
      this.type = "bad";
    }
    itemArray.push(this);
  }

  drawItem() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, itemRadius, 0, 2 * Math.PI);

    if (this.type == "good") {
      ctx.fillStyle = "green";
    } else {
      ctx.fillStyle = "blue";
    }

    ctx.fill();
  }

  checkY(item, index) {
    if (
      item.y >= groundY - itemRadius &&
      item.y <= groundY &&
      item.x >= groundX &&
      item.x <= groundX + groungWidth
    ) {
      this.powerUP();
      itemArray.splice(index, 1);
    }
    if (item.y > c.height) {
      itemArray.splice(index, 1);
    }
  }

  powerUP() {
    if (this.type == "good") {
      switch (Math.floor(Math.random() * 3 + 1)) {
        case 1:
          console.log("彈跳板增大");
          if (groungWidth < c.width / 2) {
            groungWidth *= 2;
          } else {
            groungWidth = c.width / 2;
          }
          break;
        case 2:
          console.log("加速");
          if (xSpeed < 8) {
            xSpeed *= 1.5;
            ySpeed *= 1.5;
          }
          break;
        case 3:
          console.log("球增大");
          if (radius < 10) {
            radius += 5;
          }
          break;
      }
    } else {
      switch (Math.floor(Math.random() * 3 + 1)) {
        case 1:
          console.log("彈跳板縮小");
          if (groungWidth > c.width / 10) {
            groungWidth /= 2;
          } else {
            groungWidth = c.width / 10;
          }
          break;
        case 2:
          console.log("減速");
          if (xSpeed > 5) {
            xSpeed = 5;
            ySpeed = 5;
          }
          break;
        case 3:
          console.log("球縮小");
          if (radius > 5) {
            radius -= 5;
          }
          break;
      }
    }
  }
}

// -----canvas作圖-----

//監聽並更新滑鼠座標
let mouseX;
c.addEventListener("mousemove", (event) => {
  mouseX = event.pageX - c.offsetLeft; //滑鼠在canvas上的相對位置
  groundX = mouseX - groungWidth / 2;
});

//繪製彈跳板
function drawFloor() {
  if (mouseX < groungWidth / 2) {
    groundX = 0;
  }
  if (mouseX > canvasWidth - groungWidth / 2) {
    groundX = canvasWidth - groungWidth;
  }
  ctx.fillStyle = "yellow";
  ctx.fillRect(groundX, groundY, groungWidth, groundHeight);
}

//繪製球
function drawCircle() {
  ctx.beginPath();
  ctx.arc(circle_x, circle_y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "yellow";
  ctx.fill();
}

//繪製磚塊
for (let i = 0; i < brickTotal; i++) {
  new Brick();
}

//繪製遊戲
function draw() {
  //檢查是否碰到磚塊
  brickArray.forEach((brick) => {
    if (brick.visible) {
      if (
        brick.touchingDot(circle_x, circle_y - radius) ||
        brick.touchingDot(circle_x, circle_y + radius)
      ) {
        ySpeed *= -1;
        circle_y += ySpeed * 2;

        brick.checkBrickState(brick);
      }
      if (
        brick.touchingDot(circle_x - radius, circle_y) ||
        brick.touchingDot(circle_x + radius, circle_y)
      ) {
        xSpeed *= -1;
        circle_x += xSpeed * 2;

        brick.checkBrickState(brick);
      }
    }
  });

  //檢查是否碰到邊框
  if (circle_x <= 0 + radius || circle_x >= canvasWidth - radius) {
    xSpeed *= -1;
    circle_x += xSpeed;
  }

  if (circle_y <= 0 + radius || circle_y >= canvasHeight - radius) {
    ySpeed *= -1;
    circle_y += ySpeed;
  }

  //檢查是否碰到彈跳板
  if (
    circle_x > groundX - radius &&
    circle_x < groundX + groungWidth + radius &&
    circle_y > groundY - radius &&
    circle_y < groundY + groundHeight + radius
  ) {
    ySpeed *= -1;
    circle_y += ySpeed * 2;
  }

  //更新球的座標
  circle_x += xSpeed;
  circle_y += ySpeed;

  //填上黑色背景
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  drawCircle();
  drawFloor();

  //重新繪製磚塊
  brickArray.forEach((brick) => {
    if (brick.visible) {
      brick.drawBrick();
    }
  });

  //更新掉落物座標並繪製
  itemArray.forEach((item, index) => {
    item.y += itemSpeed;
    item.checkY(item, index);
    item.drawItem();
  });

  if (count == brickTotal - brickBlock) {
    alert("You Win");
    clearInterval(game);
  }
}

let game = setInterval(draw, 15);

let socket = io();
let myFood = [];
let foodSize = 30;
let foodImage;
let characterX;
let characterY;
let characterSize = 80; //original size
let characterSizeIncrement = 5; 
let maxDropHeight = 100;
let badDropSpeed = 5;
let goodDropSpeed = 3;

const characterImages = [ // 将characterImage更改为characterImages
  "images/p1.png",
  "images/p2.png",
  "images/p3.png",
  "images/p4.png",
];

const badArray = [
  "images/bad1.png",
  "images/bad2.png",
  "images/bad3.png",
  "images/bad4.png",
];

const goodArray = [
  "images/good1.png",
  "images/good2.png",
  "images/good3.png",
  "images/good4.png",
  "images/good5.png",
  "images/good6.png",
  "images/good7.png",
  "images/good8.png",
];

function preload() {
  for (let i = 0; i < characterImages.length; i++) {
    characterImages[i] = loadImage(characterImages[i]); // 修正为characterImages
  }
  for (let i = 0; i < badArray.length; i++) {
    badArray[i] = loadImage(badArray[i]);
  }
  for (let i = 0; i < goodArray.length; i++) {
    goodArray[i] = loadImage(goodArray[i]);
  }
}

window.addEventListener("load", () => {
  let startButton = document.getElementById("startButton");
  startButton.addEventListener("click", () => {
    socket.emit("start", {});
  });
});

socket.on("connect", () => {
  console.log("Connected");
});

function setup() {
  createCanvas(windowWidth, 700);
  background("#a5ddbf");

  characterX = width / 2;
  characterY = height - 100;

  // 创建和初始化食物对象
  for (let i = 0; i < 15; i++) {
    const isGood = random() < 0.6;
    const foodArray = isGood ? goodArray : badArray;
    const randomImageURL =
      foodArray[Math.floor(Math.random() * foodArray.length)];
    myFood.push({
      x: random(width - foodSize),
      y: random(maxDropHeight),
      image: randomImageURL,
      touched: false,
      isGood: isGood,
    });
  }
}

function mouseMoved() {
  characterX = mouseX - characterSize / 2;
  characterY = constrain(mouseY, height - 100, height - 100);

  // 检查碰触并移除食物
  for (let i = myFood.length - 1; i >= 0; i--) {
    if (
      characterX < myFood[i].x + foodSize &&
      characterX + characterSize > myFood[i].x &&
      characterY < myFood[i].y + foodSize &&
      characterY + characterSize > myFood[i].y
    ) {
      if (myFood[i].isGood) {
        characterSize += characterSizeIncrement; // 好食物 - 增加 10 像素
      } else {
        // 随机减少 10 到 30 像素
        characterSize -= Math.floor(random(10, 31));
        characterSize = max(characterSize, 100);
      }
      myFood.splice(i, 1); // 移除食物
    }
  }

  // 发送更新的食物到服务器
  let data = {
    food: myFood,
  };
  socket.emit("foodFromClient", data);
}

function draw() {
  clear();

  // 生成新食物
  if (frameCount % 60 == 0) {
    const isGood = random() < 0.6;
    const foodArray = isGood ? goodArray : badArray;
    const randomImageURL = foodArray[Math.floor(random(foodArray.length))];
    myFood.push({
      x: random(width - foodSize),
      y: -foodSize,
      image: randomImageURL,
      touched: false,
      isGood: isGood,
    });
  }

  // 设置角色
  let characterWidth = characterSize;
  let characterHeight = characterSize;
  let characterBottom = height - characterHeight;

  // 绘制角色图像
  for (let i = 0; i < characterImages.length; i++) {
    image(characterImages[i], characterX, characterBottom, characterWidth, characterHeight);
  }

  for (let i = 0; i < myFood.length; i++) {
    if (!myFood[i].touched) {
      myFood[i].y += myFood[i].isGood ? goodDropSpeed : badDropSpeed;

      if (myFood[i].y > height) {
        myFood[i].y = -foodSize;
        myFood[i].x = random(width - foodSize);
        const foodArray = myFood[i].isGood ? goodArray : badArray;
        myFood[i].image =
          foodArray[Math.floor(Math.random() * foodArray.length)];
        myFood[i].touched = false;
      }

      const img = myFood[i].image;
      image(img, myFood[i].x, myFood[i].y, foodSize, foodSize);
    }
  }
}

let socket = io();
let myFood = [];
let foodSize = 30;
let foodImage;

let characterImage;
let characterX;
let characterY;

let maxDropHeight = 100;
let badDropSpeed = 5;
let goodDropSpeed = 3;

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
  foodImage = loadImage("images/cake.png");
  characterImage = loadImage("images/girl.png");
  for (let i = 0; i < badArray.length; i++) {
    badArray[i] = loadImage(badArray[i]);
  }
  for (let i = 0; i < goodArray.length; i++) {
    goodArray[i] = loadImage(goodArray[i]);
  }
}

window.addEventListener("load", () => {
  let startButton = document.getElementById("startButton");
  // start the food everytime the start button is clicked. A message is sent to the server asking for a new set of food.
  startButton.addEventListener("click", () => {
    socket.emit("start", {});
  });
});

socket.on("connect", () => {
  console.log("Connected");
});

function setup() {
  createCanvas(700, 700);
  background("#ffffff");

  characterX = width / 2; // center
  characterY = height - 100; // bottom

  socket.on("mouseDataServer", (data) => {
    drawPos(data);
  });
  //everytime food is updated, the local array "myFood" will get updated
  socket.on("setFood", (data) => {
    background("#fff");
    console.log(data);
    myFood = data.food;
  });

  socket.on("foodFromServer", (data) => {
    //set the local objects to the update info from the client;
    myFood = data.food;
  });
  // Create and initialize food objects with random images from "badArray"
  for (let i = 0; i < 15; i++) {
    const isGood = random() < 0.6; // 50% chance of being good or bad
    const foodArray = isGood ? goodArray : badArray;
    const randomImageURL =
      foodArray[Math.floor(Math.random() * foodArray.length)];
    myFood.push({
      x: random(width - foodSize),
      y: random(maxDropHeight),
      image: randomImageURL,
      touched: false,
      isGood: isGood, // Add isGood property
    });
  }
}

function mouseMoved() {
  let mousePos = {
    x: mouseX,
    y: mouseY,
  };

  socket.emit("mouseData", mousePos);
  //check if mouse is touching any food
  for (let i = 0; i < myFood.length; i++) {
    if (
      mouseX > myFood[i].x &&
      mouseX < myFood[i].x + foodSize &&
      mouseY > myFood[i].y &&
      mouseY < myFood[i].y + foodSize
    ) {
      myFood[i].touched = true;
      let data = {
        food: myFood,
      };
      //send updated sqObjects to server
      socket.emit("foodFromClient", data);
    }
  }
}

// function drawPos(data) {
//   fill(60, 11, 62);
//   noStroke();
//   ellipse(data.x, data.y, 5, 5);
// }

function draw() {
  clear();
  characterX = mouseX - 25;
 characterY = constrain(mouseY, height - 100, height - 100);

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

  // keep drawing the local "myFood"
  drawAllFood();
  image(characterImage, characterX, characterY, 100, 100);
}

//function to draw the food

// function drawAllFood() {
//   noStroke();

//   for (let i = 0; i < myFood.length; i++) {
//     if (myFood[i].touched == false) {
//       noFill();
//     } else {
//       fill(255);
//     }
//     image(foodImage, myFood[i].x, myFood[i].y, foodSize, foodSize);
//     rect(myFood[i].x, myFood[i].y, foodSize, foodSize);
//   }
// }

function drawAllFood() {
  noStroke();
  clear();

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
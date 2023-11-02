let socket = io();
let myFood = [];
let foodSize = 30;
let foodImage;

let maxDropHeight = 100;
let dropSpeed = 3;

const badArray = [
  "https://cdn.glitch.global/217914d9-642c-4cbb-b47b-36ae284f5c68/bad1.png?v=1698930683428",
  "https://cdn.glitch.global/217914d9-642c-4cbb-b47b-36ae284f5c68/bad2.png?v=1698930687609",
  "https://cdn.glitch.global/217914d9-642c-4cbb-b47b-36ae284f5c68/bad3.png?v=1698930688314",
  "https://cdn.glitch.global/217914d9-642c-4cbb-b47b-36ae284f5c68/bad4.png?v=1698930693115",
];

function preload() {
  foodImage = loadImage("images/cake.png");
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
  // keep drawing the local "myFood"
  drawAllFood();
}

//function to draw the food

function drawAllFood() {
  noStroke();

  for (let i = 0; i < myFood.length; i++) {
    if (myFood[i].touched == false) {
      noFill();
    } else {
      fill(255);
    }
    image(foodImage, myFood[i].x, myFood[i].y, foodSize, foodSize);
    rect(myFood[i].x, myFood[i].y, foodSize, foodSize);
  }
}

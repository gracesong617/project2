let socket = io();
let assignedCharacter;
let myCharacter ;
let players = {}; // 用于存储玩家位置信息
let characterName;
const playerSizes = {}; // 使用对象来存储玩家尺寸信息
let gameTime = 60;

const characterImages = [
  "images/p1.png",
  "images/p2.png",
  "images/p3.png",
  "images/p4.png",
];

// const characterImages = {
//   p1: "images/p1.png",
//   p2: "images/p2.png",
//   p3: "images/p3.png",
//   p4: "images/p4.png",
// };

socket.on("connect", () => {
  console.log("Connected");
  socket.emit("start");
});



socket.on("characterAssigned", (character) => {
  assignedCharacter = character;
  console.log("Assigned Character: ", assignedCharacter);

  const characterImageURL = characterImages[assignedCharacter];
  console.log("Character Image URL: ", characterImageURL);

  myCharacter = assignedCharacter;
  console.log("myCharacter: ", myCharacter);
  
  displayCharacterName(assignedCharacter);
});

socket.on("noCharactersAvailable", () => {
  console.log("No characters available. Try again later.");
});

socket.on("characterSizeUpdated", (data) => {
  const playerId = data.playerId;
  const newSize = data.size;

  playerSizes[playerId] = newSize;
  displayAllPlayersCharacterSize(playerSizes);
});

socket.on("setFood", (data) => {
  assignedCharacter = data.character;
  console.log("Assigned Character: ", assignedCharacter);
  socket.emit("characterAssigned", assignedCharacter);
  displayCharacterName(assignedCharacter);
  changeCharacterSize(characterSize); // 调用 changeCharacterSize 函数并传递 characterSize
});

function displayCharacterName(character) {
  characterName = character;
  const characterNameElement = document.getElementById("characterName");
  characterNameElement.innerText = `Your Character: ${characterName}`;
}

function changeCharacterSize(newSize) {
  socket.emit("characterSizeChanged", newSize);
}

function displayAllPlayersCharacterSize(playerSizes) {
  const playerSizeElement = document.getElementById("allPlayersCharacterSize");
  playerSizeElement.innerHTML = "";

  for (const playerId in playerSizes) {
    const size = playerSizes[playerId];
    const playerSizeDiv = document.createElement("div");
    playerSizeDiv.innerText = `Player ${assignedCharacter}: Size: ${size}`;
    playerSizeElement.appendChild(playerSizeDiv);
  }
}

function startGameTimer() {
  gameTimer = setInterval(() => { // 使用 setInterval 代替 setTimeout
    gameTime -= 1;
    if (gameTime <= 0) {
      endGame();
    }
  }, 1000); // 1s 递减
}

function endGame() {
  clearInterval(gameTimer);
  const finalScore = playerSizes[socket.id] || 0;
  socket.emit("gameEnded", { score: finalScore });
}

socket.on("gameEnded", (data) => {
  const finalScore = data.score;
  console.log("Game Ended. Final Score: " + finalScore);
});

let myFood = [];
let foodSize = 30;
let foodImage;
let characterX;
let characterY;
let characterSize = 80;
let characterSizeIncrement = 5;
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
  for (let i = 0; i < characterImages.length; i++) {
    characterImages[i] = loadImage(characterImages[i]);
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

document.addEventListener("mousemove", function(event) {
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  console.log(`Mouse X: ${mouseX}, Mouse Y: ${mouseY}`);
});

function mouseMoved() {
  console.log(`Character X: ${characterX}, Character Y: ${characterY}`);
  if (myCharacter && players[myCharacter]) {
    const player = players[myCharacter];
    const size = playerSizes[socket.id] || characterSize;

    characterX = mouseX - size / 2;
    characterY = constrain(mouseY, height - 100, height - 100);

    // Check for collisions and remove food
    for (let i = myFood.length - 1; i >= 0; i--) {
      if (
        characterX < myFood[i].x + foodSize &&
        characterX + size > myFood[i].x &&
        characterY < myFood[i].y + foodSize &&
        characterY + size > myFood[i].y
      ) {
        if (myFood[i].isGood) {
          size += characterSizeIncrement; // Good food - increase by 10 pixels
        } else {
          // Randomly decrease by 10 to 30 pixels
          size -= Math.floor(random(10, 31));
          size = max(size, 100);
        }
        myFood.splice(i, 1); // Remove food
      }
    }

    // Send updated food to the server
    let data = {
      food: myFood,
      size: size,
      x: characterX,
      y: characterY,
    };
    socket.emit("foodFromClient", data);
  }
}




function setup() {
  createCanvas(windowWidth, 700);
  background("#a5ddbf");

  characterX = width / 2;
  characterY = height - 100;

  // Create and initialize food objects
  for (let i = 0; i < 15; i++) {
    const isGood = random() < 0.6;
    const foodArray = isGood ? goodArray : badArray;
    const randomImageURL = foodArray[Math.floor(random() * foodArray.length)];
    myFood.push({
      x: random(width - foodSize),
      y: random(maxDropHeight),
      image: randomImageURL,
      touched: false,
      isGood: isGood,
    });
  }
}



function draw() {
  clear();
  console.log("myCharacter:", myCharacter);
  // Generate new food
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

  // Set character
  let characterWidth = characterSize;
  let characterHeight = characterSize;
  let characterBottom = height - characterHeight;

  // Draw character
  for (let i = 0; i < characterImages.length; i++) {
    image(
      characterImages[i],
      characterX,
      characterBottom,
      characterWidth,
      characterHeight
    );
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

  fill(255);
  textSize(16);
  text(`Controlled Character: ${myCharacter}`, 10, 30);
}



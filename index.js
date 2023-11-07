const PORT = process.env.PORT || 11000;
const express = require("express");
const app = express();
app.use("/", express.static("public"));

const food = [];
const numFood = 10;
initializeFood();

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io");
const ioServer = new io.Server(server);

// Store player data and track assigned characters
const players = {};
const assignedCharacters = {};

// Define available player character images
const playerCharacters = [
  "p1.png",
  "p2.png",
  "p3.png",
  "p4.png",
];

ioServer.on("connect", (socket) => {
  console.log("New connection : ", socket.id);

  // Player starts the game
  socket.on("start", () => {
    initializeFood();

    const playerId = socket.id;

    // Check if the player already has an assigned character
    if (assignedCharacters[playerId]) {
      // Handle the case when the player already has a character
      socket.emit("characterAlreadyAssigned");
      return;
    }

    // Assign a unique player character
    const availableCharacters = playerCharacters.filter((character) => !Object.values(assignedCharacters).includes(character));

    if (availableCharacters.length === 0) {
      // Handle the case when all characters are already in use
      socket.emit("noCharactersAvailable");
      return;
    }

    const randomCharacter = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
    assignedCharacters[playerId] = randomCharacter;

    players[playerId] = {
      x: Math.floor(Math.random() * 700),
      y: Math.floor(Math.random() * 700),
      character: randomCharacter,
    };

    const data = {
      food: food,
      playerId: playerId,
      character: randomCharacter,
    };

    // 发送分配的角色和食物数据给特定连接
    socket.emit("setFood", data);
  });

  // Handle player disconnection
  socket.on("disconnect", () => {
    if (players[socket.id]) {
      const character = players[socket.id].character;
      // Free up the character when a player disconnects
      delete assignedCharacters[socket.id];
      delete players[socket.id];
    }
    console.log("Disconnection : ", socket.id);
  });
});

server.listen(PORT, () => {
  console.log("server on port ", PORT);
});

function initializeFood() {
  food.length = 0;
  for (let i = 0; i < numFood; i++) {
    const xPos = Math.floor(Math.random() * 700);
    const yPos = Math.floor(Math.random() * 700);
    food.push({ id: i, x: xPos, y: yPos, touched: false });
  }
}

const PORT = 5000;
//creating the express app
let express = require("express");
let app = express();
app.use("/", express.static("public"));

let food = [];
let numFood = 10;
initializeFood();

//creating the http server - this is a new step!
let http = require("http");
let server = http.createServer(app);

//initialize socket.io
let io = require("socket.io");
io = new io.Server(server);

// Listen for a new connection
io.sockets.on("connect", (socket) => {
  console.log("New connection : ", socket.id);
  
   socket.on("start", () => {
    initializeFood();
    let data = {
      "food": food
    }
    io.sockets.emit("setFood", data);
  })

  socket.on("mouseData", (data) => {
    // console.log(data);
    io.sockets.emit("mouseDataServer", data);
  })

  //send the food Info that you have rx from a client to all clients
  socket.on("foodFromClient",(data) => {
    io.sockets.emit("foodFromServer", data);
  })
  
  // in case of disconnection
  socket.on("disconnect", () => {
    console.log("Disconnection : ", socket.id);
  })

})

//run the app on port 5000
server.listen(PORT, () => {
  console.log("server on port ", PORT);
})

function initializeFood() {
  food  = [];// clear the array before adding the new food;
  for(let i =0;i<numFood;i++) {
    let xPos = Math.floor(Math.random()*700); //get a random value bw 0-700 (canvas width is 700)
    let yPos = Math.floor(Math.random()*700);
    food.push({id:i,x:xPos, y:yPos, touched:false}); //set touched to false initially, once a mouse has touched, we will change this. 
  }
}
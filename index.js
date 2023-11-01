const PORT = 5000;
//creating the express app
let express = require("express");
let app = express();
app.use("/", express.static("public"));

//creating the http server - this is a new step!
let http = require("http");
let server = http.createServer(app);

//initialize socket.io
let io = require("socket.io");
io = new io.Server(server);

// Listen for a new connection
io.sockets.on("connect", (socket) => {
  console.log("New connection : ", socket.id);

  socket.on("mouseData", (data) => {
    // console.log(data);
    io.sockets.emit("mouseDataServer", data);
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

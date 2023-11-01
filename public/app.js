let socket = io();

window.addEventListener("load", ()=> {
  let startButton = document.getElementById("startButton");
  // start the food everytime the start button is clicked. A message is sent to the server asking for a new set of food.
  startButton.addEventListener("click",() => {
    socket.emit("start",{});
  })
})

socket.on("connect", () => {
    console.log("Connected");
})

function setup() {
    createCanvas(700,700);
    background("#ffffff");


    socket.on("mouseDataServer", (data) => {
        drawPos(data);
    })
  //everytime food is updated, the local array "myFood" will get updated
  socket.on("setFood",(data)=> {
    background("#fff");
    console.log(data);
    mySqObjects = data.sqObjects;
  })

  socket.on("sqObjectsFromServer", (data)=> {
    //set the local objects to the update info from the client;
    mySqObjects = data.sqObjects;
  })
}

function mouseDragged() {
    let mousePos = {
        x: mouseX,
        y: mouseY
    }

    socket.emit("mouseData", mousePos);


}



function drawPos(data) {
    if (mouseIsPressed === true){
        console.log("pressed");
    }
    fill(60, 11, 62);
    noStroke();
    ellipse(data.x, data.y, 5, 5);
}
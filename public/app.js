let socket = io();

socket.on("connect", () => {
    console.log("Connected");
})

function setup() {
    createCanvas(700,700);
    background("#ffffff");


    socket.on("mouseDataServer", (data) => {
        drawPos(data);
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
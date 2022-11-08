const canvas = document.querySelector("#stage");
const ctx = canvas.getContext("2d");
const offsetLeft = canvas.offsetLeft;
const offsetTop = canvas.offsetTop;

console.log(canvas);
ctx.strokeStyle = "#8542c0";
ctx.lineWidth = 4;

let currentX;
let currentY;
let mouseDown = false;
let signature;

function draw(x, y) {
    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    ctx.lineTo(x, y);
    currentX = x;
    currentY = y;
    ctx.stroke();
}

canvas.onmousedown = function (event) {
    mouseDown = true;
    currentX = event.clientX - offsetLeft;
    currentY = event.clientY - offsetTop;
};

canvas.onmousemove = function (event) {
    if (mouseDown) {
        draw(event.clientX - offsetLeft, event.clientY - offsetTop);
    }
};

canvas.onmouseup = function () {
    mouseDown = false;
    signature = canvas.toDataURL();
    console.log(signature);
};

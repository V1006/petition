function setup() {
    const canvas = document.querySelector("#stage");
    if (!canvas) {
        return;
    }
    const ctx = canvas.getContext("2d");
    const offsetLeft = canvas.offsetLeft;
    const offsetTop = canvas.offsetTop;
    const hiddenInput = document.querySelector(".hiddenInput");

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;

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
        hiddenInput.value = signature;
    };
}

setup();

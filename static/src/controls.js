
// Keep track of pressed keys
var keypressed = {}

// Keep track of current screen rotation
var roty, rotx;

function setUpControls(){
    roty = 0;
    rotx = 0;
    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    for (var i=65; i<91; ++i){
        keypressed[i] = false
    }
    for (var key in ['U','D','L','R']){
        keypressed[key] = false
    }

    document.getElementById("changebutton").onclick = handleButtonPress;
    document.getElementById("numchange").value = 0;
}

function keyDownHandler(event){
    if (65 <= event.keyCode && event.keyCode <= 90){
        keypressed[event.keyCode] = true;
    }else{
        switch(event.keyCode){
            case 37: keypressed['L'] = true; break;
            case 38: keypressed['U'] = true; break;
            case 39: keypressed['R'] = true; break;
            case 40: keypressed['D'] = true; break;
            default: break;
        }
    }
}

function keyUpHandler(event){
    if (65 <= event.keyCode && event.keyCode <= 90){
        keypressed[event.keyCode] = false;
    }else{
        switch(event.keyCode){
            case 37: keypressed['L'] = false; break;
            case 38: keypressed['U'] = false; break;
            case 39: keypressed['R'] = false; break;
            case 40: keypressed['D'] = false; break;
            default: break;
        }
    }
}

function updateRotation(tick){
    if (keypressed['L'] || keypressed[65]){
        roty -= tick;
    }
    if (keypressed['R'] || keypressed[68]){
        roty += tick;
    }
    if (keypressed['U'] || keypressed[87]){
        rotx += tick;
    }
    if (keypressed['D'] || keypressed[83]){
        rotx -= tick;
    }
    rotx = Math.min(Math.PI/4, Math.max(-Math.PI/4, rotx));
}

function getrot(){
    return [roty, rotx];
}

function handleButtonPress(){
    picker = document.getElementById("numchange");
    var val = parseInt(picker.value);

    // var col = document.querySelector('input[name="color"]:checked').value;

    var col = (document.getElementById("red").checked ? "red" : "blue")
    if (val < 64 && val >= 0){
        changeColor(val, col);
        picker.value = (val + 1.0) % 64;
    }
}

function clickSquare(val){
    // console.log(val);
    if (val >= 0 && val < 64){
        takeTurn(val, 0);
    }
}
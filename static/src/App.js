
// import {initRender, beginRendering} from rendering

window.onload = function init() {
    // Set up controls
    setUpControls();

    // Set up WebGL Rendering Context
    initRender();

    // Initialize gamestate
    initGame();

    // Run WebGL
    beginRendering();
}



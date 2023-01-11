
// Store WebGL rendering context
var gl;

// Store canvas
var canvas;

// Store uniform addresses
var projMatAddr, modViewMatAddr, normMatAddr;
var pickProjAddr, pickModViewAddr;

// Projection matrix
var projectionMatrix;

// Picking projection matrix
var pickingProjectionMatrix

// Rotation angle
var rotAngle;

// Timing variable
var then;

// Buffers
var vertex_buffer, index_buffer, color_buffer, normal_buffer;

// Buffer Data
var data;

// Colored Cube Data
var col;

// mouseX and mouseY are in CSS display space relative to canvas
let mouseX = -1;
let mouseY = -1;

// Field of view
let fieldOfView;

// programs
let program;
let pick_program;

// Picking Texture
let pickTexture;

// Frame Buffer
let frameBuff;

// Last picked value
let lastVal;

// Store past state, for comparison
let lastRenderState;

// frustum values
let frustum;

function initRender(){
    // This just sets up the whole rendering machine!
    // It's a complicated one, full of WebGL and Matrix Math
    canvas = document.getElementById("gl-canvas");

    // Set display size in CSS pixels:
    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";

    // Changes for High-DPI screens:
    var devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Add mouse listener
    gl.canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        // Rounding is because of non-integer client bounding boxes
        mouseX = Math.round(e.clientX - rect.left);
        mouseY = Math.round(e.clientY - rect.top);
    });

    // Add click listener
    gl.canvas.addEventListener('click', (e) => {
        clickSquare(lastVal);
    });

    // Optimize gl-matrix for modern web browsers

    // Configure WebGL

    // Light gray colour to make things visible
    gl.clearColor(1, 1, 1, 1.0);

    // Depth stuff for 3d rendering
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST); // Closer objects are drawn over farther away ones
    gl.enable(gl.CULL_FACE); // Faces facing away from the camera aren't drawn
    gl.depthFunc(gl.LEQUAL); // Pass if the new depth is less or equal to existing depth

    // Load shaders and initialize attribute buffers
    {
        var vEl = document.getElementById("vertex-shader");
        var fEl = document.getElementById("fragment-shader");
        var pvEl = document.getElementById("pick-vertex-shader");
        var pfEl = document.getElementById("pick-fragment-shader");
        
        var vShader = gl.createShader(gl.VERTEX_SHADER);
        var fShader = gl.createShader(gl.FRAGMENT_SHADER);
        var pvShader = gl.createShader(gl.VERTEX_SHADER);
        var pfShader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(vShader, vEl.text); gl.compileShader(vShader);
        gl.shaderSource(fShader, fEl.text); gl.compileShader(fShader);
        gl.shaderSource(pvShader, pvEl.text); gl.compileShader(pvShader);
        gl.shaderSource(pfShader, pfEl.text); gl.compileShader(pfShader);

        for (sh of [vShader, fShader, pvShader, pfShader]) {
            if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
                alert("Shader didn't compile.")
                console.log(gl.getShaderInfoLog(sh));
                return -1;
            }
        }

        program = gl.createProgram();
        pick_program = gl.createProgram();
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.attachShader(pick_program, pvShader);
        gl.attachShader(pick_program, pfShader);

        // Set hardware locations for the variables passed into each shader
        gl.bindAttribLocation(program, 0, 'vPosition');
        gl.bindAttribLocation(program, 1, 'vColor');
        gl.bindAttribLocation(program, 2, 'vNormal');

        gl.bindAttribLocation(pick_program, 0, 'vPosition');
        gl.bindAttribLocation(pick_program, 3, 'vPickColor');

        gl.linkProgram(program);
        gl.linkProgram(pick_program);

        // Make sure linking succeeded
        if (!gl.getProgramParameter(program, gl.LINK_STATUS) || !gl.getProgramParameter(pick_program, gl.LINK_STATUS)){
            alert("Shader Program linking failed.");
            console.log(gl.getProgramInfoLog(program), gl.getProgramInfoLog(pick_program));
            return -1;
        }
    }

    // Default program is for drawing. We'll change it to picking later.
    gl.useProgram(program);

    // Set up draw data
    {
        // Draw a cube! Here are the vertices of each of its faces!
        const s_vertices = [
            // Front face
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            
            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0, -1.0, -1.0,
            
            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
            1.0,  1.0,  1.0,
            1.0,  1.0, -1.0,
            
            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,
            
            // Right face
            1.0, -1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0,  1.0,  1.0,
            1.0, -1.0,  1.0,
            
            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,
        ];

        // The corresponding face normals
        const s_normals = [
            0,0,1,
            0,0,1,
            0,0,1,
            0,0,1,
            0,0,-1,
            0,0,-1,
            0,0,-1,
            0,0,-1,
            0,1,0,
            0,1,0,
            0,1,0,
            0,1,0,
            0,-1,0,
            0,-1,0,
            0,-1,0,
            0,-1,0,
            1,0,0,
            1,0,0,
            1,0,0,
            1,0,0,
            -1,0,0,
            -1,0,0,
            -1,0,0,
            -1,0,0,
        ];

        const s_pick_lum = Array(24).fill(0);

        // These will define the colours of each of the cube vertices.
        col = {
            red: [],
            blue: [],
            gray: [],
        };

        // Set its colours :O
        var s_colors = [];
        for (var i = 0; i < s_vertices.length / 3; ++i){
            vtex = s_vertices.slice(3*i, 3*i+3);
            if (vtex[0] === vtex[1] && vtex[1] === vtex[2]){
                col.red.push(1,0,0,1);
                col.blue.push(0,0,1,1);
                col.gray.push(0.3,0.3,0.3,1);
            }else if (vtex[0] === vtex[1]){
                col.red.push(1,1,0,1);
                col.blue.push(0,1,0,1);
                col.gray.push(0.5,0.5,0.5,1);
            }else if (vtex[0] === vtex[2]){
                col.red.push(1,0,0,1);
                col.blue.push(0,0,0,1);
                col.gray.push(0.7,0.7,0.7,1);
            }else{
                col.red.push(1,0,1,1);
                col.blue.push(0,1,1,1);
                col.gray.push(0.5,0.5,0.5,1);
            }

            for (var j = 0; j < 3; ++j){
                if (s_vertices[3*i + j] === -1) s_colors.push(0);
                else s_colors.push(1);
            }
            s_colors.push(1.0);
        }
        col["lred"] = col.red.map((x, i) => (col.gray[i]*0.7 + x*0.3) );

        // Make element array
        const s_indices = [
            0,1,2, 0,2,3, // front
            4,5,6, 4,6,7, // back
            8,9,10, 8,10,11,
            12,13,14, 12,14,15,
            16,17,18, 16,18,19,
            20,21,22, 20,22,23,
        ];

        // Extend to 64 cubes :o
        var vertices = [];
        var normals = [];
        var colors = [];
        var indices = [];
        var pickColors = [];
        for(var i=0; i<64; ++i){
            for(var j=0; j<s_vertices.length/3; ++j){
                vertices.push(-6 + s_vertices[3*j] + 4*(i%4));
                vertices.push(-6 + s_vertices[3*j+1] + 4*(Math.floor(i/4)%4));
                vertices.push(-6 + s_vertices[3*j+2] + 4*(Math.floor(i/16)));
            }
            pickColors = pickColors.concat(s_pick_lum.map(x => x+i));
            normals = normals.concat(s_normals);
            colors = colors.concat(col.gray);
            indices = indices.concat(s_indices.map(x => x + (24*i)));
        }
        data = {
            v: vertices,
            n: normals,
            c: colors,
            i: indices,
            p: pickColors
        };
    }

    // Make matrices for constant transformations
    {
        // Create perspective matrix
        // The way we'll render this is by making the world rotate, with our camera stable.
        // This perspective matrix will simply clip the 3-D world to our 2D view.
        fieldOfView = 45.0 * Math.PI / 180.0;
        const aspect = (gl.canvas.clientWidth) / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        projectionMatrix = glMatrix.mat4.create();

        glMatrix.mat4.perspective(
            projectionMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar
        );

        // compute the rectangle the near plane of our frustum covers
        const top = Math.tan(fieldOfView * 0.5) * zNear;
        const bottom = -top;
        const left = aspect * bottom;
        const right = aspect * top;
        const width = Math.abs(right - left);
        const height = Math.abs(top - bottom);

        frustum = {
            l: left,
            r: right,
            b: bottom,
            t: top,
            w: width,
            h: height,
            zNear: zNear,
            zFar: zFar
        };
        // We'll calculate this later, using the frustum to make a new one encapsulating only the pixel we're hovering over.
        pickingProjectionMatrix = glMatrix.mat4.create();
    }

    // Set up Picking texture
    // Make texture
    pickTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, pickTexture);
    {
        // define size and format of level 0
        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const data = null;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                        1, 1, border,
                        format, type, data);
        
        // set the filtering so we don't need mips
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Create and bind the framebuffer
        frameBuff = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuff);
        
        // attach the texture as the first color attachment
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, pickTexture, level);
        
        // create a depth renderbuffer
        const depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        
        // make a depth buffer and the same size as the targetTexture
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1, 1);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    }

    // Load data into GPU data buffers
    {
        // Copy vertex array into one buffer
        vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            gl.STATIC_DRAW);

        // Colour array into another
        color_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(colors),
            gl.STATIC_DRAW);

        // Element array
        index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices),
            gl.STATIC_DRAW);

        // Normal array
        normal_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(normals),
            gl.STATIC_DRAW);

        // Pick luminosity array
        lum_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, lum_buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(pickColors),
            gl.STATIC_DRAW);
    }
    // Associate shader attributes with data buffers
    {
        // Here, prepare the "vPosition" shader attribute entry point
        // to get 2D float vertex positions from the vertex buffer
        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        // Same with "vColour"
        var vColor = gl.getAttribLocation(program, "vColor");
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        // Same with "vNormal"
        var vNormal = gl.getAttribLocation(program, "vNormal");
        gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
        gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);

        var vPickPosition = gl.getAttribLocation(pick_program, "vPosition");
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.vertexAttribPointer(vPickPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPickPosition);

        // Same with "vColour"
        var vPickColor = gl.getAttribLocation(pick_program, "vPickColor");
        gl.bindBuffer(gl.ARRAY_BUFFER, lum_buffer);
        gl.vertexAttribPointer(vPickColor, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPickColor);
    }

    // Get addresses of shader uniforms
    {
        pickProjAddr = gl.getUniformLocation(pick_program, 'uProjectionMatrix');
        pickModViewAddr = gl.getUniformLocation(pick_program, 'uModelViewMatrix');

        projMatAddr = gl.getUniformLocation(program, 'uProjectionMatrix');
        modViewMatAddr = gl.getUniformLocation(program, 'uModelViewMatrix');
        normMatAddr = gl.getUniformLocation(program, 'uNormalMatrix');
    }

    // Set starting angle
    rotAngle = 0.0;

    // Set starting last time
    then = 0.0;

    // Set starting last value
    lastVal = 0;

    lastRenderState = {
        mouseX: -1,
        mouseY: -1,
        rotx: 0,
        roty: 0,
        turn: 0
    };
}

function beginRendering(){
    // We always draw with the same element buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

    // Draw
    window.requestAnimationFrame(render, canvas);
}

function render(now) {
    window.requestAnimationFrame(render, canvas);

    // Do time-based updates
    {
        now *= 0.001; // Convert time to seconds

        const deltaTime = now - then;
        // rotAngle += deltaTime;
        then = now;

        updateRotation(deltaTime);

        const [roty, rotx] = getrot();
    }

    // Check if the state has changed at all
    const currRenderState = {
        mouseX: mouseX,
        mouseY: mouseY,
        rotx: rotx,
        roty: roty,
        turn: game.turn
    };

    // We let the browser relax: Only render a frame if one is required.
    var eq = true;
    for (key of ['mouseX', 'mouseY', 'rotx', 'roty', 'turn']) {
        if (currRenderState[key] != lastRenderState[key]) {
            eq = false;
            break;
        }
    }
    if (eq) {
        return; // Don't render if there's no point
    }
    lastRenderState = currRenderState;
    
    // Draw

    // Do some matrix math
    const modelViewMatrix = glMatrix.mat4.create();
    // This is similar to a "camera" matrix, but backwards
    const normalMatrix = glMatrix.mat4.create();
    // Lets us calculate normals, so that lighting works nicely
    {
        // Set drawing position to "identity point"
        
        // Move drawing position to where the triangle should be drawn (forward 35 units)
        glMatrix.mat4.translate(
            modelViewMatrix,
            modelViewMatrix,
            [0,0,-35.0]
        );

        // Now rotate the modelViewMatrix
        glMatrix.mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            -rotx,
            [1,0,0]
        )
        glMatrix.mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            roty,
            [0,1,0]
        )

        // Get normal matrix with the inverse transpose
        glMatrix.mat4.invert(normalMatrix, modelViewMatrix);
        glMatrix.mat4.transpose(normalMatrix, normalMatrix);

        // Construct the PickView Projection matrix
        const left = frustum.l + frustum.w*(mouseX/canvas.clientWidth);
        const right = left + frustum.w/canvas.clientWidth;
        const top = frustum.t - frustum.h*(mouseY/canvas.clientHeight);
        const bot = top - frustum.h/canvas.clientWidth;

        // We'll project with this instead, which will render the area behind the single pixel
        // at our mouse
        glMatrix.mat4.frustum(
            pickingProjectionMatrix,
            left,
            right,
            bot,
            top,
            frustum.zNear,
            frustum.zFar
        )
    }
    
    // Do picking, or find out which object the mouse is hovering over
    gl.useProgram(pick_program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuff);
    gl.viewport(0,0,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(
        pickProjAddr,
        false,
        pickingProjectionMatrix
    );
    gl.uniformMatrix4fv(
        pickModViewAddr,
        false,
        modelViewMatrix
    )
    // Draw to the 1x1 texture
    gl.drawElements(gl.TRIANGLES, 36*64, gl.UNSIGNED_SHORT, 0);

    // Get the data just drawn
    const data = new Uint8Array(4);
    gl.readPixels(
        0,            // x
        0,            // y
        1,                 // width
        1,                 // height
        gl.RGBA,           // format
        gl.UNSIGNED_BYTE,  // type
        data);
    const val = data[0] / 2;

    if (val != lastVal){
        if (val < 64 && val >= 0 && game.boardState[val] === 0) {
            changeColor(val, "lred")
        }
        if (lastVal < 64 && lastVal >= 0 && game.boardState[lastVal] === 0){
            changeColor(lastVal, "gray")
        }
        lastVal = val;
    }


    // Render normally
    gl.useProgram(program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // set shader uniforms
    gl.uniformMatrix4fv(
        projMatAddr,
        false,
        projectionMatrix
    )
    gl.uniformMatrix4fv(
        modViewMatAddr,
        false,
        modelViewMatrix
    )
    gl.uniformMatrix4fv(
        normMatAddr,
        false,
        normalMatrix
    )

    // Draw data from buffers currently associated with shader vars
    gl.drawElements(gl.TRIANGLES, 36*64, gl.UNSIGNED_SHORT, 0);

    // Testing
    // gl.useProgram(pick_program);
    // // gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuff);
    // gl.viewport(384,384,128,128);
    // // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // gl.uniformMatrix4fv(
    //     pickProjAddr,
    //     // projMatAddr,
    //     false,
    //     pickingProjectionMatrix
    // );
    // gl.uniformMatrix4fv(
    //     pickModViewAddr,
    //     // modViewMatAddr,
    //     false,
    //     pickModelViewMatrix
    // )
    // // Draw to the 1x1 texture
    // gl.drawElements(gl.TRIANGLES, 36*64, gl.UNSIGNED_SHORT, 0);
}

function changeColor(index, c){

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferSubData(
        gl.ARRAY_BUFFER,
        index * 96 * 4,
        new Float32Array(col[c]));
}

function resetColors(){
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    var cols = col.gray.concat(col.gray);
    for(var i=0; i<7; ++i){
        cols = cols.concat(cols);
    }
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(cols),
        gl.STATIC_DRAW);
}
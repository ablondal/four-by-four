
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

function initRender(){
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Add mouse listener
    gl.canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left+1;
        mouseY = e.clientY - rect.top+1;
        // console.log(mouseX, mouseY)
        // console.log(rect)
    });

    // Add click listener
    gl.canvas.addEventListener('click', (e) => {
        clickSquare(lastVal);
    });

    // Optimize gl-matrix for modern web browsers
    // glMatrix.setMatrixArrayType(Array);

    // Configure WebGL

    // Light gray colour to make things visible
    gl.clearColor(1, 1, 1, 1.0);

    // Depth stuff for 3d rendering
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

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

        gl.bindAttribLocation(program, 0, 'vPosition');
        gl.bindAttribLocation(program, 1, 'vColor');
        gl.bindAttribLocation(program, 2, 'vNormal');

        gl.bindAttribLocation(pick_program, 0, 'vPosition');
        gl.bindAttribLocation(pick_program, 3, 'vPickColor');

        gl.linkProgram(program);
        gl.linkProgram(pick_program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS) || !gl.getProgramParameter(pick_program, gl.LINK_STATUS)){
            alert("Shader Program linking failed.");
            console.log(gl.getProgramInfoLog(program), gl.getProgramInfoLog(pick_program));
            return -1;
        }
    }

    gl.useProgram(program);

    // Set up draw data
    {
        // Draw a cube!
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
        // s_vertices = s_vertices.map(x => 0.1*x);

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
                col.gray.push(0,0,0,1);
            }else if (vtex[0] === vtex[1]){
                col.red.push(1,1,0,1);
                col.blue.push(0,1,0,1);
                col.gray.push(0.5,0.5,0.5,1);
            }else if (vtex[0] === vtex[2]){
                col.red.push(1,1,1,1);
                col.blue.push(0,0,0,1);
                col.gray.push(0.7,0.7,0.7,1);
            }else{
                col.red.push(1,0.5,0,1);
                col.blue.push(0,1,1,1);
                col.gray.push(1,1,1,1);
            }

            for (var j = 0; j < 3; ++j){
                if (s_vertices[3*i + j] === -1) s_colors.push(0);
                else s_colors.push(1);
            }
            s_colors.push(1.0);
        }
        console.log(s_colors, col.red, col.blue);

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
        // console.log(vertices, normals, colors, indices);
        console.log(pickColors);
    }

    // Make matrices for constant transformations
    {
        // Create perspective matrix

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

        pickingProjectionMatrix = glMatrix.mat4.create();

        glMatrix.mat4.perspective(
            pickingProjectionMatrix,
            // fieldOfView,
            fieldOfView*(30/(gl.canvas.clientWidth)),
            1,
            zNear,
            zFar
        )
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
        console.log(vPosition);

        // Same with "vColour"
        var vColor = gl.getAttribLocation(program, "vColor");
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
        console.log(vColor);

        // Same with "vNormal"
        var vNormal = gl.getAttribLocation(program, "vNormal");
        gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
        gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);
        console.log(vNormal);

        var vPickPosition = gl.getAttribLocation(pick_program, "vPosition");
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.vertexAttribPointer(vPickPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPickPosition);
        console.log(vPickPosition);

        // Same with "vColour"
        var vPickColor = gl.getAttribLocation(pick_program, "vPickColor");
        console.log(vPickColor);
        gl.bindBuffer(gl.ARRAY_BUFFER, lum_buffer);
        gl.vertexAttribPointer(vPickColor, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPickColor);
    }

    // Get addresses of shader uniforms
    {
        pickProjAddr = gl.getUniformLocation(pick_program, 'uProjectionMatrix');
        pickModViewAddr = gl.getUniformLocation(pick_program, 'uModelViewMatrix');
        // console.log(pickProjAddr, pickModViewAddr);

        projMatAddr = gl.getUniformLocation(program, 'uProjectionMatrix');
        modViewMatAddr = gl.getUniformLocation(program, 'uModelViewMatrix');
        normMatAddr = gl.getUniformLocation(program, 'uNormalMatrix');
    }

    // Set starting angle
    rotAngle = 0.0;
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

    // console.log(currRenderState, lastRenderState);

    var eq = true;
    for (key of ['mouseX', 'mouseY', 'rotx', 'roty', 'turn']) {
        if (currRenderState[key] != lastRenderState[key]) {
            // console.log(currRenderState[key], lastRenderState[key])
            eq = false;
            break;
        }
    }
    if (eq) {
        return; // Don't render if there's no point
    }

    lastRenderState = currRenderState;

    // console.log('rendering...');
    
    // Draw

    // Do matrix math
    const modelViewMatrix = glMatrix.mat4.create();
    const pickModelViewMatrix = glMatrix.mat4.create();
    const normalMatrix = glMatrix.mat4.create();
    {
        // Set drawing position to "identity point"
        
        // Move drawing position to where the triangle should be drawn
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

        // Get normal matrix
        glMatrix.mat4.invert(normalMatrix, modelViewMatrix);
        glMatrix.mat4.transpose(normalMatrix, normalMatrix);

        // Get PickView matrix
        // Rotate by x and y axis
        glMatrix.mat4.rotate(
            pickModelViewMatrix,
            pickModelViewMatrix,
            1.024*(mouseX-256)*(fieldOfView/512.0),
            [0,1,0]
        )
        glMatrix.mat4.rotate(
            pickModelViewMatrix,
            pickModelViewMatrix,
            1.024*(mouseY-256)*(fieldOfView/512.0),
            [1,0,0]
        )
        glMatrix.mat4.multiply(pickModelViewMatrix, pickModelViewMatrix, modelViewMatrix);
    }
    
    // Do picking
    gl.useProgram(pick_program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuff);
    gl.viewport(0,0,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(
        pickProjAddr,
        // projMatAddr,
        false,
        pickingProjectionMatrix
    );
    gl.uniformMatrix4fv(
        pickModViewAddr,
        // modViewMatAddr,
        false,
        pickModelViewMatrix
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
        console.log(val);
        lastVal = val;
    }


    // Render normally
    gl.useProgram(program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0,0,canvas.clientWidth,canvas.clientHeight);
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

function changeColor(index, val){

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    if (val===1){
        gl.bufferSubData(
            gl.ARRAY_BUFFER,
            index * 96 * 4,
            new Float32Array(col.red));
    } else {
        gl.bufferSubData(
            gl.ARRAY_BUFFER,
            index * 96 * 4,
            new Float32Array(col.blue));
    }
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
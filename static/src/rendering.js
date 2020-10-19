
// Store WebGL rendering context
var gl;

// Store canvas
var canvas;

// Store uniform addresses
var projMatAddr, modViewMatAddr, normMatAddr;

// Projection matrix
var projectionMatrix;

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

function initRender(){
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Optimize gl-matrix for modern web browsers
    // glMatrix.setMatrixArrayType(Array);

    // Configure WebGL

    // Light gray colour to make things visible
    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    // Depth stuff for 3d rendering
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // Load shaders and initialize attribute buffers
    // The two strings passed are the ids of the HTML
    // elements containing the shaders.
    var program = initShadersFromHTML(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Set up draw data

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
    for(var i=0; i<64; ++i){
        for(var j=0; j<s_vertices.length/3; ++j){
            vertices.push(-6 + s_vertices[3*j] + 4*(i%4));
            vertices.push(-6 + s_vertices[3*j+1] + 4*(Math.floor(i/4)%4));
            vertices.push(-6 + s_vertices[3*j+2] + 4*(Math.floor(i/16)));
        }
        normals = normals.concat(s_normals);
        colors = colors.concat(col.gray);
        indices = indices.concat(s_indices.map(x => x + (24*i)));
    }
    data = {
        v: vertices,
        n: normals,
        c: colors,
        i: indices
    };
    // console.log(vertices, normals, colors, indices);

    // Create perspective matrix

    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
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

    // Load data into GPU data buffers
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

    // Associate shader attributes with data buffers
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


    // Get addresses of shader uniforms
    projMatAddr = gl.getUniformLocation(program, 'uProjectionMatrix');
    modViewMatAddr = gl.getUniformLocation(program, 'uModelViewMatrix');
    normMatAddr = gl.getUniformLocation(program, 'uNormalMatrix');

    // Set angle
    rotAngle = 0.0;
    then = 0.0;
}

function beginRendering(){
    // We always draw with the same element buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

    // Draw
    window.requestAnimationFrame(render, canvas);
}

function render(now) {
    window.requestAnimationFrame(render, canvas);

    now *= 0.001; // Convert time to seconds

    // if (Math.floor(now) != Math.floor(then)){
    //     changeColor( Math.floor(Math.random()*64), Math.floor(Math.random()*2) );
    //     if (Math.floor(now) % 20 === 0){
    //         resetColors();
    //     }
    // }

    // console.log(rotAngle, now, then);
    const deltaTime = now - then;
    // rotAngle += deltaTime;
    then = now;

    updateRotation(deltaTime);

    const [roty, rotx] = getrot();

    // Clear screen
    // WebGL does this for us! But we can use our own color, and the depth bit ofc
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw

    // Set drawing position to "identity point"
    const modelViewMatrix = glMatrix.mat4.create();
    const normalMatrix = glMatrix.mat4.create();

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



    glMatrix.mat4.invert(normalMatrix, modelViewMatrix);
    glMatrix.mat4.transpose(normalMatrix, normalMatrix);
    
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
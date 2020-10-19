
function initShadersFromHTML(gl, vertexShaderID, fragmentShaderID)
{
    // Vertex and Fragment shaders
    var vShader, fShader;

    // Get and compile vertex shader
    var vElement = document.getElementById(vertexShaderID);
    if (!vElement){
        alert("Couldn't load Vertex Shader");
        return -1;
    }else{
        vShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vShader, vElement.text);
        gl.compileShader(vShader);
        if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)){
            alert("Vertex Shader didn't compile.")
            console.log(gl.getShaderInfoLog(vShader));
            return -1;
        }
    }

    // Get and compile fragment shader
    var fElement = document.getElementById(fragmentShaderID);
    if (!fElement){
        alert("Couldn't load Vertex Shader");
        return -1;
    }else{
        fShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fShader, fElement.text);
        gl.compileShader(fShader);
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)){
            alert("Fragment Shader didn't compile.")
            console.log(gl.getShaderInfoLog(fShader));
            return -1;
        }
    }

    var program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
        alert("Shader Program linking failed.");
        console.log(gl.getProgramInfoLog(program));
        return -1;
    }
    
    return program;
}
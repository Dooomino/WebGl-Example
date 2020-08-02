window.onload = main;

let canvas = document.querySelector("#canvas");

canvas.width = document.body.clientWidth;
canvas.height = window.innerHeight;
let gl = canvas.getContext("webgl2");
let aspect = canvas.width / canvas.height;

let mouseX = canvas.clientWidth / 2,
    mouseY = canvas.clientHeight / 2;
let lastX = 0, lastY = 0;

let cubeRotation = 0.0;
let THETA = 0, PHI = 0;
let SENSITIVITY = 0.6;


window.onresize = function () {
    canvas.width = document.body.clientWidth;
    canvas.height = window.innerHeight;
    gl = canvas.getContext("webgl2");
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    aspect = canvas.width / canvas.height;
}

window.onmousemove = function (e) {
    mouseX = 2 * e.clientX / canvas.clientWidth;
    mouseY = 2 * e.clientY / canvas.clientHeight;
    let dX = (e.pageX - lastX) * 2 * Math.PI / canvas.width;
    let dY = (e.pageY - lastY) * 2 * Math.PI / canvas.height;
    THETA += dX * SENSITIVITY;
    PHI -= dY * SENSITIVITY;
    lastX = e.pageX;
    lastY = e.pageY;
    e.preventDefault();
}

function main() {
    if (gl === null) {
        return;
    }

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    console.log("initialize complete");

    const program = initShader(gl, vsSource, fsSource);
    const programInfo = {
        program: program,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
            vertexColor: gl.getAttribLocation(program, "aVertexColor"),
            normal: gl.getAttribLocation(program, "aNormal"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
            viewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
            cameraPos: gl.getUniformLocation(program, 'cameraPos'),
        }
    };

    const buffer = initBuffers(gl);
    var then = 0;

    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        draw(gl, programInfo, buffer, deltaTime);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

function initBuffers(gl) {
    const faceColors = [
        [1.0, 1.0, 1.0, 1.0],    // Front face: white
        [1.0, 0.0, 0.0, 1.0],    // Back face: red
        [0.0, 1.0, 0.0, 1.0],    // Top face: green
        [0.0, 0.0, 1.0, 1.0],    // Bottom face: blue
        [1.0, 1.0, 0.0, 1.0],    // Right face: yellow
        [1.0, 0.0, 1.0, 1.0],    // Left face: purple
    ];

    const positions = [
        // Front face
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
    ];

    const indices = [
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // back
        8, 9, 10, 8, 10, 11,   // top
        12, 13, 14, 12, 14, 15,   // bottom
        16, 17, 18, 16, 18, 19,   // right
        20, 21, 22, 20, 22, 23,   // left
    ];

    const normals = [
        // Front
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // Back
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        // Top
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Bottom
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,

        // Right
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Left
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0
    ];

    var colors = [];
    for (var j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];
        // Repeat each color four times for the four vertices of the face
        colors = colors.concat(c, c, c, c);
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        color: colorBuffer,
        normal: normalBuffer,
        indices: indexBuffer
    };
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(type + "\n" + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initShader(gl, vsf, fsf) {
    const vs = loadShader(gl, gl.VERTEX_SHADER, vsf);
    const fs = loadShader(gl, gl.FRAGMENT_SHADER, fsf);

    const shader = gl.createProgram();
    gl.attachShader(shader, vs);
    gl.attachShader(shader, fs);

    gl.linkProgram(shader);

    if (!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
        return null;
    }
    return shader;
}


function draw(gl, programInfo, buffers, deltaTime) {
    gl.clearColor(0, 0, 0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let FOV = 45 * Math.PI / 180;
    const near = 0.1;
    const far = 1000.0;
    const projM = mat4.create();

    mat4.perspective(projM,
        FOV,
        aspect,
        near,
        far);

    const view = mat4.create();
    let cameraPos = [-0.0, 0.0, -6.0];

    mat4.translate(view,     // destination matrix
        view,     // matrix to translate
        cameraPos);  // amount to translate

    // mat4.rotate(view,  // destination matrix
    //     view,  // matrix to rotate
    //     cubeRotation,     // amount to rotate in radians
    //     [1, 1, 1]);       // axis to rotate around (Z)

    mat4.rotate(view,  // destination matrix
        view,  // matrix to rotate
        THETA,// amount to rotate in radians
        [0, 1, 0]);       // axis to rotate around (Y)

    mat4.rotate(view,  // destination matrix
        view,  // matrix to rotate
        PHI,// amount to rotate in radians
        [1, 0, 0]);       // axis to rotate around (X)

    {
        const numComp = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComp,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition
        );
    }

    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    {
        const numComp = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(
            programInfo.attribLocations.normal,
            numComp,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(
            programInfo.attribLocations.normal
        );
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    gl.useProgram(programInfo.program);
    gl.uniformMatrix3fv(
        programInfo.uniformLocations.cameraPos,
        false,
        cameraPos
    )
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projM
    );
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.viewMatrix,
        false,
        view
    );

    {
        const offset = 0;
        const type = gl.UNSIGNED_SHORT;
        const vertexNum = 36;
        gl.drawElements(gl.TRIANGLES, vertexNum, type, offset);
        // gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexNum);
    }
    cubeRotation += deltaTime;
}

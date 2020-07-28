async function readFile(file){
   let response = await fetch(file);
   let data = await response.text();
   // console.log(data);
   return data;
}

window.onload = main;
function main() {
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl");
    gl
    if (gl === null) {
        return;
    }
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    console.log("initialize complete");



    const program = initShader(gl, vsSource, fsSource);
    const programInfo = {
        program: program,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
        }
    };

    const buffer = initBuffers(gl);
    draw(gl,programInfo,buffer);
}

function initBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    let positions = [
        -1.0, 1.0,
        1.0, 1.0,
        -1.0, -1.0,
        1.0, -1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);
    return {
        position:positionBuffer,
    };
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
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


function draw(gl,programInfo,buffers) {
    gl.clearColor(0,0,0,1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let fieldOfView = 45 * Math.PI/180;
    let aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
    const near = 0.1;
    const far = 1000.0;
    const projM = mat4.create();

    mat4.perspective(projM,
                    fieldOfView,
                    aspect,
                    near,
                    far);

    const view = mat4.create();

    mat4.translate(view,view,[-0.0,0.0,-6.0]);

    {
        const numcomp = 2
        const type =gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER,buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numcomp,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition
        );
    }

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projM
    )

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        view
    );

    {
        const offset = 0;
        const vertexNum = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP,offset,vertexNum);
    }
}
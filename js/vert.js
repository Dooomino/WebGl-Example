const vsSource = `#version 300 es
   precision mediump float;
   layout(location=0) in vec4 aVertexPosition;
   layout(location=1) in vec4 aVertexColor;
   layout(location=2) in vec3 aNormal;
    
   uniform mat4 uModelViewMatrix;
   uniform mat4 uProjectionMatrix;
    
   out vec3 normal;
   out vec3 fragPos;
   out vec4 vColor;
   void main(void) {
     fragPos =  vec3(uModelViewMatrix * aVertexPosition);
     normal = mat3(transpose(inverse(uModelViewMatrix))) * aNormal;  
     // normal = aNormal;
     gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
     vColor = aVertexColor;
   }`;
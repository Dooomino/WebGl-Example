const fsSource = `#version 300 es
   precision mediump float;
   in vec3 fragPos;
   uniform vec3 cameraPos;
   // vec3 cameraPos = vec3(0.0,0.0,-10.0);
   
   float ambientS = 0.1;
   float specularS = 1.0;
   float focalS = 32.0;
   vec3 lightColor = vec3(1.0,0.5,0.0);
   vec3 lightPos = vec3(2.0,4.0,-2.0);
   in vec3 normal;
   // in vec4 vColor;
   vec4 vColor = vec4(1.0,1.0,1.0,1.0);
   
   out vec4 fragColor;
   void main(void) {
     
     vec3 ambient = ambientS * lightColor;
   
     vec3 norm = normalize(normal);
     vec3 lightDir = normalize(lightPos - fragPos);
   
     float diffuseVal = max(dot(norm,lightDir),0.0);
     vec3 diffuse = diffuseVal * lightColor;
   
     vec3 viewDir = normalize(cameraPos - fragPos);
     vec3 reflectDir = reflect(-lightDir,norm);
     float specularVal = pow(max(dot(cameraPos,reflectDir),0.0),focalS);
     vec3 specular = specularS * specularVal * lightColor;
   
     vec3 result = (ambient+diffuse+specular) * vColor.xyz;
     fragColor = vec4(result,1.0);
     // fragColor = vec4(norm,1.0);
     // fragColor = vec4(diffuseVal,1.0,1.0,1.0);
     // fragColor = vec4(diffuse * vColor.xyz,1.0);
   }`;
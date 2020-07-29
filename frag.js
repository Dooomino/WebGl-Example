const fsSource = `
    varying lowp vec4 vColor;
    void main(void) {
      gl_FragColor = vColor;
      //gl_FragColor = new vec4(1.0,1.0,1.0,1.0);
    }
   `;
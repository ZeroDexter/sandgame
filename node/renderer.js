// const fs = require('fs');

const Renderer = {
  vShader: null,
  fShader: null,
  gl: null,
  programInfo: null,
  vBuffer: null,
  tex: null,
  fps: [],
  fpsLen: 30,
  countFPS: false,
  init: function() {
    this.gl = twgl.getWebGLContext(document.getElementById("c"));
    // this.vShader = fs.readFileSync('vs.glsl', { encoding: 'UTF-8' });
    // this.fShader = fs.readFileSync('fs.glsl', { encoding: 'UTF-8' });

    // this.programInfo = twgl.createProgramInfo(this.gl, [this.vShader, this.fShader]);
    this.programInfo = twgl.createProgramInfo(this.gl, ["vs", "fs"]);

    this.vBuffer = twgl.createBufferInfoFromArrays(this.gl, {
      position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
    })

    twgl.resizeCanvasToDisplaySize(this.gl.canvas);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    this.tex = twgl.createTexture(this.gl, {
      width: this.gl.canvas.width,
      height: this.gl.canvas.height,
      minMag: this.gl.NEAREST,
    });
    
    requestAnimationFrame(() => Game.update(0, [this.gl.canvas.width, this.gl.canvas.height]));
  },
  render: function (texArr) {
    if (this.countFPS) var t = performance.now();

    twgl.setTextureFromArray(this.gl, this.tex, texArr, {
      width: this.gl.canvas.width,
      height: this.gl.canvas.height,
    });
    
    var uniforms = {
      tex: this.tex,
      resolution: [this.gl.canvas.width, this.gl.canvas.height],
      zoom: Game.zoom * 0.01,
      pan: [Game.panX, Game.panY],
    };

    this.gl.useProgram(this.programInfo.program);
    twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.vBuffer);
    twgl.setUniforms(this.programInfo, uniforms);
    twgl.drawBufferInfo(this.gl, this.vBuffer);

    if (this.countFPS){ 
      this.fps.push(performance.now() - t);

      if (this.fps.length === this.fpsLen) {
        console.log(`Last ${this.fpsLen} renderer update frames averaged ${this.fps.reduce((a, b) => a + b, 0) / this.fpsLen}ms`);
        this.fps = [];
      }
    }

    requestAnimationFrame((time) => Game.update(time, [this.gl.canvas.width, this.gl.canvas.height]));
  }
};

window.onload = function () {
  Renderer.init();
}
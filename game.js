const Game = {
  initialized: false,
  texArrs: [],
  buffArrs: [],
  viewArrs: [],
  buffIdx: 0,
  w: 0,
  h: 0,
  fps: [],
  fpsLen: 30,
  lastFrame: 0,
  countFPS: true,
  zoom: 100,
  panX: 0,
  panY: 0,
  init: function (time, dim) {
    this.lastFrame = time;
    this.w = dim[0];
    this.h = dim[1];
    var size = (this.h + 2) * (this.w + 2);
    this.buffArrs[0] = new ArrayBuffer(size * 4);
    this.viewArrs[0] = new Uint32Array(this.buffArrs[0]);
    this.texArrs[0] = new Uint8ClampedArray(this.buffArrs[0]);

    this.buffArrs[1] = new ArrayBuffer(size * 4);
    this.viewArrs[1] = new Uint32Array(this.buffArrs[1]);    
    this.texArrs[1] = new Uint8ClampedArray(this.buffArrs[1]);

    for (var y = 1; y < this.h - 1; y++) {
      for (var x = 1; x < this.w - 1; x++) {
        var idx = y * this.w + x;

        this.viewArrs[this.buffIdx][idx] = Math.round(Math.random());
      }
    }

    this.initialized = true;
  },
  update: function (time, dim) {
    if (!this.initialized) this.init(time, dim);

    if (this.countFPS) var t = performance.now();
    
    var ylen = this.h,
      xlen = this.w,
      readBuff = this.viewArrs[this.buffIdx],
      writeBuff = this.viewArrs[this.buffIdx === 0 ? 1 : 0];
    
    for (var y = 1; y < ylen - 1; y++){
      var thisRow = y * xlen,
        prevRow = thisRow - xlen,
        nextRow = thisRow + xlen;
      
      for (var x = 1; x < xlen - 1; x++){
        var idx = thisRow + x,
          pxTL = readBuff[prevRow + x - 1],
          pxT = readBuff[prevRow + x],
          pxTR = readBuff[prevRow + x + 1],
          pxL = readBuff[idx - 1],
          px = readBuff[idx],
          pxR = readBuff[idx + 1],
          pxBL = readBuff[nextRow + x - 1],
          pxB = readBuff[nextRow + x],
          pxBR = readBuff[nextRow + x + 1],
          neighborCount = 0,
          val = 0;

        neighborCount += pxTL+pxT+pxTR+pxL+pxR+pxBL+pxB+pxBR;

        if (neighborCount === 3 || (px && neighborCount === 2)) {
          val = 1;
        }

        writeBuff[idx] = val;
      }
    }

    if (this.countFPS){
      this.fps.push(performance.now() - t);

      if (this.fps.length === this.fpsLen) {
        var ms = this.fps.reduce((a, b) => a + b, 0) / this.fpsLen;
        console.log(`${this.fpsLen} game updates average: ${ms}ms. FPS average: ${Math.floor(1000/ms)}`);
        this.fps = [];
      }
    }

    this.buffIdx = this.buffIdx === 0 ? 1 : 0;

    Renderer.render(this.texArrs[this.buffIdx]);
  },
  onZoom: function (e) {
    this.zoom += Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
  },
  onKeyDown: function (e) {
    switch (e.key){
      case 'w':
        this.panY += 5;
        break;
      case 's':
        this.panY -= 5;
        break;
      case 'a':
        this.panX -= 5;
        break;
      case 'd':
        this.panX += 5;
        break;
    }
  },
};

document.addEventListener("wheel", (e) => Game.onZoom(e), false);
document.addEventListener("keydown", (e) => Game.onKeyDown(e), false);
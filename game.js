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
  arr: null,
  init: function (time, dim) {
    this.lastFrame = time;
    this.w = dim[0];
    this.h = dim[1];
    var ylen = (this.h + 2) * (this.w + 2);
    this.buffArrs[0] = new ArrayBuffer(ylen * 4);
    this.viewArrs[0] = new Uint32Array(this.buffArrs[0]);
    this.texArrs[0] = new Uint8ClampedArray(this.buffArrs[0]);

    this.buffArrs[1] = new ArrayBuffer(ylen * 4);
    this.viewArrs[1] = new Uint32Array(this.buffArrs[1]);    
    this.texArrs[1] = new Uint8ClampedArray(this.buffArrs[1]);

    for (var y = 0; y < ylen; y++) {
      this.viewArrs[this.buffIdx][y] = Math.round(Math.random());
    }

    this.initialized = true;
  },
  update: function (time, dim) {
    if (!this.initialized) this.init(time, dim);

    if(this.countFPS) var t = performance.now();
    var ylen = this.h,
      xlen = this.w,
      end = ylen * xlen - xlen,
      arr = this.arr,
      readBuff = this.viewArrs[this.buffIdx],
      writeBuff = this.viewArrs[this.buffIdx === 0 ? 1 : 0];

    for (var i = xlen + 1; i < end - 1; i++){
      var px = readBuff[i],
        neighborCount = 0,
        val = 0,
        prevPx = xlen - 1,
        nextPx = xlen + 1,
        arrIdx = i * 4;
      
        neighborCount += readBuff[i - prevPx];
        neighborCount += readBuff[i - xlen];
        neighborCount += readBuff[i - nextPx];
        neighborCount += readBuff[i - 1];
        neighborCount += readBuff[i + 1];
        neighborCount += readBuff[i + prevPx];
        neighborCount += readBuff[i + xlen];
        neighborCount += readBuff[i + nextPx];

      if (neighborCount === 3 || (px && neighborCount === 2)) {
        val = 1;
      }

      writeBuff[i] = val;
    }

    if (this.countFPS){
      this.fps.push(performance.now() - t);

      if (this.fps.length === this.fpsLen) {
        var ms = this.fps.reduce((a, b) => a + b, 0) / this.fpsLen;
        console.log(`Last ${this.fpsLen} game updates averaged ${ms}ms, averaging ${Math.round(1000 / ms)} FPS`);
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
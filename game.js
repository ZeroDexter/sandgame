const Game = {
  initialized: false,
  texArrs: [],
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
    this.texArrs[0] = new Uint8Array(this.w * this.h);

    for (var y = 0, ylen = this.h + 2; y <= ylen; y++) {
      for (var x = 0, xlen = this.w + 2; x <= xlen; x++) {
        if (x === 0 || y === 0 || x === xlen || y === ylen) {
          this.texArrs[0][y * xlen + x] = 0;
        } else {
          this.texArrs[0][y * xlen + x] = ((Math.random() * 100) % 17) > 1 ? 0 : 1;
        }
      }
    }

    this.texArrs[1] = this.texArrs[0].slice();

    this.initialized = true;
  },
  update: function (time, dim) {
    if (!this.initialized) this.init(time, dim);

    if(this.countFPS) var t = performance.now();

    var arr = new Uint8Array(this.h * this.w * 4);
    var tArr0 = this.texArrs[0];
    var tArr1 = this.texArrs[1];
    var ylen = this.h;
    var xlen = this.w;

    for (var y = 1; y < ylen; y++){
      var thisRow = y * xlen,
        prevRow = (y - 1) * xlen,
        nextRow = (y + 1) * xlen,
        arrRow = (y - 1) * 4 * xlen;

      for (var x = 1; x < xlen; x++) {
        var pIdx = thisRow + x,
          px = tArr0[pIdx],
          arrIdx = arrRow + (x * 4),
          neighborCount = 0,
          prevCol = x - 1,
          nextCol = x + 1;

        // start slow part        
        neighborCount += tArr0[prevRow + prevCol];
        neighborCount += tArr0[prevRow + x];
        neighborCount += tArr0[prevRow + nextCol];
        neighborCount += tArr0[thisRow + prevCol];
        neighborCount += tArr0[thisRow + nextCol];
        neighborCount += tArr0[nextRow + prevCol];
        neighborCount += tArr0[nextRow + x];
        neighborCount += tArr0[nextRow + nextCol];
        // end slow part
        
        if ((!px && neighborCount === 3) || (px && (neighborCount === 2 || neighborCount === 3))) {
          tArr1[pIdx] = 1;
          arr[arrIdx - 4] = 255;
          arr[arrIdx - 3] = 255;
          arr[arrIdx - 2] = 255;
          arr[arrIdx - 1] = 255;
        } else {
          tArr1[pIdx] = 0;
          arr[arrIdx - 4] = 0;
          arr[arrIdx - 3] = 0;
          arr[arrIdx - 2] = 0;
          arr[arrIdx - 1] = 255;
        }
      }
    }

    if (this.countFPS){
      this.fps.push(performance.now() - t);

      if (this.fps.length === this.fpsLen) {
        var ms = Math.round(this.fps.reduce((a, b) => a + b, 0) / this.fpsLen);
        console.log(`Last ${this.fpsLen} game update frames averaged ${ms}ms, averaging ${Math.round(1000 / ms)} FPS`);
        this.fps = [];
      }
    }

    this.texArrs[0] = this.texArrs[1].slice();

    Renderer.render(arr);
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
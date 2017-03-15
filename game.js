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
  mouseDown: false,
  mouseButton: null,
  mouseX: null,
  mouseY: null,
  rain: false,
  rainAmount: 0,
  init: function (time, dim) {
    this.lastFrame = time;
    this.w = dim[0];
    this.h = dim[1];
    var size = (this.h + 2) * (this.w + 2);

    this.rainAmount = this.w / 50;
    this.buffArrs[0] = new ArrayBuffer(size * 4);
    this.viewArrs[0] = new Uint32Array(this.buffArrs[0]);
    this.texArrs[0] = new Uint8ClampedArray(this.buffArrs[0]);

    this.buffArrs[1] = new ArrayBuffer(size * 4);
    this.viewArrs[1] = new Uint32Array(this.buffArrs[1]);    
    this.texArrs[1] = new Uint8ClampedArray(this.buffArrs[1]);

    var rects = [];

    for (var i = 0; i < 20; i++){
      var x = this.getRandomCoord(0, this.w);
      var y = this.getRandomCoord(0, this.h);
      var w = this.getRandomCoord(0, (this.w - x) / 8);
      var h = this.getRandomCoord(0, (this.h - y) / 4);
      rects.push({ x, y, w, h });
    }

    for (var y = 1; y < this.h - 1; y++) {
      for (var x = 1; x < this.w - 1; x++) {
        var idx = y * this.w + x,
          isWall = false;

        for (var rect of rects) {
          if (x > rect.x && y > rect.y && x < rect.x + rect.w && y < rect.y + rect.h) {
            isWall = true;
            break;
          }
        }

        if (isWall) {
          this.viewArrs[0][idx] = 128;
        } else if (!this.rain && Math.round(Math.random()) % 17 === 0) {
          this.viewArrs[0][idx] = 255;
        }
      }
    }

    this.initialized = true;
  },
  update: function (time, dim) {
    if (!this.initialized) this.init(time, dim);
    
    var ylen = this.h,
      xlen = this.w,
      numEls = 0,
      readBuff = this.viewArrs[0],
      writeBuff = this.viewArrs[1],
      timeDelta = time - this.lastFrame;
    
    if (this.rain){
      for (var i = 0; i < this.rainAmount; i++){
        var idx = (ylen * xlen) - (xlen*2) + this.getRandomCoord(0, xlen);
        readBuff[idx] = 255;
      }
    }
    
    for (var y = 1; y < ylen - 1; y++){
      var thisRow = y * xlen,
        prevRow = thisRow - xlen;
        // nextRow = thisRow + xlen;
      
      for (var x = 1; x < xlen - 1; x++){
        var idx = thisRow + x,
          prevCol = x - 1,
          nextCol = x + 1,
          pxBL = prevRow + prevCol,
          pxB = prevRow + x,
          pxBR = prevRow + nextCol,
          pxL = idx - 1,
          px = idx,
          pxR = idx + 1;
          // pxTL = nextRow + prevCol,
          // pxT = nextRow + x,
          // pxTR = nextRow + nextCol;
        
        if (!readBuff[px]) continue;

        if (readBuff[px] === 128) { // solid
          writeBuff[px] = 128;
          continue;
        }

        numEls++;

        if (!writeBuff[pxB]) {
          writeBuff[px] = 0;
          writeBuff[pxB] = 255;
          continue;
        }

        var pseudoRandom = Math.round(Math.random());

        if (pseudoRandom) {
          var pxBBL = prevRow - xlen + prevCol;

          if (!writeBuff[pxL] && !writeBuff[pxBL] && !writeBuff[pxBBL]) { // 
            writeBuff[px] = 0;
            writeBuff[pxL] = 255;
          }

          continue;
        } else {
          var pxBBR = prevRow - xlen + nextCol;

          if (!writeBuff[pxR] && !writeBuff[pxBR] && !writeBuff[pxBBR]) { // 
            writeBuff[px] = 0;
            writeBuff[pxR] = 255;
          }

          continue;
        }

        writeBuff[px] = 255;
      }
    }

    if(this.mouseDown) this.addElements(this.mouseX, this.mouseY, writeBuff);

    if (this.countFPS){
      this.fps.push(timeDelta);

      if (this.fps.length === this.fpsLen) {
        var ms = this.fps.reduce((a, b) => a + b, 0) / this.fpsLen;
        console.log(`${this.fpsLen} game updates average: ${ms}ms for ${numEls} elements. FPS average: ${Math.floor(1000/ms)}`);
        this.fps = [];
      }
    }

    this.buffIdx = this.buffIdx === 0 ? 1 : 0;

    this.viewArrs[0] = this.viewArrs[1].slice(); // copy write buffer to next frame's read buffer
    this.lastFrame = time;

    Renderer.render(this.texArrs[1]);
  },
  addElements: function (x, y, writeBuff) {
    var coords = this.getSurroundingCoords(x, y, this.w, this.h);

    for (var idx of coords){
      writeBuff[idx] = this.mouseButton === 2 ? 128 : 255;
    }
  },
  getSurroundingCoords: function (x, y, xlen, ylen) {
    var coords = new Uint32Array(9),
      thisRow = y * xlen,
      prevRow = thisRow - xlen,
      nextRow = thisRow + xlen,
      idx = thisRow + x,
      prevCol = x - 1,
      nextCol = x + 1,
      pxTL = prevRow + prevCol,
      pxT = prevRow + x,
      pxTR = prevRow + nextCol,
      pxL = idx - 1,
      px = idx,
      pxR = idx + 1,
      pxBL = nextRow + prevCol,
      pxB = nextRow + x,
      pxBR = nextRow + nextCol;
    
    coords[0] = pxTL;
    coords[1] = pxT;
    coords[2] = pxTR;
    coords[3] = pxL;
    coords[4] = px;
    coords[5] = pxR;
    coords[6] = pxBL;
    coords[7] = pxB;
    coords[8] = pxBR;
    
    return coords;
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
  onMouseMove: function (e) {
    this.mouseX = e.clientX;
    this.mouseY = this.h - e.clientY;
  },
  onMouseUp: function (e) {
    this.mouseDown = false;
    this.mouseButton = null;
  },
  onMouseDown: function (e) {
    this.mouseDown = true;
    this.mouseButton = e.button;
  },
  getRandomCoord: function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  },
};

document.addEventListener("wheel", (e) => Game.onZoom(e), false);
document.addEventListener("keydown", (e) => Game.onKeyDown(e), false);
document.addEventListener("mousemove", (e) => Game.onMouseMove(e), false);
document.addEventListener("mousedown", (e) => Game.onMouseDown(e), false);
document.addEventListener("mouseup", (e) => Game.onMouseUp(e), false);
precision mediump float;

uniform sampler2D tex;
uniform vec2 resolution;
uniform float zoom;
uniform vec2 pan;

varying vec2 texCoord;

void main() {
  // vec2 dim = resolution * vec2(zoom, zoom);
  vec2 uv = texCoord / resolution;
  // uv -= ((resolution - dim) * vec2(0.5, 0.5)) / dim;
  // uv += pan / dim;
  float color = texture2D(tex, uv).r;

  gl_FragColor = vec4(color, color, color, 255);
}
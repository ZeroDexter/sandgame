precision mediump float;

uniform sampler2D tex;
uniform vec2 resolution;
uniform float zoom;
uniform vec2 pan;

void main() {
  vec2 dim = resolution * vec2(zoom, zoom);
  vec2 uv = gl_FragCoord.xy / dim;
  uv -= ((resolution - dim) * vec2(0.5, 0.5)) / dim;
  uv += pan / dim;
  vec4 color = texture2D(tex, uv).rgba;

  gl_FragColor = color;
}
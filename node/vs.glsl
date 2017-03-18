attribute vec4 position;

uniform float zoom;

varying vec2 texCoord;

void main() {
  gl_Position = position * vec2(zoom, zoom);
  texCoord = gl_MultiTexCoord0.xy;
}
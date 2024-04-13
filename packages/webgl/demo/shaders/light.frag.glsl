#version 300 es
precision mediump float;

in vec3 v_normal;
out vec4 fragColor;
uniform vec4 u_color;
uniform vec3 u_light;

void main() {
  vec3 normal = normalize(v_normal);
  vec3 light = normalize(u_light);
  float intensity = dot(normal, light);

  fragColor = u_color;
  fragColor.rgb *= intensity;
}

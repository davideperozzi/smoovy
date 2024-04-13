#version 300 es
in vec4 a_position;
in vec3 a_normal;
uniform mat4 u_proj;
uniform mat4 u_view;
uniform mat4 u_model;
uniform float u_time;

out vec3 v_normal;

void main() {
  v_normal = mat3(u_model) * a_normal;

  float freq = 20.;
  float amp = 0.05;
  vec4 position = a_position;

  position.z += cos(a_position.y * freq) * amp;

  gl_Position = u_proj * u_view * u_model * position;
}

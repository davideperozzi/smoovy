export default {
  vertex: `#version 300 es
    precision mediump float;

    in vec4 a_position;
    in vec3 a_normal;
    uniform mat4 u_proj;
    uniform mat4 u_view;
    uniform mat4 u_model;

    out vec3 v_normal;

    void main() {
      v_normal = a_normal;
      gl_Position = u_proj * u_view * u_model * a_position;
    }
  `,
  fragment: `#version 300 es
    precision mediump float;

    in vec3 v_normal;
    out vec4 fragColor;
    uniform vec4 u_color;

    void main() {
      fragColor = u_color;
    }
  `
}
export default {
  vertex: `#version 300 es
    in vec4 a_position;
    uniform mat4 u_proj;
    uniform mat4 u_view;
    uniform mat4 u_model;

    void main() {
      gl_Position = u_proj * u_view * u_model * a_position;
    }
  `,
  fragment: `#version 300 es
    precision mediump float;

    out vec4 fragColor;
    uniform vec4 u_color;

    void main() {
      fragColor = u_color;
    }
  `
}
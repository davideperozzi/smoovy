export default {
  vertex: `#version 300 es
    in vec4 a_position;
    in vec2 a_texcoord;
    uniform float u_time;
    uniform mat4 u_proj;
    uniform mat4 u_view;
    uniform mat4 u_model;

    out vec2 v_texcoord;

    void main() {
      gl_Position = u_proj * u_view * u_model * a_position;
      v_texcoord = a_texcoord;
    }
  `,
  fragment: `#version 300 es
    precision mediump float;

    uniform sampler2D u_texture;
    uniform float u_alpha;
    out vec4 fragColor;
    in vec2 v_texcoord;

    void main() {
      vec4 color = texture(u_texture, v_texcoord);

      color.a *= u_alpha;

      fragColor = color;
    }
  `
}
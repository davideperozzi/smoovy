import { isNum } from '@smoovy/utils';
import { Camera } from './camera';
import { mat4, Vec2 } from './math';
import { Model } from './model';
import { Program } from './program';
import { Texture } from './texture';
import { UniformType, UniformValue } from './uniform';

export interface MeshConfig {
  /**
   * The mode to draw the vertices. This can be one of the following:
   *
   * - gl.POINTS
   * - gl.LINE_STRIP
   * - gl.LINE_LOOP
   * - gl.LINES
   * - gl.TRIANGLE_STRIP
   * - gl.TRIANGLE_FAN
   * - gl.TRIANGLES
   *
   * Default = gl.TRIANGLES
   */
  mode?: number;

  /**
   * The camera to use for the mesh. This is required if you want to use
   * the mesh in a scene.
   */
  camera: Camera;

  /**
   * The vertex shader for the program of the mesh
   */
  vertex?: string;

  /**
   * The fragment shader for the program of the mesh
   */
  fragment?: string;

  /**
   * Whether to transform coordinates and sizes from screen to clip space.
   * This allows you to set pixel values as coordinates and sizes instead
   * of clip space values. Useful if mapping to the DOM
   *
   * @default false
   */
  screen?: boolean;

  /**
   * The uniforms to pass to the shader program. This will be passed as
   * a uniform with the name of the key. The value will be used as the
   * value of the uniform.
   *
   * @default {}
   */
  uniforms?: Record<string, UniformValue>;

  /**
   * Hint for the autodection of the uniform type. This is useful if you
   * want to pass a uniform that is ambiguous. This is  only needed if the
   * uniforms type can't be detected or there's an overlap like mat2 (size = 4)
   * and vec4 (size = 4). It will not force the type if the type has already
   * been detected correctly. It will always fallback to the vector float type,
   * since it's more commonly used
   *
   * @default {}
   */
  uniformTypes?: Record<string, UniformType>;

  /**
   * Whether to warn if a uniform is not found. This is useful if you
   * want to pass uniforms to the shader program that are optional.
   *
   * @default {}
   */
  uniformOptionals?: Record<string, boolean>;

  /**
   * The texture to use for the mesh. This can be a single texture or
   * an object with multiple textures. The key will be used as the
   * uniform name and the value as the texture.
   */
  texture?: Texture | Record<string, Texture>;

  /**
   * Hide the mesh as long as e.g. a texture is loading
   *
   * @default true
   */
  hideOnLoad?: boolean;

  /**
   * The initial translated x-position
   */
  x?: number;

  /**
   * The initial translated y-position
   */
  y?: number;

  /**
   * The initial translated z-position
   */
  z?: number;
}

export class Mesh<C extends MeshConfig = MeshConfig> extends Model {
  private static defaultViewProj = mat4();
  private disables = new Set<string>();
  private screenPosition: Partial<Vec2> = {};
  protected rawPosition: Vec2 = { x: 0, y: 0 };
  protected program: Program;

  constructor(
    protected gl: WebGLRenderingContext,
    protected config: C
  ) {
    super();

    if ( ! config.vertex || ! config.fragment) {
      throw new Error('vertex and fragment shader required');
    }

    this.x = config.x || 0;
    this.y = config.y || 0;
    this.z = config.z || 0;
    this.program = new Program(gl, config.vertex, config.fragment);

    this.initTextures();
  }

  private initTextures() {
    const texture = this.config.texture;

    if (texture) {
      if (this.config.hideOnLoad !== false) {
        this.disable('texture');
      }

      const uploads: Promise<boolean>[] = [];

      if (texture instanceof Texture) {
        texture.location = this.program.uniform('u_texture');

        uploads.push(texture.uploaded);
      } else {
        let slot = 0;

        for (const [k, tex] of Object.entries(texture)) {
          const key = k.charAt(0).toUpperCase() + k.slice(1);
          const apx = k.toLowerCase() !== 'default' ? `${key}` : '';
          const name = `u_texture${apx}`;

          tex.slot = slot++;
          tex.location = this.program.uniform(name);

          uploads.push(tex.uploaded);
        }
      }

      if (this.config.hideOnLoad !== false) {
        Promise.all(uploads).then(() => this.enable('texture'));
      }
    }
  }

  get disabled() {
    return this.disables.size > 0;
  }

  get mode() {
    return this.config.mode || this.gl.TRIANGLES;
  }

  get uniforms() {
    return this.config.uniforms || {};
  }

  get camera() {
    return this.config.camera;
  }

  get centerX() { return 0; }
  get centerY() { return 0; }

  protected screenX(x = 0) {
    return this.camera.cx(x, this.z) + this.camera.cw(this.centerX);
  }

  protected screenY(y = 0) {
    return this.camera.cy(y, this.z) - this.camera.ch(this.centerY);
  }

  set y(y: number) {
    this.rawPosition.y = y;

    if (this.config.screen) {
      this.screenPosition.y = y;
      this.config.y = y;
    } else {
      this.position.y = y - this.centerY;
      this.config.y = y - this.centerY;
    }
  }

  get y() { return this.rawPosition.y; }

  set x(x: number) {
    this.rawPosition.x = x;

    if (this.config.screen) {
      this.screenPosition.x = x;
      this.config.x = x;
    } else {
      this.position.x = x - this.centerX;
      this.config.x = this.position.x;
    }
  }

  get x() { return this.rawPosition.x; }

  updateGeometry() {}

  bind() {
    this.program.bind();
  }

  updateModel() {
    // In order to save performance, we're updating the screen position with a delay.
    // This allows us to control when the screen position gets calculated.
    //
    // Since the calculation of `screenX` or `screenY` depend on the z position,
    // we're "postponing" the calculation, so the user doesn't have to care about
    // the order he's setting the position.
    //
    // Downside: The position is then synced to the render queue
    if (this.config.screen) {
      const { x, y } = this.screenPosition;

      if (isNum(x)) {
        this.position.x = this.screenX(x);

        delete this.screenPosition.x;
      }

      if (isNum(y)) {
        this.position.y = this.screenY(y);

        delete this.screenPosition.y;
      }
    }

    super.updateModel();
  }

  draw(time = 0) {
    this.updateModel();

    const program = this.program;
    const camera = this.config.camera;
    const view = camera?.model || Mesh.defaultViewProj;
    const proj = camera?.projection || Mesh.defaultViewProj;

    // apply built-in uniforms
    program.uniform('u_time', time, 'f', false);
    program.uniform('u_res', camera.view, 'v2', false);
    program.uniform('u_proj', proj, 'm4', false);
    program.uniform('u_view', view, 'm4', false);
    program.uniform('u_model', this.model, 'm4', false);

    // apply uniforms defined from outside
    if (this.config.uniforms) {
      const uniformTypes = this.config.uniformTypes || {};
      const uniformOptionals = this.config.uniformOptionals || {};

      for (const [name, value] of Object.entries(this.config.uniforms)) {
        const type = uniformTypes[name];
        const warn = !uniformOptionals[name];

        program.uniform(name, value, type, warn);
      }
    }

    // bind textures
    const texture = this.config.texture;

    if (texture) {
      if (texture instanceof Texture) {
        texture.bind();
      } else {
        for (const tex of Object.values(texture)) {
          tex.bind();
        }
      }
    }

    // draw all vertices
    this.beforeDraw();
    this.gl.drawArrays(this.mode, 0, this.program.enableAttribs());
    this.afterDraw();
  }

  protected beforeDraw() {}
  protected afterDraw() {}

  unbind() {
    this.program.unbind();
  }

  disable(ref = '_') {
    if ( ! this.disables.has(ref)) {
      this.disables.add(ref);
    }
  }

  enable(ref = '_', enabled = true) {
    if (enabled) {
      this.disables.delete(ref);
    } else {
      this.disable(ref);
    }
  }

  destroy() {
    this.program.destroy();
  }
}
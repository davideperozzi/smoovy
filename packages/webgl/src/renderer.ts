import { Ticker } from '@smoovy/ticker';
import { isStr, Size } from '@smoovy/utils';

import { Camera, CameraConfig } from './camera';
import { Mesh } from './mesh';
import { Model } from './model';
import { UniformValue } from './uniform';

export class Renderer {
  private _resize?: Size;
  private cameras: Camera[] = [];

  constructor(
    private gl: WebGLRenderingContext,
    private models: Model[],
    private ticker = Ticker.main,
    private order = 100,
    camera?: Partial<CameraConfig>,
    initialSize: Size = { width: 0, height: 0 },
    private uniforms: Record<string, UniformValue> = {}
  ) {
    this.cameras.push(
      new Camera(this.gl, { name: 'main', active: true, ...camera }, initialSize)
    );
  }

  start() {
    this.ticker.add((_, time) => this.render(time / 1000), this.order);
  }

  toggleCamera(nameOrCamera: string | Camera) {
    let camera = isStr(nameOrCamera)
      ? this.findCamera(nameOrCamera)
      : nameOrCamera;

    for (const c of this.cameras) {
      if (c.fbo) {
        continue;
      }

      c.enable('_', c === camera);
    }
  }

  addCamera(camera: Camera, toggle = false) {
    this.cameras.push(camera);

    if (toggle) {
      this.toggleCamera(camera);
    }

    return camera;
  }

  findCamera(name: string) {
    return this.cameras.find(camera => camera.name === name);
  }

  hasCamera(nameOrCamera: string) {
    if (isStr(nameOrCamera)) {
      return !!this.findCamera(nameOrCamera);
    }

    return this.cameras.includes(nameOrCamera);
  }

  removeCamera(nameOrCamera: string | Camera) {
    let camera: Camera | undefined;

    if (isStr(nameOrCamera)) {
      camera = this.findCamera(nameOrCamera);
    } else {
      camera = nameOrCamera;
    }

    const index = this.cameras.findIndex(c => c.name === camera?.name);

    if (index > -1) {
      this.cameras.splice(index, 1);

      return true;
    }

    return false;
  }

  resize(width: number, height: number, ratio = 1) {
    this._resize = { width: width * ratio, height: height * ratio };
  }

  private handleResize() {
    if (this._resize) {
      const { width, height } = this._resize;
      const gl = this.gl;

      gl.canvas.width = width;
      gl.canvas.height = height;
      gl.viewport(0, 0, width, height);

      for (const camera of this.cameras) {
        camera.resize(width, height);
      }

      for (const model of this.models) {
        if (model instanceof Mesh) {
          model.updateGeometry();
        }
      }

      delete this._resize;
    }
  }

  private clearScene() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  private draw(camera: Camera, models: Model[], time = Ticker.now()) {
    const gl = this.gl;
    const uniforms = this.uniforms;

    uniforms.u_view = camera.worldView;
    uniforms.u_proj = camera.projection;
    uniforms.u_res = camera.view;

    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    gl.disable(gl.BLEND);

    for (const model of models.filter(m => m.opaque)) {
      if (model instanceof Mesh) {
        model.updateMesh(camera);
      }

      model.updateModel();
      model.draw(time, this.uniforms);
    }

    gl.depthMask(false);
    gl.depthFunc(gl.LEQUAL);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const transparentModels = models
      .filter(m => !m.opaque)
      .sort((a, b) => Math.abs(b.z - camera.z) - Math.abs(a.z - camera.z));

    for (const model of transparentModels) {
      if (model instanceof Mesh) {
        model.updateMesh(camera);
      }

      model.updateModel();
      model.draw(time, this.uniforms);
    }

    gl.depthMask(true);

    delete uniforms.u_view;
    delete uniforms.u_proj;
    delete uniforms.u_res;
  }

  render(time = Ticker.now()) {
    this.handleResize();
    this.clearScene();

    for (const camera of this.cameras) {
      if (camera.disabled) {
        continue;
      }

      const models = this.models.filter(({ disabled, scopes }) => {
        return !disabled && camera.scopes.some(scope => scopes.includes(scope));
      });

      camera.bind();
      camera.updateModel();

      if (camera.fbo) {
        this.clearScene();
      }

      this.draw(camera, models, time);

      camera.unbind();
    }
  }
}
import { Ticker } from '@smoovy/ticker';
import { Size } from '@smoovy/utils';

import { Camera, CameraConfig } from './camera';
import { Mesh } from './mesh';
import { UniformValue } from './uniform';

export class Renderer {
  private _resize?: Size;
  private cameras: Record<string, Camera> = {};

  constructor(
    private gl: WebGLRenderingContext,
    private meshes: Mesh[],
    private ticker = Ticker.main,
    private order = 100,
    camera?: Partial<CameraConfig>,
    initialSize: Size = { width: 0, height: 0 },
    private uniforms?: Record<string, UniformValue>
  ) {
    this.cameras.main = new Camera(camera, initialSize);
  }

  get camera() {
    return this.cameras.main;
  }

  start() {
    this.ticker.add((_, time) => this.render(time / 1000), this.order);
  }

  addCamera(name: string, camera: Camera) {
    this.cameras[name] = camera;

    return camera;
  }

  getCamera(name: string) {
    return this.cameras[name];
  }

  removeCamera(name: string) {
    delete this.cameras[name];
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

      for (const camera of Object.values(this.cameras)) {
        camera.updateView(width, height);
      }

      for (const mesh of this.meshes) {
        mesh.updateGeometry();
      }

      delete this._resize;
    }
  }

  render(time = Ticker.now()) {
    const gl = this.gl;

    this.handleResize();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (const camera of Object.values(this.cameras)) {
      camera.draw();
    }

    const meshes = this.meshes.filter(m => !m.disabled);

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.disable(gl.BLEND);

    for (const mesh of meshes.filter(m => !m.transparent)) {
      mesh.bind();
      mesh.draw(time, this.uniforms);
      mesh.unbind();
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);

    const transparentMeshes = meshes
      .filter(m => m.transparent)
      .sort((a, b) => a.camDist - b.camDist);

    for (const mesh of transparentMeshes) {
      mesh.bind();
      mesh.draw(time, this.uniforms);
      mesh.unbind();
    }

    gl.depthMask(true);
  }
}
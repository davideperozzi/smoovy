import { Ticker } from '@smoovy/ticker';
import { Size } from '@smoovy/utils';

import { Camera, CameraConfig } from './camera';
import { Mesh } from './mesh';
import { UniformValue } from './uniform';

export class Renderer {
  private _resize?: Size;
  private cameras: Camera[] = [];

  constructor(
    private gl: WebGLRenderingContext,
    private meshes: Mesh[],
    private ticker = Ticker.main,
    private order = 100,
    camera?: Partial<CameraConfig>,
    initialSize: Size = { width: 0, height: 0 },
    private uniforms?: Record<string, UniformValue>
  ) {
    this.cameras.push(
      new Camera(this.gl, { name: 'main', active: true, ...camera }, initialSize)
    );
  }

  start() {
    this.ticker.add((_, time) => this.render(time / 1000), this.order);
  }

  toggleCamera(nameOrCamera: string | Camera) {
    let camera = typeof nameOrCamera === 'string'
      ? this.findCamera(nameOrCamera)
      : nameOrCamera;

    for (const c of this.cameras) {
      if (c.framebuffer) {
        continue;
      }

      c.active = c === camera;
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
    if (typeof nameOrCamera === 'string') {
      return !!this.findCamera(nameOrCamera);
    }

    return this.cameras.includes(nameOrCamera);
  }

  removeCamera(nameOrCamera: string | Camera) {
    let camera: Camera | undefined;

    if (typeof nameOrCamera === 'string') {
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

      for (const mesh of this.meshes) {
        mesh.updateGeometry();
      }

      delete this._resize;
    }
  }

  private clearScene() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  private drawMeshes(meshes: Mesh[], time = Ticker.now()) {
    const gl = this.gl;

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

  render(time = Ticker.now()) {
    this.handleResize();
    this.clearScene();

    for (const camera of this.cameras) {
      if (!camera.active) {
        continue;
      }

      const meshes = this.meshes.filter(m => !m.disabled && m.camera === camera);

      camera.draw();
      camera.bind();

      if (camera.framebuffer) {
        this.clearScene();
      }

      this.drawMeshes(meshes, time);

      camera.unbind();
    }
  }
}
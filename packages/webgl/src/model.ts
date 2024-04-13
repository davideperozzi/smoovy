import { etq, Mat4, mat4, mat4srqt, Vec3, Vec4 } from './math';

export class Model {
  readonly position: Vec3 = Object.seal({ x: 0, y: 0, z: 0 });
  readonly rotation: Vec3 = Object.seal({ x: 0, y: 0, z: 0 });
  readonly scaling: Vec3 = Object.seal({ x: 1, y: 1, z: 1 });
  protected quaternion: Vec4 = Object.seal({ x: 0, y: 0, z: 0, w: 1 });
  protected _model: Mat4 = mat4();
  protected state = 3;

  set x(x: number) { this.position.x = x; }
  get x() { return this.position.x; }
  set y(y: number) { this.position.y = y; }
  get y() { return this.position.y; }
  set z(z: number) { this.position.z = z; }
  get z() { return this.position.z; }
  set scaleX(x: number) { this.scaling.x = x; }
  get scaleX() { return this.scaling.x; }
  set scaleY(y: number) { this.scaling.y = y; }
  get scaleY() { return this.scaling.y; }
  set scaleZ(z: number) { this.scaling.z = z; }
  get scaleZ() { return this.scaling.z; }
  set rotationX(x: number) { this.rotation.x = x; }
  get rotationX() { return this.rotation.x; }
  set rotationY(y: number) { this.rotation.y = y; }
  get rotationY() { return this.rotation.y; }
  set rotationZ(z: number) { this.rotation.z = z; }
  get rotationZ() { return this.rotation.z; }
  get model() { return this._model }

  private updateModelState() {
    const p = this.position;
    const r = this.rotation;
    const s = this.scaling;

    this.state = p.x + p.y + p.z + r.x + r.y + r.z + s.x + s.y + s.z;
  }

  updateModel() {
    const prevState = this.state;

    this.updateModelState();

    if (prevState !== this.state) {
      this.modelWillUpdate();

      mat4srqt(
        this._model,
        this.scaling,
        etq(this.rotation, this.quaternion),
        this.position
      );
    }
  }

  protected modelWillUpdate() {}
}
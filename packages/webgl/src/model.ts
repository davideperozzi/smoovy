import { etq, Mat4, mat4, mat4dec, mat4m, mat4srqt, Vec3, Vec4 } from './math';
import { UniformValue } from './uniform';

export class Model {
  readonly position: Vec3 = Object.seal({ x: 0, y: 0, z: 0 });
  readonly rotation: Vec3 = Object.seal({ x: 0, y: 0, z: 0 });
  readonly scaling: Vec3 = Object.seal({ x: 1, y: 1, z: 1 });
  readonly scopes: (string|number)[] = [0];
  protected disables = new Set<string>();
  protected quaternion: Vec4 = Object.seal({ x: 0, y: 0, z: 0, w: 1 });
  protected _children: Model[] = [];
  protected _model: Mat4 = mat4();
  protected _world: Mat4 = mat4();
  protected _parent?: Model;
  protected _dirty = true;

  set x(x: number) { this.position.x = x; this._dirty = true; }
  get x() { return this.position.x; }
  set y(y: number) { this.position.y = y; this._dirty = true; }
  get y() { return this.position.y; }
  set z(z: number) { this.position.z = z; this._dirty = true; }
  get z() { return this.position.z; }
  set scaleX(x: number) { this.scaling.x = x; this._dirty = true; }
  get scaleX() { return this.scaling.x; }
  set scaleY(y: number) { this.scaling.y = y; this._dirty = true; }
  get scaleY() { return this.scaling.y; }
  set scaleZ(z: number) { this.scaling.z = z; this._dirty = true; }
  get scaleZ() { return this.scaling.z; }
  set scale(s: number) { this.scaling.x = this.scaling.y = s = this.scaling.z = s; this._dirty = true; }
  set rotationX(x: number) { this.rotation.x = x; this._dirty = true; }
  get rotationX() { return this.rotation.x; }
  set rotationY(y: number) { this.rotation.y = y; this._dirty = true; }
  get rotationY() { return this.rotation.y; }
  set rotationZ(z: number) { this.rotation.z = z; this._dirty = true; }
  get rotationZ() { return this.rotation.z; }
  get model() { return this._model }
  get world() { return this._world }
  get dirty() { return this._dirty }

  get opaque() {
    for (const child of this._children) {
      if (child.opaque) {
        return true;
      }
    }

    return false;
  }

  get children() {
    return this._children;
  }

  get disabled() {
    return this.disables.size > 0;
  }

  addChild(...children: Model[]) {
    this._children.push(...children);

    for (const child of children) {
      child.setParent(this);
    }
  }

  setParent(parent: Model) {
    this._parent = parent;
    this._dirty = true;
  }

  setModel(model: Mat4) {
    mat4dec(
      model,
      this.position,
      this.scaling,
      this.rotation,
      this.quaternion
    );

    this._dirty = true;
  }

  updateModel() {
    if (this._dirty) {
      mat4srqt(
        this._model,
        this.scaling,
        etq(this.rotation, this.quaternion),
        this.position
      );

      if (!this._parent) {
        this._world.set(this._model);
      }
    }

    if (this._parent?.dirty) {
      this._dirty = true;
    }

    if (this._parent && this._dirty) {
      mat4m(this._parent.world, this._model, this._world);
    }

    for (const child of this._children) {
      child.updateModel();
    }

    if (this._dirty) {
      this._dirty = false;

      this.modelHasUpdated();
    }
  }

  protected modelWillUpdate() {}
  protected modelHasUpdated() {}

  draw(time = 0, uniforms: Record<string, UniformValue> = {}) {
    for (const child of this._children) {
      child.draw(time, uniforms);
    }
  }

  destroy(){
    for (const child of this._children) {
      child.destroy();
    }
  }

  disable(ref = '_') {
    if (!this.disables.has(ref)) {
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
}
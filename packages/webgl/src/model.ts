import { etq, Mat4, mat4, mat4dec, mat4m, mat4srqt, Vec3, Vec4 } from './math';
import { UniformValue } from './uniform';

export class Model {
  readonly position: Vec3 = Object.seal({ x: 0, y: 0, z: 0 });
  readonly rotation: Vec3 = Object.seal({ x: 0, y: 0, z: 0 });
  readonly scaling: Vec3 = Object.seal({ x: 1, y: 1, z: 1 });
  readonly scopes: (string|number)[] = [0];
  protected disables = new Set<string>();
  protected quaternion: Vec4 = Object.seal({ x: 0, y: 0, z: 0, w: 1 });
  protected _uniforms: Record<string, UniformValue> = {};
  protected _children: Model[] = [];
  protected _model: Mat4 = mat4();
  protected _world: Mat4 = mat4();
  protected _parent?: Model;
  protected _dirty = true;


  set x(x: number) { this._dirty = this._dirty || x !== this.position.x; this.position.x = x; }
  get x() { return this.position.x; }
  set y(y: number) { this._dirty = this._dirty || y !== this.position.y; this.position.y = y; }
  get y() { return this.position.y; }
  set z(z: number) { this._dirty = this._dirty || z !== this.position.z; this.position.z = z; }
  get z() { return this.position.z; }
  set scaleX(x: number) { this._dirty = this._dirty || this.scaling.x !== x; this.scaling.x = x; }
  get scaleX() { return this.scaling.x; }
  set scaleY(y: number) { this._dirty = this._dirty || this.scaling.y !== y; this.scaling.y = y; }
  get scaleY() { return this.scaling.y; }
  set scaleZ(z: number) { this._dirty = this._dirty || this.scaling.z !== z; this.scaling.z = z; }
  get scaleZ() { return this.scaling.z; }
  set scale(s: number) {
    this._dirty = this._dirty || this.scaling.x !== s || this.scaling.y !== s || this.scaling.z !== s;
    this.scaling.x = this.scaling.y = s = this.scaling.z = s;
  }
  set rotationX(x: number) { this._dirty = this._dirty || x !== this.rotation.x; this.rotation.x = x; }
  get rotationX() { return this.rotation.x; }
  set rotationY(y: number) { this._dirty = this._dirty || y !== this.rotation.y; this.rotation.y = y; }
  get rotationY() { return this.rotation.y; }
  set rotationZ(z: number) { this._dirty = this._dirty || z !== this.rotation.z; this.rotation.z = z; }
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

  get uniforms() {
    return this._uniforms;
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

  lookAt(x: number, y: number, z: number) {
    const dx = x - this.position.x;
    const dy = y - this.position.y;
    const dz = z - this.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance === 0) {
      return;
    }

    const nx = dx / distance;
    const ny = dy / distance;
    const nz = dz / distance;

    this.rotationY = Math.atan2(-nx, -nz);
    this.rotationX = Math.asin(ny);
  }


  orbit(x: number, y: number, z: number, r: number, a: number, e: number) {
    const ce = Math.cos(e);
    const se = Math.sin(e);
    const ca = Math.cos(a);
    const sa = Math.sin(a);

    this.position.x = x + r * ce * sa;
    this.position.y = y + r * se;
    this.position.z = z + r * ce * ca;

    this.lookAt(x, y, z);
  }

  setParent(parent: Model, update = false) {
    this._parent = parent;
    this._dirty = true;

    if (update) {
      this.updateModel();
    }

    return this;
  }

  setModel(model: Mat4, update = false) {
    mat4dec(
      model,
      this.position,
      this.scaling,
      this.rotation,
      this.quaternion
    );

    this._dirty = true;

    if (update) {
      this.updateModel();
    }

    return this;
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
  protected getCloneArgs(): any[] { return []; }

  draw(time = 0, uniforms: Record<string, UniformValue> = {}) {
    Object.assign(uniforms, this._uniforms);

    for (const child of this._children) {
      if (!child.disabled) {
        child.draw(time, uniforms);
      }
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

  clone(recursive = true): this {
    this.updateModel();

    const model: this = new (this.constructor as any)(
      ...this.getCloneArgs()
    );

    model.scopes.length = 0;
    model.scopes.push(...this.scopes);
    model.disables = new Set(this.disables);

    model.setModel(this.model, true);

    if (recursive) {
      model.addChild(
        ...this.children.map(child => child.clone())
      );
    }

    return model;
  }
}
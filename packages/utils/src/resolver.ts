export class Resolver<T = void, E = T> {
  public promise: Promise<T>;
  private _resolve!: (value: T) => void;
  private _reject!: (error: any) => void;
  private _completed = false;

  public constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  public resolve(value?: T) {
    if (this._completed) {
      throw new Error('Can\'t resolve promise. Already completed');
    }

    this._completed = true;
    this._resolve(value as T);

    return this.promise;
  }

  public reject(value?: E) {
    if (this._completed) {
      throw new Error('Can\'t reject promise. Already completed');
    }

    this._completed = true;
    this._reject(value);

    return this.promise;
  }

  public get completed() {
    return this._completed;
  }
}

import { Service } from '../src';

import { describe, expect, it, vi } from 'vitest';

class TextService extends Service<string, TextService> {
  constructor(
    private message: string
  ) {
    super();
  }

  protected get child() {
    return TextService;
  }

  async init() {
    this.resolve(this.message);
  }
}

describe('service', () => {
  it('should create a service and resolve', async () => {
    const service = new TextService('working');

    // default state after creation
    expect(service.activated).toBeFalsy();
    expect(service.available).toBeFalsy();

    // default state when activated but not resolved
    service.activate();
    expect(service.activated).toBeTruthy();

    // resolve wenn not initialized
    const resolveFn = vi.fn();
    service.then(resolveFn);
    await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
    expect(resolveFn).toBeCalledTimes(0);

    // init service
    await service.init();
    expect(service.available).toBeTruthy();
    expect(await service).toBe('working');
  });

  it('should create and handle children', async () => {
    const parentService = new TextService('working');
    const childService = parentService.addChild('test', 'child working');

    expect(childService).instanceOf(TextService);
    await childService.activate().init();
    expect(await childService).toBe('child working');
  });
});
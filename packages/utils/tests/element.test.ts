import { getElementOffset } from '../src';

class ElementMock {
  public constructor(
    public offsetLeft = 0,
    public offsetTop = 0,
    public offsetParent: ElementMock | HTMLElement,
  ) {}
}

describe('element', () => {
  it('should get the correct element offset', () => {
    const child0 = new ElementMock(300, 500, document.body);
    const child1 = new ElementMock(0, 0, child0);
    const child2 = new ElementMock(200, 100, child1);

    const offset0 = getElementOffset(child0 as any as HTMLElement);
    const offset1 = getElementOffset(child1 as any as HTMLElement);
    const offset2 = getElementOffset(child2 as any as HTMLElement);

    expect(offset0).toMatchObject({ x: 300, y: 500 });
    expect(offset1).toMatchObject({ x: 300, y: 500 });
    expect(offset2).toMatchObject({ x: 500, y: 600 });
  });
});

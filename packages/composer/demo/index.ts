/* eslint-disable no-useless-constructor */
import { component, Composer, composer, Service, service } from '../src';
import { config } from '../src/config';
import { query, queryAll } from '../src/query';

export class TestService extends Service<any, TestService> {
  get name() { return 'test'; }
  get child() { return TestService; }

  async init() {
    this.resolve('test-service');
  }
}

export class TestService2 extends Service<any, TestService> {
  get name() { return 'test2'; }
  get child() { return TestService2; }

  @composer()
  private composer!: Composer;

  async init() {
    // console.log('compos->', this.composer);
    this.resolve('test-service2');
  }
}

export class SampleService extends Service<string, SampleService> {
  @service(TestService)
  private testService!: TestService;

  @service(TestService2)
  private testService2!: TestService2;

  @composer()
  private composer!: Composer;

  get name() { return 'sample'; }
  get child() { return SampleService; }

  async init() {
    if (this.testService.activated) {
      // console.log(this.composer, this.testService2, this.testService);
      this.resolve(await this.testService);
    } else {
      this.resolve('Error: Test Service not activated!')
    }
  }
}

@component('sample-component')
class SampleComponent {
  @service(SampleService, true)
  protected sample!: string;

  @service(SampleService)
  protected sampleService!: SampleService;

  @composer()
  protected composer!: Composer;

  @config('message')
  private message = 'Default message';

  @config('test', { type: Number, parse: value => ({ value }) })
  private test = { value: 1 };

  @config('is-active', { type: Boolean })
  private active = false;

  @config('array', { type: Array })
  private testArray: string[] = [];

  @query('#imuniq')
  private uniq!: HTMLElement;

  @queryAll('.select-me', { parse: list => Array.from(list) })
  private selectMe!: NodeListOf<HTMLElement>[];

  constructor(
    private element: HTMLElement
  ) {}

  async onCreate() {
    // console.log(this.sample, this.composer);
    console.log('message:', this.message);
    console.log('active:', this.active);
    console.log('test:', this.test);
    console.log('testArray:', this.testArray);

    const childService = this.sampleService.addChild('test-child');

    await this.composer.injectService(childService);
    await childService.init();

    console.log('child says -> ', await childService);
    // console.log(this.uniq, this.selectMe);
  }

  onListen() {
  }
}

@composer({
  services: [
    new SampleService(),
    new TestService2(),
    new TestService()
  ],
  components: [
    SampleComponent
  ]
})
class App {
  @composer()
  private composer!: Composer;

  @service(TestService2)
  private testService2!: TestService2;

  async onCreate() {
  }
}

// eslint-disable-next-line no-new
new App();
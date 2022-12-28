/* eslint-disable no-useless-constructor */
import { component, Composer, composer, Service, service } from '../src';
import { config } from '../src/config';
import { query, queryAll } from '../src/query';

export class TestService extends Service<any, TestService> {
  protected get child() {
    return TestService;
  }

  async init() {
    this.resolve('test-service');
  }
}

export class SampleService extends Service<string, SampleService> {
  @service(TestService)
  private testService!: TestService;

  protected get child() {
    return SampleService;
  }

  async init() {
    this.resolve(await this.testService);
  }
}

@component('sample-component')
class SampleComponent {
  @service(SampleService, true)
  protected sample!: string;

  @composer()
  protected composer!: Composer;

  @config('message')
  private message = 'Default message';

  @query('#imuniq')
  private uniq!: HTMLElement;

  @queryAll('.select-me', { parse: list => Array.from(list) })
  private selectMe!: NodeListOf<HTMLElement>[];

  constructor(
    private element: HTMLElement
  ) {}

  onCreate() {
    console.log(this.sample, this.composer);
    console.log('message:', this.message);
    console.log(this.uniq, this.selectMe);
  }
}

@composer({
  services: [
    new SampleService(),
    new TestService()
  ],
  components: [
    SampleComponent
  ]
})
class App {
  @composer()
  private composer!: Composer;

  onCreate() {
    // console.log(this.composer);
  }
}

// eslint-disable-next-line no-new
new App();
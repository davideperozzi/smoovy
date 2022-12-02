/* eslint-disable no-useless-constructor */

import { component, Composer, composer, Service, service } from '../src';

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
  private testService: TestService;

  protected get child() {
    return SampleService;
  }

  async init() {
    this.resolve(await this.testService);
  }
}

@component('[data-sample-component]')
class SampleComponent {
  @service(SampleService, true)
  protected message: string;

  @composer()
  protected composer: Composer;

  // @manager()
  // protected manager: ComposerManager;

  constructor(
    private element: HTMLElement
  ) {}

  onCreate() {
    console.log(this.message, this.composer);
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
  private composer: Composer;

  onCreate() {
    console.log(this.composer);
  }
}

const app = new App();
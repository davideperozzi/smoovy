import { ScrollBehavior } from '../core';
import { objectDeepMerge } from '@smoovy/utils';

export interface Config {
  defaults?: Partial<{ [key: string]: string }>;
}

const defaultConfig = {
  defaults: {
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  }
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = objectDeepMerge(defaultConfig as Config, config);

  return (scroller) => {
    const target = scroller.dom.container.element;

    for (const x in cfg.defaults) {
      if (cfg.defaults.hasOwnProperty(x)) {
        (target.style as any)[x] = cfg.defaults[x];
      }
    }

    return () => {
      for (const x in cfg.defaults) {
        if (cfg.defaults.hasOwnProperty(x)) {
          (target.style as any)[x] = '';
        }
      }
    };
  };
};

export { Config as StyleContainerConfig };
export default behavior;

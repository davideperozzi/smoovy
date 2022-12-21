import { ScrollBehavior } from '../core';
import { objectDeepMerge } from '@smoovy/utils';

interface Config {
  /**
   * The default styling of the container element
   * Default: {
   *   width: '100%',
   *   height: '100%',
   *   overflow: 'hidden'
   * }
   */
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
  const cfg = config;

  if ( ! config.defaults) {
    cfg.defaults = defaultConfig.defaults;
  }

  return (scroller) => {
    const target = scroller.dom.container.ref;

    for (const x in cfg.defaults) {
      if (Object.prototype.hasOwnProperty.call(cfg.defaults, x)) {
        (target.style as any)[x] = cfg.defaults[x];
      }
    }

    return () => {
      for (const x in cfg.defaults) {
        if (Object.prototype.hasOwnProperty.call(cfg.defaults, x)) {
          (target.style as any)[x] = '';
        }
      }
    };
  };
};

export { Config as StyleContainerConfig };
export default behavior;

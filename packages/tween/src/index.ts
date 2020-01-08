import * as _easings from './easing';

export { EasingImplementation } from './easing';
export * from './tween';
export { _easings as easings };
export { easingsFlatMap };


export const easingsMap: {
  [id: string]: { [type: string]: _easings.EasingImplementation }
} = { ..._easings };

const easingsFlatMap: { [path: string]: _easings.EasingImplementation } = {};

for (const name in easingsMap) {
  /* istanbul ignore else */
  if (easingsMap.hasOwnProperty(name)) {
    for (const type in easingsMap[name]) {
      /* istanbul ignore else */
      if (easingsMap[name].hasOwnProperty(type)) {
        easingsFlatMap[`${name}.${type}`] = easingsMap[name][type];
      }
    }
  }
}



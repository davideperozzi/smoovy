import * as _easings from './easing';

export * from './tween';
export { _easings as easings };

export const easingsMap: {
  [id: string]: { [type: string]: _easings.EasingImplementation }
} = { ..._easings };

const easingsFlatMap: { [path: string]: _easings.EasingImplementation } = {};

for (const name in easingsMap) {
  if (easingsMap.hasOwnProperty(name)) {
    for (const type in easingsMap[name]) {
      if (easingsMap[name].hasOwnProperty(type)) {
        easingsFlatMap[`${name}.${type}`] = easingsMap[name][type];
      }
    }
  }
}

export { easingsFlatMap };

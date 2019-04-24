import * as _easings from './easing';

export * from './tween';
export { _easings as easings };
export { easingsFlatMap };

export const easingsMap: {
  [id: string]: { [type: string]: _easings.EasingImplementation }
} = { ..._easings };

const easingsFlatMap: { [path: string]: _easings.EasingImplementation } = {};

for (const name in easingsMap) {
  for (const type in easingsMap[name]) {
    easingsFlatMap[`${name}.${type}`] = easingsMap[name][type];
  }
}



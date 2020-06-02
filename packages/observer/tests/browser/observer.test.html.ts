import { observe, unobserve } from '../../src';

(window as any)['observe'] = observe;
(window as any)['unobserve'] = unobserve;

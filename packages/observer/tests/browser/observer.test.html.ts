import { observe, unobserve } from '../../src';
import * as tslib from 'tslib';

(window as any)['tslib_1'] = tslib;
(window as any)['observe'] = observe;
(window as any)['unobserve'] = unobserve;

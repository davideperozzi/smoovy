import { Router, RouterEventType } from '../src/router';
import { animations } from "@smoovy/router";

const router = new Router();

router.animate(animations.fade());

// router.on(RouterEventType.NAV_START, () => { console.log('nav-start') });
// router.on(RouterEventType.AFTER_ENTER, () => { console.log('after-enter') });
// router.on(RouterEventType.AFTER_LEAVE, () => { console.log('after-leave') });
// router.on(RouterEventType.BEFORE_ENTER, () => { console.log('before-enter') });
// router.on(RouterEventType.BEFORE_LEAVE, () => { console.log('before-leave') });
// router.on(RouterEventType.NAV_PROGRESS, () => { console.log('nav-progress') });
// router.on(RouterEventType.NAV_CANCEL, () => { console.log('nav-cancel') });
// router.on(RouterEventType.NAV_END, () => { console.log('nav-end') });
// router.on(RouterEventType.NAV_SETTLED, () => { console.log('nav-settled') });
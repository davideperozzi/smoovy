import { animations } from '@smoovy/router';

import { Router, RouterEventType, RouterSwapEvent } from '../src/router';

const router = new Router({ forceTrailingSlash: false, noHashNav: true });

router.animate(animations.fade());

setTimeout(() => {
  router.to('/projects/#loooool', { replace: true });
}, 1000);


router.on(RouterEventType.HASH_CHANGE, (event) => {
  console.log(event);
});

// const route = router.createRoute('/sample.html');
// const { view, title } = await router.preload(route);
//
// view!.style.background = 'green';
//
// router
//   .detachView(router.view, router.route)
//   .attachView(view, route)
//   .enableView(view!)
//   .enableRoute(route)
//   .updateTitle(title)
//   .updateHistory(route)


setTimeout(() => {
  // router.render('/', { style: { display: 'none' } });
  // router.render('/projects/', { style: { display: 'none' } });
  // router.render('/sample.html',  { style: { display: 'none' } });
});

// router.on(RouterEventType.NAV_START, () => { console.log('nav-start') });
// router.on(RouterEventType.AFTER_ENTER, () => { console.log('after-enter') });
// router.on(RouterEventType.AFTER_LEAVE, () => { console.log('after-leave') });
//router.on(RouterEventType.BEFORE_ENTER, () => { console.log('before-enter') });
// router.on(RouterEventType.BEFORE_LEAVE, () => { console.log('before-leave') });
// router.on(RouterEventType.NAV_PROGRESS, () => { console.log('nav-progress') });
// router.on(RouterEventType.NAV_CANCEL, () => { console.log('nav-cancel') });
// router.on(RouterEventType.NAV_END, () => { console.log('nav-end') });
// router.on(RouterEventType.NAV_SETTLED, () => { console.log('nav-settled') });


// router.on(RouterEventType.BEFORE_ENTER, async (event: RouterSwapEvent) => {
//   console.log((await router.getViewResult(event.toRoute))?.doc?.classList.toString());
// });
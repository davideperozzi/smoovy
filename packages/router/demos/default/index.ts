import { listenEl } from '@smoovy/event';

import { Router, RouterEvent, RouterOutletEvent } from '../../src';
import { FadeTransition } from '../../src/transitions/fade';

const router = new Router(
  window.location.href,
  {
    outlet: 'main',
    transitions: [ new FadeTransition() ]
  }
);

router.on(RouterEvent.NAVIGATION_END, () => {
  console.log('ENDEDEDED');
  console.log(router.state.current!.url);
});

document.querySelectorAll('a').forEach(link => {
  listenEl(link, 'click', (event) => {
    event.preventDefault();

    const target = event.currentTarget as HTMLAnchorElement;

    router.navigate(target.href);
  });
});


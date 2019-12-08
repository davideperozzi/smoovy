import { listenEl } from '@smoovy/event';

import { Router } from '../../src';
import { FadeTransition } from '../../src/transitions/fade';

const router = new Router(window.location.href, 'main');

router.addTransition(new FadeTransition());

document.querySelectorAll('a').forEach(link => {
  listenEl(link, 'click', (event) => {
    event.preventDefault();

    const target = event.currentTarget as HTMLAnchorElement;

    router.navigate(target.href);
  });
});

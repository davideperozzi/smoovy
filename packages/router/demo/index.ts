import { listen } from '@smoovy/listener';

import { FadeTransition, Router, RouterEvent } from '../src';

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
  listen(link, 'click', (event) => {
    event.preventDefault();

    const target = event.currentTarget as HTMLAnchorElement;
    console.log(target.href);

    router.navigate(target.href);
  });
});


// manual steering: baypassing all events
// async function main() {
//   const url = 'http://localhost:1234/sample.html';
//   const text = await router.preload(url);
//   const prev = { ...router.state.current } as Route;

//   if (text) {
//     const { element, title } = router.prepareContent(text);

//     setTimeout(() => {
//       router.replace(url, true);

//       if (router.outlet) {
//         const viewElement = router.outlet.parsePayload(element);

//         router.outlet.root.appendChild(viewElement);

//         setTimeout(() => {
//           if (router.outlet) {
//             router.outlet.root.removeChild(viewElement);
//             router.replace(prev as Route, true)
//           }
//         }, 1500);
//       }

//       if (title) {
//         document.title = title;
//       }
//     }, 1500);
//   }
// }

// main();


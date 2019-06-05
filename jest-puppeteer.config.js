const serverConfig = {};
const launchConfig = {};

if (!!process.env.TEST_BROWSER_ROOT) {
  const debug = !!!process.env.CI;

  // Setip the server with the script defined by `scripty`.
  // This config needs the environment variable `TEST_BROWSER_ROOT` set
  // to make start the server in the right place
  serverConfig.server = {
    command: `npm run test:serve:package`,
    port: process.env.TEST_PORT ? parseInt(process.env.TEST_PORT, 10) : 1337,
    usedPortAction: 'kill',
    launchTimeout: process.env.CI ? 5000 : 10000,
    debug
  };

  // Only launch the browser in headless mode is CI is active
  // and the package needs a browser test. Otherwise just
  // start the browser in the background, since it's not possible
  // to disable jest-puppeteer for certain tests.
  launchConfig.launch = {
    headless: !debug
  };
}

module.exports = { ...serverConfig, ...launchConfig };

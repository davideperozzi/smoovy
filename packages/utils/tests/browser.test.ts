import { Browser } from '../src';

const glob = global as any;
const originalUa = glob.navigator.userAgent;
const originalPf = glob.navigator.platform;
let fakeUa = '';
let fakePf = '';

const clearUa = () => fakeUa = originalUa || '';
const mockUa = (agent: string) => fakeUa = agent;

const clearPf = () => fakePf = originalPf || '';
const mockPf = (pf: string) => fakePf = pf;

Object.defineProperty(glob.navigator, 'userAgent', {
  get() {
    return fakeUa || originalUa;
  }
});

Object.defineProperty(glob.navigator, 'platform', {
  get() {
    return fakePf || originalPf;
  }
});

const userAgents = {
  // tslint:disable-next-line: max-line-length
  safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Safari/605.1.15',
  // tslint:disable-next-line: max-line-length
  firefox: 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0',
  // tslint:disable-next-line: max-line-length
  chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
  // tslint:disable-next-line: max-line-length
  ie11: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
  // tslint:disable-next-line: max-line-length
  ie11Mobile: 'Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 635) like iPhone OS 7_0_3 Mac OS X AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537',
  // tslint:disable-next-line: max-line-length
  opera: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36 OPR/43.0.2442.991',
  // tslint:disable-next-line: max-line-length
  operaMini: 'Opera/9.80 (Android; Opera Mini/36.2.2254/119.132; U; id) Presto/2.12.423 Version/12.16',
  // tslint:disable-next-line: max-line-length
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14931',
  // tslint:disable-next-line: max-line-length
  safariIphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/14A403 Safari/602.1',
  // tslint:disable-next-line: max-line-length
  chromeAndroid: 'Mozilla/5.0 (Linux; <Android Version>; <Build Tag etc.>) AppleWebKit/<WebKit Rev> (KHTML, like Gecko) Chrome/<Chrome Rev> Mobile Safari/<WebKit Rev>',
  // tslint:disable-next-line: max-line-length
  blackberry: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9780; en-GB) AppleWebKit/534.8+ (KHTML, like Gecko) Version/6.0.0.546 Mobile Safari/534.8+'
};

beforeEach(() => {
  clearUa();
  clearPf();
});

describe('browser', () => {
  it('should detect safari browser', () => {
    mockUa(userAgents.safari);
    expect(Browser.safari).toBe(true);
    expect(Browser.firefox).toBe(false);
    expect(Browser.chrome).toBe(false);
  });

  it('should detect valid safari version', () => {
    mockUa(userAgents.safari);
    expect(Browser.safariVersion).toBe(12.1);

    mockUa(userAgents.firefox);
    expect(Browser.safariVersion).toBe(-1);
  });

  it('should detect chrome', () => {
    mockUa(userAgents.chrome);
    expect(Browser.chrome).toBe(true);
    expect(Browser.firefox).toBe(false);
  });

  it('should detect chrome', () => {
    mockUa(userAgents.firefox);
    expect(Browser.firefox).toBe(true);
    expect(Browser.chrome).toBe(false);
  });

  it('should detect ie and ie mobile', () => {
    mockUa(userAgents.ie11);
    expect(Browser.ie).toBe(true);
    expect(Browser.chrome).toBe(false);
    expect(Browser.firefox).toBe(false);

    mockUa(userAgents.ie11Mobile);
    expect(Browser.ieMobile).toBe(true);
    expect(Browser.mobile).toBe(true);
  });

  it('should detect webkit browsers', () => {
    mockUa(userAgents.chrome);
    expect(Browser.webkit).toBe(true);

    mockUa(userAgents.safari);
    expect(Browser.webkit).toBe(true);

    mockUa(userAgents.opera);
    expect(Browser.webkit).toBe(true);

    mockUa(userAgents.firefox);
    expect(Browser.webkit).toBe(false);

    mockUa(userAgents.ie11);
    expect(Browser.webkit).toBe(false);
  });

  it('should detect opera mini', () => {
    mockUa(userAgents.operaMini);
    expect(Browser.operaMini).toBe(true);
    expect(Browser.chrome).toBe(false);
    expect(Browser.firefox).toBe(false);
    expect(Browser.mobile).toBe(true);
  });

  it('should detect edge', () => {
    mockUa(userAgents.edge);
    expect(Browser.edge).toBe(true);
  });

  it('should detect ios', () => {
    mockUa(userAgents.safariIphone);
    expect(Browser.ios).toBe(true);
    expect(Browser.mobile).toBe(true);
  });

  it('should detect mac', () => {
    mockPf('MacIntel');
    expect(Browser.mac).toBe(true);
  });

  it('should detect windows', () => {
    mockPf('Win32');
    expect(Browser.windows).toBe(true);
  });

  it('should detect android', () => {
    mockUa(userAgents.operaMini);
    expect(Browser.android).toBe(true);

    mockUa(userAgents.chromeAndroid);
    expect(Browser.android).toBe(true);
  });

  it('should detect android mobile', () => {
    mockUa(userAgents.chromeAndroid);
    expect(Browser.androidMobile).toBe(true);
    expect(Browser.mobile).toBe(true);
  });

  it('should detect blackberry', () => {
    mockUa(userAgents.blackberry);
    expect(Browser.blackberry).toBe(true);
    expect(Browser.mobile).toBe(true);
  });
});

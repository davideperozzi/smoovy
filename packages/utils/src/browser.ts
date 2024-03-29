export class Browser {
  public static get uA() {
    return navigator.userAgent.toLowerCase();
  }

  public static get pf() {
    return (
      (window.navigator as any)?.userAgentData?.platform ||
      window.navigator.platform
    ).toLowerCase();
  }

  public static get safari() {
    return (/^((?!chrome|android).)*safari/).test(this.uA);
  }

  public static get safariVersion() {
    return +(
      this.uA.match(/version\/[\d.]+.*safari/) || ['-1']
    )[0].replace(/^version\//, '').replace(/ safari$/, '');
  }

  public static get firefox() {
    return this.uA.indexOf('firefox') > -1;
  }

  public static get chrome() {
    return (/chrome/).test(this.uA);
  }

  public static get ie() {
    return (/msie|trident/).test(this.uA);
  }

  public static get ieMobile() {
    return (/iemobile/).test(this.uA);
  }

  public static get webkit() {
    return (/webkit/).test(this.uA);
  }

  public static get operaMini() {
    return (/opera mini/).test(this.uA);
  }

  public static get edge() {
    return (/edge\/\d./).test(this.uA);
  }

  public static get ios() {
    return (/ip(hone|[ao]d)/).test(this.uA);
  }

  public static get mac() {
    return this.pf.indexOf('mac') > -1;
  }

  public static get windows() {
    return this.pf.indexOf('win') > -1;
  }

  public static get android() {
    return (/android/).test(this.uA);
  }

  public static get androidMobile() {
    return (/android.*mobile/).test(this.uA);
  }

  public static get blackberry() {
    return (/blackberry/).test(this.uA);
  }

  public static get mobile() {
    return this.ieMobile ||
           this.blackberry ||
           this.androidMobile ||
           this.ios ||
           this.operaMini;
  }

  /* c8 ignore next */
  public static get mouseWheelEvent() {
    return 'onmousewheel' in document;
  }

  /* c8 ignore next */
  public static get wheelEvent() {
    return 'onwheel' in document;
  }

  /* c8 ignore next */
  public static get keydownEvent() {
    return 'onkeydown' in document;
  }

  /* c8 ignore next */
  public static get touchDevice() {
    return 'ontouchstart' in window;
  }

  /* c8 ignore next */
  public static get mutationObserver() {
    return 'MutationObserver' in window;
  }

  /* c8 ignore next */
  public static get resizeObserver() {
    return 'ResizeObserver' in window;
  }

  /* c8 ignore next */
  public static get intersectionObserver() {
    return 'IntersectionObserver' in window;
  }

  /* c8 ignore next */
  public static get client() {
    return typeof window !== 'undefined' &&
           typeof window.document !== 'undefined';
  }
}

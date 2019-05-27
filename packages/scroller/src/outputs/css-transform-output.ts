import { Browser, Coordinate, Size, getElementOffset } from '@smoovy/utils';

import { ScrollerOutput, ScrollerOutputConfig } from '../core/output';

export interface CssTransformOutputConfig extends ScrollerOutputConfig {
  sectionSelector?: string;
  sectionPadding: number;
  firefoxFix: boolean;
}

interface SectionState {
  element: HTMLElement;
  size: Size;
  offset: Coordinate;
  translation: Coordinate;
}

export class CssTransformOutput<
  C extends CssTransformOutputConfig = CssTransformOutputConfig
> extends ScrollerOutput<C> {
  private sections: SectionState[] = [];

  public get defaultConfig() {
    return {
      firefoxFix: true,
      sectionPadding: 30
    } as C;
  }

  public attach() {
    this.updateSections();
  }

  public detach() {
    if (this.sections.length > 0) {
      this.sections.forEach((section) => {
        section.element.style.transform = '';
        section.element.style.visibility = '';
      });
    }

    this.dom.wrapper.style.transform = '';
  }

  public updateSections() {
    if (this.config.sectionSelector) {
      this.sections = this.dom.querySelectorAll(this.config.sectionSelector)
        .filter(element => element instanceof HTMLElement)
        .map(element => {
          const bounds = element.getBoundingClientRect();

          return {
            element,
            offset: getElementOffset(element as HTMLElement),
            size: { width: bounds.width, height: bounds.height },
            translation: { x: 0, y: 0 }
          } as SectionState;
        });
    }
  }

  public update(position: Coordinate) {
    if (this.config.sectionSelector) {
      this.updateSectionPosition(position);
    } else {
      this.updateContainerPosition(position);
    }
  }

  public recalc() {
    this.updateSections();
  }

  private updateSectionPosition(position: Coordinate) {
    const containerSize = this.dom.getContainerSize();
    const sectionPadding = this.config.sectionPadding;

    for (let i = 0, len = this.sections.length; i < len; i++) {
      const section = this.sections[i];

      if (
        section.offset.y - sectionPadding <= position.y + containerSize.height
      ) {
        section.translation.y = Math.min(
          position.y,
          section.offset.y + section.size.height + sectionPadding,
        );
      } else {
        section.translation.y = 0;
      }

      if (
        section.offset.x - sectionPadding <= position.x + containerSize.width
      ) {
        section.translation.x = Math.min(
          position.x,
          section.offset.x + section.size.width + sectionPadding,
        );
      } else {
        section.translation.x = 0;
      }

      const posY = section.offset.y - section.translation.y;
      const posX = section.offset.x - section.translation.x;

      const hidden = (
        posY + sectionPadding + section.size.height <= 0 ||
        posY - sectionPadding >= containerSize.height ||
        posX + sectionPadding + section.size.width <= 0 ||
        posX - sectionPadding >= containerSize.width
      );

      section.element.style.visibility = hidden ? 'hidden' : '';

      this.translateElement(
        section.element,
        -section.translation.x,
        -section.translation.y
      );
    }
  }

  private updateContainerPosition(position: Coordinate) {
    this.translateElement(this.dom.wrapper, -position.x, -position.y);
  }

  private translateElement(
    element: HTMLElement,
    x: number,
    y: number
  ) {
    let transform = `translate3d(${x}px, ${y}px, 0)`;

    if (Browser.firefox && this.config.firefoxFix) {
      transform += ` rotate3d(0.01, 0.01, 0.01, 0.01deg)`;
    }

    element.style.transform = transform;
  }
}

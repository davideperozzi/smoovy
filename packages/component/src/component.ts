export interface OnDestroy {
  onDestroy(): void;
}

export interface Component extends OnDestroy {}

export interface ComponentConfig {
  selector: string;
  condition?: () => boolean;
}

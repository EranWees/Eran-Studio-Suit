
export enum EditMode {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ImageState {
  original: string | null;
  history: string[]; // Base64 strings of all states
  currentIndex: number;
}

export interface ModeConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export type BackdropStyle = 'clean' | 'object-swap';

export interface AdjustmentSettings {
  intensity: 'gentle' | 'standard' | 'aggressive';
  backdropStyle: BackdropStyle;
  customInstructions: string;
  swapAsset?: string | null;
  swapType: 'upload' | 'preset';
  swapPreset?: string;
  variationCount: number;
}

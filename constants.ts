
import { ModeConfig } from './types';

export const MODES: ModeConfig[] = [
  {
    id: 'clean-backdrop',
    name: 'Clean Backdrop',
    icon: 'sparkles',
    description: 'Professional studio background cleaning'
  }
];

export const INTENSITY_OPTIONS = [
  { id: 'gentle', label: 'Gentle', description: 'Soft retouching' },
  { id: 'standard', label: 'Standard', description: 'Balanced cleanup' },
  { id: 'aggressive', label: 'Deep Clean', description: 'Remove all details' },
] as const;

export const BACKDROP_STYLES = [
  { 
    id: 'clean', 
    label: 'Clean Backdrop', 
    description: 'Remove wrinkles and dirt from studio backdrops',
    icon: 'sparkles' 
  },
  {
    id: 'object-swap',
    label: 'Object Swap',
    description: 'Replace an object with a provided asset',
    icon: 'repeat'
  }
] as const;

export const OBJECT_PRESETS = [
  { id: 'shoes', label: 'Shoes', icon: 'footprints' },
  { id: 'clothes', label: 'Clothes', icon: 'shirt' },
  { id: 'bag', label: 'Bag', icon: 'shopping-bag' },
  { id: 'watch', label: 'Watch', icon: 'watch' },
  { id: 'glasses', label: 'Glasses', icon: 'glasses' },
] as const;
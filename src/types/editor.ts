export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type ElementType = 'text' | 'image' | 'shape';

export interface BaseElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  zIndex: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  url: string;
  alt: string;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shape: 'rectangle' | 'circle' | 'triangle';
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
}

export type EditorElement = TextElement | ImageElement | ShapeElement;

export type BackgroundType = 'solid' | 'gradient';

export interface Gradient {
  type: 'linear' | 'radial';
  angle: number;
  colors: Array<{ color: string; position: number }>;
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundType: BackgroundType;
  backgroundColor: string;
  gradient?: Gradient;
  backgroundImage?: string;
  padding: number;
}

export interface SizePreset {
  name: string;
  width: number;
  height: number;
  category: string;
}

export const SIZE_PRESETS: SizePreset[] = [
  // Social Media - Instagram
  { name: 'Instagram Post', width: 1080, height: 1080, category: 'Instagram' },
  { name: 'Instagram Story', width: 1080, height: 1920, category: 'Instagram' },
  { name: 'Instagram Landscape', width: 1080, height: 566, category: 'Instagram' },

  // Social Media - Twitter/X
  { name: 'Twitter Post', width: 1200, height: 675, category: 'Twitter' },
  { name: 'Twitter Header', width: 1500, height: 500, category: 'Twitter' },

  // Social Media - Facebook
  { name: 'Facebook Post', width: 1200, height: 630, category: 'Facebook' },
  { name: 'Facebook Cover', width: 820, height: 312, category: 'Facebook' },

  // Social Media - LinkedIn
  { name: 'LinkedIn Post', width: 1200, height: 627, category: 'LinkedIn' },
  { name: 'LinkedIn Banner', width: 1584, height: 396, category: 'LinkedIn' },

  // YouTube
  { name: 'YouTube Thumbnail', width: 1280, height: 720, category: 'YouTube' },
  { name: 'YouTube Channel Art', width: 2560, height: 1440, category: 'YouTube' },

  // Standard Sizes
  { name: 'HD (720p)', width: 1280, height: 720, category: 'Standard' },
  { name: 'Full HD (1080p)', width: 1920, height: 1080, category: 'Standard' },
  { name: '4K', width: 3840, height: 2160, category: 'Standard' },

  // Custom
  { name: 'Custom', width: 1200, height: 630, category: 'Custom' },
];

export interface GradientPreset {
  name: string;
  gradient: Gradient;
  category: string;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    name: 'Sunset',
    gradient: {
      type: 'linear',
      angle: 135,
      colors: [
        { color: '#ff6b6b', position: 0 },
        { color: '#feca57', position: 100 },
      ],
    },
    category: 'Warm',
  },
  {
    name: 'Ocean',
    gradient: {
      type: 'linear',
      angle: 135,
      colors: [
        { color: '#0066ff', position: 0 },
        { color: '#00ffcc', position: 100 },
      ],
    },
    category: 'Cool',
  },
  {
    name: 'Forest',
    gradient: {
      type: 'linear',
      angle: 135,
      colors: [
        { color: '#134e5e', position: 0 },
        { color: '#71b280', position: 100 },
      ],
    },
    category: 'Cool',
  },
  {
    name: 'Purple Dream',
    gradient: {
      type: 'linear',
      angle: 135,
      colors: [
        { color: '#a770ef', position: 0 },
        { color: '#cf8bf3', position: 50 },
        { color: '#fdb99b', position: 100 },
      ],
    },
    category: 'Vibrant',
  },
  {
    name: 'Fire',
    gradient: {
      type: 'linear',
      angle: 135,
      colors: [
        { color: '#f12711', position: 0 },
        { color: '#f5af19', position: 100 },
      ],
    },
    category: 'Warm',
  },
  {
    name: 'Midnight',
    gradient: {
      type: 'linear',
      angle: 135,
      colors: [
        { color: '#2c3e50', position: 0 },
        { color: '#3498db', position: 100 },
      ],
    },
    category: 'Cool',
  },
  {
    name: 'Cotton Candy',
    gradient: {
      type: 'linear',
      angle: 135,
      colors: [
        { color: '#fbc2eb', position: 0 },
        { color: '#a6c1ee', position: 100 },
      ],
    },
    category: 'Soft',
  },
  {
    name: 'Peach',
    gradient: {
      type: 'linear',
      angle: 135,
      colors: [
        { color: '#ed4264', position: 0 },
        { color: '#ffedbc', position: 100 },
      ],
    },
    category: 'Warm',
  },
  {
    name: 'Aurora',
    gradient: {
      type: 'linear',
      angle: 135,
      colors: [
        { color: '#00c6ff', position: 0 },
        { color: '#0072ff', position: 100 },
      ],
    },
    category: 'Cool',
  },
  {
    name: 'Cosmic',
    gradient: {
      type: 'radial',
      angle: 0,
      colors: [
        { color: '#8e2de2', position: 0 },
        { color: '#4a00e0', position: 100 },
      ],
    },
    category: 'Vibrant',
  },
];

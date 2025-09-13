import { ComponentDefinition, ComponentType } from './types';

export const COMPONENT_DEFINITIONS: Record<ComponentType, ComponentDefinition> = {
  text: {
    type: 'text',
    label: 'Text',
    icon: '📝',
    category: 'basic',
    defaultProps: {
      text: 'Sample text',
      tag: 'p',
    },
    defaultStyle: {
      className: 'text-gray-900',
      fontSize: '16px',
    },
    defaultSize: { width: 200, height: 40 },
    editableProps: [
      { key: 'text', label: 'Text Content', type: 'text', placeholder: 'Enter text...' },
      { key: 'tag', label: 'HTML Tag', type: 'select', options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'] },
    ],
  },

  button: {
    type: 'button',
    label: 'Button',
    icon: '🔘',
    category: 'basic',
    defaultProps: {
      text: 'Click me',
      variant: 'primary',
      size: 'medium',
    },
    defaultStyle: {
      className: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer',
    },
    defaultSize: { width: 120, height: 40 },
    editableProps: [
      { key: 'text', label: 'Button Text', type: 'text', placeholder: 'Button text...' },
      { key: 'variant', label: 'Variant', type: 'select', options: ['primary', 'secondary', 'outline', 'ghost'] },
      { key: 'size', label: 'Size', type: 'select', options: ['small', 'medium', 'large'] },
    ],
  },

  input: {
    type: 'input',
    label: 'Input',
    icon: '📝',
    category: 'forms',
    defaultProps: {
      placeholder: 'Enter text...',
      type: 'text',
      required: false,
    },
    defaultStyle: {
      className: 'border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
    },
    defaultSize: { width: 200, height: 40 },
    editableProps: [
      { key: 'placeholder', label: 'Placeholder', type: 'text', placeholder: 'Placeholder text...' },
      { key: 'type', label: 'Input Type', type: 'select', options: ['text', 'email', 'password', 'number', 'tel', 'url'] },
      { key: 'required', label: 'Required', type: 'boolean' },
    ],
  },

  container: {
    type: 'container',
    label: 'Container',
    icon: '📦',
    category: 'layout',
    defaultProps: {
      direction: 'column',
      align: 'start',
      justify: 'start',
      gap: '16px',
    },
    defaultStyle: {
      className: 'border-2 border-dashed border-gray-300 bg-gray-50 p-4 rounded-lg min-h-24',
    },
    defaultSize: { width: 300, height: 200 },
    editableProps: [
      { key: 'direction', label: 'Direction', type: 'select', options: ['row', 'column'] },
      { key: 'align', label: 'Align Items', type: 'select', options: ['start', 'center', 'end', 'stretch'] },
      { key: 'justify', label: 'Justify Content', type: 'select', options: ['start', 'center', 'end', 'between', 'around'] },
      { key: 'gap', label: 'Gap', type: 'select', options: ['0px', '8px', '16px', '24px', '32px'] },
    ],
  },

  image: {
    type: 'image',
    label: 'Image',
    icon: '🖼️',
    category: 'media',
    defaultProps: {
      src: 'https://via.placeholder.com/300x200?text=Image',
      alt: 'Placeholder image',
      fit: 'cover',
    },
    defaultStyle: {
      className: 'rounded-lg shadow-md',
    },
    defaultSize: { width: 300, height: 200 },
    editableProps: [
      { key: 'src', label: 'Image URL', type: 'url', placeholder: 'https://...' },
      { key: 'alt', label: 'Alt Text', type: 'text', placeholder: 'Describe the image...' },
      { key: 'fit', label: 'Object Fit', type: 'select', options: ['cover', 'contain', 'fill', 'none', 'scale-down'] },
    ],
  },

  hero: {
    type: 'hero',
    label: 'Hero Section',
    icon: '🎯',
    category: 'layout',
    defaultProps: {
      title: 'Welcome to our website',
      subtitle: 'This is a hero section with a call to action',
      buttonText: 'Get Started',
      backgroundImage: '',
    },
    defaultStyle: {
      className: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white p-16 rounded-lg text-center',
    },
    defaultSize: { width: 600, height: 300 },
    editableProps: [
      { key: 'title', label: 'Title', type: 'text', placeholder: 'Hero title...' },
      { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Hero subtitle...' },
      { key: 'buttonText', label: 'Button Text', type: 'text', placeholder: 'Button text...' },
      { key: 'backgroundImage', label: 'Background Image', type: 'url', placeholder: 'https://...' },
    ],
  },

  card: {
    type: 'card',
    label: 'Card',
    icon: '🃏',
    category: 'layout',
    defaultProps: {
      title: 'Card Title',
      description: 'This is a card description with some sample text.',
      imageUrl: '',
      buttonText: 'Learn More',
    },
    defaultStyle: {
      className: 'bg-white rounded-lg shadow-lg p-6 border border-gray-200',
    },
    defaultSize: { width: 300, height: 250 },
    editableProps: [
      { key: 'title', label: 'Title', type: 'text', placeholder: 'Card title...' },
      { key: 'description', label: 'Description', type: 'text', placeholder: 'Card description...' },
      { key: 'imageUrl', label: 'Image URL', type: 'url', placeholder: 'https://...' },
      { key: 'buttonText', label: 'Button Text', type: 'text', placeholder: 'Button text...' },
    ],
  },

  header: {
    type: 'header',
    label: 'Header',
    icon: '🧭',
    category: 'navigation',
    defaultProps: {
      logo: 'Logo',
      navigation: ['Home', 'About', 'Services', 'Contact'],
      ctaText: 'Get Started',
    },
    defaultStyle: {
      className: 'bg-white shadow-sm border-b border-gray-200 px-6 py-4',
    },
    defaultSize: { width: 800, height: 80 },
    editableProps: [
      { key: 'logo', label: 'Logo Text', type: 'text', placeholder: 'Logo...' },
      { key: 'ctaText', label: 'CTA Button Text', type: 'text', placeholder: 'CTA text...' },
    ],
  },
};

// Utility functions
export function getComponentDefinition(type: ComponentType): ComponentDefinition {
  return COMPONENT_DEFINITIONS[type];
}

export function getComponentsByCategory(category: string) {
  return Object.values(COMPONENT_DEFINITIONS).filter(comp => comp.category === category);
}

export function getAllCategories(): string[] {
  const categories = Object.values(COMPONENT_DEFINITIONS).map(comp => comp.category);
  return Array.from(new Set(categories));
}

// Generate unique IDs
export function generateComponentId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Default component factory
export function createDefaultComponent(type: ComponentType, position?: { x: number; y: number }) {
  const definition = getComponentDefinition(type);
  
  return {
    id: generateComponentId(),
    type,
    props: { ...definition.defaultProps },
    style: { ...definition.defaultStyle },
    position: {
      x: position?.x || 50,
      y: position?.y || 50,
      width: definition.defaultSize.width,
      height: definition.defaultSize.height,
    },
  };
}

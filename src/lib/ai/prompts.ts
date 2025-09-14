import { ComponentData, GenerationOptions } from './types';

export const SYSTEM_PROMPTS = {
  CODE_GENERATOR: `You are an expert React/Next.js developer and code generation specialist. Your task is to generate clean, production-ready, modern React code from visual component designs.

CORE PRINCIPLES:
- Write clean, readable, maintainable code
- Use modern React patterns (hooks, functional components)
- Follow TypeScript best practices
- Generate responsive, accessible components
- Preserve visual design accuracy
- Include proper error handling

CRITICAL OUTPUT FORMAT:
You MUST respond with ONLY a valid JSON object in this exact format:
{
  "files": [
    {
      "path": "src/App.tsx",
      "content": "import React from 'react';\n\nexport default function App() {\n  return (\n    <div>Hello World</div>\n  );\n}",
      "type": "component",
      "language": "typescript"
    }
  ]
}

DO NOT include any explanations, markdown, or text outside the JSON object.`,

  REACT_SPECIALIST: `You are a React specialist focused on generating high-quality, type-safe React components.

REQUIREMENTS:
- Use TypeScript with proper type definitions
- Implement proper component composition
- Include accessibility attributes (aria-*, role, etc.)
- Use semantic HTML elements
- Handle loading and error states
- Implement proper event handling
- Follow React hooks best practices`,

  TAILWIND_EXPERT: `You are a Tailwind CSS expert specializing in responsive, modern web design.

STYLING REQUIREMENTS:
- Use Tailwind CSS utility classes exclusively
- Create responsive designs (sm:, md:, lg:, xl: breakpoints)
- Implement proper spacing, typography, colors
- Use flexbox/grid for layouts
- Include hover and focus states
- Ensure accessibility with proper contrast
- Use CSS custom properties for dynamic values when needed`,
};

export function buildCodeGenerationPrompt(
  components: ComponentData[], 
  options: GenerationOptions
): string {
  const systemPrompt = SYSTEM_PROMPTS.CODE_GENERATOR;
  
  const userPrompt = `
GENERATION REQUEST:
Framework: ${options.framework}
Styling: ${options.styleFramework}
Component Style: ${options.componentStyle}
Include TypeScript: ${options.includeTypes}
Include Comments: ${options.includeComments}
Export Format: ${options.exportFormat}

COMPONENTS TO GENERATE:
${JSON.stringify(components, null, 2)}

SPECIFIC REQUIREMENTS:
${buildSpecificRequirements(components, options)}

Generate the complete, working React application code following the JSON format specified.
`;

  return `${systemPrompt}\n\n${userPrompt}`;
}

function buildSpecificRequirements(components: ComponentData[], options: GenerationOptions): string {
  const requirements = [];
  
  // Analyze components to determine specific needs
  const hasImages = components.some(c => c.type === 'image');
  const hasForms = components.some(c => ['input', 'button'].includes(c.type));
  const hasNavigation = components.some(c => c.type === 'header');
  const hasHero = components.some(c => c.type === 'hero');
  
  if (hasImages) {
    requirements.push('- Implement proper image loading with alt text and responsive sizing');
    requirements.push('- Add image error handling with fallbacks');
  }
  
  if (hasForms) {
    requirements.push('- Create interactive form elements with proper state management');
    requirements.push('- Include form validation and submission handling');
    requirements.push('- Implement accessible form labels and error messages');
  }
  
  if (hasNavigation) {
    requirements.push('- Build responsive navigation with mobile menu');
    requirements.push('- Include smooth scrolling and active states');
  }
  
  if (hasHero) {
    requirements.push('- Create compelling hero sections with call-to-action buttons');
    requirements.push('- Implement background image handling if specified');
  }
  
  requirements.push('- Ensure all components are properly composed and reusable');
  requirements.push('- Add proper TypeScript interfaces for all props');
  requirements.push('- Include loading states and error boundaries where appropriate');
  requirements.push('- Make the design fully responsive across all device sizes');
  
  return requirements.join('\n');
}

export const FALLBACK_PROMPTS = {
  SIMPLE_COMPONENT: (componentType: string, props: Record<string, unknown>) => `
Generate a simple React ${componentType} component with these props:
${JSON.stringify(props, null, 2)}

Return only valid JSON in this format:
{
  "files": [
    {
      "path": "src/Component.tsx",
      "content": "// React component code here",
      "type": "component", 
      "language": "typescript"
    }
  ]
}`,

  ERROR_RECOVERY: () => `
Generate a simple React app with basic structure:

{
  "files": [
    {
      "path": "src/App.tsx",
      "content": "import React from 'react';\n\nexport default function App() {\n  return (\n    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>\n      <div className='text-center'>\n        <h1 className='text-3xl font-bold text-gray-900 mb-4'>Generated App</h1>\n        <p className='text-gray-600'>Your generated application is ready!</p>\n      </div>\n    </div>\n  );\n}",
      "type": "component",
      "language": "typescript"
    }
  ]
}`,
};

// Prompt optimization based on model
export function optimizePromptForModel(prompt: string, model: string): string {
  if (model.includes('gemini-2.0')) {
    // Gemini 2.0 specific optimizations
    return `${prompt}\n\nIMPORTANT: Use your advanced code understanding to generate the most efficient, modern React code possible.`;
  }
  
  if (model.includes('flash')) {
    // Flash models - optimize for speed
    return `${prompt}\n\nGenerate quickly but maintain code quality. Focus on essential functionality.`;
  }
  
  return prompt;
}

// Component-specific prompts
export const COMPONENT_PROMPTS = {
  hero: (props: Record<string, unknown>) => `
Generate a compelling hero section component with:
- Title: ${props.title || 'Hero Title'}
- Subtitle: ${props.subtitle || 'Hero subtitle'}
- CTA Button: ${props.buttonText || 'Get Started'}
- Background: ${props.backgroundImage ? 'Background image with overlay' : 'Gradient background'}
- Responsive design with proper typography hierarchy`,

  card: (props: Record<string, unknown>) => `
Generate a modern card component with:
- Title: ${props.title || 'Card Title'}
- Description: ${props.description || 'Card description'}
- Image: ${props.imageUrl ? 'Featured image' : 'No image'}
- Button: ${props.buttonText ? 'Call-to-action button' : 'No button'}
- Clean design with subtle shadows and hover effects`,

  header: (props: Record<string, unknown>) => `
Generate a responsive header/navigation component with:
- Logo: ${props.logo || 'Brand Logo'}
- Navigation items: ${JSON.stringify(props.navigation || ['Home', 'About', 'Contact'])}
- CTA Button: ${props.ctaText || 'Get Started'}
- Mobile-responsive hamburger menu
- Sticky navigation with backdrop blur`,
};

// AI Generation Types
export interface GenerationRequest {
  components: ComponentData[];
  options: GenerationOptions;
  target: 'react' | 'html' | 'vue';
}

export interface GenerationOptions {
  includeStyles: boolean;
  framework: 'react' | 'next' | 'vanilla';
  styleFramework: 'tailwind' | 'css' | 'styled-components';
  includeTypes: boolean;
  includeComments: boolean;
  componentStyle: 'functional' | 'class';
  exportFormat: 'single-file' | 'multi-file';
}

export interface GenerationResult {
  success: boolean;
  files: GeneratedFile[];
  error?: string;
  metadata: GenerationMetadata;
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: FileType;
  language: string;
}

export type FileType = 
  | 'component' 
  | 'styles' 
  | 'types' 
  | 'config' 
  | 'package' 
  | 'readme';

export interface GenerationMetadata {
  model: string;
  timestamp: string;
  tokensUsed: number;
  generationTime: number;
  componentsCount: number;
  filesCount: number;
}

// Component analysis types
export interface ComponentAnalysis {
  id: string;
  type: string;
  complexity: 'simple' | 'medium' | 'complex';
  dependencies: string[];
  props: AnalyzedProp[];
  children: ComponentAnalysis[];
}

export interface AnalyzedProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: unknown;
}

// Import component data from main types
import { ComponentData } from '../types';
export type { ComponentData };

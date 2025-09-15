// Core component types

export interface ComponentData {
  id: string;
  type: ComponentType;
  props: Record<string, unknown>;
  style: ComponentStyle;
  position: Position;
  children?: ComponentData[];
}

export interface ComponentStyle {
  className?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  border?: string;
}

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
}

// Component type definitions - UPDATED to include form
export type ComponentType =
  | 'text'
  | 'button'
  | 'input'
  | 'container'
  | 'image'
  | 'hero'
  | 'card'
  | 'header'
  | 'form';

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  icon: string;
  category: ComponentCategory;
  defaultProps: Record<string, unknown>;
  defaultStyle: ComponentStyle;
  defaultSize: { width: number; height: number };
  editableProps: EditableProperty[];
}

export type ComponentCategory = 'basic' | 'layout' | 'forms' | 'media' | 'navigation';

export interface EditableProperty {
  key: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'select' | 'boolean' | 'url' | 'textarea';
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

// Builder state types
export interface BuilderState {
  components: ComponentData[];
  selectedComponentId: string | null;
  canvasSize: { width: number; height: number };
  zoom: number;
  isDragging: boolean;
  draggedComponentType: ComponentType | null;
  history: ComponentData[][];
  historyIndex: number;
  isPreviewMode: boolean;
}

export interface BuilderActions {
  addComponent: (component: ComponentData) => void;
  updateComponent: (id: string, updates: Partial<ComponentData>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  moveComponent: (id: string, position: Position) => void;
  setCanvasSize: (size: { width: number; height: number }) => void;
  setZoom: (zoom: number) => void;
  clearCanvas: () => void;
  exportProject: () => string;
  importProject: (data: string) => boolean;
  undo: () => void;
  redo: () => void;
  setPreviewMode: (isPreview: boolean) => void;
  duplicateComponent: (id: string) => void;
}

// CORRECTED: Enhanced drag and drop types
export interface DragItem {
  type: 'component';
  componentType: ComponentType;
  label: string;
  icon: string;
  id?: string;
  isExisting?: boolean;
}

export interface DropResult {
  dropEffect: string;
  position: { x: number; y: number };
}

// React DnD specific types
export interface DragItemType {
  type: string;
  componentType: ComponentType;
  label: string;
  icon: string;
  id?: string;
}

export interface DroppableResult {
  name: string;
  allowedDropEffect: string;
}

// Export types
export interface ProjectData {
  version: string;
  components: ComponentData[];
  settings: {
    canvasSize: { width: number; height: number };
    theme: string;
    metadata: {
      name: string;
      description: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

// UI State types
export interface UIState {
  sidebarWidth: number;
  previewPanelVisible: boolean;
  propertiesPanelVisible: boolean;
  componentLibraryCollapsed: boolean;
  activeTab: 'components' | 'properties' | 'layers';
}

// Event types
export interface ComponentEvent {
  type: 'click' | 'hover' | 'select' | 'drag' | 'drop';
  componentId: string;
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
}

// Canvas types
export interface CanvasSettings {
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  backgroundColor: string;
}

// Validation types
export interface ValidationError {
  componentId: string;
  property: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import { ComponentData, ComponentType, BuilderState, BuilderActions, ProjectData } from '@/lib/types';
import { createDefaultComponent } from '@/lib/components';

export function useBuilder() {
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [canvasSize, setCanvasSizeState] = useState({ width: 1200, height: 800 });
  const [zoom, setZoomState] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedComponentType, setDraggedComponentType] = useState<ComponentType | null>(null);
  const [history, setHistory] = useState<ComponentData[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Save to history whenever components change
  const saveToHistory = useCallback((newComponents: ComponentData[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newComponents]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const addComponent = useCallback((component: ComponentData) => {
    const newComponents = [...components, component];
    setComponents(newComponents);
    saveToHistory(newComponents);
  }, [components, saveToHistory]);

  const updateComponent = useCallback((id: string, updates: Partial<ComponentData>) => {
    const newComponents = components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    );
    setComponents(newComponents);
    
    // Don't save to history for every small change (like dragging)
    // Only save for significant changes
    if (updates.props || updates.style) {
      saveToHistory(newComponents);
    }
  }, [components, saveToHistory]);

  const deleteComponent = useCallback((id: string) => {
    const newComponents = components.filter(comp => comp.id !== id);
    setComponents(newComponents);
    saveToHistory(newComponents);
    
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  }, [components, selectedComponentId, saveToHistory]);

  const selectComponent = useCallback((id: string | null) => {
    setSelectedComponentId(id);
  }, []);

  const moveComponent = useCallback((id: string, position: ComponentData['position']) => {
    const newComponents = components.map(comp =>
      comp.id === id ? { ...comp, position } : comp
    );
    setComponents(newComponents);
  }, [components]);

  const setCanvasSize = useCallback((size: { width: number; height: number }) => {
    setCanvasSizeState(size);
  }, []);

  const setZoom = useCallback((newZoom: number) => {
    setZoomState(Math.max(0.1, Math.min(3, newZoom)));
  }, []);

  const clearCanvas = useCallback(() => {
    const newComponents: ComponentData[] = [];
    setComponents(newComponents);
    setSelectedComponentId(null);
    saveToHistory(newComponents);
  }, [saveToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setComponents([...history[newIndex]]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setComponents([...history[newIndex]]);
    }
  }, [history, historyIndex]);

  const duplicateComponent = useCallback((id: string) => {
    const component = components.find(comp => comp.id === id);
    if (component) {
      const duplicated = {
        ...component,
        id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: {
          ...component.position,
          x: component.position.x + 20,
          y: component.position.y + 20,
        },
      };
      addComponent(duplicated);
    }
  }, [components, addComponent]);

  const setPreviewMode = useCallback((isPreview: boolean) => {
    setIsPreviewMode(isPreview);
    if (isPreview) {
      setSelectedComponentId(null);
    }
  }, []);

  const exportProject = useCallback((): string => {
    const projectData: ProjectData = {
      version: '1.0.0',
      components,
      settings: {
        canvasSize,
        theme: 'default',
        metadata: {
          name: 'Untitled Project',
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    };
    return JSON.stringify(projectData, null, 2);
  }, [components, canvasSize]);

  const importProject = useCallback((data: string): boolean => {
    try {
      const projectData: ProjectData = JSON.parse(data);
      
      if (projectData.components && Array.isArray(projectData.components)) {
        setComponents(projectData.components);
        saveToHistory(projectData.components);
        
        if (projectData.settings?.canvasSize) {
          setCanvasSizeState(projectData.settings.canvasSize);
        }
        setSelectedComponentId(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import project:', error);
      return false;
    }
  }, [saveToHistory]);

  // Helper function to create component from drag
  const createComponentFromDrag = useCallback((
    type: ComponentType, 
    position: { x: number; y: number }
  ) => {
    const component = createDefaultComponent(type, position);
    addComponent(component);
    setSelectedComponentId(component.id);
    return component;
  }, [addComponent]);

  // Drag state handlers
  const setDragState = useCallback((dragging: boolean, componentType?: ComponentType) => {
    setIsDragging(dragging);
    setDraggedComponentType(componentType || null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 's':
            e.preventDefault();
            // Save functionality would go here
            break;
          case 'd':
            if (selectedComponentId) {
              e.preventDefault();
              duplicateComponent(selectedComponentId);
            }
            break;
        }
      }
      
      if (e.key === 'Delete' && selectedComponentId) {
        deleteComponent(selectedComponentId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedComponentId, duplicateComponent, deleteComponent]);

  return {
    // State
    components,
    selectedComponentId,
    canvasSize,
    zoom,
    isDragging,
    draggedComponentType,
    history,
    historyIndex,
    isPreviewMode,
    
    // Actions
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    moveComponent,
    setCanvasSize,
    setZoom,
    clearCanvas,
    exportProject,
    importProject,
    undo,
    redo,
    setPreviewMode,
    duplicateComponent,
    
    // Helpers
    createComponentFromDrag,
    setDragState,
    
    // Computed values
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    selectedComponent: components.find(c => c.id === selectedComponentId) || null,
  };
}

export type BuilderHook = ReturnType<typeof useBuilder>;

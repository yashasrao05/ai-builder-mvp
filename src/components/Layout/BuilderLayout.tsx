'use client';

import { useState, useEffect } from 'react';
import { 
  Home, Save, Download, Upload, Settings, Eye, EyeOff, Code, 
  Smartphone, Monitor, Sparkles, Layers3, RotateCcw, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useBuilder } from '@/hooks/useBuilder';
import ComponentLibrary from '@/components/UI/ComponentLibrary';
import Canvas from '@/components/UI/Canvas';
// REMOVED: import PreviewPanel from '@/components/UI/PreviewPanel';
import PropertiesPanel from '@/components/UI/PropertiesPanel';
import CodeGenerationModal from '@/components/CodeGeneration/CodeGenerationModal';

type PanelType = 'components' | 'properties';

export default function BuilderLayout() {
  const [activePanel, setActivePanel] = useState<PanelType>('components');
  // REMOVED: const [showPreviewPanel, setShowPreviewPanel] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState(false);
  
  const builder = useBuilder();

  // REMOVED AUTO-LOAD - Canvas will be empty on page reload/refresh
  // This ensures the canvas starts empty every time the page loads
  // useEffect(() => {
  //   try {
  //     const savedProject = localStorage.getItem('ai-builder-project');
  //     if (savedProject) {
  //       const success = builder.importProject(savedProject);
  //       if (success) {
  //         console.log('Auto-loaded saved project');
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Failed to auto-load project:', error);
  //   }
  // }, [builder]);

  const handleExport = () => {
    try {
      const projectData = builder.exportProject();
      const blob = new Blob([projectData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `website-project-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccessMessage('Project exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export project. Please try again.');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const success = builder.importProject(content);
            if (success) {
              showSuccessMessage('Project imported successfully!');
            } else {
              alert('Failed to import project. Please check the file format.');
            }
          } catch (error) {
            console.error('Import failed:', error);
            alert('Failed to import project. The file may be corrupted.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSave = () => {
    try {
      const projectData = builder.exportProject();
      localStorage.setItem('ai-builder-project', projectData);
      
      showSuccessMessage('Project saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  // NEW: Reset Canvas Function
  const handleResetCanvas = () => {
    if (window.confirm('Are you sure you want to reset the canvas? This will clear all components and saved data. This action cannot be undone.')) {
      // Clear all components from the canvas
      builder.clearCanvas();
      
      // Clear all saved data from localStorage to ensure empty canvas on reload
      localStorage.removeItem('ai-builder-project');
      localStorage.removeItem('ai-builder-autosave');
      
      // Show success message
      showSuccessMessage('Canvas reset successfully! The canvas will remain empty on page reload.');
    }
  };

  const showSuccessMessage = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  // Modified auto-save - only saves if user has manually saved before
  useEffect(() => {
    const interval = setInterval(() => {
      if (builder.components.length > 0) {
        try {
          // Only auto-save if there's already a saved project
          const existingSave = localStorage.getItem('ai-builder-project');
          if (existingSave) {
            const projectData = builder.exportProject();
            localStorage.setItem('ai-builder-autosave', projectData);
            console.log('Auto-saved project');
          }
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [builder.components, builder.exportProject]);

  // Updated keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'g':
            e.preventDefault();
            setShowCodeModal(true);
            break;
          case 'e':
            e.preventDefault();
            handleExport();
            break;
          case 'r':
            e.preventDefault();
            handleResetCanvas();
            break;
        }
      }

      // Toggle preview mode with 'P'
      if (e.key === 'p' || e.key === 'P') {
        builder.setPreviewMode(!builder.isPreviewMode);
      }

      // Delete selected component with 'Delete' key
      if (e.key === 'Delete') {
        if (builder.selectedComponentId) {
          builder.deleteComponent(builder.selectedComponentId);
        }
      }

      // REMOVED: Toggle preview panel shortcut (V key) since preview panel is removed
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [builder]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <Link 
            href="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Go to home"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <div className="w-px h-6 bg-gray-300"></div>
          <h1 className="text-lg font-semibold text-gray-900">AI Website Builder</h1>
          <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {builder.components.length} component{builder.components.length !== 1 ? 's' : ''}
          </div>
          {builder.selectedComponent && (
            <div className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {builder.selectedComponent.type} selected
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Undo/Redo */}
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={builder.undo}
              disabled={!builder.canUndo}
              className={`p-2 transition-colors border-r border-gray-200 ${
                builder.canUndo 
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={builder.redo}
              disabled={!builder.canRedo}
              className={`p-2 transition-colors ${
                builder.canRedo 
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <RotateCcw className="w-4 h-4 scale-x-[-1]" />
            </button>
          </div>
          
          <div className="w-px h-6 bg-gray-300"></div>

          {/* NEW: Reset Canvas Button */}
          <button
            onClick={handleResetCanvas}
            disabled={builder.components.length === 0}
            className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reset Canvas (Ctrl+R) - Clears all components and saved data"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* File Operations */}
          <button
            onClick={handleSave}
            data-save-button
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Save project (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Export project (Ctrl+E)"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleImport}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Import project"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          
          <div className="w-px h-6 bg-gray-300"></div>

          {/* AI Code Generation */}
          <button
            onClick={() => setShowCodeModal(true)}
            disabled={builder.components.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            title="Generate code (Ctrl+G)"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Code</span>
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Preview Mode */}
          <button
            onClick={() => builder.setPreviewMode(!builder.isPreviewMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              builder.isPreviewMode 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title="Toggle preview mode (P)"
          >
            {builder.isPreviewMode ? <Monitor className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{builder.isPreviewMode ? 'Edit Mode' : 'Preview Mode'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActivePanel('components')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center ${
                  activePanel === 'components'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layers3 className="w-4 h-4 mr-1" />
                Components
              </button>
              <button
                onClick={() => setActivePanel('properties')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center ${
                  activePanel === 'properties'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="w-4 h-4 mr-1" />
                Properties
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden">
            {activePanel === 'components' && (
              <ComponentLibrary 
                onDragStart={(type) => builder.setDragState(true, type)}
                onDragEnd={() => builder.setDragState(false)}
              />
            )}
            {activePanel === 'properties' && (
              <div className="h-full">
                {builder.selectedComponent ? (
                  <PropertiesPanel
                    selectedComponent={builder.selectedComponent}
                    onUpdateComponent={builder.updateComponent}
                    onDeleteComponent={builder.deleteComponent}
                    onDuplicateComponent={builder.duplicateComponent}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    Select a component to edit properties
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Canvas Area - FULL WIDTH (Preview Panel Removed) */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Canvas</span>
              <div className="flex items-center space-x-2">
                <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-200">
                  Desktop
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Zoom: {Math.round(builder.zoom * 100)}%
              </div>
              {builder.selectedComponent && !builder.isPreviewMode && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>{builder.selectedComponent.type} selected</span>
                </div>
              )}
              {builder.isPreviewMode && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Preview Mode Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Canvas - FULL WIDTH AND HEIGHT */}
          <div className="flex-1 bg-gray-100">
            <Canvas
              components={builder.components}
              selectedComponentId={builder.selectedComponentId}
              onAddComponent={builder.addComponent}
              onSelectComponent={builder.selectComponent}
              onUpdateComponent={builder.updateComponent}
              onCreateFromDrag={builder.createComponentFromDrag}
              zoom={builder.zoom}
              onZoomChange={builder.setZoom}
              isPreviewMode={builder.isPreviewMode}
              className="h-full w-full"
            />
          </div>
        </div>

        {/* REMOVED: Right Panel - Preview */}
        {/* The preview panel has been completely removed to give canvas full width */}
      </div>

      {/* Code Generation Modal */}
      <CodeGenerationModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        components={builder.components}
      />

      {/* Updated Keyboard Shortcuts Help */}
      <div className="hidden">
        <div className="text-xs text-gray-500">
          Shortcuts: Ctrl+S (Save), Ctrl+G (Generate), Ctrl+E (Export), Ctrl+R (Reset), P (Preview), Delete (Delete Selected)
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Home, Save, Download, Upload, Settings, Eye, EyeOff, Code, Smartphone, Monitor } from 'lucide-react';
import Link from 'next/link';
import { useBuilder } from '@/hooks/useBuilder';
import ComponentLibrary from '@/components/UI/ComponentLibrary';
import Canvas from '@/components/UI/Canvas';
import PreviewPanel from '@/components/UI/PreviewPanel';
import PropertiesPanel from '@/components/UI/PropertiesPanel';

type PanelType = 'components' | 'properties';

export default function BuilderLayout() {
  const [activePanel, setActivePanel] = useState<PanelType>('components');
  const [showPreviewPanel, setShowPreviewPanel] = useState(true);
  
  const builder = useBuilder();

  const handleExport = () => {
    const projectData = builder.exportProject();
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website-project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          const content = e.target?.result as string;
          const success = builder.importProject(content);
          if (!success) {
            alert('Failed to import project. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSave = () => {
    const projectData = builder.exportProject();
    localStorage.setItem('ai-builder-project', projectData);
    // Show success message
    const originalText = 'Save';
    const button = document.querySelector('[data-save-button]') as HTMLButtonElement;
    if (button) {
      button.textContent = 'Saved!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }
  };

  // Auto-save every 30 seconds
  useState(() => {
    const interval = setInterval(() => {
      if (builder.components.length > 0) {
        const projectData = builder.exportProject();
        localStorage.setItem('ai-builder-autosave', projectData);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  });

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <div className="w-px h-6 bg-gray-300"></div>
          <h1 className="text-lg font-semibold text-gray-900">AI Website Builder</h1>
          <div className="text-sm text-gray-500">
            {builder.components.length} component{builder.components.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Undo/Redo */}
          <button
            onClick={builder.undo}
            disabled={!builder.canUndo}
            className={`p-2 rounded-lg transition-colors ${
              builder.canUndo 
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            onClick={builder.redo}
            disabled={!builder.canRedo}
            className={`p-2 rounded-lg transition-colors ${
              builder.canRedo 
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Shift+Z)"
          >
            ↷
          </button>
          
          <div className="w-px h-6 bg-gray-300"></div>

          {/* File Operations */}
          <button
            onClick={handleSave}
            data-save-button
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleImport}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          
          <div className="w-px h-6 bg-gray-300"></div>

          {/* View Options */}
          <button
            onClick={() => setShowPreviewPanel(!showPreviewPanel)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              showPreviewPanel 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {showPreviewPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>Preview</span>
          </button>

          <button
            onClick={() => builder.setPreviewMode(!builder.isPreviewMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              builder.isPreviewMode 
                ? 'bg-green-100 text-green-700 border-green-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {builder.isPreviewMode ? <Monitor className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{builder.isPreviewMode ? 'Edit Mode' : 'Preview Mode'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActivePanel('components')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activePanel === 'components'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setActivePanel('properties')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activePanel === 'properties'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
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
              <PropertiesPanel
                selectedComponent={builder.selectedComponent}
                onUpdateComponent={builder.updateComponent}
                onDeleteComponent={builder.deleteComponent}
                onDuplicateComponent={builder.duplicateComponent}
                className="h-full"
              />
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Canvas</span>
              <div className="flex items-center space-x-2">
                <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-200">
                  Desktop
                </button>
                <button className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">
                  Tablet
                </button>
                <button className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">
                  Mobile
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Zoom: {Math.round(builder.zoom * 100)}%
              </div>
              {builder.selectedComponent && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{builder.selectedComponent.type} selected</span>
                </div>
              )}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1">
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
              className="h-full"
            />
          </div>
        </div>

        {/* Right Panel - Preview */}
        {showPreviewPanel && (
          <div className="w-80">
            <PreviewPanel
              components={builder.components}
              canvasSize={builder.canvasSize}
              className="h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}

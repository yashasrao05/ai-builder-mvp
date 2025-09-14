'use client';

import { ComponentData, ComponentType } from '@/lib/types';
import DroppableCanvas from '@/components/DragDrop/DroppableCanvas';
import ResizableComponent from '@/components/Canvas/ResizableComponent';
import { useState, useCallback } from 'react';
import { Grid, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface CanvasProps {
  components: ComponentData[];
  selectedComponentId: string | null;
  onAddComponent: (component: ComponentData) => void;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Partial<ComponentData>) => void;
  onCreateFromDrag: (type: ComponentType, position: { x: number; y: number }) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  isPreviewMode: boolean;
  className?: string;
}

export default function Canvas({
  components,
  selectedComponentId,
  onAddComponent,
  onSelectComponent,
  onUpdateComponent,
  onCreateFromDrag,
  zoom,
  onZoomChange,
  isPreviewMode,
  className = ''
}: CanvasProps) {
  const [showGrid, setShowGrid] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const handleDrop = useCallback((componentType: ComponentType, position: { x: number; y: number }) => {
    console.log('Dropping component:', componentType, 'at position:', position);
    onCreateFromDrag(componentType, position);
  }, [onCreateFromDrag]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on empty canvas area
    if (e.target === e.currentTarget) {
      onSelectComponent(null);
    }
  };

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom * 1.2, 3));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom * 0.8, 0.1));
  };

  const handleResetZoom = () => {
    onZoomChange(1);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStart) {
      // Handle canvas panning if needed
      // For now, we'll skip this functionality
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const gridStyle = showGrid ? {
    backgroundImage: `
      linear-gradient(to right, #e5e7eb 1px, transparent 1px),
      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
    `,
    backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
  } : {};

  return (
    <div className={`relative w-full h-full bg-gray-100 overflow-auto ${className}`}>
      {/* Canvas Tools */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex">
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-50 transition-colors border-r border-gray-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <div className="px-3 py-2 text-sm text-gray-600 min-w-16 text-center border-r border-gray-200">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-50 transition-colors border-r border-gray-200"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 hover:bg-gray-50 transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`
            px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-sm
            flex items-center space-x-2 hover:bg-gray-50 transition-colors
            ${showGrid ? 'bg-blue-50 border-blue-200 text-blue-700' : 'text-gray-600'}
          `}
          title="Toggle Grid"
        >
          <Grid className="w-4 h-4" />
          <span>Grid</span>
        </button>
      </div>

      {/* Canvas Info */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2">
        <div className="text-xs text-gray-500">
          {components.length} component{components.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="w-full h-full p-8">
        <DroppableCanvas
          onDrop={handleDrop}
          disabled={isPreviewMode}
          className="w-full h-full"
        >
          <div
            className={`
              relative w-full h-full bg-white rounded-lg shadow-lg border-2 border-gray-200
              transition-all duration-200 min-h-96
              ${isPreviewMode ? 'border-green-300' : 'border-gray-200'}
            `}
            style={{
              ...gridStyle,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              width: `${100 / zoom}%`,
              height: `${100 / zoom}%`,
            }}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Preview Mode Indicator */}
            {isPreviewMode && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
                <div className="bg-green-100 border border-green-300 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  Preview Mode
                </div>
              </div>
            )}

            {/* Render Components - ONLY USE ResizableComponent */}
            {components.length > 0 ? (
              components.map((component) => (
                <ResizableComponent
                  key={component.id}
                  component={component}
                  isSelected={selectedComponentId === component.id && !isPreviewMode}
                  onSelect={onSelectComponent}
                  onUpdate={onUpdateComponent}
                  scale={1}
                  isPreviewMode={isPreviewMode}
                />
              ))
            ) : (
              /* Empty State */
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-lg font-medium mb-2 text-gray-500">Start Building Your Website</h3>
                  <p className="text-sm text-center max-w-sm mb-4">
                    Drag components from the sidebar to start building your website. 
                    You can move, resize, and customize each element.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-xs rounded-full">Drag & Drop</span>
                    <span className="px-3 py-1 bg-gray-100 text-xs rounded-full">Click to Select</span>
                    <span className="px-3 py-1 bg-gray-100 text-xs rounded-full">Edit Properties</span>
                  </div>
                </div>
              </div>
            )}

            {/* Selection Rectangle (for future multi-select) */}
            {isDragging && dragStart && (
              <div className="absolute border-2 border-blue-400 bg-blue-50 bg-opacity-20 pointer-events-none" />
            )}
          </div>
        </DroppableCanvas>
      </div>

      {/* Canvas Status Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 flex items-center space-x-4">
          <div className="text-xs text-gray-500">
            Canvas: 1200 × 800
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="text-xs text-gray-500">
            Zoom: {Math.round(zoom * 100)}%
          </div>
          {selectedComponentId && (
            <>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="text-xs text-blue-600">
                Component selected
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

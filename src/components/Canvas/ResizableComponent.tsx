'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ComponentData } from '@/lib/types';
import ComponentContent from './ComponentContent';

interface ResizableComponentProps {
  component: ComponentData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ComponentData>) => void;
  scale: number;
  isPreviewMode: boolean;
}

interface ResizeHandle {
  position: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
  cursor: string;
}

const RESIZE_HANDLES: ResizeHandle[] = [
  { position: 'nw', cursor: 'nw-resize' },
  { position: 'ne', cursor: 'ne-resize' },
  { position: 'sw', cursor: 'sw-resize' },
  { position: 'se', cursor: 'se-resize' },
  { position: 'n', cursor: 'n-resize' },
  { position: 's', cursor: 's-resize' },
  { position: 'e', cursor: 'e-resize' },
  { position: 'w', cursor: 'w-resize' },
];

export default function ResizableComponent({
  component,
  isSelected,
  onSelect,
  onUpdate,
  scale,
  isPreviewMode
}: ResizableComponentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; componentX: number; componentY: number } | null>(null);
  const resizeStartRef = useRef<{ 
    x: number; 
    y: number; 
    width: number; 
    height: number; 
    left: number; 
    top: number; 
  } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isPreviewMode) return;
    
    e.stopPropagation();
    onSelect(component.id);

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      componentX: component.position.x,
      componentY: component.position.y,
    };
  }, [isPreviewMode, onSelect, component.id, component.position.x, component.position.y]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    if (isPreviewMode) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setResizeHandle(handle);
    
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: component.position.width,
      height: component.position.height,
      left: component.position.x,
      top: component.position.y,
    };
  }, [isPreviewMode, component.position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && dragStartRef.current) {
      const deltaX = (e.clientX - dragStartRef.current.x) / scale;
      const deltaY = (e.clientY - dragStartRef.current.y) / scale;
      
      const newX = Math.max(0, dragStartRef.current.componentX + deltaX);
      const newY = Math.max(0, dragStartRef.current.componentY + deltaY);
      
      onUpdate(component.id, {
        position: {
          ...component.position,
          x: newX,
          y: newY,
        },
      });
    }

    if (isResizing && resizeStartRef.current && resizeHandle) {
      const deltaX = (e.clientX - resizeStartRef.current.x) / scale;
      const deltaY = (e.clientY - resizeStartRef.current.y) / scale;
      
      let newWidth = resizeStartRef.current.width;
      let newHeight = resizeStartRef.current.height;
      let newX = resizeStartRef.current.left;
      let newY = resizeStartRef.current.top;

      // Handle different resize directions
      if (resizeHandle.includes('e')) {
        newWidth = Math.max(50, resizeStartRef.current.width + deltaX);
      }
      if (resizeHandle.includes('w')) {
        newWidth = Math.max(50, resizeStartRef.current.width - deltaX);
        newX = resizeStartRef.current.left + (resizeStartRef.current.width - newWidth);
      }
      if (resizeHandle.includes('s')) {
        newHeight = Math.max(30, resizeStartRef.current.height + deltaY);
      }
      if (resizeHandle.includes('n')) {
        newHeight = Math.max(30, resizeStartRef.current.height - deltaY);
        newY = resizeStartRef.current.top + (resizeStartRef.current.height - newHeight);
      }

      onUpdate(component.id, {
        position: {
          ...component.position,
          x: Math.max(0, newX),
          y: Math.max(0, newY),
          width: newWidth,
          height: newHeight,
        },
      });
    }
  }, [isDragging, isResizing, resizeHandle, scale, onUpdate, component.id, component.position]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    dragStartRef.current = null;
    resizeStartRef.current = null;
  }, []);

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const getHandleClassName = (handle: ResizeHandle) => {
    const baseClasses = "absolute bg-blue-500 border-2 border-white hover:bg-blue-600 transition-colors shadow-lg z-20";
    
    switch (handle.position) {
      case 'nw': return `${baseClasses} w-3 h-3 rounded-full -top-1.5 -left-1.5 cursor-nw-resize`;
      case 'ne': return `${baseClasses} w-3 h-3 rounded-full -top-1.5 -right-1.5 cursor-ne-resize`;
      case 'sw': return `${baseClasses} w-3 h-3 rounded-full -bottom-1.5 -left-1.5 cursor-sw-resize`;
      case 'se': return `${baseClasses} w-3 h-3 rounded-full -bottom-1.5 -right-1.5 cursor-se-resize`;
      case 'n': return `${baseClasses} w-4 h-2 rounded-full -top-1 left-1/2 transform -translate-x-1/2 cursor-n-resize`;
      case 's': return `${baseClasses} w-4 h-2 rounded-full -bottom-1 left-1/2 transform -translate-x-1/2 cursor-s-resize`;
      case 'e': return `${baseClasses} w-2 h-4 rounded-full -right-1 top-1/2 transform -translate-y-1/2 cursor-e-resize`;
      case 'w': return `${baseClasses} w-2 h-4 rounded-full -left-1 top-1/2 transform -translate-y-1/2 cursor-w-resize`;
      default: return baseClasses;
    }
  };

  return (
    <div
      className={`absolute ${
        isDragging ? 'cursor-grabbing z-50' : isSelected && !isPreviewMode ? 'cursor-grab z-10' : 'z-0'
      }`}
      style={{
        left: component.position.x * scale,
        top: component.position.y * scale,
        width: component.position.width * scale,
        height: component.position.height * scale,
      }}
      onMouseDown={isPreviewMode ? undefined : handleMouseDown}
    >
      {/* Component Content - This stays within bounds */}
      <div className="w-full h-full relative overflow-hidden">
        <ComponentContent
          component={component}
          isPreview={isPreviewMode}
        />
      </div>

      {/* Selection Outline */}
      {isSelected && !isPreviewMode && (
        <>
          <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none z-10 rounded-sm">
            {/* Component Label */}
            <div className="absolute -top-8 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-md">
              {component.type} ({Math.round(component.position.width)} × {Math.round(component.position.height)})
            </div>
          </div>

          {/* Resize Handles */}
          {!isDragging && (
            <>
              {RESIZE_HANDLES.map((handle) => (
                <div
                  key={handle.position}
                  className={getHandleClassName(handle)}
                  onMouseDown={(e) => handleResizeMouseDown(e, handle.position)}
                  style={{ cursor: handle.cursor }}
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

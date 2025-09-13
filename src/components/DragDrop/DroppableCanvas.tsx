'use client';

import { useDrop } from 'react-dnd';
import { ComponentType, DragItem } from '@/lib/types';
import { useRef, useEffect } from 'react';

interface DroppableCanvasProps {
  onDrop: (type: ComponentType, position: { x: number; y: number }) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function DroppableCanvas({ 
  onDrop, 
  children, 
  className = '',
  disabled = false
}: DroppableCanvasProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isOver, canDrop, draggedItem }, dropRef] = useDrop<
    DragItem, 
    void, 
    { isOver: boolean; canDrop: boolean; draggedItem: DragItem | null }
  >(
    () => ({
      accept: 'component',
      drop: (item: DragItem, monitor) => {
        if (disabled) return;
        
        const clientOffset = monitor.getClientOffset();
        const canvasElement = ref.current;
        
        if (clientOffset && canvasElement) {
          const canvasRect = canvasElement.getBoundingClientRect();
          const position = {
            x: Math.max(0, clientOffset.x - canvasRect.left - 10),
            y: Math.max(0, clientOffset.y - canvasRect.top - 10),
          };
          
          onDrop(item.componentType, position);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
        draggedItem: monitor.getItem() as DragItem | null,
      }),
    }),
    [onDrop, disabled]
  );

  // Properly connect the drop ref
  useEffect(() => {
    dropRef(ref.current);
  }, [dropRef]);

  const isActive = isOver && canDrop && !disabled;
  const canDropHere = canDrop && !disabled;

  return (
    <div
      ref={ref}
      className={`
        relative w-full h-full transition-all duration-200
        ${className}
        ${isActive ? 'ring-2 ring-blue-400 ring-inset bg-blue-50/30' : ''}
        ${canDropHere ? 'ring-1 ring-blue-200 ring-inset' : ''}
        ${disabled ? 'pointer-events-none opacity-60' : ''}
      `}
    >
      {children}
      
      {/* Drop indicator overlay */}
      {isActive && draggedItem && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center bg-blue-100/20 backdrop-blur-sm">
          <div className="bg-white border-2 border-blue-400 rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{draggedItem.icon}</span>
              <span className="font-medium text-blue-700">
                Drop {draggedItem.label} here
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

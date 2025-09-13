'use client';

import { useDrag } from 'react-dnd';
import { ComponentType, DragItem } from '@/lib/types';
import { useRef, useEffect } from 'react';

interface DraggableComponentProps {
  type: ComponentType;
  label: string;
  icon: string;
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export default function DraggableComponent({ 
  type, 
  label, 
  icon, 
  children, 
  onDragStart, 
  onDragEnd 
}: DraggableComponentProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, dragRef, dragMonitor] = useDrag<DragItem, void, { isDragging: boolean }>(
    () => ({
      type: 'component',
      item: { 
        type: 'component',
        componentType: type,
        label,
        icon
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [type, label, icon]
  );

  // Properly connect the drag ref
  useEffect(() => {
    dragRef(ref.current);
  }, [dragRef]);

  // Call onDragStart and onDragEnd based on isDragging state
  const wasDragging = useRef(false);
  useEffect(() => {
    if (isDragging && !wasDragging.current) {
      onDragStart?.();
    }
    if (!isDragging && wasDragging.current) {
      onDragEnd?.();
    }
    wasDragging.current = isDragging;
  }, [isDragging, onDragStart, onDragEnd]);

  return (
    <div
      ref={ref}
      className={`
        component-item cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        transition-all duration-150
      `}
      style={{
        transform: isDragging ? 'rotate(2deg)' : 'rotate(0deg)',
      }}
    >
      {children}
    </div>
  );
}

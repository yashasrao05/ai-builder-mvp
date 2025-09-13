'use client';

import { ComponentData, EditableProperty } from '@/lib/types';
import { getComponentDefinition } from '@/lib/components';
import { Settings, Trash2, Copy, Eye } from 'lucide-react';
import { useState } from 'react';

interface PropertiesPanelProps {
  selectedComponent: ComponentData | null;
  onUpdateComponent: (id: string, updates: Partial<ComponentData>) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  className?: string;
}

export default function PropertiesPanel({
  selectedComponent,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
  className = ''
}: PropertiesPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['properties', 'style'])
  );

  if (!selectedComponent) {
    return (
      <div className={`bg-white border-l border-gray-200 ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">Properties</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="text-center py-8">
            <Settings className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Select a component to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  const definition = getComponentDefinition(selectedComponent.type);
  
  if (!definition) {
    return (
      <div className={`bg-white border-l border-gray-200 ${className}`}>
        <div className="p-4">
          <p className="text-sm text-red-600">Unknown component type</p>
        </div>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateProperty = (key: string, value: unknown) => {
    onUpdateComponent(selectedComponent.id, {
      props: {
        ...selectedComponent.props,
        [key]: value,
      },
    });
  };

  const updateStyle = (key: string, value: string) => {
    onUpdateComponent(selectedComponent.id, {
      style: {
        ...selectedComponent.style,
        [key]: value,
      },
    });
  };

  const updatePosition = (key: string, value: number) => {
    onUpdateComponent(selectedComponent.id, {
      position: {
        ...selectedComponent.position,
        [key]: value,
      },
    });
  };

  const renderPropertyInput = (prop: EditableProperty) => {
    const value = selectedComponent.props[prop.key];

    switch (prop.type) {
      case 'text':
      case 'url':
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => updateProperty(prop.key, e.target.value)}
            placeholder={prop.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={(value as string) || ''}
            onChange={(e) => updateProperty(prop.key, e.target.value)}
            placeholder={prop.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={(value as number) || ''}
            onChange={(e) => updateProperty(prop.key, Number(e.target.value))}
            min={prop.min}
            max={prop.max}
            step={prop.step}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'select':
        return (
          <select
            value={(value as string) || ''}
            onChange={(e) => updateProperty(prop.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {prop.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={(value as boolean) || false}
              onChange={(e) => updateProperty(prop.key, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable</span>
          </label>
        );

      case 'color':
        return (
          <div className="flex space-x-2">
            <input
              type="color"
              value={(value as string) || '#000000'}
              onChange={(e) => updateProperty(prop.key, e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={(value as string) || ''}
              onChange={(e) => updateProperty(prop.key, e.target.value)}
              placeholder="#000000"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => updateProperty(prop.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };

  return (
    <div className={`bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{definition.icon}</span>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{definition.label}</h3>
              <p className="text-xs text-gray-500">ID: {selectedComponent.id.slice(-8)}</p>
            </div>
          </div>
          <Eye className="w-4 h-4 text-blue-500" />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-1">
          <button
            onClick={() => onDuplicateComponent(selectedComponent.id)}
            className="flex-1 flex items-center justify-center px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-3 h-3 mr-1" />
            Duplicate
          </button>
          <button
            onClick={() => onDeleteComponent(selectedComponent.id)}
            className="flex-1 flex items-center justify-center px-2 py-1.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </button>
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto">
        {/* Component Properties */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('properties')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">Properties</span>
            <span className={`text-gray-400 transition-transform ${expandedSections.has('properties') ? 'rotate-90' : ''}`}>
              ▶
            </span>
          </button>
          
          {expandedSections.has('properties') && (
            <div className="px-4 pb-4 space-y-3">
              {definition.editableProps.map((prop) => (
                <div key={prop.key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {prop.label}
                  </label>
                  {renderPropertyInput(prop)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Position & Size */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('position')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">Position & Size</span>
            <span className={`text-gray-400 transition-transform ${expandedSections.has('position') ? 'rotate-90' : ''}`}>
              ▶
            </span>
          </button>
          
          {expandedSections.has('position') && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">X</label>
                  <input
                    type="number"
                    value={selectedComponent.position.x}
                    onChange={(e) => updatePosition('x', Number(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Y</label>
                  <input
                    type="number"
                    value={selectedComponent.position.y}
                    onChange={(e) => updatePosition('y', Number(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
                  <input
                    type="number"
                    value={selectedComponent.position.width}
                    onChange={(e) => updatePosition('width', Number(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
                  <input
                    type="number"
                    value={selectedComponent.position.height}
                    onChange={(e) => updatePosition('height', Number(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Styles */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('style')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">Custom Styles</span>
            <span className={`text-gray-400 transition-transform ${expandedSections.has('style') ? 'rotate-90' : ''}`}>
              ▶
            </span>
          </button>
          
          {expandedSections.has('style') && (
            <div className="px-4 pb-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">CSS Classes</label>
                <input
                  type="text"
                  value={selectedComponent.style.className || ''}
                  onChange={(e) => updateStyle('className', e.target.value)}
                  placeholder="e.g., bg-blue-500 text-white"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

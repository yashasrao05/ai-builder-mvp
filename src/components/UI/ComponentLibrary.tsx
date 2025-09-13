'use client';

import { COMPONENT_DEFINITIONS, getAllCategories } from '@/lib/components';
import { ComponentType } from '@/lib/types';
import { useState } from 'react';
import { Search, Package } from 'lucide-react';
import DraggableComponent from '@/components/DragDrop/DraggableComponent';

interface ComponentItemProps {
  type: ComponentType;
  label: string;
  icon: string;
  description?: string;
  onDragStart?: (type: ComponentType) => void;
  onDragEnd?: () => void;
}

function ComponentItem({ type, label, icon, description, onDragStart, onDragEnd }: ComponentItemProps) {
  return (
    <DraggableComponent
      type={type}
      label={label}
      icon={icon}
      onDragStart={() => onDragStart?.(type)}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group">
        <div className="flex-shrink-0">
          <span className="text-2xl group-hover:scale-110 transition-transform">
            {icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
            {label}
          </h4>
          <p className="text-xs text-gray-500 truncate">
            {description || 'Drag to canvas'}
          </p>
        </div>
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
        </div>
      </div>
    </DraggableComponent>
  );
}

interface ComponentLibraryProps {
  onDragStart?: (type: ComponentType) => void;
  onDragEnd?: () => void;
}

export default function ComponentLibrary({ onDragStart, onDragEnd }: ComponentLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<string>('basic');
  const [searchTerm, setSearchTerm] = useState('');
  const categories = getAllCategories();

  const handleDragStart = (type: ComponentType) => {
    console.log('Dragging component:', type);
    onDragStart?.(type);
  };

  const handleDragEnd = () => {
    console.log('Drag ended');
    onDragEnd?.();
  };

  // Filter components based on search and category
  const filteredComponents = Object.values(COMPONENT_DEFINITIONS).filter(comp => {
    const matchesCategory = comp.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      comp.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const getComponentDescription = (type: ComponentType) => {
    const descriptions = {
      text: 'Add headings, paragraphs, and text content',
      button: 'Interactive buttons with different styles',
      input: 'Form inputs for user data collection',
      container: 'Layout container for organizing elements',
      image: 'Images with customizable properties',
      hero: 'Hero section with title and call-to-action',
      card: 'Content cards with image, title, and description',
      header: 'Navigation header with logo and menu',
    };
    return descriptions[type] || 'Drag to canvas';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize ${
                activeCategory === category
                  ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {filteredComponents.length > 0 ? (
            <>
              <div className="flex items-center space-x-2 mb-4">
                <Package className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-900 capitalize">
                  {activeCategory} Components ({filteredComponents.length})
                </h3>
              </div>
              
              <div className="space-y-3">
                {filteredComponents.map((component) => (
                  <ComponentItem
                    key={component.type}
                    type={component.type}
                    label={component.label}
                    icon={component.icon}
                    description={getComponentDescription(component.type)}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No components found</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="p-4 border-t border-gray-200 bg-blue-50">
        <div className="text-center">
          <div className="text-2xl mb-2">🎯</div>
          <h4 className="text-sm font-medium text-blue-900 mb-1">Pro Tip</h4>
          <p className="text-xs text-blue-800">
            Drag components to the canvas and customize them in the properties panel.
          </p>
        </div>
      </div>
    </div>
  );
}

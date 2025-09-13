'use client';

import { ComponentData } from '@/lib/types';
import ComponentRenderer from '@/components/Preview/ComponentRenderer';
import { Monitor, Tablet, Smartphone, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface PreviewPanelProps {
  components: ComponentData[];
  canvasSize: { width: number; height: number };
  className?: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const DEVICE_SIZES = {
  desktop: { width: 1200, height: 800, icon: Monitor },
  tablet: { width: 768, height: 1024, icon: Tablet },
  mobile: { width: 375, height: 667, icon: Smartphone },
};

export default function PreviewPanel({ components, canvasSize, className = '' }: PreviewPanelProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [isVisible, setIsVisible] = useState(true);

  const deviceSize = DEVICE_SIZES[selectedDevice];
  const scale = Math.min(
    300 / deviceSize.width,
    400 / deviceSize.height,
    1
  );

  if (!isVisible) {
    return (
      <div className={`bg-white border-l border-gray-200 ${className}`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Preview</h3>
          <button
            onClick={() => setIsVisible(true)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <p className="text-sm">Preview hidden</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Live Preview</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
        
        {/* Device Selector */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {Object.entries(DEVICE_SIZES).map(([device, config]) => {
            const Icon = config.icon;
            const isActive = selectedDevice === device;
            
            return (
              <button
                key={device}
                onClick={() => setSelectedDevice(device as DeviceType)}
                className={`
                  flex-1 flex items-center justify-center p-2 rounded-md transition-colors
                  ${isActive 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
                title={`${device} (${config.width}x${config.height})`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-4 bg-gray-50 overflow-auto">
        <div className="flex justify-center">
          <div 
            className="bg-white rounded-lg shadow-lg overflow-hidden border"
            style={{
              width: deviceSize.width * scale,
              height: deviceSize.height * scale,
              minHeight: 200,
            }}
          >
            {/* Preview Canvas */}
            <div 
              className="relative bg-white overflow-hidden"
              style={{
                width: '100%',
                height: '100%',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              {components.length > 0 ? (
                components.map((component) => (
                  <ComponentRenderer
                    key={component.id}
                    component={component}
                    isPreview={true}
                    scale={1}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">👀</div>
                    <p className="text-sm">Add components to see preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Device Info */}
        <div className="text-center mt-3">
          <p className="text-xs text-gray-500">
            {deviceSize.width} × {deviceSize.height} ({Math.round(scale * 100)}%)
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{components.length} components</span>
          <span>Live Preview</span>
        </div>
      </div>
    </div>
  );
}

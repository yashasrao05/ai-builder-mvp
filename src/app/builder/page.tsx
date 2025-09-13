'use client';

import { Suspense, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import BuilderLayout from '@/components/Layout/BuilderLayout';

// Enhanced loading component
function BuilderLoading() {
  const [loadingText, setLoadingText] = useState('Loading Builder...');
  
  useEffect(() => {
    const texts = [
      'Loading Builder...',
      'Initializing Components...',
      'Setting up Canvas...',
      'Preparing Tools...',
      'Almost Ready!'
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setLoadingText(texts[index]);
    }, 800);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          {/* Animated logo */}
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-blue-600 rounded-lg animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded animate-spin"></div>
            <div className="absolute inset-4 bg-blue-600 rounded-full"></div>
          </div>
          
          {/* Loading text */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            AI Website Builder
          </h2>
          <p className="text-gray-600 animate-pulse">
            {loadingText}
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        </div>
        
        {/* Tips */}
        <div className="mt-8 max-w-md text-center">
          <p className="text-sm text-gray-500">
            💡 <strong>Pro tip:</strong> Drag components from the library onto the canvas to start building your website.
          </p>
        </div>
      </div>
    </div>
  );
}

// Error boundary component
function BuilderError({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'Failed to load the builder. Please try again.'}
        </p>
        <div className="space-x-4">
          <button
            onClick={retry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auto-load saved project on startup
    try {
      const savedProject = localStorage.getItem('ai-builder-project');
      if (savedProject) {
        console.log('Found saved project, will auto-load...');
      }
      
      // Simulate loading time for better UX
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, []);

  const retry = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (error) {
    return <BuilderError error={error} retry={retry} />;
  }

  if (isLoading) {
    return <BuilderLoading />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Suspense fallback={<BuilderLoading />}>
        <BuilderLayout />
      </Suspense>
    </DndProvider>
  );
}

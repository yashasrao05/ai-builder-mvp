'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, Code, Sparkles } from 'lucide-react';

interface GenerationProgressProps {
  isGenerating: boolean;
  progress: number;
  stage: string;
  error?: string;
  onCancel?: () => void;
}

const GENERATION_STAGES = [
  { stage: 'analyzing', label: 'Analyzing Components', icon: '🔍' },
  { stage: 'planning', label: 'Planning Code Structure', icon: '📐' },
  { stage: 'generating', label: 'Generating React Code', icon: '⚡' },
  { stage: 'optimizing', label: 'Optimizing & Formatting', icon: '✨' },
  { stage: 'finalizing', label: 'Preparing Download', icon: '📦' },
];

export default function GenerationProgress({
  isGenerating,
  progress,
  stage,
  error,
  onCancel,
}: GenerationProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  // Animate progress bar
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setAnimatedProgress(prev => {
          const target = progress;
          const diff = target - prev;
          if (Math.abs(diff) < 1) return target;
          return prev + diff * 0.1;
        });
      }, 50);
      
      return () => clearInterval(interval);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, isGenerating]);

  // Update stage index
  useEffect(() => {
    const stageIndex = GENERATION_STAGES.findIndex(s => s.stage === stage);
    if (stageIndex >= 0) {
      setCurrentStageIndex(stageIndex);
    }
  }, [stage]);

  if (!isGenerating && !error && progress === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {error ? (
            <AlertCircle className="w-6 h-6 text-red-500" />
          ) : progress >= 100 ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <div className="relative">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {error 
                ? 'Generation Failed' 
                : progress >= 100 
                  ? 'Code Generated Successfully!' 
                  : 'Generating Your Website Code'
              }
            </h3>
            <p className="text-sm text-gray-500">
              {error 
                ? error
                : progress >= 100
                  ? 'Your React code is ready for download'
                  : GENERATION_STAGES[currentStageIndex]?.label || 'Processing...'
              }
            </p>
          </div>
        </div>

        {isGenerating && onCancel && (
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{Math.round(animatedProgress)}% Complete</span>
          <span className="text-blue-600">
            {isGenerating ? 'AI Working...' : progress >= 100 ? 'Complete!' : 'Ready'}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ease-out ${
              error 
                ? 'bg-red-500' 
                : progress >= 100 
                  ? 'bg-green-500' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
            }`}
            style={{ 
              width: `${Math.max(animatedProgress, error ? 100 : 0)}%`,
              backgroundSize: isGenerating ? '20px 20px' : 'auto',
              animation: isGenerating ? 'shimmer 2s infinite' : 'none',
            }}
          />
        </div>
      </div>

      {/* Stage Indicators */}
      {!error && (
        <div className="grid grid-cols-5 gap-2">
          {GENERATION_STAGES.map((stageInfo, index) => (
            <div 
              key={stageInfo.stage}
              className={`text-center p-2 rounded transition-all ${
                index <= currentStageIndex 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'bg-gray-50 text-gray-400'
              }`}
            >
              <div className="text-lg mb-1">{stageInfo.icon}</div>
              <div className="text-xs font-medium">{stageInfo.label.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      )}

      {/* Error Details */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -20px 0;
          }
          100% {
            background-position: 20px 0;
          }
        }
      `}</style>
    </div>
  );
}

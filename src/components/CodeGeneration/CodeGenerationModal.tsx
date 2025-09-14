'use client';

import { useState, useEffect } from 'react';
import { ComponentData } from '@/lib/types';
import { GenerationOptions, GenerationResult, GeneratedFile } from '@/lib/ai/types';
import GenerationProgress from './GenerationProgress';
import CodePreview from './CodePreview';
import { 
  X,
  Sparkles, 
  TestTube, 
  AlertCircle,
  CheckCircle,
  Code,
  Zap,
  Maximize2
} from 'lucide-react';
import JSZip from 'jszip';

interface CodeGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: ComponentData[];
}

export default function CodeGenerationModal({ isOpen, onClose, components }: CodeGenerationModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  const [options, setOptions] = useState<GenerationOptions>({
    includeStyles: true,
    framework: 'react',
    styleFramework: 'tailwind',
    includeTypes: true,
    includeComments: true,
    componentStyle: 'functional',
    exportFormat: 'multi-file',
  });

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const testConnection = async () => {
    try {
      setConnectionStatus('unknown');
      const response = await fetch('/api/ai/test-connection');
      const result = await response.json();
      
      setConnectionStatus(result.success ? 'connected' : 'error');
      
      if (!result.success) {
        setError(result.error || 'Connection test failed');
      } else {
        setError(undefined);
      }
    } catch (err) {
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to test API connection');
    }
  };

  const generateCode = async () => {
    if (components.length === 0) {
      setError('Please add some components to your canvas first');
      return;
    }

    setIsGenerating(true);
    setError(undefined);
    setProgress(0);
    setCurrentStage('analyzing');

    try {
      const stages = [
        { stage: 'analyzing', duration: 200 },
        { stage: 'planning', duration: 300 }, 
        { stage: 'generating', duration: 1000 },
        { stage: 'optimizing', duration: 200 },
        { stage: 'finalizing', duration: 100 },
      ];

      const apiCallPromise = fetch('/api/ai/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ components, options }),
      });

      let currentProgress = 0;
      const progressIncrement = 90 / stages.length;

      for (const stageInfo of stages) {
        setCurrentStage(stageInfo.stage);
        
        const startProgress = currentProgress;
        const endProgress = currentProgress + progressIncrement;
        
        const stageStart = Date.now();
        while (Date.now() - stageStart < stageInfo.duration) {
          const elapsed = Date.now() - stageStart;
          const stageProgress = (elapsed / stageInfo.duration);
          const newProgress = startProgress + (progressIncrement * stageProgress);
          setProgress(Math.min(newProgress, endProgress));
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        currentProgress = endProgress;
        setProgress(currentProgress);
      }

      const response = await apiCallPromise;
      
      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes('<!DOCTYPE') || errorText.includes('<html>')) {
          throw new Error(`API endpoint not found (${response.status})`);
        }
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Code generation failed');
      }

      setProgress(100);
      setCurrentStage('complete');
      setGenerationResult(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCode = async () => {
    if (!generationResult?.files) return;

    try {
      const zip = new JSZip();

      generationResult.files.forEach((file: GeneratedFile) => {
        zip.file(file.path, file.content);
      });

      const packageJson = {
        name: 'generated-website',
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
          next: '^14.0.0',
          tailwindcss: '^3.4.0',
        },
        devDependencies: {
          '@types/node': '^20.0.0',
          '@types/react': '^18.0.0',
          '@types/react-dom': '^18.0.0',
          typescript: '^5.0.0',
          autoprefixer: '^10.4.0',
          postcss: '^8.4.0',
        },
      };

      zip.file('package.json', JSON.stringify(packageJson, null, 2));
      zip.file('README.md', `# Generated Website\n\nGenerated using AI Website Builder on ${new Date().toLocaleString()}`);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-website-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download code files');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Code Generation</h2>
                <p className="text-gray-600">Transform your {components.length} component{components.length !== 1 ? 's' : ''} into production-ready React code</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                connectionStatus === 'connected' 
                  ? 'bg-green-100 text-green-800'
                  : connectionStatus === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {connectionStatus === 'connected' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : connectionStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Code className="w-4 h-4" />
                )}
                <span>
                  {connectionStatus === 'connected' ? 'AI Ready' : connectionStatus === 'error' ? 'AI Error' : 'AI Status'}
                </span>
              </div>

              <button
                onClick={testConnection}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <TestTube className="w-4 h-4" />
                <span>Test API</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex h-[calc(90vh-80px)]">
            {/* Left Panel - Options */}
            <div className="w-80 p-6 border-r border-gray-200 bg-gray-50 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Options</h3>
              
              {/* Framework Options */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Framework</label>
                    <select
                      value={options.framework}
                      onChange={(e) => setOptions(prev => ({ 
                        ...prev, 
                        framework: e.target.value as GenerationOptions['framework']
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="react">React</option>
                      <option value="next">Next.js</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Styling Framework</label>
                    <select
                      value={options.styleFramework}
                      onChange={(e) => setOptions(prev => ({ 
                        ...prev, 
                        styleFramework: e.target.value as GenerationOptions['styleFramework']
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="tailwind">Tailwind CSS</option>
                      <option value="css">Plain CSS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Component Style</label>
                    <select
                      value={options.componentStyle}
                      onChange={(e) => setOptions(prev => ({ 
                        ...prev, 
                        componentStyle: e.target.value as GenerationOptions['componentStyle']
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="functional">Functional Components</option>
                      <option value="class">Class Components</option>
                    </select>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 pt-4 border-t border-gray-300">
                  <h4 className="font-medium text-gray-900">Include:</h4>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={options.includeTypes}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeTypes: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">TypeScript definitions</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={options.includeComments}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeComments: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Code comments</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={options.includeStyles}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeStyles: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Styling & CSS</span>
                  </label>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateCode}
                  disabled={isGenerating || components.length === 0}
                  className={`
                    w-full flex items-center justify-center space-x-3 px-6 py-4 mt-6 rounded-xl font-semibold transition-all
                    ${isGenerating || components.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                    }
                  `}
                >
                  {isGenerating ? (
                    <>
                      <Zap className="w-5 h-5 animate-pulse" />
                      <span>Generating Code...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate React Code</span>
                    </>
                  )}
                </button>

                {/* Progress */}
                {(isGenerating || error || progress > 0) && (
                  <div className="mt-4">
                    <GenerationProgress
                      isGenerating={isGenerating}
                      progress={progress}
                      stage={currentStage}
                      error={error}
                      onCancel={() => {
                        setIsGenerating(false);
                        setProgress(0);
                        setCurrentStage('');
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Code Preview */}
            <div className="flex-1 flex flex-col">
              {generationResult?.files ? (
                <CodePreview
                  files={generationResult.files}
                  onDownload={downloadCode}
                  className="h-full"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate Code</h3>
                    <p className="text-gray-600 mb-4">
                      Configure your options and click &quot;Generate React Code&quot; to transform your design into code.
                    </p>
                    <div className="text-sm text-gray-500">
                      {components.length} component{components.length !== 1 ? 's' : ''} ready for generation
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom selection styles */}
      <style jsx global>{`
        .modal-input::selection,
        .modal-input::-moz-selection {
          background-color: #3b82f6 !important;
          color: white !important;
        }
        
        .modal-input:focus::selection,
        .modal-input:focus::-moz-selection {
          background-color: #1d4ed8 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}

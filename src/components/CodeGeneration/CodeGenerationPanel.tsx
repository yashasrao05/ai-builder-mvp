'use client';

import { useState } from 'react';
import { ComponentData } from '@/lib/types';
import { GenerationOptions, GenerationResult, GeneratedFile } from '@/lib/ai/types';
import GenerationProgress from './GenerationProgress';
import CodePreview from './CodePreview';
import { 
  Sparkles, 
  TestTube, 
  AlertCircle,
  CheckCircle,
  Code,
  Zap
} from 'lucide-react';
import JSZip from 'jszip';

interface CodeGenerationPanelProps {
  components: ComponentData[];
  className?: string;
  isModal?: boolean; // New prop for modal mode
}

export default function CodeGenerationPanel({ 
  components, 
  className = '', 
  isModal = false 
}: CodeGenerationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  // Generation options
  const [options, setOptions] = useState<GenerationOptions>({
    includeStyles: true,
    framework: 'react',
    styleFramework: 'tailwind',
    includeTypes: true,
    includeComments: true,
    componentStyle: 'functional',
    exportFormat: 'multi-file',
  });

  const testConnection = async () => {
    try {
      setConnectionStatus('unknown');
      console.log('Testing API connection...');
      
      const response = await fetch('/api/ai/test-connection', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Test response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Test result:', result);
      
      setConnectionStatus(result.success ? 'connected' : 'error');
      
      if (!result.success) {
        setError(result.error || 'Connection test failed');
      } else {
        setError(undefined);
      }
    } catch (err) {
      console.error('Connection test error:', err);
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
      console.log('Starting code generation for', components.length, 'components');
      
      const stages = [
        { stage: 'analyzing', duration: 200 },
        { stage: 'planning', duration: 300 }, 
        { stage: 'generating', duration: 1000 },
        { stage: 'optimizing', duration: 200 },
        { stage: 'finalizing', duration: 100 },
      ];

      // Start the API call immediately in parallel
      const apiCallPromise = fetch('/api/ai/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          components: components.map(comp => ({
            id: comp.id,
            type: comp.type,
            props: comp.props,
            position: comp.position,
            style: comp.style
          })),
          options,
        }),
      });

      // Simulate progress while API call is happening
      let currentProgress = 0;
      const progressIncrement = 90 / stages.length;

      for (const [index, stageInfo] of stages.entries()) {
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

      // Wait for API call to complete
      const response = await apiCallPromise;
      
      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        
        if (errorText.includes('<!DOCTYPE') || errorText.includes('<html>')) {
          throw new Error(`API endpoint not found (${response.status}). Check if the API route exists at /api/ai/generate-code`);
        }
        
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('API success response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Code generation failed');
      }

      setProgress(100);
      setCurrentStage('complete');
      setGenerationResult(result);

    } catch (err) {
      console.error('Generation error:', err);
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

      const readme = `# Generated Website

This project was generated using AI Website Builder.

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Generated Files

${generationResult.files.map(file => `- \`${file.path}\` - ${file.type}`).join('\n')}

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS  
- **Language**: TypeScript
- **Generated**: ${new Date().toLocaleString()}
`;

      zip.file('README.md', readme);

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

  const handleFrameworkChange = (value: string) => {
    setOptions(prev => ({ 
      ...prev, 
      framework: value as GenerationOptions['framework']
    }));
  };

  const handleStyleFrameworkChange = (value: string) => {
    setOptions(prev => ({ 
      ...prev, 
      styleFramework: value as GenerationOptions['styleFramework']
    }));
  };

  const handleComponentStyleChange = (value: string) => {
    setOptions(prev => ({ 
      ...prev, 
      componentStyle: value as GenerationOptions['componentStyle']
    }));
  };

  const handleExportFormatChange = (value: string) => {
    setOptions(prev => ({ 
      ...prev, 
      exportFormat: value as GenerationOptions['exportFormat']
    }));
  };

  // Different layouts for modal vs sidebar
  if (isModal) {
    return (
      <div className={`h-full flex flex-col ${className}`}>
        {/* Modal Layout - Two Columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Options and Progress */}
          <div className="w-96 border-r border-gray-200 flex flex-col">
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  connectionStatus === 'connected' 
                    ? 'bg-green-100 text-green-700'
                    : connectionStatus === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {connectionStatus === 'connected' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : connectionStatus === 'error' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Code className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {connectionStatus === 'connected' 
                      ? 'AI Ready'
                      : connectionStatus === 'error'
                        ? 'AI Error'
                        : 'Unknown'
                    }
                  </span>
                </div>

                <button
                  onClick={testConnection}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <TestTube className="w-4 h-4" />
                  <span>Test API</span>
                </button>
              </div>

              {/* Generation Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Generation Options</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Framework
                    </label>
                    <select
                      value={options.framework}
                      onChange={(e) => handleFrameworkChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      style={{ colorScheme: 'light' }}
                    >
                      <option value="react">React</option>
                      <option value="next">Next.js</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Styling
                    </label>
                    <select
                      value={options.styleFramework}
                      onChange={(e) => handleStyleFrameworkChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      style={{ colorScheme: 'light' }}
                    >
                      <option value="tailwind">Tailwind CSS</option>
                      <option value="css">Plain CSS</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={options.includeTypes}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeTypes: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Include TypeScript types</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={options.includeComments}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeComments: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Include code comments</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={options.includeStyles}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeStyles: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Include styling</span>
                  </label>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateCode}
                disabled={isGenerating || components.length === 0}
                className={`
                  w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-lg font-semibold transition-all
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

              {components.length === 0 && (
                <p className="text-center text-gray-500 text-sm">
                  Add components to your canvas to enable code generation
                </p>
              )}

              {/* Progress */}
              {(isGenerating || error || progress > 0) && (
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
              )}
            </div>
          </div>

          {/* Right: Code Preview */}
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
                  <p className="text-gray-600 max-w-md">
                    Configure your options on the left and click &quot;Generate React Code&quot; to see your AI-generated code here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Original sidebar layout (simplified)
  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-center">
            <button
              onClick={generateCode}
              disabled={components.length === 0}
              className={`
                w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all text-sm
                ${components.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg'
                }
              `}
            >
              <Sparkles className="w-4 h-4" />
              <span>Open AI Code Generator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

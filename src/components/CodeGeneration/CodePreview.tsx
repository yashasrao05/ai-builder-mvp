'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Download, Eye, Code, FileText } from 'lucide-react';
import { GeneratedFile } from '@/lib/ai/types';

interface CodePreviewProps {
  files: GeneratedFile[];
  onDownload?: () => void;
  className?: string;
}

export default function CodePreview({ files, onDownload, className = '' }: CodePreviewProps) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');

  if (!files || files.length === 0) {
    return (
      <div className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Code Generated Yet</h3>
          <p className="text-gray-600">Generate code from your components to see it here.</p>
        </div>
      </div>
    );
  }

  const activeFile = files[activeFileIndex];

  const handleCopyCode = async (fileIndex: number) => {
    try {
      await navigator.clipboard.writeText(files[fileIndex].content);
      setCopiedIndex(fileIndex);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const getFileIcon = (file: GeneratedFile) => {
    switch (file.type) {
      case 'component':
        return '⚛️';
      case 'styles':
        return '🎨';
      case 'types':
        return '📝';
      case 'config':
        return '⚙️';
      case 'package':
        return '📦';
      default:
        return '📄';
    }
  };

  const getLanguageFromPath = (path: string): string => {
    if (path.endsWith('.tsx') || path.endsWith('.jsx')) return 'typescript';
    if (path.endsWith('.ts') || path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.md')) return 'markdown';
    return 'text';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Code className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Generated Code</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('code')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'code'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code className="w-3 h-3" />
                <span>Code</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
            </div>

            {/* Actions */}
            <button
              onClick={() => handleCopyCode(activeFileIndex)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy current file"
            >
              {copiedIndex === activeFileIndex ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span className="text-sm">
                {copiedIndex === activeFileIndex ? 'Copied!' : 'Copy'}
              </span>
            </button>

            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Download ZIP</span>
              </button>
            )}
          </div>
        </div>

        {/* File Tabs */}
        <div className="flex space-x-1 mt-4 overflow-x-auto pb-2">
          {files.map((file, index) => (
            <button
              key={index}
              onClick={() => setActiveFileIndex(index)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeFileIndex === index
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>{getFileIcon(file)}</span>
              <span className="font-medium">{file.path.split('/').pop()}</span>
              <span className="text-xs opacity-60">{file.type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="h-96 overflow-auto">
        {viewMode === 'code' ? (
          /* Code View */
          <SyntaxHighlighter
            language={activeFile.language || getLanguageFromPath(activeFile.path)}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              background: '#1e1e1e',
            }}
            showLineNumbers={true}
            lineNumberStyle={{
              color: '#6e7681',
              fontSize: '12px',
              paddingRight: '16px',
            }}
            wrapLines={true}
            wrapLongLines={true}
          >
            {activeFile.content}
          </SyntaxHighlighter>
        ) : (
          /* Preview Mode */
          <div className="p-4 bg-gray-50 h-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-auto">
              {activeFile.type === 'component' && activeFile.path.includes('.tsx') ? (
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                      <script src="https://cdn.tailwindcss.com"></script>
                      <style>body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; }</style>
                    </head>
                    <body>
                      <div id="root"></div>
                      <script type="text/babel">
                        ${activeFile.content.replace('export default', 'const App =')}
                        ReactDOM.render(React.createElement(App), document.getElementById('root'));
                      </script>
                    </body>
                    </html>
                  `}
                  className="w-full h-full border-0"
                  title="Component Preview"
                />
              ) : (
                <div className="p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Preview Not Available</h4>
                  <p className="text-gray-600">
                    Preview is only available for React components. 
                    <br />
                    Switch to Code view to see the content.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-600">
            <span>📁 {activeFile.path}</span>
            <span>📏 {activeFile.content.split('\n').length} lines</span>
            <span>🔤 {activeFile.content.length} characters</span>
          </div>
          <div className="text-gray-500">
            Language: {activeFile.language || getLanguageFromPath(activeFile.path)}
          </div>
        </div>
      </div>
    </div>
  );
}

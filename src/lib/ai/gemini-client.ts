import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerationRequest, GenerationResult, GeneratedFile, GenerationMetadata } from './types';

// Define interfaces for API response parsing
interface ParsedFile {
  path: string;
  content: string;
  type: string;
  language: string;
}

interface ParsedResponse {
  files: ParsedFile[];
}

class GeminiClient {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }

  async generateCode(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      
      // Build the prompt
      const prompt = this.buildCodeGenerationPrompt(request);
      
      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the response
      const parsedResult = this.parseCodeResponse(text, request);
      
      // Calculate metadata
      const metadata: GenerationMetadata = {
        model: this.model,
        timestamp: new Date().toISOString(),
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
        generationTime: Date.now() - startTime,
        componentsCount: request.components.length,
        filesCount: parsedResult.files.length,
      };

      return {
        success: true,
        files: parsedResult.files,
        metadata,
      };
    } catch (error) {
      console.error('Code generation error:', error);
      
      return {
        success: false,
        files: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          model: this.model,
          timestamp: new Date().toISOString(),
          tokensUsed: 0,
          generationTime: Date.now() - startTime,
          componentsCount: request.components.length,
          filesCount: 0,
        },
      };
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent('Hello! Please respond with "Connection successful" to test the API.');
      const response = await result.response;
      const text = response.text();
      
      return {
        success: text.toLowerCase().includes('connection successful') || text.length > 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }

  private buildCodeGenerationPrompt(request: GenerationRequest): string {
    const { components, options, target } = request;
    
    return `
You are an expert ${target.toUpperCase()} developer. Generate clean, production-ready code based on the provided component design.

REQUIREMENTS:
- Framework: ${options.framework}
- Styling: ${options.styleFramework}
- Component Style: ${options.componentStyle} components
- Include TypeScript: ${options.includeTypes}
- Include Comments: ${options.includeComments}
- Export Format: ${options.exportFormat}

COMPONENT DATA:
${JSON.stringify(components, null, 2)}

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "files": [
    {
      "path": "src/App.tsx",
      "content": "// Generated React component code here",
      "type": "component",
      "language": "typescript"
    },
    {
      "path": "src/styles.css", 
      "content": "/* Generated styles here */",
      "type": "styles",
      "language": "css"
    }
  ]
}

CODE GENERATION GUIDELINES:
1. Use modern React patterns (hooks, functional components)
2. Generate clean, readable code with proper indentation
3. Include proper TypeScript types if requested
4. Use Tailwind CSS classes for styling (preserve existing classes)
5. Make components responsive and accessible
6. Include proper imports and exports
7. Add helpful comments if requested
8. Ensure all generated code is syntactically correct
9. Create reusable, modular components
10. Handle edge cases and provide fallbacks

CRITICAL: 
- Only return valid JSON in the exact format specified above
- Do not include any explanation text outside the JSON
- Ensure all code is production-ready and follows best practices
- Preserve the visual design accurately in code

Generate the code now:
    `;
  }

  private parseCodeResponse(response: string, request: GenerationRequest): { files: GeneratedFile[] } {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch || jsonMatch.length === 0) {
        throw new Error('No valid JSON found in response');
      }

      // Get the first match and parse it
      const jsonString = jsonMatch[0];
      const parsed = JSON.parse(jsonString) as ParsedResponse;
      
      if (!parsed.files || !Array.isArray(parsed.files)) {
        throw new Error('Invalid response format: missing files array');
      }

      // Validate and clean up the files with proper typing
      const files: GeneratedFile[] = parsed.files.map((file: ParsedFile) => ({
        path: file.path || 'generated-file.tsx',
        content: file.content || '// No content generated',
        type: (file.type || 'component') as GeneratedFile['type'],
        language: file.language || 'typescript',
      }));

      return { files };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      
      // Fallback: try to generate basic code structure
      return this.generateFallbackCode(request);
    }
  }

  private generateFallbackCode(request: GenerationRequest): { files: GeneratedFile[] } {
  const { components, options } = request;
  const hasFormComponent = components.some(comp => comp.type === 'form');

  // Generate a basic React component as fallback
  const componentName = 'GeneratedApp';
  const content = `
import React from 'react';
${hasFormComponent ? "import { supabase } from './lib/supabase';" : ""}

${options.includeTypes ? "interface Props {}" : ""}

${options.componentStyle === 'functional' ? 'const' : 'class'} ${componentName}${options.componentStyle === 'functional' ? ': React.FC = () => {' : ' extends React.Component {'}
${options.componentStyle === 'functional' ? 'return (' : 'render() { return ('}
  <div className="min-h-screen bg-gray-50 p-8">
    <h1 className="text-3xl font-bold text-center mb-8">Generated Website</h1>
    <div className="max-w-4xl mx-auto space-y-8">
      ${components.map((comp, index) => `
        <div key="${comp.id}" className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">${comp.type.toUpperCase()} Component</h2>
          <p className="text-gray-600">Component Type: ${comp.type}</p>
          ${comp.props && comp.props.text ? `<p className="mt-2">${comp.props.text}</p>` : ''}
        </div>
      `).join('')}
    </div>
  </div>
${options.componentStyle === 'functional' ? ');' : '); }'}
${options.componentStyle === 'functional' ? '};' : '}'}

export default ${componentName};
`.trim();

  const baseFiles: GeneratedFile[] = [
    {
      path: `src/${componentName}.tsx`,
      content,
      type: 'component',
      language: 'typescript',
    },
    {
      path: 'src/styles.css',
      content: `@import 'tailwindcss';

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
    to bottom,
    transparent,
    rgb(var(--background-end-rgb))
  )
  rgb(var(--background-start-rgb));
}`,
      type: 'styles',
      language: 'css',
    }
  ];

  // Add database files ONLY if form component exists
  if (hasFormComponent) {
    baseFiles.push(
      {
        path: 'src/lib/supabase.ts',
        content: `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);`,
        type: 'component',
        language: 'typescript',
      },
      {
        path: 'database-setup.sql',
        content: `-- Create contacts table
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts
CREATE POLICY "Allow public inserts" ON contacts
  FOR INSERT TO anon
  WITH CHECK (true);`,
        type: 'config',
        language: 'sql',
      },
      {
        path: 'SETUP-GUIDE.md',
        content: `# 🚀 Website Setup Guide

## Quick Start (5 minutes)

### 1. Create Supabase Database
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor
4. Copy and paste the SQL from \`database-setup.sql\`
5. Click "Run"

### 2. Configure Environment
1. Copy your Supabase URL and API key
2. Create \`.env.local\` file
3. Add your keys (see .env.example)

### 3. Deploy Website
1. Upload code to Vercel/Netlify
2. Add environment variables
3. Your website is live!

## Environment Variables
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

## Features
- ✅ Contact form
- ✅ Database storage
- ✅ Mobile responsive
- ✅ SEO optimized`,
        type: 'readme',
        language: 'markdown',
      },
      {
        path: '.env.example',
        content: `# Copy these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here`,
        type: 'config',
        language: 'bash',
      },
      {
        path: 'package.json',
        content: `{
  "name": "generated-website",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0", 
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0"
  }
}`,
        type: 'package',
        language: 'json',
      }
    );
  }

  return { files: baseFiles };
}

}

// Create singleton instance
export const geminiClient = new GeminiClient();
export default GeminiClient;

import { NextRequest, NextResponse } from 'next/server';
import { geminiClient } from '@/lib/ai/gemini-client';
import { GenerationRequest, GenerationOptions } from '@/lib/ai/types';
import { ComponentData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    console.log('API: Received code generation request');
    
    const body = await request.json();
    console.log('API: Request body:', { componentsCount: body.components?.length, options: body.options });
    
    // Validate request body
    const { components, options } = body;
    
    if (!components || !Array.isArray(components)) {
      console.error('API: Invalid components array');
      return NextResponse.json(
        { error: 'Invalid request: components array is required' },
        { status: 400 }
      );
    }

    if (components.length === 0) {
      console.error('API: Empty components array');
      return NextResponse.json(
        { error: 'At least one component is required for code generation' },
        { status: 400 }
      );
    }

    // Default options
    const generationOptions: GenerationOptions = {
      includeStyles: true,
      framework: 'react',
      styleFramework: 'tailwind',
      includeTypes: true,
      includeComments: true,
      componentStyle: 'functional',
      exportFormat: 'multi-file',
      ...options,
    };

    console.log('API: Generation options:', generationOptions);

    // Create generation request
    const generationRequest: GenerationRequest = {
      components: components as ComponentData[],
      options: generationOptions,
      target: 'react',
    };

    console.log('API: Calling Gemini client...');

    // Generate code using Gemini
    const result = await geminiClient.generateCode(generationRequest);

    console.log('API: Generation result:', { 
      success: result.success, 
      filesCount: result.files?.length,
      error: result.error 
    });

    if (!result.success) {
      console.error('API: Generation failed:', result.error);
      return NextResponse.json(
        { 
          error: result.error || 'Code generation failed',
          fallback: true,
          metadata: result.metadata 
        },
        { status: 500 }
      );
    }

    // Return successful result
    return NextResponse.json({
      success: true,
      files: result.files,
      metadata: result.metadata,
    });

  } catch (error) {
    console.error('API: Unexpected error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
        details: 'Check server logs for more information'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    message: 'AI Code Generation API',
    status: 'active',
    models: ['gemini-2.0-flash', 'gemini-1.5-flash'],
    timestamp: new Date().toISOString(),
  });
}

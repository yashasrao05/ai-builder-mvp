import { NextRequest, NextResponse } from 'next/server';
import { geminiClient } from '@/lib/ai/gemini-client';

export async function GET() {
  try {
    const result = await geminiClient.testConnection();
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Gemini API connection successful' : 'Connection failed',
      error: result.error,
      timestamp: new Date().toISOString(),
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'API connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testPrompt } = body;
    
    if (!testPrompt || typeof testPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Test prompt is required' },
        { status: 400 }
      );
    }

    // Test with custom prompt
    const result = await geminiClient.testConnection();
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Custom test successful' : 'Custom test failed',
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

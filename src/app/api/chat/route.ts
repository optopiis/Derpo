import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

if (!GEMINI_API_KEY) {
  throw new Error('Missing required environment variable: GEMINI_API_KEY');
}

if (!DEEPSEEK_API_KEY) {
  throw new Error('Missing required environment variable: DEEPSEEK_API_KEY');
}

// Set response timeout to 30 seconds
export const maxDuration = 30;

// Configure the runtime to use edge for better streaming support
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages, model = 'gemini' } = await req.json();
    
    if (model === 'gemini') {
      // Gemini expects a single prompt string, so join messages if needed
      let prompt = '';
      if (Array.isArray(messages)) {
        prompt = messages.map((m) => m.content).join('\n');
      } else if (typeof messages === 'string') {
        prompt = messages;
      } else {
        return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
      }

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Failed to read error response body';
        }
        console.error('Gemini API error:', errorText);
        return NextResponse.json(
          { error: 'Gemini API error', details: errorText },
          { status: response.status }
        );
      }

      const data = await response.json();
      let result = '';
      try {
        result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } catch (e) {
        result = '';
      }

      return NextResponse.json({ result });
    } else if (model === 'deepseek') {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages.map((m: any) => ({
            role: m.role,
            content: m.content
          })),
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Failed to read error response body';
        }
        console.error('Deepseek API error:', errorText);
        return NextResponse.json(
          { error: 'Deepseek API error', details: errorText },
          { status: response.status }
        );
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || '';

      return NextResponse.json({ result });
    } else {
      return NextResponse.json({ error: 'Invalid model specified' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in /api/chat route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request', details: error?.toString() },
      { status: 500 }
    );
  }
} 
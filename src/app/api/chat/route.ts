import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

if (!GEMINI_API_KEY) {
  throw new Error('Missing required environment variable: GEMINI_API_KEY');
}

// Set response timeout to 30 seconds
export const maxDuration = 30;

// Configure the runtime to use edge for better streaming support
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
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
    // Gemini's response structure: { candidates: [{ content: { parts: [{ text: ... }] } }] }
    let result = '';
    try {
      result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (e) {
      result = '';
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in /api/chat route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request', details: error?.toString() },
      { status: 500 }
    );
  }
} 
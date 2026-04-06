import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { join } from 'path';

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function getAboutMeContext(): string {
  try {
    const filePath = join(process.cwd(), 'public', 'about_me.md');
    return readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const aboutMe = getAboutMeContext();

    const systemPrompt = `You are AdotByte AI, a helpful assistant on Audrius Morkūnas's portfolio website.
You answer questions about Audrius based on the following information about him.
Be concise, friendly, and professional. If asked something not covered below, say you don't have that info.

--- ABOUT AUDRIUS ---
${aboutMe}
--- END ---`;

    const model = genai.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      systemInstruction: systemPrompt,
    });

    // Step 1: Convert and filter out empty/invalid messages
    const mapped = history
      .filter((m: { role: string; content: string }) =>
        (m.role === 'user' || m.role === 'ai') &&
        m.content &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0
      )
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.content.trim() }],
      }));

    // Step 2: Remove leading model messages (Gemini requires first message to be user)
    while (mapped.length > 0 && mapped[0].role === 'model') {
      mapped.shift();
    }

    // Step 3: Remove consecutive duplicate roles (Gemini requires alternating user/model)
    const cleanHistory = mapped.filter((m: { role: string }, i: number) => {
      if (i === 0) return true;
      return m.role !== mapped[i - 1].role;
    });

    const chat = model.startChat({ history: cleanHistory });
    const result = await chat.sendMessage(message.trim());
    const content = result.response.text();

    return NextResponse.json({ content });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}

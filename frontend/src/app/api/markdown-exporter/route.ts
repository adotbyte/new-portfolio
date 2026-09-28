// app/api/markdown-exporter/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/';

  // Customize your Markdown rendering logic here
  const markdownContent = `# Page content for ${path}\n\nThis is clean markdown provided for AI agents.`;

  return new NextResponse(markdownContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept',
    },
  });
}
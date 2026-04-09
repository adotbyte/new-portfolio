import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client/edge';

// ─── Clients ────────────────────────────────────────────────────────────────
import { prisma } from '@/lib/prisma';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const mailer = nodemailer.createTransport({
  host: 'smtp.zoho.com',          // or smtp.zoho.com depending on your region
  port: 587,
  secure: false,
  auth: {
    user: process.env.ZOHO_EMAIL!,
    pass: process.env.ZOHO_PASSWORD!,
  },
});

// ─── Types ───────────────────────────────────────────────────────────────────

type ChatMessage = { role: 'user' | 'ai'; content: string };

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
}

// ─── Tools ───────────────────────────────────────────────────────────────────

const tools: Anthropic.Tool[] = [
  {
    name: 'get_github_repos',
    description:
      "Fetches Audrius's latest public GitHub repositories. Use this when visitors ask about his projects, portfolio, or what he has built.",
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'send_contact_email',
    description:
      "Sends a contact message to Audrius's email on behalf of a visitor. Use this when a visitor wants to get in touch, hire Audrius, ask for collaboration, or leave a message. Always collect: visitor's name, their email address, and their message before calling this tool.",
    input_schema: {
      type: 'object' as const,
      properties: {
        visitor_name: {
          type: 'string',
          description: "The visitor's full name",
        },
        visitor_email: {
          type: 'string',
          description: "The visitor's email address",
        },
        message: {
          type: 'string',
          description: 'The message the visitor wants to send to Audrius',
        },
      },
      required: ['visitor_name', 'visitor_email', 'message'],
    },
  },
  {
    name: 'get_availability',
    description:
      "Returns Audrius's current availability status for work or freelance projects. Use when visitors ask if he is available, open to work, or looking for opportunities.",
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
];

// ─── Tool Executors ───────────────────────────────────────────────────────────

async function getGithubRepos(): Promise<string> {
  try {
    const res = await fetch(
      'https://api.github.com/users/adotbyte/repos?sort=updated&per_page=6&type=public',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'adotbyte-portfolio',
          ...(process.env.GH_TOKEN
            ? { Authorization: `Bearer ${process.env.GH_TOKEN}` }
            : {}),
        },
      }
    );

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const repos: GitHubRepo[] = await res.json();

    if (!repos.length) return 'No public repositories found.';

    const list = repos
      .map((r) => {
        const updated = new Date(r.updated_at).toLocaleDateString('en-GB', {
          month: 'short',
          year: 'numeric',
        });
        const lang = r.language ? ` · ${r.language}` : '';
        const stars = r.stargazers_count > 0 ? ` · ⭐ ${r.stargazers_count}` : '';
        const desc = r.description ? `\n   ${r.description}` : '';
        return `• [${r.name}](${r.html_url})${lang}${stars} · updated ${updated}${desc}`;
      })
      .join('\n');

    return `Here are Audrius's latest GitHub repositories:\n\n${list}`;
  } catch (err) {
    console.error('GitHub fetch error:', err);
    return 'Could not fetch GitHub repositories right now. You can visit https://github.com/adotbyte directly.';
  }
}

async function sendContactEmail(
  visitorName: string,
  visitorEmail: string,
  message: string
): Promise<string> {
  try {
    await mailer.sendMail({
      from: `"Portfolio Contact" <${process.env.ZOHO_EMAIL}>`,
      to: process.env.ZOHO_EMAIL,
      replyTo: visitorEmail,
      subject: `💼 Portfolio message from ${visitorName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New message from your portfolio</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #64748b; width: 120px;">Name</td>
              <td style="padding: 8px;">${visitorName}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 8px; font-weight: bold; color: #64748b;">Email</td>
              <td style="padding: 8px;"><a href="mailto:${visitorEmail}">${visitorEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #64748b; vertical-align: top;">Message</td>
              <td style="padding: 8px; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
            Sent via adotbyte portfolio chatbot · Reply directly to this email to respond to ${visitorName}.
          </p>
        </div>
      `,
    });

    return `✅ Message sent successfully! Audrius will receive an email and can reply directly to ${visitorEmail}.`;
  } catch (err) {
    console.error('Email send error:', err);
    return `❌ Could not send the email right now. Please contact Audrius directly on LinkedIn: https://www.linkedin.com/in/audrius-morkunas-939a2581/`;
  }
}

function getAvailability(): string {
  // ✏️  Update this object whenever your status changes — no code changes needed elsewhere
  const status = {
    available: true,
    note: 'Open to interesting projects, freelance work, and full-time opportunities.',
    preferredRoles: ['Full-Stack Developer', 'DevOps / Infrastructure', 'AI Integration'],
    preferredContact: 'LinkedIn or via this chat',
  };

  if (status.available) {
    return (
      `✅ Yes! Audrius is currently available for new opportunities.\n\n` +
      `**What he's looking for:** ${status.note}\n` +
      `**Roles of interest:** ${status.preferredRoles.join(', ')}\n` +
      `**Best way to reach him:** ${status.preferredContact}`
    );
  } else {
    return (
      `⏳ Audrius is not available for new projects right now.\n\n${status.note}\n\n` +
      `You can still send a message and he'll get back to you when he's free.`
    );
  }
}

// ─── Tool Router ─────────────────────────────────────────────────────────────

async function executeTool(
  name: string,
  input: Record<string, string>
): Promise<string> {
  switch (name) {
    case 'get_github_repos':
      return getGithubRepos();
    case 'send_contact_email':
      return sendContactEmail(
        input.visitor_name,
        input.visitor_email,
        input.message
      );
    case 'get_availability':
      return getAvailability();
    default:
      return `Unknown tool: ${name}`;
  }
}

// ─── System Prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  const aboutMe = (() => {
    try {
      return readFileSync(join(process.cwd(), 'public', 'about_me.md'), 'utf-8');
    } catch {
      return '';
    }
  })();

  return `You are AdotByte AI — a smart, friendly assistant on Audrius Morkūnas's personal portfolio website.

Your job is to help visitors learn about Audrius, his skills, and his projects — and to connect interested people with him.

## Personality
- Warm, concise, and professional
- Enthusiastic about tech (you share Audrius's passion for self-hosting, DevOps, and AI)
- Never robotic or overly formal
- If you don't know something, say so honestly

## Tools you have
- **get_github_repos** — fetch Audrius's latest GitHub projects
- **send_contact_email** — send a message to Audrius on the visitor's behalf
- **get_availability** — check if Audrius is open to new opportunities

## Contact collection rules
Before calling send_contact_email, you MUST have all three:
1. Visitor's name (ask if not given)
2. Visitor's email address (ask if not given)
3. Their message (ask if not given)

Collect them conversationally — don't present a form-like list of questions all at once.

## What you know about Audrius
${aboutMe}

## Important
- Never invent information about Audrius that isn't in the above
- Keep responses concise — visitors read on a portfolio site, not a document
- Use markdown for formatting (bullet points, bold, links) — the UI renders it`;
}

// ─── API Route Handler ────────────────────────────────────────────────────────

// GET — load history for this visitor
export async function GET(req: NextRequest) {
  const userId = req.cookies.get('visitor_id')?.value;
  if (!userId) return NextResponse.json({ messages: [] });

  const rows = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  const messages = rows.map((r: { role: string; content: string }) => ({
    role: r.role as 'user' | 'ai',
    content: r.content,
  }));

  return NextResponse.json({ messages });
}

// DELETE — clear history for this visitor
export async function DELETE(req: NextRequest) {
  const userId = req.cookies.get('visitor_id')?.value;
  if (!userId) return NextResponse.json({ ok: true });

  await prisma.message.deleteMany({ where: { userId } });
  return NextResponse.json({ ok: true });
}

// POST — send a message, persist both turns
export async function POST(req: NextRequest) {
  const userId = req.cookies.get('visitor_id')?.value;

  const { message } = await req.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: 'No message' }, { status: 400 });
  }

  // Load full history from DB (not from the client anymore)
  const rows = userId
    ? await prisma.message.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      })
    : [];

  // Save the incoming user message
  if (userId) {
    await prisma.message.create({
      data: { userId, role: 'user', content: message.trim() },
    });
  }

  // Build Anthropic messages from DB history + new message
  const messages: Anthropic.MessageParam[] = [
    ...rows.map((r: { role: string; content: string }) => ({
      role: (r.role === 'ai' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: r.content,
    })),
    { role: 'user', content: message.trim() },
  ];

  const systemPrompt = buildSystemPrompt();

    // ── Agentic loop ──────────────────────────────────────────────────────────
  // ── Agentic loop (unchanged from your original) ──
  let response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: systemPrompt,
    tools,
    messages,
  });

  while (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    );
    const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
      toolUseBlocks.map(async (block) => ({
        type: 'tool_result' as const,
        tool_use_id: block.id,
        content: await executeTool(block.name, block.input as Record<string, string>),
      }))
    );
    messages.push({ role: 'assistant', content: response.content });
    messages.push({ role: 'user', content: toolResults });
    response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    });
  }

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === 'text'
  );
  const content = textBlock?.text ?? "Sorry, I couldn't generate a response.";

  // Save AI response to DB
  if (userId) {
    await prisma.message.create({
      data: { userId, role: 'ai', content },
    });
  }

  return NextResponse.json({ content });
}
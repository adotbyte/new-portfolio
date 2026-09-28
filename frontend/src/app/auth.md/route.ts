// app/auth.md/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://morkunas.info';

  const authMdContent = `# auth.md - Agent Registration & Authentication

Welcome agents! This document outlines authentication, registration, and discovery procedures for automated systems accessing this service.

## OAuth & Discovery Endpoints

- **Protected Resource Metadata:** \`${baseUrl}/.well-known/oauth-protected-resource\`
- **Authorization Server Metadata:** \`${baseUrl}/.well-known/oauth-authorization-server\`

## Agent Registration

Agents can interact with available API endpoints using OAuth 2.0 or bearer tokens where required.

### Quick Start
1. Query \`/.well-known/oauth-protected-resource\` to identify required scopes.
2. Obtain bearer credentials or register via the specified authorization server.
3. Pass your access token in the standard HTTP \`Authorization: Bearer <token>\` header.
`;

  return new NextResponse(authMdContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
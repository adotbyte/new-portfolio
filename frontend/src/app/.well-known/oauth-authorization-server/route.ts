// app/.well-known/oauth-authorization-server/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://morkunas.info';

  const authServerData = {
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/oauth/authorize`,
    token_endpoint: `${baseUrl}/api/oauth/token`,
    registration_endpoint: `${baseUrl}/api/agent/register`,
    scopes_supported: ['read', 'write', 'agent'],
    response_types_supported: ['token', 'code'],
    grant_types_supported: ['authorization_code', 'client_credentials'],
    agent_auth: {
      skill: `${baseUrl}/.well-known/agent-skills/markdown-negotiation/SKILL.md`,
      register_uri: `${baseUrl}/api/agent/register`,
      methods: [
        {
          type: 'anonymous',
          identity_types_supported: ['anonymous'],
          anonymous: {
            credential_types_supported: ['bearer_token'],
          },
          claim_uri: `${baseUrl}/api/agent/claim`,
        },
      ],
    },
  };

  return new NextResponse(JSON.stringify(authServerData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
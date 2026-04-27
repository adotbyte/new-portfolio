import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = join(__dirname, '..', '.env.local');
const env = readFileSync(envPath, 'utf-8');
env.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [key, ...vals] = trimmed.split('=');
  if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
});

const enPath = join(__dirname, '../messages/en.json');
const ltPath = join(__dirname, '../messages/lt.json');

const enModified = statSync(enPath).mtimeMs;
const ltExists = (() => { try { return statSync(ltPath).mtimeMs; } catch { return 0; } })();

if (ltExists >= enModified) {
  console.log('✅ lt.json is up to date, skipping translation.');
  process.exit(0);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const enJson = readFileSync(enPath, 'utf-8');

console.log('Translating en.json → lt.json using Claude...');

const response = await client.messages.create({
  model: 'claude-opus-4-5',
  max_tokens: 4096,
  messages: [
    {
      role: 'user',
      content: `Translate the values in this JSON from English to Lithuanian. 
Rules:
- Keep all JSON keys exactly the same
- Only translate the string values
- Keep emojis, technical terms (Docker, Linux, Next.js etc), URLs, and code snippets untranslated
- Return ONLY the raw JSON, no markdown, no explanation

${enJson}`,
    },
  ],
});

const translated = response.content[0].text.trim();

try {
  JSON.parse(translated); // validate
  writeFileSync(ltPath, translated, 'utf-8');
  console.log('✅ lt.json written successfully!');
} catch {
  console.error('❌ Claude returned invalid JSON. Raw output:');
  console.error(translated);
}

// Translate about_me.md to Lithuanian
const mdPath = join(__dirname, '..', 'public', 'about_me.md');
const mdLtPath = join(__dirname, '..', 'public', 'about_me.lt.md');
const mdContent = readFileSync(mdPath, 'utf-8');

console.log('Translating about_me.md → about_me.lt.md...');

const mdResponse = await client.messages.create({
  model: 'claude-opus-4-5',
  max_tokens: 2048,
  messages: [{
    role: 'user',
    content: `Translate this markdown file from English to Lithuanian.
Rules:
- Keep all markdown formatting exactly the same
- Keep technical terms, product names, URLs, and code untranslated
- Return ONLY the translated markdown, no explanation

${mdContent}`,
  }],
});

writeFileSync(mdLtPath, mdResponse.content[0].text.trim(), 'utf-8');
console.log('✅ about_me.lt.md written successfully!');

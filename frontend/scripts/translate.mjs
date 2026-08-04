import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  const envPath = join(__dirname, '..', '.env.local');
  const env = readFileSync(envPath, 'utf-8');
  env.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
} catch {
  // .env.local not present — rely on environment variables already set
}

const force = process.argv.includes('--force');
const enPath = join(__dirname, '../messages/en.json');
const ltPath = join(__dirname, '../messages/lt.json');

const enModified = statSync(enPath).mtimeMs;
const ltExists = (() => { try { return statSync(ltPath).mtimeMs; } catch { return 0; } })();

if (!force && ltExists >= enModified) {
  console.log('✅ lt.json is up to date, skipping translation.');
  process.exit(0);
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.log('⚠️ No ANTHROPIC_API_KEY set, skipping translation.');
  process.exit(0);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const enJson = readFileSync(enPath, 'utf-8');
const parsedEn = JSON.parse(enJson);

console.log('Translating en.json → lt.json using Claude...');

// Recursively collect all leaf key paths from a nested object,
// e.g. { chatbot: { suggestion1: "..." } } → ["chatbot.suggestion1"]
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys = keys.concat(getAllKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Build a JSON Schema mirroring the shape of a given object, with every
// leaf typed as a string. Used as a tool's input_schema so the model
// returns structured output instead of free-text JSON it has to escape.
function buildSchema(obj) {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const properties = {};
    const required = [];
    for (const [k, v] of Object.entries(obj)) {
      properties[k] = buildSchema(v);
      required.push(k);
    }
    return { type: 'object', properties, required, additionalProperties: false };
  }
  return { type: 'string' };
}

// Translate a single top-level section via a forced tool call.
// Smaller payloads per call make it far less likely the model silently
// drops nested keys, which is what happened when the whole file was
// translated in one giant forced tool call.
async function translateSection(sectionName, sectionObj) {
  const schema = buildSchema(sectionObj);
  const sectionJson = JSON.stringify(sectionObj);

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    tools: [
      {
        name: 'submit_translation',
        description: 'Submit the Lithuanian translation matching the exact structure of the source JSON.',
        input_schema: schema,
      },
    ],
    tool_choice: { type: 'tool', name: 'submit_translation' },
    messages: [
      {
        role: 'user',
        content: `Translate every string value in this JSON object from English to Lithuanian, then call submit_translation with the complete result. Every key present in the input must be present in your tool call — do not omit any keys.
Rules:
- Keep all JSON keys exactly the same (the tool schema already enforces this)
- Only translate the string values
- Keep emojis, technical terms (Docker, Linux, Next.js etc), URLs, and code snippets untranslated
- If a translated phrase needs internal quotation marks, use Lithuanian typographic quotes „ and " rather than straight double quotes

${sectionJson}`,
      },
    ],
  });

  if (response.stop_reason !== 'tool_use') {
    throw new Error(`Unexpected stop_reason "${response.stop_reason}" for section "${sectionName}"`);
  }

  const toolUseBlock = response.content.find((b) => b.type === 'tool_use' && b.name === 'submit_translation');
  if (!toolUseBlock) {
    throw new Error(`No submit_translation tool call returned for section "${sectionName}"`);
  }

  return toolUseBlock.input;
}

const MAX_ATTEMPTS = 3;
const translated = {};
const failedSections = [];

for (const [sectionName, sectionObj] of Object.entries(parsedEn)) {
  const expectedKeys = getAllKeys(sectionObj).map((k) => `${sectionName}.${k}`);
  // Leaf values at the top level (rare, but handle gracefully) count as themselves
  const isLeaf = !(sectionObj && typeof sectionObj === 'object' && !Array.isArray(sectionObj));
  const expected = isLeaf ? [sectionName] : expectedKeys;

  let result = null;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const candidate = await translateSection(sectionName, sectionObj);
      const gotKeys = new Set(
        isLeaf ? [sectionName] : getAllKeys(candidate).map((k) => `${sectionName}.${k}`)
      );
      const missing = expected.filter((k) => !gotKeys.has(k));

      if (missing.length === 0) {
        result = candidate;
        break;
      }
      lastError = `missing keys: ${missing.join(', ')}`;
      console.warn(`⚠️  "${sectionName}" attempt ${attempt}/${MAX_ATTEMPTS} incomplete (${lastError}), retrying...`);
    } catch (err) {
      lastError = err.message;
      console.warn(`⚠️  "${sectionName}" attempt ${attempt}/${MAX_ATTEMPTS} failed (${lastError}), retrying...`);
    }
  }

  if (result === null) {
    failedSections.push({ sectionName, lastError });
  } else {
    translated[sectionName] = result;
    console.log(`✅ "${sectionName}" translated (${expected.length} keys).`);
  }
}

if (failedSections.length > 0) {
  console.error('❌ Translation incomplete after retries for the following sections:');
  failedSections.forEach(({ sectionName, lastError }) => console.error(`   - ${sectionName}: ${lastError}`));
  console.error('Refusing to write lt.json. Fix manually or re-run.');
  process.exit(1);
}

// Final sanity check across the whole merged object
const enKeys = getAllKeys(parsedEn);
const ltKeys = new Set(getAllKeys(translated));
const missingKeys = enKeys.filter((k) => !ltKeys.has(k));

if (missingKeys.length > 0) {
  console.error('❌ Final verification failed — missing keys:');
  missingKeys.forEach((k) => console.error(`   - ${k}`));
  console.error('Refusing to write lt.json. Fix manually or re-run.');
  process.exit(1);
}

writeFileSync(ltPath, JSON.stringify(translated, null, 2), 'utf-8');
console.log('✅ lt.json written successfully! All keys verified.');

// Translate about_me.md to Lithuanian
const mdPath = join(__dirname, '..', 'public', 'about_me.md');
const mdLtPath = join(__dirname, '..', 'public', 'about_me.lt.md');
const mdContent = readFileSync(mdPath, 'utf-8');

console.log('Translating about_me.md → about_me.lt.md...');

const mdResponse = await client.messages.create({
  model: 'claude-opus-4-5',
  max_tokens: 8096,
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

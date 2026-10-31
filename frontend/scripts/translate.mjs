import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 1. Užkrauname .env.local, jei jis yra
try {
  const envPath = join(__dirname, '..', '.env.local');
  const env = readFileSync(envPath, 'utf-8');
  env.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
} catch {
  // .env.local nėra, naudosime sistemos kintamuosius
}

const force = process.argv.includes('--force');
const enPath = join(__dirname, '../messages/en.json');
const ltPath = join(__dirname, '../messages/lt.json');

// 2. Nuskaitome abu failus
const enJsonRaw = readFileSync(enPath, 'utf-8');
const parsedEn = JSON.parse(enJsonRaw);

let parsedLt = {};
try {
  parsedLt = JSON.parse(readFileSync(ltPath, 'utf-8'));
} catch {
  parsedLt = {};
}

// 3. Pagalbinė funkcija, kuri surenka visus raktus iš objekto
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

// 4. Tikriname, ar yra trūkstamų raktų
const enKeysList = getAllKeys(parsedEn);
const ltKeysSet = new Set(getAllKeys(parsedLt));
const missingKeys = enKeysList.filter((k) => !ltKeysSet.has(k));

if (!force && missingKeys.length === 0) {
  console.log('✅ lt.json has all keys, skipping translation.');
  process.exit(0);
}

if (!force && missingKeys.length > 0) {
  console.log(`⚠️ Found ${missingKeys.length} missing keys. Translating...`);
}

// 5. Tikriname API raktą
if (!process.env.ANTHROPIC_API_KEY) {
  console.log('⚠️ No ANTHROPIC_API_KEY set, skipping translation.');
  process.exit(0);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
console.log('Translating en.json → lt.json using Claude...');

// 6. Schemos generavimas Claude modeliui
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

async function translateSection(sectionName, sectionObj) {
  const schema = buildSchema(sectionObj);
  const sectionJson = JSON.stringify(sectionObj);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4096,
    tools: [
      {
        name: 'submit_translation',
        description:
          'Submit the Lithuanian translation matching the exact structure of the source JSON.',
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
- If a string contains both a technical term and additional descriptive text in parentheses, keep the technical term as is, but translate the descriptive text inside the parentheses.
- If a translated phrase needs internal quotation marks, use Lithuanian typographic quotes „ and " rather than straight double quotes

${sectionJson}`,
      },
    ],
  });

  if (response.stop_reason !== 'tool_use') {
    throw new Error(
      `Unexpected stop_reason "${response.stop_reason}" for section "${sectionName}"`
    );
  }

  const toolUseBlock = response.content.find(
    (b) => b.type === 'tool_use' && b.name === 'submit_translation'
  );
  if (!toolUseBlock) {
    throw new Error(`No submit_translation tool call returned for section "${sectionName}"`);
  }

  return toolUseBlock.input;
}

// 7. Vertimo ciklas
const MAX_ATTEMPTS = 3;
const translated = {};
const failedSections = [];

for (const [sectionName, sectionObj] of Object.entries(parsedEn)) {
  const expectedKeys = getAllKeys(sectionObj).map((k) => `${sectionName}.${k}`);
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
      console.warn(
        `⚠️  "${sectionName}" attempt ${attempt}/${MAX_ATTEMPTS} incomplete (${lastError}), retrying...`
      );
    } catch (err) {
      lastError = err.message;
      console.warn(
        `⚠️  "${sectionName}" attempt ${attempt}/${MAX_ATTEMPTS} failed (${lastError}), retrying...`
      );
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
  failedSections.forEach(({ sectionName, lastError }) =>
    console.error(`   - ${sectionName}: ${lastError}`)
  );
  console.error('Refusing to write lt.json. Fix manually or re-run.');
  process.exit(1);
}

// 8. Galutinė patikra
const finalEnKeys = getAllKeys(parsedEn);
const finalLtKeys = new Set(getAllKeys(translated));
const finalMissingKeys = finalEnKeys.filter((k) => !finalLtKeys.has(k));

if (finalMissingKeys.length > 0) {
  console.error('❌ Final verification failed — missing keys:');
  finalMissingKeys.forEach((k) => console.error(`   - ${k}`));
  console.error('Refusing to write lt.json. Fix manually or re-run.');
  process.exit(1);
}

writeFileSync(ltPath, JSON.stringify(translated, null, 2), 'utf-8');
console.log('✅ lt.json written successfully! All keys verified.');

// 9. about_me.md vertimas
const mdPath = join(__dirname, '..', 'public', 'about_me.md');
const mdLtPath = join(__dirname, '..', 'public', 'about_me.lt.md');

try {
  const mdContent = readFileSync(mdPath, 'utf-8');

  // Tikriname abiejų failų modifikavimo laikus (mtime)
  const mdModified = statSync(mdPath).mtimeMs;
  let mdLtModified = 0;

  try {
    mdLtModified = statSync(mdLtPath).mtimeMs;
  } catch {
    // Jei failo nėra, mdLtModified lieka 0, todėl jis bus verčiamas
  }

  // Jei force, verčiame visada. Jei ne, tikriname datas.
  if (!force && mdLtModified >= mdModified) {
    console.log('✅ about_me.lt.md is up to date, skipping translation.');
  } else {
    console.log('Translating about_me.md → about_me.lt.md...');

    const mdResponse = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 8096,
      messages: [
        {
          role: 'user',
          content: `Translate this markdown file from English to Lithuanian.
Rules:
- Keep all markdown formatting exactly the same
- Keep technical terms, product names, URLs, and code untranslated
- Return ONLY the translated markdown, no explanation

${mdContent}`,
        },
      ],
    });

    writeFileSync(mdLtPath, mdResponse.content[0].text.trim(), 'utf-8');
    console.log('✅ about_me.lt.md written successfully!');
  }
} catch (err) {
  console.error('❌ Klaida verčiant about_me.md:', err.message);
}

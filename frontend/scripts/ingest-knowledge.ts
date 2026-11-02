import 'dotenv/config';
import { VoyageAIClient } from 'voyageai';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });

async function ingestFile(filePath: string, source: string, link?: string) {
  const content = readFileSync(filePath, 'utf-8');
  const chunks = content.match(/[\s\S]{1,500}/g) || [];

  for (const chunk of chunks) {
    if (chunk.trim().length < 20) continue;

    const response = await voyage.embed({
      input: [chunk],
      model: 'voyage-4-lite',
      inputType: 'document',
    });

    const embedding = response.data?.[0]?.embedding;
    if (!embedding) continue;

    const embeddingString = `[${embedding.join(',')}]`;

    // Pridedame nuorodą prie turinio, jei ji nurodyta
    const contentWithLink = link ? `${chunk}\n\nNuoroda: ${link}` : chunk;

    await prisma.$executeRaw`
      INSERT INTO "KnowledgeBase" ("content", "embedding", "source")
      VALUES (${contentWithLink}, ${embeddingString}::vector, ${source})
    `;

    console.log(`✅ Įtraukta iš ${source}: ${chunk.substring(0, 50)}...`);
  }
}

async function ingestGitHubReadme(repoOwner: string, repoName: string) {
  try {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/readme`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.raw+json',
        'User-Agent': 'adotbyte-portfolio',
        ...(process.env.GH_TOKEN ? { Authorization: `Bearer ${process.env.GH_TOKEN}` } : {}),
      },
    });

    if (!res.ok) {
      console.warn(`⚠️ Nepavyko gauti ${repoName} README.md: ${res.status}`);
      return;
    }

    const content = await res.text();
    const chunks = content.match(/[\s\S]{1,500}/g) || [];

    for (const chunk of chunks) {
      if (chunk.trim().length < 20) continue;

      const response = await voyage.embed({
        input: [chunk],
        model: 'voyage-4-lite',
        inputType: 'document',
      });

      const embedding = response.data?.[0]?.embedding;
      if (!embedding) continue;

      const embeddingString = `[${embedding.join(',')}]`;

      await prisma.$executeRaw`
        INSERT INTO "KnowledgeBase" ("content", "embedding", "source")
        VALUES (${chunk}, ${embeddingString}::vector, ${`GitHub: ${repoName}/README.md`})
      `;

      console.log(`✅ Įtraukta iš ${repoName}: ${chunk.substring(0, 50)}...`);
    }
  } catch (err) {
    console.error(`Klaida įtraukiant ${repoName}:`, err);
  }
}

async function main() {
  // 1. Įtraukiame about_me.md
  const aboutMePath = join(process.cwd(), 'public', 'about_me.md');
  await ingestFile(aboutMePath, 'about_me.md');

  // 2. Įtraukiame README.md iš projekto šaknies
  const readmePath = join(process.cwd(), '..', 'README.md');
  try {
    await ingestFile(readmePath, 'README.md');
  } catch {
    console.warn('⚠️ README.md nerastas, praleidžiame.');
  }

  // 3. Įtraukiame kito projekto README.md iš GitHub
  // Pakeiskite 'knowledge-base' į tikrą jūsų repo pavadinimą!
  await ingestGitHubReadme('adotbyte', 'knowledge-base');

  await ingestFile(aboutMePath, 'about_me.md');
  await ingestFile(readmePath, 'README.md', 'https://github.com/adotbyte/new-portfolio');

  console.log('✅ Visi duomenys įtraukti!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

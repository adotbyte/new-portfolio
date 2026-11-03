import { prisma } from '../src/lib/prisma';
import { VoyageAIClient } from 'voyageai';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });

async function indexBlog() {
  const blogDir = join(process.cwd(), 'public', 'blog');
  const files = readdirSync(blogDir).filter((f) => f.endsWith('.md'));

  console.log(`Rasta ${files.length} failų. Pradedame indeksavimą...`);

  for (const file of files) {
    const content = readFileSync(join(blogDir, file), 'utf-8');
    const slug = file.replace(/\.(lt|en)\.md$/, '');
    const lang = file.includes('.lt.md') ? 'lt' : 'en';
    const title = content.split('\n')[0].replace('# ', '');
    const source = `blog/${slug}.${lang}`; // Šaltinio pavadinimas, kurį matys AI

    // Suskaidome tekstą į dalis po ~500 žodžių
    const chunks = chunkText(content, 500);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Patikriname, ar toks fragmentas jau neegzistuoja (kad nedubliuotų)
      const existing = await prisma.knowledgeBase.findFirst({
        where: { source, content: chunk },
      });
      if (existing) continue;

      // Generuojame embeddingą
      const embedRes = await voyage.embed({
        input: [chunk],
        model: 'voyage-4-lite',
        inputType: 'document',
      });
      const embedding = embedRes.data?.[0]?.embedding;
      if (!embedding) continue;

      const embeddingString = `[${embedding.join(',')}]`;

      await prisma.$executeRaw`
        INSERT INTO "KnowledgeBase" ("content", "source", "embedding", "updatedAt")
        VALUES (${chunk}, ${source}, ${embeddingString}::vector, NOW())
      `;

      console.log(`✅ Indeksuotas: ${file} (dalis ${i + 1})`);
    }
  }
}

function chunkText(text: string, wordsPerChunk: number): string[] {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
  }
  return chunks;
}

indexBlog()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

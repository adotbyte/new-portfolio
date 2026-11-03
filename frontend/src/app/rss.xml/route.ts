import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  const baseUrl = 'https://morkunas.info';
  const blogDir = join(process.cwd(), 'public', 'blog');
  let items = '';

  try {
    const files = readdirSync(blogDir).filter((f) => f.endsWith('.lt.md'));

    for (const file of files) {
      const slug = file.replace('.lt.md', '');
      const content = readFileSync(join(blogDir, file), 'utf-8');
      const title = content.split('\n')[0].replace('# ', '');

      items += `
        <item>
          <title>${title}</title>
          <link>${baseUrl}/lt/blog/${slug}</link>
          <guid>${baseUrl}/lt/blog/${slug}</guid>
          <pubDate>${new Date().toUTCString()}</pubDate>
        </item>
      `;
    }
  } catch {}

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>Audrius Morkūnas Tinklaraštis</title>
        <link>${baseUrl}/lt/blog</link>
        <description>Mano patirtys, sprendimai ir technologijos.</description>
        <language>lt</language>
        ${items}
      </channel>
    </rss>`;

  return new Response(rss, {
    headers: { 'Content-Type': 'application/xml' },
  });
}

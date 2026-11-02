import { config } from 'dotenv';
import { resolve } from 'path';
import { defineConfig } from 'prisma/config';

// .env yra tame pačiame kataloge kaip ir prisma.config.ts (frontend/)
config({ path: resolve(process.cwd(), '.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma', // <-- Be "frontend/" priekio!
  migrations: {
    path: 'prisma/migrations', // <-- Be "frontend/" priekio!
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

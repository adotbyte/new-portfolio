import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../node_modules/.prisma/client-homelab'; // The path to a generated client
import { PrismaPg } from '@prisma/adapter-pg';

// We create a login specifically for the homelab database.
const adapter = new PrismaPg({ connectionString: process.env.HOMELAB_DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      include: { services: true },
    });
    return NextResponse.json(devices);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve data' }, { status: 500 });
  }
}
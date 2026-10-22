import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../node_modules/.prisma/client-homelab';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'node:fs';

const adapter = new PrismaPg({ connectionString: process.env.HOMELAB_DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    // 1. Gauname duomenis iš mūsų homelab duomenų bazės
    const devices = await prisma.device.findMany({
      include: { services: true },
    });

    // 2. Gauname tikrą Docker konteinerių skaičių per saugų proxy
    let dockerCount = 0;
    try {
      const dockerRes = await fetch('http://socket-proxy:2375/containers/json?all=false', {
        cache: 'no-store',
      });
      if (dockerRes.ok) {
        const containers = await dockerRes.json();
        dockerCount = containers.length;
      }
    } catch (e) {
      console.error('Failed to reach the Docker proxy:', e);
    }

    // 3. Nuskaitome TIKRĄ atmintį iš avietės /proc/meminfo failo
    let memTotal = "16G";
    let memUsed = "8.2G";
    let memFree = "7.8G";

    try {
      const memInfo = fs.readFileSync('/host/proc/meminfo', 'utf8');
      
      const totalMatch = memInfo.match(/MemTotal:\s+(\d+)/);
      const availableMatch = memInfo.match(/MemAvailable:\s+(\d+)/);

      if (totalMatch && availableMatch) {
        const totalKb = parseInt(totalMatch[1]);
        const availableKb = parseInt(availableMatch[1]);
        const usedKb = totalKb - availableKb;

        // Konvertuojame į GB (1 GB = 1048576 kB)
        memTotal = (totalKb / 1048576).toFixed(1) + 'G';
        memUsed = (usedKb / 1048576).toFixed(1) + 'G';
        memFree = (availableKb / 1048576).toFixed(1) + 'G';
      }
    } catch (e) {
      console.error('Failed to read /host/proc/meminfo:', e);
    }

    // 4. Formuojame atsakymą
    return NextResponse.json({
      devices: devices,
      stats: {
        load: "0.42, 0.38, 0.35", // Kol kas paliekame statinį, nes os.loadavg() konteineryje rodo 0
        memory: {
          total: memTotal,
          used: memUsed,
          free: memFree,
        },
        dockerCount: dockerCount,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve data' }, { status: 500 });
  }
}
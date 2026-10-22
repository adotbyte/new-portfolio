import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../node_modules/.prisma/client-homelab';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'node:fs';

const adapter = new PrismaPg({ connectionString: process.env.HOMELAB_DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    // 1. DB duomenys
    const devices = await prisma.device.findMany({
      include: { services: true },
    });

    // 2. Docker skaičius
    let dockerCount = 0;
    try {
      const dockerRes = await fetch('http://socket-proxy:2375/containers/json?all=false', { cache: 'no-store' });
      if (dockerRes.ok) {
        const containers = await dockerRes.json();
        dockerCount = containers.length;
      }
    } catch (e) {
      console.error('Docker proxy error:', e);
    }

    // 3. Atmintis, Uptime ir Load iš /proc
    let memTotal = "16G", memUsed = "8.2G", memFree = "7.8G";
    let uptimeDays = 247;
    let load = "0.00, 0.00, 0.00";

    try {
      const memInfo = fs.readFileSync('/host/proc/meminfo', 'utf8');
      const totalMatch = memInfo.match(/MemTotal:\s+(\d+)/);
      const availableMatch = memInfo.match(/MemAvailable:\s+(\d+)/);
      if (totalMatch && availableMatch) {
        const totalKb = parseInt(totalMatch[1]);
        const availableKb = parseInt(availableMatch[1]);
        const usedKb = totalKb - availableKb;
        memTotal = (totalKb / 1048576).toFixed(1) + 'G';
        memUsed = (usedKb / 1048576).toFixed(1) + 'G';
        memFree = (availableKb / 1048576).toFixed(1) + 'G';
      }

      // Nuskaitome uptime (pirmas skaičius yra sekundės)
      const uptimeInfo = fs.readFileSync('/host/proc/uptime', 'utf8');
      const uptimeSeconds = parseFloat(uptimeInfo.split(' ')[0]);
      uptimeDays = Math.floor(uptimeSeconds / 86400);

      // Nuskaitome load average
      const loadInfo = fs.readFileSync('/host/proc/loadavg', 'utf8');
      const loadParts = loadInfo.split(' ');
      load = `${loadParts[0]}, ${loadParts[1]}, ${loadParts[2]}`;

    } catch (e) {
      console.error('Failed to read /proc failų:', e);
    }

    return NextResponse.json({
      devices,
      stats: {
        load,
        uptimeDays,
        memory: { total: memTotal, used: memUsed, free: memFree },
        dockerCount,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve data' }, { status: 500 });
  }
}
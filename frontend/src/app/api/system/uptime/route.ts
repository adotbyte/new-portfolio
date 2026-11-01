import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const PROMETHEUS_URL = process.env.PROMETHEUS_URL;
    if (!PROMETHEUS_URL) throw new Error('PROMETHEUS_URL not set');

    const query = 'node_boot_time_seconds';
    const res = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.data?.result?.[0]) {
      const bootTime = parseFloat(data.data.result[0].value[1]);
      const now = Date.now() / 1000;
      const uptimeSeconds = now - bootTime;
      const days = Math.floor(uptimeSeconds / 86400);
      const hours = Math.floor((uptimeSeconds % 86400) / 3600);
      return NextResponse.json({ days, hours });
    }

    return NextResponse.json({ error: 'No uptime data' }, { status: 500 });
  } catch (error) {
    console.error('Uptime error:', error);
    return NextResponse.json({ error: 'Failed to fetch uptime' }, { status: 500 });
  }
}

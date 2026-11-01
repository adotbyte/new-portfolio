import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const PROMETHEUS_URL = process.env.PROMETHEUS_URL;
    if (!PROMETHEUS_URL) throw new Error('PROMETHEUS_URL not set');

    // Uptime
    const bootRes = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent('node_boot_time_seconds')}`);
    const bootData = await bootRes.json();

    // Load average
    const load1Res = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent('node_load1')}`);
    const load1Data = await load1Res.json();
    const load5Res = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent('node_load5')}`);
    const load5Data = await load5Res.json();
    const load15Res = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent('node_load15')}`);
    const load15Data = await load15Res.json();

    const load1 = parseFloat(load1Data.data?.result?.[0]?.value[1] || '0');
    const load5 = parseFloat(load5Data.data?.result?.[0]?.value[1] || '0');
    const load15 = parseFloat(load15Data.data?.result?.[0]?.value[1] || '0');

    if (bootData.data?.result?.[0]) {
      const bootTime = parseFloat(bootData.data.result[0].value[1]);
      const now = Date.now() / 1000;
      const uptimeSeconds = now - bootTime;
      const days = Math.floor(uptimeSeconds / 86400);
      const hours = Math.floor((uptimeSeconds % 86400) / 3600);
      return NextResponse.json({ days, hours, load: `${load1.toFixed(2)}, ${load5.toFixed(2)}, ${load15.toFixed(2)}` });
    }

    return NextResponse.json({ error: 'No uptime data' }, { status: 500 });
  } catch (error) {
    console.error('Uptime error:', error);
    return NextResponse.json({ error: 'Failed to fetch uptime' }, { status: 500 });
  }
}
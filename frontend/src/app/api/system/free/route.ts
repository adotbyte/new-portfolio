import { NextResponse } from 'next/server';
import { connection } from 'next/server';

export async function GET() {
  await connection();
  try {
    const PROMETHEUS_URL = process.env.PROMETHEUS_URL;
    if (!PROMETHEUS_URL) throw new Error('PROMETHEUS_URL not set');

    const totalQuery = 'node_memory_MemTotal_bytes';
    const availableQuery = 'node_memory_MemAvailable_bytes';

    const [totalRes, availableRes] = await Promise.all([
      fetch(`${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent(totalQuery)}`),
      fetch(`${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent(availableQuery)}`),
    ]);

    const totalData = await totalRes.json();
    const availableData = await availableRes.json();

    const totalBytes = parseFloat(totalData.data?.result?.[0]?.value[1] || '0');
    const availableBytes = parseFloat(availableData.data?.result?.[0]?.value[1] || '0');

    const total = totalBytes / 1024 / 1024 / 1024;
    const available = availableBytes / 1024 / 1024 / 1024;
    const used = total - available;

    return NextResponse.json({ total, used, free: available, available });
  } catch (error) {
    console.error('Free error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

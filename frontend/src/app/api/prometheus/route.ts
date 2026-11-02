import { NextResponse } from 'next/server';
import { connection } from 'next/server';

export async function GET() {
  await connection();
  try {
    const PROMETHEUS_URL = process.env.PROMETHEUS_URL;
    if (!PROMETHEUS_URL) {
      throw new Error('PROMETHEUS_URL is not defined in environment variables');
    }

    const queries = {
      cpu: 'sum(rate(container_cpu_usage_seconds_total{name!=""}[5m])) * 100',
      ram: 'sum(container_memory_working_set_bytes{name!=""}) / 1024 / 1024',
    };

    const results: Record<string, number> = { cpu: 0, ram: 0 };

    for (const [key, query] of Object.entries(queries)) {
      const res = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent(query)}`);
      const data = await res.json();

      const value = data.data?.result?.[0]?.value?.[1];
      results[key] = value ? parseFloat(value) : 0;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Prometheus fetch error:', error);
    return NextResponse.json({ cpu: 0, ram: 0 }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const PROMETHEUS_URL = process.env.PROMETHEUS_URL;
    if (!PROMETHEUS_URL) throw new Error('PROMETHEUS_URL not set');

    // Užklausa, kuri grąžina konteinerių pavadinimus ir jų būseną
    const query = 'container_last_seen{name!=""}';
    const res = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.data?.result) {
      const containers = data.data.result.map((r: any) => ({
        name: r.metric.name || 'unknown',
        image: r.metric.image || 'unknown',
        status: 'Up', // docker-exporter gali neturėti statuso, todėl laikinai 'Up'
      }));
      return NextResponse.json({ containers });
    }

    return NextResponse.json({ containers: [] });
  } catch (error) {
    console.error('Docker PS error:', error);
    return NextResponse.json({ error: 'Failed to fetch containers' }, { status: 500 });
  }
}

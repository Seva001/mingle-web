import { NextResponse } from 'next/server';

/** Liveness only: deliberately does not disclose environment, provider, or database state. */
export function GET() {
  return NextResponse.json(
    { status: 'ok', service: 'mingle-web' },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}

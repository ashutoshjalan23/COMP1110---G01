import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stop = searchParams.get("stop");
  if (!stop) return NextResponse.json({ error: "Missing stop" }, { status: 400 });

  try {
    const r = await fetch(
      `https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${stop}`,
      { next: { revalidate: 30 } }
    );
    const data = await r.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ data: [] });
  }
}

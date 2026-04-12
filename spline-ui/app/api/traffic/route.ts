import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fromLat = searchParams.get("fromLat");
  const fromLon = searchParams.get("fromLon");
  const toLat   = searchParams.get("toLat");
  const toLon   = searchParams.get("toLon");
  if (!fromLat || !fromLon || !toLat || !toLon)
    return NextResponse.json({ error: "Missing coords" }, { status: 400 });

  try {
    const r = await fetch("https://tdas-api.hkemobility.gov.hk/tdas/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        start:    { lat: parseFloat(fromLat), long: parseFloat(fromLon) },
        end:      { lat: parseFloat(toLat),   long: parseFloat(toLon) },
        departIn: 0, lang: "en", type: "ST",
      }),
      next: { revalidate: 60 },
    });
    const data = await r.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ jSpeed: null });
  }
}

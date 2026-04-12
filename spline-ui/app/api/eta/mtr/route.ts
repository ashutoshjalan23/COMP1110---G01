import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const line = searchParams.get("line");
  const sta  = searchParams.get("sta");
  if (!line || !sta) return NextResponse.json({ error: "Missing line or sta" }, { status: 400 });

  try {
    const r = await fetch(
      `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${line}&sta=${sta}`,
      { next: { revalidate: 30 } }
    );
    const data = await r.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: 0 }, { status: 200 });
  }
}

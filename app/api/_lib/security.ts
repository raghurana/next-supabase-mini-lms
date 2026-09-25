import { NextResponse } from "next/server";

export const rejectCrossSiteRequest = (request: Request) => {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Cross-site request rejected" }, { status: 403 });
  }

  return null;
};

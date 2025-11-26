import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backendUrl = "https://14d87ace0ad2.ngrok-free.app/auth/me";
  const token = req.headers.get("authorization") ?? "";

  const response = await fetch(backendUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: token }),
    },
    credentials: "include",
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}


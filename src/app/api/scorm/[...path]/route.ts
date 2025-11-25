import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Your SCORM storage base URL (R2, S3, CDN, etc.)
const SCORM_BASE_URL = "https://pub-b50c5924d2c64c1397f8e200306b9bfb.r2.dev";

export async function GET(
  req: NextRequest,
  context: { params: { path: string[] } },
) {
  try {
    const { path } = context.params;

    // Build the full remote URL
    const remoteUrl = new URL(path.join("/"), SCORM_BASE_URL).toString();

    // Fetch file from R2/S3/CDN
    const response = await fetch(remoteUrl);

    if (!response.ok) {
      return new NextResponse(`Failed to fetch: ${remoteUrl}`, {
        status: response.status,
      });
    }

    // Clone headers so we can modify them
    const headers = new Headers(response.headers);

    // Remove problematic headers (CORS, security)
    headers.delete("Content-Security-Policy");
    headers.delete("Cross-Origin-Embedder-Policy");
    headers.delete("Cross-Origin-Opener-Policy");
    headers.delete("Cross-Origin-Resource-Policy");

    // IMPORTANT: Make it same-origin to browser
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Headers", "*");
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");

    // Keep correct content type (HTML, JS, JSON, XML, etc.)
    return new NextResponse(await response.arrayBuffer(), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("SCORM Proxy Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

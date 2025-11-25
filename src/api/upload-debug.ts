import { NextResponse } from "next/server";

export async function GET() {
  try {
    const envVars = {
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID ? '✅ Set' : '❌ Missing',
      CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing',
      CLOUDFLARE_R2_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing',
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || '❌ Missing',
      NEXT_PUBLIC_R2_URL: process.env.NEXT_PUBLIC_R2_URL || '❌ Missing',
    };

    console.log('🔍 Debug - Environment variables:', envVars);

    return NextResponse.json({
      status: 'Debug info',
      environment: envVars,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Debug route error:', error);
    return NextResponse.json({
      error: 'Debug route failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
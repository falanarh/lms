import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

// Check environment variables
function validateEnvironment() {
  const required = [
    'CLOUDFLARE_ACCOUNT_ID',
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME'
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing);
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  console.log('✅ Environment variables validated');
  return true;
}

// Konfigurasi S3 Client untuk Cloudflare R2
let s3Client: S3Client | null = null;

function getS3Client() {
  if (s3Client) return s3Client;

  try {
    validateEnvironment();

    s3Client = new S3Client({
      region: "auto", // R2 menggunakan 'auto'
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    });

    console.log('✅ S3 Client initialized for R2');
    return s3Client;
  } catch (error) {
    console.error('❌ Failed to initialize S3 client:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 Upload API called');

  try {
    // Validate environment first
    const client = getS3Client();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    console.log('📄 File received:', file ? { name: file.name, size: file.size, type: file.type } : null);

    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const fileName = `${Date.now()}-${file.name}`;
    console.log('📝 Generated fileName:', fileName);

    const params = {
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    };

    console.log('☁️ Uploading to bucket:', process.env.R2_BUCKET_NAME);

    const command = new PutObjectCommand(params);
    const result = await client.send(command);

    console.log('✅ Upload successful:', result);

    // Return success response
    const response = { fileName };
    console.log('📤 Returning response:', response);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("❌ Error uploading to R2:", error);

    let errorMessage = "Gagal mengunggah file";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
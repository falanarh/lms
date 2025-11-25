import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

// Konfigurasi S3 Client untuk Cloudflare R2
const s3Client = new S3Client({
  region: "auto", // R2 menggunakan 'auto'
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;

    const params = {
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName, 
      Body: buffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Kita akan kembalikan nama file, nanti akan digabung dengan public URL
    return NextResponse.json({ fileName }, { status: 200 });

  } catch (error) {
    console.error("Error uploading to R2:", error);
    return NextResponse.json({ error: "Gagal mengunggah file" }, { status: 500 });
  }
}
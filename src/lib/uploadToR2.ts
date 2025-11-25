// lib/uploadToR2.ts
export interface UploadResult {
    publicUrl: string;
    fileName: string;
  }
  
  export async function uploadFileToR2(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }
  
    const { fileName } = await response.json();
    
    // Construct public URL - adjust this based on your R2 public domain
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;
    
    return { publicUrl, fileName };
  }
  
  export function validateFile(
    file: File,
    allowedTypes: string[],
    maxSize: number
  ): boolean {
    if (!allowedTypes.includes(file.type)) {
      return false;
    }
    if (file.size > maxSize) {
      return false;
    }
    return true;
  }
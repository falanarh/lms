import { z } from "zod";

const fileSizeLimit = 5 * 1024 * 1024; // 5 MB
const imagesSizeLimit = 1 * 1024 * 1024; // 1 MB
const videoSizeLimit = 50 * 1024 * 1024; // 50 MB
const scormSizeLimit = 100 * 1024 * 1024; // 100 MB

// Document Schema
export const DOCUMENT_SCHEMA = z
  .instanceof(File)
  .refine(
    (file) =>
      [
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/msword",
        "application/vnd.ms-powerpoint",
      ].includes(file.type),
    { message: "Tipe file dokumen tidak valid (hanya PDF, DOC, DOCX, PPT, PPTX)" }
  )
  .refine((file) => file.size <= fileSizeLimit, {
    message: `Ukuran file harus kurang dari ${fileSizeLimit / (1024 * 1024)} MB`,
  });

// Image Schema
export const IMAGE_SCHEMA = z
  .instanceof(File)
  .refine(
    (file) =>
      [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/svg+xml",
        "image/gif",
        "image/webp",
      ].includes(file.type),
    { message: "Tipe file gambar tidak valid (hanya PNG, JPG, JPEG, SVG, GIF, WEBP)" }
  )
  .refine((file) => file.size <= imagesSizeLimit, {
    message: `Ukuran gambar harus kurang dari ${imagesSizeLimit / (1024 * 1024)} MB`,
  });

// Video Schema
export const VIDEO_SCHEMA = z
  .instanceof(File)
  .refine(
    (file) =>
      [
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
        "video/x-msvideo",
        "video/webm",
      ].includes(file.type),
    { message: "Tipe file video tidak valid (hanya MP4, MPEG, MOV, AVI, WEBM)" }
  )
  .refine((file) => file.size <= videoSizeLimit, {
    message: `Ukuran video harus kurang dari ${videoSizeLimit / (1024 * 1024)} MB`,
  });

// SCORM Package Schema (ZIP file)
export const SCORM_SCHEMA = z
  .instanceof(File)
  .refine(
    (file) =>
      [
        "application/zip",
        "application/x-zip-compressed",
      ].includes(file.type),
    { message: "SCORM package harus berupa file ZIP" }
  )
  .refine((file) => file.size <= scormSizeLimit, {
    message: `Ukuran SCORM package harus kurang dari ${scormSizeLimit / (1024 * 1024)} MB`,
  });

// Optional schemas (untuk form yang field-nya optional)
export const DOCUMENT_SCHEMA_OPTIONAL = DOCUMENT_SCHEMA.optional();
export const IMAGE_SCHEMA_OPTIONAL = IMAGE_SCHEMA.optional();
export const VIDEO_SCHEMA_OPTIONAL = VIDEO_SCHEMA.optional();
export const SCORM_SCHEMA_OPTIONAL = SCORM_SCHEMA.optional();
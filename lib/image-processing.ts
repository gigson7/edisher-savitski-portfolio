import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

const GALLERY_DIR = path.join(process.cwd(), "public", "images", "gallery");
const SIZES = [
  { suffix: "thumbnail", width: 300 },
  { suffix: "medium", width: 600 },
  { suffix: "large", width: 1200 },
  { suffix: "xlarge", width: 1800 },
];

export async function processAndSavePhoto(
  buffer: Buffer,
  originalName: string
): Promise<string> {
  const baseName = originalName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim();
  const timestamp = Date.now();
  const filename = `${baseName}-${timestamp}`;

  await fs.mkdir(GALLERY_DIR, { recursive: true });

  for (const size of SIZES) {
    const outputPath = path.join(
      GALLERY_DIR,
      `${filename}-${size.suffix}.webp`
    );
    await sharp(buffer)
      .resize(size.width, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);
  }

  return filename;
}

export async function deletePhotoFiles(filename: string): Promise<void> {
  for (const size of SIZES) {
    const filePath = path.join(
      GALLERY_DIR,
      `${filename}-${size.suffix}.webp`
    );
    try {
      await fs.unlink(filePath);
    } catch {
      /* file may not exist */
    }
  }
}

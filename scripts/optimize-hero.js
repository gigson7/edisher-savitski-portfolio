const sharp = require("sharp");
const path = require("path");

async function optimizeHero() {
  const input = path.join(__dirname, "../public/images/hero/hero-main.jpg");
  const outputDir = path.join(__dirname, "../public/images/hero");

  console.log("Optimizing hero image...");

  try {
    // Create optimized hero image (1920px width)
    await sharp(input)
      .resize(1920, null, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .webp({ quality: 90 })
      .toFile(path.join(outputDir, "hero-main.webp"));

    // Create blur placeholder
    const buffer = await sharp(input)
      .resize(20)
      .webp({ quality: 20 })
      .toBuffer();

    const base64 = `data:image/webp;base64,${buffer.toString("base64")}`;
    console.log("Blur data URL:", base64);

    console.log("✓ Hero image optimized");
  } catch (error) {
    console.error("Error:", error);
  }
}

optimizeHero();

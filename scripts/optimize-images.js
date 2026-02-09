const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Image sizes to generate
const sizes = [
  { name: "thumbnail", width: 400 },
  { name: "medium", width: 800 },
  { name: "large", width: 1200 },
  { name: "xlarge", width: 1920 },
];

async function optimizeImages() {
  const sourceDir = path.join(__dirname, "../../images");
  const outputDir = path.join(__dirname, "../public/images/gallery");

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get all image files
  const files = fs
    .readdirSync(sourceDir)
    .filter((f) => f.endsWith(".jpg") || f.endsWith(".JPG") || f.endsWith(".jpeg"));

  console.log(`Found ${files.length} images to optimize`);

  for (const file of files) {
    const baseName = path.parse(file).name;
    console.log(`Processing ${file}...`);

    try {
      // Generate different sizes
      for (const size of sizes) {
        // WebP version
        await sharp(path.join(sourceDir, file))
          .resize(size.width, null, {
            withoutEnlargement: true,
            fit: "inside",
          })
          .webp({ quality: 85 })
          .toFile(path.join(outputDir, `${baseName}-${size.name}.webp`));

        // JPEG fallback
        await sharp(path.join(sourceDir, file))
          .resize(size.width, null, {
            withoutEnlargement: true,
            fit: "inside",
          })
          .jpeg({ quality: 85 })
          .toFile(path.join(outputDir, `${baseName}-${size.name}.jpg`));
      }

      // Generate blur placeholder (tiny 20px width)
      const buffer = await sharp(path.join(sourceDir, file))
        .resize(20)
        .webp({ quality: 20 })
        .toBuffer();

      const base64 = `data:image/webp;base64,${buffer.toString("base64")}`;

      // Save blur data URL for use in components
      fs.writeFileSync(
        path.join(outputDir, `${baseName}-blur.txt`),
        base64
      );

      console.log(`✓ Optimized ${file}`);
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
    }
  }

  console.log("\nOptimization complete!");
  console.log(`Output directory: ${outputDir}`);
}

// Run the script
optimizeImages().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

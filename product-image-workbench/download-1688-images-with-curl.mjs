import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const workbenchDir = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(workbenchDir, "1688-source");
const imageDir = join(sourceDir, "images");
const offerFile = join(sourceDir, "offer-data.json");
const onlySku = process.env.ONLY_SKU !== "0";

mkdirSync(imageDir, { recursive: true });

const offer = JSON.parse(readFileSync(offerFile, "utf8"));
const skuUrls = new Set((offer.skuImages || []).map((item) => item.imageUrl));
const images = onlySku ? offer.images.filter((item) => skuUrls.has(item.url)) : offer.images;

for (const image of images) {
  const output = join(sourceDir, image.localFile);
  try {
    execFileSync("curl", [
      "--max-time", "30",
      "-L",
      "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
      "-o", output,
      image.url,
    ], { stdio: "ignore" });
    delete image.downloadError;
    console.log(`Wrote ${image.localFile}`);
  } catch (error) {
    image.downloadError = error.message;
    console.log(`Failed ${image.localFile}`);
  }
}

writeFileSync(offerFile, `${JSON.stringify(offer, null, 2)}\n`, "utf8");
console.log(`Downloaded ${images.length} image(s). onlySku=${onlySku}`);

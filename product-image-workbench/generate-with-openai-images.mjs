import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const workbenchDir = dirname(fileURLToPath(import.meta.url));
const promptFile = join(workbenchDir, "generated/prompts.json");
const outputDir = join(workbenchDir, "outputs");

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.IMAGE_MODEL || "gpt-image-1";
const size = process.env.IMAGE_SIZE || "1024x1024";
const limit = process.env.IMAGE_LIMIT ? Number(process.env.IMAGE_LIMIT) : null;
const ids = process.env.IMAGE_IDS
  ? new Set(process.env.IMAGE_IDS.split(",").map((item) => item.trim()).filter(Boolean))
  : null;

if (!apiKey) {
  console.error("Missing OPENAI_API_KEY. Example:");
  console.error("OPENAI_API_KEY=你的key IMAGE_LIMIT=2 node product-image-workbench/generate-with-openai-images.mjs");
  process.exit(1);
}

if (!existsSync(promptFile)) {
  console.error("Missing generated/prompts.json. Run:");
  console.error("node product-image-workbench/generate-image-prompts.mjs");
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

let jobs = JSON.parse(readFileSync(promptFile, "utf8"));
if (ids) jobs = jobs.filter((job) => ids.has(job.id));
if (limit) jobs = jobs.slice(0, limit);

async function generate(job) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: job.prompt,
      size,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${job.id} failed: ${response.status} ${text}`);
  }

  const result = await response.json();
  const image = result.data?.[0];
  if (!image?.b64_json) {
    throw new Error(`${job.id} failed: response did not include b64_json`);
  }

  const output = join(workbenchDir, job.outputFile);
  writeFileSync(output, Buffer.from(image.b64_json, "base64"));
  return output;
}

for (const job of jobs) {
  console.log(`Generating ${job.id} - ${job.name}`);
  const output = await generate(job);
  console.log(`Wrote ${output}`);
}

console.log(`Done. Generated ${jobs.length} image(s).`);

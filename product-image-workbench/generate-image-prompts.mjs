import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const workbenchDir = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(workbenchDir);
const sourceFile = join(rootDir, "src/data/spiritual-products.ts");
const styleFile = join(workbenchDir, "image-style.config.json");
const generatedDir = join(workbenchDir, "generated");
const productOutFile = join(workbenchDir, "products.catalog.json");
const promptJsonFile = join(generatedDir, "prompts.json");
const promptMdFile = join(generatedDir, "prompts.md");

function pickString(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*"([^"]*)"`));
  return match?.[1] || "";
}

function pickNumber(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*(\\d+)`));
  return match ? Number(match[1]) : null;
}

function pickStringArray(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`));
  if (!match) return [];
  return Array.from(match[1].matchAll(/"([^"]+)"/g)).map((item) => item[1]);
}

function pickSkuOptions(block) {
  const match = block.match(/skuOptions:\s*\[([\s\S]*?)\],\n\s*(consultPrompt|})/);
  if (!match) return [];
  return Array.from(match[1].matchAll(/\{\s*name:\s*"([^"]+)",\s*price:\s*(\d+)\s*\}/g)).map((item) => ({
    name: item[1],
    price: Number(item[2]),
  }));
}

function productBlocks(input) {
  const start = input.indexOf("const baseSpiritualProducts");
  const end = input.indexOf("];", start);
  if (start < 0 || end < 0) return [];
  const body = input.slice(start, end);
  const blocks = [];
  let depth = 0;
  let begin = -1;
  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    if (char === "{") {
      if (depth === 0) begin = index;
      depth += 1;
    }
    if (char === "}") {
      depth -= 1;
      if (depth === 0 && begin >= 0) {
        blocks.push(body.slice(begin, index + 1));
        begin = -1;
      }
    }
  }
  return blocks.filter((block) => block.includes("id:"));
}

function materialVisualHint(materials) {
  return materials.map((material) => {
    if (material.includes("朱砂") || material.includes("南红") || material.includes("玛瑙") || material.includes("石榴石")) {
      return `${material}呈温润红色或酒红色，表面有天然石纹`;
    }
    if (material.includes("黑曜") || material.includes("黑玛瑙")) return `${material}呈深黑色镜面质感，有小高光`;
    if (material.includes("青金")) return `${material}呈深蓝色，带少量金色矿点`;
    if (material.includes("粉晶")) return `${material}呈淡粉半通透水晶质感`;
    if (material.includes("黄水晶") || material.includes("虎眼")) return `${material}呈金黄或棕金猫眼纹理`;
    if (material.includes("紫水晶")) return `${material}呈淡紫到深紫半通透晶体`;
    if (material.includes("白水晶") || material.includes("白玉") || material.includes("玉髓")) return `${material}呈白色或半透明乳白质感`;
    if (material.includes("菩提") || material.includes("莲花") || material.includes("星月")) return `${material}呈天然菩提纹理，有不规则点状或沟壑纹`;
    if (material.includes("檀") || material.includes("木")) return `${material}呈木质纹理，哑光温润`;
    return `${material}需要有清楚材质差异`;
  });
}

function buildPrompt(product, style) {
  const rules = style.qualityRules.join(" ");
  const negative = style.negativePrompt.join("，");
  const materialHints = materialVisualHint(product.materials).join("；");
  const colors = product.palette.join("、");
  return [
    style.promptTemplate.opening,
    `商品：${product.name}。`,
    `类型：${product.form}。`,
    `材料：${product.materials.join("、")}。`,
    `材质表现：${materialHints}。`,
    `主色参考：${colors}。`,
    style.promptTemplate.layout,
    style.promptTemplate.lighting,
    rules,
    style.promptTemplate.ending,
    `避免：${negative}。`,
  ].join("\n");
}

function buildNegativePrompt(style) {
  return style.negativePrompt.join(", ");
}

mkdirSync(generatedDir, { recursive: true });

const source = readFileSync(sourceFile, "utf8");
const style = JSON.parse(readFileSync(styleFile, "utf8"));

const products = productBlocks(source).map((block) => ({
  id: pickString(block, "id"),
  tradition: pickString(block, "tradition"),
  category: pickString(block, "category"),
  name: pickString(block, "name"),
  source: pickString(block, "source"),
  form: pickString(block, "form"),
  price: pickNumber(block, "price"),
  originalPrice: pickNumber(block, "originalPrice"),
  intention: pickStringArray(block, "intention"),
  materials: pickStringArray(block, "materials"),
  summary: pickString(block, "summary"),
  care: pickString(block, "care"),
  palette: pickStringArray(block, "palette"),
  sellingPoints: pickStringArray(block, "sellingPoints"),
  skuOptions: pickSkuOptions(block),
  consultPrompt: pickString(block, "consultPrompt"),
})).filter((item) => item.id);

const prompts = products.map((product) => ({
  id: product.id,
  name: product.name,
  outputFile: `outputs/${product.id}.png`,
  prompt: buildPrompt(product, style),
  negativePrompt: buildNegativePrompt(style),
  product,
}));

const md = [
  "# 商品图提示词清单",
  "",
  `共 ${prompts.length} 个商品。`,
  "",
  ...prompts.flatMap((item, index) => [
    `## ${index + 1}. ${item.name}`,
    "",
    `- id: \`${item.id}\``,
    `- output: \`${item.outputFile}\``,
    "",
    "```text",
    item.prompt,
    "```",
    "",
  ]),
].join("\n");

writeFileSync(productOutFile, `${JSON.stringify(products, null, 2)}\n`, "utf8");
writeFileSync(promptJsonFile, `${JSON.stringify(prompts, null, 2)}\n`, "utf8");
writeFileSync(promptMdFile, md, "utf8");

console.log(`Products: ${products.length}`);
console.log(`Wrote ${productOutFile}`);
console.log(`Wrote ${promptJsonFile}`);
console.log(`Wrote ${promptMdFile}`);

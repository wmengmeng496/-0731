import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const workbenchDir = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(workbenchDir, "1688-source");
const offerFile = join(sourceDir, "offer-data.json");
const outputFile = join(workbenchDir, "1688-catalog-draft.json");

function slugify(value) {
  return value
    .replace(/[（）()]/g, " ")
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function inferPalette(name) {
  if (name.includes("粉")) return ["#d8a9b7", "#f5d9dd", "#c8c0b4"];
  if (name.includes("灰")) return ["#8d9095", "#d6d0c5", "#c8c0b4"];
  if (name.includes("黑")) return ["#1f1f22", "#121212", "#c8c0b4"];
  if (name.includes("墨绿")) return ["#2f4f3c", "#0f2c1e", "#d8b48a"];
  if (name.includes("青花") || name.includes("蓝")) return ["#f6eee0", "#1d5c9f", "#c8c0b4"];
  if (name.includes("黄")) return ["#d8a84c", "#f0d58c", "#c8c0b4"];
  if (name.includes("乳白") || name.includes("白")) return ["#f6eee0", "#e7dfcf", "#d8b48a"];
  if (name.includes("马卡龙") || name.includes("多色")) return ["#d8a9b7", "#d7ebd0", "#f0d58c", "#8d9095"];
  return ["#d8a9b7", "#8d9095", "#f6eee0", "#c8c0b4"];
}

function inferIntentions(name) {
  const values = ["颜值", "转运", "平安"];
  if (name.includes("黑")) values.push("护身");
  if (name.includes("青花") || name.includes("蓝")) values.push("智慧");
  if (name.includes("粉")) values.push("桃花");
  if (name.includes("黄") || name.includes("金")) values.push("求财");
  return Array.from(new Set(values));
}

function inferMaterials(name) {
  const materials = [];
  if (name.includes("粉瓷")) materials.push("粉瓷珠");
  if (name.includes("灰瓷")) materials.push("灰瓷珠");
  if (name.includes("黑瓷")) materials.push("黑瓷珠");
  if (name.includes("乳白") || name.includes("白色")) materials.push("乳白瓷珠");
  if (name.includes("青花瓷")) materials.push("青花瓷珠");
  if (name.includes("墨绿")) materials.push("墨绿瓷珠");
  if (name.includes("黄色")) materials.push("黄色瓷珠");
  if (name.includes("古银")) materials.push("古银配件");
  if (name.includes("金色")) materials.push("金色配件");
  if (name.includes("转经筒")) materials.push("转经筒配件");
  if (name.includes("佛头")) materials.push("佛头配件");
  if (!materials.length) materials.push("珠光瓷珠", "金属配件");
  return materials;
}

const offer = JSON.parse(readFileSync(offerFile, "utf8"));
mkdirSync(sourceDir, { recursive: true });

const products = offer.skuImages
  .filter((sku) => !sku.name.includes("不含手串") && !sku.name.includes("盒"))
  .map((sku, index) => {
    const name = `寺庙同款${sku.name}手串`;
    const id = `1688-${slugify(sku.name) || index}`;
    const image = offer.images.find((item) => item.url === sku.imageUrl);
    return {
      id,
      tradition: "eastern",
      category: "temple",
      name,
      source: "1688:义乌市天义电子商务有限公司",
      sourceOfferId: offer.offerId,
      sourceSkuName: sku.name,
      sourceImageUrl: sku.imageUrl,
      localImage: image?.localFile || "",
      form: `${sku.name} + 宫廷风配件`,
      supplyPrice: Number(offer.price.display || offer.price.min || 0),
      suggestedPrice: 69,
      intention: inferIntentions(sku.name),
      materials: inferMaterials(sku.name),
      summary: "寺庙同款宫廷风瓷珠手串，适合做低门槛引流款、颜值款和来图定制款。",
      care: "瓷珠避免摔碰和硬物摩擦；金属配件用软布擦拭，日常保持干燥。",
      palette: inferPalette(sku.name),
      sellingPoints: ["供应价低，适合做引流款", "颜色 SKU 丰富，方便按命盘/星座推荐", "宫廷风视觉明确，适合手机端商品图展示"],
      skuOptions: [
        { name: "基础现货款", price: 69 },
        { name: "净化包装款", price: 99 },
        { name: "开光礼盒款", price: 168 }
      ],
      consultPrompt: `我想咨询${name}，想看实拍、手围和是否可做开光礼盒。`
    };
  });

writeFileSync(outputFile, `${JSON.stringify({ sourceOffer: offer, products }, null, 2)}\n`, "utf8");
console.log(`Draft products: ${products.length}`);
console.log(`Wrote ${outputFile}`);

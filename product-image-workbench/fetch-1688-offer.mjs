import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const workbenchDir = dirname(fileURLToPath(import.meta.url));
const defaultUrl = "https://detail.1688.com/offer/897348993194.html?forcePC=1";
const offerUrl = process.argv[2] || process.env.OFFER_URL || defaultUrl;
const outDir = join(workbenchDir, "1688-source");
const imageDir = join(outDir, "images");
const savedOfferHtml = join(outDir, "offer-page.html");

const headers = {
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
  referer: "https://www.1688.com/",
};

function uniq(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeImageUrl(url) {
  if (!url) return "";
  let value = url.trim().replace(/\\\//g, "/");
  if (value.startsWith("//")) value = `https:${value}`;
  if (value.startsWith("http://")) value = value.replace("http://", "https://");
  value = value.replace(/_(sum|b|big|small|webp)\.(jpg|jpeg|png|webp)$/i, ".$2");
  value = value.replace(/_\.(webp|jpg|jpeg|png)$/i, ".$1");
  return value;
}

function safeName(value) {
  return value
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

function readJsonObjectAfter(input, marker) {
  const start = input.indexOf(marker);
  if (start < 0) return null;
  const braceStart = input.indexOf("{", start);
  if (braceStart < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = braceStart; index < input.length; index += 1) {
    const char = input[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }
    if (char === "\"") inString = true;
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return input.slice(braceStart, index + 1);
    }
  }
  return null;
}

async function fetchText(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return await res.text();
}

async function downloadImage(url, fileName) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const output = join(imageDir, fileName);
  writeFileSync(output, bytes);
  return output;
}

function collectImageUrlsFromHtml(html) {
  const urls = Array.from(html.matchAll(/https?:\\?\/\\?\/[^"'\\\s<>]+?\.(?:jpg|jpeg|png|webp)/gi)).map((item) => normalizeImageUrl(item[0]));
  const protocolRelative = Array.from(html.matchAll(/\/\/[^"'\\\s<>]+?\.(?:jpg|jpeg|png|webp)/gi)).map((item) => normalizeImageUrl(item[0]));
  return uniq([...urls, ...protocolRelative]).filter((url) => /alicdn|cbu01|itemcdn|alicdn/.test(url));
}

function extractModel(html) {
  const wrappedMarker = ")(window.contextPath,";
  let contextJson = null;
  const wrappedIndex = html.indexOf(wrappedMarker);
  if (wrappedIndex >= 0) {
    contextJson = readJsonObjectAfter(html, wrappedMarker);
  }
  if (!contextJson) {
    contextJson = readJsonObjectAfter(html, "window.context=");
  }
  if (!contextJson) return null;
  try {
    return JSON.parse(contextJson);
  } catch {
    try {
      return Function(`return (${contextJson});`)();
    } catch (error) {
      if (process.env.DEBUG_PARSE === "1") {
        console.error(error.message);
      }
      return null;
    }
  }
}

function extractOffer(model) {
  const data = model?.result?.data || {};
  const globalData = model?.result?.global?.globalData || {};
  const rootData = data?.Root?.fields?.dataJson || {};
  const offerDetail = globalData?.model?.offerDetail || {};
  const offer = rootData?.offerBaseInfo || globalData?.model?.offerBaseInfo || {};
  const trade = globalData?.model?.tradeModel || {};
  const seller = globalData?.model?.sellerModel || {};
  const skuProps = rootData?.skuModel?.skuProps || offerDetail?.skuProps || globalData?.model?.skuProps || [];
  const gallery = data?.gallery?.fields || {};
  const description = data?.description?.fields || {};
  const skuImages = skuProps.flatMap((prop) => (prop.value || []).map((item) => ({
    name: item.name,
    imageUrl: normalizeImageUrl(item.imageUrl),
  }))).filter((item) => item.imageUrl);

  return {
    offerUrl,
    offerId: offer.offerId || offerDetail.offerId || gallery.offerId || globalData?.offerId || null,
    title: offer.subject || offerDetail.subject || gallery.subject || "",
    seller: {
      companyName: seller.companyName || "",
      loginId: seller.loginId || "",
      shopUrl: seller.winportUrl || seller.sellerWinportUrlMap?.defaultUrl || "",
      offerlistUrl: seller.sellerWinportUrlMap?.offerlistUrl || "",
    },
    price: {
      min: trade.minPrice || trade.offerPriceModel?.currentPrices?.[0]?.price || "",
      max: trade.maxPrice || "",
      display: trade.priceDisplay || "",
      unit: trade.unit || "",
      beginAmount: trade.beginAmount || null,
    },
    skuImages,
    skuOptions: (trade.skuMap || []).map((item) => ({
      skuId: item.skuId,
      name: item.specAttrs,
      stock: item.canBookCount,
      saleCount: item.saleCount,
    })),
    galleryImages: uniq([...(gallery.mainImage || []), ...(gallery.offerImgList || [])].map(normalizeImageUrl)),
    detailUrl: description.detailUrl || "",
    rawCategory: {
      topCategoryId: offer.topCategoryId || null,
      secondCategoryId: offer.secondCategoryId || null,
      leafCategoryId: description.leafCategoryId || null,
    },
  };
}

function imageExtension(url) {
  const match = url.match(/\.(jpg|jpeg|png|webp)(?:$|\?)/i);
  return match ? match[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

mkdirSync(imageDir, { recursive: true });

let html = "";
if (process.env.FROM_SAVED_HTML === "1" && existsSync(savedOfferHtml)) {
  html = readFileSync(savedOfferHtml, "utf8");
} else {
  html = await fetchText(offerUrl);
  writeFileSync(savedOfferHtml, html, "utf8");
}

const model = extractModel(html);
const offer = extractOffer(model);

let detailHtml = "";
if (offer.detailUrl) {
  try {
    detailHtml = await fetchText(offer.detailUrl);
    writeFileSync(join(outDir, "detail-description.html"), detailHtml, "utf8");
  } catch (error) {
    offer.detailFetchError = String(error.message || error);
  }
}

const htmlImages = collectImageUrlsFromHtml(html);
const detailImages = detailHtml ? collectImageUrlsFromHtml(detailHtml) : [];
const images = uniq([
  ...offer.galleryImages,
  ...offer.skuImages.map((item) => item.imageUrl),
  ...htmlImages,
  ...detailImages,
]);

offer.images = images.map((url, index) => ({
  index,
  url,
  localFile: `images/${String(index + 1).padStart(3, "0")}.${imageExtension(url)}`,
}));

writeFileSync(join(outDir, "offer-data.json"), `${JSON.stringify(offer, null, 2)}\n`, "utf8");

for (const image of offer.images) {
  try {
    await downloadImage(image.url, image.localFile.replace("images/", ""));
  } catch (error) {
    image.downloadError = String(error.message || error);
  }
}

writeFileSync(join(outDir, "offer-data.json"), `${JSON.stringify(offer, null, 2)}\n`, "utf8");

console.log(`Title: ${offer.title}`);
console.log(`Seller: ${offer.seller.companyName || offer.seller.loginId}`);
console.log(`SKU images: ${offer.skuImages.length}`);
console.log(`All image urls: ${offer.images.length}`);
console.log(`Output: ${outDir}`);

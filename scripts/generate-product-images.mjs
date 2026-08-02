import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataFile = join(root, "src/data/spiritual-products.ts");
const outDir = join(root, "public/images/products");

const source = readFileSync(dataFile, "utf8");

function pickString(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*"([^"]+)"`));
  return match?.[1] || "";
}

function pickNumber(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*(\\d+)`));
  return match?.[1] || "";
}

function pickArray(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`));
  if (!match) return [];
  return Array.from(match[1].matchAll(/"([^"]+)"/g)).map((item) => item[1]);
}

function productBlocks(input) {
  const start = input.indexOf("export const spiritualProducts");
  const end = input.indexOf("];", start);
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

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function textLines(value, maxLength = 8) {
  const chunks = [];
  for (let index = 0; index < value.length; index += maxLength) {
    chunks.push(value.slice(index, index + maxLength));
  }
  return chunks;
}

function beadTexture(id, color, index) {
  const dark = index % 2 === 0 ? "rgba(80,35,15,.24)" : "rgba(255,255,255,.18)";
  const marks = Array.from({ length: 7 }, (_, mark) => {
    const x = 22 + ((mark * 17 + index * 13) % 56);
    const y = 24 + ((mark * 23 + index * 11) % 52);
    return `<ellipse cx="${x}" cy="${y}" rx="${2 + (mark % 3)}" ry="1.7" fill="${dark}" transform="rotate(${mark * 31} ${x} ${y})" opacity=".55"/>`;
  }).join("");
  return `
    <radialGradient id="g-${id}-${index}" cx="34%" cy="28%" r="70%">
      <stop offset="0" stop-color="#fff7e7" stop-opacity=".78"/>
      <stop offset=".2" stop-color="${color}" stop-opacity=".96"/>
      <stop offset="1" stop-color="${color}"/>
    </radialGradient>
    <filter id="shadow-${id}-${index}" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#6d3d12" flood-opacity=".26"/>
    </filter>
    <g id="texture-${id}-${index}">${marks}</g>
  `;
}

function makeSvg(product) {
  const width = 1160;
  const centerX = 580;
  const centerY = 520;
  const radiusX = 300;
  const radiusY = 330;
  const beadCount = Math.max(18, product.materials.length * 3);
  const materials = product.materials.length ? product.materials : product.form.split("+").map((item) => item.trim());
  const sizes = [13, 12, 10, 10, 9, 11, 10, 9, 8, 10, 12, 10];
  const beads = Array.from({ length: beadCount }, (_, index) => {
    const angle = -Math.PI / 2 + (index / beadCount) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radiusX;
    const y = centerY + Math.sin(angle) * radiusY;
    const size = 34 + ((index + product.id.length) % 5) * 4;
    const color = product.palette[index % product.palette.length];
    return `
      <g transform="translate(${x - size}, ${y - size})" filter="url(#shadow-${product.id}-${index % product.palette.length})">
        <circle cx="${size}" cy="${size}" r="${size}" fill="url(#g-${product.id}-${index % product.palette.length})" stroke="#7d521e" stroke-opacity=".14" stroke-width="2"/>
        <use href="#texture-${product.id}-${index % product.palette.length}" transform="translate(${size - 50} ${size - 50}) scale(${size / 50})"/>
        <circle cx="${size - size * 0.28}" cy="${size - size * 0.32}" r="${Math.max(5, size * 0.15)}" fill="#fff8e8" opacity=".45"/>
      </g>
    `;
  }).join("");

  const labels = materials.slice(0, 10).map((material, index) => {
    const angle = -Math.PI / 2 + (index / Math.max(materials.length, 10)) * Math.PI * 2;
    const side = Math.cos(angle) >= 0 ? 1 : -1;
    const x = centerX + Math.cos(angle) * 435;
    const y = centerY + Math.sin(angle) * 405;
    const anchor = side > 0 ? "start" : "end";
    const dotX = x - side * 18;
    const label = escapeXml(material);
    const size = sizes[index % sizes.length];
    return `
      <g>
        <circle cx="${dotX}" cy="${y - 7}" r="5" fill="#9b2d1f"/>
        <text x="${x}" y="${y - 15}" fill="#9b2d1f" font-size="31" font-weight="700" text-anchor="${anchor}" font-family="'Songti SC','Noto Serif CJK SC',serif">${label}</text>
        <text x="${x}" y="${y + 24}" fill="#23180f" font-size="27" text-anchor="${anchor}" font-family="Georgia,'Times New Roman',serif">${size}mm</text>
      </g>
    `;
  }).join("");

  const titleLines = textLines(product.name, 9).map((line, index) => (
    `<text x="580" y="${94 + index * 45}" fill="#8a2a1d" font-size="38" font-weight="700" text-anchor="middle" font-family="'Songti SC','Noto Serif CJK SC',serif">${escapeXml(line)}</text>`
  )).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 ${width} ${width}">
  <defs>
    <radialGradient id="paper" cx="50%" cy="38%" r="76%">
      <stop offset="0" stop-color="#f7dfaa"/>
      <stop offset="1" stop-color="#efd09a"/>
    </radialGradient>
    <filter id="paperNoise">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 .055"/>
      </feComponentTransfer>
    </filter>
    ${product.palette.map((color, index) => beadTexture(product.id, color, index)).join("")}
  </defs>
  <rect width="1160" height="1160" rx="10" fill="url(#paper)"/>
  <rect width="1160" height="1160" rx="10" filter="url(#paperNoise)" opacity=".45"/>
  <text x="58" y="70" fill="#a57a3f" font-size="23" letter-spacing="7" font-family="Arial, sans-serif">${escapeXml(product.source)}</text>
  ${titleLines}
  <text x="580" y="188" fill="#7b5632" font-size="24" text-anchor="middle" font-family="'Songti SC','Noto Serif CJK SC',serif">${escapeXml(product.form)}</text>
  <circle cx="580" cy="520" r="216" fill="#f8e2b1" opacity=".56"/>
  <circle cx="580" cy="520" r="218" fill="none" stroke="#d3a25e" stroke-opacity=".22" stroke-width="4"/>
  ${beads}
  <path d="M528 862 C540 914 620 914 632 862" fill="#c59242" opacity=".88"/>
  <rect x="536" y="820" width="88" height="92" rx="34" fill="#c69242"/>
  <path d="M556 904 C540 980 544 1040 514 1094" fill="none" stroke="#5b3722" stroke-width="8" stroke-linecap="round"/>
  <path d="M604 904 C622 980 618 1040 648 1094" fill="none" stroke="#5b3722" stroke-width="8" stroke-linecap="round"/>
  <circle cx="508" cy="1102" r="26" fill="#f6eee0" stroke="#6d4a29" stroke-width="2"/>
  <circle cx="655" cy="1102" r="26" fill="${product.palette[1] || product.palette[0]}" stroke="#6d4a29" stroke-width="2"/>
  ${labels}
  <g transform="translate(760 1010)">
    <text fill="#9b2d1f" font-size="29" font-weight="700" font-family="'Songti SC','Noto Serif CJK SC',serif">参考价</text>
    <circle cx="104" cy="-8" r="5" fill="#9b2d1f"/>
    <text x="126" y="0" fill="#211711" font-size="33" font-family="Georgia,'Times New Roman',serif">¥${product.price}</text>
  </g>
</svg>`;
}

mkdirSync(outDir, { recursive: true });

const products = productBlocks(source).map((block) => ({
  id: pickString(block, "id"),
  name: pickString(block, "name"),
  source: pickString(block, "source"),
  form: pickString(block, "form"),
  price: pickNumber(block, "price"),
  materials: pickArray(block, "materials"),
  palette: pickArray(block, "palette"),
})).filter((item) => item.id);

for (const product of products) {
  writeFileSync(join(outDir, `${product.id}.svg`), makeSvg(product), "utf8");
}

console.log(`Generated ${products.length} product images in ${outDir}`);

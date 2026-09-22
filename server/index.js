import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";

loadEnvFile(path.join(process.cwd(), ".env"));

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "127.0.0.1";
const previewHtml = path.join(process.cwd(), "web-preview", "index.html");
const aiConfigDir = path.join(process.cwd(), "server", "ai-config");
const modelPresets = loadJsonFile(path.join(aiConfigDir, "models.json"), {});
const promptPresets = loadJsonFile(path.join(aiConfigDir, "prompts.json"), {});
const workflowPresets = loadJsonFile(path.join(aiConfigDir, "workflows.json"), {});
const selectedModelKey = process.env.AI_MODEL_KEY || "default";
const selectedModel = modelPresets[selectedModelKey] || modelPresets.default || {};
const aiConfig = {
  modelKey: selectedModelKey,
  provider: process.env.AI_PROVIDER || selectedModel.provider || "openai-compatible",
  apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "",
  baseUrl: (process.env.AI_BASE_URL || selectedModel.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
  model: process.env.AI_MODEL || selectedModel.model || "gpt-4o-mini",
  timeoutMs: Number(process.env.AI_TIMEOUT_MS || 18000),
  temperature: Number(process.env.AI_TEMPERATURE || selectedModel.temperature || 0.72),
  jsonMode: process.env.AI_JSON_MODE ? process.env.AI_JSON_MODE !== "off" : selectedModel.jsonMode !== false
};
const json = (res, data, status = 200) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data));
};

const html = (res, filePath) => {
  fs.readFile(filePath, "utf8", (error, content) => {
    if (error) return json(res, { message: "Preview page not found" }, 404);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(content);
  });
};

const MAX_BODY_BYTES = 64 * 1024;
const MAX_USER_INPUT_LENGTH = 100;

const readBody = (req) => new Promise((resolve, reject) => {
  let raw = "";
  let size = 0;
  req.on("data", (chunk) => {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      reject(new Error("Request body too large"));
      req.destroy();
      return;
    }
    raw += chunk;
  });
  req.on("end", () => {
    if (!raw) return resolve({});
    try {
      const body = JSON.parse(raw);
      const input = body.question || body.userInput || body.prompt;
      if (typeof input === "string" && input.length > MAX_USER_INPUT_LENGTH) {
        return reject(new Error(`User input must be ${MAX_USER_INPUT_LENGTH} characters or fewer`));
      }
      resolve(body);
    } catch {
      reject(new Error("Invalid JSON request body"));
    }
  });
  req.on("error", reject);
});

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) return;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  });
}

function loadJsonFile(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.warn(`[config] ${path.basename(filePath)} fallback: ${error.message}`);
    return fallback;
  }
}

function aiStatus() {
  return {
    enabled: Boolean(aiConfig.apiKey),
    provider: aiConfig.provider,
    modelKey: aiConfig.modelKey,
    baseUrl: aiConfig.apiKey ? aiConfig.baseUrl : "",
    model: aiConfig.apiKey ? aiConfig.model : "local-template",
    availableModelKeys: Object.keys(modelPresets),
    promptKeys: Object.keys(promptPresets),
    workflowKeys: Object.keys(workflowPresets)
  };
}

function getPromptPreset(promptKey) {
  return workflowPresets[promptKey]?.prompt || promptPresets[promptKey];
}

function buildPromptMessages(promptKey, payload) {
  const preset = getPromptPreset(promptKey);
  if (!preset) throw new Error(`Prompt preset not found: ${promptKey}`);
  return [
    { role: "system", content: preset.system },
    {
      role: "user",
      content: JSON.stringify({
        task: preset.task,
        outputShape: preset.outputShape,
        ...payload
      })
    }
  ];
}

async function callAiJson(promptKey, payload, fallback = null) {
  if (!aiConfig.apiKey) return fallback;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), aiConfig.timeoutMs);
  try {
    const messages = buildPromptMessages(promptKey, payload);
    const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiConfig.apiKey}`
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages,
        temperature: aiConfig.temperature,
        ...(aiConfig.jsonMode ? { response_format: { type: "json_object" } } : {})
      }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`AI ${response.status}`);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonText = content.match(/\{[\s\S]*\}/)?.[0] || content;
    return JSON.parse(jsonText);
  } catch (error) {
    console.warn(`[ai:${promptKey}] fallback: ${error.message}`);
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const elementMap = { 甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水", 子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火", 午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水" };

function pillarFromDate(date, time = "12:00") {
  const [year, month, day] = date.split("-").map(Number);
  const [hour] = time.split(":").map(Number);
  const yearP = `${stems[(year - 4) % 10]}${branches[(year - 4) % 12]}`;
  const monthP = `${stems[(month + year) % 10]}${branches[(month + 1) % 12]}`;
  const diff = Math.floor((new Date(year, month - 1, day) - new Date(1900, 0, 31)) / 86400000);
  const dayP = `${stems[(diff + 10) % 10]}${branches[(diff + 12) % 12]}`;
  const hourBranch = Math.floor((hour + 1) / 2) % 12;
  const hourP = `${stems[(stems.indexOf(dayP[0]) * 2 + hourBranch) % 10]}${branches[hourBranch]}`;
  return [yearP, monthP, dayP, hourP];
}

function personalBaziBase(body) {
  const values = pillarFromDate(body.birthDate, body.birthTime);
  const labels = ["年柱", "月柱", "日柱", "时柱"];
  const pillars = values.map((value, index) => ({ label: labels[index], value, element: `${elementMap[value[0]]}${elementMap[value[1]]}` }));
  const elements = pillars.map((item) => item.element[0]);
  const keyElement = elements.sort((a, b) => elements.filter((x) => x === b).length - elements.filter((x) => x === a).length)[0];
  const remedy = shopRecommend({
    birthDate: dateStrFromBody(body),
    birthTime: body.birthTime,
    zodiac: "白羊座",
    intention: "平安守护"
  });
  return {
    pillars,
    remedy: {
      title: remedy.title,
      summary: remedy.summary,
      beads: remedy.beads,
      product: remedy.product
    },
    sections: [
      { title: "性格特质", content: `命盘以${keyElement}气为主，做事有自己的节奏。你适合在稳定结构中发挥直觉，越到关键节点越能显出判断力。` },
      { title: "事业运势", content: `月柱为事业提纲，显示你适合从事需要专业沉淀、审美判断或资源整合的方向。近期宜先稳住核心能力，再扩大合作。` },
      { title: "财运分析", content: `时柱代表后劲，财运更偏长期积累型。建议减少情绪性消费，把收入分成储蓄、学习、流动资金三部分。` },
      { title: "感情婚姻", content: `日柱为亲密关系核心，你在关系里需要安全感与被理解。清晰表达边界，比反复试探更容易带来稳定缘分。` }
    ]
  };
}

async function personalBazi(body) {
  const base = personalBaziBase(body);
  const ai = await callAiJson("baziPersonal", {
    userInput: body,
    computed: { pillars: base.pillars }
  });
  if (!ai?.sections?.length) return { ...base, ai: { ...aiStatus(), used: false } };
  const remedy = shopRecommend({
    birthDate: dateStrFromBody(body),
    birthTime: body.birthTime,
    zodiac: body.zodiac || "白羊座",
    intention: ai.intention || "平安守护"
  });
  return {
    ...base,
    overview: ai.overview || "",
    sections: ai.sections.slice(0, 4),
    remedy: {
      title: remedy.title,
      summary: remedy.summary,
      beads: remedy.beads,
      product: remedy.product
    },
    ai: { ...aiStatus(), used: true }
  };
}

function dateStrFromBody(body) {
  return body.birthDate || "1994-06-12";
}

function matchBaziBase(body) {
  const p1 = pillarFromDate(body.p1Date, body.p1Time);
  const p2 = pillarFromDate(body.p2Date, body.p2Time);
  const same = p1.filter((item, index) => item[1] === p2[index][1]).length;
  const score = Math.min(98, 68 + same * 7 + (elementMap[p1[2][0]] !== elementMap[p2[2][0]] ? 9 : 4));
  const level = score >= 90 ? "金玉良缘" : score >= 82 ? "天作之合" : score >= 74 ? "琴瑟和鸣" : "磨合成长";
  return {
    score,
    level,
    summary: `双方日柱分别为${p1[2]}与${p2[2]}，一个提供关系的稳定感，一个带来推进关系的行动力。`,
    details: [
      { title: "情绪节奏", content: "相处中最重要的是把情绪说在当下，不把旧账滚成新问题。" },
      { title: "生活默契", content: "共同制定生活秩序会明显提升安全感，尤其适合一起规划财务和旅行。" },
      { title: "缘分建议", content: "遇到分歧时先谈需求，再谈对错，这段关系会更容易进入长期稳定状态。" }
    ]
  };
}

async function matchBazi(body) {
  const base = matchBaziBase(body);
  const ai = await callAiJson("baziMatch", {
    userInput: body,
    computed: base
  });
  if (!ai?.details?.length) return { ...base, ai: { ...aiStatus(), used: false } };
  return {
    ...base,
    summary: ai.summary || base.summary,
    details: ai.details.slice(0, 3),
    ai: { ...aiStatus(), used: true }
  };
}

const tarotDeck = [
  ["愚者", "The Fool", ["新开始", "冒险", "纯真"]],
  ["魔术师", "The Magician", ["创造力", "意志力", "显化"]],
  ["女祭司", "The High Priestess", ["直觉", "神秘", "内在智慧"]],
  ["皇后", "The Empress", ["丰饶", "滋养", "创造力"]],
  ["皇帝", "The Emperor", ["秩序", "承诺", "掌控"]],
  ["恋人", "The Lovers", ["爱情", "选择", "和谐"]],
  ["战车", "The Chariot", ["决心", "胜利", "前进"]],
  ["星星", "The Star", ["希望", "疗愈", "灵感"]],
  ["月亮", "The Moon", ["潜意识", "迷雾", "不安"]],
  ["太阳", "The Sun", ["成功", "喜悦", "活力"]]
];

function drawTarotBase(body) {
  const labels = body.spread === "single" ? ["指引"] : body.spread === "love" ? ["现状", "对方", "阻碍", "建议"] : ["过去", "现在", "未来"];
  const picked = [...tarotDeck].sort(() => Math.random() - 0.5).slice(0, labels.length);
  return {
    overview: body.question ? `围绕「${body.question}」，牌面提醒你先看清当下的真实动机，再决定下一步。` : "这组牌更像一盏灯，提醒你把注意力放回当下最重要的选择。",
    cards: picked.map(([name, en, keywords], index) => ({
      name,
      en,
      keywords,
      position: labels[index],
      reading: `${name}落在「${labels[index]}」位置，代表${keywords.join("、")}正在影响局面。建议你减少外界噪音，用更明确的行动回应内心答案。`
    }))
  };
}

async function drawTarot(body) {
  const base = drawTarotBase(body);
  const ai = await callAiJson("tarotDraw", {
    userInput: body,
    computed: base
  });
  if (!ai?.cards?.length) return { ...base, ai: { ...aiStatus(), used: false } };
  return {
    ...base,
    overview: ai.overview || base.overview,
    cards: base.cards.map((card, index) => ({ ...card, reading: ai.cards[index]?.reading || card.reading })),
    ai: { ...aiStatus(), used: true }
  };
}

function tarotChatFallback(body) {
  const result = body.result || {};
  const cards = result.cards || [];
  const firstCard = cards[0];
  const focus = firstCard ? `从「${firstCard.name}」看，${firstCard.keywords?.join("、") || "当前牌面"}仍是这次追问的核心线索。` : "这次追问更适合先回到你原本的问题和当下感受。";
  return {
    reply: `${focus}围绕「${body.message || "这个追问"}」，建议你把注意力放在可确认的事实和下一步行动上，不急着把牌面当成定论。`,
    suggestions: ["下一步怎么做", "对方真实状态", "需要避开什么"],
    ai: { ...aiStatus(), used: false }
  };
}

async function tarotChat(body) {
  const fallback = tarotChatFallback(body);
  const ai = await callAiJson("tarotChat", {
    userInput: {
      message: body.message || "",
      question: body.question || "",
      spread: body.spread || "",
      history: (body.history || []).slice(-6)
    },
    computed: body.result || {}
  });
  if (!ai?.reply) return fallback;
  return {
    reply: ai.reply,
    suggestions: Array.isArray(ai.suggestions) && ai.suggestions.length ? ai.suggestions.slice(0, 3) : fallback.suggestions,
    ai: { ...aiStatus(), used: true }
  };
}

function moonBlocksFallback(body) {
  const result = body.result || {};
  const question = String(body.question || "这件事").trim();
  const name = result.name || "圣杯";
  const verdict = result.verdict || "此事可行";
  const fallbackByKey = {
    sheng: {
      tone: `围绕「${question}」，三轮皆为圣杯，气象偏顺，可把这件事视为适合推进的信号。`,
      detail: "连续三圣代表回应较一致，但仍不等于现实一定成功。若这是关系问题，适合主动释放清晰而轻的信号；若是事业或选择题，可以先启动一个可回撤的小步骤。",
      advice: "顺势推进，但先从低风险动作开始。",
      keywords: ["三圣杯", "可推进", "小步行"]
    },
    xiao: {
      tone: `围绕「${question}」，三轮未能连续成圣，说明答案还没完全定下来，事情里仍有变数。`,
      detail: "没有出现明显阻断，但也没有形成连续三圣的稳定回应。此刻更适合先观察、补信息、把问题拆得更细，避免因为一时情绪就把事情推到不可回头。",
      advice: "把问题拆小，先确认一个关键事实。",
      keywords: ["未连续", "再确认", "看时机"]
    },
    yin: {
      tone: `围绕「${question}」，三轮中出现阴杯，当前路径阻力较重，不适合硬推。`,
      detail: "阴杯出现代表条件未足、时机未到，或你忽略了某个风险点。这不等于事情永远不成，而是提醒你先停一下，补齐信息、调整策略，再看后续变化。",
      advice: "暂缓推进，先排除最大风险。",
      keywords: ["有阻力", "先暂缓", "避风险"]
    }
  };
  return {
    name,
    verdict,
    ...(fallbackByKey[result.key] || fallbackByKey.sheng),
    ai: { ...aiStatus(), used: false }
  };
}

async function moonBlocksReading(body) {
  const fallback = moonBlocksFallback(body);
  const ai = await callAiJson("moonBlocksReading", {
    userInput: {
      question: String(body.question || "").trim()
    },
    computed: {
      result: body.result || {},
      faces: body.faces || body.result?.faces || [],
      rounds: body.rounds || body.result?.rounds || []
    }
  });
  if (!ai?.tone || !ai?.detail || !ai?.advice) return fallback;
  return {
    ...fallback,
    tone: ai.tone,
    detail: ai.detail,
    advice: ai.advice,
    keywords: Array.isArray(ai.keywords) ? ai.keywords.slice(0, 3) : fallback.keywords,
    ai: { ...aiStatus(), used: true }
  };
}

const signs = [
  ["白羊座", "Aries", "3.21-4.19", "火", "♈"], ["金牛座", "Taurus", "4.20-5.20", "土", "♉"],
  ["双子座", "Gemini", "5.21-6.21", "风", "♊"], ["巨蟹座", "Cancer", "6.22-7.22", "水", "♋"],
  ["狮子座", "Leo", "7.23-8.22", "火", "♌"], ["处女座", "Virgo", "8.23-9.22", "土", "♍"],
  ["天秤座", "Libra", "9.23-10.23", "风", "♎"], ["天蝎座", "Scorpio", "10.24-11.22", "水", "♏"],
  ["射手座", "Sagittarius", "11.23-12.21", "火", "♐"], ["摩羯座", "Capricorn", "12.22-1.19", "土", "♑"],
  ["水瓶座", "Aquarius", "1.20-2.18", "风", "♒"], ["双鱼座", "Pisces", "2.19-3.20", "水", "♓"]
].map(([name, en, date, element, icon]) => ({ name, en, date, element, icon }));

const mbtiQuestions = [
  ["参加社交聚会时，你通常：", "更愿意主动交流，带动气氛", "更愿意观察环境，慢慢进入状态"],
  ["面对新想法，你首先关注：", "它能否落地执行", "它背后的可能性与隐喻"],
  ["做决定时，你更依赖：", "逻辑分析和客观事实", "感受、关系与价值判断"],
  ["安排旅行时，你倾向于：", "提前规划好路线", "保留弹性，边走边看"],
  ["团队讨论中，你更像：", "先说出方案的人", "先听完再补充的人"],
  ["学习新技能时，你喜欢：", "先掌握步骤和范例", "先理解原理和框架"],
  ["面对冲突，你更重视：", "问题本身是否合理", "双方情绪是否被照顾"],
  ["临近截止日期，你通常：", "提前完成，留出缓冲", "压力来了效率更高"]
].map(([text, positive, negative], index) => ({ id: index + 1, text, positive, negative }));

const mbtiTypes = {
  INTJ: ["建筑师", "分析家", "富有战略感，习惯用长期视角规划人生。", ["战略思维", "独立自主", "洞察力强"], "练习把想法说得更柔软，会让你的影响力更稳定。"],
  INFP: ["调停者", "外交家", "理想主义且真诚，重视内心价值与精神共鸣。", ["共情力", "创造力", "真诚"], "把灵感拆成可执行的小任务，梦想会更容易落地。"],
  ENFP: ["竞选者", "外交家", "热情自由，擅长连接人和可能性。", ["感染力", "想象力", "适应力"], "给热情配一个节奏表，能避免半途能量耗散。"],
  ISTJ: ["物流师", "守护者", "务实可靠，重视秩序、承诺与稳定输出。", ["责任感", "细节力", "执行力"], "偶尔允许计划被更新，变化不一定意味着失控。"],
  ESFJ: ["执政官", "守护者", "温暖负责，擅长照顾关系和组织日常。", ["亲和力", "组织力", "可靠"], "照顾别人之前，也把自己的需要放进日程。"],
  ENTP: ["辩论家", "分析家", "好奇、机敏，喜欢用新角度拆解问题。", ["创意", "表达力", "应变力"], "选择一个最值得的方向深挖，锋芒会更有重量。"]
};

function mbtiResult(body) {
  const answers = body.answers || [];
  const code = answers.filter(Boolean).length >= 5 ? "ENFP" : answers[0] ? "ENTP" : answers[3] ? "ISTJ" : "INFP";
  const [nickname, category, desc, strengths, advice] = mbtiTypes[code];
  return { code, nickname, category, desc, strengths, advice };
}

const magicTabs = {
  white: [
    { key: "purify", title: "净化守护", rituals: [{ name: "白盐净化仪式", level: "入门", duration: "15分钟", timing: "新月前后", materials: ["海盐", "白蜡烛", "清水"], steps: ["点燃白蜡烛，保持三次深呼吸。", "将海盐放入清水，顺时针搅拌。", "从门口开始轻洒四角，观想空间变清澈。"], tips: "适合每月固定做一次，作为空间整理后的能量收尾。" }] },
    { key: "moon", title: "月相仪式", rituals: [{ name: "新月意图设定", level: "入门", duration: "30分钟", timing: "新月当天", materials: ["深色蜡烛", "日记本", "月桂叶"], steps: ["写下本月最重要的三个意图。", "读出意图后点燃月桂叶。", "记录接下来28天的信号与行动。"], tips: "意图越具体，行动越容易发生。" }] }
  ],
  black: [
    { key: "banish", title: "驱散断绝", rituals: [{ name: "黑蜡烛断舍离", level: "入门", duration: "30分钟", timing: "下弦月", materials: ["黑蜡烛", "纸笔", "棉线"], steps: ["写下想放下的关系模式或旧习惯。", "用线缠绕纸张，再郑重剪断。", "把纸收好或安全销毁，象征旧事结束。"], tips: "重点是划清边界，不是伤害任何人。" }] },
    { key: "shadow", title: "影子修行", rituals: [{ name: "镜子对话", level: "进阶", duration: "20分钟", timing: "夜间独处", materials: ["镜子", "日记本", "一支蜡烛"], steps: ["凝视镜中自己，记录浮现的评价。", "逐条回应：我看见你，但我不被你定义。", "写下一个明天能做的小改变。"], tips: "若情绪过强，请暂停并优先寻求现实支持。" }] }
  ]
};

const crystalProducts = [
  {
    id: "yhg-001",
    templeId: "yonghe",
    name: "雍和宫香灰平安串",
    subtitle: "香灰琉璃主珠，搭配朱砂隔珠，主打平安护身与日常佩戴",
    form: "香灰手串",
    prayerTypes: ["平安", "护身", "事业"],
    basePrice: 238,
    supplyPrice: 18,
    stock: 32,
    tags: ["雍和宫", "香灰串", "平安护身", "可选开光"],
    materials: ["香灰琉璃珠", "朱砂隔珠", "黑曜护身珠"],
    sellingPoints: ["香灰珠主题明确", "适合做平安入门款", "可叠加开光/加持服务"],
    skuOptions: [
      { name: "基础无雕款", price: 238 },
      { name: "平安护身款", price: 268 },
      { name: "事业稳定款", price: 298 }
    ],
    palette: ["#b8aa8f", "#8f1d1d", "#171717", "#d8a84c"]
  },
  {
    id: "yhg-007",
    templeId: "yonghe",
    name: "雍和宫珠光瓷珠宫廷手串",
    subtitle: "参考图款：粉瓷、灰瓷、黑瓷搭配古银配件，可微量来图定制，主打颜值、转运、平安",
    form: "珠光瓷珠手串",
    prayerTypes: ["平安", "转运", "颜值", "事业"],
    basePrice: 129,
    supplyPrice: 8.9,
    stock: 40,
    tags: ["雍和宫", "珠光瓷珠", "宫廷寺庙同款", "来图定制", "可选开光"],
    materials: ["粉瓷珠", "灰瓷珠", "黑瓷珠", "古银莲花配件", "流苏/编绳"],
    sellingPoints: ["视觉强，适合小红书/短视频出图", "粉瓷、灰瓷、黑瓷可做多 SKU", "12mm/14mm 可区分手围和客单", "支持颜色微调和来图定制"],
    skuOptions: [
      { name: "粉瓷 · 古银款", price: 129 },
      { name: "灰瓷 · 古银款", price: 129 },
      { name: "黑瓷 · 古银款", price: 129 },
      { name: "黑瓷 · 12mm 14颗", price: 159 },
      { name: "黑瓷 · 14mm 13颗", price: 169 }
    ],
    palette: ["#d8a9b7", "#8d9095", "#1f1f22", "#c8c0b4", "#d8a84c"]
  },
  {
    id: "lys-002",
    templeId: "lingyin",
    name: "灵隐寺十八籽多宝菩提手串",
    subtitle: "参考图款：天意金刚、红金刚、星月、莲花菩提等十八籽结构，主打清心、平安、修持",
    form: "十八籽 / 多宝菩提手串",
    prayerTypes: ["平安", "健康", "清心", "修持"],
    basePrice: 69,
    supplyPrice: 4.5,
    stock: 18,
    tags: ["灵隐寺", "十八籽", "多宝菩提", "清心平安", "可选开光"],
    materials: ["天意金刚菩提", "红金刚菩提", "星月菩提", "莲花菩提", "黑曜/玛瑙/木珠隔配"],
    sellingPoints: ["十八籽结构认知强", "低门槛基础款适合引流", "可做无雕/灵隐/普陀/弘法等 SKU", "可升级礼盒、开光和手围定制"],
    skuOptions: [
      { name: "一代天意金刚 · 无雕款", price: 69 },
      { name: "一代天意金刚 · 灵隐款", price: 79 },
      { name: "一代天意金刚 · 普陀款", price: 79 },
      { name: "一代天意金刚 · 弘法款", price: 79 },
      { name: "一代天意红金刚 · 无雕款", price: 89 }
    ],
    palette: ["#c58b3d", "#eee5d3", "#171717", "#b8aa8f", "#9d2f2f", "#86a8b8", "#4b2d18"]
  },
  {
    id: "lys-006",
    templeId: "lingyin",
    name: "灵隐寺有钱花莲花手串",
    subtitle: "参考图款：有钱花莲花主珠，绿檀/水草玛瑙搭配，主打求财、招财、转运",
    form: "有钱花莲花手串",
    prayerTypes: ["求财", "财运", "转运", "事业"],
    basePrice: 99,
    supplyPrice: 7.51,
    stock: 36,
    tags: ["灵隐寺", "有钱花", "莲花手串", "求财转运", "可选开光"],
    materials: ["有钱花莲花主珠", "天然绿檀", "水草玛瑙", "莲花玛瑙", "编绳/手链/指扣链"],
    sellingPoints: ["名字即卖点：有钱花，求财记忆点强", "莲花造型比普通圆珠更容易出图", "绿檀款低价走量，水草玛瑙款做升级", "可拆手串、手链、指扣链多规格"],
    skuOptions: [
      { name: "有钱花莲花手串 · 天然绿檀款", price: 99 },
      { name: "有钱花莲花手串 · 水草玛瑙款", price: 129 },
      { name: "有钱花莲花手链 · 天然绿檀款", price: 139 },
      { name: "有钱花莲花指扣链 · 天然绿檀款", price: 109 }
    ],
    palette: ["#8a9a57", "#f0d58c", "#e8b58e", "#d7ebd0", "#6d7b3f"]
  },
  {
    id: "hls-003",
    templeId: "hongluo",
    name: "红螺寺观音姻缘手串",
    subtitle: "观音牌配粉晶、红玛瑙，主打姻缘、关系稳定与家庭和合",
    form: "观音手串",
    prayerTypes: ["姻缘", "感情", "和合"],
    basePrice: 328,
    supplyPrice: 42,
    stock: 24,
    tags: ["红螺寺", "观音手串", "姻缘和合", "可选开光"],
    materials: ["观音牌", "粉晶", "南红玛瑙", "和合隔珠"],
    sellingPoints: ["红螺寺姻缘认知强", "观音牌比普通水晶更有主题", "适合做姻缘/关系修复套餐"],
    skuOptions: [
      { name: "姻缘手串基础款", price: 328 },
      { name: "观音牌升级款", price: 398 }
    ],
    palette: ["#e6a9b5", "#9d2f2f", "#f1d7c9", "#d8b48a"]
  },
  {
    id: "hls-004",
    templeId: "hongluo",
    name: "红螺寺观音求子吊坠",
    subtitle: "观音吊坠单品，可搭配手串或项链，主打求子、安胎与家庭祈愿",
    form: "观音吊坠",
    prayerTypes: ["求子", "家庭", "姻缘"],
    basePrice: 368,
    supplyPrice: 58,
    stock: 16,
    tags: ["红螺寺", "观音吊坠", "求子祈愿", "可选开光"],
    materials: ["观音吊坠", "平安扣", "粉晶小配珠"],
    sellingPoints: ["求子场景明确", "吊坠单品客单更高", "可搭配手串或项链加购"],
    skuOptions: [
      { name: "观音吊坠单品", price: 368 },
      { name: "吊坠 + 手串组合", price: 498 }
    ],
    palette: ["#f4ead6", "#d8b48a", "#c86b7d"]
  },
  {
    id: "wts-005",
    templeId: "wutai",
    name: "五台山文殊智慧串",
    subtitle: "文殊主题配青金石、白水晶与檀木，主打学业、考试、事业判断",
    form: "文殊手串",
    prayerTypes: ["学业", "事业", "智慧"],
    basePrice: 298,
    supplyPrice: 36,
    stock: 22,
    tags: ["五台山", "文殊智慧", "学业事业", "可选开光"],
    materials: ["文殊牌", "青金石", "白水晶", "檀木隔珠"],
    sellingPoints: ["文殊主题直指学业考试", "适合学生/职场判断力场景", "可做考试季专题"],
    skuOptions: [
      { name: "文殊智慧基础款", price: 298 },
      { name: "考试加持礼盒款", price: 398 }
    ],
    palette: ["#1d3f78", "#f6eee0", "#4b2d18", "#c8c0b4"]
  },
  {
    id: "yhg-009",
    templeId: "yonghe",
    name: "雍和宫朱砂事业护身串",
    subtitle: "朱砂主珠搭配黑曜石和香灰隔珠，主打事业、护身、转运和稳定气场",
    form: "朱砂护身手串",
    prayerTypes: ["事业", "护身", "转运", "平安"],
    basePrice: 198,
    supplyPrice: 22,
    stock: 28,
    tags: ["雍和宫", "朱砂", "事业护身", "红黑配色", "可选开光"],
    materials: ["朱砂主珠", "黑曜石", "香灰琉璃珠", "古银隔片"],
    sellingPoints: ["红黑视觉强，适合短视频首图", "事业护身主题明确", "可做男女同款和礼盒款"],
    skuOptions: [
      { name: "基础护身款", price: 198 },
      { name: "事业加强款", price: 238 },
      { name: "礼盒开光款", price: 328 }
    ],
    palette: ["#9d2f2f", "#171717", "#b8aa8f", "#c8c0b4"]
  },
  {
    id: "lys-008",
    templeId: "lingyin",
    name: "黑曜石绿檀木情绪稳定双圈手串",
    subtitle: "黑曜石搭配天然绿檀木和金色隔珠，主打情绪稳定、清心、护身和睡眠",
    form: "黑曜石绿檀木双圈手串",
    prayerTypes: ["情绪稳定", "清心", "护身", "睡眠"],
    basePrice: 119,
    supplyPrice: 6.8,
    stock: 45,
    tags: ["官方正品", "黑曜石", "绿檀木", "情绪稳定", "双圈款"],
    materials: ["黑曜石", "天然绿檀木", "金色隔珠", "弹力绳"],
    sellingPoints: ["情绪稳定主题明确，适合问事后承接", "黑绿配色沉稳耐看", "双圈佩戴层次感强"],
    skuOptions: [
      { name: "基础双圈款", price: 119 },
      { name: "净化包装款", price: 149 },
      { name: "情绪稳定礼盒款", price: 199 }
    ],
    palette: ["#101010", "#6d7b3f", "#8a9a57", "#d8a84c"]
  },
  {
    id: "pts-001",
    templeId: "putuo",
    name: "普陀山莲花平安手串",
    subtitle: "莲花菩提、白玉髓和平安扣组合，主打平安、家庭守护、清心和健康",
    form: "莲花平安手串",
    prayerTypes: ["平安", "清心", "家庭", "健康"],
    basePrice: 168,
    supplyPrice: 19,
    stock: 30,
    tags: ["普陀山", "莲花", "平安扣", "家庭守护", "送礼"],
    materials: ["莲花菩提", "白玉髓", "平安扣", "檀木隔珠"],
    sellingPoints: ["平安送礼场景好", "视觉温润不挑人", "适合家人和长辈"],
    skuOptions: [
      { name: "基础平安款", price: 168 },
      { name: "莲花平安扣款", price: 198 },
      { name: "家庭守护礼盒", price: 268 }
    ],
    palette: ["#f4ead6", "#eee5d3", "#d7a264", "#4b2d18"]
  },
  {
    id: "hls-006",
    templeId: "hongluo",
    name: "红螺寺粉晶桃花手串",
    subtitle: "粉晶、南红玛瑙和和合隔珠组合，主打桃花、姻缘、关系破冰",
    form: "粉晶桃花手串",
    prayerTypes: ["桃花", "姻缘", "感情", "和合"],
    basePrice: 188,
    supplyPrice: 24,
    stock: 34,
    tags: ["红螺寺", "粉晶", "桃花", "姻缘", "女生礼物"],
    materials: ["粉晶", "南红玛瑙", "和合隔珠", "白水晶"],
    sellingPoints: ["桃花主题直观", "比观音姻缘款更轻量", "适合女生自购和送礼"],
    skuOptions: [
      { name: "桃花基础款", price: 188 },
      { name: "南红加强款", price: 238 },
      { name: "姻缘礼盒款", price: 298 }
    ],
    palette: ["#e6a9b5", "#f1d7c9", "#9d2f2f", "#f6eee0"]
  },
  {
    id: "wts-008",
    templeId: "wutai",
    name: "五台山青金石专注手串",
    subtitle: "青金石、白水晶和檀木隔珠组合，主打考试、面试、专注和事业判断",
    form: "青金石专注手串",
    prayerTypes: ["学业", "考试", "事业", "专注"],
    basePrice: 199,
    supplyPrice: 26,
    stock: 26,
    tags: ["五台山", "青金石", "专注", "考试季", "面试"],
    materials: ["青金石", "白水晶", "檀木隔珠", "古银配件"],
    sellingPoints: ["考试季好卖", "蓝白配色高级", "适合学生和职场判断场景"],
    skuOptions: [
      { name: "专注基础款", price: 199 },
      { name: "考试加持款", price: 259 },
      { name: "文殊牌升级款", price: 328 }
    ],
    palette: ["#1d3f78", "#f6eee0", "#4b2d18", "#c8c0b4"]
  },
  {
    id: "crystal-001",
    templeId: "crystal",
    name: "虎眼石决断力手串",
    subtitle: "虎眼石、黑曜石和黄水晶组合，主打事业、行动力、决断和求财",
    form: "虎眼石事业手串",
    prayerTypes: ["事业", "行动力", "决断", "求财"],
    basePrice: 139,
    supplyPrice: 18,
    stock: 38,
    tags: ["虎眼石", "事业", "行动力", "男款友好", "水晶"],
    materials: ["虎眼石", "黑曜石", "黄水晶", "金色隔珠"],
    sellingPoints: ["事业行动主题清晰", "男生接受度高", "可和求财款做套组"],
    skuOptions: [
      { name: "基础决断款", price: 139 },
      { name: "黄水晶加强款", price: 169 },
      { name: "事业礼盒款", price: 229 }
    ],
    palette: ["#9b6a2f", "#d8a84c", "#171717", "#f6eee0"]
  },
  {
    id: "crystal-002",
    templeId: "crystal",
    name: "石榴石气色能量手链",
    subtitle: "石榴石、白水晶和银色隔珠组合，主打颜值、气色、桃花和行动力",
    form: "石榴石能量手链",
    prayerTypes: ["颜值", "气色", "桃花", "行动力"],
    basePrice: 149,
    supplyPrice: 20,
    stock: 33,
    tags: ["石榴石", "气色", "颜值", "女生自购", "水晶"],
    materials: ["石榴石", "白水晶", "银色隔珠"],
    sellingPoints: ["颜值气色主题", "适合女生自购", "可和粉晶做套组"],
    skuOptions: [
      { name: "气色基础款", price: 149 },
      { name: "白水晶加强款", price: 179 },
      { name: "桃花气色套组", price: 239 }
    ],
    palette: ["#7c1f2b", "#b43a4c", "#f6eee0", "#c8c0b4"]
  }
];

const templeStyles = [
  { id: "yonghe", name: "雍和宫", consecrationPrice: 68, note: "商品核心是香灰串、珠光瓷珠宫廷款，适合平安、护身、转运、颜值定制。" },
  { id: "lingyin", name: "灵隐寺", consecrationPrice: 58, note: "商品核心是十八籽、有钱花莲花、菩提和清心修持类，适合平安、健康、清心、求财。" },
  { id: "hongluo", name: "红螺寺", consecrationPrice: 88, note: "商品核心是观音吊坠、观音手串，适合姻缘、求子、家庭和合。" },
  { id: "wutai", name: "五台山", consecrationPrice: 88, note: "商品核心是文殊智慧主题，适合学业、考试、事业判断。" },
  { id: "putuo", name: "普陀山", consecrationPrice: 78, note: "商品核心是莲花、平安扣、白玉髓和家庭守护，适合平安、清心、健康、送礼。" },
  { id: "crystal", name: "水晶能量", consecrationPrice: 0, note: "商品核心是西方水晶手串，不做寺庙开光，适合消磁、桃花、事业、颜值和日常佩戴。" }
];

const beadCatalog = [
  { id: "incense-ash", name: "香灰琉璃珠", direction: "主珠", element: "雍和宫系", size: "10mm", unitPrice: 16, color: "#b8aa8f", effect: "平安护身、日常守护" },
  { id: "pink-porcelain", name: "粉瓷珠", direction: "主珠", element: "雍和宫瓷珠", size: "10mm", unitPrice: 9, color: "#d8a9b7", effect: "颜值出图、柔和转运" },
  { id: "gray-porcelain", name: "灰瓷珠", direction: "主珠", element: "雍和宫瓷珠", size: "10mm", unitPrice: 9, color: "#8d9095", effect: "低调清冷、通勤佩戴" },
  { id: "black-porcelain", name: "黑瓷珠", direction: "主珠", element: "雍和宫瓷珠", size: "12mm/14mm", unitPrice: 12, color: "#1f1f22", effect: "稳重护身、适合大珠径" },
  { id: "ancient-silver", name: "古银莲花配件", direction: "配件", element: "宫廷寺庙款", size: "小号", unitPrice: 18, color: "#c8c0b4", effect: "提升寺庙同款识别度" },
  { id: "eighteen-seed", name: "十八籽菩提珠", direction: "主珠", element: "灵隐寺系", size: "9mm", unitPrice: 8, color: "#eee5d3", effect: "清心修持、平安健康" },
  { id: "tianyi-vajra", name: "天意金刚菩提", direction: "主珠", element: "灵隐十八籽", size: "10mm", unitPrice: 7, color: "#c58b3d", effect: "十八籽主珠、文玩感强" },
  { id: "red-vajra", name: "红金刚菩提", direction: "主珠", element: "灵隐十八籽", size: "10mm", unitPrice: 9, color: "#9d2f2f", effect: "十八籽红金刚款、视觉更醒目" },
  { id: "star-moon", name: "星月菩提", direction: "配珠", element: "灵隐十八籽", size: "8mm", unitPrice: 6, color: "#f2e5c9", effect: "经典菩提元素、清心修持" },
  { id: "lotus-bodhi", name: "莲花菩提", direction: "配珠", element: "灵隐十八籽", size: "8mm", unitPrice: 6, color: "#d7a264", effect: "莲花寓意清净、适合灵隐主题" },
  { id: "money-lotus", name: "有钱花莲花主珠", direction: "主珠", element: "灵隐求财", size: "12mm", unitPrice: 16, color: "#f0d58c", effect: "求财、招财、转运主题强" },
  { id: "green-sandalwood", name: "天然绿檀珠", direction: "配珠", element: "灵隐求财", size: "8mm", unitPrice: 5, color: "#8a9a57", effect: "绿檀低价走量、适合求财手串" },
  { id: "water-agate", name: "水草玛瑙", direction: "配珠", element: "灵隐求财", size: "8mm", unitPrice: 11, color: "#d7ebd0", effect: "水草纹理出图、适合升级款" },
  { id: "guanyin-charm", name: "观音吊坠配件", direction: "吊坠", element: "红螺寺系", size: "小号", unitPrice: 88, color: "#f4ead6", effect: "姻缘、求子、家庭和合" },
  { id: "wenshu-charm", name: "文殊牌配件", direction: "吊坠", element: "五台山系", size: "小号", unitPrice: 78, color: "#c8c0b4", effect: "学业、考试、事业判断" },
  { id: "nanhong", name: "南红玛瑙", direction: "配珠", element: "红色系", size: "8mm", unitPrice: 18, color: "#9d2f2f", effect: "姻缘热度、行动力、气色" },
  { id: "rose-quartz", name: "粉晶", direction: "配珠", element: "桃花系", size: "8mm", unitPrice: 15, color: "#e6a9b5", effect: "感情柔和、关系修复" },
  { id: "obsidian", name: "黑曜石", direction: "配珠", element: "护身系", size: "10mm", unitPrice: 12, color: "#171717", effect: "避扰、安神、出行平安" },
  { id: "lapis", name: "青金石", direction: "配珠", element: "智慧系", size: "6mm", unitPrice: 15, color: "#1d3f78", effect: "智慧、沟通、事业定力" },
  { id: "sandalwood", name: "檀木", direction: "隔珠", element: "沉香木系", size: "8mm", unitPrice: 8, color: "#4b2d18", effect: "沉稳、静心、收束杂念" },
  { id: "peace-buckle", name: "平安扣", direction: "吊坠", element: "平安系", size: "小号", unitPrice: 48, color: "#d8d5cf", effect: "平安、圆满、随身守护" }
  ,{ id: "cinnabar", name: "朱砂主珠", direction: "主珠", element: "红色护身系", size: "8mm/10mm", unitPrice: 14, color: "#9d2f2f", effect: "事业护身、稳定气场" }
  ,{ id: "white-chalcedony", name: "白玉髓", direction: "配珠", element: "平安温润系", size: "8mm", unitPrice: 13, color: "#f4ead6", effect: "平安、家庭守护、送礼" }
  ,{ id: "tiger-eye", name: "虎眼石", direction: "主珠", element: "事业行动系", size: "8mm/10mm", unitPrice: 12, color: "#9b6a2f", effect: "决断力、事业行动、谈判气场" }
  ,{ id: "citrine", name: "黄水晶", direction: "配珠", element: "求财显化系", size: "8mm", unitPrice: 14, color: "#d8a84c", effect: "行动力、求财、自信表达" }
  ,{ id: "garnet", name: "石榴石", direction: "主珠", element: "气色颜值系", size: "6mm/8mm", unitPrice: 13, color: "#7c1f2b", effect: "气色、颜值、桃花状态" }
];

const zodiacElementMap = signs.reduce((acc, sign) => ({ ...acc, [sign.name]: sign.element }), {});

function shopProducts() {
  return {
    products: crystalProducts,
    temples: templeStyles,
    beads: beadCatalog,
    prayerTypes: ["全部", "平安", "护身", "求财", "转运", "事业", "学业", "考试", "姻缘", "桃花", "求子", "健康", "清心", "睡眠", "家庭", "颜值", "行动力", "专注"]
  };
}

function shopRecommend(body) {
  const birthDate = body.birthDate || "1994-06-12";
  const values = pillarFromDate(birthDate, body.birthTime || "12:00");
  const presentElements = values.flatMap((pillar) => [elementMap[pillar[0]], elementMap[pillar[1]]]);
  const allElements = ["木", "火", "土", "金", "水"];
  const needElement = allElements
    .map((element) => ({ element, count: presentElements.filter((item) => item === element).length }))
    .sort((a, b) => a.count - b.count)[0].element;
  const zodiacElement = zodiacElementMap[body.zodiac] || "火";
  const intention = body.intention || "平安";
  const product = pickProductByIntention(intention, zodiacElement);
  const beads = pickBeadsForProduct(product, intention);
  return {
    title: `${intention}转化建议 · ${product.name}`,
    summary: `结合当前命盘短板、${body.zodiac || "星座"}的${zodiacElement}象倾向和你的所求，优先推荐「${product.form}」。也可以进入定制台，用同主题珠子和配件按颗数组合。`,
    pillars: values,
    needElement,
    zodiacElement,
    beads: beads.map((bead) => ({ ...bead, reason: `${bead.direction} · ${bead.element}，适合${bead.effect}。` })),
    talisman: `可选开光/不开光；开光订单进入发货前会标记为待加持，未开光订单按净化包装发货。`,
    product
  };
}

function pickProductByIntention(intention, zodiacElement) {
  if (intention.includes("求子") || intention.includes("备孕")) return crystalProducts.find((item) => item.id === "hls-004");
  if (intention.includes("求财") || intention.includes("财") || intention.includes("转运")) return crystalProducts.find((item) => item.id === "lys-006");
  if (intention.includes("行动力") || intention.includes("决断")) return crystalProducts.find((item) => item.id === "crystal-001");
  if (intention.includes("颜值") || intention.includes("定制") || intention.includes("瓷珠")) return crystalProducts.find((item) => item.id === "yhg-007");
  if (intention.includes("气色")) return crystalProducts.find((item) => item.id === "crystal-002");
  if (intention.includes("姻缘") || intention.includes("感情") || intention.includes("桃花")) return crystalProducts.find((item) => item.id === "hls-003");
  if (intention.includes("学业") || intention.includes("考试") || intention.includes("智慧") || intention.includes("专注")) return crystalProducts.find((item) => item.id === "wts-008");
  if (intention.includes("健康") || intention.includes("清心") || intention.includes("睡眠")) return crystalProducts.find((item) => item.id === "lys-008");
  if (intention.includes("家庭")) return crystalProducts.find((item) => item.id === "pts-001");
  if (intention.includes("事业") && zodiacElement === "风") return crystalProducts.find((item) => item.id === "wts-008");
  if (intention.includes("事业")) return crystalProducts.find((item) => item.id === "yhg-009");
  return crystalProducts.find((item) => item.id === "yhg-001");
}

function pickBeadsForProduct(product, intention) {
  const ids = {
    "yhg-001": ["incense-ash", "obsidian", "peace-buckle"],
    "yhg-007": ["pink-porcelain", "gray-porcelain", "black-porcelain", "ancient-silver"],
    "lys-002": ["tianyi-vajra", "eighteen-seed", "star-moon", "lotus-bodhi", "sandalwood"],
    "lys-006": ["money-lotus", "green-sandalwood", "water-agate", "sandalwood"],
    "hls-003": ["guanyin-charm", "rose-quartz", "nanhong"],
    "hls-004": ["guanyin-charm", "rose-quartz", "peace-buckle"],
    "wts-005": ["wenshu-charm", "lapis", "sandalwood"],
    "yhg-009": ["cinnabar", "obsidian", "incense-ash", "ancient-silver"],
    "lys-008": ["green-sandalwood", "star-moon", "lotus-bodhi", "sandalwood"],
    "pts-001": ["lotus-bodhi", "white-chalcedony", "peace-buckle", "sandalwood"],
    "hls-006": ["rose-quartz", "nanhong", "water-agate"],
    "wts-008": ["lapis", "white-chalcedony", "sandalwood"],
    "crystal-001": ["tiger-eye", "obsidian", "citrine"],
    "crystal-002": ["garnet", "rose-quartz", "white-chalcedony"]
  }[product.id] || ["incense-ash", "peace-buckle"];
  if (intention.includes("护身")) ids.push("obsidian");
  return ids.map((id) => beadCatalog.find((item) => item.id === id)).filter(Boolean);
}

function priceCustom(body) {
  const selected = body.selectedBeads || [];
  const beadLines = selected
    .map((line) => {
      const bead = beadCatalog.find((item) => item.id === line.id);
      if (!bead) return null;
      const count = Math.max(0, Number(line.count || 0));
      return { ...bead, count, subtotal: count * bead.unitPrice };
    })
    .filter(Boolean)
    .filter((line) => line.count > 0);
  const beadTotal = beadLines.reduce((sum, line) => sum + line.subtotal, 0);
  const temple = templeStyles.find((item) => item.id === body.templeId) || templeStyles[0];
  const wrist = body.wrist || "16cm";
  const serviceFee = 36;
  const stringFee = wrist === "18cm" ? 28 : wrist === "17cm" ? 18 : 12;
  const consecrationFee = body.consecrated ? temple.consecrationPrice : 0;
  const total = beadTotal + serviceFee + stringFee + consecrationFee;
  return {
    type: "custom",
    wrist,
    temple,
    consecrated: Boolean(body.consecrated),
    beadLines,
    fees: { beadTotal, serviceFee, stringFee, consecrationFee },
    total
  };
}

function orderDraft(body) {
  const product = crystalProducts.find((item) => item.id === body.productId);
  const custom = body.custom ? priceCustom(body.custom) : null;
  const temple = custom?.temple || templeStyles.find((item) => item.id === body.templeId) || templeStyles.find((item) => item.id === product?.templeId) || templeStyles[0];
  const consecrationFee = body.consecrated ? temple.consecrationPrice : 0;
  const payable = custom ? custom.total : (product?.basePrice || crystalProducts[0].basePrice) + consecrationFee;
  const shipping = body.shipping || { receiver: "待填写", phone: "待填写", address: "待填写" };
  const hasShipping = shipping.receiver && shipping.phone && shipping.address && shipping.receiver !== "待填写";
  return {
    orderNo: `ML${Date.now().toString().slice(-8)}`,
    status: hasShipping ? "待支付" : "待填写地址",
    product: product || null,
    custom,
    temple,
    consecrated: Boolean(body.consecrated || custom?.consecrated),
    shipping,
    payable,
    nextSteps: ["确认收货地址", "接入微信支付", "商家配珠/穿串", "净化封装", "发货"]
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return json(res, {});
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/preview")) return html(res, previewHtml);
    if (url.pathname === "/api/config/ai") return json(res, aiStatus());
    if (url.pathname === "/api/bazi/personal") return json(res, await personalBazi(await readBody(req)));
    if (url.pathname === "/api/bazi/match") return json(res, await matchBazi(await readBody(req)));
    if (url.pathname === "/api/tarot/draw") return json(res, await drawTarot(await readBody(req)));
    if (url.pathname === "/api/tarot/chat") return json(res, await tarotChat(await readBody(req)));
    if (url.pathname === "/api/moon-blocks/reading") return json(res, await moonBlocksReading(await readBody(req)));
    if (url.pathname === "/api/horoscope/signs") return json(res, { signs });
    if (url.pathname === "/api/horoscope/daily") {
      const sign = signs.find((item) => item.name === url.searchParams.get("sign")) || signs[0];
      const remedy = shopRecommend({ zodiac: sign.name, intention: "平安守护" });
      return json(res, { ...sign, fortunes: [{ label: "综合运势", value: 86, desc: "适合推进重要计划，也适合主动沟通。" }, { label: "爱情运势", value: 78, desc: "表达越真诚，关系越容易升温。" }, { label: "事业运势", value: 90, desc: "效率与灵感同步在线。" }, { label: "财富运势", value: 72, desc: "正财稳定，少做冲动消费。" }], lucky: [{ label: "幸运数字", value: "7" }, { label: "幸运颜色", value: "金色" }, { label: "幸运方位", value: "东南" }, { label: "速配星座", value: "天秤座" }], remedy: { title: remedy.title, summary: remedy.summary, beads: remedy.beads, product: remedy.product } });
    }
    if (url.pathname === "/api/mbti/questions") return json(res, { questions: mbtiQuestions });
    if (url.pathname === "/api/mbti/result") return json(res, mbtiResult(await readBody(req)));
    if (url.pathname === "/api/magic") return json(res, { tabs: magicTabs[url.searchParams.get("type") || "white"] });
    if (url.pathname === "/api/shop/products") return json(res, shopProducts());
    if (url.pathname === "/api/shop/recommend") return json(res, shopRecommend(await readBody(req)));
    if (url.pathname === "/api/shop/price") return json(res, priceCustom(await readBody(req)));
    if (url.pathname === "/api/shop/order-draft") return json(res, orderDraft(await readBody(req)));
    json(res, { message: "Not Found" }, 404);
  } catch (error) {
    const isClientError = /Request body|User input|Invalid JSON/.test(error.message);
    json(res, { message: error.message }, isClientError ? 400 : 500);
  }
});

server.listen(port, host, () => {
  console.log(`Mingyun Luopan preview: http://${host}:${port}/preview`);
  console.log(`Mingyun Luopan API listening on http://${host}:${port}`);
});

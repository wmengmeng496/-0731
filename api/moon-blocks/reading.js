const promptPreset = {
  system:
    "你是潮汕掷圣杯问事解读引擎。输出合法 JSON，不要 Markdown。当前产品采用三轮增强规则：每轮一阴一阳为圣杯，两阳为笑杯，两阴为阴杯；只有连续三轮都是圣杯，最终才算此事较可行；三轮中只要出现阴杯，最终偏暂缓；没有阴杯但未连续三圣，则偏时机未明。必须基于用户输入的问题、三轮杯型和最终结果生成个性化解读，语气像懂民俗的朋友，温和、克制、具体。不要宣称神明确定预言现实，不要做医疗、法律、投资承诺，不要劝用户做高风险行为。把掷杯解释为传统民俗娱乐和自我观察。",
  task: "根据用户问事内容、三轮掷杯记录和最终杯型生成个性化圣杯解读",
  outputShape: {
    tone: "70字以内，直接回应这个问题的当前气象",
    detail: "160字以内，结合杯型含义和用户问题做具体分析",
    advice: "60字以内，给一个可执行的下一步",
    keywords: ["3个短关键词，每个4字以内"],
  },
};

const modelPresets = {
  default: {
    provider: "toapis",
    baseUrl: "https://toapis.com/v1",
    model: "gpt-5.5",
    temperature: 0.72,
    jsonMode: false,
  },
  fast: {
    provider: "toapis",
    baseUrl: "https://toapis.com/v1",
    model: "deepseek-v3.2",
    temperature: 0.65,
    jsonMode: false,
  },
  deep: {
    provider: "toapis",
    baseUrl: "https://toapis.com/v1",
    model: "gpt-5.5",
    temperature: 0.78,
    jsonMode: false,
  },
  gemini: {
    provider: "toapis",
    baseUrl: "https://toapis.com/v1",
    model: "gemini-2.5-flash",
    temperature: 0.78,
    jsonMode: false,
  },
};

function aiConfig() {
  const selectedModelKey = process.env.AI_MODEL_KEY || "default";
  const selectedModel = modelPresets[selectedModelKey] || modelPresets.default;
  return {
    modelKey: selectedModelKey,
    provider: process.env.AI_PROVIDER || selectedModel.provider || "openai-compatible",
    apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "",
    baseUrl: (process.env.AI_BASE_URL || selectedModel.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
    model: process.env.AI_MODEL || selectedModel.model || "gpt-4o-mini",
    timeoutMs: Number(process.env.AI_TIMEOUT_MS || 18000),
    temperature: Number(process.env.AI_TEMPERATURE || selectedModel.temperature || 0.72),
    jsonMode: process.env.AI_JSON_MODE ? process.env.AI_JSON_MODE !== "off" : selectedModel.jsonMode !== false,
  };
}

function fallbackReading(body) {
  const result = body.result || {};
  const question = String(body.question || "这件事").trim();
  const fallbackByKey = {
    sheng: {
      tone: `围绕「${question}」，三轮皆为圣杯，气象偏顺，可把这件事视为适合推进的信号。`,
      detail:
        "连续三圣代表回应较一致，但仍不等于现实一定成功。若这是关系问题，适合主动释放清晰而轻的信号；若是事业或选择题，可以先启动一个可回撤的小步骤。",
      advice: "顺势推进，但先从低风险动作开始。",
      keywords: ["三圣杯", "可推进", "小步行"],
    },
    xiao: {
      tone: `围绕「${question}」，三轮未能连续成圣，说明答案还没完全定下来，事情里仍有变数。`,
      detail:
        "没有出现明显阻断，但也没有形成连续三圣的稳定回应。此刻更适合先观察、补信息、把问题拆得更细，避免因为一时情绪就把事情推到不可回头。",
      advice: "把问题拆小，先确认一个关键事实。",
      keywords: ["未连续", "再确认", "看时机"],
    },
    yin: {
      tone: `围绕「${question}」，三轮中出现阴杯，当前路径阻力较重，不适合硬推。`,
      detail:
        "阴杯出现代表条件未足、时机未到，或你忽略了某个风险点。这不等于事情永远不成，而是提醒你先停一下，补齐信息、调整策略，再看后续变化。",
      advice: "暂缓推进，先排除最大风险。",
      keywords: ["有阻力", "先暂缓", "避风险"],
    },
  };
  return {
    ...(fallbackByKey[result.key] || fallbackByKey.sheng),
    ai: {
      used: false,
      model: "local-template",
    },
  };
}

async function callAi(body, fallback) {
  const config = aiConfig();
  if (!config.apiKey) return fallback;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: promptPreset.system },
          {
            role: "user",
            content: JSON.stringify({
              task: promptPreset.task,
              outputShape: promptPreset.outputShape,
              userInput: {
                question: String(body.question || "").trim(),
              },
              computed: {
                result: body.result || {},
                faces: body.faces || body.result?.faces || [],
                rounds: body.rounds || body.result?.rounds || [],
              },
            }),
          },
        ],
        temperature: config.temperature,
        ...(config.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`AI ${response.status}`);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonText = content.match(/\{[\s\S]*\}/)?.[0] || content;
    const reading = JSON.parse(jsonText);
    if (!reading?.tone || !reading?.detail || !reading?.advice) return fallback;
    return {
      tone: reading.tone,
      detail: reading.detail,
      advice: reading.advice,
      keywords: Array.isArray(reading.keywords) ? reading.keywords.slice(0, 3) : fallback.keywords,
      ai: {
        used: true,
        model: config.model,
      },
    };
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).json({});
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  const body = req.body || {};
  const fallback = fallbackReading(body);
  const reading = await callAi(body, fallback);
  return res.status(200).json(reading);
}

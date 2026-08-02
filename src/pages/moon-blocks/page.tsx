import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { SpiritualRecommendation } from "../../components/SpiritualRecommendation";

type CupFace = "yin" | "yang";

type CupResult = {
  key: "sheng" | "xiao" | "yin";
  name: string;
  verdict: string;
  tone?: string;
  detail?: string;
  advice?: string;
  faces: [CupFace, CupFace];
  rounds?: CupRound[];
  keywords?: string[];
  ai?: {
    used: boolean;
    model?: string;
  };
};

type CupRound = {
  index: number;
  faces: [CupFace, CupFace];
  key: CupResult["key"];
  name: string;
  verdict: string;
};

type ReadingResponse = Pick<CupResult, "tone" | "detail" | "advice" | "keywords" | "ai">;

const results: CupResult[] = [
  {
    key: "sheng",
    name: "圣杯",
    verdict: "此事可行",
    faces: ["yin", "yang"],
  },
  {
    key: "xiao",
    name: "笑杯",
    verdict: "时机未明",
    faces: ["yang", "yang"],
  },
  {
    key: "yin",
    name: "阴杯",
    verdict: "暂不宜行",
    faces: ["yin", "yin"],
  },
];

const faceLabels: Record<CupFace, string> = {
  yin: "阴",
  yang: "阳",
};

const apiBase = (import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? "http://127.0.0.1:8787" : "")).replace(/\/$/, "");

function tossCupFaces(): [CupFace, CupFace] {
  return [Math.random() > 0.5 ? "yang" : "yin", Math.random() > 0.5 ? "yang" : "yin"];
}

function resultFromFaces(faces: [CupFace, CupFace]): CupResult {
  if (faces[0] !== faces[1]) return { ...results[0], faces };
  if (faces[0] === "yang") return { ...results[1], faces };
  return { ...results[2], faces };
}

function tossCupRounds(): CupRound[] {
  return Array.from({ length: 3 }, (_, index) => {
    const faces = tossCupFaces();
    const result = resultFromFaces(faces);
    return {
      index: index + 1,
      faces,
      key: result.key,
      name: result.name,
      verdict: result.verdict,
    };
  });
}

function resultFromRounds(rounds: CupRound[]): CupResult {
  const allSheng = rounds.every((round) => round.key === "sheng");
  const hasYin = rounds.some((round) => round.key === "yin");
  const final = allSheng ? results[0] : hasYin ? results[2] : results[1];
  return {
    ...final,
    name: allSheng ? "三圣杯" : final.name,
    verdict: allSheng ? "连续三圣，此事较可行" : final.verdict,
    faces: rounds[rounds.length - 1]?.faces || final.faces,
    rounds,
  };
}

function fallbackReading(result: CupResult, question: string): ReadingResponse {
  const fallbackByKey: Record<CupResult["key"], ReadingResponse> = {
    sheng: {
      tone: `围绕「${question}」，三轮皆为圣杯，气象偏顺，可把这件事视为适合推进的信号。`,
      detail: "连续三圣代表回应较一致，但仍不等于现实一定成功。若这是关系问题，适合主动释放清晰而轻的信号；若是事业或选择题，可以先启动一个可回撤的小步骤。",
      advice: "顺势推进，但先从低风险动作开始。",
      keywords: ["三圣杯", "可推进", "小步行"],
    },
    xiao: {
      tone: `围绕「${question}」，三轮未能连续成圣，说明答案还没完全定下来，事情里仍有变数。`,
      detail: "没有出现明显阻断，但也没有形成连续三圣的稳定回应。此刻更适合先观察、补信息、把问题拆得更细，避免因为一时情绪就把事情推到不可回头。",
      advice: "把问题拆小，先确认一个关键事实。",
      keywords: ["未连续", "再确认", "看时机"],
    },
    yin: {
      tone: `围绕「${question}」，三轮中出现阴杯，当前路径阻力较重，不适合硬推。`,
      detail: "阴杯出现代表条件未足、时机未到，或你忽略了某个风险点。这不等于事情永远不成，而是提醒你先停一下，补齐信息、调整策略，再看后续变化。",
      advice: "暂缓推进，先排除最大风险。",
      keywords: ["有阻力", "先暂缓", "避风险"],
    },
  };
  return fallbackByKey[result.key];
}

function MoonBlock({ face, index, isTossing }: { face: CupFace; index: number; isTossing: boolean }) {
  const isYang = face === "yang";

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div
        className={`moon-block ${isTossing ? "animate-cupToss" : "animate-cupSettle"} ${
          isYang ? "moon-block-yang" : "moon-block-yin"
        }`}
        style={{ animationDelay: `${index * 0.08}s` }}
      >
        <div className="moon-block-ridge" />
        <div className="moon-block-shine" />
        <span>{isYang ? "凸" : "平"}</span>
      </div>
      <div className="text-deep-500 text-xs tracking-[0.3em]">{faceLabels[face]}面</div>
    </div>
  );
}

export default function MoonBlocks() {
  const [question, setQuestion] = useState("");
  const [isTossing, setIsTossing] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [result, setResult] = useState<CupResult | null>(null);
  const [tossingFaces, setTossingFaces] = useState<[CupFace, CupFace]>(["yin", "yang"]);

  const canToss = question.trim().length > 0 && !isTossing && !isReading;

  const displayFaces = useMemo<[CupFace, CupFace]>(() => {
    if (isTossing) return tossingFaces;
    return result?.faces ?? ["yin", "yang"];
  }, [isTossing, result, tossingFaces]);

  const getReading = async (nextResult: CupResult, trimmed: string) => {
    setIsReading(true);
    try {
      const response = await fetch(`${apiBase}/api/moon-blocks/reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          result: nextResult,
          faces: nextResult.faces,
          rounds: nextResult.rounds || [],
        }),
      });
      if (!response.ok) throw new Error(`API ${response.status}`);
      const reading = await response.json() as ReadingResponse;
      setResult({ ...nextResult, ...reading });
    } catch (error) {
      setResult({
        ...nextResult,
        ...fallbackReading(nextResult, trimmed),
        ai: { used: false },
      });
    } finally {
      setIsReading(false);
    }
  };

  const toss = () => {
    const trimmed = question.trim();
    if (!trimmed || isTossing || isReading) return;

    setIsTossing(true);
    setResult(null);
    setTossingFaces(tossCupFaces());

    window.setTimeout(() => {
      const rounds = tossCupRounds();
      const settledResult = resultFromRounds(rounds);
      setResult(settledResult);
      setIsTossing(false);
      void getReading(settledResult, trimmed);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-deep-950 text-mystical-100 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, #e9b870 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-mystical-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-red-900/10 blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-deep-400 hover:text-mystical-300 transition-colors mb-8 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mystical-500/20 bg-mystical-500/5 text-mystical-300 text-xs tracking-widest mb-5">
            潮汕问事
          </div>
          <h1 className="font-display text-3xl md:text-5xl text-mystical-100 mb-3">掷圣杯</h1>
          <p className="text-deep-400 text-sm leading-relaxed">把想问的一件事写清楚，连续三轮皆为圣杯，才算此事较可行</p>
        </div>

        <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8 mb-8">
          <label className="block text-deep-300 text-sm mb-3">所问之事</label>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            disabled={isTossing}
            placeholder="例如：这个月适不适合主动联系对方？"
            className="w-full min-h-28 bg-deep-950 border border-deep-700 rounded-xl px-4 py-3 text-mystical-100 placeholder:text-deep-600 focus:border-mystical-500 focus:outline-none transition-colors resize-none"
            maxLength={80}
          />
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-deep-500 text-xs">一次只问一件事。系统会连掷三轮，只有三轮皆为圣杯才判定较可行。</p>
            <button
              onClick={toss}
              disabled={!canToss}
              className="bg-mystical-600 hover:bg-mystical-500 disabled:bg-deep-800 disabled:text-deep-500 text-white font-medium px-8 py-3 rounded-lg transition-all whitespace-nowrap"
            >
              {isTossing ? "三轮掷杯中..." : isReading ? "AI 解读中..." : "开始三轮掷杯"}
            </button>
          </div>
        </div>

        <div className="bg-deep-900/40 border border-deep-800 rounded-2xl p-6 md:p-8">
          <div className="relative mx-auto mb-6 flex min-h-60 max-w-xl items-center justify-center rounded-2xl border border-deep-800 bg-deep-950/50 overflow-hidden">
            <div className={`cup-shadow ${isTossing ? "animate-cupShadow" : ""}`} />
            <div className="relative z-10 flex items-center justify-center gap-8 md:gap-14">
              {displayFaces.map((face, index) => (
                <MoonBlock key={`${face}-${index}`} face={face} index={index} isTossing={isTossing} />
              ))}
            </div>
          </div>

          {!result && !isTossing && (
            <div className="text-center text-deep-500 text-sm">写下问题后，三轮杯象会在这里落定。</div>
          )}

          {isTossing && (
            <div className="text-center animate-fadeIn">
              <p className="font-display text-xl text-mystical-200 mb-2">三轮杯象正在落定</p>
              <p className="text-deep-400 text-sm">请在心里默念这件事，等三次回应归位。</p>
            </div>
          )}

          {result && !isTossing && (
            <div className="animate-fadeIn space-y-5">
              <div className="text-center">
                <p className="text-deep-500 text-xs tracking-[0.3em] mb-2">结果</p>
                <h2 className="font-display text-3xl md:text-4xl text-mystical-100 mb-2">{result.name}</h2>
                <p className="text-mystical-300 text-lg">{result.verdict}</p>
                {result.rounds?.length ? (
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {result.rounds.map((round) => (
                      <div key={round.index} className="rounded-xl border border-deep-800 bg-deep-950/45 px-3 py-2">
                        <p className="text-[11px] text-deep-500">第 {round.index} 轮</p>
                        <p className="font-display text-mystical-100">{round.name}</p>
                        <p className="mt-1 text-xs text-deep-400">{round.faces.map((face) => faceLabels[face]).join(" / ")}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {(result.keywords || []).map((keyword) => (
                    <span key={keyword} className="rounded-full border border-mystical-500/20 bg-mystical-500/10 px-3 py-1 text-xs text-mystical-300">
                      {keyword}
                    </span>
                  ))}
                  <span className="rounded-full border border-deep-700 bg-deep-950/50 px-3 py-1 text-xs text-deep-400">
                    {isReading ? "AI 解读中" : result.ai?.used ? "AI 解读" : "本地备用"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-deep-950/55 border border-deep-800 rounded-xl p-4 md:col-span-2">
                  <h3 className="font-display text-lg text-mystical-200 mb-2">杯意解读</h3>
                  {isReading ? (
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-deep-800" />
                      <div className="h-4 w-full animate-pulse rounded bg-deep-800/80" />
                      <div className="h-4 w-5/6 animate-pulse rounded bg-deep-800/60" />
                    </div>
                  ) : (
                    <>
                      <p className="text-deep-300 text-sm leading-relaxed mb-3">{result.tone}</p>
                      <p className="text-deep-400 text-sm leading-relaxed">{result.detail}</p>
                    </>
                  )}
                </div>
                <div className="bg-mystical-500/10 border border-mystical-500/25 rounded-xl p-4">
                  <h3 className="font-display text-lg text-mystical-200 mb-2">下一步</h3>
                  {isReading ? (
                    <div className="space-y-3">
                      <div className="h-4 w-full animate-pulse rounded bg-mystical-500/20" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-mystical-500/15" />
                    </div>
                  ) : (
                    <p className="text-deep-300 text-sm leading-relaxed">{result.advice}</p>
                  )}
                </div>
              </div>

              {!isReading && (
                <SpiritualRecommendation
                  kind={result.key === "sheng" ? "eastern" : result.key === "xiao" ? "clarity" : "protection"}
                  title="今日适合的珠串推荐"
                  note={result.key === "sheng" ? "前面的问事解读偏向顺势推进，下面只作为今日佩戴和定制参考。" : result.key === "xiao" ? "前面的问事解读提示先观察，下面适合偏清心、直觉和整理判断的搭配。" : "前面的问事解读提示暂缓，下面适合偏护身、边界和净化的搭配。"}
                />
              )}

              <div className="text-center">
                <button
                  onClick={() => setResult(null)}
                  disabled={isReading}
                  className="bg-deep-800 hover:bg-deep-700 text-deep-300 py-3 px-8 rounded-lg transition-all text-sm whitespace-nowrap"
                >
                  重新问事
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

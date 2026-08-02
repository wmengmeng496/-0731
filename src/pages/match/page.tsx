import { useState } from "react";
import { Link } from "react-router-dom";
import { SpiritualRecommendation } from "../../components/SpiritualRecommendation";
import { getZodiacSignFromDate } from "../../utils/zodiac";

interface MatchResult {
  overallScore: number;
  emotionalScore: number;
  personalityScore: number;
  lifestyleScore: number;
  spiritualScore: number;
  zodiacMatch: string;
  zodiacLevel: string;
  summary: string;
  emotionalAdvice: string;
  personalityAnalysis: string;
  futureOutlook: string;
  tag: string;
}

function getChineseZodiac(year: number) {
  const animals = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
  return animals[(year - 4) % 12];
}

function computeMatch(
  name1: string,
  birth1: string,
  gender1: string,
  name2: string,
  birth2: string,
  gender2: string,
): MatchResult {
  const d1 = new Date(birth1);
  const d2 = new Date(birth2);
  const sign1 = getZodiacSignFromDate(birth1);
  const sign2 = getZodiacSignFromDate(birth2);
  if (!sign1 || !sign2) throw new Error("Invalid birth date");
  const animal1 = getChineseZodiac(d1.getFullYear());
  const animal2 = getChineseZodiac(d2.getFullYear());

  const hash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) >>> 0;
    }
    return h;
  };

  const seed = hash(name1 + birth1 + gender1 + name2 + birth2 + gender2);
  const rng = (max: number, min = 0) => min + ((seed * 9301 + 49297) % 233280) / 233280 * (max - min);

  const overallScore = Math.round(rng(100, 55));
  const emotionalScore = Math.round(rng(100, 50));
  const personalityScore = Math.round(rng(100, 50));
  const lifestyleScore = Math.round(rng(100, 45));
  const spiritualScore = Math.round(rng(100, 50));

  const sameElement = sign1.element === sign2.element;
  const compatibleElements: Record<string, string[]> = {
    火: ["土", "风"],
    土: ["水", "火"],
    风: ["火", "水"],
    水: ["土", "风"],
  };
  const isCompatible = sameElement || compatibleElements[sign1.element]?.includes(sign2.element) || false;

  let zodiacMatch = "";
  let zodiacLevel = "";
  if (sameElement) {
    zodiacMatch = `${sign1.name} · ${sign2.name} — 同象星座`;
    zodiacLevel = "灵魂共振";
  } else if (isCompatible) {
    zodiacMatch = `${sign1.name} · ${sign2.name} — 元素相生`;
    zodiacLevel = "天作之合";
  } else {
    zodiacMatch = `${sign1.name} · ${sign2.name} — 元素互补`;
    zodiacLevel = "互补良缘";
  }

  const tagMap: Record<number, string> = {
    90: "金玉良缘",
    80: "佳偶天成",
    70: "相濡以沫",
    60: "细水长流",
    50: "携手同行",
  };
  const tagThresholds = [90, 80, 70, 60, 50];
  const tag = tagMap[tagThresholds.find((t) => overallScore >= t) ?? 50] ?? "缘起不灭";

  const summaries = [
    `你们的缘分如同星辰交汇，${sign1.name}的${sign1.element}象特质与${sign2.name}的${sign2.element}象能量相互呼应。${name1}与${name2}之间存在着天然的吸引力，仿佛命运早已安排好这场相遇。`,
    `这是一段需要用心经营的缘分。${sign1.name}的直率遇上${sign2.name}的细腻，如同火焰与流水，看似不同却能织就独特的和谐。`,
    `你们的组合充满了未知的惊喜。${name1}的${animal1}年生肖赋予了坚韧的底色，${name2}的${animal2}年特质则增添了灵动的气息。`,
  ];
  const summary = summaries[seed % summaries.length];

  const emotionalAdvices = [
    "在感情中，彼此的理解是最重要的桥梁。建议多创造共同回忆，用真诚的交流化解误会，让爱在细节中生长。",
    "你们的情感节奏或许不同步，但正是这种差异让生活充满色彩。学会欣赏对方的表达方式，给彼此足够的空间与安全感。",
    "你们的情感连接深厚而稳定。不妨尝试一起规划未来，设定共同的目标，让这份缘分在时间的淬炼中愈发纯粹。",
  ];
  const emotionalAdvice = emotionalAdvices[seed % emotionalAdvices.length];

  const personalityAnalyses = [
    `${name1}与${name2}的性格如同阴阳互补，一个外向果敢，一个内敛深思。这种差异不是障碍，而是让彼此成长的动力源泉。`,
    `你们的性格有许多相似之处，容易产生共鸣，但也可能因过于相似而缺乏新鲜感。建议在生活中主动尝试对方的兴趣爱好，拓展共同的边界。`,
    `${name1}的思维方式偏理性，${name2}则更注重感受。当理性与感性相遇，若能相互学习，便能构建既有深度又有温度的关系。`,
  ];
  const personalityAnalysis = personalityAnalyses[seed % personalityAnalyses.length];

  const futureOutlooks = [
    "未来的路还很长，但你们已经拥有了最珍贵的起点——彼此的真心。无论前方是坦途还是坎坷，携手同行便是最美的风景。",
    "缘分需要呵护，正如花园需要浇灌。保持初心，定期为感情注入新的活力，这份联结将会在岁月中沉淀出独特的韵味。",
    "星象显示，你们的关系具有长久发展的潜力。关键在于能否在平淡的日子里发现对方的光芒，把每一个平凡的时刻都变成值得珍藏的记忆。",
  ];
  const futureOutlook = futureOutlooks[seed % futureOutlooks.length];

  return {
    overallScore,
    emotionalScore,
    personalityScore,
    lifestyleScore,
    spiritualScore,
    zodiacMatch,
    zodiacLevel,
    summary,
    emotionalAdvice,
    personalityAnalysis,
    futureOutlook,
    tag,
  };
}

function ScoreRing({ score, label, size = 120 }: { score: number; label: string; size?: number }) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "#e9b870";
    if (s >= 60) return "#c4a882";
    return "#8a7e6b";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2d2a24"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl md:text-2xl text-mystical-100">{score}</span>
          <span className="text-deep-400 text-[10px]">分</span>
        </div>
      </div>
      <span className="text-deep-300 text-xs">{label}</span>
    </div>
  );
}

export default function Match() {
  const [name1, setName1] = useState("");
  const [birth1, setBirth1] = useState("");
  const [gender1, setGender1] = useState("male");
  const [name2, setName2] = useState("");
  const [birth2, setBirth2] = useState("");
  const [gender2, setGender2] = useState("female");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleCalculate = () => {
    if (!name1 || !birth1 || !name2 || !birth2) return;
    const r = computeMatch(name1, birth1, gender1, name2, birth2, gender2);
    setResult(r);
    setShowResult(true);
  };

  const handleReset = () => {
    setShowResult(false);
    setResult(null);
    setName1("");
    setBirth1("");
    setGender1("male");
    setName2("");
    setBirth2("");
    setGender2("female");
  };

  return (
    <div className="min-h-screen bg-deep-950 text-mystical-100 relative">
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #e9b870 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-deep-400 hover:text-mystical-300 transition-colors mb-8 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mystical-500/20 bg-mystical-500/5 text-mystical-300 text-xs tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            心有所属 · 缘来是你
          </div>
          <h1 className="font-display text-3xl md:text-5xl text-mystical-100 mb-3">缘分占卜</h1>
          <p className="text-deep-400 text-sm">输入两人信息，探索命运交织的奥秘</p>
        </div>

        {!showResult && (
          <div className="space-y-8 animate-fadeIn">
            {/* Person 1 */}
            <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-mystical-500/20 flex items-center justify-center text-mystical-400 text-sm font-display">甲</div>
                <h2 className="font-display text-lg text-mystical-200">第一位</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-deep-300 text-sm mb-2">姓名或昵称</label>
                  <input
                    type="text"
                    value={name1}
                    onChange={(e) => setName1(e.target.value)}
                    placeholder="输入姓名"
                    className="w-full bg-deep-950 border border-deep-700 rounded-lg px-4 py-3 text-mystical-100 placeholder-deep-600 focus:border-mystical-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-deep-300 text-sm mb-2">出生日期</label>
                  <input
                    type="date"
                    value={birth1}
                    onChange={(e) => setBirth1(e.target.value)}
                    className="w-full bg-deep-950 border border-deep-700 rounded-lg px-4 py-3 text-mystical-100 focus:border-mystical-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-deep-300 text-sm mb-2">性别</label>
                  <div className="flex gap-2">
                    {[
                      { value: "male", label: "男" },
                      { value: "female", label: "女" },
                    ].map((g) => (
                      <button
                        key={g.value}
                        onClick={() => setGender1(g.value)}
                        className={`flex-1 py-3 rounded-lg border text-sm transition-all whitespace-nowrap ${
                          gender1 === g.value
                            ? "border-mystical-500/50 bg-mystical-500/10 text-mystical-300"
                            : "border-deep-700 bg-deep-950 text-deep-400 hover:border-deep-600"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1 h-px bg-deep-800" />
              <div className="w-10 h-10 rounded-full border border-mystical-500/20 bg-mystical-500/5 flex items-center justify-center text-mystical-400 text-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="flex-1 h-px bg-deep-800" />
            </div>

            {/* Person 2 */}
            <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-sm font-display">乙</div>
                <h2 className="font-display text-lg text-mystical-200">第二位</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-deep-300 text-sm mb-2">姓名或昵称</label>
                  <input
                    type="text"
                    value={name2}
                    onChange={(e) => setName2(e.target.value)}
                    placeholder="输入姓名"
                    className="w-full bg-deep-950 border border-deep-700 rounded-lg px-4 py-3 text-mystical-100 placeholder-deep-600 focus:border-mystical-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-deep-300 text-sm mb-2">出生日期</label>
                  <input
                    type="date"
                    value={birth2}
                    onChange={(e) => setBirth2(e.target.value)}
                    className="w-full bg-deep-950 border border-deep-700 rounded-lg px-4 py-3 text-mystical-100 focus:border-mystical-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-deep-300 text-sm mb-2">性别</label>
                  <div className="flex gap-2">
                    {[
                      { value: "male", label: "男" },
                      { value: "female", label: "女" },
                    ].map((g) => (
                      <button
                        key={g.value}
                        onClick={() => setGender2(g.value)}
                        className={`flex-1 py-3 rounded-lg border text-sm transition-all whitespace-nowrap ${
                          gender2 === g.value
                            ? "border-rose-500/50 bg-rose-500/10 text-rose-300"
                            : "border-deep-700 bg-deep-950 text-deep-400 hover:border-deep-600"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={!name1 || !birth1 || !name2 || !birth2}
              className="w-full bg-mystical-600 hover:bg-mystical-500 disabled:bg-deep-800 disabled:text-deep-500 text-white font-medium py-4 rounded-xl transition-all text-base whitespace-nowrap flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              开始缘分占卜
            </button>
          </div>
        )}

        {showResult && result && (
          <div className="space-y-8 animate-fadeIn">
            {/* Overall Score */}
            <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mystical-500/30 to-transparent" />
              <div className="flex flex-col items-center gap-4">
                <ScoreRing score={result.overallScore} label="缘分匹配度" size={160} />
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/5 text-rose-300 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {result.tag}
                </div>
                <p className="text-mystical-200 text-sm md:text-base max-w-lg leading-relaxed mt-2">
                  {result.summary}
                </p>
              </div>
            </div>

            {/* Zodiac Match */}
            <div className="bg-deep-900/50 border border-deep-800 rounded-xl p-6 md:p-8">
              <div className="text-center mb-6">
                <p className="text-deep-400 text-xs tracking-widest uppercase mb-2">星座配对</p>
                <h3 className="font-display text-xl text-mystical-100">{result.zodiacMatch}</h3>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-mystical-500/10 text-mystical-300 text-xs border border-mystical-500/20">
                  {result.zodiacLevel}
                </span>
              </div>
            </div>

            {/* Detail Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-deep-900/50 border border-deep-800 rounded-xl p-5 flex flex-col items-center">
                <ScoreRing score={result.emotionalScore} label="情感契合" size={100} />
              </div>
              <div className="bg-deep-900/50 border border-deep-800 rounded-xl p-5 flex flex-col items-center">
                <ScoreRing score={result.personalityScore} label="性格互补" size={100} />
              </div>
              <div className="bg-deep-900/50 border border-deep-800 rounded-xl p-5 flex flex-col items-center">
                <ScoreRing score={result.lifestyleScore} label="生活默契" size={100} />
              </div>
              <div className="bg-deep-900/50 border border-deep-800 rounded-xl p-5 flex flex-col items-center">
                <ScoreRing score={result.spiritualScore} label="心灵共鸣" size={100} />
              </div>
            </div>

            {/* Analysis Cards */}
            <div className="space-y-4">
              <div className="bg-deep-900/50 border border-deep-800 rounded-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg text-mystical-200">情感建议</h3>
                </div>
                <p className="text-deep-300 text-sm leading-relaxed">{result.emotionalAdvice}</p>
              </div>

              <div className="bg-deep-900/50 border border-deep-800 rounded-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-mystical-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-mystical-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg text-mystical-200">性格分析</h3>
                </div>
                <p className="text-deep-300 text-sm leading-relaxed">{result.personalityAnalysis}</p>
              </div>

              <div className="bg-deep-900/50 border border-deep-800 rounded-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg text-mystical-200">未来展望</h3>
                </div>
                <p className="text-deep-300 text-sm leading-relaxed">{result.futureOutlook}</p>
              </div>
            </div>

            <SpiritualRecommendation
              kind="relationship"
              title="缘分结果对应灵饰"
              note="缘分占卜适合直接接关系类产品：红螺寺姻缘、粉晶关系修复，以及用于日常护理的消磁套装。"
            />

            {/* Footer */}
            <div className="text-center pt-4">
              <p className="text-deep-500 text-xs mb-6">
                本结果仅供娱乐参考，请理性看待缘分解读
              </p>
              <button
                onClick={handleReset}
                className="bg-deep-800 hover:bg-deep-700 text-deep-300 px-8 py-3 rounded-lg transition-all text-sm whitespace-nowrap inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                再测一次
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { SpiritualRecommendation } from "../../components/SpiritualRecommendation";
import { getZodiacSignFromDate, zodiacSigns, type ZodiacSign } from "../../utils/zodiac";

// 星座配对分析
const elementRelations: Record<string, Record<string, string>> = {
  "火": { "火": "同象共鸣", "风": "风火相生", "土": "火土调和", "水": "水火交融" },
  "土": { "火": "火土调和", "风": "风土互补", "土": "同象共鸣", "水": "水土相生" },
  "风": { "火": "风火相生", "风": "同象共鸣", "土": "风土互补", "水": "风水相激" },
  "水": { "火": "水火交融", "风": "风水相激", "土": "水土相生", "水": "同象共鸣" },
};

function analyzeZodiacPair(sign1: typeof zodiacSigns[0], sign2: typeof zodiacSigns[0]) {
  const relation = elementRelations[sign1.element][sign2.element];

  let score = 70;
  if (sign1.element === sign2.element) score += 8;
  if ((sign1.element === "火" && sign2.element === "风") || (sign1.element === "风" && sign2.element === "火")) score += 12;
  if ((sign1.element === "土" && sign2.element === "水") || (sign1.element === "水" && sign2.element === "土")) score += 10;
  if ((sign1.element === "火" && sign2.element === "土") || (sign1.element === "土" && sign2.element === "火")) score += 5;
  if ((sign1.element === "风" && sign2.element === "水") || (sign1.element === "水" && sign2.element === "风")) score += 3;

  // 相邻星座加分
  const diff = Math.abs(zodiacSigns.indexOf(sign1) - zodiacSigns.indexOf(sign2));
  if (diff === 1 || diff === 11) score += 5;
  if (diff === 6) score -= 3;

  score = Math.min(Math.max(score, 55), 98);

  const level = score >= 90 ? "天作之合" : score >= 80 ? "情投意合" : score >= 70 ? "相敬如宾" : score >= 60 ? "磨合成长" : "缘分待续";

  return { relation, score, level };
}

function todayInChina() {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function seededNumber(seed: string, min: number, max: number) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return min + (Math.abs(hash) % (max - min + 1));
}

function dailyFortunes(sign: ZodiacSign, dateKey: string) {
  const toneByElement = {
    火: "行动感增强，适合把拖延的事往前推一步。",
    土: "稳定感较强，适合处理现实安排和长期计划。",
    风: "沟通和灵感更活跃，适合表达想法、推进协作。",
    水: "感受力更敏锐，适合整理关系和内在状态。",
  };
  return [
    { label: "综合运势", value: seededNumber(`${dateKey}-${sign.name}-all`, 72, 92), desc: toneByElement[sign.element] },
    { label: "爱情运势", value: seededNumber(`${dateKey}-${sign.name}-love`, 66, 90), desc: "适合把话说清楚一点，少用试探，多用真诚表达。" },
    { label: "事业运势", value: seededNumber(`${dateKey}-${sign.name}-career`, 68, 94), desc: "先抓最关键的一件事，效率会比同时多线推进更稳。" },
    { label: "财富运势", value: seededNumber(`${dateKey}-${sign.name}-money`, 62, 88), desc: "正财节奏偏稳，消费前适合多留一次确认。" },
  ];
}

function luckyGuide(sign: ZodiacSign, dateKey: string) {
  const colors = ["金色", "墨绿", "酒红", "珍珠白", "雾蓝", "琥珀色"];
  const directions = ["东南", "西北", "正南", "东北", "正东", "西南"];
  return [
    { label: "幸运数字", value: String(seededNumber(`${dateKey}-${sign.name}-num`, 1, 9)) },
    { label: "幸运颜色", value: colors[seededNumber(`${dateKey}-${sign.name}-color`, 0, colors.length - 1)] },
    { label: "幸运方位", value: directions[seededNumber(`${dateKey}-${sign.name}-dir`, 0, directions.length - 1)] },
    { label: "速配星座", value: zodiacSigns[seededNumber(`${dateKey}-${sign.name}-match`, 0, zodiacSigns.length - 1)].name },
  ];
}

const pairCategories = [
  { title: "情感契合", desc: (s1: string, s2: string) => `${s1}的热情与${s2}的温柔相互吸引，彼此能够满足对方的情感需求，感情升温快且持久。`, scoreMod: 0 },
  { title: "性格互补", desc: (s1: string, s2: string) => `两人在性格上形成有趣的对照，${s1}的果敢与${s2}的细腻互补，共同生活中充满新鲜感和成长空间。`, scoreMod: 0 },
  { title: "生活默契", desc: (s1: string, s2: string) => `生活习惯上虽有差异，但${s1}和${s2}都愿意为对方做出调整，通过沟通能够建立稳固的日常默契。`, scoreMod: -2 },
  { title: "心灵共鸣", desc: (s1: string, s2: string) => `精神层面的交流是这段关系的亮点，${s1}和${s2}能够在思想和价值观上找到共鸣，灵魂伴侣的潜力很高。`, scoreMod: 2 },
];

export default function Horoscope() {
  const [tab, setTab] = useState<"daily" | "match">("daily");

  // Daily tab state
  const [birthDate, setBirthDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Match tab state
  const [sign1, setSign1] = useState<ZodiacSign | null>(null);
  const [sign2, setSign2] = useState<ZodiacSign | null>(null);
  const [matchResult, setMatchResult] = useState<ReturnType<typeof analyzeZodiacPair> | null>(null);
  const todayKey = useMemo(() => todayInChina(), []);
  const fortunes = useMemo(() => selectedSign ? dailyFortunes(selectedSign, todayKey) : [], [selectedSign, todayKey]);
  const lucky = useMemo(() => selectedSign ? luckyGuide(selectedSign, todayKey) : [], [selectedSign, todayKey]);

  const handleCalculate = () => {
    if (!birthDate) return;
    const sign = getZodiacSignFromDate(birthDate);
    if (!sign) {
      setDateError("请输入有效日期，例如 1991-07-23。");
      setShowResult(false);
      return;
    }
    setDateError("");
    setSelectedSign(sign);
    setShowResult(true);
  };

  const handleSelectSign = (sign: ZodiacSign) => {
    setDateError("");
    setSelectedSign(sign);
    setShowResult(true);
  };

  const handleMatch = () => {
    if (!sign1 || !sign2) return;
    setMatchResult(analyzeZodiacPair(sign1, sign2));
  };

  return (
    <div className="min-h-screen bg-deep-950 text-mystical-100 relative">
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #e9b870 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-8 md:py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-deep-400 hover:text-mystical-300 transition-colors mb-6 sm:mb-8 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>

        <div className="text-center mb-7 sm:mb-10">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-mystical-100 mb-3">星座运势</h1>
          <p className="text-deep-400 text-sm leading-relaxed">输入生日自动识别星座，按北京时间生成今日运势</p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:mb-8">
          {[
            { key: "daily" as const, label: "今日运势" },
            { key: "match" as const, label: "星座配对" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 rounded-lg border text-sm transition-all whitespace-nowrap ${
                tab === t.key
                  ? "border-mystical-500 bg-mystical-500/10 text-mystical-300"
                  : "border-deep-700 text-deep-400 hover:border-deep-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* DAILY TAB */}
        {tab === "daily" && (
          <div className="animate-fadeIn">
            <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-deep-300 text-sm mb-2">出生日期</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      setDateError("");
                    }}
                    className="w-full bg-deep-950 border border-deep-700 rounded-lg px-4 py-3.5 text-base text-mystical-100 focus:border-mystical-500 focus:outline-none transition-colors"
                  />
                  {dateError && <p className="mt-2 text-xs text-red-300">{dateError}</p>}
                </div>
                <button
                  onClick={handleCalculate}
                  disabled={!birthDate}
                  className="w-full sm:w-auto bg-mystical-600 hover:bg-mystical-500 disabled:bg-deep-800 disabled:text-deep-500 text-white font-medium px-8 py-3.5 rounded-lg transition-all whitespace-nowrap"
                >
                  查询星座
                </button>
              </div>
            </div>

            {!showResult && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {zodiacSigns.map((sign) => (
                  <button
                    key={sign.name}
                    onClick={() => handleSelectSign(sign)}
                    className="bg-deep-900/50 border border-deep-800 hover:border-mystical-500/40 rounded-xl p-3.5 sm:p-4 text-center transition-all group"
                  >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{sign.icon}</div>
                    <p className="font-display text-mystical-200 text-sm">{sign.name}</p>
                    <p className="text-deep-500 text-xs mt-1">{sign.date}</p>
                  </button>
                ))}
              </div>
            )}

            {showResult && selectedSign && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-5 sm:p-6 md:p-8 text-center">
                  <div className="text-5xl md:text-6xl mb-4">{selectedSign.icon}</div>
                  <h2 className="font-display text-2xl md:text-3xl text-mystical-100 mb-1">{selectedSign.name}</h2>
                  <p className="text-deep-400 text-sm">
                    {selectedSign.en} · {selectedSign.date} · {selectedSign.element}象星座
                  </p>
                  <p className="mt-3 text-xs text-deep-500">今日运势日期：{todayKey}（北京时间）</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fortunes.map((fortune) => (
                    <div key={fortune.label} className="bg-deep-900/50 border border-deep-800 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-mystical-200 text-sm font-medium">{fortune.label}</h3>
                        <span className="text-mystical-400 font-display text-lg">{fortune.value}%</span>
                      </div>
                      <div className="w-full bg-deep-800 rounded-full h-2 mb-3">
                        <div
                          className="bg-mystical-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${fortune.value}%` }}
                        />
                      </div>
                      <p className="text-deep-400 text-xs leading-relaxed">{fortune.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-deep-900/50 border border-deep-800 rounded-xl p-5">
                  <h3 className="font-display text-lg text-mystical-200 mb-4">今日幸运指南</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {lucky.map((item) => (
                      <div key={item.label} className="text-center">
                        <p className="text-deep-500 text-xs mb-1">{item.label}</p>
                        <p className="text-mystical-300 font-display">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <SpiritualRecommendation
                  kind="western"
                  title="星象能量水晶"
                  note="星座结果更适合接水晶和消磁护理：用紫水晶稳定直觉，粉晶处理关系，白水晶做日常净化。"
                />

                <button
                  onClick={() => { setShowResult(false); setSelectedSign(null); setBirthDate(""); }}
                  className="w-full bg-deep-800 hover:bg-deep-700 text-deep-300 py-3 rounded-lg transition-all text-sm whitespace-nowrap"
                >
                  重新选择
                </button>
              </div>
            )}
          </div>
        )}

        {/* MATCH TAB */}
        {tab === "match" && (
          <div className="animate-fadeIn">
            {/* Sign Selection */}
            <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8 mb-8 space-y-6">
              <div>
                <h3 className="font-display text-mystical-200 text-lg mb-4">选择两个星座</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-6">
                  {zodiacSigns.map((sign) => (
                    <button
                      key={sign.name}
                      onClick={() => {
                        if (!sign1 || (sign1 && sign2)) {
                          setSign1(sign);
                          setSign2(null);
                          setMatchResult(null);
                        } else if (sign1.name === sign.name) {
                          setSign1(null);
                        } else {
                          setSign2(sign);
                        }
                      }}
                      className={`border rounded-lg py-2 text-center transition-all ${
                        sign1?.name === sign.name || sign2?.name === sign.name
                          ? "border-mystical-500 bg-mystical-500/10 text-mystical-300"
                          : "border-deep-700 text-deep-400 hover:border-deep-600"
                      }`}
                    >
                      <span className="text-lg block">{sign.icon}</span>
                      <span className="text-xs">{sign.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="text-center">
                    {sign1 ? (
                      <div className="bg-deep-950 border border-deep-700 rounded-xl px-6 py-4">
                        <span className="text-3xl block mb-1">{sign1.icon}</span>
                        <span className="text-sm text-mystical-200">{sign1.name}</span>
                      </div>
                    ) : (
                      <div className="bg-deep-950 border border-deep-700 border-dashed rounded-xl px-6 py-4 text-deep-600">
                        <span className="text-sm">点击上方选择</span>
                      </div>
                    )}
                  </div>
                  <div className="text-mystical-400 text-xl">+</div>
                  <div className="text-center">
                    {sign2 ? (
                      <div className="bg-deep-950 border border-deep-700 rounded-xl px-6 py-4">
                        <span className="text-3xl block mb-1">{sign2.icon}</span>
                        <span className="text-sm text-mystical-200">{sign2.name}</span>
                      </div>
                    ) : (
                      <div className="bg-deep-950 border border-deep-700 border-dashed rounded-xl px-6 py-4 text-deep-600">
                        <span className="text-sm">点击上方选择</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleMatch}
                  disabled={!sign1 || !sign2}
                  className="w-full bg-mystical-600 hover:bg-mystical-500 disabled:bg-deep-800 disabled:text-deep-500 text-white font-medium py-3.5 rounded-lg transition-all whitespace-nowrap"
                >
                  开始配对
                </button>
              </div>
            </div>

            {matchResult && sign1 && sign2 && (
              <div className="space-y-6 animate-fadeIn">
                {/* Score */}
                <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-4xl">{sign1.icon}</span>
                    <span className="text-mystical-400 text-xl">×</span>
                    <span className="text-4xl">{sign2.icon}</span>
                  </div>
                  <h2 className="font-display text-2xl text-mystical-100 mb-1">{sign1.name} × {sign2.name}</h2>
                  <p className="text-deep-400 text-sm mb-6">{matchResult.relation}</p>

                  <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#1a1625" strokeWidth="6" />
                      <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="url(#gradMatch)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${matchResult.score * 2.83} 283`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradMatch" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#b8956a" />
                          <stop offset="100%" stopColor="#d4a574" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-3xl text-mystical-100">{matchResult.score}</span>
                      <span className="text-deep-400 text-xs">分</span>
                    </div>
                  </div>
                  <div>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-mystical-500/10 border border-mystical-500/20 text-mystical-300 text-sm font-display">
                      {matchResult.level}
                    </span>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pairCategories.map((cat) => {
                    const value = Math.min(Math.max(matchResult.score + cat.scoreMod + Math.floor(Math.random() * 10) - 5, 55), 98);
                    return (
                      <div key={cat.title} className="bg-deep-900/50 border border-deep-800 rounded-xl p-5">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-mystical-200 text-sm font-medium">{cat.title}</h3>
                          <span className="text-mystical-400 font-display text-lg">{value}%</span>
                        </div>
                        <div className="w-full bg-deep-800 rounded-full h-2 mb-3">
                          <div
                            className="bg-mystical-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <p className="text-deep-400 text-xs leading-relaxed">{cat.desc(sign1.name, sign2.name)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Advice */}
                <div className="bg-deep-900/50 border border-deep-800 rounded-xl p-5">
                  <h3 className="font-display text-lg text-mystical-200 mb-4">配对建议</h3>
                  <div className="space-y-3">
                    <p className="text-deep-300 text-sm leading-relaxed">
                      <span className="text-mystical-400 font-medium">相处之道：</span>
                      {sign1.name}和{sign2.name}同属{sign1.element === sign2.element ? "同一象星座" : "不同象星座"}，{sign1.element === sign2.element ? "天性相近，容易产生共鸣，但也容易因相似而产生摩擦。" : "性格互补，能够为彼此带来新的视角和成长。"}
                    </p>
                    <p className="text-deep-300 text-sm leading-relaxed">
                      <span className="text-mystical-400 font-medium">感情展望：</span>
                      这段缘分{matchResult.score >= 80 ? "前景光明，只要用心经营，必能收获美满的爱情。" : matchResult.score >= 70 ? "需要双方共同努力，理解与包容是感情升温的催化剂。" : "充满挑战，但也蕴藏着巨大的成长空间，经历磨合后会更牢固。"}
                    </p>
                  </div>
                </div>

                <SpiritualRecommendation
                  kind="relationship"
                  title="星座配对灵饰"
                  note="配对结果适合把东方姻缘认知和西方粉晶疗愈放在一起，既能做礼物，也能做关系修复主题。"
                />

                <button
                  onClick={() => { setSign1(null); setSign2(null); setMatchResult(null); }}
                  className="w-full bg-deep-800 hover:bg-deep-700 text-deep-300 py-3 rounded-lg transition-all text-sm whitespace-nowrap"
                >
                  重新选择
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

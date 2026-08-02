import { Link } from "react-router-dom";
import { useState } from "react";
import { SpiritualRecommendation } from "../../components/SpiritualRecommendation";

const heavenlyStems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const earthlyBranches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const fiveElements: Record<string, string> = {
  "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土",
  "庚": "金", "辛": "金", "壬": "水", "癸": "水",
  "子": "水", "丑": "土", "寅": "木", "卯": "木", "辰": "土", "巳": "火",
  "午": "火", "未": "土", "申": "金", "酉": "金", "戌": "土", "亥": "水",
};

const elementColors: Record<string, string> = {
  "木": "text-green-400",
  "火": "text-red-400",
  "土": "text-yellow-500",
  "金": "text-gray-300",
  "水": "text-blue-300",
};

function getYearPillar(year: number) {
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  return `${heavenlyStems[stemIndex]}${earthlyBranches[branchIndex]}`;
}

function getMonthPillar(year: number, month: number) {
  const yearStemIndex = (year - 4) % 10;
  const baseStem = [2, 3, 4, 5, 6, 7, 8, 9, 0, 1][yearStemIndex % 10];
  const monthStem = heavenlyStems[(baseStem + month - 1) % 10];
  const monthBranch = earthlyBranches[(month + 1) % 12];
  return `${monthStem}${monthBranch}`;
}

function getDayPillar(year: number, month: number, day: number) {
  const baseDate = new Date(1900, 0, 31);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const stemIndex = (diffDays + 10) % 10;
  const branchIndex = (diffDays + 12) % 12;
  return `${heavenlyStems[stemIndex]}${earthlyBranches[branchIndex]}`;
}

function getHourPillar(dayStem: string, hour: number) {
  const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
  const dayStemIndex = heavenlyStems.indexOf(dayStem);
  const baseHourStem = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8][dayStemIndex];
  const hourStem = heavenlyStems[(baseHourStem + hourBranchIndex) % 10];
  return `${hourStem}${earthlyBranches[hourBranchIndex]}`;
}

// 天干五合
const heavenlyPairs: Record<string, string> = {
  "甲": "己", "己": "甲", "乙": "庚", "庚": "乙",
  "丙": "辛", "辛": "丙", "丁": "壬", "壬": "丁", "戊": "癸", "癸": "戊",
};

// 地支六合
const earthlyPairs: Record<string, string> = {
  "子": "丑", "丑": "子", "寅": "亥", "亥": "寅",
  "卯": "戌", "戌": "卯", "辰": "酉", "酉": "辰",
  "巳": "申", "申": "巳", "午": "未", "未": "午",
};

// 地支三合
const earthlyTriplets = [
  ["申", "子", "辰"],
  ["巳", "酉", "丑"],
  ["寅", "午", "戌"],
  ["亥", "卯", "未"],
];

function getBazi(dateStr: string, timeStr: string) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour] = timeStr.split(":").map(Number);
  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(year, month);
  const dayPillar = getDayPillar(year, month, day);
  const hourPillar = getHourPillar(dayPillar[0], hour);
  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    pillars: [yearPillar, monthPillar, dayPillar, hourPillar],
  };
}

function analyzeMarriage(bazi1: { pillars: string[] }, bazi2: { pillars: string[] }) {
  // 日柱天干配对
  const dayStem1 = bazi1.pillars[2][0];
  const dayStem2 = bazi2.pillars[2][0];
  const stemMatch = heavenlyPairs[dayStem1] === dayStem2;

  // 日柱地支配对
  const dayBranch1 = bazi1.pillars[2][1];
  const dayBranch2 = bazi2.pillars[2][1];
  const branchMatch = earthlyPairs[dayBranch1] === dayBranch2;

  // 地支三合检查
  let tripletMatch = false;
  for (const triplet of earthlyTriplets) {
    const branches1 = bazi1.pillars.map((p) => p[1]);
    const branches2 = bazi2.pillars.map((p) => p[1]);
    const combined = [...branches1, ...branches2];
    if (triplet.every((b) => combined.includes(b))) {
      tripletMatch = true;
      break;
    }
  }

  // 五行互补
  const elements1 = bazi1.pillars.map((p) => fiveElements[p[0]]);
  const elements2 = bazi2.pillars.map((p) => fiveElements[p[0]]);
  const unique1 = [...new Set(elements1)];
  const unique2 = [...new Set(elements2)];
  const missing1 = ["木", "火", "土", "金", "水"].filter((e) => !unique1.includes(e));
  const missing2 = ["木", "火", "土", "金", "水"].filter((e) => !unique2.includes(e));
  const complement = missing1.some((e) => unique2.includes(e)) || missing2.some((e) => unique1.includes(e));

  // 计算分数
  let score = 60;
  if (stemMatch) score += 15;
  if (branchMatch) score += 10;
  if (tripletMatch) score += 10;
  if (complement) score += 5;
  score = Math.min(score, 98);

  const level = score >= 90 ? "金玉良缘" : score >= 80 ? "天作之合" : score >= 70 ? "琴瑟和鸣" : score >= 60 ? "相濡以沫" : "缘分待续";

  return { stemMatch, branchMatch, tripletMatch, complement, score, level };
}

const baziFortunes = [
  {
    title: "性格特质",
    content: (pillars: string[]) => `你的八字为 ${pillars.join(" ")}，天干透出${fiveElements[pillars[0][0]]}气，地支藏${fiveElements[pillars[1][1]]}根，性格中兼具${fiveElements[pillars[0][0]]}的柔韧与${fiveElements[pillars[2][0]]}的热情，待人接物温润如玉，处事果决有力。`,
  },
  {
    title: "事业运势",
    content: (pillars: string[]) => `年柱${pillars[0]}为根基，月柱${pillars[1]}为提纲，显示你适合从事与${fiveElements[pillars[1][0]]}相关的行业，如${fiveElements[pillars[1][0]] === "木" ? "教育、文化、设计" : fiveElements[pillars[1][0]] === "火" ? "科技、能源、传媒" : fiveElements[pillars[1][0]] === "土" ? "房地产、金融、农业" : fiveElements[pillars[1][0]] === "金" ? "金融、法律、机械" : "物流、旅游、贸易"}等领域。三十岁后运势渐入佳境。`,
  },
  {
    title: "财运分析",
    content: (pillars: string[]) => `日主${pillars[2][0]}坐${pillars[2][1]}，财星${fiveElements[pillars[3][1]] === fiveElements[pillars[2][0]] ? "暗藏" : "显露"}于时柱，正财偏财皆有。建议稳健理财，避免投机，中年后积蓄渐丰，晚年衣食无忧。`,
  },
  {
    title: "感情婚姻",
    content: (pillars: string[]) => `日支${pillars[2][1]}为配偶宫，${fiveElements[pillars[2][1]]}性伴侣与你相生相合。感情路上或有波折，但命中正缘会在适当时机出现。婚后家庭和睦，伴侣是你的贵人。`,
  },
];

const marriageAdvices = [
  { title: "性格互补", content: "两人天干地支各有特色，性格上形成互补。一方沉稳内敛，另一方热情外放，生活中能够相互平衡，共同成长。" },
  { title: "相处建议", content: "日常生活中多包容对方的小缺点，遇事多沟通协商。重大决策前可一起参考双方八字喜忌，选择对彼此都有利的时机。" },
  { title: "缘分展望", content: "你们的缘分经得起时间考验，无论顺境逆境，只要彼此信任、携手并进，定能白头偕老、幸福美满。" },
];

export default function Bazi() {
  const [tab, setTab] = useState<"personal" | "marriage">("personal");

  // Personal state
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [result, setResult] = useState<{
    year: string;
    month: string;
    day: string;
    hour: string;
    pillars: string[];
  } | null>(null);

  // Marriage state
  const [p1Date, setP1Date] = useState("");
  const [p1Time, setP1Time] = useState("12:00");
  const [p1Gender, setP1Gender] = useState<"male" | "female">("male");
  const [p2Date, setP2Date] = useState("");
  const [p2Time, setP2Time] = useState("12:00");
  const [p2Gender, setP2Gender] = useState<"male" | "female">("female");
  const [marriageResult, setMarriageResult] = useState<{
    bazi1: ReturnType<typeof getBazi>;
    bazi2: ReturnType<typeof getBazi>;
    analysis: ReturnType<typeof analyzeMarriage>;
  } | null>(null);

  const handleCalculate = () => {
    if (!birthDate) return;
    const bazi = getBazi(birthDate, birthTime);
    if (bazi) setResult(bazi);
  };

  const handleMarriage = () => {
    if (!p1Date || !p2Date) return;
    const bazi1 = getBazi(p1Date, p1Time);
    const bazi2 = getBazi(p2Date, p2Time);
    if (bazi1 && bazi2) {
      setMarriageResult({
        bazi1,
        bazi2,
        analysis: analyzeMarriage(bazi1, bazi2),
      });
    }
  };

  return (
    <div className="min-h-screen bg-deep-950 text-mystical-100 relative">
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #e9b870 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 md:py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-deep-400 hover:text-mystical-300 transition-colors mb-8 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>

        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-5xl text-mystical-100 mb-3">易经八字</h1>
          <p className="text-deep-400 text-sm">输入生辰，推演四柱命理与八字合婚</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-3 mb-8">
          {[
            { key: "personal" as const, label: "个人命理" },
            { key: "marriage" as const, label: "八字合婚" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-2.5 rounded-lg border text-sm transition-all whitespace-nowrap ${
                tab === t.key
                  ? "border-mystical-500 bg-mystical-500/10 text-mystical-300"
                  : "border-deep-700 text-deep-400 hover:border-deep-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* PERSONAL TAB */}
        {tab === "personal" && (
          <div className="animate-fadeIn">
            <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-deep-300 text-sm mb-2">出生日期</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-deep-950 border border-deep-700 rounded-lg px-4 py-3 text-mystical-100 focus:border-mystical-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-deep-300 text-sm mb-2">出生时辰</label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full bg-deep-950 border border-deep-700 rounded-lg px-4 py-3 text-mystical-100 focus:border-mystical-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-deep-300 text-sm mb-2">性别</label>
                <div className="flex gap-3">
                  {(["male", "female"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`px-6 py-2.5 rounded-lg border text-sm transition-all whitespace-nowrap ${
                        gender === g
                          ? "border-mystical-500 bg-mystical-500/10 text-mystical-300"
                          : "border-deep-700 text-deep-400 hover:border-deep-600"
                      }`}
                    >
                      {g === "male" ? "男" : "女"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCalculate}
                disabled={!birthDate}
                className="w-full bg-mystical-600 hover:bg-mystical-500 disabled:bg-deep-800 disabled:text-deep-500 text-white font-medium py-3.5 rounded-lg transition-all whitespace-nowrap"
              >
                推演八字
              </button>
            </div>

            {result && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8">
                  <h2 className="font-display text-xl text-mystical-200 mb-6 text-center">四柱八字</h2>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "年柱", value: result.year },
                      { label: "月柱", value: result.month },
                      { label: "日柱", value: result.day },
                      { label: "时柱", value: result.hour },
                    ].map((pillar) => (
                      <div key={pillar.label} className="text-center">
                        <p className="text-deep-400 text-xs mb-2">{pillar.label}</p>
                        <div className="bg-deep-950 border border-deep-700 rounded-xl p-4">
                          <div className="text-2xl md:text-3xl font-display mb-1">
                            <span className={elementColors[fiveElements[pillar.value[0]]]}>{pillar.value[0]}</span>
                            <span className={elementColors[fiveElements[pillar.value[1]]]}>{pillar.value[1]}</span>
                          </div>
                          <div className="flex justify-center gap-2 text-xs">
                            <span className={elementColors[fiveElements[pillar.value[0]]]}>{fiveElements[pillar.value[0]]}</span>
                            <span className="text-deep-600">·</span>
                            <span className={elementColors[fiveElements[pillar.value[1]]]}>{fiveElements[pillar.value[1]]}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {baziFortunes.map((item) => (
                    <div key={item.title} className="bg-deep-900/50 border border-deep-800 rounded-xl p-5">
                      <h3 className="font-display text-lg text-mystical-200 mb-3">{item.title}</h3>
                      <p className="text-deep-300 text-sm leading-relaxed">{item.content(result.pillars)}</p>
                    </div>
                  ))}
                </div>

                <SpiritualRecommendation
                  kind="eastern"
                  title="命盘转化灵饰"
                  note="八字结果更适合接寺庙珠串：用雍和宫稳气场、灵隐寺转财运与清心、五台山补智慧判断。"
                />
              </div>
            )}
          </div>
        )}

        {/* MARRIAGE TAB */}
        {tab === "marriage" && (
          <div className="animate-fadeIn">
            <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8 mb-8 space-y-6">
              {/* Person 1 */}
              <div>
                <h3 className="font-display text-mystical-200 text-lg mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-mystical-500/20 text-mystical-400 text-xs flex items-center justify-center">甲</span>
                  甲方信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-deep-300 text-sm mb-2">出生日期</label>
                    <input
                      type="date"
                      value={p1Date}
                      onChange={(e) => setP1Date(e.target.value)}
                      className="w-full bg-deep-950 border border-deep-700 rounded-lg px-4 py-3 text-mystical-100 focus:border-mystical-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-deep-300 text-sm mb-2">出生时辰</label>
                    <input
                      type="time"
                      value={p1Time}
                      onChange={(e) => setP1Time(e.target.value)}
                      className="w-full bg-deep-950 border border-deep-700 rounded-lg px-4 py-3 text-mystical-100 focus:border-mystical-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-deep-300 text-sm mb-2">性别</label>
                    <div className="flex gap-3">
                      {(["male", "female"] as const).map((g) => (
                        <button
                          key={g}
                          onClick={() => setP1Gender(g)}
                          className={`px-5 py-2.5 rounded-lg border text-sm transition-all whitespace-nowrap ${
                            p1Gender === g
                              ? "border-mystical-500 bg-mystical-500/10 text-mystical-300"
                              : "border-deep-700 text-deep-400 hover:border-deep-600"
                          }`}
                        >
                          {g === "male" ? "男" : "女"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-deep-800" />

              {/* Person 2 */}
              <div>
                <h3 className="font-display text-mystical-200 text-lg mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-mystical-500/20 text-mystical-400 text-xs flex items-center justify-center">乙</span>
                  乙方信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-deep-300 text-sm mb-2">出生日期</label>
                    <input
                      type="date"
                      value={p2Date}
                      onChange={(e) => setP2Date(e.target.value)}
                      className="w-full bg-deep-950 border border-deep-700 rounded-lg px-4 py-3 text-mystical-100 focus:border-mystical-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-deep-300 text-sm mb-2">出生时辰</label>
                    <input
                      type="time"
                      value={p2Time}
                      onChange={(e) => setP2Time(e.target.value)}
                      className="w-full bg-deep-950 border border-deep-700 rounded-lg px-4 py-3 text-mystical-100 focus:border-mystical-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-deep-300 text-sm mb-2">性别</label>
                    <div className="flex gap-3">
                      {(["male", "female"] as const).map((g) => (
                        <button
                          key={g}
                          onClick={() => setP2Gender(g)}
                          className={`px-5 py-2.5 rounded-lg border text-sm transition-all whitespace-nowrap ${
                            p2Gender === g
                              ? "border-mystical-500 bg-mystical-500/10 text-mystical-300"
                              : "border-deep-700 text-deep-400 hover:border-deep-600"
                          }`}
                        >
                          {g === "male" ? "男" : "女"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleMarriage}
                disabled={!p1Date || !p2Date}
                className="w-full bg-mystical-600 hover:bg-mystical-500 disabled:bg-deep-800 disabled:text-deep-500 text-white font-medium py-3.5 rounded-lg transition-all whitespace-nowrap"
              >
                八字合婚
              </button>
            </div>

            {marriageResult && (
              <div className="space-y-6 animate-fadeIn">
                {/* Score */}
                <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8 text-center">
                  <p className="text-deep-400 text-sm mb-4">八字合婚匹配度</p>
                  <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#1a1625" strokeWidth="6" />
                      <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="url(#grad)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${marriageResult.analysis.score * 2.83} 283`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#b8956a" />
                          <stop offset="100%" stopColor="#d4a574" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-3xl text-mystical-100">{marriageResult.analysis.score}</span>
                      <span className="text-deep-400 text-xs">分</span>
                    </div>
                  </div>
                  <span className="inline-block px-4 py-1.5 rounded-full bg-mystical-500/10 border border-mystical-500/20 text-mystical-300 text-sm font-display">
                    {marriageResult.analysis.level}
                  </span>
                </div>

                {/* Both Bazi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "甲方八字", bazi: marriageResult.bazi1, gender: p1Gender },
                    { label: "乙方八字", bazi: marriageResult.bazi2, gender: p2Gender },
                  ].map((p) => (
                    <div key={p.label} className="bg-deep-900/50 border border-deep-800 rounded-xl p-5">
                      <h3 className="font-display text-mystical-200 text-sm mb-3">{p.label} · {p.gender === "male" ? "乾造" : "坤造"}</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {p.bazi.pillars.map((pillar: string, i: number) => (
                          <div key={i} className="text-center bg-deep-950 border border-deep-700 rounded-lg py-2">
                            <p className="text-deep-500 text-[10px] mb-1">{["年", "月", "日", "时"][i]}柱</p>
                            <p className="font-display text-lg">
                              <span className={elementColors[fiveElements[pillar[0]]]}>{pillar[0]}</span>
                              <span className={elementColors[fiveElements[pillar[1]]]}>{pillar[1]}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Analysis Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "日柱天干五合", match: marriageResult.analysis.stemMatch, desc: "天干相合代表两人性格互补，心意相通，生活中容易达成共识。", fail: "天干无明显相合，建议多包容理解，培养默契。" },
                    { label: "日柱地支六合", match: marriageResult.analysis.branchMatch, desc: "地支六合为最佳配偶组合，感情深厚，缘分牢固。", fail: "地支无直接相合，可通过共同兴趣增进感情。" },
                    { label: "地支三合局", match: marriageResult.analysis.tripletMatch, desc: "两人八字中存在地支三合，气场高度契合，事业家庭双丰收。", fail: "暂无三合局，但不影响幸福，关键在于用心经营。" },
                    { label: "五行互补", match: marriageResult.analysis.complement, desc: "双方五行互补，一方所缺恰为对方所长，阴阳调和，相得益彰。", fail: "五行各有侧重，建议在生活中取长补短，互相支持。" },
                  ].map((item) => (
                    <div key={item.label} className="bg-deep-900/50 border border-deep-800 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display text-mystical-200 text-sm">{item.label}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.match ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                          {item.match ? "相合" : "平淡"}
                        </span>
                      </div>
                      <p className="text-deep-300 text-sm leading-relaxed">{item.match ? item.desc : item.fail}</p>
                    </div>
                  ))}
                </div>

                {/* Marriage Advice */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {marriageAdvices.map((item) => (
                    <div key={item.title} className="bg-deep-900/50 border border-deep-800 rounded-xl p-5">
                      <h3 className="font-display text-mystical-200 text-sm mb-2">{item.title}</h3>
                      <p className="text-deep-300 text-xs leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                </div>

                <SpiritualRecommendation
                  kind="relationship"
                  title="合婚关系灵饰"
                  note="关系类结果优先推荐红螺寺姻缘手串，也搭配粉晶做柔和关系修复。"
                />

                <button
                  onClick={() => { setMarriageResult(null); setP1Date(""); setP2Date(""); }}
                  className="w-full bg-deep-800 hover:bg-deep-700 text-deep-300 py-3 rounded-lg transition-all text-sm whitespace-nowrap"
                >
                  重新测算
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

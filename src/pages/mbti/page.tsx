import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { SpiritualRecommendation } from "../../components/SpiritualRecommendation";

// ==================== MBTI数据 ====================
const mbtiTypes: {
  code: string;
  nickname: string;
  category: string;
  categoryColor: string;
  desc: string;
  strengths: string[];
  weaknesses: string[];
  traits: string;
}[] = [
  { code: "INTJ", nickname: "建筑师", category: "分析家", categoryColor: "#b8956a", desc: "富有想象力和战略性的思想家，对一切都有计划。独立、果断，追求知识和能力的极致。", strengths: ["战略思维", "独立自主", "坚定果断", "洞察力强"], weaknesses: ["过于理性", "不善社交", "完美主义", "偶尔傲慢"], traits: "INTJ是十六型人格中最为独立的类型之一。你们拥有强大的内在驱动力和清晰的愿景，喜欢制定长远计划并一步步实现。重视逻辑和效率，不轻易被情感左右。在人际关系中可能显得冷淡，但一旦认定某人便会非常忠诚。" },
  { code: "INTP", nickname: "逻辑学家", category: "分析家", categoryColor: "#b8956a", desc: "具有创造力的发明家，对知识有着永不满足的渴求。安静、善于分析，享受探索理论和抽象概念。", strengths: ["逻辑严谨", "创新思维", "好奇心强", "客观公正"], weaknesses: ["拖延倾向", "不善表达", "过于理论化", "缺乏执行力"], traits: "INTP是思想世界的探索者，你们沉迷于分析和理解世界运行的规律。喜欢独处思考，对复杂问题有着天然的亲近感。社交上比较内向，更倾向于通过文字和思想与人交流。在感情中，忠诚但可能显得不够浪漫。" },
  { code: "ENTJ", nickname: "指挥官", category: "分析家", categoryColor: "#b8956a", desc: "大胆、富有想象力的强势领导者，总能找到解决问题的方法。天生的领袖，擅长组织和动员他人。", strengths: ["领导力强", "果断高效", "战略眼光", "自信坚定"], weaknesses: ["过于强势", "缺乏耐心", "忽略情感", "控制欲强"], traits: "ENTJ是天生的领袖，你们拥有强烈的使命感和领导欲望。喜欢掌控局面，用最高效的方式达成目标。决策果断、行动力强，是天生的管理者。在感情中倾向于主导关系，需要学会倾听和包容对方的感受。" },
  { code: "ENTP", nickname: "辩论家", category: "分析家", categoryColor: "#b8956a", desc: "聪明好奇的思想者，无法抵挡智力上的挑战。热衷于头脑风暴，喜欢从不同角度看问题。", strengths: ["思维敏捷", "创意无限", "善于辩论", "适应力强"], weaknesses: ["缺乏专注", "争论过度", "忽略细节", "不够稳定"], traits: "ENTP是思维世界的探险家，你们享受在思想的碰撞中迸发出新的火花。口头表达能力强，善于说服和辩论。不喜欢循规蹈矩，对新鲜事物永远充满热情。感情中追求精神共鸣，希望伴侣能跟上你的思维节奏。" },
  { code: "INFJ", nickname: "提倡者", category: "外交家", categoryColor: "#8ba888", desc: "安静而神秘，激励人心的理想主义者。深刻的洞察力让你能够理解他人的内心世界，渴望为世界带来积极改变。", strengths: ["深刻洞察", "利他主义", "坚定信念", "创造力强"], weaknesses: ["过于敏感", "理想主义", "难以敞开心扉", "容易筋疲力竭"], traits: "INFJ是十六型人格中最稀有的类型。你们拥有极其敏锐的直觉和深刻的共情能力，能够洞察他人内心深处的需求和情感。追求意义和使命，不甘平凡。在感情中极度忠诚，渴望深度连接而非肤浅关系。" },
  { code: "INFP", nickname: "调停者", category: "外交家", categoryColor: "#8ba888", desc: "诗意、善良的利他主义者，总是热情地帮助正义事业。富有创造力和理想主义，追随内心的价值观。", strengths: ["富有同情", "理想主义", "创造力丰富", "真诚善良"], weaknesses: ["过于理想化", "容易受伤", "不善实践", "回避冲突"], traits: "INFP是灵魂的诗人，你们拥有丰富的内心世界和坚定的价值信念。对美好事物有着天然的敏感，追求真实和意义的生活。讨厌虚伪和冲突，渴望和平与和谐。在感情中浪漫而专一，将伴侣视为灵魂的伙伴。" },
  { code: "ENFJ", nickname: "主人公", category: "外交家", categoryColor: "#8ba888", desc: "魅力超凡、鼓舞人心的领导者，能让听众着迷。天生的导师，关心他人的成长和幸福。", strengths: ["感染力强", "善于沟通", "利他助人", "天生的领导者"], weaknesses: ["过于付出", "难以说&quot;不&quot;", "容易内耗", "过度理想化"], traits: "ENFJ是天生的鼓舞者，你们拥有超凡的魅力，能够激励身边的人成为更好的自己。社交能力强，善于洞察群体中每个人的需要。乐于帮助他人成长。在感情中热情主动，是完美的伴侣模版，但需要注意照顾好自己。" },
  { code: "ENFP", nickname: "竞选者", category: "外交家", categoryColor: "#8ba888", desc: "热情、创造性、自由奔放的社交达人。总是能找到微笑的理由。热爱生活，享受与人建立的情感连接。", strengths: ["热情洋溢", "想象力丰富", "社交高手", "乐观积极"], weaknesses: ["不够专注", "容易焦虑", "过于感性", "缺乏条理"], traits: "ENFP是人群中的小太阳，你们拥有无穷的热情和好奇心，总能发现生活中美好的那一面。喜欢探索新的可能性，不善拒绝他人。对自由有极大的渴望，同时也渴望深刻的情感联系。感情中浪漫而多变，需要空间也渴望陪伴。" },
  { code: "ISTJ", nickname: "物流师", category: "守护者", categoryColor: "#6b8e9a", desc: "务实且注重事实，具有可靠的判断力。正直、尽职，是家庭和社会的中流砥柱。", strengths: ["可靠务实", "责任感强", "注重细节", "沉稳冷静"], weaknesses: ["过于保守", "不善变通", "情感表达少", "固执己见"], traits: "ISTJ是秩序的守护者，你们用事实和逻辑构建起稳固的生活体系。责任心极强，说到必定做到。喜欢清晰明确的规则和步骤，不擅长应对模糊和变化。在感情中不善言辞但行动力超强，是最可靠的伴侣类型。" },
  { code: "ISFJ", nickname: "守卫者", category: "守护者", categoryColor: "#6b8e9a", desc: "敬业且热心的保护者，总是随时准备保护所爱之人。温柔体贴，默默付出，是最值得信赖的朋友。", strengths: ["温柔体贴", "忠诚可靠", "注重实践", "耐心细致"], weaknesses: ["过于谦逊", "压抑自己", "不善拒绝", "害怕改变"], traits: "ISFJ是温柔的守护者，你们用默默的付出和细腻的关怀温暖着身边的每一个人。对家人和朋友极为忠诚，记忆力超群，总是记得别人的需求和喜好。不喜欢成为关注的焦点，在低调中展现着强大的力量。感情中是最温柔的伴侣。" },
  { code: "ESTJ", nickname: "总经理", category: "守护者", categoryColor: "#6b8e9a", desc: "出色的管理者，在管理事情或人员方面无与伦比。高效、有条理，对传统和秩序充满尊重。", strengths: ["组织力强", "果断务实", "领导能力", "责任感强"], weaknesses: ["过于强势", "缺乏弹性", "情感迟钝", "不喜变化"], traits: "ESTJ是制度的管理者，你们天生就懂得如何高效运作和领导团队。喜欢明确的层级和责任，追求效率和结果。对传统有着深深的敬意，是社会秩序的坚定维护者。感情中务实可靠，虽然不擅长甜言蜜语，但会用行动证明一切。" },
  { code: "ESFJ", nickname: "执政官", category: "守护者", categoryColor: "#6b8e9a", desc: "非常关心他人，受欢迎的社交达人。总是热心助人、彬彬有礼。是朋友圈中的黏合剂。", strengths: ["热心助人", "社交能力强", "责任感强", "务实可靠"], weaknesses: ["过于讨好", "缺乏主见", "害怕冲突", "过于传统"], traits: "ESFJ是社交圈的粘合剂，你们天生就懂得如何让他人感到舒服和被重视。热心肠、乐于助人，享受为他人带来快乐。对家庭和朋友极为看重，是聚会中最积极的策划者。感情中热情体贴，是温暖的港湾式伴侣。" },
  { code: "ISTP", nickname: "鉴赏家", category: "探险家", categoryColor: "#a0806b", desc: "大胆而实际，擅长使用各种工具。天生的问题解决者，在危机中沉着冷静，动手能力极强。", strengths: ["动手能力强", "冷静沉着", "灵活变通", "善于解决问题"], weaknesses: ["不善沟通", "容易厌倦", "过于独立", "冒险冲动"], traits: "ISTP是现实世界的问题解决者，你们有着惊人的动手能力和冷静的头脑。面对危机从不慌乱，总能找到最实际的解决方案。享受独处和动手操作的乐趣，不喜欢过多社交。感情中给予伴侣充分的自由，但也需要被理解。" },
  { code: "ISFP", nickname: "探险家", category: "探险家", categoryColor: "#a0806b", desc: "灵活有魅力，随时准备探索新事物。温和敏感，热爱美和艺术，活在当下，享受生活。", strengths: ["艺术天赋", "温和友善", "适应力强", "活在当下"], weaknesses: ["过于随性", "缺乏规划", "容易逃避", "不善表达"], traits: "ISFP是生活中的艺术家，你们对美和和谐有着天然的敏感。温和友善、不喜冲突，用行动而非语言来表达关爱。热爱自由和体验，不喜欢被框架和计划束缚。感情中是最温柔的恋人，用细腻的方式表达爱意。" },
  { code: "ESTP", nickname: "企业家", category: "探险家", categoryColor: "#a0806b", desc: "聪明、活力充沛、善于感知，真正享受冒险的人。行动力极强，是天然的应急响应者。", strengths: ["行动力强", "冒险精神", "社交达人", "应变力强"], weaknesses: ["缺乏耐心", "冲动鲁莽", "不够深入", "规则意识弱"], traits: "ESTP是行动派中的典范，你们享受当下、敢想敢做。对刺激和冒险有着天然的渴望，是天生的冒险家。社交能力强，能迅速融入任何环境。不喜欢计划太远，更愿意在生活中即兴发挥。感情中热烈而刺激，追求激情与新鲜感。" },
  { code: "ESFP", nickname: "表演者", category: "探险家", categoryColor: "#a0806b", desc: "自发性强、精力充沛，永远不无聊的表演者。热爱聚光灯，享受成为人群中的焦点。", strengths: ["热情开朗", "感染力强", "善于观察", "乐观向上"], weaknesses: ["过于追求刺激", "缺乏深度", "容易冲动", "回避严肃"], traits: "ESFP是天生的表演者，你们热爱站在舞台中央享受聚光灯和掌声。热情洋溢、充满活力，是派对的灵魂人物。对生活充满激情，喜欢用最直接的感官体验去感受世界。感情中热情主动，用绚烂的方式去爱，但也需要同样热情的回应。" },
];

// 人格匹配兼容性数据
const matchCompatibility: Record<string, string[]> = {
  "INTJ": ["ENFP", "ENTP", "INFJ"],
  "INTP": ["ENTJ", "ESTJ", "INFJ"],
  "ENTJ": ["INTP", "INFP", "INTJ"],
  "ENTP": ["INFJ", "INTJ", "ENFJ"],
  "INFJ": ["ENTP", "ENFP", "INTJ"],
  "INFP": ["ENFJ", "ENTJ", "ESFJ"],
  "ENFJ": ["INFP", "ISFP", "ENTP"],
  "ENFP": ["INTJ", "INFJ", "ISTJ"],
  "ISTJ": ["ESFP", "ESTP", "ENFP"],
  "ISFJ": ["ESTP", "ESFP", "ENTP"],
  "ESTJ": ["INTP", "ISTP", "ISFP"],
  "ESFJ": ["ISFP", "INFP", "ISTP"],
  "ISTP": ["ESTJ", "ESFJ", "ENTJ"],
  "ISFP": ["ESFJ", "ESTJ", "ENFJ"],
  "ESTP": ["ISFJ", "ISTJ", "ESFJ"],
  "ESFP": ["ISTJ", "ISFJ", "INTJ"],
};

// ==================== 人格测试题目 ====================
interface Question {
  id: number;
  text: string;
  dimension: "EI" | "SN" | "TF" | "JP";
  positive: string; // 选A代表的方向（E/S/T/J）
}

const testQuestions: Question[] = [
  { id: 1, text: "参加社交聚会时，你通常：", dimension: "EI", positive: "活力满满，享受与众人交流" },
  { id: 2, text: "独处时，你更倾向于：", dimension: "EI", positive: "觉得无聊，想找朋友聊天" },
  { id: 3, text: "面对一个新想法，你首先关注：", dimension: "SN", positive: "它如何应用于实际情况" },
  { id: 4, text: "读书或看文章时，你更注重：", dimension: "SN", positive: "书中的具体事实和细节" },
  { id: 5, text: "做决定时，你更依赖：", dimension: "TF", positive: "逻辑分析和客观数据" },
  { id: 6, text: "朋友向你倾诉烦恼时，你倾向于：", dimension: "TF", positive: "帮Ta分析问题并给出解决方案" },
  { id: 7, text: "对于日程安排，你更喜欢：", dimension: "JP", positive: "提前规划，按计划执行" },
  { id: 8, text: "旅行时，你倾向于：", dimension: "JP", positive: "提前做好详细攻略" },
  { id: 9, text: "在团队中，你更倾向于：", dimension: "EI", positive: "主动发言，带动讨论氛围" },
  { id: 10, text: "学习新技能时，你更喜欢：", dimension: "SN", positive: "动手实践，边做边学" },
  { id: 11, text: "收到批评时，你通常：", dimension: "TF", positive: "冷静分析批评是否合理" },
  { id: 12, text: "面对截止日期，你习惯：", dimension: "JP", positive: "提前完成，留足缓冲时间" },
  { id: 13, text: "周末你最想：", dimension: "EI", positive: "约朋友一起出去玩" },
  { id: 14, text: "描述事物时，你偏重：", dimension: "SN", positive: "具体的、可感知的细节" },
  { id: 15, text: "面对冲突，你更倾向于：", dimension: "TF", positive: "据理力争，坚持正确的一方" },
  { id: 16, text: "你的桌面/房间通常：", dimension: "JP", positive: "整洁有序，东西各归其位" },
];

function calculateMBTI(answers: Record<number, boolean>): string {
  let e = 0, i = 0, s = 0, n = 0, t = 0, f = 0, j = 0, p = 0;

  testQuestions.forEach((q) => {
    const answer = answers[q.id]; // true = positive(选A = 同意), false = 选B = 不同意
    if (q.dimension === "EI") {
      if (answer) e++; else i++;
    } else if (q.dimension === "SN") {
      if (answer) s++; else n++;
    } else if (q.dimension === "TF") {
      if (answer) t++; else f++;
    } else if (q.dimension === "JP") {
      if (answer) j++; else p++;
    }
  });

  const result = `${e >= i ? "E" : "I"}${s >= n ? "S" : "N"}${t >= f ? "T" : "F"}${j >= p ? "J" : "P"}`;
  return result;
}

function getDimensionPercentages(answers: Record<number, boolean>) {
  let e = 0, i = 0, s = 0, n = 0, t = 0, f = 0, j = 0, p = 0;
  testQuestions.forEach((q) => {
    const ans = answers[q.id];
    if (q.dimension === "EI") { if (ans) e++; else i++; }
    else if (q.dimension === "SN") { if (ans) s++; else n++; }
    else if (q.dimension === "TF") { if (ans) t++; else f++; }
    else if (q.dimension === "JP") { if (ans) j++; else p++; }
  });
  return {
    EI: { E: Math.round((e / (e + i)) * 100), I: Math.round((i / (e + i)) * 100) },
    SN: { S: Math.round((s / (s + n)) * 100), N: Math.round((n / (s + n)) * 100) },
    TF: { T: Math.round((t / (t + f)) * 100), F: Math.round((f / (t + f)) * 100) },
    JP: { J: Math.round((j / (j + p)) * 100), P: Math.round((p / (j + p)) * 100) },
  };
}

// ==================== 匹配分析 ====================
function analyzeMbtiMatch(type1Code: string, type2Code: string) {
  const type1 = mbtiTypes.find((t) => t.code === type1Code)!;
  const type2 = mbtiTypes.find((t) => t.code === type2Code)!;

  let score = 70;

  // 同类别加分
  if (type1.category === type2.category) score += 8;
  // 互补维度
  const dim1 = type1.code.split("");
  const dim2 = type2.code.split("");
  let complementary = 0;
  for (let i = 0; i < 4; i++) {
    if (dim1[i] !== dim2[i]) complementary++;
  }
  if (complementary === 4) score += 10;
  else if (complementary === 3) score += 6;
  else if (complementary === 1) score += 3;

  const isCompatible = matchCompatibility[type1Code]?.includes(type2Code);
  if (isCompatible) score += 12;

  // 相同类型
  if (type1Code === type2Code) score = Math.max(score, 88);

  score = Math.min(Math.max(score, 55), 98);

  const level = score >= 90 ? "灵魂共鸣" : score >= 80 ? "知己知音" : score >= 70 ? "互补成长" : score >= 60 ? "相互磨合" : "风格迥异";

  const relationshipDesc = () => {
    if (type1Code === type2Code) return `你们拥有相同的人格类型，能够深刻理解彼此的思维方式和情感需求。沟通上几乎不存在障碍，相处起来默契十足。需要注意的是，相似的两个人可能在面对挑战时缺乏不同的视角。`;
    if (isCompatible) return `${type1.code}与${type2.code}是天然的佳配组合。你们的性格特质形成完美互补，既能互相欣赏彼此的优势，又能在对方的不足处提供支持。这是一段充满活力和成长空间的关系。`;
    return `${type1.code}与${type2.code}的组合颇具特色。虽然性格上存在差异，但差异往往带来成长的机会。只要双方愿意相互理解和包容，这段关系同样可以开出美丽的花朵。`;
  };

  return { score, level, relationshipDesc, complementary, isCompatible };
}

// ==================== 组件 ====================

export default function Mbti() {
  const [tab, setTabState] = useState<"test" | "match" | "types">("test");

  // Test state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [resultType, setResultType] = useState<string | null>(null);
  const [dimPercentages, setDimPercentages] = useState<ReturnType<typeof getDimensionPercentages> | null>(null);

  // Match state
  const [matchType1, setMatchType1] = useState<string | null>(null);
  const [matchType2, setMatchType2] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<ReturnType<typeof analyzeMbtiMatch> | null>(null);

  const handleAnswer = (positive: boolean) => {
    const q = testQuestions[currentQ];
    setAnswers((prev) => ({ ...prev, [q.id]: positive }));
    if (currentQ < testQuestions.length - 1) {
      setCurrentQ((prev) => prev + 1);
    }
  };

  const handleSubmitTest = () => {
    const mbti = calculateMBTI(answers);
    const dims = getDimensionPercentages(answers);
    setResultType(mbti);
    setDimPercentages(dims);
  };

  const handleMatch = () => {
    if (!matchType1 || !matchType2) return;
    setMatchResult(analyzeMbtiMatch(matchType1, matchType2));
  };

  const progress = Math.round(((currentQ + (answers[testQuestions[currentQ].id] !== undefined ? 1 : 0)) / testQuestions.length) * 100);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === testQuestions.length;

  const resultData = resultType ? mbtiTypes.find((t) => t.code === resultType) : null;
  const matchType1Data = matchType1 ? mbtiTypes.find((t) => t.code === matchType1) : null;
  const matchType2Data = matchType2 ? mbtiTypes.find((t) => t.code === matchType2) : null;

  return (
    <div className="min-h-screen bg-deep-950 text-mystical-100 relative">
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #e9b870 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-deep-400 hover:text-mystical-300 transition-colors mb-8 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>

        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-5xl text-mystical-100 mb-3">MBTI人格</h1>
          <p className="text-deep-400 text-sm">探索十六型人格，了解内心深处的自我与匹配关系</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-3 mb-8">
          {[
            { key: "test" as const, label: "性格测试" },
            { key: "match" as const, label: "人格匹配" },
            { key: "types" as const, label: "十六人格" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTabState(t.key)}
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

        {/* ==================== 性格测试 Tab ==================== */}
        {tab === "test" && (
          <div className="animate-fadeIn">
            {!resultType ? (
              <>
                {/* Progress Bar */}
                <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-deep-400 text-sm">
                      题目 {currentQ + 1} / {testQuestions.length}
                    </span>
                    <span className="text-mystical-400 text-sm">{progress}%</span>
                  </div>
                  <div className="w-full bg-deep-800 rounded-full h-2">
                    <div
                      className="bg-mystical-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Question Card */}
                <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-10 text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-mystical-500/10 border border-mystical-500/20 text-mystical-300 text-xs mb-6">
                    {testQuestions[currentQ].dimension === "EI" ? "外向 E ↔ I 内向" :
                     testQuestions[currentQ].dimension === "SN" ? "实感 S ↔ N 直觉" :
                     testQuestions[currentQ].dimension === "TF" ? "思考 T ↔ F 情感" :
                     "判断 J ↔ P 感知"}
                  </div>
                  <h3 className="font-display text-xl md:text-2xl text-mystical-100 mb-10 leading-relaxed">
                    {testQuestions[currentQ].text}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleAnswer(true)}
                      className={`border rounded-xl p-5 text-left transition-all group ${
                        answers[testQuestions[currentQ].id] === true
                          ? "border-mystical-500 bg-mystical-500/10"
                          : "border-deep-700 hover:border-mystical-500/40"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-7 h-7 rounded-full border border-mystical-500/40 flex items-center justify-center text-mystical-400 text-xs font-medium">
                          A
                        </span>
                        <span className="text-deep-500 text-xs tracking-wider">
                          {testQuestions[currentQ].dimension === "EI" ? "外向倾向" :
                           testQuestions[currentQ].dimension === "SN" ? "实感倾向" :
                           testQuestions[currentQ].dimension === "TF" ? "思考倾向" : "判断倾向"}
                        </span>
                      </div>
                      <p className="text-mystical-200 text-sm">{testQuestions[currentQ].positive}</p>
                    </button>

                    <button
                      onClick={() => handleAnswer(false)}
                      className={`border rounded-xl p-5 text-left transition-all group ${
                        answers[testQuestions[currentQ].id] === false
                          ? "border-mystical-500 bg-mystical-500/10"
                          : "border-deep-700 hover:border-mystical-500/40"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-7 h-7 rounded-full border border-mystical-500/40 flex items-center justify-center text-mystical-400 text-xs font-medium">
                          B
                        </span>
                        <span className="text-deep-500 text-xs tracking-wider">
                          {testQuestions[currentQ].dimension === "EI" ? "内向倾向" :
                           testQuestions[currentQ].dimension === "SN" ? "直觉倾向" :
                           testQuestions[currentQ].dimension === "TF" ? "情感倾向" : "感知倾向"}
                        </span>
                      </div>
                      <p className="text-mystical-200 text-sm">
                        与A相反的选择，更偏向另一端的特质
                      </p>
                    </button>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
                    disabled={currentQ === 0}
                    className="px-4 py-2 border border-deep-700 rounded-lg text-deep-400 hover:border-deep-600 text-sm disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    上一题
                  </button>

                  {allAnswered && (
                    <button
                      onClick={handleSubmitTest}
                      className="px-8 py-2.5 bg-mystical-600 hover:bg-mystical-500 text-white rounded-lg font-medium transition-all text-sm whitespace-nowrap"
                    >
                      查看结果
                    </button>
                  )}

                  {currentQ < testQuestions.length - 1 && answers[testQuestions[currentQ].id] !== undefined && (
                    <button
                      onClick={() => setCurrentQ((prev) => prev + 1)}
                      className="px-4 py-2 border border-deep-700 rounded-lg text-deep-400 hover:border-deep-600 text-sm whitespace-nowrap"
                    >
                      下一题
                    </button>
                  )}
                </div>

                {allAnswered && currentQ === testQuestions.length - 1 && (
                  <div className="text-center mt-6 text-mystical-400 text-sm animate-pulse">
                    全部题目已完成，点击「查看结果」揭晓你的人格类型！
                  </div>
                )}
              </>
            ) : (
              /* Results */
              <div className="space-y-6 animate-fadeIn">
                {/* Type Header */}
                <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-10 text-center">
                  <p className="text-deep-400 text-sm mb-2">{resultData?.category}</p>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {resultType!.split("").map((letter, idx) => (
                      <span
                        key={idx}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center font-display text-2xl md:text-3xl border"
                        style={{
                          color: resultData?.categoryColor,
                          borderColor: resultData?.categoryColor + "40",
                          backgroundColor: resultData?.categoryColor + "10",
                        }}
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl text-mystical-100 mb-1">{resultType} · {resultData?.nickname}</h2>
                  <p className="text-deep-400 text-sm max-w-lg mx-auto">{resultData?.desc}</p>
                </div>

                {/* Dimension Breakdown */}
                {dimPercentages && (
                  <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8">
                    <h3 className="font-display text-lg text-mystical-200 mb-6 text-center">四维解析</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: "外向 E / 内向 I", left: dimPercentages.EI.E, right: dimPercentages.EI.I, leftLabel: "E", rightLabel: "I" },
                        { label: "实感 S / 直觉 N", left: dimPercentages.SN.S, right: dimPercentages.SN.N, leftLabel: "S", rightLabel: "N" },
                        { label: "思考 T / 情感 F", left: dimPercentages.TF.T, right: dimPercentages.TF.F, leftLabel: "T", rightLabel: "F" },
                        { label: "判断 J / 感知 P", left: dimPercentages.JP.J, right: dimPercentages.JP.P, leftLabel: "J", rightLabel: "P" },
                      ].map((dim) => (
                        <div key={dim.label}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-deep-300 text-xs">{dim.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-deep-500 text-xs w-4">{dim.leftLabel}</span>
                            <div className="flex-1 bg-deep-800 rounded-full h-3 overflow-hidden flex">
                              <div
                                className="h-full rounded-l-full transition-all duration-1000"
                                style={{ width: `${dim.left}%`, backgroundColor: resultData?.categoryColor }}
                              />
                              <div className="h-full bg-deep-700 transition-all duration-1000" style={{ width: `${dim.right}%` }} />
                            </div>
                            <span className="text-deep-500 text-xs w-4">{dim.rightLabel}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-mystical-400 text-xs">{dim.left}%</span>
                            <span className="text-deep-500 text-xs">{dim.right}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Traits */}
                <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8">
                  <h3 className="font-display text-lg text-mystical-200 mb-4">人格特质</h3>
                  <p className="text-deep-300 text-sm leading-relaxed mb-6">{resultData?.traits}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-green-400/80 mb-3">优势特质</h4>
                      <div className="flex flex-wrap gap-2">
                        {resultData?.strengths.map((s) => (
                          <span key={s} className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400/80 text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-orange-400/80 mb-3">成长空间</h4>
                      <div className="flex flex-wrap gap-2">
                        {resultData?.weaknesses.map((w) => (
                          <span key={w} className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400/80 text-xs">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Matches */}
                <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8 text-center">
                  <h3 className="font-display text-lg text-mystical-200 mb-4">最佳匹配人格</h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {matchCompatibility[resultType!]?.map((code) => {
                      const t = mbtiTypes.find((mt) => mt.code === code);
                      return (
                        <div key={code} className="px-4 py-2 rounded-lg border border-mystical-500/20 bg-mystical-500/5 text-mystical-300 text-sm">
                          {code} <span className="text-deep-500">{t?.nickname}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-deep-500 text-xs mt-4">前往「人格匹配」查看详细缘分分析</p>
                </div>

                <SpiritualRecommendation
                  kind={resultType?.includes("N") ? "clarity" : "western"}
                  title="人格能量补充"
                  note="MBTI 结果更适合接西方水晶体系：直觉型偏紫水晶与白水晶，情感型偏粉晶，行动型偏黄水晶。"
                />

                <button
                  onClick={() => { setResultType(null); setAnswers({}); setCurrentQ(0); setDimPercentages(null); }}
                  className="w-full bg-deep-800 hover:bg-deep-700 text-deep-300 py-3 rounded-lg transition-all text-sm whitespace-nowrap"
                >
                  重新测试
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== 人格匹配 Tab ==================== */}
        {tab === "match" && (
          <div className="animate-fadeIn">
            {/* Type Selection */}
            <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8 mb-8 space-y-6">
              <div>
                <h3 className="font-display text-mystical-200 text-lg mb-4">选择两个人格类型</h3>

                {/* Categories */}
                {["分析家", "外交家", "守护者", "探险家"].map((cat) => {
                  const catTypes = mbtiTypes.filter((t) => t.category === cat);
                  return (
                    <div key={cat} className="mb-4">
                      <p className="text-deep-500 text-xs mb-2">{cat}</p>
                      <div className="flex flex-wrap gap-2">
                        {catTypes.map((t) => (
                          <button
                            key={t.code}
                            onClick={() => {
                              if (!matchType1 || (matchType1 && matchType2)) {
                                setMatchType1(t.code);
                                setMatchType2(null);
                                setMatchResult(null);
                              } else if (matchType1 === t.code) {
                                setMatchType1(null);
                              } else {
                                setMatchType2(t.code);
                              }
                            }}
                            className={`border rounded-lg px-3 py-2 text-center transition-all whitespace-nowrap ${
                              matchType1 === t.code || matchType2 === t.code
                                ? "border-mystical-500 bg-mystical-500/10 text-mystical-300"
                                : "border-deep-700 text-deep-400 hover:border-deep-600"
                            }`}
                            style={matchType1 === t.code || matchType2 === t.code ? {} : {}}
                          >
                            <span className="text-xs font-medium">{t.code}</span>
                            <span className="text-deep-500 text-xs ml-1">{t.nickname}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center justify-center gap-4 mt-6">
                  <div className="text-center">
                    {matchType1 ? (
                      <div className="bg-deep-950 border border-deep-700 rounded-xl px-6 py-4">
                        <span className="font-display text-xl block mb-1" style={{ color: matchType1Data?.categoryColor }}>
                          {matchType1}
                        </span>
                        <span className="text-sm text-mystical-200">{matchType1Data?.nickname}</span>
                      </div>
                    ) : (
                      <div className="bg-deep-950 border border-deep-700 border-dashed rounded-xl px-6 py-4 text-deep-600">
                        <span className="text-sm">选择人格A</span>
                      </div>
                    )}
                  </div>
                  <div className="text-mystical-400 text-xl">×</div>
                  <div className="text-center">
                    {matchType2 ? (
                      <div className="bg-deep-950 border border-deep-700 rounded-xl px-6 py-4">
                        <span className="font-display text-xl block mb-1" style={{ color: matchType2Data?.categoryColor }}>
                          {matchType2}
                        </span>
                        <span className="text-sm text-mystical-200">{matchType2Data?.nickname}</span>
                      </div>
                    ) : (
                      <div className="bg-deep-950 border border-deep-700 border-dashed rounded-xl px-6 py-4 text-deep-600">
                        <span className="text-sm">选择人格B</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleMatch}
                  disabled={!matchType1 || !matchType2}
                  className="w-full mt-6 bg-mystical-600 hover:bg-mystical-500 disabled:bg-deep-800 disabled:text-deep-500 text-white font-medium py-3.5 rounded-lg transition-all whitespace-nowrap"
                >
                  开始分析
                </button>
              </div>
            </div>

            {matchResult && matchType1Data && matchType2Data && (
              <div className="space-y-6 animate-fadeIn">
                {/* Score */}
                <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="font-display text-2xl" style={{ color: matchType1Data.categoryColor }}>{matchType1Data.code}</span>
                    <span className="text-mystical-400 text-xl">×</span>
                    <span className="font-display text-2xl" style={{ color: matchType2Data.categoryColor }}>{matchType2Data.code}</span>
                  </div>
                  <h2 className="font-display text-xl md:text-2xl text-mystical-100 mb-1">
                    {matchType1Data.nickname} × {matchType2Data.nickname}
                  </h2>

                  <div className="relative inline-flex items-center justify-center w-32 h-32 my-6">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#1a1625" strokeWidth="6" />
                      <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="url(#gradMbti)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${matchResult.score * 2.83} 283`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradMbti" x1="0%" y1="0%" x2="100%" y2="0%">
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

                {/* Relationship Analysis */}
                <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8">
                  <h3 className="font-display text-lg text-mystical-200 mb-4">关系分析</h3>
                  <p className="text-deep-300 text-sm leading-relaxed">{matchResult.relationshipDesc()}</p>
                </div>

                {/* Dimension Comparison */}
                <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 md:p-8">
                  <h3 className="font-display text-lg text-mystical-200 mb-4 text-center">维度对比</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {matchType1Data.code.split("").map((letter, idx) => {
                      const dimName = ["外向/内向", "实感/直觉", "思考/情感", "判断/感知"][idx];
                      const match = letter === matchType2Data.code.split("")[idx] ? "一致" : "互补";
                      return (
                        <div key={idx} className="bg-deep-950 border border-deep-800 rounded-lg p-4 text-center">
                          <p className="text-deep-500 text-xs mb-2">{dimName}</p>
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-display text-lg" style={{ color: matchType1Data.categoryColor }}>{letter}</span>
                            <span className="text-deep-600 text-xs">
                              {match === "一致" ? "=" : "≠"}
                            </span>
                            <span className="font-display text-lg" style={{ color: matchType2Data.categoryColor }}>{matchType2Data.code.split("")[idx]}</span>
                          </div>
                          <span className={`text-xs ${match === "一致" ? "text-green-400/80" : "text-orange-400/80"}`}>
                            {match}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Advice */}
                <div className="bg-deep-900/50 border border-deep-800 rounded-xl p-6">
                  <h3 className="font-display text-lg text-mystical-200 mb-4">相处建议</h3>
                  <div className="space-y-3">
                    <p className="text-deep-300 text-sm leading-relaxed">
                      <span className="text-mystical-400 font-medium">沟通方式：</span>
                      {matchType1Data.code[2] === matchType2Data.code[2]
                        ? "你们在决策方式上相似，沟通时能够迅速理解对方的逻辑。注意保持开放的心态，避免各自固执己见。"
                        : "你们在决策方式上有所不同，一方偏重逻辑，一方偏重感受。沟通时需要多一些耐心，学会欣赏彼此不同的思维方式。"}
                    </p>
                    <p className="text-deep-300 text-sm leading-relaxed">
                      <span className="text-mystical-400 font-medium">相处模式：</span>
                      {matchType1Data.code[3] === matchType2Data.code[3]
                        ? "你们在生活节奏上步调一致，无论是计划周全还是随性灵活，都能协调得很好。"
                        : "你们在生活节奏上存在差异，一方喜欢规划，一方享受即兴。找到彼此都能接受的中间地带，是关系稳固的关键。"}
                    </p>
                    <p className="text-deep-300 text-sm leading-relaxed">
                      <span className="text-mystical-400 font-medium">总体评价：</span>
                      {matchResult.score >= 80
                        ? "这是一段非常有潜力的关系，双方在多个维度上有着天然的吸引力和默契，值得用心经营。"
                        : matchResult.score >= 70
                        ? "这是一段需要双方共同努力的关系，差异带来挑战也带来成长，理解和包容是最重要的基石。"
                        : "这是一段充满学习机会的关系，虽然挑战较多，但每一段关系都有其独特的意义和价值。"}
                    </p>
                  </div>
                </div>

                <SpiritualRecommendation
                  kind="relationship"
                  title="人格匹配关系灵饰"
                  note="人格匹配结果适合推荐粉晶、红螺寺姻缘和消磁护理，让关系建议有一个可执行的承接。"
                />

                <button
                  onClick={() => { setMatchType1(null); setMatchType2(null); setMatchResult(null); }}
                  className="w-full bg-deep-800 hover:bg-deep-700 text-deep-300 py-3 rounded-lg transition-all text-sm whitespace-nowrap"
                >
                  重新选择
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== 十六人格 Tab ==================== */}
        {tab === "types" && (
          <div className="animate-fadeIn">
            {/* Categories */}
            {["分析家", "外交家", "守护者", "探险家"].map((cat) => {
              const catTypes = mbtiTypes.filter((t) => t.category === cat);
              const catColor = catTypes[0].categoryColor;
              const catIcons: Record<string, string> = {
                "分析家": "🔬",
                "外交家": "🤝",
                "守护者": "🛡️",
                "探险家": "🗺️",
              };
              const catDescs: Record<string, string> = {
                "分析家": "理性至上，追求知识与真理，思维敏锐而深邃",
                "外交家": "温暖共情，追求意义与连接，情感丰富而细腻",
                "守护者": "务实可靠，追求秩序与传统，行动稳重而坚定",
                "探险家": "自由洒脱，追求体验与感官，生活灵动而精彩",
              };
              return (
                <div key={cat} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{catIcons[cat] || ""}</span>
                    <div>
                      <h2 className="font-display text-xl text-mystical-200">{cat}</h2>
                      <p className="text-deep-500 text-xs">{catDescs[cat] || ""}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {catTypes.map((t) => (
                      <div
                        key={t.code}
                        className="bg-deep-900/50 border border-deep-800 rounded-xl p-5 hover:border-mystical-500/30 transition-all group"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className="font-display text-lg px-2 py-0.5 rounded-md"
                            style={{ color: catColor, backgroundColor: catColor + "15" }}
                          >
                            {t.code}
                          </span>
                          <span className="text-mystical-200 font-medium text-sm">{t.nickname}</span>
                        </div>
                        <p className="text-deep-400 text-xs leading-relaxed mb-3">{t.desc}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {t.strengths.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded text-xs"
                              style={{ color: catColor, backgroundColor: catColor + "10", borderColor: catColor + "20" }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";

const divinationCards = [
  {
    title: "易经八字",
    subtitle: "Bazi & I Ching",
    desc: "输入生辰八字，推演个人命理与八字合婚",
    path: "/bazi",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v20M2 12h20" />
        <path d="M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
      </svg>
    ),
  },
  {
    title: "星座运势",
    subtitle: "Horoscope",
    desc: "探索十二星座，解读星象密码与星座配对",
    path: "/horoscope",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "塔罗占卜",
    subtitle: "Tarot Reading",
    desc: "抽取命运之牌，洞察未来趋势与感情指引",
    path: "/tarot",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="5" width="7" height="14" rx="1" />
        <rect x="14" y="5" width="7" height="14" rx="1" />
        <path d="M6.5 8l.5 3M17.5 8l-.5 3M6 15.5l1 1M18 15.5l-1 1" />
      </svg>
    ),
  },
  {
    title: "MBTI人格",
    subtitle: "Myers-Briggs",
    desc: "十六型人格测试，探索真我性格与匹配关系",
    path: "/mbti",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2h-2" />
        <path d="M9 3a2 2 0 002 2h2a2 2 0 002-2M9 3a2 2 0 012-2h2a2 2 0 012 2" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    title: "潮汕掷圣杯",
    subtitle: "Moon Blocks",
    desc: "输入一件心事，掷出圣杯、笑杯或阴杯，听取此刻应答",
    path: "/moon-blocks",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.5">
        <path d="M7.4 5.5c3.2.3 5.6 3.6 5.1 7.2-.5 3.8-3.6 6.3-6.7 5.1-2.5-1-3.2-4.3-1.6-7.7 1-2.2 1.4-3.4 3.2-4.6z" />
        <path d="M16.6 5.5c-3.2.3-5.6 3.6-5.1 7.2.5 3.8 3.6 6.3 6.7 5.1 2.5-1 3.2-4.3 1.6-7.7-1-2.2-1.4-3.4-3.2-4.6z" />
        <path d="M8.2 9.3c-.8.8-1.2 1.9-1.1 3.2M15.8 9.3c.8.8 1.2 1.9 1.1 3.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

const magicCards = [
  {
    title: "白魔法",
    subtitle: "White Magic",
    desc: "净化守护、吸引显化、疗愈能量、月相仪式，以爱与光明为核心的魔法仪式教程",
    path: "/white-magic",
    accent: "from-amber-100/10 to-amber-100/5",
    border: "border-amber-100/20",
    hoverBorder: "border-amber-100/40",
    textColor: "text-amber-100/70",
    glowColor: "bg-amber-100/5",
    tag: "Light",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "黑魔法",
    subtitle: "Black Magic",
    desc: "驱散断绝、影子修行、逆转反弹、黑暗守护，直面阴影、保护自我的暗影魔法教程",
    path: "/black-magic",
    accent: "from-red-900/10 to-red-900/5",
    border: "border-red-800/20",
    hoverBorder: "border-red-700/40",
    textColor: "text-red-300/60",
    glowColor: "bg-red-900/5",
    tag: "Shadow",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path d="M9 12c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
        <path d="M12 12l3-3" strokeLinecap="round" />
      </svg>
    ),
  },
];

const shopCards = [
  {
    title: "寺庙祈愿珠串",
    subtitle: "Temple Bracelets",
    desc: "雍和宫香灰平安、灵隐寺有钱花与十八籽、红螺寺姻缘、五台山文殊智慧串",
    path: "/shop",
    tag: "东方",
  },
  {
    title: "水晶消磁护理",
    subtitle: "Crystal Care",
    desc: "粉晶关系修复、紫水晶直觉清醒、黄水晶行动招财、白水晶消磁净化套装",
    path: "/shop",
    tag: "西方",
  },
];

export default function Home() {
  const [hoveredDiv, setHoveredDiv] = useState<number | null>(null);
  const [hoveredMagic, setHoveredMagic] = useState<number | null>(null);
  const [hoveredShop, setHoveredShop] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-deep-950 text-mystical-100 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #e9b870 1px, transparent 1px),
                            radial-gradient(circle at 75% 75%, #e9b870 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Floating orbs */}
      <div className="absolute top-20 left-[10%] hidden h-64 w-64 rounded-full bg-mystical-500/5 blur-3xl sm:block" />
      <div className="absolute bottom-20 right-[10%] hidden h-80 w-80 rounded-full bg-mystical-400/5 blur-3xl sm:block" />
      <div className="absolute top-[60%] left-[40%] hidden h-96 w-96 rounded-full bg-red-900/[0.03] blur-3xl sm:block" />

      <div className="relative z-10 flex min-h-screen flex-col items-center px-3 py-7 sm:px-4 sm:py-12 md:py-16">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-14 md:mb-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-mystical-500/20 bg-mystical-500/5 px-3 py-1.5 text-[11px] tracking-widest text-mystical-300 sm:mb-6 sm:px-4 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-mystical-400 animate-pulse" />
            东方智慧 · 西方玄学
          </div>
          <h1 className="mb-3 font-display text-4xl tracking-wide text-mystical-100 sm:text-5xl md:text-6xl lg:text-7xl">
            命运罗盘
          </h1>
          <p className="mx-auto max-w-[18rem] text-sm leading-relaxed text-deep-300 sm:max-w-md md:text-base">
            融汇东方命理与西方占星塔罗，<br />
            为你揭示命运的面纱
          </p>
        </div>

        {/* ——— DIVINATION SECTION ——— */}
        <div className="mb-8 w-full max-w-6xl sm:mb-12">
          <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
            <div className="flex-1 h-px bg-deep-800/60" />
            <span className="text-deep-500 text-xs tracking-[0.25em] uppercase whitespace-nowrap">占卜命理</span>
            <div className="flex-1 h-px bg-deep-800/60" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
            {divinationCards.map((card, index) => (
              <Link
                key={card.title}
                to={card.path}
                className="group relative"
                onMouseEnter={() => setHoveredDiv(index)}
                onMouseLeave={() => setHoveredDiv(null)}
              >
                <div className={`
                  relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer
                  ${hoveredDiv === index
                    ? "border-mystical-500/40 bg-deep-900/80 scale-[1.02]"
                    : "border-deep-800/60 bg-deep-900/40"
                  }
                `}>
                  {hoveredDiv === index && (
                    <div className="absolute inset-0 bg-gradient-to-br from-mystical-500/10 via-transparent to-mystical-400/5" />
                  )}
                  <div className="relative flex min-h-[188px] flex-col items-center p-4 text-center sm:min-h-[220px] sm:p-6 md:p-8">
                    <div className={`
                      mb-3 h-10 w-10 text-mystical-400 transition-all duration-500 sm:mb-4 sm:h-12 sm:w-12 md:h-14 md:w-14
                      ${hoveredDiv === index ? "scale-110 text-mystical-300" : ""}
                    `}>
                      {card.icon}
                    </div>
                    <h2 className="mb-0.5 font-display text-lg text-mystical-100 sm:text-xl md:text-2xl">{card.title}</h2>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-deep-400 sm:mb-3 sm:text-xs sm:tracking-[0.2em]">{card.subtitle}</p>
                    <div className="mb-2 h-px w-8 bg-mystical-500/30 sm:mb-3 sm:w-10" />
                    <p className="text-xs leading-relaxed text-deep-300">{card.desc}</p>
                    <div className={`
                      mt-auto pt-3 flex items-center gap-1 text-mystical-400 text-xs transition-all duration-300
                      ${hoveredDiv === index ? "translate-x-1 opacity-100" : "opacity-60"}
                    `}>
                      <span>开始探索</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ——— SHOP SECTION ——— */}
        <div className="mb-8 w-full max-w-6xl sm:mb-12">
          <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
            <div className="flex-1 h-px bg-deep-800/60" />
            <span className="text-deep-500 text-xs tracking-[0.25em] uppercase whitespace-nowrap">命理灵饰</span>
            <div className="flex-1 h-px bg-deep-800/60" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {shopCards.map((card, index) => (
              <Link
                key={card.title}
                to={card.path}
                className="group relative"
                onMouseEnter={() => setHoveredShop(index)}
                onMouseLeave={() => setHoveredShop(null)}
              >
                <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br from-deep-900/80 to-emerald-950/20 transition-all duration-500 ${
                  hoveredShop === index ? "border-mystical-500/40 scale-[1.015]" : "border-emerald-700/30"
                }`}>
                  {hoveredShop === index && <div className="absolute inset-0 bg-gradient-to-br from-mystical-500/10 via-transparent to-emerald-500/5" />}
                  <div className="relative p-4 sm:p-6 md:p-8">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-xl text-mystical-100 md:text-2xl">{card.title}</h2>
                        <p className="mt-1 text-xs uppercase tracking-[0.15em] text-mystical-400/70">{card.subtitle}</p>
                      </div>
                      <span className="rounded border border-mystical-500/20 px-2 py-1 text-xs text-mystical-300">{card.tag}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-deep-300">{card.desc}</p>
                    <div className={`mt-4 flex items-center gap-1 text-xs text-mystical-400 transition-all duration-300 ${
                      hoveredShop === index ? "translate-x-1 opacity-100" : "opacity-60"
                    }`}>
                      <span>去定制</span>
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ——— MAGIC SECTION ——— */}
        <div className="w-full max-w-6xl">
          <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
            <div className="flex-1 h-px bg-deep-800/60" />
            <span className="text-deep-500 text-xs tracking-[0.25em] uppercase whitespace-nowrap">魔法秘术</span>
            <div className="flex-1 h-px bg-deep-800/60" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {magicCards.map((card, index) => (
              <Link
                key={card.title}
                to={card.path}
                className="group relative"
                onMouseEnter={() => setHoveredMagic(index)}
                onMouseLeave={() => setHoveredMagic(null)}
              >
                <div className={`
                  relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer
                  ${hoveredMagic === index
                    ? `${card.hoverBorder} scale-[1.015]`
                    : `${card.border}`
                  }
                  bg-deep-900/40
                `}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} transition-opacity duration-500 ${hoveredMagic === index ? "opacity-100" : "opacity-50"}`} />

                  <div className="relative flex items-center gap-4 p-4 sm:gap-6 sm:p-6 md:p-8">
                    <div className={`
                      h-11 w-11 flex-shrink-0 transition-all duration-500 sm:h-14 sm:w-14 ${card.textColor}
                      ${hoveredMagic === index ? "scale-110" : ""}
                    `}>
                      {card.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-xl text-mystical-100 md:text-2xl">{card.title}</h2>
                        <span className={`rounded border px-2 py-0.5 text-xs ${card.border} ${card.textColor}`}>
                          {card.tag}
                        </span>
                      </div>
                      <p className={`mb-2 text-xs uppercase tracking-[0.15em] ${card.textColor}`}>{card.subtitle}</p>
                      <p className="text-xs leading-relaxed text-deep-300">{card.desc}</p>
                    </div>

                    <div className={`flex-shrink-0 transition-all duration-300 ${card.textColor} ${hoveredMagic === index ? "translate-x-1 opacity-100" : "opacity-50"
                    }`}>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 text-center sm:pt-12">
          <p className="text-deep-600 text-xs">
            本程序仅供娱乐参考，请理性看待命运解读
          </p>
        </div>
      </div>
    </div>
  );
}

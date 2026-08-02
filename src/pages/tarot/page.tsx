import { Link } from "react-router-dom";
import { useState, useCallback } from "react";
import { SpiritualRecommendation } from "../../components/SpiritualRecommendation";

const tarotCards = [
  { id: 0, name: "愚者", en: "The Fool", keywords: ["新开始", "冒险", "纯真"], desc: "愚者代表新的开始和无限可能。你正站在人生的十字路口，充满勇气和好奇心。放下顾虑，追随内心的召唤，冒险将带来意想不到的收获。", love: "感情上有全新的可能，不要畏惧未知的开始，勇敢去爱。单身者将遇到意料之外的缘分；恋爱中的人，关系将进入新的阶段。" },
  { id: 1, name: "魔术师", en: "The Magician", keywords: ["创造力", "意志力", "显化"], desc: "魔术师象征你有实现目标所需的所有资源和能力。现在是采取行动的最佳时机，将你的意愿转化为现实，相信自己的能力。", love: "你拥有创造美好爱情的一切条件，主动表达心意，你的魅力正处于巅峰。这是一个适合表白或求婚的时机。" },
  { id: 2, name: "女祭司", en: "The High Priestess", keywords: ["直觉", "神秘", "内在智慧"], desc: "女祭司提醒你倾听内心的声音。表面之下隐藏着更深的真相，直觉将指引你找到答案。保持静默，让智慧自然浮现。", love: "感情中需要相信自己的直觉。也许有些真相尚未浮出水面，不要急于行动，静观其变。暗恋中的人，对方可能也在默默关注你。" },
  { id: 3, name: "皇后", en: "The Empress", keywords: ["丰饶", "滋养", "创造力"], desc: "皇后代表丰盛和母性的能量。你的生活将收获成果，无论是物质还是情感。珍惜并滋养你所拥有的，感恩会带来更多丰盛。", love: "这是一段充满滋养与温暖的感情，你们能够彼此给予安全感和支持。适合孕育新的计划，无论是共同生活还是组建家庭。" },
  { id: 4, name: "皇帝", en: "The Emperor", keywords: ["权威", "结构", "控制"], desc: "皇帝象征秩序和稳定。现在是建立坚实基础的时候，用理性和纪律来实现目标。掌握局面，你有能力建立持久的成就。", love: "感情需要稳定和承诺，不要逃避责任。成熟的态度会让伴侣更加信赖你。这是一个适合确立关系或共同规划未来的时刻。" },
  { id: 5, name: "教皇", en: "The Hierophant", keywords: ["传统", "信仰", "教导"], desc: "教皇代表传统价值观和精神指引。你可能需要遵循既定的规则或向有经验的人寻求建议。尊重传统，从中汲取智慧。", love: "传统价值观在感情中扮演重要角色，婚姻和家庭的力量不可忽视。听取长辈的建议，传统的仪式和承诺会给关系带来更深的意义。" },
  { id: 6, name: "恋人", en: "The Lovers", keywords: ["爱情", "选择", "和谐"], desc: "恋人象征重要的关系和抉择。这是一个关乎价值观的十字路口，用心而非仅仅用头脑做决定。真爱和和谐在等待着你。", love: "这是一张关于爱情的终极卡牌，预示深刻的情感联结和重要的抉择。无论单身还是恋爱中，真挚的感情即将来临或升华。" },
  { id: 7, name: "战车", en: "The Chariot", keywords: ["决心", "胜利", "前进"], desc: "战车代表意志力和成功。你拥有克服障碍的力量，只要保持专注和决心。勇往直前，胜利就在前方等待着你。", love: "主动追求自己的感情目标，不要被外界的阻碍吓退。只要坚定信念，就能克服感情路上的一切困难。" },
  { id: 8, name: "力量", en: "Strength", keywords: ["勇气", "耐心", "内在力量"], desc: "力量象征内在的勇气而非外在的力量。用温柔和耐心而非暴力来应对挑战。你比自己想象的更强大，相信内心的力量。", love: "用温柔和耐心经营感情，而不是控制和强求。真正的力量来自包容与理解，这样的爱情才能历久弥新。" },
  { id: 9, name: "隐者", en: "The Hermit", keywords: ["内省", "独处", "寻找"], desc: "隐者建议你暂时退后，寻求内心的指引。有时候孤独是成长的必经之路，在寂静中你会找到真正的答案。", love: "感情中你需要一段独处的时间来厘清思绪。不要急于投入或做出决定，先了解自己真正想要的是什么。" },
  { id: 10, name: "命运之轮", en: "Wheel of Fortune", keywords: ["变化", "命运", "周期"], desc: "命运之轮提醒你变化是生活的常态。好运正在转向你，顺应潮流而非抗拒。相信宇宙的安排，一切都会是最好的安排。", love: "感情运势正在转变，无论是好是坏都是暂时的。顺势而为，命运会带来意想不到的缘分或转机。" },
  { id: 11, name: "正义", en: "Justice", keywords: ["公正", "平衡", "因果"], desc: "正义代表因果和平衡。你的行为将带来相应的结果，保持诚实和公正。面对真相，做出公平的决定，长远来看会得到回报。", love: "感情中需要诚实和公平的态度。隐瞒和欺骗终将暴露，只有坦诚相待，才能建立真正稳固的关系。" },
  { id: 12, name: "倒吊人", en: "The Hanged Man", keywords: ["牺牲", "新视角", "等待"], desc: "倒吊人建议你换一个角度看问题。有时候暂停和放手反而是前进。牺牲短期利益，你将获得更深层次的洞察。", love: "感情中你可能需要放下执着，换个角度看待问题。暂时的等待或妥协，可能换来更深刻的理解和更牢固的关系。" },
  { id: 13, name: "死神", en: "Death", keywords: ["转变", "结束", "新生"], desc: "死神并非字面意义的死亡，而是转变的象征。旧的事物必须结束，新的才能开始。拥抱变化，放下不再服务于你的东西。", love: "一段感情的结束意味着新的开始。不要害怕放手，只有结束不再适合的关系，才能迎来真正的幸福。" },
  { id: 14, name: "节制", en: "Temperance", keywords: ["平衡", "调和", "耐心"], desc: "节制代表中庸之道和内在的平衡。不要走极端，寻找和谐的方式来融合对立的元素。耐心和节制会带来最好的结果。", love: "感情需要平衡与节制，不要过于热情也不要过于冷淡。寻找双方的共同点，在差异中创造和谐。" },
  { id: 15, name: "恶魔", en: "The Devil", keywords: ["束缚", "欲望", "物质"], desc: "恶魔提醒你检查自己是否被某种执念或习惯束缚。这些枷锁可能并非如你所想的那么牢固。觉醒吧，你有力量打破束缚。", love: "你可能被不健康的感情模式所束缚，或是过于执着于一段不适合的关系。觉醒吧，你有力量选择自由与真正值得的爱。" },
  { id: 16, name: "塔", en: "The Tower", keywords: ["突变", "觉醒", "崩塌"], desc: "塔象征突然的改变和真相的揭露。看似灾难的事件其实是觉醒的契机。旧结构倒塌后，更稳固的基础将建立起来。", love: "感情中可能经历突如其来的变化或冲突，但这些都是为了让真相浮出水面。经历风雨后，关系要么更坚固，要么释放彼此。" },
  { id: 17, name: "星星", en: "The Star", keywords: ["希望", "灵感", "宁静"], desc: "星星带来希望和疗愈的能量。经过动荡之后，平静和灵感重新降临。相信你的梦想，保持信心，宇宙正在为你运作。", love: "感情充满希望与疗愈的力量，过去的伤痛正在愈合。保持对爱情的信念，美好的缘分正在向你靠近。" },
  { id: 18, name: "月亮", en: "The Moon", keywords: ["幻觉", "潜意识", "不安"], desc: "月亮暗示事情并非表面所见。潜意识中隐藏着恐惧和不确定性。面对内心的阴影，不要被表象迷惑，真相终将大白。", love: "感情中存在误解或不清晰的因素，不要被表象迷惑。坦诚沟通，揭开迷雾，才能看清彼此的真实心意。" },
  { id: 19, name: "太阳", en: "The Sun", keywords: ["成功", "喜悦", "活力"], desc: "太阳是最积极的牌之一，代表成功和快乐。你的能量高涨，一切都向着最好的方向发展。享受生活，分享你的光芒。", love: "感情阳光普照，充满快乐与活力。这是一段幸福的关系，无论是新恋情还是现有关系，都将迎来最灿烂的时刻。" },
  { id: 20, name: "审判", en: "Judgement", keywords: ["重生", "觉醒", "召唤"], desc: "审判象征觉醒和重生。你将听到内心的召唤，过去的经历得到升华。这是新生的时刻，拥抱改变，活出真正的自己。", love: "一段旧情可能迎来转机，或你将对自己在感情中的需求有全新的认识。听从内心的召唤，做出真正适合自己的选择。" },
  { id: 21, name: "世界", en: "The World", keywords: ["完成", "圆满", "成就"], desc: "世界代表一个周期的圆满完成。你即将达成重要的目标，收获应得的成果。庆祝你的成就，同时准备迎接新的旅程。", love: "一段感情达到圆满的阶段，无论是修成正果还是各自成长，这都是一个完整的循环。感恩经历，迎接新的开始。" },
];

const spreads = [
  { name: "单张牌", count: 1, desc: "快速指引", labels: ["指引"], isLove: false },
  { name: "三张牌", count: 3, desc: "过去·现在·未来", labels: ["过去", "现在", "未来"], isLove: false },
  { name: "五张牌", count: 5, desc: "深度解读", labels: ["现状", "挑战", "过去", "未来", "建议"], isLove: false },
  { name: "感情塔罗", count: 4, desc: "爱情专属", labels: ["现状", "对方", "阻碍", "建议"], isLove: true },
];

export default function Tarot() {
  const [selectedSpread, setSelectedSpread] = useState(spreads[1]);
  const [drawnCards, setDrawnCards] = useState<typeof tarotCards>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);

  const drawCards = useCallback(() => {
    setIsShuffling(true);
    setRevealed([]);
    setDrawnCards([]);

    setTimeout(() => {
      const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
      setDrawnCards(shuffled.slice(0, selectedSpread.count));
      setIsShuffling(false);
    }, 1500);
  }, [selectedSpread]);

  const revealCard = (index: number) => {
    if (!revealed.includes(index)) {
      setRevealed([...revealed, index]);
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

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-deep-400 hover:text-mystical-300 transition-colors mb-8 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>

        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-5xl text-mystical-100 mb-3">塔罗占卜</h1>
          <p className="text-deep-400 text-sm">抽取命运之牌，洞察未来趋势与感情指引</p>
        </div>

        {/* Spread Selection */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {spreads.map((spread) => (
            <button
              key={spread.name}
              onClick={() => { setSelectedSpread(spread); setDrawnCards([]); setRevealed([]); }}
              className={`px-5 py-2.5 rounded-lg border text-sm transition-all whitespace-nowrap ${
                selectedSpread.name === spread.name
                  ? spread.isLove
                    ? "border-pink-500/50 bg-pink-500/10 text-pink-300"
                    : "border-mystical-500 bg-mystical-500/10 text-mystical-300"
                  : "border-deep-700 text-deep-400 hover:border-deep-600"
              }`}
            >
              {spread.name}
              <span className="block text-xs text-deep-500 mt-0.5">{spread.desc}</span>
            </button>
          ))}
        </div>

        {/* Draw Button */}
        {drawnCards.length === 0 && (
          <div className="text-center">
            <button
              onClick={drawCards}
              disabled={isShuffling}
              className={`font-medium px-12 py-4 rounded-xl transition-all text-lg whitespace-nowrap ${
                selectedSpread.isLove
                  ? "bg-pink-600 hover:bg-pink-500 disabled:bg-deep-800 text-white"
                  : "bg-mystical-600 hover:bg-mystical-500 disabled:bg-deep-800 text-white"
              }`}
            >
              {isShuffling ? "洗牌中..." : "开始抽牌"}
            </button>
            {isShuffling && (
              <div className="mt-8 flex justify-center gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-16 h-24 md:w-20 md:h-32 bg-deep-800 border border-deep-700 rounded-lg animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cards Display */}
        {drawnCards.length > 0 && !isShuffling && (
          <div className="space-y-8">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {drawnCards.map((card, index) => {
                const isRevealed = revealed.includes(index);
                return (
                  <div key={index} className="flex flex-col items-center">
                    <button
                      onClick={() => revealCard(index)}
                      className="relative w-32 h-48 md:w-40 md:h-60 rounded-xl overflow-hidden transition-all duration-500 cursor-pointer group"
                      style={{ perspective: '1000px' }}
                    >
                      <div
                        className={`relative w-full h-full transition-transform duration-700 ${
                          isRevealed ? 'rotate-y-180' : ''
                        }`}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* Card Back */}
                        <div
                          className="absolute inset-0 bg-deep-800 border-2 border-mystical-500/30 rounded-xl flex items-center justify-center backface-hidden"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <div className="w-12 h-12 border border-mystical-500/40 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-mystical-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                        </div>

                        {/* Card Front */}
                        <div
                          className="absolute inset-0 bg-deep-900 border border-mystical-500/30 rounded-xl p-3 flex flex-col items-center justify-center text-center"
                          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                          <p className="font-display text-xl text-mystical-200">{card.name}</p>
                          <p className="text-deep-500 text-xs mt-1">{card.en}</p>
                        </div>
                      </div>
                    </button>
                    <p className={`text-xs mt-2 ${selectedSpread.isLove ? 'text-pink-400' : 'text-deep-500'}`}>
                      {selectedSpread.labels[index]}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Revealed cards detail */}
            {revealed.length > 0 && (
              <div className="space-y-4">
                {revealed.map((index) => {
                  const card = drawnCards[index];
                  return (
                    <div key={`detail-${index}`} className="bg-deep-900/50 border border-deep-800 rounded-xl p-5 animate-fadeIn">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-16 rounded-lg flex items-center justify-center font-display text-lg shrink-0 ${
                          selectedSpread.isLove ? 'bg-pink-500/10 text-pink-400' : 'bg-deep-800 text-mystical-400'
                        }`}>
                          {card.id + 1}
                        </div>
                        <div>
                          <h3 className="font-display text-lg text-mystical-200 mb-1">
                            {card.name} · {selectedSpread.labels[index]}
                          </h3>
                          <div className="flex gap-2 mb-2 flex-wrap">
                            {card.keywords.map((k) => (
                              <span key={k} className={`text-xs px-2 py-0.5 rounded ${
                                selectedSpread.isLove ? 'bg-pink-500/10 text-pink-400' : 'bg-mystical-500/10 text-mystical-400'
                              }`}>
                                {k}
                              </span>
                            ))}
                          </div>
                          <p className="text-deep-300 text-sm leading-relaxed mb-2">
                            {selectedSpread.isLove ? card.love : card.desc}
                          </p>
                          {selectedSpread.isLove && (
                            <p className="text-deep-500 text-xs leading-relaxed border-t border-deep-800 pt-2 mt-2">
                              牌意：{card.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {revealed.length === drawnCards.length && (
              <div className="space-y-6">
                <SpiritualRecommendation
                  kind={selectedSpread.isLove ? "relationship" : "clarity"}
                  title={selectedSpread.isLove ? "感情塔罗对应灵饰" : "塔罗后续能量护理"}
                  note={selectedSpread.isLove ? "感情塔罗优先接粉晶、红螺寺姻缘和消磁套装。" : "塔罗适合接紫水晶直觉、清心类珠串和基础消磁护理。"}
                />
                <button
                  onClick={() => { setDrawnCards([]); setRevealed([]); }}
                  className="w-full bg-deep-800 hover:bg-deep-700 text-deep-300 py-3 px-8 rounded-lg transition-all text-sm whitespace-nowrap"
                >
                  重新抽牌
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

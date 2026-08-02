import { Link } from "react-router-dom";
import { useState } from "react";

type TabKey = "banish" | "shadow" | "reverse" | "protect-dark";

interface Ritual {
  name: string;
  level: "入门" | "进阶" | "高阶";
  duration: string;
  timing: string;
  materials: string[];
  steps: string[];
  tips: string;
  warning?: string;
}

const ritualData: Record<TabKey, { title: string; intro: string; rituals: Ritual[] }> = {
  banish: {
    title: "驱散与断绝",
    intro: "驱散魔法是黑魔法中最实用的一类，旨在切断不健康的情感连接、驱逐负面影响、告别不再为你服务的人与事。这并非攻击他人，而是一种「自我保护的断绝」——清楚划定边界，有时必须用强力手段。进行此类仪式时，务必明确你驱散的是「能量」而非具体「人物」。",
    rituals: [
      {
        name: "黑蜡烛断舍离仪式",
        level: "入门",
        duration: "30-40分钟",
        timing: "下弦月至新月期间（能量渐渐消退时）",
        materials: ["黑色蜡烛 1支", "白色细绳或棉线 1段", "剪刀 1把", "意向纸 1张", "海盐 适量", "黑碧玺或黑曜石（可选）"],
        steps: [
          "在安静私密的空间中点起黑色蜡烛，深呼吸调整状态，让自己完全沉浸于黑暗中的寂静。",
          "在意向纸上写下你想断绝的事物：一种模式、一段回忆、一个习惯，或是某个不再健康的关系。",
          "将白绳缠绕在意向纸上，每一个缠绕代表一条与过去的牵绊——不必克制数量。",
          "手握黑碧玺或黑曜石（如有），感受其沉重的保护能量，深吸一口气。",
          "握着剪刀，看着被绳缠绕的纸，清晰地说：「我选择切断这连线。释放我，也释放所有参与其中的能量。」",
          "一剪剪断绳索，每一下都坚定果断——这是你收回力量的具象化动作。",
          "解开的纸片立即用蜡烛点燃，放入防火容器烧尽。将灰烬与海盐混合，埋入室外土地或撒入流水。",
          "最后，吹灭蜡烛时在心里确认：「旧的已经过去，我已自由。」"
        ],
        tips: "剪刀剪断绳索的动作至关重要——它是物理层面的宣言，告诉你的潜意识你确实在切断连接。务必使用金属剪刀，金属本身也有切断能量联结的象征意义。",
        warning: "务必在情绪相对平稳时进行此仪式，不要在极度愤怒时执行。愤怒时做出的「断绝」往往伴随着后悔。"
      },
      {
        name: "黑盐结界驱逐仪式",
        level: "进阶",
        duration: "45-60分钟",
        timing: "满月之后的消散期",
        materials: ["粗海盐与木炭粉混合物（黑盐）", "黑色蜡烛 3支", "八角茴香 3颗", "黑曜石 1颗", "龙血树脂（Dragon's Blood）或乳香（可选）", "酒精灯或炭饼"],
        steps: [
          "在想要保护的空间中央，用黑盐画一个足够你坐在里面的圆形结界，从东开始顺时针画。",
          "三角阵型摆放三支黑色蜡烛在圆外，形成守护三角——三在神秘学中是最稳定的数字。",
          "在圆内点燃乳香或龙血树脂，让浓密的烟雾在圆内环绕，龙血是黑魔法中最强力的净化与保护材料。",
          "端正坐于圆内，手握黑曜石，闭眼观想一切不属于你的负面能量正在被黑盐从你的气场中「拔出」。",
          "在脑中清晰地说出你正在驱逐的究竟是什么——越具体越好。例如，不是「坏能量」而是「来自某段经历的羞耻感」。",
          "想象你被一圈金色的光包围，黑盐中升起灰色烟雾，将所有你需要驱逐的能量吸入盐中。",
          "结束时，吹灭蜡烛，对仪式空间表示感谢。黑盐留在原地至少24小时，然后扫起埋入远离房屋的土地中。"
        ],
        tips: "黑盐（Black Salt）是黑魔法中最基础也最强大的工具之一，由海盐与木炭、灰烬混合制成。它能吸收和中和负面能量，常用于结界和治疗黑魔法后遗症的净化。",
        warning: "黑盐吸收了大量能量后已达'饱和'状态，严禁重复使用或放入室内。务必埋入户外，远离水源和作物。"
      },
    ]
  },
  shadow: {
    title: "影子修行",
    intro: "影子修行（Shadow Work）是荣格心理学与黑魔法实践的交汇点。它不涉及对他人的任何操作，而是一场彻底的「自我对话」——面对那些被压抑、被否认、被藏匿在内心阴影中的部分。我们每个人都有影子，而直视它、理解它、整合它，是真正的力量之源。这不是黑暗的沉沦，而是从黑暗中的崛起。",
    rituals: [
      {
        name: "镜子对话 · 面对影子自我",
        level: "入门",
        duration: "30-60分钟",
        timing: "深夜，独处时",
        materials: ["镜子 1面（越大越好）", "黑色蜡烛 1支", "日记本和笔", "耐心和勇气"],
        steps: [
          "在一个不会被干扰的深夜，调暗灯光，只留一支黑色蜡烛的光照亮你和镜子。",
          "坐在镜子前，凝视自己的眼睛。是的，凝视——不要回避，不要看别处。",
          "当不舒适感升起时（它一定会），不要逃避。注意你脑海中浮现的每一个负面想法、每一个自我批判。",
          "用纸笔如实记录这些声音，不加评判地写：「是的，我听到了。」这是影子的语言。",
          "每写完一条，对着镜子说：「我承认你的存在。你不必再躲藏。你是被看见的。」",
          "当影子已经充分表达自己后，问自己：这些声音最早是什么时候开始出现的？是谁让你相信自己不够好？",
          "对着镜子说出你现在想对自己说的话，可以是：「我接纳完整的自己，包括所有的不完美。」",
          "结束后吹灭蜡烛，洗一把冷水脸，让自己回到现实。喝一杯温水，写下你从这次对话中学到了什么。"
        ],
        tips: "影子修行不是一次性的活动。你会在过程中感到不适、眼泪、甚至愤怒——这些都是愈合的信号。第一次可能只持续15分钟，没关系，重点是你开始了。建议每周进行一次。",
        warning: "如果你正在经历严重的抑郁或心理创伤，请在心理咨询师的陪伴下进行此项练习，或暂时跳过本仪式。安全永远第一。"
      },
      {
        name: "黑色冥想 · 拥抱暗面",
        level: "进阶",
        duration: "40分钟",
        timing: "深夜，新月之夜最佳",
        materials: ["全黑空间（遮光窗帘、眼罩）", "黑色蜡烛 1支", "舒适的坐垫", "日记本"],
        steps: [
          "创造一个完全黑暗的环境——关闭所有灯光、拉上窗帘、戴上眼罩。你是安全的，黑暗只是光明的另一种形态。",
          "在黑暗中点燃唯一一支黑色蜡烛。让它成为你在黑暗中的锚点。",
          "盘腿坐在坐垫上，专注于一支蜡烛的光。让你的呼吸变慢变深，腹式呼吸。",
          "现在，闭上眼睛取消外界视觉。在内在视野中，想象你站在一片广袤的黑色森林中。有月光，但树木投下深沉的阴影。",
          "邀请你的「影子」出现——它可能是一个人形、动物、一团雾或是某种感觉。不强迫它必须是什么样子，允许它自行显现。",
          "和你的影子对话：「你想告诉我什么？」「你需要什么？」「我怎么忽略了你的存在？」安静倾听，不做辩解。",
          "当对话自然结束时，感谢影子的出现和它分享的智慧。观想你与影子慢慢融合——不是消灭它，而是拥抱它，让它成为你的一部分。",
          "睁开眼睛，吹灭蜡烛。在被黑暗拥抱过的空间中感受全新的平静。写下你的对话内容，这可能是你做过最有深度的自我探索。"
        ],
        tips: "黑魔法中最高深的力量不在外在世界，而在你的内在阴影中。被压抑的情感和想法往往是最强大的能量来源，当你整合它们而非排斥它们时，你就获得了真正的力量。"
      }
    ]
  },
  reverse: {
    title: "逆转与反弹",
    intro: "逆转魔法用于解开已施加的负面魔法、破坏他人对你施加的不良意图、或是将恶意能量原路反弹给其源头。此类法术需要极强的心智和意图设定，因为逆转的前提是你确信有负能量正被指向你，而非想象中的被害妄想。保持冷静和公正的判断是进行此类仪式的前提。",
    rituals: [
      {
        name: "镜子反弹咒",
        level: "进阶",
        duration: "40分钟",
        timing: "满月之夜",
        materials: ["小圆镜 1面", "黑色蜡烛 1支", "红色蜡烛 1支", "迷迭香 1把", "黑线", "意向纸"],
        steps: [
          "在满月之夜（满月力量最强），为自己创造一个绝对的私人空间。",
          "用黑线绕镜子边缘三圈，每绕一圈说一次：「反射与我，此界为盾。」",
          "在意向纸上写下你怀疑正指向你的负面来源或形式——「他人的嫉妒」「被施加的恶意言论」等。",
          "将意向纸贴在镜子背面（反光面朝外），然后将镜子放在你的主入口处（前门内或外）。",
          "点燃红色和黑色蜡烛，红色代表你的生命力，黑色代表吸收和转化。",
          "手握迷迭香，吟诵三遍：「以镜面之力，反弹一切指向我的恶意。伤害不成，返回原处，以三倍学习。」",
          "让蜡烛燃尽，镜子保持放置在入口处至少7天，然后妥善收起。"
        ],
        tips: "镜面法术的力量在于「反射」——不是伤害对方，而是让对方的负面能量自己承受其后果。反弹时使用'三倍'（Rule of Three）是神秘学中常见的规则，表示因果加速返回。",
        warning: "反弹咒不是攻击咒——重点在'反弹'而非'加害'。如果你怀着报复心进行此仪式，你的负面能量也会反噬自己。请在心态平和时进行。"
      },
      {
        name: "净化逆转浴",
        level: "入门",
        duration: "30分钟",
        timing: "感觉被负面能量包裹的任何时候",
        materials: ["喜马拉雅粉盐 1杯", "迷迭香 3枝", "柠檬 半个（切片）", "白色蜡烛 3支", "黑曜石 1颗", "小苏打 1/4杯"],
        steps: [
          "将浴缸的水温调至温热舒适，加入粉盐、小苏打和柠檬片，让天然成分先溶解五分钟。",
          "三支白蜡烛放置于浴缸三侧，形成安全的保护三角。黑曜石放在浴缸底部一角。",
          "握迷迭香在手中，闭眼对水说：「水洗净我的身体，盐净化我的气场，柠檬驱散所有不属于我的能量。」",
          "进入浴缸，浸泡时感受水从每个毛孔中提取疲劳和他人投向你的负能量。",
          "浸泡15分钟后，从脚开始向头上方，想象灰色的水雾从皮肤上被剥离并被黑曜石吸收。",
          "出水后，放水时看着水在流走的漩涡中消失，知道那些被你释放的也一起去了。",
          "将迷迭香和柠檬片收集起来，黑曜石放在阳台上月光下净化。"
        ],
        tips: "与其他净化不同，逆转浴的重点不是'清理自己'，而是认识到有些能量不是你自己的——它们是别人投射过来的。你需要做的只是让它们回到它们来的地方，而非把它们当成自己的问题。",
      }
    ]
  },
  "protect-dark": {
    title: "黑暗守护",
    intro: "如果说白魔法的守护是「用光包围」，那么黑魔法的守护就是「与暗同行」。黑暗守护魔法不否认黑暗的存在，而是学会在黑暗中生存、运用黑暗的力量来保护自己。这类法术适合那些已经接受了影子修行的实践者——你不再害怕黑暗，因为你已经成为黑暗的一部分。",
    rituals: [
      {
        name: "暗夜护盾",
        level: "高阶",
        duration: "45分钟",
        timing: "新月之夜 · 一年中夜晚最长的那天最佳",
        materials: ["黑色布料 1块（丝绸最佳）", "红绳", "黑碧玺或黑曜石 4颗", "你的照片或私人物件", "黑色蜡烛 1支", "龙血树脂或檀香"],
        steps: [
          "在新月之夜（最暗的夜晚），在室内选择一处最终将放置此护盾的固定位置。",
          "点燃龙血树脂或檀香——龙血在黑魔法中是最佳的守护材料，檀香则用来净化空间。",
          "将黑色布料平铺在平面上，把四颗黑碧玺/黑曜石摆在布料的四个角落。",
          "在布料中央放置自己的照片或私人物件，用红绳从照片开始向外绕圈，形成蜘蛛网状。",
          "共绕七圈——七是神秘学中最具力量的数字之一。每一圈说一句你的守护誓言。",
          "将蜡烛放在一旁，让它燃完全程。冥想暗夜护盾在你周围形成一层看不见却坚固的薄膜，它吸收一切恶意却不会让你变冷。",
          "将整个包裹（布料+水晶+照片+红绳）妥善收藏在你的私人空间。每当你感到脆弱时，在手触摸这个护盾时默念你的守护誓言。"
        ],
        tips: "暗夜护盾是长期性守护工具，不需频繁激活。每月新月时可以重新触摸它以充能，就像充电一样。守护力量随时间积累而非衰减。",
        warning: "这不是攻击性法术。如果你怀着「伤害他人」或「控制他人」的心态制作此护盾，效果将适得其反。"
      },
      {
        name: "大地葬礼 · 埋葬恐惧",
        level: "入门",
        duration: "1小时（加上户外行程）",
        timing: "任何时间，白天阳光充足时",
        materials: ["你的恐惧清单 1张", "黑色蜡烛 1支", "海盐", "铁铲", "可以合法挖掘的正常土壤", "种子（你喜欢的任何一种花或植物的种子）"],
        steps: [
          "在家里先写好恐惧清单：把所有令你害怕的、不安的、阻碍你前进的东西全部列出来，不设防不删减。",
          "在黑色蜡烛的微光下，逐条读出这些恐惧——大声朗读，让它们感到「被发现」的羞耻，然后它们就会失去对你的掌控力。",
          "将清单折成一个小方块，用海盐轻轻包裹——海盐会净化和封印被写下的恐惧。",
          "带着小包裹，在白天阳光充足的时候，去到一个可以合法挖掘的户外场所。阳光是黑暗的反面，在阳光下埋藏恐惧具有极强的象征力量。",
          "挖一个不浅不深的洞（约30厘米深），将包裹放入，用土覆盖。说：「大地，我请求你转化它。喂养它，让它生出新的生命力。」",
          "在覆盖后的表面撒上你带来的种子，轻轻浇水——恐惧会腐烂，会分解成养分，会长出花。",
          "离开时不回头。象征你不再回头看向恐惧。让大自然完成剩下的转化。"
        ],
        tips: "大地葬礼是最古老的魔法之一。你交托给大地的，大地会以意想不到的方式为你转化。记得在上面撒种子——这不仅是魔法，也是你给地球的回礼，看着花长出来时你会哭的。",
        warning: "请确保在允许挖掘的地点进行此仪式。不要破坏公共草坪或他人财产。自然保护区内严禁挖掘。选择自家院子或社区花园（先征得许可）是最佳选择。"
      }
    ]
  }
};

const tabList: { key: TabKey; label: string; icon: string }[] = [
  { key: "banish", label: "驱散断绝", icon: "◈" },
  { key: "shadow", label: "影子修行", icon: "◉" },
  { key: "reverse", label: "逆转反弹", icon: "✦" },
  { key: "protect-dark", label: "黑暗守护", icon: "⬡" },
];

const levelColors: Record<string, string> = {
  "入门": "text-purple-400/80 bg-purple-400/10 border-purple-400/20",
  "进阶": "text-orange-400/80 bg-orange-400/10 border-orange-400/20",
  "高阶": "text-red-500/80 bg-red-500/10 border-red-500/20",
};

export default function BlackMagic() {
  const [activeTab, setActiveTab] = useState<TabKey>("banish");
  const [expandedRitual, setExpandedRitual] = useState<number | null>(null);
  const [warningAccepted, setWarningAccepted] = useState(false);

  const currentData = ritualData[activeTab];

  // Warning gate
  if (!warningAccepted) {
    return (
      <div className="min-h-screen bg-deep-950 text-mystical-100 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="bg-deep-900/80 border-2 border-red-800/40 rounded-2xl p-8 md:p-10 text-center">
            {/* Warning Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-900/20 border-2 border-red-700/40 flex items-center justify-center">
              <i className="ri-alert-fill text-red-400 text-2xl"></i>
            </div>

            <h1 className="font-display text-2xl md:text-3xl text-red-300 mb-2">进入黑魔法领域</h1>
            <p className="text-deep-400 text-sm mb-6 font-display">通往阴影的门扉在此</p>

            <div className="bg-deep-950/80 border border-red-900/30 rounded-xl p-5 mb-6 text-left space-y-3">
              <p className="text-red-300/80 text-sm font-medium">⚠ 进入前请确认以下事项：</p>
              <ul className="space-y-2">
                {[
                  "我已满18岁，具备完全的自我判断能力",
                  "我理解黑魔法教程仅供娱乐与文化教育参考",
                  "我不会将任何仪式用于伤害自己或他人",
                  "我理解魔法不能替代心理咨询、医疗和法律援助",
                  "我在进行任何仪式前会确保自身安全与合法性",
                  "我明白「不伤害」是所有魔法实践的最高准则"
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-deep-300 text-xs leading-relaxed">
                    <span className="text-red-500 flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setWarningAccepted(true)}
                className="flex-1 bg-red-900/40 hover:bg-red-900/60 border border-red-700/40 text-red-200 font-medium py-3 rounded-lg transition-all text-sm whitespace-nowrap"
              >
                我已确认，进入黑魔法
              </button>
              <Link
                to="/"
                className="flex-1 bg-deep-800 hover:bg-deep-700 border border-deep-700 text-deep-400 py-3 rounded-lg transition-all text-sm text-center whitespace-nowrap"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-950 text-mystical-100 relative">
      {/* Dark magic background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-red-900/[0.03] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-900/[0.03] blur-3xl" />
      </div>
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 70%, #4a0000 1px, transparent 1px),
                            radial-gradient(circle at 70% 30%, #1a001a 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-deep-400 hover:text-mystical-300 transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
          <button
            onClick={() => setWarningAccepted(false)}
            className="text-deep-500 hover:text-red-400/60 text-xs transition-colors"
          >
            退出黑魔法 →
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-800/30 bg-red-900/5 text-red-300/60 text-xs tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 animate-pulse" />
            Black Magic · 暗影之术
          </div>
          <h1 className="font-display text-3xl md:text-5xl text-mystical-100 mb-3">黑魔法</h1>
          <p className="text-deep-400 text-sm max-w-lg mx-auto leading-relaxed">
            直面阴影、驱散负担、保护自我——<br className="hidden md:block" />
            黑魔法并非邪恶之术，而是与暗面共处的智慧。
          </p>

          <div className="mt-6 inline-block bg-deep-900/50 border border-red-800/20 rounded-xl px-6 py-3">
            <p className="text-red-300/50 text-xs tracking-wider">黑魔法根本原则</p>
            <p className="text-mystical-200 text-sm mt-1 font-display">「认识黑暗，方知光明的珍贵」</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabList.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setExpandedRitual(null); }}
              className={`px-5 py-2.5 rounded-lg border text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === t.key
                  ? "border-red-800/30 bg-red-900/10 text-red-300/80"
                  : "border-deep-700 text-deep-400 hover:border-deep-600"
              }`}
            >
              <span className="text-xs">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {/* Section Intro */}
          <div className="bg-deep-900/50 border border-deep-800 rounded-2xl p-6 mb-6">
            <h2 className="font-display text-xl text-mystical-100 mb-3">{currentData.title}</h2>
            <p className="text-deep-300 text-sm leading-relaxed">{currentData.intro}</p>
          </div>

          {/* Ritual Cards */}
          <div className="space-y-4">
            {currentData.rituals.map((ritual, idx) => (
              <div
                key={idx}
                className="bg-deep-900/50 border border-deep-800 rounded-2xl overflow-hidden transition-all"
              >
                {/* Ritual Header */}
                <button
                  className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left cursor-pointer hover:bg-deep-900/80 transition-colors"
                  onClick={() => setExpandedRitual(expandedRitual === idx ? null : idx)}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-display text-lg text-mystical-100">{ritual.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded border ${levelColors[ritual.level]}`}>
                        {ritual.level}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-deep-500">
                      <span className="flex items-center gap-1">
                        <i className="ri-time-line"></i> {ritual.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="ri-moon-line"></i> {ritual.timing}
                      </span>
                    </div>
                  </div>
                  <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 transition-transform ${expandedRitual === idx ? "rotate-180" : ""}`}>
                    <i className="ri-arrow-down-s-line text-deep-400 text-lg"></i>
                  </div>
                </button>

                {expandedRitual === idx && (
                  <div className="px-6 pb-6 border-t border-deep-800/50 pt-5 animate-fadeIn">
                    {ritual.warning && (
                      <div className="bg-red-900/10 border border-red-800/20 rounded-lg p-3 mb-5 flex gap-2">
                        <i className="ri-alert-fill text-red-400/70 flex-shrink-0 mt-0.5"></i>
                        <p className="text-red-300/70 text-xs leading-relaxed">{ritual.warning}</p>
                      </div>
                    )}

                    {/* Materials */}
                    <div className="mb-5">
                      <h4 className="text-sm font-medium text-mystical-300 mb-3 flex items-center gap-2">
                        <i className="ri-flask-line text-red-300/50"></i>
                        所需材料
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ritual.materials.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 bg-deep-950/50 rounded-lg px-3 py-2">
                            <span className="w-1 h-1 rounded-full bg-red-400/40 flex-shrink-0" />
                            <span className="text-deep-300 text-sm">{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="mb-5">
                      <h4 className="text-sm font-medium text-mystical-300 mb-3 flex items-center gap-2">
                        <i className="ri-list-ordered text-red-300/50"></i>
                        仪式步骤
                      </h4>
                      <div className="space-y-3">
                        {ritual.steps.map((step, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="w-6 h-6 rounded-full border border-red-800/30 bg-red-900/10 flex items-center justify-center text-red-300/60 text-xs flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-deep-300 text-sm leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-deep-950/50 border border-deep-800 rounded-lg p-4">
                      <h4 className="text-xs font-medium text-red-300/60 mb-2 flex items-center gap-1.5">
                        <i className="ri-lightbulb-line"></i>
                        实践心得
                      </h4>
                      <p className="text-deep-400 text-xs leading-relaxed">{ritual.tips}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Note */}
          <div className="mt-8 bg-red-900/5 border border-red-800/20 rounded-xl p-5 text-center">
            <p className="text-deep-500 text-xs leading-relaxed">
              黑魔法的力量与使用者的心智成熟度直接相关。<br className="hidden md:block" />
              本教程仅供文化与冥想参考，请以理性与仁爱之心对待所有实践。阴影存在是为了让光明更加深刻。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
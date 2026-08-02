import { Link } from "react-router-dom";
import { useState } from "react";

type TabKey = "purify" | "attract" | "heal" | "moon";

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
  purify: {
    title: "净化与守护",
    intro: "净化是一切魔法实践的基础。通过清除负面能量、建立防护屏障，你可以为自己和空间创造一个纯净、安全的能量场。守护魔法能帮助你抵御外来的负面影响，增强个人气场。",
    rituals: [
      {
        name: "白盐净化仪式",
        level: "入门",
        duration: "15-20分钟",
        timing: "任意时间，新月前后效果最佳",
        materials: ["粗海盐或喜马拉雅粉盐 适量", "白色蜡烛 1支", "耐热容器 1个", "纯净水 1碗", "鼠尾草或薰衣草精油（可选）"],
        steps: [
          "在安静的空间中找到一个舒适的位置，深呼吸三次，让自己平静下来。",
          "点燃白色蜡烛，凝视火焰片刻，感受其温暖与光明。",
          "将海盐倒入耐热容器，心中默想：「以盐之力，驱散一切阴暗与负能量。」",
          "将纯净水缓缓倒入盐中，顺时针搅拌七圈，每圈都想象有白光从水中升起。",
          "将盐水溶液用手指轻弹或用树枝洒在房间四角，从东方开始顺时针进行。",
          "最后回到中央，双手置于心前，感谢宇宙能量的庇护，吹灭蜡烛。",
          "将剩余盐水倒在门口外侧或植物旁，形成守护结界。"
        ],
        tips: "此仪式可每月进行一次，在感到家中气氛沉闷或遭遇不顺时随时使用。盐本身具有极强的净化属性，是白魔法中最常用的工具之一。",
        warning: "请勿将含盐水倒在不耐盐的植物旁，以免伤害植物。"
      },
      {
        name: "白鼠尾草烟熏净化",
        level: "入门",
        duration: "20-30分钟",
        timing: "周日、月相变化前后",
        materials: ["白鼠尾草束 1把", "耐热贝壳或陶碗 1个", "羽毛（用于引导烟雾，可选）", "打火机或火柴", "窗户（需打开通风）"],
        steps: [
          "打开所有窗户，为负面能量提供出口。这一步非常重要，不可省略。",
          "从房间最远的角落开始，点燃白鼠尾草束，让其燃烧片刻后吹灭火焰，使其持续冒烟。",
          "手持贝壳承接灰烬，将烟雾引导到空间的每一个角落，尤其是门后、橱柜角落、卫浴空间。",
          "引导烟雾时，心中默念或轻声说：「我以光明净化这个空间，一切负能量离开，只留下爱与和平。」",
          "绕行整个空间后，最后在自己身前引导烟雾，净化自身气场。",
          "将鼠尾草放在贝壳中熄灭，感谢植物精灵的帮助，窗户可在净化完成10分钟后关闭。"
        ],
        tips: "鼠尾草的香气具有抗菌和净化空气的科学依据，同时在神秘学传统中被认为能消除负面能量。每个新月前进行此仪式，配合月相能量效果更佳。",
        warning: "注意防火安全，有哮喘或呼吸道疾病者请谨慎使用烟熏法，可改用鼠尾草精油喷雾替代。"
      },
      {
        name: "镜面守护魔法阵",
        level: "进阶",
        duration: "40-60分钟",
        timing: "满月之夜效果最强",
        materials: ["小圆镜 4面（或镜面纸裁切成圆形）", "黑色电气胶带", "白色蜡烛 4支", "迷迭香 一把", "海盐 适量", "意向纸 1张"],
        steps: [
          "在满月前一晚，于房间中央清出一片空间，用海盐画出一个圆形结界。",
          "在圆圈的东南西北四个方位各放置一支白色蜡烛，代表四个元素方向。",
          "将4面小镜子反光面朝外摆放在圆圈内圈，形成一个「反射盾」。",
          "在意向纸上写下你想守护的人和事，将其折叠三次，放在圆圈中心。",
          "顺时针点燃四支蜡烛，每点一支说：「光护东方（南/西/北），守护我的家园。」",
          "将迷迭香撒在镜子周围，迷迭香代表记忆与保护。",
          "静坐在圆圈外，观想一道白色光墙从镜子升起，形成无形的保护罩，覆盖你的整个住所。",
          "冥想15分钟后，逆时针熄灭蜡烛，将镜子放置于家中四个角落。"
        ],
        tips: "镜面在魔法传统中是强大的守护工具，具有反射负能量的作用。放置于家中四角的小镜子可长期保留，形成持久的守护网格。",
      },
    ]
  },
  attract: {
    title: "吸引与显化",
    intro: "吸引魔法运用宇宙的「同频共振」法则，帮助你将心之所想化为现实。无论是爱情、财富还是机遇，通过强烈的意图设定和仪式化的行动，你可以向宇宙传递清晰的信号，吸引你所渴望的一切。",
    rituals: [
      {
        name: "玫瑰爱情吸引仪式",
        level: "入门",
        duration: "30分钟",
        timing: "周五（金星之日），新月至满月期间",
        materials: ["粉色或红色玫瑰 3朵", "粉色蜡烛 1支", "玫瑰精油 数滴", "蜂蜜 1小匙", "红色丝带 1段", "意向纸 1张"],
        steps: [
          "在周五傍晚，为自己准备一个安静美丽的空间，点上粉色蜡烛。",
          "在意向纸上，用玫瑰精油蘸取写下你理想伴侣的特质（不要写具体某人的名字，而是写品质）。",
          "将玫瑰花瓣摘下，轻轻围绕蜡烛摆成一个心形。",
          "将蜂蜜轻轻涂抹在意向纸的边缘，同时说：「甜蜜如蜜，爱如磁铁，将爱吸引到我的生命中。」",
          "将意向纸卷成筒状，用红色丝带绑紧，绑三个结，每个结时说：「我值得被爱。」",
          "将丝带卷放在蜡烛旁，观想自己与理想伴侣相遇的场景，越具体越好。",
          "等蜡烛燃尽后，将意向纸卷保存在枕头下，持续七天。七天后将其埋入土中或放在流水边。"
        ],
        tips: "吸引爱情的关键不是执着于特定对象，而是明确自己真正需要什么。写出品质而非名字，能帮助宇宙以最好的方式回应你的意图。",
        warning: "请勿对特定的他人施加爱情魔法，这违反了「不伤害任何人」的白魔法原则，会影响他人的自由意志。"
      },
      {
        name: "财富显化月光浴",
        level: "入门",
        duration: "满月之夜 1小时",
        timing: "每月满月之夜",
        materials: ["绿色或金色蜡烛 1支", "肉桂粉 少许", "绿色或金色晶石（绿幽灵、黄水晶）", "满月月光", "意向日记本 1本", "金色笔 1支"],
        steps: [
          "在满月当晚，将绿色/金色晶石放在窗台上，让其在月光下净化充能至少30分钟。",
          "在日记本上写下「财富意向宣言」：以现在时态、第一人称写下你已经拥有所渴望丰盛的状态。",
          "点燃绿色蜡烛，在烛台底部撒上少量肉桂粉（肉桂是招财的神圣香料）。",
          "手握充好能量的晶石，朗读你的财富宣言三遍，每次都增加你的情感投入。",
          "闭上眼睛，进入感恩冥想：感谢你生命中已经拥有的一切，在感恩中打开接收财富的通道。",
          "将晶石放在你工作的地方或钱包里，每次看到它时，都重温财富已在来路上的感受。"
        ],
        tips: "显化的核心是「感受已经拥有」的状态，而非渴望和匮乏感。月光具有强大的净化和充能属性，满月是显化最佳时机。",
      },
      {
        name: "意图蜡烛显化仪式",
        level: "进阶",
        duration: "7天持续仪式",
        timing: "新月开始，持续到满月",
        materials: ["白色柱状蜡烛 1支", "雕刻工具（牙签、小刀）", "与意图对应的精油（成功用肉桂，爱情用玫瑰，健康用薰衣草）", "对应颜色的丝带", "意向卡片 1张"],
        steps: [
          "在新月当天，用雕刻工具在蜡烛上刻下你的意图关键词或符文，例如「成功」「爱」「健康」。",
          "从蜡烛顶端向下涂抹精油（代表吸引能量向你流动），涂抹时不断观想意图实现的画面。",
          "在意向卡片上详细写下你的意图，包括时间线和感受，将其放在蜡烛下。",
          "每天在同一时间点燃蜡烛，每次燃烧约20-30分钟，进行意图冥想。",
          "每次点蜡烛时，复述你的意图，并加入一句：「以宇宙最高意志，成就我的意图。」",
          "在满月当天，让蜡烛完全燃尽，象征意图已完全释放至宇宙。",
          "将意向卡片保存，定期翻阅并更新你的感恩记录。"
        ],
        tips: "七天仪式的坚持本身就是一种强大的意图设定。每天的重复强化了信念和振动频率，使显化更加有力。",
      }
    ]
  },
  heal: {
    title: "疗愈能量",
    intro: "疗愈魔法旨在恢复身心灵的平衡与和谐。通过能量工作、水晶疗愈和疗愈仪式，你可以处理情感创伤、驱散焦虑与恐惧、重建内心的平静。疗愈首先从自我开始，当你疗愈了自己，你也会向周围辐射疗愈能量。",
    rituals: [
      {
        name: "水晶能量疗愈布阵",
        level: "进阶",
        duration: "45分钟",
        timing: "随时，情绪低落或身体疲惫时",
        materials: ["透明水晶（净化）1颗", "玫瑰石英（心轮）1颗", "紫水晶（平静）1颗", "黑碧玺（接地）1颗", "瑜伽垫或毯子 1张", "薰衣草精油或熏香"],
        steps: [
          "先将所有水晶用盐水或月光净化充能，确保水晶携带纯净能量。",
          "在安静的空间铺好瑜伽垫，点上薰衣草熏香，调暗灯光。",
          "平躺在垫子上，深呼吸调整状态，感受脊椎与地面的接触，建立接地感。",
          "将黑碧玺放在脚底附近，帮助接地与稳定。",
          "将玫瑰石英放在胸口（心轮位置），感受其粉色温暖能量流入心脏。",
          "将紫水晶放在额头（第三眼），帮助安抚思绪和直觉连接。",
          "将透明水晶握在双手中，或放在头顶，作为能量放大器和净化通道。",
          "闭上眼睛，观想一道白色或金色的光从透明水晶流入，沿着脊椎向下流动，点亮每一个脉轮，最后从脚底流入大地。",
          "保持这个姿势至少20分钟，允许疗愈能量自然流动。起身时请缓慢，先活动手指脚趾再坐起。"
        ],
        tips: "水晶的摆放对应人体脉轮系统，每种水晶携带不同的振动频率。此布阵特别适合深度疲劳、情感创伤后的恢复期使用。",
        warning: "水晶疗愈是辅助性的能量练习，不能替代正规医疗。身体不适请及时就医。"
      },
      {
        name: "情感创伤释放仪式",
        level: "入门",
        duration: "30-40分钟",
        timing: "满月前后，释放能量最强",
        materials: ["黑色蜡烛 1支（代表需要释放的事物）", "白色蜡烛 1支（代表新生）", "纸 1张", "防火碗 1个", "玫瑰花瓣 适量", "薰衣草精油"],
        steps: [
          "在满月前夜，为自己创造一个神圣的疗愈空间，撒上玫瑰花瓣，点上薰衣草熏香。",
          "在纸上写下你想要释放的情感：伤痛、愤怒、恐惧、遗憾——写得越具体越好，不要压抑。",
          "允许自己感受这些情绪，可以哭泣，这是疗愈的一部分，不需要逃避。",
          "点燃黑色蜡烛，将写有情绪的纸对折，说：「我承认这些情绪真实存在。」",
          "用蜡烛点燃纸张，将其放入防火碗中燃尽，观想这些情绪随烟雾化解消散。",
          "立刻点燃白色蜡烛，说：「释放之后，我充满爱与光明。疗愈现在开始。」",
          "手握玫瑰石英（如果有），感受心轮的温暖，对自己说三次：「我值得被疗愈，我正在被疗愈。」",
          "在白蜡烛旁静坐，进行深呼吸冥想，直到感到平静为止。"
        ],
        tips: "情感释放仪式最重要的是「真实感受」，不是表演。这个过程可能会让你哭泣或感到轻松，两种都是正常的疗愈反应。定期进行情感清理，有助于保持能量通畅。",
      },
      {
        name: "蜂蜜疗愈浴",
        level: "入门",
        duration: "1小时",
        timing: "周日（太阳之日），情绪低落时",
        materials: ["生蜂蜜 3大匙", "玫瑰花瓣（新鲜或干燥均可）", "薰衣草精油 5滴", "喜马拉雅粉盐 1杯", "甜杏仁油或椰子油 适量", "白色蜡烛 数支"],
        steps: [
          "在浴缸周围摆放白色蜡烛，调暗灯光，创造宁静的疗愈氛围。",
          "在浴缸中加入温热水，将喜马拉雅粉盐倒入，顺时针搅拌溶解，净化水的能量。",
          "将蜂蜜、玫瑰花瓣和薰衣草精油加入水中，再次顺时针搅拌，同时说：「以甜蜜和温柔疗愈我。」",
          "进入浴缸前，先闭眼深呼吸，设定意图：「这次浴是一次神圣的自我疗愈仪式。」",
          "在水中至少浸泡20分钟，感受温热的水托住你，观想所有疲惫和负能量从皮肤中渗出，被盐水带走。",
          "用杏仁油或椰子油轻轻按摩身体，从脚开始向上，代表从接地向上引导疗愈能量。",
          "放水时，观想所有你释放的事物随水流走，感谢水元素的疗愈力量。",
          "浴后，穿上干净舒适的衣物，饮用温热的甘菊茶或蜂蜜水，完成疗愈循环。"
        ],
        tips: "水在几乎所有文化的神秘传统中都具有净化和疗愈属性。盐水浴既有实际的矿物质补充效果，也有能量层面的净化作用，是最温柔有效的自我疗愈仪式之一。",
      }
    ]
  },
  moon: {
    title: "月相仪式",
    intro: "月亮是白魔法中最重要的天体盟友。月相的变化对应着宇宙能量的涨落，精通月相仪式能让你的魔法与宇宙节律同步，事半功倍。每个月相都有其独特的能量属性和最适合进行的魔法类型。",
    rituals: [
      {
        name: "新月意图设定仪式",
        level: "入门",
        duration: "30分钟",
        timing: "每月新月当天或前后24小时",
        materials: ["黑色或深蓝色蜡烛 1支", "意向日记本 1本", "黑色或蓝色笔", "月桂叶 3片", "防火容器 1个"],
        steps: [
          "新月代表全新开始，是种下意图种子的最佳时机。在黑暗中感受新月能量。",
          "点燃深蓝色蜡烛，象征无限可能的宇宙空间。",
          "在日记本上写下这个月相周期（28天内）你希望实现或开始的意图，可以是3-5个。",
          "在每片月桂叶上写下最重要的关键词，月桂叶是实现意图的神圣植物。",
          "用蜡烛点燃月桂叶，放入防火容器，烟雾升起时说：「我的意图已向宇宙传递，我开放地接收最好的回应。」",
          "将日记本放在枕边，在接下来的28天里，每当看到与意图相关的信号时，记录下来。",
          "整个周期结束时，翻阅记录，庆祝已实现的部分，温和地放下未实现的，调整方向。"
        ],
        tips: "新月仪式的核心是「开放性意图」而非执着。种下种子后，要信任宇宙的时机和方式，并采取实际行动配合意图的实现。",
      },
      {
        name: "满月充能净化大仪式",
        level: "进阶",
        duration: "1-2小时",
        timing: "每月满月当天夜晚",
        materials: ["白色蜡烛 7支", "需要充能的水晶和工具", "一碗清水（用于制作月光水）", "白花（白色花朵）数朵", "镜子 1面", "日记本"],
        steps: [
          "在满月夜，将需要净化充能的水晶和魔法工具摆放在窗台或户外能被月光照射的地方。",
          "在碗中倒入清水，放置于月光下，制作神圣的月光水（至少需要在月光下放置2-3小时）。",
          "室内摆放7支白蜡烛围成一个圆圈，代表满月的完满能量。",
          "在镜子前静坐，凝视自己的眼睛，进行自我认可冥想：「我认可自己的每一个部分，我是完整的。」",
          "在日记本上写下这个月相周期内你感恩的事、你成长的部分，以及你选择温柔放下的事。",
          "在圆圈中央跳舞（即使是非常简单的身体律动）——身体的表达是强大的能量释放方式。",
          "拿出在月光下充能的水晶，感受其能量；将月光水装入小瓶，可用于未来的仪式或每天早晨喷在脸上。",
          "熄灭蜡烛前，说：「我感谢这个周期带给我的一切，我满月充能，准备好进入下一个循环。」"
        ],
        tips: "满月是力量最强大的时刻，同时也是最好的释放时机。让自己在满月时间做一些平时不敢做的小事——满月能量支持你突破自我限制。",
      },
      {
        name: "上弦月行动加速仪式",
        level: "入门",
        duration: "20分钟",
        timing: "每月上弦月（新月后7天）",
        materials: ["橙色或黄色蜡烛 1支", "咖啡豆或肉桂棒（加速象征）", "行动清单 1张", "红色笔"],
        steps: [
          "上弦月代表月亮从新到满的中间点，能量正在上升积聚，是推进计划的绝佳时机。",
          "点燃橙色蜡烛（代表行动力和创造力），将咖啡豆或肉桂棒放在蜡烛旁。",
          "用红色笔（代表行动力）写下你在新月时设定的意图，以及需要采取的具体行动步骤。",
          "每写下一个行动步骤，都说：「我有能力采取行动，宇宙支持我的努力。」",
          "将行动清单折叠，放在口袋或包中，作为随身的能量提醒。",
          "在接下来的7天（上弦月到满月），每完成一个步骤就在清单上划掉，这是对宇宙的感谢。"
        ],
        tips: "魔法加上行动才能真正改变现实。上弦月是最好的「推一把」时机，当你感到拖延或需要动力时，进行此仪式能帮助激活内在的行动力。",
      },
      {
        name: "下弦月放下与休整仪式",
        level: "入门",
        duration: "30分钟",
        timing: "每月下弦月（满月后7天）",
        materials: ["黑色或深紫色蜡烛 1支", "薰衣草精油或茶", "需要放下的事物清单 1张", "防火容器"],
        steps: [
          "下弦月代表月亮从满到新的中间点，能量开始消退，是处理过去和释放的时机。",
          "沏一杯薰衣草茶，在点燃深色蜡烛的光线下静坐，允许自己放慢速度。",
          "写下你在这个月相周期中想要放下的事：习惯、想法、关系、期望——写出来就是放手的开始。",
          "慢慢读出清单上的每一项，每读一项就深呼吸：吸入新鲜空气，呼出被读到的事物。",
          "将清单点燃烧掉，同时说：「我温柔地放下这一切，感谢它们曾经的意义，允许它们离开。」",
          "饮用薰衣草茶，让自己在仪式后好好休息，下弦月是能量补充的最佳时机。"
        ],
        tips: "放下不等于失败，而是为新的可能创造空间。下弦月仪式教我们「有节律地放手」，这是白魔法中最具智慧的能量管理方式。",
      }
    ]
  }
};

const tabList: { key: TabKey; label: string; icon: string }[] = [
  { key: "purify", label: "净化守护", icon: "✦" },
  { key: "attract", label: "吸引显化", icon: "◈" },
  { key: "heal", label: "疗愈能量", icon: "❧" },
  { key: "moon", label: "月相仪式", icon: "◯" },
];

const levelColors: Record<string, string> = {
  "入门": "text-green-400/80 bg-green-400/10 border-green-400/20",
  "进阶": "text-yellow-400/80 bg-yellow-400/10 border-yellow-400/20",
  "高阶": "text-red-400/80 bg-red-400/10 border-red-400/20",
};

export default function WhiteMagic() {
  const [activeTab, setActiveTab] = useState<TabKey>("purify");
  const [expandedRitual, setExpandedRitual] = useState<number | null>(null);

  const currentData = ritualData[activeTab];

  return (
    <div className="min-h-screen bg-deep-950 text-mystical-100 relative">
      {/* White magic background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-white/[0.02] blur-3xl" />
        <div className="absolute top-40 right-[5%] w-64 h-64 rounded-full bg-amber-100/[0.03] blur-3xl" />
      </div>
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #fffde7 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-deep-400 hover:text-mystical-300 transition-colors mb-8 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-100/20 bg-amber-100/5 text-amber-100/60 text-xs tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-100/60 animate-pulse" />
            White Magic · 光明之术
          </div>
          <h1 className="font-display text-3xl md:text-5xl text-mystical-100 mb-3">白魔法</h1>
          <p className="text-deep-400 text-sm max-w-lg mx-auto leading-relaxed">
            白魔法以爱、光明与善意为核心，通过仪式与意图的力量，<br className="hidden md:block" />
            在不伤害任何人的前提下，创造正向的改变。
          </p>

          {/* Core Principle */}
          <div className="mt-6 inline-block bg-deep-900/50 border border-amber-100/10 rounded-xl px-6 py-3">
            <p className="text-amber-100/50 text-xs tracking-wider">白魔法黄金法则</p>
            <p className="text-mystical-200 text-sm mt-1 font-display">「以爱行事，无害于人」</p>
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
                  ? "border-amber-100/30 bg-amber-100/5 text-amber-100/80"
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

                {/* Expanded Content */}
                {expandedRitual === idx && (
                  <div className="px-6 pb-6 border-t border-deep-800/50 pt-5 animate-fadeIn">
                    {/* Warning */}
                    {ritual.warning && (
                      <div className="bg-amber-400/5 border border-amber-400/20 rounded-lg p-3 mb-5 flex gap-2">
                        <i className="ri-alert-line text-amber-400/70 flex-shrink-0 mt-0.5"></i>
                        <p className="text-amber-400/70 text-xs leading-relaxed">{ritual.warning}</p>
                      </div>
                    )}

                    {/* Materials */}
                    <div className="mb-5">
                      <h4 className="text-sm font-medium text-mystical-300 mb-3 flex items-center gap-2">
                        <i className="ri-flask-line text-amber-100/50"></i>
                        所需材料
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ritual.materials.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 bg-deep-950/50 rounded-lg px-3 py-2">
                            <span className="w-1 h-1 rounded-full bg-amber-100/40 flex-shrink-0" />
                            <span className="text-deep-300 text-sm">{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="mb-5">
                      <h4 className="text-sm font-medium text-mystical-300 mb-3 flex items-center gap-2">
                        <i className="ri-list-ordered text-amber-100/50"></i>
                        仪式步骤
                      </h4>
                      <div className="space-y-3">
                        {ritual.steps.map((step, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="w-6 h-6 rounded-full border border-amber-100/20 bg-amber-100/5 flex items-center justify-center text-amber-100/60 text-xs flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-deep-300 text-sm leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-deep-950/50 border border-deep-800 rounded-lg p-4">
                      <h4 className="text-xs font-medium text-amber-100/60 mb-2 flex items-center gap-1.5">
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
          <div className="mt-8 bg-deep-900/30 border border-deep-800/50 rounded-xl p-5 text-center">
            <p className="text-deep-500 text-xs leading-relaxed">
              白魔法仪式需要纯净的意图和平静的心态。初学者建议从入门级仪式开始，<br className="hidden md:block" />
              随着实践深入再逐步尝试进阶和高阶内容。本教程仅供娱乐与冥想参考。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
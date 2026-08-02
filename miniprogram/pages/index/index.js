Page({
  data: {
    divinations: [
      { title: "易经八字", en: "Bazi & I Ching", desc: "生辰四柱、五行格局、合婚关系", url: "/pages/bazi/bazi", icon: "◎" },
      { title: "星座运势", en: "Horoscope", desc: "十二星座、今日能量、星座配对", url: "/pages/horoscope/horoscope", icon: "✦" },
      { title: "塔罗占卜", en: "Tarot Reading", desc: "抽取命运之牌，洞察当下问题", url: "/pages/tarot/tarot", icon: "▣" },
      { title: "MBTI人格", en: "Myers-Briggs", desc: "十六型人格测试与匹配分析", url: "/pages/mbti/mbti", icon: "◇" },
      { title: "潮汕掷圣杯", en: "Moon Blocks", desc: "输入一件心事，掷出此刻应答", url: "/pages/moon-blocks/moon-blocks", icon: "◐" }
    ],
    magic: [
      { title: "白魔法", en: "White Magic", desc: "净化守护、吸引显化、疗愈能量、月相仪式", type: "white", tag: "Light" },
      { title: "黑魔法", en: "Black Magic", desc: "断舍离、影子修行、逆转净化、边界守护", type: "black", tag: "Shadow" }
    ],
    shop: [
      { title: "寺庙祈愿灵饰", en: "Temple Blessing", desc: "雍和宫香灰/瓷珠、灵隐寺十八籽/有钱花、红螺寺观音类、五台山文殊类", mode: "goods", tag: "成品售卖" },
      { title: "自选珠子定制", en: "Custom Beads", desc: "按所求选择主珠、配珠、吊坠和颗数，设置手围后自动报价", mode: "custom", tag: "自由组合" }
    ]
  },
  go(e) {
    wx.navigateTo({ url: e.currentTarget.dataset.url });
  },
  goMagic(e) {
    wx.navigateTo({ url: `/pages/magic/magic?type=${e.currentTarget.dataset.type}` });
  },
  goShop() {
    wx.switchTab({ url: "/pages/shop/shop" });
  }
});

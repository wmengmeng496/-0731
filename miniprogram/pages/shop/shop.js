const { request } = require("../../utils/api");

Page({
  data: {
    tab: "goods",
    wristOptions: ["14cm", "15cm", "16cm", "17cm", "18cm"],
    products: [],
    filteredProducts: [],
    temples: [],
    prayerTypes: ["全部"],
    beads: [],
    selectedTemple: 0,
    selectedPrayer: "全部",
    wristIndex: 2,
    consecrated: false,
    quote: null,
    order: null,
    wecomQr: "/assets/wecom-qr.png",
    shipping: {
      receiver: "",
      phone: "",
      address: ""
    }
  },
  onLoad() {
    this.loadCatalog();
  },
  async loadCatalog() {
    const res = await request("/api/shop/products");
    this.setData({
      products: res.products,
      filteredProducts: res.products.filter((item) => item.templeId === res.temples[0].id),
      temples: res.temples,
      prayerTypes: res.prayerTypes,
      beads: res.beads.map((item) => ({ ...item, count: 0 })),
      selectedTemple: 0
    });
  },
  switchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab, order: null });
  },
  chooseTemple(e) {
    this.setData({ selectedTemple: Number(e.currentTarget.dataset.index) });
    this.applyFilters();
    this.updateQuote();
  },
  choosePrayer(e) {
    this.setData({ selectedPrayer: e.currentTarget.dataset.prayer });
    this.applyFilters();
  },
  applyFilters() {
    const temple = this.data.temples[this.data.selectedTemple];
    if (!temple) return;
    const filteredProducts = this.data.products.filter((item) => {
      const templeMatched = item.templeId === temple.id;
      const prayerMatched = this.data.selectedPrayer === "全部" || item.prayerTypes.includes(this.data.selectedPrayer);
      return templeMatched && prayerMatched;
    });
    this.setData({ filteredProducts });
  },
  setWrist(e) {
    this.setData({ wristIndex: Number(e.detail.value) });
    this.updateQuote();
  },
  toggleConsecrated(e) {
    this.setData({ consecrated: e.detail.value });
    this.updateQuote();
  },
  changeCount(e) {
    const id = e.currentTarget.dataset.id;
    const delta = Number(e.currentTarget.dataset.delta);
    const beads = this.data.beads.map((item) => {
      if (item.id !== id) return item;
      return { ...item, count: Math.max(0, Math.min(30, Number(item.count || 0) + delta)) };
    });
    this.setData({ beads });
    this.updateQuote();
  },
  setShipping(e) {
    this.setData({ [`shipping.${e.currentTarget.dataset.key}`]: e.detail.value });
  },
  selectedBeads() {
    return this.data.beads
      .map((item) => ({ id: item.id, count: Number(item.count || 0) }))
      .filter((item) => item.count > 0);
  },
  async updateQuote() {
    const selectedBeads = this.selectedBeads();
    if (!selectedBeads.length || !this.data.temples.length) {
      this.setData({ quote: null });
      return;
    }
    const quote = await request("/api/shop/price", {
      selectedBeads,
      wrist: this.data.wristOptions[this.data.wristIndex],
      templeId: this.data.temples[this.data.selectedTemple].id,
      consecrated: this.data.consecrated
    }, "POST");
    this.setData({ quote });
  },
  async orderProduct(e) {
    const productId = e.currentTarget.dataset.id;
    const order = await request("/api/shop/order-draft", {
      productId,
      templeId: e.currentTarget.dataset.temple,
      consecrated: this.data.consecrated,
      shipping: this.data.shipping
    }, "POST");
    this.setData({ order });
    wx.showToast({ title: "已生成咨询单", icon: "none" });
  },
  async orderCustom() {
    const selectedBeads = this.selectedBeads();
    if (!selectedBeads.length) return wx.showToast({ title: "请先选择珠子颗数", icon: "none" });
    const order = await request("/api/shop/order-draft", {
      custom: {
        selectedBeads,
        wrist: this.data.wristOptions[this.data.wristIndex],
        templeId: this.data.temples[this.data.selectedTemple].id,
        consecrated: this.data.consecrated
      },
      shipping: this.data.shipping
    }, "POST");
    this.setData({ order });
    wx.showToast({ title: "已生成咨询单", icon: "none" });
  },
  showWecomQr() {
    wx.previewImage({
      urls: [this.data.wecomQr],
      current: this.data.wecomQr
    });
  }
});

const { request } = require("../../utils/api");

Page({
  data: {
    tab: "personal",
    genderItems: ["男", "女"],
    form: { birthDate: "", birthTime: "12:00", gender: 0 },
    mate: { p1Date: "", p1Time: "12:00", p2Date: "", p2Time: "12:00" },
    result: null,
    match: null,
    loading: false
  },
  switchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab });
  },
  setForm(e) {
    this.setData({ [`form.${e.currentTarget.dataset.key}`]: e.detail.value });
  },
  setMate(e) {
    this.setData({ [`mate.${e.currentTarget.dataset.key}`]: e.detail.value });
  },
  async calculate() {
    if (!this.data.form.birthDate) return wx.showToast({ title: "请选择出生日期", icon: "none" });
    this.setData({ loading: true });
    try {
      const result = await request("/api/bazi/personal", this.data.form, "POST");
      this.setData({ result });
    } catch (error) {
      wx.showToast({ title: "请先启动后端服务", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },
  async calculateMatch() {
    const { mate } = this.data;
    if (!mate.p1Date || !mate.p2Date) return wx.showToast({ title: "请选择双方日期", icon: "none" });
    this.setData({ loading: true });
    try {
      const match = await request("/api/bazi/match", mate, "POST");
      this.setData({ match });
    } catch (error) {
      wx.showToast({ title: "请先启动后端服务", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },
  goShop() {
    wx.switchTab({ url: "/pages/shop/shop" });
  }
});

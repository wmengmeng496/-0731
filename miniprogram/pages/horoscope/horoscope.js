const { request } = require("../../utils/api");

Page({
  data: {
    signs: [],
    selected: "白羊座",
    result: null
  },
  onLoad() {
    request("/api/horoscope/signs").then((res) => this.setData({ signs: res.signs, selected: res.signs[0].name }));
  },
  choose(e) {
    this.setData({ selected: e.currentTarget.dataset.name });
    this.loadFortune(e.currentTarget.dataset.name);
  },
  loadFortune(sign) {
    request(`/api/horoscope/daily?sign=${encodeURIComponent(sign)}`).then((result) => this.setData({ result }));
  },
  goShop() {
    wx.switchTab({ url: "/pages/shop/shop" });
  }
});

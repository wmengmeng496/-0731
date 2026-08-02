const { request } = require("../../utils/api");

Page({
  data: {
    type: "white",
    tabs: [],
    active: "",
    rituals: []
  },
  onLoad(query) {
    const type = query.type || "white";
    this.setData({ type });
    request(`/api/magic?type=${type}`).then((res) => {
      this.setData({ tabs: res.tabs, active: res.tabs[0].key, rituals: res.tabs[0].rituals });
    });
  },
  switchTab(e) {
    const active = e.currentTarget.dataset.key;
    const tab = this.data.tabs.find((item) => item.key === active);
    this.setData({ active, rituals: tab.rituals });
  }
});

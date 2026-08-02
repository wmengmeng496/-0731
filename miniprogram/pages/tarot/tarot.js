const { request } = require("../../utils/api");

Page({
  data: {
    spreads: [
      { key: "single", name: "单张牌", desc: "快速指引" },
      { key: "three", name: "三张牌", desc: "过去·现在·未来" },
      { key: "love", name: "感情塔罗", desc: "爱情专属" }
    ],
    spread: "three",
    question: "",
    result: null,
    followQuestion: "",
    chatMessages: [],
    loading: false
  },
  chooseSpread(e) {
    this.setData({ spread: e.currentTarget.dataset.key, result: null, followQuestion: "", chatMessages: [] });
  },
  setQuestion(e) {
    this.setData({ question: e.detail.value });
  },
  setFollowQuestion(e) {
    this.setData({ followQuestion: e.detail.value || e.currentTarget.dataset.value || "" });
  },
  async draw() {
    this.setData({ loading: true, result: null, followQuestion: "", chatMessages: [] });
    try {
      const result = await request("/api/tarot/draw", { spread: this.data.spread, question: this.data.question }, "POST");
      this.setData({ result });
    } catch (error) {
      wx.showToast({ title: "请先启动后端服务", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },
  async askFollow() {
    const message = this.data.followQuestion.trim();
    if (!message) return wx.showToast({ title: "请输入追问内容", icon: "none" });
    if (!this.data.result) return wx.showToast({ title: "请先抽牌", icon: "none" });
    const userMessage = { role: "user", content: message };
    this.setData({
      loading: true,
      followQuestion: "",
      chatMessages: [...this.data.chatMessages, userMessage]
    });
    try {
      const answer = await request("/api/tarot/chat", {
        spread: this.data.spread,
        question: this.data.question,
        message,
        result: this.data.result,
        history: this.data.chatMessages
      }, "POST");
      this.setData({
        chatMessages: [...this.data.chatMessages, { role: "assistant", content: answer.reply, suggestions: answer.suggestions, ai: answer.ai }]
      });
    } catch (error) {
      wx.showToast({ title: "追问失败，请稍后再试", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  }
});

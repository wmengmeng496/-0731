const { request } = require("../../utils/api");

Page({
  data: {
    questions: [],
    index: 0,
    answers: [],
    result: null
  },
  onLoad() {
    request("/api/mbti/questions").then((res) => this.setData({ questions: res.questions }));
  },
  answer(e) {
    const answers = this.data.answers.concat(e.currentTarget.dataset.value === "yes");
    if (answers.length === this.data.questions.length) {
      request("/api/mbti/result", { answers }, "POST").then((result) => this.setData({ answers, result }));
      return;
    }
    this.setData({ answers, index: this.data.index + 1 });
  },
  reset() {
    this.setData({ index: 0, answers: [], result: null });
  }
});

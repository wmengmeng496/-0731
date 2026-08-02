const { request } = require("../../utils/api");

const results = [
  {
    key: "sheng",
    name: "圣杯",
    verdict: "此事可行",
    faces: ["阴", "阳"],
    ai: { used: false }
  },
  {
    key: "xiao",
    name: "笑杯",
    verdict: "时机未明",
    faces: ["阳", "阳"],
    ai: { used: false }
  },
  {
    key: "yin",
    name: "阴杯",
    verdict: "暂不宜行",
    faces: ["阴", "阴"],
    ai: { used: false }
  }
];

function tossCupFaces() {
  return [Math.random() > 0.5 ? "阳" : "阴", Math.random() > 0.5 ? "阳" : "阴"];
}

function resultFromFaces(faces) {
  if (faces[0] !== faces[1]) return { ...results[0], faces };
  if (faces[0] === "阳") return { ...results[1], faces };
  return { ...results[2], faces };
}

Page({
  data: {
    question: "",
    tossing: false,
    reading: false,
    result: null,
    faces: ["阴", "阳"]
  },
  setQuestion(e) {
    this.setData({ question: e.detail.value });
  },
  toss() {
    if (!this.data.question.trim()) {
      wx.showToast({ title: "请先输入一件事", icon: "none" });
      return;
    }
    if (this.data.tossing || this.data.reading) return;

    this.setData({ tossing: true, result: null, faces: tossCupFaces() });
    setTimeout(() => {
      const faces = tossCupFaces();
      const settled = resultFromFaces(faces);
      this.setData({ tossing: false, reading: true, result: settled, faces });
      request("/api/moon-blocks/reading", {
        question: this.data.question.trim(),
        result: settled,
        faces
      }, "POST").then((reading) => {
        this.setData({ result: { ...settled, ...reading } });
      }).catch(() => {
        this.setData({ result: { ...settled, ai: { used: false } } });
      }).finally(() => {
        this.setData({ reading: false });
      });
    }, 1500);
  },
  reset() {
    this.setData({ result: null });
  }
});

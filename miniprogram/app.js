function getApiBase() {
  const envVersion = wx.getAccountInfoSync?.().miniProgram?.envVersion || "develop";
  if (envVersion === "release") return "https://api.mingyunluopan.com";
  if (envVersion === "trial") return "https://staging-api.mingyunluopan.com";
  return "http://127.0.0.1:8787";
}

App({
  globalData: {
    apiBase: getApiBase(),
  },
});

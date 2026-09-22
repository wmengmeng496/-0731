const app = getApp();

function request(path, data = {}, method = "GET") {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBase}${path}`,
      method,
      data,
      timeout: 30000,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }
        reject(new Error(`API ${res.statusCode}`));
      },
      fail: reject
    });
  });
}

module.exports = { request };

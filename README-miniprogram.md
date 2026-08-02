# 命运罗盘小程序版

本次新增内容不会改动原 PC React 前端，微信小程序代码放在 `miniprogram/`，轻量后端接口放在 `server/`。

## 启动后端

```bash
npm run api
```

默认地址为：

```text
http://127.0.0.1:8787
```

浏览器预览地址：

```text
http://127.0.0.1:8787/preview
```

这个预览页在 `web-preview/index.html`，用于快速查看小程序移动端效果；真实微信小程序工程仍在 `miniprogram/`。

如果需要改端口：

```bash
PORT=9000 npm run api
```

同时把 `miniprogram/app.js` 里的 `apiBase` 改成对应地址。

## 配置 AI 测算 Key

后端支持通过 `.env` 配置 AI key。先复制示例文件：

```bash
cp .env.example .env
```

然后填入你的服务配置：

```text
AI_API_KEY=你的key
AI_BASE_URL=https://toapis.com/v1
AI_MODEL_KEY=default
# AI_MODEL=gpt-5.5
```

也可以接入兼容 OpenAI Chat Completions 的模型服务，只要把 `AI_BASE_URL` 和 `AI_MODEL` 换成对应平台提供的值即可。Key 只保存在后端环境变量里，小程序前端不会直接拿到 key。

模型和提示词调试文件在：

```text
server/ai-config/models.json
server/ai-config/prompts.json
```

`AI_MODEL_KEY` 对应 `models.json` 里的一级 key，例如 `default`、`fast`、`deep`、`gemini`。修改配置后重启后端生效。AI 首次响应可能较慢，小程序请求超时已预留到 65 秒。

如果不配置 `AI_API_KEY`，接口会自动使用本地模板解读，页面仍可正常使用。可用下面接口检查当前状态：

```text
GET /api/config/ai
```

## 打开小程序

1. 打开微信开发者工具。
2. 导入目录：`miniprogram/`。
3. AppID 可先使用测试号或游客模式。
4. 本地调试时已在 `project.config.json` 里关闭域名校验。

## 已包含页面

- 首页罗盘：延续原 PC 深色金色玄学风格。
- 八字：个人命盘、四柱解读、八字合婚。
- 塔罗：单张牌、三张牌、感情塔罗。
- 星座：十二星座今日运势与幸运指南。
- MBTI：移动端测试流程与结果页。
- 魔法秘术：白魔法/黑魔法内容栏目。
- 命理灵饰：首页售卖入口、命盘/星座结果页转化建议、寺庙风格成品、自由组合定制、发货订单。
- 我的：登录、记录、服务规划占位。

## 后端接口

- `POST /api/bazi/personal`
- `POST /api/bazi/match`
- `POST /api/tarot/draw`
- `GET /api/config/ai`
- `GET /api/horoscope/signs`
- `GET /api/horoscope/daily?sign=白羊座`
- `GET /api/mbti/questions`
- `POST /api/mbti/result`
- `GET /api/magic?type=white`
- `GET /api/shop/products`
- `POST /api/shop/recommend`
- `POST /api/shop/price`
- `POST /api/shop/order-draft`

当前后端已经有基础业务层：未配置 AI key 时使用本地模板；配置 AI key 后，八字个人命盘、八字合婚、塔罗抽牌会走后端 AI 增强生成，并保留本地回退。后续可以继续接数据库、用户系统、支付订单和后台发货。

## 灵饰售卖模块

当前售卖逻辑分为四层：

- 首页提供灵饰售卖入口。
- 八字/星座结果页提供“破解 / 转化建议”，只做珠子方向建议，引导进入定制。
- 成品售卖按寺庙主题和所求类型组织：雍和宫香灰串/珠光瓷珠宫廷款、灵隐寺十八籽/有钱花、红螺寺观音姻缘/求子、五台山文殊智慧。
- 自由组合定制支持选择主珠、配珠、隔珠、吊坠配件、颗数、手围，并按珠子单价、穿串工费、手围工费、开光/加持服务计算总价。

当前珠子/配件库包含香灰琉璃珠、十八籽菩提珠、观音吊坠配件、文殊牌配件、南红玛瑙、粉晶、黑曜石、青金石、檀木、平安扣。订单接口已返回发货订单结构，后续可继续接微信支付、地址管理、库存扣减、物流单号和后台发货。

雍和宫商品已拆成两条线：香灰平安串和珠光瓷珠宫廷款。瓷珠线包含粉瓷、灰瓷、黑瓷、古银莲花配件，支持 12mm/14mm 规格、颜色微调和来图定制。

灵隐寺商品已按“十八籽 / 多宝菩提”真实货盘重做：基础款可走低门槛引流价，SKU 包含一代天意金刚无雕款、灵隐款、普陀款、弘法款、一代天意红金刚无雕款；定制珠子包含天意金刚菩提、红金刚菩提、星月菩提、莲花菩提等。

灵隐寺求财线已补充“有钱花莲花手串”：按寺庙=灵隐寺、所求=求财/财运/转运筛选；SKU 包含天然绿檀款、水草玛瑙款、手链款、指扣链款；定制珠子包含有钱花莲花主珠、天然绿檀珠、水草玛瑙等。

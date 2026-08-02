# AI 配置说明

这个目录用于调试测算模型和提示词。

## 切换模型

在 `.env` 里修改：

```text
AI_MODEL_KEY=default
```

可选值来自 `models.json` 的一级 key，例如 `default`、`fast`、`deep`。

也可以临时覆盖具体模型：

```text
AI_MODEL=gpt-4o-mini
AI_BASE_URL=https://toapis.com/v1
```

## 调工作流和提示词

优先修改 `workflows.json`。每个一级 key 是一个测算工作流，里面包含：

- `route`：当前接口或预留接口
- `workflow`：模型生成前的业务步骤
- `prompt.system`：底层系统提示词
- `prompt.task`：本次任务描述
- `prompt.outputShape`：要求模型输出的 JSON 结构
- `debugPayload`：本地调试时可直接复制的样例入参

后端会优先读取 `workflows.json` 里同名工作流的 `prompt`；如果没有，再回退到 `prompts.json`。

当前已放入：

- `baziPersonal`：个人八字命盘
- `baziMatch`：八字合婚
- `tarotDraw`：塔罗抽牌
- `tarotChat`：塔罗追问
- `moonBlocksReading`：圣杯问事
- `horoscopeDaily`：星座日运预留工作流

也可以继续修改旧的 `prompts.json`：

- `baziPersonal`：个人八字命盘
- `baziMatch`：八字合婚
- `tarotDraw`：塔罗抽牌

修改后重启后端：

```bash
npm run api
```

Key 只放 `.env`，不要写进这里。

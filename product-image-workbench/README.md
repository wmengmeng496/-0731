# 商品图素材生成工作台

这个文件夹用于先调试商品图素材，不会自动接入线上商品页。

## 文件说明

- `products.catalog.json`：从 `src/data/spiritual-products.ts` 抽取出来的商品库快照。
- `image-style.config.json`：统一商品图风格配置，可以直接改这里的风格、构图、禁忌项。
- `generate-image-prompts.mjs`：读取商品库和风格配置，生成每个商品的图片提示词。
- `generated/prompts.json`：机器可读的提示词清单。
- `generated/prompts.md`：方便人工查看和复制的提示词清单。
- `generate-with-openai-images.mjs`：可选的批量生成脚本，需要你本地提供 `OPENAI_API_KEY`。
- `outputs/`：批量生成后的图片默认输出目录。

## 常用命令

只生成/刷新提示词和商品快照：

```bash
node product-image-workbench/generate-image-prompts.mjs
```

只生成前 2 张图片做测试：

```bash
OPENAI_API_KEY=你的key IMAGE_LIMIT=2 node product-image-workbench/generate-with-openai-images.mjs
```

生成指定商品：

```bash
OPENAI_API_KEY=你的key IMAGE_IDS=yonghe-incense-peace,lingyin-money-lotus node product-image-workbench/generate-with-openai-images.mjs
```

## 调试建议

先改 `image-style.config.json`，再运行 `generate-image-prompts.mjs` 看提示词是否顺眼。确认提示词后，再少量生成图片，不建议一口气生成全部。

中文标注建议后期用前端或设计工具叠字。图片模型生成中文小字容易错字，所以默认提示词要求“无文字、无水印、留白给后期标注”。

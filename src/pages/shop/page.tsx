import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { spiritualProducts, type ProductTradition, type SpiritualProduct } from "../../data/spiritual-products";
import { WecomQrModal } from "../../components/WecomQrModal";
import { ProductPoster } from "../../components/ProductPoster";

const tabs: Array<{ key: ProductTradition | "all"; label: string; desc: string }> = [
  { key: "all", label: "全部", desc: "寺庙珠串与水晶消磁" },
  { key: "eastern", label: "寺庙珠串", desc: "雍和宫、灵隐寺、红螺寺、五台山" },
  { key: "western", label: "水晶消磁", desc: "粉晶、紫水晶、黄水晶与净化护理" },
];

function ProductVisual({ product }: { product: SpiritualProduct }) {
  return <ProductPoster product={product} />;
}

export default function Shop() {
  const [tab, setTab] = useState<ProductTradition | "all">("all");
  const [intention, setIntention] = useState("全部");
  const [qrProductName, setQrProductName] = useState<string | null>(null);

  const intentions = useMemo(() => {
    const values = spiritualProducts.flatMap((item) => item.intention);
    return ["全部", ...Array.from(new Set(values))];
  }, []);

  const products = spiritualProducts.filter((item) => {
    const tabMatched = tab === "all" || item.tradition === tab;
    const intentionMatched = intention === "全部" || item.intention.includes(intention);
    return tabMatched && intentionMatched;
  });

  return (
    <div className="min-h-screen bg-deep-950 text-mystical-100 relative">
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, #e9b870 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-deep-400 hover:text-mystical-300 transition-colors mb-8 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>

        <div className="mb-10">
          <p className="text-mystical-400 text-xs tracking-[0.25em] uppercase mb-3">Spiritual Goods</p>
          <h1 className="font-display text-3xl md:text-5xl text-mystical-100 mb-3">灵饰推荐与定制</h1>
          <p className="text-deep-400 text-sm leading-relaxed max-w-2xl">
            按命盘、塔罗、星座和所求挑选寺庙珠串与水晶护理。暂不接线上支付，点击商品下方入口扫码添加企微，人工确认款式、手围、开光和发货细节。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`rounded-xl border p-4 text-left transition-all ${
                tab === item.key
                  ? "border-mystical-500/50 bg-mystical-500/10"
                  : "border-deep-800 bg-deep-900/40 hover:border-mystical-500/25"
              }`}
            >
              <span className="font-display text-lg text-mystical-100">{item.label}</span>
              <span className="block text-deep-400 text-xs mt-1">{item.desc}</span>
            </button>
          ))}
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {intentions.map((item) => (
            <button
              key={item}
              onClick={() => setIntention(item)}
              className={`px-3 py-2 rounded-full border text-xs whitespace-nowrap transition-colors ${
                intention === item
                  ? "border-mystical-500 bg-mystical-500/10 text-mystical-300"
                  : "border-deep-800 text-deep-400 hover:border-deep-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((product) => (
            <article key={product.id} className="bg-deep-900/50 border border-deep-800 rounded-2xl p-4">
              <ProductVisual product={product} />

              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-deep-500 text-xs mb-1">{product.source} · {product.form}</p>
                  <h2 className="font-display text-xl text-mystical-100">{product.name}</h2>
                </div>
                <div className="shrink-0 text-right">
                  {product.originalPrice ? <p className="text-xs text-deep-600 line-through">¥{product.originalPrice}</p> : null}
                  <span className="text-mystical-300 font-display">¥{product.price}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="mt-4 flex items-center gap-2">
                  {product.palette.map((color) => (
                    <span key={color} className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>

              <p className="text-deep-300 text-sm leading-relaxed mb-4">{product.summary}</p>

              <div className="mb-4">
                <p className="text-deep-500 text-xs mb-2">材料组合</p>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material) => (
                    <span key={material} className="px-2 py-1 rounded-full bg-deep-950 border border-deep-800 text-deep-300 text-xs">
                      {material}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {product.intention.map((tag) => (
                  <span key={tag} className="px-2 py-1 rounded-full bg-mystical-500/10 text-mystical-300 text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {product.sellingPoints?.length ? (
                <div className="mb-4">
                  <p className="text-deep-500 text-xs mb-2">核心卖点</p>
                  <div className="space-y-1.5">
                    {product.sellingPoints.slice(0, 3).map((point) => (
                      <p key={point} className="text-deep-300 text-xs leading-relaxed">· {point}</p>
                    ))}
                  </div>
                </div>
              ) : null}

              {product.skuOptions?.length ? (
                <div className="mb-4 rounded-lg border border-deep-800 bg-deep-950/45 p-3">
                  <p className="text-deep-500 text-xs mb-2">可选规格</p>
                  <div className="space-y-2">
                    {product.skuOptions.slice(0, 3).map((sku) => (
                      <div key={sku.name} className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-deep-300">{sku.name}</span>
                        <span className="font-display text-mystical-300">¥{sku.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {product.supplyPrice ? (
                <p className="mb-4 rounded-full border border-mystical-500/20 bg-mystical-500/10 px-3 py-1.5 text-xs text-mystical-300">
                  供应参考 ¥{product.supplyPrice} 起 · 支持现货/礼盒/净化包装
                </p>
              ) : null}

              <p className="text-deep-500 text-xs leading-relaxed border-t border-deep-800 pt-4">{product.care}</p>
              {product.consultPrompt ? (
                <p className="mt-3 rounded-lg bg-deep-950/60 px-3 py-2 text-xs leading-relaxed text-deep-300">
                  咨询话术：{product.consultPrompt}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setQrProductName(product.name)}
                className="mt-4 w-full rounded-lg bg-mystical-500 px-4 py-3 text-sm font-medium text-deep-950 transition-colors hover:bg-mystical-400"
              >
                点击加企微咨询
              </button>
            </article>
          ))}
        </div>
      </div>
      {qrProductName ? <WecomQrModal productName={qrProductName} onClose={() => setQrProductName(null)} /> : null}
    </div>
  );
}

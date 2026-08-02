import { Link } from "react-router-dom";
import { useState } from "react";
import { getSpiritualRecommendations } from "../data/spiritual-products";
import { WecomQrModal } from "./WecomQrModal";
import { ProductPoster } from "./ProductPoster";

interface SpiritualRecommendationProps {
  kind: "eastern" | "western" | "relationship" | "career" | "protection" | "wealth" | "clarity";
  title?: string;
  note?: string;
}

export function SpiritualRecommendation({ kind, title = "结果对应灵饰推荐", note }: SpiritualRecommendationProps) {
  const products = getSpiritualRecommendations(kind);
  const [qrProductName, setQrProductName] = useState<string | null>(null);

  return (
    <section className="bg-deep-900/50 border border-mystical-500/20 rounded-2xl p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
        <div>
          <p className="text-mystical-400 text-xs tracking-[0.2em] uppercase mb-2">Energy Match</p>
          <h3 className="font-display text-xl text-mystical-100">{title}</h3>
          {note && <p className="text-deep-400 text-sm leading-relaxed mt-2">{note}</p>}
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-mystical-500/30 text-mystical-300 hover:bg-mystical-500/10 transition-colors text-sm whitespace-nowrap"
        >
          进入灵饰定制
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <article key={product.id} className="bg-deep-950/70 border border-deep-800 rounded-xl p-4">
            <div className="mb-3">
              <ProductPoster product={product} />
            </div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-deep-500 text-xs">{product.source} · {product.form}</p>
                <h4 className="font-display text-lg text-mystical-100 mt-1">{product.name}</h4>
              </div>
              <span className="text-mystical-300 text-sm whitespace-nowrap">¥{product.price}</span>
            </div>
            <p className="text-deep-300 text-sm leading-relaxed mb-3">{product.summary}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {product.intention.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-1 rounded-full bg-mystical-500/10 text-mystical-300 text-xs">{tag}</span>
              ))}
            </div>
            <p className="text-deep-500 text-xs leading-relaxed">{product.care}</p>
            <button
              type="button"
              onClick={() => setQrProductName(product.name)}
              className="mt-4 w-full rounded-lg bg-mystical-500 px-4 py-2.5 text-sm font-medium text-deep-950 transition-colors hover:bg-mystical-400"
            >
              加企微购买
            </button>
          </article>
        ))}
      </div>
      {qrProductName ? <WecomQrModal productName={qrProductName} onClose={() => setQrProductName(null)} /> : null}
    </section>
  );
}

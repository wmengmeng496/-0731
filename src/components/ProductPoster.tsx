import type { SpiritualProduct } from "../data/spiritual-products";

function getPosterTitle(product: SpiritualProduct) {
  if (product.name.includes("手串")) return "手串";
  if (product.name.includes("手链")) return "手链";
  if (product.name.includes("套装")) return "套装";
  return product.form.split("+")[0].trim();
}

function getPosterCaption(product: SpiritualProduct) {
  return product.source || "现货咨询";
}

export function ProductPoster({ product }: { product: SpiritualProduct }) {
  const beads = Array.from({ length: 16 }, (_, index) => product.palette[index % product.palette.length]);
  const beadCount = Math.max(12, Math.min(16, product.palette.length * 4));

  return (
    <div
      className="relative overflow-hidden rounded-[22px] border border-[#4b341f] bg-[#18110b] text-[#f5ead8]"
      style={{
        aspectRatio: "1 / 1.18",
        background:
          "radial-gradient(circle at 50% 34%, rgba(112,78,37,0.18), transparent 30%), linear-gradient(180deg, #211610 0%, #17100b 48%, #1a130d 100%)",
      }}
    >
      <div className="absolute inset-5 rounded-[18px] border border-[#5a3c23]/80" />
      <div className="absolute inset-x-7 top-7 h-[70%] rounded-full border border-[#4d341f]/60 bg-[#1b120c]/25" />
      <div className="absolute left-1/2 top-[17%] -translate-x-1/2 text-center">
        <p className="text-[11px] tracking-[0.2em] text-[#f4ebde]/80">{getPosterCaption(product)}</p>
        <h3 className="mt-2 text-[34px] leading-none text-[#f4ead8] md:text-[40px]">{getPosterTitle(product)}</h3>
      </div>

      <div className="absolute inset-0">
        {Array.from({ length: beadCount }, (_, index) => {
          const angle = (index / beadCount) * Math.PI * 2;
          const x = 50 + Math.cos(angle) * 28;
          const y = 48 + Math.sin(angle) * 22;
          const color = beads[index % beads.length];
          return (
            <span
              key={`${product.id}-${index}`}
              className="absolute h-[4.4vw] w-[4.4vw] max-h-12 max-w-12 min-h-6 min-w-6 rounded-full border border-white/15 shadow-[inset_0_10px_16px_rgba(255,255,255,0.2),0_8px_18px_rgba(0,0,0,0.34)]"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.7), transparent 24%), ${color}`,
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}
      </div>

      <div className="absolute left-0 right-0 bottom-0 border-t border-[#5a3c23]/60 bg-[#20150f]/70 px-5 pb-4 pt-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] text-[#cfb38a]">{product.source} · {product.form}</p>
            <p className="mt-2 text-[14px] leading-tight text-[#f7eddc] md:text-[16px]">{product.name}</p>
          </div>
          <span className="shrink-0 rounded-full border border-[#8d5a1f] bg-[#c97f1d] px-3 py-1 text-[11px] font-medium text-[#1c1209]">
            现货咨询
          </span>
        </div>
      </div>
    </div>
  );
}

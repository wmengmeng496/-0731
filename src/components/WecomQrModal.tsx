interface WecomQrModalProps {
  productName?: string;
  onClose: () => void;
}

const wecomQrSrc = "/images/wecom-qr.png";

export function WecomQrModal({ productName, onClose }: WecomQrModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-mystical-500/25 bg-deep-950 p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-mystical-400">WeCom</p>
            <h3 className="mt-1 font-display text-2xl text-mystical-100">添加企微咨询</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-deep-800 text-deep-400 transition-colors hover:border-mystical-500/40 hover:text-mystical-200"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        {productName ? (
          <p className="mb-4 rounded-lg border border-deep-800 bg-deep-900/60 px-3 py-2 text-sm text-deep-300">
            咨询商品：{productName}
          </p>
        ) : null}

        <div className="mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-xl border border-mystical-500/35 bg-white p-3">
          <img
            src={wecomQrSrc}
            alt="添加企微二维码"
            className="h-full w-full object-contain"
          />
        </div>

        <p className="mt-4 text-center text-xs leading-relaxed text-deep-400">
          长按或截图保存二维码，添加企微后发送商品或测算结果，人工确认款式、手围、开光和发货细节。
        </p>
      </div>
    </div>
  );
}

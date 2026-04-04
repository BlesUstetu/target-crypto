import { useStore } from "../store";
import AlertPopup from "./AlertPopup";

export default function UI() {
  const { price, last, delta, smc, data, timeframe, setTF, alert } = useStore();

  const isUp = price > last;
  const isDown = price < last;

  const priceColor =
    isUp ? "text-green-400" : isDown ? "text-red-400" : "text-white";

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white flex flex-col">

      <AlertPopup message={alert} />

      {/* HEADER (COMPACT MOBILE) */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
        <h1 className={`text-lg sm:text-2xl font-semibold ${priceColor}`}>
          BTC {price ? price.toLocaleString() : "..."}
        </h1>

        <select
          value={timeframe}
          onChange={(e) => setTF(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs sm:text-sm"
        >
          <option>1m</option>
          <option>5m</option>
          <option>15m</option>
        </select>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-4 space-y-4">

        {!price && (
          <div className="text-gray-400 animate-pulse text-sm">
            Connecting to market...
          </div>
        )}

        {/* DELTA + SMC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* DELTA */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Order Flow</div>

            {delta ? (
              <>
                <div className="text-green-400 font-semibold text-sm">
                  BUY {delta.buy}%
                </div>
                <div className="text-red-400 text-xs">
                  SELL {delta.sell}%
                </div>
              </>
            ) : (
              <div className="opacity-50 text-xs">Loading...</div>
            )}
          </div>

          {/* SMC */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Liquidity</div>

            {smc ? (
              <div className="text-cyan-400 font-semibold text-sm">
                Sweep: {smc.sweep || "-"}
              </div>
            ) : (
              <div className="opacity-50 text-xs">Analyzing...</div>
            )}
          </div>

        </div>

        {/* SPACE (UNTUK CHAT AI KE DEPAN) */}
        <div className="h-24 opacity-20 text-center text-xs">
          AI News / Chat (coming...)
        </div>

      </div>

      {/* 🔥 STICKY AI SIGNAL (MOBILE CORE UX) */}
      <div className="sticky bottom-0 p-3 bg-[#0b0f14]/95 backdrop-blur border-t border-white/10">

        {data ? (
          <div className="p-3 rounded-2xl bg-[#0f141b] border border-cyan-500/20">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-2">
              <div
                className={`text-lg font-bold ${
                  data.final === "BUY" ? "text-green-400" : "text-red-400"
                }`}
              >
                {data.final}
              </div>

              <div className="text-xs text-gray-400">
                {(data.confidence * 100).toFixed(0)}%
              </div>
            </div>

            {/* BAR */}
            <div className="w-full h-1.5 bg-white/10 rounded-full mb-3 overflow-hidden">
              <div
                className={`h-full ${
                  data.final === "BUY" ? "bg-green-400" : "bg-red-400"
                }`}
                style={{ width: `${data.confidence * 100}%` }}
              />
            </div>

            {/* ENTRY / TP / SL */}
            <div className="grid grid-cols-3 gap-2 text-xs">

              <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                <div className="text-gray-400">Entry</div>
                <div className="font-semibold">{data.entry}</div>
              </div>

              <div className="bg-green-500/10 p-2 rounded-lg border border-green-500/30">
                <div className="text-gray-400">TP</div>
                <div className="text-green-400 font-semibold">{data.tp}</div>
              </div>

              <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/30">
                <div className="text-gray-400">SL</div>
                <div className="text-red-400 font-semibold">{data.sl}</div>
              </div>

            </div>

          </div>
        ) : (
          <div className="text-gray-500 text-xs text-center animate-pulse">
            Waiting AI signal...
          </div>
        )}

      </div>
    </div>
  );
}

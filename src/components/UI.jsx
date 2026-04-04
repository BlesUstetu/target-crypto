import { useStore } from "../store";
import AlertPopup from "./AlertPopup";

export default function UI() {
  const { price, last, delta, smc, data, timeframe, setTF, alert } = useStore();

  const color = price > last ? "#22c55e" : price < last ? "#ef4444" : "#fff";

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white p-4">
      <AlertPopup message={alert} />

      <div className="flex justify-between mb-4">
        <h1 style={{ color }}>
          BTC {price ? price.toLocaleString() : "Loading..."}
        </h1>

        <select value={timeframe} onChange={(e) => setTF(e.target.value)}>
          <option>1m</option>
          <option>5m</option>
          <option>15m</option>
        </select>
      </div>

      {/* 🔥 FALLBACK */}
      {!price && <p>Connecting to market...</p>}

      {/* DELTA */}
      {delta ? (
        <p>BUY {delta.buy}% / SELL {delta.sell}%</p>
      ) : (
        <p className="opacity-60">Loading delta...</p>
      )}

      {/* SMC */}
      {smc ? (
        <p>Sweep: {smc.sweep || "-"}</p>
      ) : (
        <p className="opacity-60">Analyzing liquidity...</p>
      )}

      {/* AI */}
      {data ? (
        <div className="mt-4 p-4 border border-white/10 rounded-lg">
          <h2 className="text-lg font-bold">{data.final}</h2>
          <p>{(data.confidence * 100).toFixed(0)}%</p>
          <p>Entry {data.entry}</p>
          <p>TP {data.tp}</p>
          <p>SL {data.sl}</p>
        </div>
      ) : (
        <p className="opacity-60 mt-4">Waiting AI signal...</p>
      )}
    </div>
  );
}

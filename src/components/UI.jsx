import { useStore } from "../store";
import { useState, useEffect } from "react";

export default function UI() {
  const {
    price,
    last,
    delta,
    smc,
    data,
    timeframe,
    setTF,
    alert,
    setPrice,
    setDelta,
    setSMC,
    setData,
  } = useStore();

  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");

  // ===============================
  // FETCH DATA (CORE ENGINE)
  // ===============================
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/ai/signal");

        if (!res.ok) throw new Error("API ERROR");

        const json = await res.json();

        setPrice(json.price);
        setDelta(json.delta);
        setSMC(json.smc || null);
        setData(json.signal);

      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // ===============================
  // UI LOGIC
  // ===============================
  const isUp = price > last;
  const isDown = price < last;

  const priceColor = isUp
    ? "text-green-400"
    : isDown
    ? "text-red-400"
    : "text-white";

  const confidence = data?.confidence || 0;
  const bias = data?.bias === "LONG" ? "BUY" : "SELL";

  // ===============================
  // CHAT
  // ===============================
  const sendChat = () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };

    const aiMsg = {
      role: "ai",
      text: `Market Analysis:\n- Signal: ${bias}\n- Confidence: ${confidence}%\n- Delta: ${delta ? delta.buy + "% buy" : "loading"}`,
    };

    setChat((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  return (
    <div className="p-3 text-white min-h-screen bg-black flex flex-col gap-3">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className={`text-3xl font-bold ${priceColor}`}>
          ${Number(price || 0).toLocaleString()}
        </div>

        <select
          value={timeframe}
          onChange={(e) => setTF(e.target.value)}
          className="bg-gray-800 p-2 rounded-lg"
        >
          <option value="1m">1m</option>
          <option value="5m">5m</option>
          <option value="15m">15m</option>
          <option value="1h">1h</option>
        </select>
      </div>

      {/* SIGNAL */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-2xl border border-gray-700">
        {data ? (
          <>
            <div className="flex justify-between items-center">
              <div
                className={`text-2xl font-bold ${
                  bias === "BUY" ? "text-green-400" : "text-red-400"
                }`}
              >
                {bias} SIGNAL
              </div>

              <div className="text-lg text-gray-300">
                {confidence}%
              </div>
            </div>

            <div className="w-full bg-gray-700 h-3 rounded mt-3 overflow-hidden">
              <div
                className={`h-full ${
                  bias === "BUY" ? "bg-green-400" : "bg-red-400"
                }`}
                style={{ width: `${confidence}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div>
                <div className="text-gray-400 text-xs">ENTRY</div>
                <div className="font-bold text-lg">
                  {Number(data.entry || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs">TP</div>
                <div className="font-bold text-green-400 text-lg">
                  {Number(data.tp || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs">SL</div>
                <div className="font-bold text-red-400 text-lg">
                  {Number(data.sl || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500">Waiting AI signal...</div>
        )}
      </div>

      {/* DELTA */}
      <div className="bg-gray-900 p-3 rounded-xl">
        <div className="text-xs text-gray-400">Order Flow</div>
        {delta ? (
          <>
            <div className="flex justify-between text-sm mt-2">
              <span>BUY</span>
              <span>{delta.buy}%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded my-1">
              <div className="bg-green-400 h-2" style={{ width: `${delta.buy}%` }} />
            </div>

            <div className="flex justify-between text-sm">
              <span>SELL</span>
              <span>{delta.sell}%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded">
              <div className="bg-red-400 h-2" style={{ width: `${delta.sell}%` }} />
            </div>
          </>
        ) : (
          "Loading..."
        )}
      </div>

      {/* CHAT */}
      <div className="flex-1 bg-gray-900 rounded-xl p-3 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2 text-sm">
          {chat.map((c, i) => (
            <div
              key={i}
              className={`p-2 rounded max-w-[80%] ${
                c.role === "user"
                  ? "bg-blue-600 self-end"
                  : "bg-gray-700 self-start"
              }`}
            >
              {c.text}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-gray-800 p-2 rounded"
          />
          <button onClick={sendChat} className="bg-green-500 px-4 rounded">
            Send
          </button>
        </div>
      </div>

      {/* ALERT */}
      {alert && (
        <div className="fixed bottom-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded">
          {alert}
        </div>
      )}

    </div>
  );
}

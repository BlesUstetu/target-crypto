import { useStore } from "../store";
import { useState } from "react";

export default function UI() {
  const { price, last, delta, smc, data, timeframe, setTF, alert } = useStore();
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");

  const isUp = price > last;
  const isDown = price < last;

  const priceColor = isUp
    ? "text-green-400"
    : isDown
    ? "text-red-400"
    : "text-white";

  const sendChat = () => {
    if (!input.trim()) return;

    const newMsg = { role: "user", text: input };
    const aiReply = {
      role: "ai",
      text: "AI analyzing market... (integrate API here)",
    };

    setChat((prev) => [...prev, newMsg, aiReply]);
    setInput("");
  };

  return (
    <div className="p-3 text-white min-h-screen bg-black flex flex-col gap-3">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className={`text-2xl font-bold ${priceColor}`}>
          ${Number(price || 0).toLocaleString()}
        </div>

        <select
          value={timeframe}
          onChange={(e) => setTF(e.target.value)}
          className="bg-gray-800 p-1 rounded"
        >
          <option value="1m">1m</option>
          <option value="5m">5m</option>
          <option value="15m">15m</option>
          <option value="1h">1h</option>
        </select>
      </div>

      {/* SIGNAL PANEL */}
      <div className="bg-gray-900 p-3 rounded-xl shadow-lg">
        {data ? (
          <>
            <div className="flex justify-between items-center">
              <div
                className={`text-lg font-bold ${{
                  BUY: "text-green-400",
                  SELL: "text-red-400",
                }[data.final]}`}
              >
                {data.final}
              </div>

              <div className="text-sm text-gray-400">
                {((data?.confidence || 0) * 100).toFixed(0)}%
              </div>
            </div>

            {/* CONFIDENCE BAR */}
            <div className="w-full bg-gray-700 h-2 rounded mt-2 overflow-hidden">
              <div
                className={`h-full ${
                  data?.final === "BUY" ? "bg-green-400" : "bg-red-400"
                }`}
                style={{ width: `${(data?.confidence || 0) * 100}%` }}
              />
            </div>

            {/* ENTRY TP SL */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-sm">
              <div>
                Entry
                <div className="font-semibold">
                  {Number(data.entry || 0).toLocaleString()}
                </div>
              </div>
              <div>
                TP
                <div className="font-semibold">
                  {Number(data.tp || 0).toLocaleString()}
                </div>
              </div>
              <div>
                SL
                <div className="font-semibold">
                  {Number(data.sl || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500">
            Waiting AI signal...
          </div>
        )}
      </div>

      {/* MARKET INFO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="bg-gray-900 p-2 rounded">
          <div className="text-xs text-gray-400">Delta</div>
          <div className="font-semibold">
            {delta ? JSON.stringify(delta) : "Loading..."}
          </div>
        </div>

        <div className="bg-gray-900 p-2 rounded">
          <div className="text-xs text-gray-400">SMC</div>
          <div className="font-semibold">
            {smc ? JSON.stringify(smc) : "Loading..."}
          </div>
        </div>
      </div>

      {/* AI CHAT */}
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

        {/* INPUT */}
        <div className="flex gap-2 mt-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about market..."
            className="flex-1 bg-gray-800 p-2 rounded resize-none"
            rows={1}
          />
          <button
            onClick={sendChat}
            className="bg-green-500 px-3 rounded"
          >
            Send
          </button>
        </div>
      </div>

      {/* ALERT */}
      {alert && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded shadow-lg animate-bounce">
          {alert}
        </div>
      )}
    </div>
  );
}

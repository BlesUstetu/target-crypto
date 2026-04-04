import { useEffect } from "react";
import { useStore } from "../store";

export default function useWS() {
  const setPrice = useStore((s) => s.setPrice);

  useEffect(() => {
    let ws;
    let fallback;

    const connectWS = () => {
      console.log("WS CONNECT");

      try {
        ws = new WebSocket("wss://stream.binance.com/ws/btcusdt@trade");

        ws.onopen = () => {
          console.log("WS OPEN ✅");

          // stop fallback kalau WS berhasil
          if (fallback) clearInterval(fallback);
        };

        ws.onmessage = (e) => {
          const d = JSON.parse(e.data);
          const price = parseFloat(d.p);

          setPrice(price);
        };

        ws.onerror = () => {
          console.log("WS FAILED ❌ → fallback REST");
          ws.close();
          startFallback();
        };

        ws.onclose = () => {
          console.log("WS CLOSED → retry...");
          setTimeout(connectWS, 3000);
        };
      } catch (e) {
        startFallback();
      }
    };

    const startFallback = () => {
      if (fallback) return;

      console.log("START REST FALLBACK 🔄");

      fallback = setInterval(async () => {
        try {
          const r = await fetch(
            "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
          );
          const d = await r.json();

          setPrice(parseFloat(d.price));
        } catch (err) {
          console.error("REST ERROR:", err);
        }
      }, 2000);
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      if (fallback) clearInterval(fallback);
    };
  }, [setPrice]);
}

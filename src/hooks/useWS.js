import { useEffect } from "react";
import { useStore } from "../store";

export default function useWS() {
  const setPrice = useStore((s) => s.setPrice);

  useEffect(() => {
    let ws;
    let fallback;

    const startFallback = () => {
      if (fallback) return;

      console.log("REST FALLBACK ACTIVE 🔄");

      fallback = setInterval(async () => {
        try {
          const r = await fetch("/api/price");
          const d = await r.json();
          setPrice(d.price);
        } catch (err) {
          console.error("Fallback error:", err);
        }
      }, 2000);
    };

    const connectWS = () => {
      try {
        ws = new WebSocket("wss://stream.binance.com/ws/btcusdt@trade");

        ws.onopen = () => {
          console.log("WS OPEN ✅");
          if (fallback) clearInterval(fallback);
        };

        ws.onmessage = (e) => {
          const d = JSON.parse(e.data);
          setPrice(parseFloat(d.p));
        };

        ws.onerror = () => {
          console.log("WS FAIL → fallback");
          ws.close();
          startFallback();
        };

        ws.onclose = () => {
          setTimeout(connectWS, 3000);
        };
      } catch {
        startFallback();
      }
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      if (fallback) clearInterval(fallback);
    };
  }, [setPrice]);
}

import { useEffect } from "react";
import { useStore } from "../store";

export default function useWS() {
  const setPrice = useStore((s) => s.setPrice);

  useEffect(() => {
    let ws;

    const connect = () => {
      console.log("WS CONNECT");

      ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");

      ws.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data);
          const price = parseFloat(d.p);

          setPrice(price);
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WS ERROR:", err);
        ws.close();
      };

      ws.onclose = () => {
        console.log("WS RECONNECT...");
        setTimeout(connect, 2000);
      };
    };

    connect();

    // 🔥 CLEANUP WAJIB
    return () => {
      if (ws) ws.close();
    };
  }, [setPrice]);
}

import { useEffect } from "react";
import { useStore } from "../store";

export default function useWS() {
  const setPrice = useStore((s) => s.setPrice);

  useEffect(() => {
    let ws;

    const connect = () => {
      console.log("WS CONNECT");

      ws = new WebSocket("wss://stream.binance.com/ws/btcusdt@trade");

      ws.onopen = () => {
        console.log("WS OPEN ✅");
      };

      ws.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data);
          const price = parseFloat(d.p);

          console.log("PRICE:", price); // 🔥 DEBUG

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

    return () => {
      if (ws) ws.close();
    };
  }, [setPrice]);
}

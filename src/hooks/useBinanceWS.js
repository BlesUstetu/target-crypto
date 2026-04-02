import { useEffect } from "react";
import { useMarketStore } from "../store/useMarketStore";

export default function useBinanceWS() {
  const setPrice = useMarketStore((s) => s.setPrice);

  useEffect(() => {
    let ws;

    const connect = () => {
      ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setPrice(parseFloat(data.p));
      };

      ws.onerror = (e) => console.error("WS Error", e);

      ws.onclose = () => {
        setTimeout(connect, 2000);
      };
    };

    connect();

    return () => ws && ws.close();
  }, []);
}

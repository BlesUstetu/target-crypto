import { useMarketStore } from "../store/useMarketStore";

export default function PriceTicker() {
  const { price, lastPrice } = useMarketStore();

  const color =
    price > lastPrice ? "#22c55e" :
    price < lastPrice ? "#ef4444" : "#fff";

  return (
    <h1 style={{ color, transition: "color 0.2s ease" }}>
      BTC {price ? price.toLocaleString() : "..."}
    </h1>
  );
}

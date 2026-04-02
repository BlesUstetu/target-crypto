import { useMarketStore } from "../store/useMarketStore";

export default function PriceTicker() {
  const { price, lastPrice } = useMarketStore();

  const color =
    price > lastPrice ? "#22c55e" :
    price < lastPrice ? "#ef4444" : "#fff";

  return <h1 style={{ color }}>BTC {price.toFixed(2)}</h1>;
}

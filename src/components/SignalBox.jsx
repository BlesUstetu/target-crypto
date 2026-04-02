import { useMarketStore } from "../store/useMarketStore";

export default function SignalBox() {
  const { signal, loading } = useMarketStore();

  if (loading) return <p>AI analyzing...</p>;
  if (!signal) return null;

  return (
    <div style={{ border: "1px solid #0f0", padding: 10 }}>
      <h3>{signal.signal}</h3>
      <p>Entry: {signal.entry}</p>
      <p>TP: {signal.tp}</p>
      <p>SL: {signal.sl}</p>
    </div>
  );
}

import PriceTicker from "./PriceTicker";
import SignalBox from "./SignalBox";

export default function Terminal() {
  return (
    <div style={{ padding: 20 }}>
      <PriceTicker />
      <SignalBox />
    </div>
  );
}

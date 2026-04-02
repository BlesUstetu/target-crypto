import useBinanceWS from "./hooks/useBinanceWS";
import useAutoSignal from "./hooks/useAutoSignal";
import Terminal from "./components/Terminal";

export default function App() {
  useBinanceWS();
  useAutoSignal();
  return <Terminal />;
}

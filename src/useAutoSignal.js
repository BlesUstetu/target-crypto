import { useEffect } from "react";
import { useMarketStore } from "../store/useMarketStore";

export default function useAutoSignal() {
  const price = useMarketStore((s) => s.price);
  const setSignal = useMarketStore((s) => s.setSignal);
  const setLoading = useMarketStore((s) => s.setLoading);

  useEffect(() => {
    if (!price) return;

    const run = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/analyze", {
          method: "POST",
          body: JSON.stringify({ price }),
        });

        const data = await res.json();
        setSignal(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    run();
    const i = setInterval(run, 30000);

    return () => clearInterval(i);
  }, [price]);
}

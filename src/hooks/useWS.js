import { useEffect } from "react";
import { useStore } from "../store";

export default function useWS() {
  const setPrice = useStore((s) => s.setPrice);

  useEffect(() => {
    const run = async () => {
      try {
        const r = await fetch("/api/price");
        const d = await r.json();
        setPrice(d.price);
      } catch (e) {
        console.error(e);
      }
    };

    run();
    const i = setInterval(run, 2000);

    return () => clearInterval(i);
  }, [setPrice]);
}

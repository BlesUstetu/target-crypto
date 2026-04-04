export const config = {
  runtime: "edge"
};
export default async function handler(req, res) {
  try {
    const r = await fetch(
      "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
    );

    const text = await r.text(); // 🔥 debug raw

    try {
      const d = JSON.parse(text);

      return res.status(200).json({
        price: parseFloat(d.price),
      });
    } catch {
      return res.status(500).json({
        error: "Invalid JSON",
        raw: text,
      });
    }
  } catch (e) {
    return res.status(500).json({
      error: e.message,
    });
  }
}

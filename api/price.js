export default async function handler(req, res) {
  try {
    const r = await fetch(
      "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
    );
    const d = await r.json();

    res.status(200).json({
      price: parseFloat(d.price),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

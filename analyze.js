export default async function handler(req, res) {
  const { price } = JSON.parse(req.body);

  const signal = price % 2 === 0 ? "BUY" : "SELL";

  res.status(200).json({
    signal,
    entry: price,
    tp: signal === "BUY" ? price + 500 : price - 500,
    sl: signal === "BUY" ? price - 300 : price + 300,
  });
}

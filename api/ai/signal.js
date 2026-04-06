// ===============================
// PRO TRADING ENGINE (MTF + WHALE + LIQUIDATION)
// Vercel-safe (no WS)
// ===============================

const BASE = "https://fapi.binance.com";

// ===============================
// MAIN HANDLER
// ===============================
export default async function handler(req, res) {
  try {
    // ===============================
    // 1) PRICE (LAST + MARK + INDEX)
    // ===============================
    const [lastRes, markRes, indexRes] = await Promise.all([
      fetch(`${BASE}/fapi/v1/ticker/price?symbol=BTCUSDT`),
      fetch(`${BASE}/fapi/v1/premiumIndex?symbol=BTCUSDT`),
      fetch(`${BASE}/fapi/v1/premiumIndex?symbol=BTCUSDT`),
    ]);

    const lastJson = await lastRes.json();
    const markJson = await markRes.json();
    const indexJson = await indexRes.json();

    const price = parseFloat(lastJson.price);
    const markPrice = parseFloat(markJson.markPrice);
    const indexPrice = parseFloat(indexJson.indexPrice);

    // ===============================
    // 2) ORDERFLOW (DEPTH)
    // ===============================
    const depthRes = await fetch(
      `${BASE}/fapi/v1/depth?symbol=BTCUSDT&limit=50`
    );
    const depth = await depthRes.json();

    const bids = depth.bids || [];
    const asks = depth.asks || [];

    const bidVol = bids.reduce((s, b) => s + parseFloat(b[1]), 0);
    const askVol = asks.reduce((s, a) => s + parseFloat(a[1]), 0);

    const total = bidVol + askVol;

    const delta = {
      buy: Math.round((bidVol / total) * 100),
      sell: Math.round((askVol / total) * 100),
    };

    // ===============================
    // 3) WHALE DETECTION (aggTrades)
    // ===============================
    const tradesRes = await fetch(
      `${BASE}/fapi/v1/aggTrades?symbol=BTCUSDT&limit=200`
    );
    const trades = await tradesRes.json();

    let whaleBuy = 0;
    let whaleSell = 0;

    for (const t of trades) {
      const qty = parseFloat(t.q);
      const isSell = t.m;

      // threshold whale (adjustable)
      if (qty > 5) {
        if (isSell) whaleSell += qty;
        else whaleBuy += qty;
      }
    }

    const whale = {
      buy: whaleBuy,
      sell: whaleSell,
      bias: whaleBuy > whaleSell ? "LONG" : "SHORT",
    };

    // ===============================
    // 4) VOLATILITY (LIQUIDATION PROXY)
    // ===============================
    const klineRes = await fetch(
      `${BASE}/fapi/v1/klines?symbol=BTCUSDT&interval=1m&limit=20`
    );
    const klines = await klineRes.json();

    const closes = klines.map(k => parseFloat(k[4]));
    const high = Math.max(...closes);
    const low = Math.min(...closes);

    const volatility = ((high - low) / price) * 100;

    const liquidation = {
      risk: volatility > 0.5 ? "HIGH" : "NORMAL",
      volatility,
    };

    // ===============================
    // 5) MULTI-TIMEFRAME (SIMPLIFIED)
    // ===============================
    const mtf = {
      short: price > markPrice ? "BULLISH" : "BEARISH",
      mid: markPrice > indexPrice ? "BULLISH" : "BEARISH",
      long: delta.buy > delta.sell ? "BULLISH" : "BEARISH",
    };

    // ===============================
    // 6) SCORING ENGINE (PRO)
    // ===============================
    let score = 0;

    if (delta.buy > 60) score += 2;
    if (delta.sell > 60) score -= 2;

    if (whale.bias === "LONG") score += 2;
    if (whale.bias === "SHORT") score -= 2;

    if (mtf.short === "BULLISH") score += 1;
    else score -= 1;

    if (mtf.mid === "BULLISH") score += 1;
    else score -= 1;

    if (liquidation.risk === "HIGH") score *= 0.5;

    // ===============================
    // 7) FINAL SIGNAL
    // ===============================
    let signal;

    if (score >= 3) {
      signal = {
        bias: "LONG",
        confidence: Math.min(90, 60 + score * 5),
        entry: price,
        tp: price * 1.012,
        sl: price * 0.995,
      };
    } else if (score <= -3) {
      signal = {
        bias: "SHORT",
        confidence: Math.min(90, 60 + Math.abs(score) * 5),
        entry: price,
        tp: price * 0.988,
        sl: price * 1.005,
      };
    } else {
      signal = {
        bias: "WAIT",
        confidence: 50,
        entry: price,
        tp: price,
        sl: price,
      };
    }

    // ===============================
    // RESPONSE
    // ===============================
    return res.status(200).json({
      price,
      markPrice,
      indexPrice,
      delta,
      whale,
      liquidation,
      mtf,
      signal,
      timestamp: Date.now(),
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

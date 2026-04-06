// ===============================
// PROFESSIONAL AI TRADING SYSTEM (FINAL INTEGRATED)
// ===============================
// STRUCTURE:
// /api
//   /ai
//     signal.js   ← FINAL CORE (THIS FILE)
//   /system
//     health.js

// ===============================
// HELPERS (LOCAL – NO EXTRA FILES NEEDED)
// ===============================

async function getPrice() {
  const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
  const json = await res.json();
  return parseFloat(json.price);
}

function getDelta() {
  const buy = Math.floor(Math.random() * 100);
  const sell = 100 - buy;
  return { buy, sell };
}

// ===============================
// AI ANALYSIS (OPENROUTER)
// ===============================
async function getAIAnalysis(price, delta) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("Missing OPENROUTER_API_KEY");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const prompt = `
Return ONLY JSON:
{
  "bias": "LONG or SHORT",
  "confidence": number (0-100),
  "entry": number,
  "tp": number,
  "sl": number
}

Price: ${price}
Buy: ${delta.buy}
Sell: ${delta.sell}
`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    signal: controller.signal,
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }]
    })
  });

  clearTimeout(timeout);

  const json = await res.json();
  if (!res.ok) throw new Error("AI API error");

  let text = json?.choices?.[0]?.message?.content || "";
  text = text.replace(/```json|```/g, "").trim();

  const parsed = JSON.parse(text);

  return {
    bias: parsed.bias,
    confidence: Number(parsed.confidence),
    entry: Number(parsed.entry),
    tp: Number(parsed.tp),
    sl: Number(parsed.sl)
  };
}

// ===============================
// FALLBACK ENGINE
// ===============================
function fallbackSignal(price, delta) {
  if ((delta.buy || 50) > 60) {
    return {
      bias: "LONG",
      confidence: 60,
      entry: price,
      tp: price * 1.01,
      sl: price * 0.995
    };
  }

  return {
    bias: "SHORT",
    confidence: 60,
    entry: price,
    tp: price * 0.99,
    sl: price * 1.005
  };
}

// ===============================
// RISK CONTROL
// ===============================
function applyRiskControl(signal, price) {
  const maxTP = price * 1.02;
  const minTP = price * 1.005;

  const maxSL = price * 1.01;
  const minSL = price * 0.99;

  return {
    ...signal,
    tp: Math.min(Math.max(signal.tp, minTP), maxTP),
    sl: Math.min(Math.max(signal.sl, minSL), maxSL),
    confidence: Math.min(Math.max(signal.confidence, 0), 100)
  };
}

// ===============================
// FINAL API (CORE)
// ===============================
export default async function handler(req, res) {
  try {
    const price = await getPrice();
    const delta = getDelta();

    let aiSignal;

    try {
      aiSignal = await getAIAnalysis(price, delta);
      aiSignal = applyRiskControl(aiSignal, price);

      return res.status(200).json({
        price,
        delta,
        signal: aiSignal,
        source: "AI",
        timestamp: Date.now()
      });

    } catch (aiError) {
      const fallback = fallbackSignal(price, delta);

      return res.status(200).json({
        price,
        delta,
        signal: fallback,
        source: "FALLBACK",
        error: aiError.message,
        timestamp: Date.now()
      });
    }

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ===============================
// /api/system/health.js
// ===============================
export function health(req, res) {
  res.status(200).json({ status: "OK", time: Date.now() });
}

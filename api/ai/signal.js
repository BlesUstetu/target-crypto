// ===============================
// FINAL AI SIGNAL ENGINE (PRO)
// ===============================

export default async function handler(req, res) {
  try {
    // ===============================
    // 1. GET PRICE (REAL)
    // ===============================
    const priceRes = await fetch(
      "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
    );
    const priceJson = await priceRes.json();
    const price = parseFloat(priceJson.price);

    if (!price || isNaN(price)) {
      throw new Error("Invalid price");
    }

    // ===============================
    // 2. DELTA (Sementara Random)
    // ===============================
    const delta = generateDelta();

    // ===============================
    // 3. AI ANALYSIS
    // ===============================
    let signal;

    try {
      signal = await getAI(price, delta);
      signal.source = "AI";
    } catch (err) {
      signal = fallback(price, delta);
      signal.source = "FALLBACK";
      signal.error = err.message;
    }

    // ===============================
    // 4. VALIDASI ANGKA (ANTI 0)
    // ===============================
    signal.entry = safeNumber(signal.entry, price);
    signal.tp = safeNumber(signal.tp, price * 1.01);
    signal.sl = safeNumber(signal.sl, price * 0.99);
    signal.confidence = clamp(signal.confidence, 0, 100);

    // ===============================
    // 5. RISK CONTROL
    // ===============================
    signal = applyRisk(signal, price);

    // ===============================
    // 6. SYNC DELTA vs SIGNAL (ANTI KONFLIK)
    // ===============================
    if (delta.buy > 70 && signal.bias === "SHORT") {
      signal.bias = "LONG";
    }

    if (delta.sell > 70 && signal.bias === "LONG") {
      signal.bias = "SHORT";
    }

    // ===============================
    // 7. RESPONSE FINAL
    // ===============================
    return res.status(200).json({
      price,
      delta,
      signal,
      timestamp: Date.now(),
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

// ===============================
// AI (OPENROUTER)
// ===============================
async function getAI(price, delta) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("No API key");

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
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    signal: controller.signal,
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  clearTimeout(timeout);

  if (!res.ok) throw new Error("AI request failed");

  const json = await res.json();
  let text = json?.choices?.[0]?.message?.content || "";

  text = text.replace(/```json|```/g, "").trim();

  const parsed = JSON.parse(text);

  return {
    bias: parsed.bias,
    confidence: Number(parsed.confidence),
    entry: Number(parsed.entry),
    tp: Number(parsed.tp),
    sl: Number(parsed.sl),
  };
}

// ===============================
// FALLBACK ENGINE
// ===============================
function fallback(price, delta) {
  if ((delta.buy || 50) > 60) {
    return {
      bias: "LONG",
      confidence: 60,
      entry: price,
      tp: price * 1.01,
      sl: price * 0.995,
    };
  }

  return {
    bias: "SHORT",
    confidence: 60,
    entry: price,
    tp: price * 0.99,
    sl: price * 1.005,
  };
}

// ===============================
// DELTA (SIMULASI)
// ===============================
function generateDelta() {
  const buy = Math.floor(Math.random() * 100);
  const sell = 100 - buy;
  return { buy, sell };
}

// ===============================
// HELPERS
// ===============================
function safeNumber(val, fallback) {
  const num = Number(val);
  return isNaN(num) || num === 0 ? fallback : num;
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// ===============================
// RISK CONTROL
// ===============================
function applyRisk(signal, price) {
  const maxTP = price * 1.02;
  const minTP = price * 1.005;

  const maxSL = price * 1.01;
  const minSL = price * 0.99;

  return {
    ...signal,
    tp: Math.min(Math.max(signal.tp, minTP), maxTP),
    sl: Math.min(Math.max(signal.sl, minSL), maxSL),
  };
}

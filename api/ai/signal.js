// ===============================
// PROJECT STRUCTURE
// ===============================
// /api
//   price.js
//   ai.js
// /lib
//   ws.js
//   aiEngine.js
// .env

// ===============================
// .ENV
// ===============================
// OPENAI_API_KEY=your_key
// BINANCE_WS=wss://stream.binance.com:9443/ws/btcusdt@trade

// ===============================
// /lib/ws.js (REALTIME PRICE)
// ===============================
import WebSocket from "ws";

let price = 0;

export function startWS() {
  const ws = new WebSocket(process.env.BINANCE_WS);

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    price = parseFloat(data.p);
  });
}

export function getPrice() {
  return price;
}

// ===============================
// /lib/aiEngine.js (AI SIGNAL LOGIC)
// ===============================
export function generateSignal(price, delta, smc) {
  if (!price) return null;

  const buyPressure = delta?.buy || 50;
  const sellPressure = delta?.sell || 50;

  let final = "WAIT";
  let confidence = 0.5;

  if (buyPressure > 70 && smc?.sweep === "UP") {
    final = "BUY";
    confidence = 0.75;
  }

  if (sellPressure > 70 && smc?.sweep === "DOWN") {
    final = "SELL";
    confidence = 0.75;
  }

  return {
    final,
    confidence,
    entry: price,
    tp: final === "BUY" ? price * 1.01 : price * 0.99,
    sl: final === "BUY" ? price * 0.995 : price * 1.005,
  };
}

// ===============================
// /api/price.js (API ENDPOINT)
// ===============================
import { getPrice } from "../lib/ws";

export default function handler(req, res) {
  res.status(200).json({ price: getPrice() });
}

// ===============================
// /api/ai.js (AI + SIGNAL API)
// ===============================
import { generateSignal } from "../lib/aiEngine";
import { getPrice } from "../lib/ws";

export default async function handler(req, res) {
  const price = getPrice();

  // SIMULASI DELTA & SMC (ganti nanti dengan real)
  const delta = {
    buy: Math.floor(Math.random() * 100),
    sell: Math.floor(Math.random() * 100),
  };

  const smc = {
    high: price + 50,
    low: price - 50,
    sweep: Math.random() > 0.5 ? "UP" : "DOWN",
  };

  const signal = generateSignal(price, delta, smc);

  res.status(200).json({ price, delta, smc, signal });
}

// ===============================
// INIT SERVER (IMPORTANT)
// ===============================
import { startWS } from "./lib/ws";
startWS();

// ===============================
// FRONTEND FETCH EXAMPLE
// ===============================
// useEffect(() => {
//   setInterval(async () => {
//     const res = await fetch("/api/ai");
//     const data = await res.json();
//     setData(data);
//   }, 2000);
// }, []);

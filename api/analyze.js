export const config = {
  runtime: "edge"
};
export default async function handler(req, res) {
  try {
    const key = process.env.OPENROUTER_API_KEY;

    if (!key) {
      return res.status(500).json({
        error: "OPENROUTER_API_KEY not set"
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "user", content: "Analyze BTC short-term direction" }
        ]
      })
    });

    const json = await response.json();

    // 🔥 HANDLE ERROR DARI API
    if (!response.ok) {
      return res.status(500).json({
        error: json
      });
    }

    const text = json?.choices?.[0]?.message?.content;

    return res.status(200).json({
      result: text || "No response"
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}

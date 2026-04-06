export default function handler(req, res) {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    time: Date.now()
  });
}

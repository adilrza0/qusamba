export default async function handler(req, res) {
  try {
    const response = await fetch("https://your-render-backend.onrender.com", {
      method: "GET",
    });
    const status = response.status;
    console.log("Pinged Render backend:", status);
    return res.status(200).json({ message: "Ping success", status });
  } catch (error) {
    console.error("Ping failed:", error);
    return res.status(500).json({ error: "Ping failed" });
  }
}

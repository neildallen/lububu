import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (index.html, style.css, etc.)
app.use(express.static(__dirname));
app.use(express.json());

app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;

  try {
    const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: "512x512",
      }),
    });

    const data = await dalleRes.json();
    res.json({ imageUrl: data.data[0].url });
  } catch (err) {
    console.error("DALL·E error:", err);
    res.status(500).json({ error: "Image generation failed." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

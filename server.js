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

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key not found");
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    console.log("Generating image with prompt:", prompt);

    const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: "1024x1024",
        model: "dall-e-3",
      }),
    });

    if (!dalleRes.ok) {
      const errorData = await dalleRes.json();
      console.error("DALL·E API error:", errorData);
      return res.status(dalleRes.status).json({
        error: `DALL·E API error: ${errorData.error?.message || 'Unknown error'}`
      });
    }

    const data = await dalleRes.json();

    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error("Unexpected DALL·E response:", data);
      return res.status(500).json({ error: "Invalid response from DALL·E API" });
    }

    console.log("Image generated successfully");
    res.json({ imageUrl: data.data[0].url });
  } catch (err) {
    console.error("DALL·E error:", err);
    res.status(500).json({ error: "Image generation failed: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

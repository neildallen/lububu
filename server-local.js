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

app.use(express.static(__dirname));
app.use(express.json({ limit: '10mb' }));

app.post("/api/generate-image", async (req, res) => {
  const { prompt, imageData, mode, formValues } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key not found");
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    // Handle image-to-image generation
    if (mode === "image-to-image" && imageData) {
      console.log("Processing image with DALL-E 2");
      const vals = formValues || {};
      const labubuPrompt = `A stylized plush toy creature inspired by the Labubu toy line. 
This ${vals.gender?.toLowerCase() || 'cute'} character has ${vals.teeth?.toLowerCase() || 'friendly'} teeth, 
${vals.furColor?.toLowerCase() || 'colorful'} fur, and ${vals.eyeColor?.toLowerCase() || 'bright'} eyes, 
with a ${vals.tail?.toLowerCase() || 'adorable'} tail and a ${vals.mood?.toLowerCase() || 'happy'} personality. 
They wear ${vals.clothes?.toLowerCase() || 'cute'} with a ${vals.accessories?.toLowerCase() || 'charming'} accessory, 
and embody the mystic power of a "${vals.power || 'magic'}". 
Photographed under soft studio lighting on a white background. Clean product shot.`;

      const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: labubuPrompt,
          n: 1,
          size: "512x512",
          model: "dall-e-2",
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

      console.log("Labubu character generated successfully");
      res.status(200).json({
        imageUrl: data.data[0].url,
        message: "Your Labubu character has been created based on your form settings!"
      });
      return;
    }

    // Handle text-to-image generation
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required for text-to-image generation" });
    }

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
        model: "dall-e-2",
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
    res.status(200).json({ imageUrl: data.data[0].url });

  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Image generation failed: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Local server running at http://localhost:${PORT}`);
}); 
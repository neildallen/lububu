import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import FormData from "form-data";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));
app.use(express.json({ limit: '10mb' }));

app.post("/api/generate-image", async (req, res) => {
  const { prompt, imageData, maskData, mode, formValues } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key not found");
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    // DALL·E 2 inpainting (image + mask)
    if (mode === "image-to-image" && imageData && maskData) {
      const vals = formValues || {};
      const dallePrompt = `Add a Labubu face to this head, keeping the rest of the image unchanged. Plush toy style, ${vals.furColor?.toLowerCase() || 'colorful'} fur, ${vals.eyeColor?.toLowerCase() || 'bright'} eyes, ${vals.teeth?.toLowerCase() || 'friendly'} teeth, ${vals.mood?.toLowerCase() || 'happy'} mood.`;

      const form = new FormData();
      form.append("prompt", dallePrompt);
      form.append("n", "1");
      form.append("size", "512x512");
      form.append("model", "dall-e-2");
      form.append("image", Buffer.from(imageData, "base64"), { filename: "image.png", contentType: "image/png" });
      form.append("mask", Buffer.from(maskData, "base64"), { filename: "mask.png", contentType: "image/png" });

      const dalleRes = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders()
        },
        body: form,
      });

      const data = await dalleRes.json();
      if (!dalleRes.ok) {
        console.error("OpenAI Error:", data);
        return res.status(dalleRes.status).json({ error: data.error?.message || "Unknown error" });
      }
      if (!data.data || !data.data[0] || !data.data[0].url) {
        console.error("Unexpected DALL·E response:", data);
        return res.status(500).json({ error: "Invalid response from DALL·E API" });
      }
      res.status(200).json({ imageUrl: data.data[0].url, message: "Your Labubu face has been inpainted!" });
      return;
    }

    // Fallback: prompt-based generation (text-to-image)
    let dallePrompt = prompt;
    if (mode === "image-to-image" && formValues) {
      const vals = formValues || {};
      dallePrompt = `A stylized plush toy creature inspired by the Labubu toy line. \
This ${vals.gender?.toLowerCase() || 'cute'} character has ${vals.teeth?.toLowerCase() || 'friendly'} teeth, \
${vals.furColor?.toLowerCase() || 'colorful'} fur, and ${vals.eyeColor?.toLowerCase() || 'bright'} eyes, \
with a ${vals.tail?.toLowerCase() || 'adorable'} tail and a ${vals.mood?.toLowerCase() || 'happy'} personality. \
They wear ${vals.clothes?.toLowerCase() || 'cute'} with a ${vals.accessories?.toLowerCase() || 'charming'} accessory, \
and embody the mystic power of a \"${vals.power || 'magic'}\". \
Photographed under soft studio lighting on a white background. Clean product shot.`;
    }
    const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: dallePrompt,
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

    res.status(200).json({
      imageUrl: data.data[0].url,
      message: "Your Labubu character has been created based on your form settings!"
    });
    return;
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Image generation failed: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Local server running at http://localhost:${PORT}`);
}); 
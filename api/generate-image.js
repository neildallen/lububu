export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, imageData, mode } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key not found");
    console.error("Available environment variables:", Object.keys(process.env));
    return res.status(500).json({ error: "API key not configured" });
  }

  // Handle image-to-image generation
  if (mode === "image-to-image" && imageData) {
    try {
      console.log("Generating image variation from uploaded image");

      // For now, let's use a simpler approach - just return the original image
      // DALL-E variations require more complex handling in serverless functions
      console.log("Image variation feature coming soon - returning original image for now");

      // Convert base64 back to data URL for display
      const dataUrl = `data:image/png;base64,${imageData}`;
      res.status(200).json({ imageUrl: dataUrl });
      return;
    } catch (err) {
      console.error("Image processing error:", err);
      res.status(500).json({ error: "Image processing failed: " + err.message });
      return;
    }
  }

  // Handle text-to-image generation (existing functionality)
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required for text-to-image generation" });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key not found");
    console.error("Available environment variables:", Object.keys(process.env));
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
    console.error("DALL·E error:", err);
    res.status(500).json({ error: "Image generation failed: " + err.message });
  }
} 
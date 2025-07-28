import FormData from 'form-data';

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

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(imageData, 'base64');

      const dalleRes = await fetch("https://api.openai.com/v1/images/variations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: (() => {
          const formData = new FormData();
          formData.append("image", imageBuffer, {
            filename: "uploaded_image.png",
            contentType: "image/png"
          });
          formData.append("n", "1");
          formData.append("size", "512x512");
          return formData;
        })(),
      });

      if (!dalleRes.ok) {
        const errorData = await dalleRes.json();
        console.error("DALL·E variation API error:", errorData);
        return res.status(dalleRes.status).json({
          error: `DALL·E variation API error: ${errorData.error?.message || 'Unknown error'}`
        });
      }

      const data = await dalleRes.json();

      if (!data.data || !data.data[0] || !data.data[0].url) {
        console.error("Unexpected DALL·E variation response:", data);
        return res.status(500).json({ error: "Invalid response from DALL·E variation API" });
      }

      console.log("Image variation generated successfully");
      res.status(200).json({ imageUrl: data.data[0].url });
      return;
    } catch (err) {
      console.error("DALL·E variation error:", err);
      res.status(500).json({ error: "Image variation failed: " + err.message });
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
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

  // Handle image-to-image generation with DALL-E 2 inpainting
  if (mode === "image-to-image" && imageData) {
    try {
      console.log("Processing image with DALL-E 2 inpainting");

      // Get form values for Labubu character creation
      const vals = req.body.formValues || {};
      const labubuPrompt = `A stylized plush toy creature inspired by the Labubu toy line. 
This ${vals.gender?.toLowerCase() || 'cute'} character has ${vals.teeth?.toLowerCase() || 'friendly'} teeth, 
${vals.furColor?.toLowerCase() || 'colorful'} fur, and ${vals.eyeColor?.toLowerCase() || 'bright'} eyes, 
with a ${vals.tail?.toLowerCase() || 'adorable'} tail and a ${vals.mood?.toLowerCase() || 'happy'} personality. 
They wear ${vals.clothes?.toLowerCase() || 'cute'} with a ${vals.accessories?.toLowerCase() || 'charming'} accessory, 
and embody the mystic power of a "${vals.power || 'magic'}". 
Photographed under soft studio lighting on a white background. Clean product shot.`;

      // Use text-to-image to create a new Labubu character based on form values
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
    } catch (err) {
      console.error("DALL·E inpainting error:", err);
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
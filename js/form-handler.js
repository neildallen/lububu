window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("lububuForm");
  const photo = document.getElementById("photo");
  const generateBtn = document.getElementById("generateLububu");
  const imagePlaceholder = document.getElementById("image-placeholder");

  function getValues() {
    return {
      gender: document.getElementById("gender").value,
      power: document.getElementById("power").value,
      teeth: document.getElementById("teeth").value,
      furColor: document.getElementById("furColor").value,
      eyeColor: document.getElementById("eyes").value,
      mood: document.getElementById("mood").value,
      tail: document.getElementById("tail").value,
      accessories: document.getElementById("accessories").value,
      clothes: document.getElementById("clothes").value,
    };
  }

  generateBtn.addEventListener("click", async () => {
    const vals = getValues();
    const prompt = `A stylized plush toy creature inspired by the Labubu toy line. 
This ${vals.gender.toLowerCase()} character has ${vals.teeth.toLowerCase()} teeth, 
${vals.furColor.toLowerCase()} fur, and ${vals.eyeColor.toLowerCase()} eyes, 
with a ${vals.tail.toLowerCase()} tail and a ${vals.mood.toLowerCase()} personality. 
They wear ${vals.clothes.toLowerCase()} with a ${vals.accessories.toLowerCase()}, 
and embody the mystic power of a "${vals.power}". 
Photographed under soft studio lighting on a white background. Clean product shot.`;

    console.log("Generating Labubu with prompt:", prompt);
    console.log("Form values:", vals);

    // Show loading warning and hide generate button
    const loadingWarning = document.getElementById("loading-warning");
    if (loadingWarning) {
      loadingWarning.style.display = "block";
    }
    if (generateBtn) {
      generateBtn.style.display = "none";
    }

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Display the generated image in the placeholder
      if (imagePlaceholder) {
        imagePlaceholder.innerHTML = `<img src="${data.imageUrl}" alt="Your generated Labubu" style="max-width: 400px; width: 100%; height: auto; border: 2px solid #f089c8; border-radius: 12px; display: block; margin: 0 auto;" />`;
      }

      // Hide loading warning and show generate button again
      if (loadingWarning) {
        loadingWarning.style.display = "none";
      }
      if (generateBtn) {
        generateBtn.style.display = "block";
      }

      console.log("Image generated successfully:", data.imageUrl);

    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");

      // Hide loading warning and show generate button again on error
      if (loadingWarning) {
        loadingWarning.style.display = "none";
      }
      if (generateBtn) {
        generateBtn.style.display = "block";
      }
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const vals = getValues();

    if (photo.files.length) {
      const file = photo.files[0];

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a PNG or JPG image file.");
        return;
      }

      // Validate file size (max 4MB for DALL-E)
      const maxSize = 4 * 1024 * 1024; // 4MB
      if (file.size > maxSize) {
        alert("Please upload an image smaller than 4MB.");
        return;
      }

      // Show loading warning and hide submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.style.display = "none";
      }

      const loadingWarning = document.getElementById("loading-warning");
      if (loadingWarning) {
        loadingWarning.style.display = "block";
      }

      try {
        // Convert file to base64 for API
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix

          // Send to API for image variation
          const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: "image-to-image",
              imageData: base64Data,
              formValues: vals
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          // Display the generated image variation
          if (imagePlaceholder) {
            let html = `<img src="${data.imageUrl}" alt="Your uploaded image" style="max-width: 400px; width: 100%; height: auto; border: 2px solid #f089c8; border-radius: 12px; display: block; margin: 0 auto;" />`;

            // Add message if provided
            if (data.message) {
              html += `<p style="text-align: center; margin-top: 0.5rem; color: #666; font-size: 0.9rem;">${data.message}</p>`;
            }

            imagePlaceholder.innerHTML = html;
          }

          console.log("Image uploaded successfully:", data.imageUrl);
        };
        reader.readAsDataURL(file);

      } catch (error) {
        console.error("Error generating image variation:", error);
        alert("Failed to generate image variation. Please try again.");
      } finally {
        // Hide loading warning and show submit button again
        if (loadingWarning) {
          loadingWarning.style.display = "none";
        }
        if (submitBtn) {
          submitBtn.style.display = "block";
        }
      }
    } else {
      alert("Please upload an image.");
    }
  });
});

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("lububuForm");
  const photo = document.getElementById("photo");
  const generateBtn = document.getElementById("generateLububu");
  const imgEl = document.getElementById("lububuImage");

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

    // Show loading warning
    const loadingWarning = document.getElementById("loading-warning");
    if (loadingWarning) {
      loadingWarning.style.display = "block";
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

      // Display the generated image
      imgEl.src = data.imageUrl;
      imgEl.style.display = "block";

      // Hide loading warning
      if (loadingWarning) {
        loadingWarning.style.display = "none";
      }

      console.log("Image generated successfully:", data.imageUrl);

    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");

      // Hide loading warning on error
      if (loadingWarning) {
        loadingWarning.style.display = "none";
      }
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const vals = getValues();
    if (photo.files.length) {
      const file = photo.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        imgEl.src = reader.result;
        imgEl.style.display = "block";

        // Log the uploaded image with form values for reference
        console.log("Uploaded image with form values:", vals);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload an image.");
    }
  });
});

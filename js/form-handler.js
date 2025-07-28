window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("lububuForm");
  const photo = document.getElementById("photo");
  const generateBtn = document.getElementById("generateLububu");
  const imagePlaceholder = document.getElementById("image-placeholder");
  const imageAlignmentContainer = document.getElementById("image-alignment-container");
  const userImage = document.getElementById("user-image");
  const imageContainer = document.getElementById("image-container");
  const zoomSlider = document.getElementById("zoom-slider");
  const zoomValue = document.getElementById("zoom-value");
  const resetPositionBtn = document.getElementById("reset-position");
  const processImageBtn = document.getElementById("process-image");

  // Image alignment state
  let isDragging = false;
  let startX, startY;
  let currentX = 0, currentY = 0;
  let currentScale = 1;
  let uploadedImageData = null;

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

  // Initialize image alignment tool
  function initImageAlignment() {
    // Zoom slider
    zoomSlider.addEventListener("input", (e) => {
      currentScale = e.target.value / 100;
      zoomValue.textContent = `${e.target.value}%`;
      updateImageTransform();
    });

    // Reset position
    resetPositionBtn.addEventListener("click", () => {
      currentX = 0;
      currentY = 0;
      currentScale = 1;
      zoomSlider.value = 100;
      zoomValue.textContent = "100%";
      updateImageTransform();
    });

    // Mouse events for dragging
    imageContainer.addEventListener("mousedown", startDrag);
    imageContainer.addEventListener("mousemove", drag);
    imageContainer.addEventListener("mouseup", stopDrag);
    imageContainer.addEventListener("mouseleave", stopDrag);

    // Touch events for mobile
    imageContainer.addEventListener("touchstart", startDrag);
    imageContainer.addEventListener("touchmove", drag);
    imageContainer.addEventListener("touchend", stopDrag);
  }

  function startDrag(e) {
    e.preventDefault();
    isDragging = true;

    if (e.type === "mousedown") {
      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
    } else if (e.type === "touchstart") {
      startX = e.touches[0].clientX - currentX;
      startY = e.touches[0].clientY - currentY;
    }
  }

  function drag(e) {
    e.preventDefault();
    if (!isDragging) return;

    if (e.type === "mousemove") {
      currentX = e.clientX - startX;
      currentY = e.clientY - startY;
    } else if (e.type === "touchmove") {
      currentX = e.touches[0].clientX - startX;
      currentY = e.touches[0].clientY - startY;
    }

    updateImageTransform();
  }

  function stopDrag() {
    isDragging = false;
  }

  function updateImageTransform() {
    userImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
  }

  // Crop image to 512x512 based on current position
  function cropImage() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 512;
    canvas.height = 512;

    // Calculate the visible area of the image
    const containerSize = 512;
    const imageRect = userImage.getBoundingClientRect();
    const containerRect = imageContainer.getBoundingClientRect();

    // Calculate the source rectangle on the original image
    const scaleX = userImage.naturalWidth / imageRect.width;
    const scaleY = userImage.naturalHeight / imageRect.height;

    const sourceX = (containerRect.left - imageRect.left) * scaleX;
    const sourceY = (containerRect.top - imageRect.top) * scaleY;
    const sourceWidth = containerSize * scaleX;
    const sourceHeight = containerSize * scaleY;

    // Draw the cropped image
    ctx.drawImage(userImage, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, 512, 512);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = reader.result.split(',')[1];
          resolve(base64Data);
        };
        reader.readAsDataURL(blob);
      }, 'image/png');
    });
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

  // Handle file input change
  photo.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PNG or JPG image file.");
      return;
    }

    // Validate file size (max 4MB)
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (file.size > maxSize) {
      alert("Please upload an image smaller than 4MB.");
      return;
    }

    // Show alignment tool and load image
    const reader = new FileReader();
    reader.onload = (e) => {
      userImage.src = e.target.result;
      uploadedImageData = e.target.result;

      // Reset position and show alignment tool
      currentX = 0;
      currentY = 0;
      currentScale = 1;
      zoomSlider.value = 100;
      zoomValue.textContent = "100%";
      updateImageTransform();

      imageAlignmentContainer.style.display = "block";
      imagePlaceholder.style.display = "none";
    };
    reader.readAsDataURL(file);
  });

  // Handle process image button
  processImageBtn.addEventListener("click", async () => {
    if (!uploadedImageData) {
      alert("Please upload an image first.");
      return;
    }

    // Show loading
    processImageBtn.disabled = true;
    processImageBtn.textContent = "Processing...";

    try {
      // Crop the image based on current alignment
      const croppedImageData = await cropImage();

      const vals = getValues();

      // Send to API for processing
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: "image-to-image",
          imageData: croppedImageData,
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

      // Display the processed image
      if (imagePlaceholder) {
        let html = `<img src="${data.imageUrl}" alt="Your processed image" style="max-width: 400px; width: 100%; height: auto; border: 2px solid #f089c8; border-radius: 12px; display: block; margin: 0 auto;" />`;

        if (data.message) {
          html += `<p style="text-align: center; margin-top: 0.5rem; color: #666; font-size: 0.9rem;">${data.message}</p>`;
        }

        imagePlaceholder.innerHTML = html;
      }

      // Hide alignment tool and show result
      imageAlignmentContainer.style.display = "none";
      imagePlaceholder.style.display = "block";

      console.log("Image processed successfully:", data.imageUrl);

    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try again.");
    } finally {
      // Reset button
      processImageBtn.disabled = false;
      processImageBtn.textContent = "Process Image";
    }
  });

  // Initialize the alignment tool
  initImageAlignment();
});

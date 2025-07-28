window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("lububuForm");
  const photo = document.getElementById("photo");
  const generateBtn = document.getElementById("generateLububu");
  const imgEl = document.getElementById("lububuImage");

  function getValues() {
    return {
      gender: document.getElementById("gender").value,
      teeth: document.getElementById("teeth").value,
      furColor: document.getElementById("furColor").value,
      eyes: document.getElementById("eyes").value,
      mood: document.getElementById("mood").value,
      tail: document.getElementById("tail").value,
      accessories: document.getElementById("accessories").value,
      clothes: document.getElementById("clothes").value,
    };
  }

  generateBtn.addEventListener("click", async () => {
    const vals = getValues();
    const prompt = `A stylized plush creature inspired by the Labubu toy line. Gender: ${vals.gender}, Teeth: ${vals.teeth}, Fur: ${vals.furColor}, Eyes: ${vals.eyes}, Mood: ${vals.mood}, Tail: ${vals.tail}, Accessories: ${vals.accessories}, Clothes: ${vals.clothes}. Studio lighting, white background, toy figure.`;
    console.log("Generating Lububu with prompt:", prompt);
    // Optional: fetch DALL·E image here and assign to imgEl.src
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
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload an image.");
    }
  });
});

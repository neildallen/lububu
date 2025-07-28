


window.addEventListener("DOMContentLoaded", () => {
  // Title animation
  const title = document.querySelector(".main-title");
  const text = title.textContent;
  title.innerHTML = text.split("").map(letter => `<span>${letter}</span>`).join("");

  gsap.from(".main-title span", {
    y: -100,
    opacity: 0,
    ease: "bounce.out",
    duration: 1.2,
    stagger: 0.1,
  });

  // Logo animation
  gsap.from(".logo", {
    duration: 2,
    scale: 0.3,
    y: -200,
    ease: "bounce.out",
    rotation: 10,
  });

  gsap.to(".logo", {
    duration: 1.2,
    rotate: 0,
    ease: "elastic.out(1, 0.3)",
    delay: 2.2
  });

  // CA container slides in smoothly from left
  gsap.from(".ca-container", {
    x: -800,           // starts off-screen to the left
    opacity: 0,        // fade in
    duration: 1.2,     // total time
    ease: "power4.out" // fast start, slow finish — natural easing
  });

  // Form flips in from the left
  gsap.from(".id-form", {
    duration: 1.2,
    opacity: 0,
    rotationY: -90,          // flip from left
    transformOrigin: "left center", // pivot on the left edge
    ease: "power2.out"
  });

  // Lububu button cute color cycle
  const lububuBtn = document.getElementById("generateLububu");

  if (lububuBtn) {
    const cuteColors = [
      "#89CFF0", // baby blue
      "#AFCBFF", // powdery periwinkle
      "#FFB6C1", // baby pink
      "#FFD6E8", // light strawberry milk
      "#FFFACD", // cute yellow (lemon chiffon)
      "#FFEFD5", // soft peach cream
      "#FFDEAD", // peachy
      "#E0BBE4", // soft lavender
      "#CBAACB", // dusty mauve
      "#A3D8F4", // sky pastel blue (blends back to #89CFF0 nicely)
    ];

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });

    cuteColors.forEach((color) => {
      tl.to(lububuBtn, {
        backgroundColor: color,
        duration: 1.2,
        ease: "power1.inOut"
      });
    });
  }




  // Background icon animation
  gsap.from(".bg-icons img", {
    duration: 0.8,
    scale: 0,
    rotation: 30,
    ease: "elastic.out(1, 0.4)",
    stagger: 0.05
  });

  // Pulse animation on buttons
  gsap.from(".id-form button, .footer button", {
    scale: 0.9,
    opacity: 0,
    duration: 2,
    ease: "back.out(1.7)",
    stagger: 0.1,
  });

  // Hover animation on buttons
  document.querySelectorAll(".id-form button, .footer button").forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      gsap.to(btn, {
        backgroundColor: "#72bfe0",
        duration: 0.2,
      });
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, {
        backgroundColor: "#89CFF0",
        duration: 0.2,
      });
    });
  });

  // Copy CA logic
  const copyBtn = document.getElementById("copyCaBtn");
  const caTextElem = document.getElementById("ca-text");
  if (copyBtn && caTextElem) {
    copyBtn.addEventListener("click", () => {
      const raw = caTextElem.innerText;
      const actualCA = raw.replace(/^CA:\s*/, "").trim();
      navigator.clipboard.writeText(actualCA)
        .then(() => alert("CA copied to clipboard!"))
        .catch(() => alert("Failed to copy CA."));
    });
  }
});

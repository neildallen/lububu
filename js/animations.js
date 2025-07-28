


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

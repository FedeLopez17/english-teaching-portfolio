const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });
}

(() => {
  const lightbox = document.getElementById("imageLightbox");

  if (!lightbox) return;

  const image = lightbox.querySelector(".lightbox-image");
  const imageWrap = lightbox.querySelector(".lightbox-image-wrap");

  const closeButton = lightbox.querySelector(".lightbox-close");
  const previousButton = lightbox.querySelector(".lightbox-prev");
  const nextButton = lightbox.querySelector(".lightbox-next");

  const zoomInButton = document.getElementById("zoomIn");
  const zoomOutButton = document.getElementById("zoomOut");
  const zoomResetButton = document.getElementById("zoomReset");
  const counter = document.getElementById("lightboxCounter");

  const thumbnails = Array.from(
    document.querySelectorAll(".visit-gallery-item img"),
  );

  let currentIndex = 0;
  let zoom = 1;
  let offsetX = 0;
  let offsetY = 0;

  let dragging = false;
  let moved = false;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let startingOffsetX = 0;
  let startingOffsetY = 0;

  let previousFocus = null;

  function updateTransform() {
    image.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;

    image.classList.toggle("zoomed", zoom > 1);
  }

  function resetZoom() {
    zoom = 1;
    offsetX = 0;
    offsetY = 0;
    updateTransform();
  }

  function setZoom(value) {
    zoom = Math.max(1, Math.min(4, value));

    if (zoom === 1) {
      offsetX = 0;
      offsetY = 0;
    }

    updateTransform();
  }

  function displayImage(index) {
    if (!thumbnails.length) return;

    currentIndex = (index + thumbnails.length) % thumbnails.length;

    const selected = thumbnails[currentIndex];

    image.src = selected.src;
    image.alt = selected.alt;

    counter.textContent = `${currentIndex + 1} / ${thumbnails.length}`;

    resetZoom();
  }

  function openViewer(index) {
    previousFocus = document.activeElement;

    displayImage(index);

    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    closeButton.focus();
  }

  function closeViewer() {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");

    image.removeAttribute("src");
    document.body.style.overflow = "";

    resetZoom();

    if (previousFocus && previousFocus.focus) {
      previousFocus.focus();
    }
  }

  function nextImage() {
    displayImage(currentIndex + 1);
  }

  function previousImage() {
    displayImage(currentIndex - 1);
  }

  // Open the viewer from any of the ten thumbnails.
  document.querySelectorAll(".visit-gallery-item").forEach((button, index) => {
    button.addEventListener("click", () => openViewer(index));
  });

  // Navigation buttons.
  previousButton.addEventListener("click", (event) => {
    event.stopPropagation();
    previousImage();
  });

  nextButton.addEventListener("click", (event) => {
    event.stopPropagation();
    nextImage();
  });

  // Zoom buttons.
  zoomInButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setZoom(zoom + 0.5);
  });

  zoomOutButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setZoom(zoom - 0.5);
  });

  zoomResetButton.addEventListener("click", (event) => {
    event.stopPropagation();
    resetZoom();
  });

  // Clicking the image toggles between normal size and 2x zoom.
  image.addEventListener("click", () => {
    if (moved) {
      moved = false;
      return;
    }

    setZoom(zoom > 1 ? 1 : 2);
  });

  // Drag the image when zoomed in.
  image.addEventListener("pointerdown", (event) => {
    if (zoom <= 1) return;

    dragging = true;
    moved = false;

    pointerStartX = event.clientX;
    pointerStartY = event.clientY;

    startingOffsetX = offsetX;
    startingOffsetY = offsetY;

    image.setPointerCapture(event.pointerId);
  });

  image.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    const dx = event.clientX - pointerStartX;
    const dy = event.clientY - pointerStartY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      moved = true;
    }

    offsetX = startingOffsetX + dx;
    offsetY = startingOffsetY + dy;

    updateTransform();
  });

  function stopDragging() {
    dragging = false;
  }

  image.addEventListener("pointerup", stopDragging);
  image.addEventListener("pointercancel", stopDragging);

  // Close when clicking the dark background.
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeViewer();
    }
  });

  closeButton.addEventListener("click", closeViewer);

  // Keyboard navigation and zoom shortcuts.
  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("active")) return;

    if (event.key === "Escape") {
      closeViewer();
    } else if (event.key === "ArrowRight") {
      nextImage();
    } else if (event.key === "ArrowLeft") {
      previousImage();
    } else if (event.key === "+" || event.key === "=") {
      setZoom(zoom + 0.5);
    } else if (event.key === "-") {
      setZoom(zoom - 0.5);
    } else if (event.key === "0") {
      resetZoom();
    }
  });

  // Mouse wheel zoom.
  imageWrap.addEventListener(
    "wheel",
    (event) => {
      if (!lightbox.classList.contains("active")) return;

      event.preventDefault();

      if (event.deltaY < 0) {
        setZoom(zoom + 0.25);
      } else {
        setZoom(zoom - 0.25);
      }
    },
    { passive: false },
  );
})();

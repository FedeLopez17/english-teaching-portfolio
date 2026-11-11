// ============================================
// MOBILE NAVIGATION
// ============================================

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


// ============================================
// ACKNOWLEDGEMENTS CAROUSEL
// ============================================

(() => {
  const carousel = document.querySelector(".acknowledgements-carousel");
  if (!carousel) return;

  const slides = Array.from(
    carousel.querySelectorAll(".acknowledgements-slide"),
  );

  const indicators = Array.from(
    carousel.querySelectorAll(".ack-carousel-indicators button"),
  );

  const previous = carousel.querySelector(".ack-carousel-arrow.prev");
  const next = carousel.querySelector(".ack-carousel-arrow.next");

  if (
    slides.length === 0 ||
    slides.length !== indicators.length ||
    !previous ||
    !next
  ) {
    return;
  }

  let currentIndex = slides.findIndex((slide) =>
    slide.classList.contains("active"),
  );

  if (currentIndex < 0) currentIndex = 0;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === currentIndex);
    });

    indicators.forEach((indicator, i) => {
      indicator.classList.toggle("active", i === currentIndex);
    });
  }

  previous.addEventListener("click", () => showSlide(currentIndex - 1));
  next.addEventListener("click", () => showSlide(currentIndex + 1));

  indicators.forEach((indicator, i) => {
    indicator.addEventListener("click", () => showSlide(i));
  });
})();


// ============================================
// SHARED IMAGE LIGHTBOX
// ============================================

(() => {
  const lightbox = document.getElementById("imageLightbox");
  if (!lightbox) return;

  const image = lightbox.querySelector(".lightbox-image");
  const imageWrap = lightbox.querySelector(".lightbox-image-wrap");
  const closeButton = lightbox.querySelector(".lightbox-close");
  const previousButton = lightbox.querySelector(".lightbox-prev");
  const nextButton = lightbox.querySelector(".lightbox-next");
  const zoomInButton = lightbox.querySelector("#zoomIn");
  const zoomOutButton = lightbox.querySelector("#zoomOut");
  const zoomResetButton = lightbox.querySelector("#zoomReset");
  const counter = lightbox.querySelector("#lightboxCounter");

  if (
    !image ||
    !imageWrap ||
    !closeButton ||
    !previousButton ||
    !nextButton ||
    !zoomInButton ||
    !zoomOutButton ||
    !zoomResetButton ||
    !counter
  ) {
    return;
  }

  // Make every content image open in the shared viewer. Existing gallery
  // triggers keep their own groups; other images on the page form one group.
  document.querySelectorAll("main img:not(.lightbox-image)").forEach((img) => {
    if (img.closest(".lightbox-trigger")) return;

    img.classList.add("lightbox-trigger");
    img.dataset.gallery = "page-images";
    img.tabIndex = img.closest("a") ? -1 : 0;
    img.setAttribute("role", "button");

    if (!img.hasAttribute("aria-label")) {
      img.setAttribute(
        "aria-label",
        `Enlarge image: ${img.alt || "portfolio image"}`,
      );
    }
  });

  // Existing gallery triggers retain their own groups.
  const allTriggers = Array.from(
    document.querySelectorAll(".lightbox-trigger[data-gallery]"),
  );

  let activeGallery = [];
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

  let touchStartX = 0;
  let touchStartY = 0;

  let previousFocus = null;

  function getImageElement(trigger) {
    if (trigger.tagName === "IMG") return trigger;
    return trigger.querySelector("img");
  }

  function updateTransform() {
    image.style.transform =
      `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;

    image.classList.toggle("zoomed", zoom > 1);
    image.style.cursor = zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in";
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
    if (!activeGallery.length) return;

    currentIndex = (index + activeGallery.length) % activeGallery.length;

    const selectedImage = getImageElement(activeGallery[currentIndex]);
    if (!selectedImage) return;

    image.src = selectedImage.currentSrc || selectedImage.src;
    image.alt = selectedImage.alt || "";

    counter.textContent = `${currentIndex + 1} / ${activeGallery.length}`;

    resetZoom();
  }

  function openViewer(trigger) {
    const galleryName = trigger.dataset.gallery;

    activeGallery = allTriggers.filter(
      (item) => item.dataset.gallery === galleryName,
    );

    currentIndex = activeGallery.indexOf(trigger);
    if (currentIndex < 0) return;

    previousFocus = document.activeElement;

    displayImage(currentIndex);

    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    closeButton.focus();
  }

  function closeViewer() {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");

    image.removeAttribute("src");
    image.alt = "";

    document.body.style.overflow = "";
    resetZoom();

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  function showNext() {
    displayImage(currentIndex + 1);
  }

  function showPrevious() {
    displayImage(currentIndex - 1);
  }

  // Open the viewer when any gallery trigger is clicked.
  allTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openViewer(trigger);
    });

    if (trigger.tagName === "IMG") {
      const keyboardTarget = trigger.closest("a") || trigger;

      if (keyboardTarget !== trigger) {
        keyboardTarget.setAttribute("role", "button");
        keyboardTarget.tabIndex = 0;
        keyboardTarget.setAttribute(
          "aria-label",
          `Enlarge image: ${trigger.alt || "portfolio image"}`,
        );
      }

      keyboardTarget.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openViewer(trigger);
        }
      });
    }
  });

  // Previous and next controls.
  previousButton.addEventListener("click", (event) => {
    event.stopPropagation();
    showPrevious();
  });

  nextButton.addEventListener("click", (event) => {
    event.stopPropagation();
    showNext();
  });

  // Zoom controls.
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

  // Clicking the enlarged image toggles between normal size and 2x zoom.
  image.addEventListener("click", () => {
    if (moved) {
      moved = false;
      return;
    }

    setZoom(zoom > 1 ? 1 : 2);
  });

  // Drag to explore an enlarged image.
  image.addEventListener("pointerdown", (event) => {
    if (zoom <= 1) return;

    dragging = true;
    moved = false;

    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    startingOffsetX = offsetX;
    startingOffsetY = offsetY;

    image.setPointerCapture(event.pointerId);
    updateTransform();
  });

  image.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    const dx = event.clientX - pointerStartX;
    const dy = event.clientY - pointerStartY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;

    offsetX = startingOffsetX + dx;
    offsetY = startingOffsetY + dy;

    updateTransform();
  });

  function stopDragging() {
    dragging = false;
    updateTransform();
  }

  image.addEventListener("pointerup", stopDragging);
  image.addEventListener("pointercancel", stopDragging);
  image.addEventListener("lostpointercapture", stopDragging);

  // Swipe left/right on touch screens when the image is not zoomed.
  imageWrap.addEventListener(
    "touchstart",
    (event) => {
      if (zoom > 1 || !event.changedTouches.length) return;

      touchStartX = event.changedTouches[0].screenX;
      touchStartY = event.changedTouches[0].screenY;
    },
    { passive: true },
  );

  imageWrap.addEventListener(
    "touchend",
    (event) => {
      if (zoom > 1 || !event.changedTouches.length) return;

      const touchEndX = event.changedTouches[0].screenX;
      const touchEndY = event.changedTouches[0].screenY;

      const differenceX = touchEndX - touchStartX;
      const differenceY = touchEndY - touchStartY;

      if (
        Math.abs(differenceX) > 50 &&
        Math.abs(differenceX) > Math.abs(differenceY)
      ) {
        if (differenceX < 0) showNext();
        else showPrevious();
      }
    },
    { passive: true },
  );

  // Close by clicking the dark background or the close button.
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeViewer();
  });

  closeButton.addEventListener("click", closeViewer);

  // Keyboard shortcuts.
  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("active")) return;

    if (event.key === "Escape") {
      closeViewer();
    } else if (event.key === "ArrowRight" && zoom === 1) {
      showNext();
    } else if (event.key === "ArrowLeft" && zoom === 1) {
      showPrevious();
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

      if (event.deltaY < 0) setZoom(zoom + 0.25);
      else setZoom(zoom - 0.25);
    },
    { passive: false },
  );
})();

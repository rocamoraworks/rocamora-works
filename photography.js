// Freeform photography page.
// This list is synced from Images/photography by scripts/update-photography-list.sh.
const PHOTO_FOLDER = "Images/photography";
const PHOTO_FILES = [
  "DSC00787.jpg",
  "DSC00788.jpg",
  "DSC00820.jpg",
  "DSC00823.jpg",
  "DSC00846.jpg",
  "DSC00848.jpg",
  "DSC00849.jpg",
  "DSC00853.jpg",
  "DSC00855.jpg",
  "DSC00869.jpg",
  "DSC02235.jpg",
  "DSC03246.jpg",
  "DSC04245-2.jpg",
  "DSC04245.jpg",
  "DSC04252-2.jpg",
  "DSC04252.jpg",
  "DSC06191.jpg",
  "DSC06216.jpg",
  "DSC06224.jpg",
  "DSC06949.jpg",
  "DSC07071-2.jpg",
  "DSC07071.jpg",
  "DSC07076-2.jpg",
  "DSC07076.jpg",
  "DSC07077-2.jpg",
  "DSC07077.jpg",
  "DSC07084.jpg",
  "DSC07102.jpg",
  "DSC07212-2.jpg",
  "DSC07212.jpg",
  "DSC07219-2.jpg",
  "DSC07219.jpg",
  "DSC07234-2.jpg",
  "DSC07234.jpg",
  "DSC07261-2.jpg",
  "DSC07261.jpg",
  "DSC07726.jpg",
  "DSC07745.jpg",
  "DSC07751.jpg",
  "DSC07881.jpg",
  "DSC07989.jpg",
  "DSC08289.jpg",
  "DSC08317.jpg",
  "DSC08602-2.jpg",
  "DSC08602.jpg",
  "DSC08949.jpg",
  "FLIPHeadShots - 194.jpg",
  "FLIPHeadShots - 226.jpg",
  "FLIPHeadShots - 244.jpg",
  "FLIPHeadShots - 325.jpg",
  "Gigi - 479.jpg",
  "Gigi - 480.jpg",
  "Gigi - 481.jpg",
];

const photoField = document.querySelector("#photoField");
const dragClickThreshold = 7;

// Layout spacing controls:
// - PHOTO_VERTICAL_SPACING changes distance between photos in the same pattern.
// - PHOTO_ROW_SPACING changes distance before the pattern repeats.
// - PHOTO_HORIZONTAL_SPREAD pushes photos outward from the center.
// - PHOTO_RANDOM_X and PHOTO_RANDOM_Y add controlled organic randomness.
// - PHOTO_CANVAS_EXTRA keeps the page tall enough for larger spacing.
const PHOTO_VERTICAL_SPACING = 1.38;
const PHOTO_ROW_SPACING = 170;
const PHOTO_HORIZONTAL_SPREAD = 1.08;
const PHOTO_RANDOM_X = 7;
const PHOTO_RANDOM_Y = 14;
const PHOTO_CANVAS_EXTRA = 70;

const layoutPattern = [
  { left: 6, top: 3, width: "32vw", rotate: "-2.5deg" },
  { left: 48, top: 8, width: "29vw", rotate: "1.5deg" },
  { left: 18, top: 24, width: "36vw", rotate: "2deg" },
  { left: 62, top: 32, width: "25vw", rotate: "-1deg" },
  { left: 5, top: 46, width: "28vw", rotate: "1deg" },
  { left: 42, top: 55, width: "38vw", rotate: "-2deg" },
  { left: 22, top: 72, width: "27vw", rotate: "-1.5deg" },
  { left: 58, top: 82, width: "31vw", rotate: "2.5deg" },
  { left: 10, top: 100, width: "34vw", rotate: "1.5deg" },
  { left: 52, top: 112, width: "30vw", rotate: "-1deg" },
];

let activePhotoDrag = null;
let photoViewer = null;
let photoViewerImage = null;

const getPhotoPixelValue = (photo, property) =>
  parseFloat(photo.style.getPropertyValue(property)) || 0;

function seededRandom(seed) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4294967295;
}

function getSpreadLeft(left) {
  return Math.min(82, Math.max(2, 50 + (left - 50) * PHOTO_HORIZONTAL_SPREAD));
}

function updatePhotoFieldHeight() {
  const rowCount = Math.ceil(PHOTO_FILES.length / layoutPattern.length);
  const height = Math.max(260, rowCount * PHOTO_ROW_SPACING + PHOTO_CANVAS_EXTRA);
  const photoCanvas = photoField.closest(".photo-canvas");

  photoField.style.setProperty("--photo-field-height", `${height}vh`);

  if (photoCanvas) {
    photoCanvas.style.setProperty("--photo-field-height", `${height}vh`);
  }
}

function createLoosePhoto(file, index) {
  const pattern = layoutPattern[index % layoutPattern.length];
  const row = Math.floor(index / layoutPattern.length);
  const randomX = (seededRandom(`${file}-x`) - 0.5) * PHOTO_RANDOM_X;
  const randomY = (seededRandom(`${file}-y`) - 0.5) * PHOTO_RANDOM_Y;
  const left = getSpreadLeft(pattern.left) + randomX;
  const top = pattern.top * PHOTO_VERTICAL_SPACING + row * PHOTO_ROW_SPACING + randomY;
  const photo = document.createElement("figure");
  const image = document.createElement("img");

  photo.className = "loose-photo";
  photo.style.setProperty("--photo-left", `${left.toFixed(2)}%`);
  photo.style.setProperty("--photo-top", `${top.toFixed(2)}vh`);
  photo.style.setProperty("--photo-width", pattern.width);
  photo.style.setProperty("--photo-rotate", pattern.rotate);
  photo.style.setProperty("--photo-z", String(index + 1));
  photo.style.setProperty("--drag-x", "0px");
  photo.style.setProperty("--drag-y", "0px");

  image.src = `${PHOTO_FOLDER}/${file}`;
  image.alt = file.replace(/\.[^.]+$/, "").replaceAll("-", " ");
  image.loading = "lazy";
  image.draggable = false;

  photo.append(image);
  return photo;
}

function createPhotoViewer() {
  photoViewer = document.createElement("div");
  photoViewerImage = document.createElement("img");

  photoViewer.className = "photo-viewer";
  photoViewer.setAttribute("aria-hidden", "true");
  photoViewerImage.alt = "";
  photoViewerImage.draggable = false;

  photoViewer.append(photoViewerImage);
  document.body.append(photoViewer);

  photoViewer.addEventListener("click", closePhotoViewer);
}

function openPhotoViewer(image) {
  if (!photoViewer) createPhotoViewer();

  photoViewerImage.src = image.src;
  photoViewerImage.alt = image.alt;
  photoViewer.classList.add("is-open");
  photoViewer.setAttribute("aria-hidden", "false");
}

function closePhotoViewer() {
  if (!photoViewer) return;

  photoViewer.classList.remove("is-open");
  photoViewer.setAttribute("aria-hidden", "true");
}

function updatePhotoFade() {
  const viewportHeight = window.innerHeight;
  const fadeDistance = viewportHeight * 0.92;

  document.querySelectorAll(".loose-photo").forEach((photo) => {
    const rect = photo.getBoundingClientRect();
    const photoCenter = rect.top + rect.height / 2;
    const viewportCenter = viewportHeight / 2;
    const distance = Math.abs(photoCenter - viewportCenter);
    const opacity = Math.max(0.32, 1 - distance / fadeDistance);

    photo.style.setProperty("--photo-opacity", opacity.toFixed(3));
    photo.classList.toggle("is-faded", opacity < 0.45);
  });
}

function startPhotoDrag(event) {
  const photo = event.currentTarget;

  event.preventDefault();
  photo.setPointerCapture(event.pointerId);
  photo.classList.add("is-dragging");

  activePhotoDrag = {
    photo,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    moved: false,
    dragX: getPhotoPixelValue(photo, "--drag-x"),
    dragY: getPhotoPixelValue(photo, "--drag-y"),
  };
}

function movePhotoDrag(event) {
  if (!activePhotoDrag || event.pointerId !== activePhotoDrag.pointerId) return;

  const nextX = activePhotoDrag.dragX + event.clientX - activePhotoDrag.startX;
  const nextY = activePhotoDrag.dragY + event.clientY - activePhotoDrag.startY;
  const distance = Math.hypot(
    event.clientX - activePhotoDrag.startX,
    event.clientY - activePhotoDrag.startY
  );

  if (distance > dragClickThreshold) {
    activePhotoDrag.moved = true;
  }

  activePhotoDrag.photo.style.setProperty("--drag-x", `${nextX.toFixed(1)}px`);
  activePhotoDrag.photo.style.setProperty("--drag-y", `${nextY.toFixed(1)}px`);
  updatePhotoFade();
}

function stopPhotoDrag(event) {
  if (!activePhotoDrag || event.pointerId !== activePhotoDrag.pointerId) return;

  const didMove = activePhotoDrag.moved;
  const image = activePhotoDrag.photo.querySelector("img");

  activePhotoDrag.photo.classList.remove("is-dragging");
  activePhotoDrag.photo.releasePointerCapture(event.pointerId);
  activePhotoDrag = null;

  if (!didMove && image) {
    openPhotoViewer(image);
  }
}

if (photoField) {
  updatePhotoFieldHeight();

  PHOTO_FILES.forEach((file, index) => {
    const photo = createLoosePhoto(file, index);

    photo.addEventListener("dragstart", (event) => event.preventDefault());
    photo.addEventListener("pointerdown", startPhotoDrag);
    photo.addEventListener("pointermove", movePhotoDrag);
    photo.addEventListener("pointerup", stopPhotoDrag);
    photo.addEventListener("pointercancel", stopPhotoDrag);
    photoField.append(photo);
  });

  window.addEventListener("scroll", updatePhotoFade, { passive: true });
  window.addEventListener("resize", updatePhotoFade);
  updatePhotoFade();
}

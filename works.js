// Architecture scroll test.
// Add the .building-story class to any project section you want animated.
// This maps scroll position to --story-progress, so images rise from below
// the viewport instead of simply appearing after a trigger point.
const buildingStories = [...document.querySelectorAll(".building-story")];

// Animation tuning controls:
// - PROGRESS_SECTION_WEIGHT controls timing/sync with each section.
//   Lower number = image reaches final position sooner.
//   Higher number = image takes longer and stays tied to the section longer.
// - IMAGE_SLIDE_DISTANCE controls how far below the page the image starts.
// - COPY_SLIDE_DISTANCE controls how much the text drifts up with the image.
// - IMAGE_FADE_SPEED and COPY_FADE_SPEED control how quickly each fades in.
// - COPY_FADE_DELAY keeps the text slightly behind the image.
const PROGRESS_SECTION_WEIGHT = .1;
const IMAGE_SLIDE_DISTANCE = 0.16;
const COPY_SLIDE_DISTANCE = 0.48;
const IMAGE_FADE_SPEED = 1.35;
const COPY_FADE_SPEED = 1.8;
const COPY_FADE_DELAY = 0.12;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function updateBuildingProgress() {
  const viewportHeight = window.innerHeight;

  buildingStories.forEach((story) => {
    const rect = story.getBoundingClientRect();

    // Progress moves from 0 to 1 while the visitor scrolls through this story.
    // This is the main line to tweak if the image feels early or late.
    const rawProgress =
      (viewportHeight - rect.top) /
      (viewportHeight + rect.height * PROGRESS_SECTION_WEIGHT);
    const progress = clamp(rawProgress, 0, 1);

    // These values are sent to CSS as custom properties used by style.css.
    const imageY = (1 - progress) * viewportHeight * IMAGE_SLIDE_DISTANCE;
    const copyY = (1 - progress) * viewportHeight * COPY_SLIDE_DISTANCE;
    const imageOpacity = clamp(progress * IMAGE_FADE_SPEED, 0, 1);
    const copyOpacity = clamp((progress - COPY_FADE_DELAY) * COPY_FADE_SPEED, 0, 1);

    story.style.setProperty("--story-progress", progress.toFixed(3));
    story.style.setProperty("--image-y", `${imageY.toFixed(1)}px`);
    story.style.setProperty("--copy-y", `${copyY.toFixed(1)}px`);
    story.style.setProperty("--image-opacity", imageOpacity.toFixed(3));
    story.style.setProperty("--copy-opacity", copyOpacity.toFixed(3));
    story.classList.toggle("is-active", progress > 0.04 && progress < 0.96);
  });
}

window.addEventListener("scroll", updateBuildingProgress, { passive: true });
window.addEventListener("resize", updateBuildingProgress);
updateBuildingProgress();

// Which home-hero video file to load, or null for none (the photo stays).
// env: { reduceMotion, saveData, viewportWidth (CSS px), pixelRatio }
export function pickHeroVideo({ reduceMotion, saveData, viewportWidth, pixelRatio }) {
  if (reduceMotion || saveData) return null;
  if (viewportWidth <= 720) return "/assets/video/hero-720p.mp4";
  if (viewportWidth >= 1600 || (viewportWidth >= 1100 && pixelRatio >= 2)) return "/assets/video/hero-1440p.mp4";
  return "/assets/video/hero-1080p.mp4";
}

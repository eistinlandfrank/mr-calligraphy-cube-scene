import productShowcase from "./capsule-product-showcase.json";
import elderExperience from "./capsule-elder-experience.json";
import caregiverMonitor from "./capsule-caregiver-monitor.json";
import calligraphyGameYong from "./calligraphy-game-yong.json";
import inkGalleryReport from "./ink-gallery-report.json";

export const sceneConfigs = [
  productShowcase,
  elderExperience,
  caregiverMonitor,
  calligraphyGameYong,
  inkGalleryReport
];

export const sceneConfigById = Object.fromEntries(
  sceneConfigs.map((sceneConfig) => [sceneConfig.id, sceneConfig])
);

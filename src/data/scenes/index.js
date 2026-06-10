import productShowcase from "./capsule-product-showcase.json" assert { type: "json" };
import elderExperience from "./capsule-elder-experience.json" assert { type: "json" };
import caregiverMonitor from "./capsule-caregiver-monitor.json" assert { type: "json" };
import calligraphyGameYong from "./calligraphy-game-yong.json" assert { type: "json" };
import inkGalleryReport from "./ink-gallery-report.json" assert { type: "json" };

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

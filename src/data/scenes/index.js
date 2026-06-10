import productShowcase from "./capsule-product-showcase.json" with { type: "json" };
import elderExperience from "./capsule-elder-experience.json" with { type: "json" };
import caregiverMonitor from "./capsule-caregiver-monitor.json" with { type: "json" };
import calligraphyGameYong from "./calligraphy-game-yong.json" with { type: "json" };
import inkGalleryReport from "./ink-gallery-report.json" with { type: "json" };

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

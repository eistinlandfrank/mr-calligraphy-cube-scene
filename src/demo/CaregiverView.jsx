import { CaregiverDashboard } from "../scene-core/CaregiverDashboard.jsx";

export function CaregiverView({ phase, sceneConfig, progress, currentStroke, remainingSeconds, isPaused, onAction }) {
  return (
    <div className="mode-panel caregiver-panel" aria-label="护工视角">
      <CaregiverDashboard
        data={sceneConfig?.caregiverData}
        phase={phase}
        progress={progress}
        currentStroke={currentStroke}
        remainingSeconds={remainingSeconds}
        isPaused={isPaused}
        onAction={onAction}
      />
    </div>
  );
}

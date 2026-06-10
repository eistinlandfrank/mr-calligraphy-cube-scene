import { VirtualCalligraphyGame } from "../scene-core/VirtualCalligraphyGame.jsx";

export function ElderView({ phase, onGameProgress, onGameComplete }) {
  return (
    <section className="mode-panel elder-panel" aria-label="老人视角">
      <div className="panel-heading">
        <span>Elder View</span>
        <strong>舱内水墨书法空间</strong>
      </div>
      <VirtualCalligraphyGame onProgressChange={onGameProgress} onComplete={onGameComplete} />
      <div className="phase-strip">
        <span>当前阶段</span>
        <strong>{phase.label}</strong>
        <small>{phase.status}</small>
      </div>
    </section>
  );
}

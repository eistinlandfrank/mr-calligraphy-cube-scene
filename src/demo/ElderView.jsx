import yongCharacter from "../data/calligraphy/yongCharacter.json" assert { type: "json" };
import { VirtualCalligraphyGame } from "../scene-core/VirtualCalligraphyGame.jsx";

export function ElderView({ phase, onGameProgress, onGameComplete }) {
  const showTutorial = phase.id === "calligraphy_tutorial";

  return (
    <section className="mode-panel elder-panel" aria-label="老人视角">
      <div className="panel-heading">
        <span>Elder View</span>
        <strong>舱内水墨书法空间</strong>
      </div>
      {showTutorial ? (
        <CalligraphyTutorial />
      ) : (
        <VirtualCalligraphyGame onProgressChange={onGameProgress} onComplete={onGameComplete} />
      )}
      <div className="phase-strip">
        <span>当前阶段</span>
        <strong>{phase.label}</strong>
        <small>{phase.status}</small>
      </div>
    </section>
  );
}

function CalligraphyTutorial() {
  return (
    <section className="calligraphy-tutorial-card" aria-label="书法讲解">
      <div className="tutorial-glyph">
        <span>当前练习字</span>
        <strong>{yongCharacter.character}</strong>
        <small>{yongCharacter.title}</small>
      </div>
      <div className="tutorial-strokes">
        {yongCharacter.strokes.map((stroke, index) => (
          <article key={stroke.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{stroke.label}</strong>
            <small>{stroke.tip}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

const strokeItems = ["侧", "勒", "努", "趯", "策", "掠", "啄", "磔"];

export function ElderView({ phase }) {
  return (
    <section className="mode-panel elder-panel" aria-label="老人视角">
      <div className="panel-heading">
        <span>Elder View</span>
        <strong>舱内水墨书法空间</strong>
      </div>
      <div className="elder-workbench">
        <div className="glyph-preview">
          <span>永</span>
        </div>
        <div className="stroke-list">
          {strokeItems.map((item, index) => (
            <span key={item} className={phase.id === "game" && index < 4 ? "is-lit" : ""}>
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="phase-strip">
        <span>当前阶段</span>
        <strong>{phase.label}</strong>
        <small>{phase.status}</small>
      </div>
    </section>
  );
}

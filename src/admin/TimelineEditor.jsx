export function TimelineEditor({ timeline, lastSavedAt }) {
  return (
    <footer className="admin-timeline-bar" aria-label="流程时间轴">
      <div className="admin-save-state">
        <span>Local State</span>
        <strong>{lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString("zh-CN") : "未保存本轮修改"}</strong>
      </div>
      <ol>
        {timeline.map((item) => (
          <li key={`${item.time}-${item.target}`}>
            <span>{item.time}s</span>
            <strong>{item.label ?? item.action}</strong>
            <small>{item.target}</small>
          </li>
        ))}
      </ol>
    </footer>
  );
}

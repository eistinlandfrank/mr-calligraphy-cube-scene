export function LoadingState({ label = "正在加载", detail = "请稍候", className = "" }) {
  return (
    <div className={`loading-state ${className}`} role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <span>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
    </div>
  );
}

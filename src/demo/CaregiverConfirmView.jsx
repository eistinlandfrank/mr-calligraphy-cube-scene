import { Check, RotateCcw, Save } from "lucide-react";

export function CaregiverConfirmView({ phase, report, onAction }) {
  return (
    <section className="mode-panel caregiver-confirm-panel" aria-label="护工确认">
      <div className="panel-heading">
        <span>Caregiver Confirm</span>
        <strong>{phase.label}</strong>
      </div>
      <div className="confirm-summary-card">
        <span>本次综合分</span>
        <strong>{report?.score ?? "--"}</strong>
        <small>{report?.summary ?? "等待报告数据。"}</small>
      </div>
      <div className="confirm-action-grid">
        <button type="button" onClick={() => onAction("confirm")}>
          <Check size={17} strokeWidth={2.2} />
          <span>确认结束</span>
        </button>
        <button type="button" onClick={() => onAction("restart")}>
          <RotateCcw size={17} strokeWidth={2.2} />
          <span>重新练习</span>
        </button>
        <button type="button" onClick={() => onAction("saveReport")}>
          <Save size={17} strokeWidth={2.2} />
          <span>保存报告</span>
        </button>
      </div>
    </section>
  );
}

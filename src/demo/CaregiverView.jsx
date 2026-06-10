import { DoorOpen, Hand, Pause, PhoneCall } from "lucide-react";

const stats = [
  ["心率", "73", "次/分"],
  ["呼吸", "15", "次/分"],
  ["专注", "82", "%"],
  ["情绪", "平稳", ""]
];

const actions = [
  { icon: Pause, label: "暂停" },
  { icon: Hand, label: "结束体验" },
  { icon: DoorOpen, label: "打开舱门" },
  { icon: PhoneCall, label: "呼叫老人" }
];

export function CaregiverView({ phase }) {
  return (
    <section className="mode-panel caregiver-panel" aria-label="护工视角">
      <div className="panel-heading">
        <span>Caregiver View</span>
        <strong>周老师｜永字八法</strong>
      </div>
      <div className="care-stat-grid">
        {stats.map(([label, value, unit]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{unit}</small>
          </article>
        ))}
      </div>
      <div className="care-action-row">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} type="button">
              <Icon size={16} strokeWidth={2.2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="phase-strip">
        <span>当前阶段</span>
        <strong>{phase.label}</strong>
        <small>{phase.status}</small>
      </div>
    </section>
  );
}

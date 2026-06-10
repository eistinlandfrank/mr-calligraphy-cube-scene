import { DoorClosed, Eye, Monitor, Siren } from "lucide-react";

const productSignals = [
  { icon: DoorClosed, label: "舱门", value: "缓闭滑门" },
  { icon: Eye, label: "观察窗", value: "单向守护" },
  { icon: Monitor, label: "护工屏", value: "外部监护" },
  { icon: Siren, label: "安全键", value: "随时接管" }
];

export function ProductView({ phase }) {
  return (
    <section className="mode-panel product-panel" aria-label="产品视角">
      <div className="panel-heading">
        <span>Product View</span>
        <strong>躺卧式胶囊舱</strong>
      </div>
      <div className="signal-grid">
        {productSignals.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label}>
              <Icon size={18} strokeWidth={2.2} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
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

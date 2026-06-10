export const demoTimelineSteps = [
  {
    id: "prepare",
    label: "预约准备",
    mode: "caregiver",
    status: "护工确认课程与状态"
  },
  {
    id: "entry",
    label: "入舱躺卧",
    mode: "product",
    status: "座椅与舱门进入待机"
  },
  {
    id: "door",
    label: "舱门关闭",
    mode: "product",
    status: "外部观察窗与安全屏保持可见"
  },
  {
    id: "immerse",
    label: "沉浸启动",
    mode: "elder",
    status: "老人端进入水墨环幕"
  },
  {
    id: "game",
    label: "书法游戏",
    mode: "elder",
    status: "虚拟毛笔沿永字路径书写"
  },
  {
    id: "report",
    label: "报告生成",
    mode: "caregiver",
    status: "护工端收到完成报告"
  }
];

export function DemoTimeline({ activeStep, onSelectStep }) {
  return (
    <ol className="demo-timeline" aria-label="演示流程">
      {demoTimelineSteps.map((step, index) => (
        <li key={step.id}>
          <button
            type="button"
            className={index === activeStep ? "is-active" : ""}
            aria-current={index === activeStep ? "step" : "false"}
            onClick={() => onSelectStep(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step.label}</strong>
          </button>
        </li>
      ))}
    </ol>
  );
}

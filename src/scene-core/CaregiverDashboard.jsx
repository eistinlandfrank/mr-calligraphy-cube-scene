import { DoorOpen, Hand, Pause, PhoneCall, Play, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const actionItems = [
  { id: "pause", label: "暂停", icon: Pause },
  { id: "end", label: "结束体验", icon: Hand },
  { id: "openDoor", label: "打开舱门", icon: DoorOpen },
  { id: "callElder", label: "呼叫老人", icon: PhoneCall }
];

const phaseAdjustments = {
  prepare: { heartRate: -2, breathRate: 0, focus: -10 },
  entry: { heartRate: 0, breathRate: 0, focus: -6 },
  door: { heartRate: 1, breathRate: 1, focus: 0 },
  immerse: { heartRate: -1, breathRate: -1, focus: 6 },
  game: { heartRate: 2, breathRate: 0, focus: 12 },
  report: { heartRate: -2, breathRate: -1, focus: 4 }
};

export function CaregiverDashboard({
  data,
  phase,
  progress = 0,
  currentStroke = "侧",
  remainingSeconds = 520,
  isPaused = false,
  elderHelpRequest = null,
  compact = false,
  onAction
}) {
  const [tick, setTick] = useState(0);
  const [lastAction, setLastAction] = useState("状态正常，护工可随时接管。");

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => setTick((value) => value + 1), 1200);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    if (elderHelpRequest?.at) {
      setLastAction(`老人端发起第 ${elderHelpRequest.count ?? 1} 次求助，请护工确认状态。`);
    }
  }, [elderHelpRequest]);

  const vitals = useMemo(() => {
    const adjustment = phaseAdjustments[phase?.id] ?? {};
    const wave = Math.sin(tick / 2);

    return {
      heartRate: clamp(Math.round((data?.heartRate ?? 73) + (adjustment.heartRate ?? 0) + wave * 2), 58, 96),
      breathRate: clamp(Math.round((data?.breathRate ?? 15) + (adjustment.breathRate ?? 0) + wave), 10, 24),
      focus: clamp(Math.round((data?.focus ?? 78) + (adjustment.focus ?? 0) + Math.cos(tick / 3) * 3), 0, 100),
      mood: data?.mood ?? "平稳"
    };
  }, [data, phase, tick]);

  const safety = getSafetyState({ vitals, isPaused, phase, elderHelpRequest });
  const remainingTime = formatTime(Math.max(0, remainingSeconds));

  function runAction(actionId) {
    const message = {
      pause: "已暂停老人端流程，计时器与动画停止。",
      end: "已请求结束体验，系统将保存本次记录。",
      openDoor: "已发送开舱指令，等待护工现场确认。",
      callElder: "已向老人端发送温和呼叫提示。"
    }[actionId];

    setLastAction(message);
    onAction?.(actionId);
  }

  return (
    <section className={`caregiver-dashboard ${compact ? "is-compact" : ""}`} aria-label="护工监护端">
      <div className="caregiver-dashboard-head">
        <div>
          <span>Caregiver Monitor</span>
          <strong>{data?.elderName ?? "周老师"}</strong>
        </div>
        <div className={`safety-pill ${safety.level}`}>
          <ShieldCheck size={16} strokeWidth={2.2} />
          <span>{safety.label}</span>
        </div>
      </div>

      <div className="caregiver-session-grid">
        <article>
          <span>当前课程</span>
          <strong>{data?.course ?? "永字八法舒缓体验"}</strong>
        </article>
        <article>
          <span>体验阶段</span>
          <strong>{phase?.label ?? data?.stage ?? "书法游戏"}</strong>
        </article>
        <article aria-label={`剩余时间 ${remainingTime}，由流程状态计时器计算`}>
          <span>剩余时间</span>
          <strong>{remainingTime}</strong>
        </article>
        <article>
          <span>当前笔画</span>
          <strong>{currentStroke}</strong>
        </article>
      </div>

      <div className="caregiver-vitals-grid">
        <VitalCard label="心率" value={vitals.heartRate} unit="次/分" tone="heart" />
        <VitalCard label="呼吸" value={vitals.breathRate} unit="次/分" tone="breath" />
        <VitalCard label="专注度" value={vitals.focus} unit="%" tone="focus" />
        <VitalCard label="情绪" value={vitals.mood} unit="" tone="mood" />
      </div>

      <div className="caregiver-progress">
        <div>
          <span>练习完成度</span>
          <strong>{progress}%</strong>
        </div>
        <div className="caregiver-progress-track" aria-hidden="true">
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="caregiver-action-row">
        {actionItems.map((item) => {
          const Icon = item.id === "pause" && isPaused ? Play : item.icon;
          const label = item.id === "pause" && isPaused ? "继续" : item.label;
          return (
            <button key={item.id} type="button" onClick={() => runAction(item.id)}>
              <Icon size={16} strokeWidth={2.2} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <p className="caregiver-action-feedback">{lastAction}</p>
    </section>
  );
}

function VitalCard({ label, value, unit, tone }) {
  return (
    <article className={`vital-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{unit}</small>
      {typeof value === "number" ? (
        <div className="vital-sparkline" aria-hidden="true">
          <i style={{ width: `${clamp(value, 0, 100)}%` }} />
        </div>
      ) : null}
    </article>
  );
}

function getSafetyState({ vitals, isPaused, phase, elderHelpRequest }) {
  if (elderHelpRequest?.at) {
    return { label: "老人求助", level: "warning" };
  }

  if (isPaused) {
    return { label: "已暂停", level: "paused" };
  }

  if (vitals.heartRate > 90 || vitals.breathRate > 22) {
    return { label: "需关注", level: "warning" };
  }

  if (phase?.id === "report") {
    return { label: "待确认", level: "review" };
  }

  return { label: "安全正常", level: "normal" };
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const nextSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(nextSeconds).padStart(2, "0")}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

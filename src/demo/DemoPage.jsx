import { CircleGauge, HeartPulse, Monitor, Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { loadDefaultProject } from "../data/configLoader.js";
import { SceneRenderer } from "../scene-core/SceneRenderer.jsx";
import { getCurrentFlowState, useFlowStore } from "../store/flowStore.js";
import { selectSceneConfigById, useSceneStore } from "../store/sceneStore.js";
import { CaregiverView } from "./CaregiverView.jsx";
import { DemoTimeline, demoTimelineSteps } from "./DemoTimeline.jsx";
import { ElderView } from "./ElderView.jsx";
import { ProductView } from "./ProductView.jsx";

const viewModes = [
  { id: "product", label: "产品视角", icon: Sparkles, sceneId: "capsule-product-showcase" },
  { id: "elder", label: "老人视角", icon: HeartPulse, sceneId: "capsule-elder-experience" },
  { id: "caregiver", label: "护工视角", icon: Monitor, sceneId: "capsule-caregiver-monitor" }
];

const defaultProject = loadDefaultProject();

const flowActionLabels = {
  start: "开始",
  next: "下一步",
  pause: "暂停",
  resume: "继续",
  finish: "结束",
  restart: "重来",
  confirm: "确认",
  saveReport: "保存报告",
  callCaregiver: "呼叫",
  reset: "重置"
};

const flowViewHints = {
  idle: { mode: "product", step: 0 },
  ready_check: { mode: "caregiver", step: 0 },
  enter_experience: { mode: "product", step: 2 },
  immersive_intro: { mode: "elder", step: 3 },
  calligraphy_tutorial: { mode: "elder", step: 3 },
  practice_game: { mode: "elder", step: 4 },
  scoring: { mode: "caregiver", step: 5 },
  report: { mode: "caregiver", step: 5 },
  caregiver_confirm: { mode: "caregiver", step: 5 },
  finished: { mode: "product", step: 1 }
};

export function DemoPage() {
  const [mode, setMode] = useState("product");
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlowPaused, setIsFlowPaused] = useState(false);
  const [caregiverNotice, setCaregiverNotice] = useState("");
  const [calligraphyProgress, setCalligraphyProgress] = useState(0);
  const [calligraphyStroke, setCalligraphyStroke] = useState("侧");
  const [selectedObjectId, setSelectedObjectId] = useState("capsule-shell");
  const storedScenes = useSceneStore((state) => state.scenes);
  const flowState = useFlowStore(getCurrentFlowState);
  const flowHistory = useFlowStore((state) => state.history);
  const flowSession = useFlowStore((state) => state.session);
  const flowStateEnteredAt = useFlowStore((state) => state.stateEnteredAt);
  const executableActions = useFlowStore((state) => state.getExecutableActions());
  const executeFlowAction = useFlowStore((state) => state.executeAction);
  const [flowClock, setFlowClock] = useState(Date.now());
  const phase = useMemo(() => ({
    id: flowState?.id ?? "idle",
    label: flowState?.title ?? "等待开始",
    status: flowState?.description ?? "等待启动体验。"
  }), [flowState]);
  const activeMode = viewModes.find((item) => item.id === mode) ?? viewModes[0];
  const sceneConfig = selectSceneConfigById(storedScenes, activeMode.sceneId);

  useEffect(() => {
    const hint = flowViewHints[phase.id];

    if (!hint) {
      return;
    }

    setMode(hint.mode);
    setActiveStep(hint.step);
  }, [phase.id]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFlowClock(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isPlaying || isFlowPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveStep((current) => {
        const next = current + 1;

        if (next >= demoTimelineSteps.length) {
          setIsPlaying(false);
          return current;
        }

        setMode(demoTimelineSteps[next].mode);
        return next;
      });
    }, 2200);

    return () => window.clearInterval(timer);
  }, [isPlaying, isFlowPaused]);

  const practiceProgress = Math.max(
    Math.min(100, Math.round((activeStep / (demoTimelineSteps.length - 1)) * 100)),
    calligraphyProgress
  );
  const flowElapsedSeconds = Math.max(0, Math.floor((flowClock - flowStateEnteredAt) / 1000));
  const flowRemainingSeconds = flowState?.duration ? Math.max(0, flowState.duration - flowElapsedSeconds) : 0;
  const remainingSeconds = flowState?.duration ? flowRemainingSeconds : Math.max(0, 900 - activeStep * 118);
  const currentStroke = mode === "elder" ? calligraphyStroke : ["侧", "勒", "努", "趯", "策", "掠"][Math.min(activeStep, 5)];

  const modePanel = useMemo(() => {
    if (mode === "elder") {
      return <ElderView phase={phase} onGameProgress={handleGameProgress} onGameComplete={handleGameComplete} />;
    }

    if (mode === "caregiver") {
      return (
        <CaregiverView
          phase={phase}
          sceneConfig={sceneConfig}
          progress={practiceProgress}
          currentStroke={currentStroke}
          remainingSeconds={remainingSeconds}
          isPaused={isFlowPaused}
          onAction={handleCaregiverAction}
        />
      );
    }

    return <ProductView phase={phase} />;
  }, [mode, phase, sceneConfig, practiceProgress, currentStroke, remainingSeconds, isFlowPaused]);

  function resetPlayback() {
    setIsPlaying(false);
    setIsFlowPaused(false);
    setActiveStep(0);
    setMode("product");
  }

  function selectStep(index) {
    setActiveStep(index);
    setMode(demoTimelineSteps[index].mode);
  }

  function handleGameProgress(progress, strokeLabel) {
    setCalligraphyProgress(progress);
    setCalligraphyStroke(strokeLabel);
  }

  function handleGameComplete() {
    setCalligraphyProgress(100);
    setActiveStep(demoTimelineSteps.length - 1);
    setMode("caregiver");
    setCaregiverNotice("作品已完成，护工端收到评分报告。");
  }

  function handleCaregiverAction(actionId) {
    if (actionId === "pause") {
      setIsFlowPaused((value) => !value);
      setIsPlaying(false);
      setCaregiverNotice(isFlowPaused ? "护工已恢复流程。" : "护工已暂停流程。");
      return;
    }

    if (actionId === "end") {
      setIsPlaying(false);
      setActiveStep(demoTimelineSteps.length - 1);
      setMode("caregiver");
      setCaregiverNotice("护工已结束体验并进入报告确认。");
      return;
    }

    if (actionId === "openDoor") {
      setIsPlaying(false);
      setIsFlowPaused(false);
      setActiveStep(1);
      setMode("product");
      setCaregiverNotice("护工已请求开舱，外部视角已切回舱门。");
      return;
    }

    if (actionId === "callElder") {
      setCaregiverNotice("老人端收到温和呼叫提示。");
    }
  }

  return (
    <main className="demo-app">
      <header className="demo-topbar">
        <a className="brand-mark" href="/demo" aria-label={`${defaultProject.name}前台演示端`}>
          <span>{defaultProject.name}</span>
          <strong>胶囊舱演示</strong>
        </a>
        <nav aria-label="演示端导航">
          <a href="/admin">后台编辑</a>
          <a href="/preview/capsule-product-showcase">预览</a>
        </nav>
      </header>

      <section className="demo-stage" aria-label="胶囊舱演示工作区">
        <div className="stage-viewport">
          <SceneRenderer
            sceneConfig={sceneConfig}
            mode={mode}
            phaseIndex={activeStep}
            selectedObjectId={selectedObjectId}
            onSelectObject={setSelectedObjectId}
          />
          <div className="selected-object-chip">
            <CircleGauge size={16} strokeWidth={2.2} />
            <span>{selectedObjectId}</span>
          </div>
        </div>

        <aside className="demo-control-panel" aria-label="演示控制台">
          <div className="panel-heading">
            <span>Demo / Experience</span>
            <strong>{phase.label}</strong>
          </div>
          {caregiverNotice ? <p className="caregiver-notice">{caregiverNotice}</p> : null}
          <section className="flow-state-card" aria-label="流程状态">
            <div>
              <span>Flow State</span>
              <strong>{phase.id}</strong>
              <small>{flowSession ? `Session ${flowSession.id.slice(0, 18)}` : `历史 ${flowHistory.length} 条`}</small>
            </div>
            <div className="flow-action-row">
              {executableActions.map((actionId) => (
                <button key={actionId} type="button" onClick={() => executeFlowAction(actionId)}>
                  {flowActionLabels[actionId] ?? actionId}
                </button>
              ))}
            </div>
          </section>

          <div className="segmented-control" aria-label="视角切换">
            {viewModes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={mode === item.id ? "is-active" : ""}
                  onClick={() => setMode(item.id)}
                >
                  <Icon size={16} strokeWidth={2.2} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="playback-row">
            <button className="primary-action" type="button" onClick={() => setIsPlaying((value) => !value)}>
              {isPlaying ? <Pause size={18} strokeWidth={2.2} /> : <Play size={18} strokeWidth={2.2} />}
              <span>{isPlaying ? "暂停流程" : "播放完整流程"}</span>
            </button>
            <button className="icon-action" type="button" onClick={resetPlayback} aria-label="重置流程">
              <RotateCcw size={18} strokeWidth={2.2} />
            </button>
          </div>

          <DemoTimeline activeStep={activeStep} onSelectStep={selectStep} />
        </aside>
      </section>

      <section className="mode-panel-band" aria-label="当前视角状态">
        {modePanel}
      </section>
    </main>
  );
}

import { CircleGauge, FastForward, HeartPulse, Maximize2, Minimize2, Monitor, Pause, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import yongCharacter from "../data/calligraphy/yongCharacter.json";
import { loadDefaultProject } from "../data/configLoader.js";
import { SceneRenderer } from "../scene-core/SceneRenderer.jsx";
import { getCurrentFlowState, useFlowStore } from "../store/flowStore.js";
import { selectSceneConfigById, useSceneStore } from "../store/sceneStore.js";
import { CaregiverView } from "./CaregiverView.jsx";
import { CaregiverConfirmView } from "./CaregiverConfirmView.jsx";
import { DemoTimeline, demoTimelineSteps } from "./DemoTimeline.jsx";
import { ElderView } from "./ElderView.jsx";
import { ProductView } from "./ProductView.jsx";
import { ReportView } from "./ReportView.jsx";

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

const demoAutoAdvanceActions = {
  idle: "start",
  ready_check: "next",
  enter_experience: "next",
  immersive_intro: "next",
  calligraphy_tutorial: "next",
  scoring: "next",
  report: "next",
  caregiver_confirm: "confirm"
};

const demoAutoAdvanceDelays = {
  idle: 500,
  ready_check: 1400,
  enter_experience: 1400,
  immersive_intro: 1600,
  calligraphy_tutorial: 1600,
  practice_game: 2200,
  scoring: 1400,
  report: 1800,
  caregiver_confirm: 1600
};

export function DemoPage() {
  const demoAppRef = useRef(null);
  const [mode, setMode] = useState("product");
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFlowPaused, setIsFlowPaused] = useState(false);
  const [caregiverNotice, setCaregiverNotice] = useState("");
  const [elderHelpRequest, setElderHelpRequest] = useState(null);
  const [calligraphyProgress, setCalligraphyProgress] = useState(0);
  const [calligraphyStroke, setCalligraphyStroke] = useState("侧");
  const [selectedObjectId, setSelectedObjectId] = useState("capsule-shell");
  const storedScenes = useSceneStore((state) => state.scenes);
  const flowState = useFlowStore(getCurrentFlowState);
  const flowHistory = useFlowStore((state) => state.history);
  const flowSession = useFlowStore((state) => state.session);
  const flowReport = useFlowStore((state) => state.session?.report);
  const flowStateEnteredAt = useFlowStore((state) => state.stateEnteredAt);
  const flowAccumulatedPausedMs = useFlowStore((state) => state.accumulatedPausedMs);
  const flowPausedAt = useFlowStore((state) => state.pausedAt);
  const flowIsPaused = useFlowStore((state) => state.isPaused);
  const executableActions = useFlowStore((state) => state.getExecutableActions());
  const executeFlowAction = useFlowStore((state) => state.executeAction);
  const recordPracticeStroke = useFlowStore((state) => state.recordPracticeStroke);
  const completePracticeData = useFlowStore((state) => state.completePracticeData);
  const recordSessionEvent = useFlowStore((state) => state.recordSessionEvent);
  const resetFlow = useFlowStore((state) => state.resetFlow);
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
    function syncFullscreenState() {
      setIsFullscreen(document.fullscreenElement === demoAppRef.current);
    }

    document.addEventListener("fullscreenchange", syncFullscreenState);
    syncFullscreenState();

    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  useEffect(() => {
    if (!isPlaying || isFlowPaused || flowIsPaused) {
      return undefined;
    }

    if (phase.id === "finished") {
      setIsPlaying(false);
      setCaregiverNotice("一键演示已完成，本次体验记录已保存。");
      return undefined;
    }

    const timer = window.setTimeout(() => {
      const store = useFlowStore.getState();
      const currentStateId = store.currentStateId;
      const currentActions = store.getExecutableActions();

      if (currentStateId === "practice_game") {
        const result = createDemoPracticeResult();
        store.completePracticeData(result);
        store.executeAction("finish");
        setCalligraphyProgress(100);
        setCalligraphyStroke("磔");
        setCaregiverNotice(`一键演示已完成书法练习，护工端收到 ${result.total} 分评分报告。`);
        return;
      }

      if (currentStateId === "report" && currentActions.includes("saveReport")) {
        store.executeAction("saveReport");
      }

      if (currentStateId === "caregiver_confirm" && currentActions.includes("saveReport")) {
        store.executeAction("saveReport");
      }

      const actionId = demoAutoAdvanceActions[currentStateId];

      if (actionId && currentActions.includes(actionId)) {
        store.executeAction(actionId);
      }
    }, demoAutoAdvanceDelays[phase.id] ?? 1600);

    return () => window.clearTimeout(timer);
  }, [flowIsPaused, isPlaying, isFlowPaused, phase.id]);

  const practiceProgress = Math.max(
    Math.min(100, Math.round((activeStep / (demoTimelineSteps.length - 1)) * 100)),
    calligraphyProgress
  );
  const effectiveFlowClock = flowIsPaused && flowPausedAt ? flowPausedAt : flowClock;
  const flowElapsedSeconds = Math.max(0, Math.floor((effectiveFlowClock - flowStateEnteredAt - flowAccumulatedPausedMs) / 1000));
  const flowRemainingSeconds = flowState?.duration ? Math.max(0, flowState.duration - flowElapsedSeconds) : 0;
  const remainingSeconds = flowState?.duration ? flowRemainingSeconds : Math.max(0, 900 - activeStep * 118);
  const currentStroke = mode === "elder" ? calligraphyStroke : ["侧", "勒", "努", "趯", "策", "掠"][Math.min(activeStep, 5)];

  const modePanel = useMemo(() => {
    if (phase.id === "report") {
      return <ReportView phase={phase} report={flowReport} />;
    }

    if (phase.id === "caregiver_confirm") {
      return <CaregiverConfirmView phase={phase} report={flowReport} onAction={executeFlowAction} />;
    }

    if (mode === "elder") {
      return (
        <ElderView
          phase={phase}
          paused={flowIsPaused || isFlowPaused}
          onGameProgress={handleGameProgress}
          onGameComplete={handleGameComplete}
          onStrokeComplete={recordPracticeStroke}
          onHelpRequest={handleElderHelpRequest}
        />
      );
    }

    if (mode === "caregiver") {
      return (
        <CaregiverView
          phase={phase}
          sceneConfig={sceneConfig}
          progress={practiceProgress}
          currentStroke={currentStroke}
          remainingSeconds={remainingSeconds}
          isPaused={flowIsPaused || isFlowPaused}
          elderHelpRequest={elderHelpRequest}
          onAction={handleCaregiverAction}
        />
      );
    }

    return <ProductView phase={phase} />;
  }, [
    completePracticeData,
    executeFlowAction,
    flowIsPaused,
    flowReport,
    mode,
    phase,
    recordPracticeStroke,
    recordSessionEvent,
    sceneConfig,
    practiceProgress,
    currentStroke,
    remainingSeconds,
    isFlowPaused,
    elderHelpRequest
  ]);

  function resetPlayback() {
    setIsPlaying(false);
    setIsFlowPaused(false);
    setActiveStep(0);
    setMode("product");
    setCaregiverNotice("");
    setElderHelpRequest(null);
    setCalligraphyProgress(0);
    setCalligraphyStroke("侧");
    resetFlow();
  }

  function selectStep(index) {
    setActiveStep(index);
    setMode(demoTimelineSteps[index].mode);
  }

  function handleGameProgress(progress, strokeLabel) {
    setCalligraphyProgress(progress);
    setCalligraphyStroke(strokeLabel);
  }

  function handleGameComplete(result) {
    setCalligraphyProgress(100);
    completePracticeData(result);
    if (phase.id === "practice_game") {
      executeFlowAction("finish");
    }
    setCaregiverNotice(result?.total ? `作品已完成，护工端收到 ${result.total} 分评分报告。` : "作品已完成，护工端收到评分报告。");
  }

  function handleElderHelpRequest() {
    const requestedAt = new Date().toISOString();
    setElderHelpRequest((request) => ({
      count: (request?.count ?? 0) + 1,
      at: requestedAt
    }));
    setCaregiverNotice("老人端发起求助，护工端已收到提醒。");
    recordSessionEvent({
      type: "action_triggered",
      at: requestedAt,
      payload: { actionId: "elderHelpRequest" }
    });
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
      if (executableActions.includes("finish")) {
        executeFlowAction("finish");
      }
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

  function handlePresentationPlayback() {
    if (isPlaying) {
      setIsPlaying(false);
      setCaregiverNotice("一键演示已暂停，可从当前节点继续。");
      return;
    }

    if (phase.id === "idle" || phase.id === "finished") {
      startOneClickDemo();
      return;
    }

    setIsFlowPaused(false);
    if (useFlowStore.getState().isPaused) {
      useFlowStore.getState().executeAction("resume");
    }
    setIsPlaying(true);
    setCaregiverNotice("一键演示继续推进。");
  }

  function startOneClickDemo() {
    resetFlow();
    setIsPlaying(true);
    setIsFlowPaused(false);
    setActiveStep(0);
    setMode("product");
    setElderHelpRequest(null);
    setCalligraphyProgress(0);
    setCalligraphyStroke("侧");
    setSelectedObjectId("capsule-shell");
    setCaregiverNotice("一键演示已启动，将自动推进入舱、书法练习、评分报告和护工确认。");
    window.setTimeout(() => {
      useFlowStore.getState().executeAction("start");
    }, 0);
  }

  async function toggleFullscreen() {
    if (!demoAppRef.current || !document.fullscreenEnabled) {
      setCaregiverNotice("当前浏览器不支持全屏展示，可使用系统全屏快捷键。");
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await demoAppRef.current.requestFullscreen();
    } catch (error) {
      setCaregiverNotice("浏览器未允许进入全屏展示，请检查页面权限。");
    }
  }

  return (
    <main ref={demoAppRef} className={`demo-app ${isFullscreen ? "is-presentation-fullscreen" : ""}`}>
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
              <small>{flowSession ? `Session ${flowSession.id.slice(0, 18)} · ${flowSession.events.length} 事件` : `历史 ${flowHistory.length} 条`}</small>
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
            <button className="primary-action" type="button" onClick={handlePresentationPlayback}>
              {isPlaying ? <Pause size={18} strokeWidth={2.2} /> : <FastForward size={18} strokeWidth={2.2} />}
              <span>{isPlaying ? "暂停演示" : phase.id === "idle" || phase.id === "finished" ? "一键演示" : "继续演示"}</span>
            </button>
            <button className="icon-action" type="button" onClick={resetPlayback} aria-label="重置流程">
              <RotateCcw size={18} strokeWidth={2.2} />
            </button>
            <button className="icon-action" type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? "退出全屏展示" : "进入全屏展示"}>
              {isFullscreen ? <Minimize2 size={18} strokeWidth={2.2} /> : <Maximize2 size={18} strokeWidth={2.2} />}
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

function createDemoPracticeResult() {
  const completedAt = new Date().toISOString();
  const strokeRecords = yongCharacter.strokes.map((stroke, index) => {
    const expectedDurationMs = Math.round((stroke.duration ?? 1.2) * 1000);
    const actualDurationMs = expectedDurationMs + (index % 3) * 28 - 36;
    const startedAt = new Date(Date.now() - expectedDurationMs - (yongCharacter.strokes.length - index) * 120).toISOString();
    const pointStep = Math.max(1, stroke.points.length - 1);

    return {
      strokeId: stroke.id,
      label: stroke.label,
      status: "completed",
      startedAt,
      completedAt,
      pointCount: stroke.points.length,
      points: stroke.points.map(([x, y], pointIndex) => ({
        x,
        y,
        t: Math.round((expectedDurationMs / pointStep) * pointIndex)
      })),
      averageDeviation: 3.8 + (index % 3) * 0.6,
      maxDeviation: 8 + index,
      pathAccuracy: 93 - (index % 4),
      actualDurationMs,
      expectedDurationMs,
      durationRatio: Number((actualDurationMs / expectedDurationMs).toFixed(2)),
      rhythmStability: 92 - (index % 3)
    };
  });

  return {
    total: 91,
    metrics: {
      pathAccuracy: 91,
      strokeOrder: 96,
      rhythm: 92,
      focus: 94
    },
    suggestion: "演示数据表现稳定，可在报告页查看路径、节奏和专注度指标。",
    practiceState: "completed",
    completedAt,
    completedStrokeCount: strokeRecords.length,
    totalStrokeCount: yongCharacter.strokes.length,
    strokeRecords,
    practiceData: {
      character: yongCharacter.character,
      completedAt,
      strokes: strokeRecords,
      rewriteCount: 0,
      interruptionCount: 0,
      strokeOrderWarnings: 0
    }
  };
}

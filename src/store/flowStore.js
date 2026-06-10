import { create } from "zustand";
import { loadDefaultFlow } from "../data/configLoader.js";
import { cloneFlowConfig, validateFlowConfig } from "../flow-core/flowSchema.js";
import { createReport } from "../report-core/reportSchema.js";
import { createPracticeSession, createSessionEvent } from "../session-core/sessionSchema.js";

export const SESSION_STORAGE_KEY = "moyin-xinjing-practice-sessions";
export const FLOW_STORAGE_KEY = "moyin-xinjing-flow-config";
const defaultFlow = loadInitialFlowConfig();
const defaultStateId = defaultFlow.initialState;

export const useFlowStore = create((set, get) => ({
  flowConfig: defaultFlow,
  currentStateId: defaultStateId,
  stateEnteredAt: Date.now(),
  accumulatedPausedMs: 0,
  pausedAt: null,
  history: [createHistoryItem(defaultStateId, "init")],
  isPaused: false,
  session: null,

  getCurrentState: () => getFlowState(get().flowConfig, get().currentStateId),

  getExecutableActions: () => {
    const actions = getFlowState(get().flowConfig, get().currentStateId)?.actions ?? [];

    if (!get().isPaused) {
      return actions;
    }

    return actions.map((action) => (action === "pause" ? "resume" : action));
  },

  getStateElapsedSeconds: () => {
    const state = get();
    const now = state.isPaused && state.pausedAt ? state.pausedAt : Date.now();
    return Math.max(0, Math.floor((now - state.stateEnteredAt - state.accumulatedPausedMs) / 1000));
  },

  getRemainingSeconds: () => {
    const state = getFlowState(get().flowConfig, get().currentStateId);

    if (!state?.duration) {
      return 0;
    }

    return Math.max(0, state.duration - get().getStateElapsedSeconds());
  },

  setFlowConfig: (flowConfig) => {
    const result = validateFlowConfig(flowConfig);

    if (!result.valid) {
      return result;
    }

    const nextFlowConfig = cloneFlowConfig(flowConfig);
    const nextStateId = nextFlowConfig.initialState;
    persistFlowConfig(nextFlowConfig);
    set({
      flowConfig: nextFlowConfig,
      currentStateId: nextStateId,
      stateEnteredAt: Date.now(),
      accumulatedPausedMs: 0,
      pausedAt: null,
      history: [createHistoryItem(nextStateId, "flow_config_loaded")],
      isPaused: false,
      session: null
    });

    return result;
  },

  canExecute: (actionId) => {
    const state = getFlowState(get().flowConfig, get().currentStateId);
    return Boolean(state?.actions?.includes(actionId));
  },

  recordSessionEvent: (event) => {
    set((state) => {
      if (!state.session) {
        return state;
      }

      return {
        session: {
          ...state.session,
          events: [
            ...state.session.events,
            createSessionEvent({
              stateId: state.currentStateId,
              ...event
            })
          ]
        }
      };
    });
  },

  recordPracticeStroke: (strokeRecord) => {
    const at = strokeRecord?.completedAt ?? new Date().toISOString();

    set((state) => {
      if (!state.session || !strokeRecord?.strokeId) {
        return state;
      }

      const strokes = mergePracticeStrokeRecord(state.session.practiceData.strokes, strokeRecord);

      return {
        session: {
          ...state.session,
          practiceData: {
            ...state.session.practiceData,
            strokes
          },
          events: [
            ...state.session.events,
            createSessionEvent({
              type: "stroke_completed",
              stateId: state.currentStateId,
              at,
              payload: {
                strokeId: strokeRecord.strokeId,
                label: strokeRecord.label,
                pathAccuracy: strokeRecord.pathAccuracy,
                rhythmStability: strokeRecord.rhythmStability,
                averageDeviation: strokeRecord.averageDeviation
              }
            })
          ]
        }
      };
    });
  },

  completePracticeData: (result = {}) => {
    const completedAt = result.completedAt ?? result.practiceData?.completedAt ?? new Date().toISOString();

    set((state) => {
      if (!state.session) {
        return state;
      }

      const incomingPracticeData = result.practiceData ?? {};
      const incomingStrokes = incomingPracticeData.strokes ?? result.strokeRecords ?? state.session.practiceData.strokes;
      const expectedStrokeCount = normalizeNonNegativeInteger(
        result.totalStrokeCount ?? incomingPracticeData.totalStrokeCount,
        state.session.practiceData.expectedStrokeCount ?? incomingStrokes.length
      );
      const rewriteCount = normalizeNonNegativeInteger(
        incomingPracticeData.rewriteCount,
        state.session.practiceData.rewriteCount
      );
      const interruptionCount = normalizeNonNegativeInteger(
        incomingPracticeData.interruptionCount,
        state.session.practiceData.interruptionCount
      );
      const strokeOrderWarnings = normalizeNonNegativeInteger(
        incomingPracticeData.strokeOrderWarnings,
        state.session.practiceData.strokeOrderWarnings ?? 0
      );

      return {
        session: {
          ...state.session,
          practiceData: {
            ...state.session.practiceData,
            completedAt,
            strokes: incomingStrokes,
            expectedStrokeCount,
            rewriteCount,
            interruptionCount,
            strokeOrderWarnings
          },
          events: [
            ...state.session.events,
            createSessionEvent({
              type: "practice_completed",
              stateId: state.currentStateId,
              at: completedAt,
              payload: {
                score: result.total,
                completedStrokeCount: result.completedStrokeCount,
                totalStrokeCount: result.totalStrokeCount
              }
            })
          ]
        }
      };
    });
  },

  transitionTo: (stateId, reason = "manual") => {
    const nextState = getFlowState(get().flowConfig, stateId);

    if (!nextState) {
      return false;
    }

    const enteredAt = new Date().toISOString();

    set((state) => ({
      currentStateId: stateId,
      stateEnteredAt: Date.parse(enteredAt),
      accumulatedPausedMs: 0,
      pausedAt: null,
      isPaused: false,
      session: state.session ? buildTransitionSession(state.session, state.currentStateId, stateId, reason, enteredAt) : null,
      history: [...state.history, createHistoryItem(stateId, reason)]
    }));

    return true;
  },

  executeAction: (actionId) => {
    const state = getFlowState(get().flowConfig, get().currentStateId);

    if (actionId === "resume" && get().isPaused) {
      const resumedAt = Date.now();
      const current = get();
      const pausedDuration = current.pausedAt ? resumedAt - current.pausedAt : 0;

      set((storeState) => ({
        isPaused: false,
        pausedAt: null,
        accumulatedPausedMs: storeState.accumulatedPausedMs + pausedDuration,
        session: storeState.session
          ? {
              ...storeState.session,
              status: "active",
              events: [
                ...storeState.session.events,
                createSessionEvent({
                  type: "action_triggered",
                  stateId: storeState.currentStateId,
                  at: new Date(resumedAt).toISOString(),
                  payload: {
                    actionId,
                    pausedMs: pausedDuration
                  }
                })
              ]
            }
          : null
      }));

      return true;
    }

    if (!state?.actions?.includes(actionId)) {
      return false;
    }

    if (actionId === "start" && state.next) {
      const startedAt = new Date().toISOString();
      const session = createPracticeSession({
        currentState: state.next,
        startedAt,
        events: [
          createSessionEvent({
            type: "session_started",
            stateId: state.id,
            at: startedAt
          }),
          createSessionEvent({
            type: "action_triggered",
            stateId: state.id,
            at: startedAt,
            payload: { actionId }
          }),
          createSessionEvent({
            type: "state_entered",
            stateId: state.next,
            at: startedAt
          })
        ]
      });

      set((current) => ({
        currentStateId: state.next,
        stateEnteredAt: Date.parse(startedAt),
        accumulatedPausedMs: 0,
        pausedAt: null,
        isPaused: false,
        session,
        history: [...current.history, createHistoryItem(state.next, actionId)]
      }));

      return true;
    }

    if (actionId === "pause") {
      const pausedAt = Date.now();
      set((state) => ({
        isPaused: true,
        pausedAt,
        session: state.session
          ? {
              ...state.session,
              status: "paused",
              events: [
                ...state.session.events,
                createSessionEvent({
                  type: "action_triggered",
                  stateId: state.currentStateId,
                  at: new Date(pausedAt).toISOString(),
                  payload: { actionId }
                })
              ]
            }
          : null
      }));
      return true;
    }

    if (actionId === "reset") {
      get().resetFlow();
      return true;
    }

    if (actionId === "restart") {
      get().transitionTo(get().flowConfig.initialState, "restart");
      return true;
    }

    if (actionId === "finish" && state.id !== "practice_game" && state.id !== "scoring") {
      const targetStateId = get().session?.report ? "caregiver_confirm" : "finished";
      return get().transitionTo(targetStateId, actionId);
    }

    if (state.next) {
      return get().transitionTo(state.next, actionId);
    }

    return true;
  },

  resetFlow: () => {
    const initialStateId = get().flowConfig.initialState;
    set({
      currentStateId: initialStateId,
      stateEnteredAt: Date.now(),
      accumulatedPausedMs: 0,
      pausedAt: null,
      history: [createHistoryItem(initialStateId, "reset")],
      isPaused: false,
      session: null
    });
  }
}));

export function getCurrentFlowState(state) {
  return getFlowState(state.flowConfig, state.currentStateId);
}

export function getFlowState(flowConfig, stateId) {
  return flowConfig.states.find((state) => state.id === stateId) ?? flowConfig.states[0];
}

function createHistoryItem(stateId, reason) {
  return {
    stateId,
    reason,
    enteredAt: new Date().toISOString()
  };
}

function buildTransitionSession(session, fromStateId, toStateId, reason, at) {
  const baseEvents = [
    ...session.events,
    createSessionEvent({
      type: "action_triggered",
      stateId: fromStateId,
      at,
      payload: { actionId: reason }
    }),
    createSessionEvent({
      type: "state_exited",
      stateId: fromStateId,
      at
    }),
    createSessionEvent({
      type: "state_entered",
      stateId: toStateId,
      at
    })
  ];

  if (toStateId !== "practice_game") {
    if (toStateId === "finished") {
      const finishedSession = {
        ...session,
        currentState: toStateId,
        endedAt: at,
        status: "completed",
        events: [
          ...baseEvents,
          createSessionEvent({
            type: "session_finished",
            stateId: toStateId,
            at
          })
        ]
      };

      persistPracticeSession(finishedSession);

      return finishedSession;
    }

    if (toStateId === "scoring") {
      const report = buildSessionReport(session, at);

      return {
        ...session,
        currentState: toStateId,
        report,
        events: [
          ...baseEvents,
          createSessionEvent({
            type: "score_generated",
            stateId: toStateId,
            at,
            payload: {
              reportId: report.id,
              score: report.score
            }
          })
        ]
      };
    }

    return {
      ...session,
      currentState: toStateId,
      events: baseEvents
    };
  }

  return {
    ...session,
    currentState: toStateId,
    events: [
      ...baseEvents,
      createSessionEvent({
        type: "practice_started",
        stateId: toStateId,
        at,
        payload: { character: session.practiceData.character }
      })
    ],
    practiceData: {
      ...session.practiceData,
      startedAt: session.practiceData.startedAt ?? at
    }
  };
}

function buildSessionReport(session, at) {
  const practiceData = session.practiceData;
  const strokeCount = practiceData.strokes.length;
  const expectedStrokeCount = practiceData.expectedStrokeCount ?? 8;
  const missingStrokePenalty = Math.max(0, expectedStrokeCount - strokeCount) * 12;
  const rewritePenalty = practiceData.rewriteCount * 2;
  const interruptionPenalty = practiceData.interruptionCount * 12;
  const strokeOrderWarnings = practiceData.strokeOrderWarnings ?? 0;
  const metrics = {
    pathAccuracy: averagePracticeMetric(practiceData.strokes, "pathAccuracy", 70 - missingStrokePenalty - rewritePenalty),
    strokeOrder: clampScore(100 - strokeOrderWarnings * 10 - missingStrokePenalty),
    rhythm: averagePracticeMetric(practiceData.strokes, "rhythmStability", 72 - missingStrokePenalty),
    focus: clampScore(100 - interruptionPenalty - rewritePenalty - strokeOrderWarnings * 4)
  };
  const score = Math.round(
    metrics.pathAccuracy * 0.4 +
    metrics.strokeOrder * 0.25 +
    metrics.rhythm * 0.2 +
    metrics.focus * 0.15
  );
  const lowestMetric = Object.entries(metrics).sort((a, b) => a[1] - b[1])[0][0];
  const suggestionLabels = {
    pathAccuracy: "下一轮可放慢速度，优先贴合标准路径。",
    strokeOrder: "下一轮先跟读笔顺，再进入连续描摹。",
    rhythm: "下一轮保持呼吸节奏，减少忽快忽慢。",
    focus: "下一轮可缩短单次练习，先保持稳定专注。"
  };

  return createReport({
    sessionId: session.id,
    generatedAt: at,
    score,
    metrics,
    suggestions: [suggestionLabels[lowestMetric]],
    summary: `完成“${practiceData.character}”字练习，综合分 ${score}。`
  });
}

function clampScore(value) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function loadInitialFlowConfig() {
  const fallbackFlow = loadDefaultFlow();

  if (typeof window === "undefined") {
    return fallbackFlow;
  }

  try {
    const raw = window.localStorage.getItem(FLOW_STORAGE_KEY);

    if (!raw) {
      return fallbackFlow;
    }

    const storedFlowConfig = JSON.parse(raw);
    const result = validateFlowConfig(storedFlowConfig);

    return result.valid ? cloneFlowConfig(storedFlowConfig) : fallbackFlow;
  } catch {
    return fallbackFlow;
  }
}

function persistFlowConfig(flowConfig) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(flowConfig));
}

function averagePracticeMetric(strokes, key, fallback) {
  const values = strokes.map((stroke) => Number(stroke[key])).filter(Number.isFinite);

  if (!values.length) {
    return clampScore(fallback);
  }

  return clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function mergePracticeStrokeRecord(strokes, strokeRecord) {
  return [...strokes.filter((stroke) => stroke.strokeId !== strokeRecord.strokeId), strokeRecord];
}

function normalizeNonNegativeInteger(value, fallback = 0) {
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

function persistPracticeSession(session) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    const sessions = raw ? JSON.parse(raw) : [];
    const nextSessions = Array.isArray(sessions)
      ? [...sessions.filter((item) => item?.id !== session.id), session]
      : [session];

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSessions));
  } catch (error) {
    console.warn("保存 PracticeSession 失败", error);
  }
}

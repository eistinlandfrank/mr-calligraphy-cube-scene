import { create } from "zustand";
import { loadDefaultFlow } from "../data/configLoader.js";
import { createReport } from "../report-core/reportSchema.js";
import { createPracticeSession, createSessionEvent } from "../session-core/sessionSchema.js";

const defaultFlow = loadDefaultFlow();
const defaultStateId = defaultFlow.initialState;
export const SESSION_STORAGE_KEY = "moyin-xinjing-practice-sessions";

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

  getExecutableActions: () => getFlowState(get().flowConfig, get().currentStateId)?.actions ?? [],

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

  canExecute: (actionId) => {
    const state = getFlowState(get().flowConfig, get().currentStateId);
    return Boolean(state?.actions?.includes(actionId));
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

    if (actionId === "resume") {
      set({ isPaused: false });
      return true;
    }

    if (actionId === "reset") {
      get().resetFlow();
      return true;
    }

    if (actionId === "restart") {
      get().transitionTo(defaultStateId, "restart");
      return true;
    }

    if (state.next) {
      return get().transitionTo(state.next, actionId);
    }

    return true;
  },

  resetFlow: () => {
    set({
      currentStateId: defaultStateId,
      stateEnteredAt: Date.now(),
      accumulatedPausedMs: 0,
      pausedAt: null,
      history: [createHistoryItem(defaultStateId, "reset")],
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
  const rewritePenalty = practiceData.rewriteCount * 2;
  const interruptionPenalty = practiceData.interruptionCount * 5;
  const metrics = {
    pathAccuracy: clampScore(78 + Math.min(strokeCount * 2, 12) - rewritePenalty),
    strokeOrder: clampScore(practiceData.startedAt ? 88 + Math.min(strokeCount, 8) : 70),
    rhythm: clampScore(84 - interruptionPenalty),
    focus: clampScore(90 - interruptionPenalty - rewritePenalty)
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

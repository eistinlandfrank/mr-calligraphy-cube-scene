import { create } from "zustand";
import { loadDefaultFlow } from "../data/configLoader.js";
import { createPracticeSession, createSessionEvent } from "../session-core/sessionSchema.js";

const defaultFlow = loadDefaultFlow();
const defaultStateId = defaultFlow.initialState;

export const useFlowStore = create((set, get) => ({
  flowConfig: defaultFlow,
  currentStateId: defaultStateId,
  stateEnteredAt: Date.now(),
  history: [createHistoryItem(defaultStateId, "init")],
  isPaused: false,
  session: null,

  getCurrentState: () => getFlowState(get().flowConfig, get().currentStateId),

  getExecutableActions: () => getFlowState(get().flowConfig, get().currentStateId)?.actions ?? [],

  getStateElapsedSeconds: () => Math.max(0, Math.floor((Date.now() - get().stateEnteredAt) / 1000)),

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
      isPaused: false,
      session: state.session
        ? {
            ...state.session,
            currentState: stateId,
            events: [
              ...state.session.events,
              createSessionEvent({
                type: "action_triggered",
                stateId: state.currentStateId,
                at: enteredAt,
                payload: { actionId: reason }
              }),
              createSessionEvent({
                type: "state_exited",
                stateId: state.currentStateId,
                at: enteredAt
              }),
              createSessionEvent({
                type: "state_entered",
                stateId,
                at: enteredAt
              })
            ]
          }
        : null,
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
        isPaused: false,
        session,
        history: [...current.history, createHistoryItem(state.next, actionId)]
      }));

      return true;
    }

    if (actionId === "pause") {
      set({ isPaused: true });
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

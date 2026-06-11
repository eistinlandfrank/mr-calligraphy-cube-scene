(function () {
  const STORAGE_KEY = "mr-calligraphy-learning-state-v1";
  const VERSION = 1;
  const MAX_EVENTS = 120;
  const MAX_HISTORY_TRASH = 12;
  const MAX_ARTWORK_TAGS = 8;
  const MAX_PLAN_ITEMS = 12;
  const MAX_STAGE_RECORDS = 80;

  const PLAN_REVIEW_ACTIONS = {
    practice: { label: "进入练习", targetStep: 3 },
    task: { label: "复盘任务步骤", targetStep: 2 },
    weakness: { label: "专项补强", targetStep: 3 },
    artwork: { label: "复盘作品", targetStep: 5 },
    report: { label: "查看报告", targetStep: 8 },
    custom: { label: "自定义复盘", targetStep: 3 }
  };

  const LEARNING_STAGE_CONFIG = {
    strokeBreakdown: {
      label: "笔画拆解",
      targetStep: 4,
      summary: "已把当前任务推进到笔画拆解阶段，后续复盘会保留这个本机阶段记录。"
    },
    creation: {
      label: "创作实践",
      targetStep: 5,
      summary: "已把当前任务推进到创作实践阶段，保存作品时会继续关联当前任务。"
    },
    review: {
      label: "复习巩固",
      targetStep: 4,
      summary: "已记录一次复习巩固，建议围绕最近薄弱维度回到笔画拆解。"
    }
  };

  const MODE_CONFIG = {
    single: {
      label: "单字学习",
      glyph: "永",
      copybook: "永字八法",
      taskTitle: "今日单字：永",
      description: "围绕永字八法完成讲解、临摹、复盘和报告。"
    },
    phrase: {
      label: "集字练习",
      glyph: "和",
      copybook: "集字基础",
      taskTitle: "集字练习：和",
      description: "从单字能力过渡到多字结构和行气控制。"
    },
    creation: {
      label: "创作",
      glyph: "雅",
      copybook: "创作实践",
      taskTitle: "创作主题：雅",
      description: "以作品完整度、章法和落款为核心目标。"
    }
  };

  const TASK_LIBRARY = [
    {
      id: "single-yong-basic",
      mode: "single",
      glyph: "永",
      copybook: "永字八法",
      taskTitle: "今日单字：永",
      level: "基础",
      focus: "永字八法的八个基本笔势",
      description: "用“永”字串联点、横、竖、钩、撇、捺等基本笔法，适合建立单字练习基准。",
      dependsOn: [],
      completionRules: {
        requiredStages: ["strokeBreakdown", "creation", "review"],
        minPractices: 1,
        minArtworks: 1,
        minReports: 1
      },
      strokePlan: ["观察中宫", "慢写八法", "回放检查", "保存作品"]
    },
    {
      id: "single-ren-structure",
      mode: "single",
      glyph: "仁",
      copybook: "欧体楷书",
      taskTitle: "今日单字：仁",
      level: "基础",
      focus: "左右结构和横画间距",
      description: "练习单人旁和右部横画的比例，重点观察左右重心与横画长短。",
      dependsOn: ["single-yong-basic"],
      completionRules: {
        requiredStages: ["strokeBreakdown", "creation", "review"],
        minPractices: 1,
        minArtworks: 1,
        minReports: 1
      },
      strokePlan: ["拆左右比例", "练单人旁", "控制横距", "保存对比"]
    },
    {
      id: "single-he-balance",
      mode: "single",
      glyph: "和",
      copybook: "颜体楷书",
      taskTitle: "今日单字：和",
      level: "进阶",
      focus: "左右呼应和口部收束",
      description: "把“禾”和“口”的空间关系写稳定，避免左重右轻或口部松散。",
      dependsOn: ["single-ren-structure"],
      completionRules: {
        requiredStages: ["strokeBreakdown", "creation", "review"],
        minPractices: 1,
        minArtworks: 1,
        minReports: 1,
        minAverageScore: 75
      },
      strokePlan: ["确定左右宽度", "练撇捺开合", "收紧口部", "评分复盘"]
    },
    {
      id: "phrase-he-jing",
      mode: "phrase",
      glyph: "和",
      copybook: "集字基础",
      taskTitle: "集字练习：和敬",
      level: "基础",
      focus: "双字间距和行气",
      description: "从单字过渡到双字组合，先练“和”的稳定，再看“敬”的纵向节奏。",
      dependsOn: [],
      completionRules: {
        requiredStages: ["strokeBreakdown", "creation", "review"],
        minPractices: 1,
        minArtworks: 1,
        minReports: 1
      },
      strokePlan: ["单字复写", "双字间距", "行气检查", "作品保存"]
    },
    {
      id: "phrase-li-zhi",
      mode: "phrase",
      glyph: "礼",
      copybook: "欧体楷书",
      taskTitle: "集字练习：礼志",
      level: "进阶",
      focus: "左右结构与上下呼应",
      description: "练习礼字旁和心字底相关结构，让两字在大小与重心上形成一致节奏。",
      dependsOn: ["phrase-he-jing"],
      completionRules: {
        requiredStages: ["strokeBreakdown", "creation", "review"],
        minPractices: 1,
        minArtworks: 1,
        minReports: 1
      },
      strokePlan: ["拆偏旁", "定中轴", "连写两字", "查看趋势"]
    },
    {
      id: "phrase-ya-zheng",
      mode: "phrase",
      glyph: "雅",
      copybook: "赵体行书",
      taskTitle: "集字练习：雅正",
      level: "挑战",
      focus: "行书牵丝和双字姿态",
      description: "观察行书中牵丝、收放和字势变化，练习双字组合的轻重节奏。",
      dependsOn: ["phrase-li-zhi"],
      completionRules: {
        requiredStages: ["strokeBreakdown", "creation", "review"],
        minPractices: 1,
        minArtworks: 1,
        minReports: 1,
        minAverageScore: 78
      },
      strokePlan: ["看字势", "练牵丝", "连写双字", "导出报告"]
    },
    {
      id: "creation-ya",
      mode: "creation",
      glyph: "雅",
      copybook: "创作实践",
      taskTitle: "创作主题：雅",
      level: "基础",
      focus: "单字作品完整度",
      description: "以“雅”为主题完成一幅单字作品，关注主笔、留白和落款空间。",
      dependsOn: [],
      completionRules: {
        requiredStages: ["strokeBreakdown", "creation", "review"],
        minPractices: 1,
        minArtworks: 1,
        minReports: 1
      },
      strokePlan: ["确定章法", "完成创作", "保存作品", "制定计划"]
    },
    {
      id: "creation-jing",
      mode: "creation",
      glyph: "静",
      copybook: "赵体行书",
      taskTitle: "创作主题：静",
      level: "进阶",
      focus: "行书节奏与留白",
      description: "用行书语感完成“静”字创作，强调线条节奏和画面安定感。",
      dependsOn: ["creation-ya"],
      completionRules: {
        requiredStages: ["strokeBreakdown", "creation", "review"],
        minPractices: 1,
        minArtworks: 1,
        minReports: 1
      },
      strokePlan: ["观察节奏", "控制留白", "完成作品", "视频回放"]
    },
    {
      id: "creation-xin",
      mode: "creation",
      glyph: "心",
      copybook: "颜体楷书",
      taskTitle: "创作主题：心",
      level: "挑战",
      focus: "少笔画字的姿态控制",
      description: "用较少笔画建立完整作品气息，重点控制点画之间的呼应和重心。",
      dependsOn: ["creation-jing"],
      completionRules: {
        requiredStages: ["strokeBreakdown", "creation", "review"],
        minPractices: 1,
        minArtworks: 1,
        minReports: 1,
        minAverageScore: 78
      },
      strokePlan: ["定点位", "练呼应", "保存作品", "报告复盘"]
    }
  ];

  const COPYBOOKS = Array.from(new Set(TASK_LIBRARY.map((task) => task.copybook)));
  const STROKES = ["点", "横", "竖", "撇", "捺", "钩", "提", "折"];
  const SCORE_METRICS = [
    { key: "structure", label: "结构" },
    { key: "stroke", label: "笔画" },
    { key: "technique", label: "笔法" },
    { key: "fluency", label: "流畅" },
    { key: "force", label: "力度" }
  ];
  const LECTURE_STEP_COUNT = 5;
  const LECTURE_STEP_SECONDS = 24;

  let state = normalizeState(loadRawState());

  function loadRawState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("学习状态读取失败", error);
      return null;
    }
  }

  function saveState() {
    try {
      state.updatedAt = new Date().toISOString();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new CustomEvent("mr-learning-state-change", { detail: clone(state) }));
    } catch (error) {
      console.warn("学习状态保存失败", error);
    }
  }

  function normalizeState(source) {
    const activeMode = source && MODE_CONFIG[source.activeMode] ? source.activeMode : "single";
    const modeConfig = MODE_CONFIG[activeMode];
    const baseGlyph = String(source?.selectedGlyph || modeConfig.glyph);
    const baseCopybook = String(source?.selectedCopybook || modeConfig.copybook);
    const selectedTask = normalizeTask(source?.selectedTaskId, activeMode, baseGlyph, baseCopybook);
    const selectedGlyph = String(selectedTask?.glyph || baseGlyph);
    const selectedCopybook = String(selectedTask?.copybook || baseCopybook);
    const lecture = normalizeLecture(source?.lecture, {
      mode: activeMode,
      glyph: selectedGlyph,
      copybook: selectedCopybook,
      fallbackStatus: source?.lectureStatus
    });
    return {
      version: VERSION,
      activeMode,
      selectedTaskId: selectedTask?.id || `${activeMode}-${selectedGlyph}`,
      selectedGlyph,
      selectedCopybook,
      activeStrokeIndex: normalizeInteger(source?.activeStrokeIndex, 0, 0, STROKES.length - 1),
      trainingMode: ["guide", "compare"].includes(source?.trainingMode) ? source.trainingMode : "guide",
      lectureStatus: lecture.status,
      lecture,
      artworkStyle: String(source?.artworkStyle || "楷书"),
      currentSessionId: typeof source?.currentSessionId === "string" ? source.currentSessionId : null,
      sessions: Array.isArray(source?.sessions) ? source.sessions.map(normalizeSession).filter(Boolean) : [],
      artworks: Array.isArray(source?.artworks) ? source.artworks.map(normalizeArtwork).filter(Boolean) : [],
      reports: Array.isArray(source?.reports) ? source.reports.map(normalizeReport).filter(Boolean) : [],
      plans: Array.isArray(source?.plans) ? source.plans.map(normalizePlan).filter(Boolean) : [],
      stageRecords: Array.isArray(source?.stageRecords) ? source.stageRecords.map(normalizeStageRecord).filter(Boolean).slice(-MAX_STAGE_RECORDS) : [],
      historyTrash: Array.isArray(source?.historyTrash) ? source.historyTrash.map(normalizeHistoryTrashEntry).filter(Boolean).slice(0, MAX_HISTORY_TRASH) : [],
      events: Array.isArray(source?.events) ? source.events.map(normalizeEvent).filter(Boolean).slice(-MAX_EVENTS) : [],
      updatedAt: typeof source?.updatedAt === "string" ? source.updatedAt : new Date().toISOString()
    };
  }

  function normalizeInteger(value, fallback, min, max) {
    const number = Number.parseInt(value, 10);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  function normalizeSession(record) {
    if (!record || typeof record !== "object") return null;
    const strokes = normalizeStrokes(record.strokes);
    const feedback = normalizeStringList(record.feedback);
    return {
      id: String(record.id || makeId("session")),
      title: record.title ? String(record.title) : "",
      taskId: String(record.taskId || "task-default"),
      mode: MODE_CONFIG[record.mode] ? record.mode : "single",
      glyph: String(record.glyph || "永"),
      copybook: String(record.copybook || "永字八法"),
      startedAt: String(record.startedAt || new Date().toISOString()),
      endedAt: record.endedAt ? String(record.endedAt) : null,
      trainingMode: ["guide", "compare"].includes(record.trainingMode) ? record.trainingMode : "guide",
      strokeIndex: normalizeInteger(record.strokeIndex, 0, 0, STROKES.length - 1),
      strokes,
      strokeCount: normalizeInteger(record.strokeCount, strokes.length, 0, 999),
      pointCount: normalizeInteger(record.pointCount, countStrokePoints(strokes), 0, 99999),
      bounds: normalizeBounds(record.bounds),
      metrics: normalizeMetrics(record.metrics),
      score: normalizeScore(record.score, 86),
      scoreEvidence: normalizeScoreEvidence(record.scoreEvidence, record),
      feedback,
      snapshotAt: record.snapshotAt ? String(record.snapshotAt) : null,
      status: ["active", "saved"].includes(record.status) ? record.status : "active"
    };
  }

  function normalizeArtwork(record) {
    if (!record || typeof record !== "object") return null;
    const feedback = normalizeStringList(record.feedback);
    const fallbackTask = findTaskForState(record.mode, record.glyph, record.copybook);
    return {
      id: String(record.id || makeId("artwork")),
      sessionId: record.sessionId ? String(record.sessionId) : null,
      taskId: getTaskById(record.taskId) ? String(record.taskId) : null,
      title: String(record.title || "书法练习作品"),
      glyph: String(record.glyph || "永"),
      mode: MODE_CONFIG[record.mode] ? record.mode : "single",
      copybook: String(record.copybook || fallbackTask?.copybook || "永字八法"),
      style: String(record.style || "楷书"),
      score: normalizeScore(record.score, 86),
      strokeCount: normalizeInteger(record.strokeCount, 0, 0, 999),
      pointCount: normalizeInteger(record.pointCount, 0, 0, 99999),
      scoreEvidence: normalizeScoreEvidence(record.scoreEvidence, record),
      feedback,
      tags: Array.isArray(record.tags) ? normalizeArtworkTags(record.tags) : getDefaultArtworkTags(record),
      imageData: typeof record.imageData === "string" && record.imageData.startsWith("data:image/")
        ? record.imageData
        : null,
      createdAt: String(record.createdAt || new Date().toISOString())
    };
  }

  function normalizeReport(record) {
    if (!record || typeof record !== "object") return null;
    return {
      id: String(record.id || makeId("report")),
      taskId: getTaskById(record.taskId) ? String(record.taskId) : null,
      title: String(record.title || "学习报告"),
      createdAt: String(record.createdAt || new Date().toISOString()),
      range: String(record.range || "all"),
      format: ["json", "html"].includes(record.format) ? record.format : "json",
      summary: String(record.summary || ""),
      sessionCount: normalizeInteger(record.sessionCount, 0, 0, 9999),
      artworkCount: normalizeInteger(record.artworkCount, 0, 0, 9999),
      averageScore: normalizeScore(record.averageScore, 0),
      latestStrokeCount: normalizeInteger(record.latestStrokeCount, 0, 0, 999),
      latestPointCount: normalizeInteger(record.latestPointCount, 0, 0, 99999),
      latestSessionId: record.latestSessionId ? String(record.latestSessionId) : null,
      latestArtworkId: record.latestArtworkId ? String(record.latestArtworkId) : null,
      learningMinutes: normalizeInteger(record.learningMinutes, 0, 0, 99999),
      scoreBreakdown: normalizeMetrics(record.scoreBreakdown),
      trend: Array.isArray(record.trend) ? record.trend.map(normalizeReportTrendPoint).filter(Boolean).slice(-8) : [],
      recommendations: Array.isArray(record.recommendations) ? record.recommendations.map(String) : []
    };
  }

  function normalizeReportTrendPoint(point) {
    if (!point || typeof point !== "object") return null;
    return {
      label: String(point.label || "记录"),
      type: String(point.type || "practice"),
      score: normalizeScore(point.score, 0),
      createdAt: String(point.createdAt || new Date().toISOString())
    };
  }

  function normalizePlan(record) {
    if (!record || typeof record !== "object") return null;
    const items = Array.isArray(record.items)
      ? record.items.map(normalizePlanItem).filter(Boolean).slice(0, MAX_PLAN_ITEMS)
      : [];
    const fallbackTask = findTaskForState(record.mode, record.glyph, record.copybook);
    return {
      id: String(record.id || makeId("plan")),
      createdAt: String(record.createdAt || new Date().toISOString()),
      title: String(record.title || "下一阶段练习计划"),
      taskId: getTaskById(record.taskId) ? String(record.taskId) : fallbackTask?.id || null,
      mode: MODE_CONFIG[record.mode] ? record.mode : "single",
      glyph: String(record.glyph || "永"),
      copybook: String(record.copybook || "永字八法"),
      summary: String(record.summary || ""),
      items,
      completedAt: record.completedAt ? String(record.completedAt) : null
    };
  }

  function normalizePlanItem(item, index) {
    if (typeof item === "string") {
      const title = item.trim();
      if (!title) return null;
      return {
        id: `plan-item-${index + 1}`,
        title,
        detail: "",
        done: false,
        completedAt: null,
        dueAt: null,
        remindAt: null,
        snoozedUntil: null,
        reviewAction: "custom",
        reviewDoneAt: null
      };
    }
    if (!item || typeof item !== "object") return null;
    const title = String(item.title || item.text || "").trim();
    if (!title) return null;
    return {
      id: String(item.id || `plan-item-${index + 1}`),
      title,
      detail: String(item.detail || ""),
      done: item.done === true,
      completedAt: item.completedAt ? String(item.completedAt) : null,
      dueAt: normalizePlanDate(item.dueAt),
      remindAt: normalizePlanDate(item.remindAt),
      snoozedUntil: normalizePlanDate(item.snoozedUntil),
      reviewAction: normalizePlanReviewAction(item.reviewAction),
      reviewDoneAt: normalizePlanDate(item.reviewDoneAt)
    };
  }

  function normalizePlanDate(value) {
    if (!value) return null;
    const time = Date.parse(value);
    return Number.isFinite(time) ? new Date(time).toISOString() : null;
  }

  function normalizeEditablePlanDate(value, hour = 18) {
    const text = String(value ?? "").trim();
    if (!text) {
      return { ok: true, value: null };
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      const date = new Date(`${text}T${String(hour).padStart(2, "0")}:00:00`);
      if (Number.isFinite(date.getTime())) {
        return { ok: true, value: date.toISOString() };
      }
    }

    const time = Date.parse(text);
    if (Number.isFinite(time)) {
      return { ok: true, value: new Date(time).toISOString() };
    }
    return { ok: false, value: null };
  }

  function normalizePlanReviewAction(value) {
    const key = String(value || "custom");
    return PLAN_REVIEW_ACTIONS[key] ? key : "custom";
  }

  function makePlanDueAt(days = 1, hour = 18, base = new Date()) {
    const date = new Date(base);
    date.setDate(date.getDate() + normalizeInteger(days, 1, 0, 60));
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  }

  function makePlanReminderAt(dueAt) {
    const due = new Date(dueAt);
    if (Number.isNaN(due.getTime())) {
      return makePlanDueAt(0, 9);
    }
    due.setDate(due.getDate() - 1);
    due.setHours(9, 0, 0, 0);
    return due.toISOString();
  }

  function makePlanSnoozedUntil(days = 1) {
    const date = new Date();
    date.setDate(date.getDate() + normalizeInteger(days, 1, 1, 14));
    date.setHours(9, 0, 0, 0);
    return date.toISOString();
  }

  function formatPlanDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${month}-${day} ${hour}:${minute}`;
  }

  function normalizeHistoryTrashEntry(record) {
    if (!record || typeof record !== "object") return null;
    const records = record.records && typeof record.records === "object" ? record.records : record;
    const sessions = Array.isArray(records.sessions) ? records.sessions.map(normalizeSession).filter(Boolean) : [];
    const artworks = Array.isArray(records.artworks) ? records.artworks.map(normalizeArtwork).filter(Boolean) : [];
    const reports = Array.isArray(records.reports) ? records.reports.map(normalizeReport).filter(Boolean) : [];
    const deletedCount = sessions.length + artworks.length + reports.length;
    if (!deletedCount) return null;

    return {
      id: String(record.id || makeId("trash")),
      title: String(record.title || `已删除 ${deletedCount} 条学习档案`).slice(0, 72),
      deletedAt: Number.isFinite(Date.parse(record.deletedAt)) ? String(record.deletedAt) : new Date().toISOString(),
      records: { sessions, artworks, reports },
      references: normalizeHistoryTrashReferences(record.references)
    };
  }

  function normalizeHistoryTrashReferences(value = {}) {
    const source = value && typeof value === "object" ? value : {};
    return {
      currentSessionId: source.currentSessionId ? String(source.currentSessionId) : null,
      artworkSessionLinks: normalizeHistoryTrashLinks(source.artworkSessionLinks, "artworkId", "sessionId"),
      reportSessionLinks: normalizeHistoryTrashLinks(source.reportSessionLinks, "reportId", "sessionId"),
      reportArtworkLinks: normalizeHistoryTrashLinks(source.reportArtworkLinks, "reportId", "artworkId")
    };
  }

  function normalizeHistoryTrashLinks(value, leftKey, rightKey) {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => ({
        [leftKey]: String(item?.[leftKey] || "").trim(),
        [rightKey]: String(item?.[rightKey] || "").trim()
      }))
      .filter((item) => item[leftKey] && item[rightKey]);
  }

  function normalizeEvent(record) {
    if (!record || typeof record !== "object") return null;
    return {
      id: String(record.id || makeId("event")),
      type: String(record.type || "event"),
      label: String(record.label || "学习操作"),
      createdAt: String(record.createdAt || new Date().toISOString())
    };
  }

  function normalizeStageRecord(record) {
    if (!record || typeof record !== "object") return null;
    const stage = LEARNING_STAGE_CONFIG[record.stage] ? record.stage : "";
    if (!stage) return null;
    const mode = MODE_CONFIG[record.mode] ? record.mode : "single";
    const glyph = String(record.glyph || MODE_CONFIG[mode].glyph);
    const copybook = String(record.copybook || MODE_CONFIG[mode].copybook);
    const task = getTaskById(record.taskId) || findTaskForState(mode, glyph, copybook);
    const targetStep = normalizeInteger(record.targetStep ?? record.sceneIndex, LEARNING_STAGE_CONFIG[stage].targetStep, 0, 9);
    const createdAt = Number.isFinite(Date.parse(record.createdAt))
      ? String(record.createdAt)
      : new Date().toISOString();
    const completedAt = Number.isFinite(Date.parse(record.completedAt))
      ? String(record.completedAt)
      : createdAt;
    return {
      id: String(record.id || makeId("stage")),
      stage,
      label: String(record.label || LEARNING_STAGE_CONFIG[stage].label),
      taskId: task?.id || null,
      mode,
      glyph,
      copybook,
      targetStep,
      createdAt,
      completedAt,
      note: String(record.note || LEARNING_STAGE_CONFIG[stage].summary).slice(0, 160)
    };
  }

  function normalizeLecture(record, context = {}) {
    const status = ["idle", "playing", "complete"].includes(record?.status)
      ? record.status
      : ["idle", "playing", "complete"].includes(context.fallbackStatus)
        ? context.fallbackStatus
        : "idle";
    const stepIndex = status === "complete"
      ? LECTURE_STEP_COUNT - 1
      : normalizeInteger(record?.stepIndex, 0, 0, LECTURE_STEP_COUNT - 1);
    return {
      id: String(record?.id || makeId("lecture")),
      mode: MODE_CONFIG[record?.mode] ? record.mode : context.mode || "single",
      glyph: String(record?.glyph || context.glyph || "永"),
      copybook: String(record?.copybook || context.copybook || "永字八法"),
      status,
      stepIndex,
      startedAt: record?.startedAt ? String(record.startedAt) : null,
      updatedAt: record?.updatedAt ? String(record.updatedAt) : null,
      completedAt: record?.completedAt ? String(record.completedAt) : status === "complete" ? new Date().toISOString() : null
    };
  }

  function getLectureSteps(lecture = state.lecture) {
    const mode = MODE_CONFIG[lecture?.mode] ? lecture.mode : state.activeMode;
    const glyph = String(lecture?.glyph || state.selectedGlyph || "永");
    const copybook = String(lecture?.copybook || state.selectedCopybook || "永字八法");
    const modeLabel = MODE_CONFIG[mode]?.label || "单字学习";
    const shapeFocus = mode === "phrase"
      ? "把单字结构放进行气中观察，先稳住字内重心，再看字与字之间的呼应。"
      : mode === "creation"
        ? "从单字骨架过渡到作品章法，先确定主次、留白和落款位置。"
        : "先看中宫、重心和外轮廓，确认临写时每一笔服务于整体结构。";
    const practiceFocus = mode === "creation"
      ? "创作时保留碑帖笔意，同时让节奏在整幅作品中形成起伏。"
      : mode === "phrase"
        ? "集字时不要只拼字形，要把笔势方向和行距一并纳入练习。"
        : "临摹时先慢后稳，再用回放检查起笔、行笔和收笔是否连续。";

    return [
      {
        title: `${glyph}字目标`,
        body: `${modeLabel}以“${glyph}”为当前任务，参考“${copybook}”，先确认结构目标和临写顺序。`
      },
      {
        title: "结构观察",
        body: shapeFocus
      },
      {
        title: "笔法要点",
        body: `重点观察“${glyph}”的起笔、转折、收笔和墨色轻重，避免把笔画写成孤立线段。`
      },
      {
        title: "临写策略",
        body: practiceFocus
      },
      {
        title: "复盘标准",
        body: "完成书写后保存作品，用结构、笔画、笔法、流畅度和力度五项指标对照复盘。"
      }
    ];
  }

  function normalizeMetrics(metrics) {
    const source = metrics && typeof metrics === "object" ? metrics : {};
    return {
      structure: normalizeScore(source.structure, 88),
      stroke: normalizeScore(source.stroke, 85),
      technique: normalizeScore(source.technique, 87),
      fluency: normalizeScore(source.fluency, 86),
      force: normalizeScore(source.force, 84)
    };
  }

  function normalizeScoreEvidence(evidence, record = {}) {
    const source = evidence && typeof evidence === "object" ? evidence : {};
    const metrics = normalizeMetrics(record.metrics || source.metrics);
    const rawEvidence = source.evidence && typeof source.evidence === "object" ? source.evidence : {};
    const strokeCount = normalizeInteger(rawEvidence.strokeCount ?? record.strokeCount, 0, 0, 999);
    const pointCount = normalizeInteger(rawEvidence.pointCount ?? record.pointCount, 0, 0, 99999);
    const targetStrokeCount = normalizeInteger(rawEvidence.targetStrokeCount, Math.max(1, strokeCount || 8), 1, 80);
    const fallbackCoverage = getBoundsCoveragePercent(record.bounds);
    const normalized = {
      kind: String(source.kind || "local-heuristic-v1"),
      label: String(source.label || "基础练习评分"),
      disclaimer: String(source.disclaimer || "该分数来自浏览器本机启发式算法，用于练习复盘，不等同于专业书法评级。"),
      glyph: String(source.glyph || record.glyph || "永"),
      weights: normalizeScoreWeights(source.weights),
      evidence: {
        targetStrokeCount,
        strokeCount,
        pointCount,
        coveragePercent: normalizeInteger(rawEvidence.coveragePercent, fallbackCoverage, 0, 100),
        centerOffsetPercent: normalizeInteger(rawEvidence.centerOffsetPercent, getBoundsCenterOffsetPercent(record.bounds), 0, 100),
        totalLength: normalizeNumber(rawEvidence.totalLength, 0, 0, 999),
        segmentVariationPercent: normalizeInteger(rawEvidence.segmentVariationPercent, 0, 0, 300),
        longBreaks: normalizeInteger(rawEvidence.longBreaks, 0, 0, 999),
        pressureSpreadPercent: normalizeInteger(rawEvidence.pressureSpreadPercent, 0, 0, 100),
        boundsWidthPercent: normalizeInteger(rawEvidence.boundsWidthPercent, getBoundsWidthPercent(record.bounds), 0, 100),
        boundsHeightPercent: normalizeInteger(rawEvidence.boundsHeightPercent, getBoundsHeightPercent(record.bounds), 0, 100)
      },
      reasons: normalizeScoreReasons(source.reasons, metrics, {
        targetStrokeCount,
        strokeCount,
        pointCount
      })
    };
    return normalized;
  }

  function normalizeScoreWeights(weights = {}) {
    return {
      structure: normalizeNumber(weights.structure, 0.26, 0, 1),
      stroke: normalizeNumber(weights.stroke, 0.24, 0, 1),
      technique: normalizeNumber(weights.technique, 0.2, 0, 1),
      fluency: normalizeNumber(weights.fluency, 0.18, 0, 1),
      force: normalizeNumber(weights.force, 0.12, 0, 1)
    };
  }

  function normalizeScoreReasons(reasons, metrics, fallback = {}) {
    const labels = {
      structure: "结构",
      stroke: "笔画",
      technique: "笔法",
      fluency: "流畅",
      force: "力度"
    };
    const defaults = {
      structure: "依据重心偏移、书写覆盖和字形范围估算。",
      stroke: `依据 ${fallback.strokeCount || 0} 笔和目标 ${fallback.targetStrokeCount || 0} 笔的接近程度估算。`,
      technique: `依据笔迹长度和 ${fallback.pointCount || 0} 个采样点估算。`,
      fluency: "依据线段变化和长停顿次数估算。",
      force: "依据压感跨度和笔画数量差估算。"
    };
    const byKey = new Map(
      (Array.isArray(reasons) ? reasons : [])
        .filter((reason) => reason && typeof reason === "object")
        .map((reason) => [String(reason.key || ""), reason])
    );
    return Object.keys(labels).map((key) => {
      const reason = byKey.get(key) || {};
      return {
        key,
        label: String(reason.label || labels[key]),
        score: normalizeScore(reason.score ?? metrics[key], 0),
        evidence: String(reason.evidence || defaults[key])
      };
    });
  }

  function normalizeNumber(value, fallback, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, Number(number.toFixed(3))));
  }

  function getBoundsWidthPercent(bounds) {
    const normalized = normalizeBounds(bounds);
    return normalized ? Math.round((normalized.maxX - normalized.minX) * 100) : 0;
  }

  function getBoundsHeightPercent(bounds) {
    const normalized = normalizeBounds(bounds);
    return normalized ? Math.round((normalized.maxY - normalized.minY) * 100) : 0;
  }

  function getBoundsCoveragePercent(bounds) {
    const normalized = normalizeBounds(bounds);
    if (!normalized) return 0;
    const width = normalized.maxX - normalized.minX;
    const height = normalized.maxY - normalized.minY;
    return Math.round(Math.sqrt(Math.max(0, width * height)) * 100);
  }

  function getBoundsCenterOffsetPercent(bounds) {
    const normalized = normalizeBounds(bounds);
    if (!normalized) return 0;
    const centerX = (normalized.minX + normalized.maxX) / 2;
    const centerY = (normalized.minY + normalized.maxY) / 2;
    return Math.round(Math.hypot(centerX - 0.5, centerY - 0.5) * 100);
  }

  function normalizeStrokes(strokes) {
    if (!Array.isArray(strokes)) return [];
    return strokes
      .map((stroke) => Array.isArray(stroke)
        ? stroke.map(normalizePoint).filter(Boolean).slice(0, 220)
        : [])
      .filter((stroke) => stroke.length > 1)
      .slice(0, 80);
  }

  function normalizePoint(point) {
    if (!point || typeof point !== "object") return null;
    const x = Number(point.x);
    const y = Number(point.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return {
      x: Number(Math.min(1, Math.max(0, x)).toFixed(4)),
      y: Number(Math.min(1, Math.max(0, y)).toFixed(4)),
      t: Number.isFinite(Number(point.t)) ? Math.round(Number(point.t)) : 0,
      p: Number.isFinite(Number(point.p)) ? Number(Math.min(1, Math.max(0, Number(point.p))).toFixed(3)) : 0.5
    };
  }

  function countStrokePoints(strokes) {
    return strokes.reduce((sum, stroke) => sum + stroke.length, 0);
  }

  function normalizeBounds(bounds) {
    if (!bounds || typeof bounds !== "object") return null;
    const minX = Number(bounds.minX);
    const minY = Number(bounds.minY);
    const maxX = Number(bounds.maxX);
    const maxY = Number(bounds.maxY);
    if (![minX, minY, maxX, maxY].every(Number.isFinite)) return null;
    return {
      minX: Number(Math.min(1, Math.max(0, minX)).toFixed(4)),
      minY: Number(Math.min(1, Math.max(0, minY)).toFixed(4)),
      maxX: Number(Math.min(1, Math.max(0, maxX)).toFixed(4)),
      maxY: Number(Math.min(1, Math.max(0, maxY)).toFixed(4))
    };
  }

  function normalizeStringList(value) {
    return Array.isArray(value) ? value.map(String).filter(Boolean).slice(0, 8) : [];
  }

  function normalizeArtworkTags(value) {
    const source = Array.isArray(value) ? value : String(value || "").split(/[,，、\s]+/);
    const tags = [];
    source.forEach((item) => {
      const tag = String(item || "").trim().replace(/\s+/g, " ").slice(0, 18);
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
      }
    });
    return tags.slice(0, MAX_ARTWORK_TAGS);
  }

  function getDefaultArtworkTags(record = {}) {
    const modeLabel = MODE_CONFIG[record.mode]?.label || "";
    return normalizeArtworkTags([
      record.glyph,
      record.style,
      record.copybook,
      modeLabel
    ]);
  }

  function normalizePracticeResult(result = {}) {
    const strokes = normalizeStrokes(result.strokes);
    const metrics = normalizeMetrics(result.metrics);
    return {
      strokes,
      strokeCount: normalizeInteger(result.strokeCount, strokes.length, 0, 999),
      pointCount: normalizeInteger(result.pointCount, countStrokePoints(strokes), 0, 99999),
      bounds: normalizeBounds(result.bounds),
      metrics,
      score: normalizeScore(result.score, Math.round((metrics.structure + metrics.stroke + metrics.technique + metrics.fluency + metrics.force) / 5)),
      scoreEvidence: normalizeScoreEvidence(result.scoreEvidence, {
        glyph: result.glyph || state.selectedGlyph,
        strokeCount: result.strokeCount,
        pointCount: result.pointCount,
        bounds: result.bounds,
        metrics
      }),
      feedback: normalizeStringList(result.feedback),
      imageData: typeof result.imageData === "string" && result.imageData.startsWith("data:image/")
        ? result.imageData
        : null
    };
  }

  function normalizeScore(value, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(100, Math.max(0, Math.round(number)));
  }

  function makeId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getModeConfig(mode = state.activeMode) {
    return { ...MODE_CONFIG[mode] || MODE_CONFIG.single };
  }

  function getTaskById(taskId) {
    return TASK_LIBRARY.find((task) => task.id === taskId) || null;
  }

  function getTasksForMode(mode = state?.activeMode || "single") {
    const activeMode = MODE_CONFIG[mode] ? mode : "single";
    return TASK_LIBRARY.filter((task) => task.mode === activeMode);
  }

  function findTaskForState(mode, glyph, copybook) {
    const tasks = getTasksForMode(mode);
    return tasks.find((task) => task.glyph === glyph && task.copybook === copybook)
      || tasks.find((task) => task.glyph === glyph)
      || tasks[0]
      || TASK_LIBRARY[0];
  }

  function normalizeTask(taskId, mode, glyph, copybook) {
    const task = taskId ? getTaskById(String(taskId)) : null;
    if (task && task.mode === mode) {
      return task;
    }
    return findTaskForState(mode, glyph, copybook);
  }

  function getCurrentTask() {
    return getTaskById(state.selectedTaskId) || findTaskForState(state.activeMode, state.selectedGlyph, state.selectedCopybook);
  }

  function getTaskCompletionRules(task) {
    const source = task?.completionRules || {};
    const requiredStages = Array.isArray(source.requiredStages)
      ? source.requiredStages.filter((stage) => LEARNING_STAGE_CONFIG[stage])
      : ["strokeBreakdown", "creation", "review"];
    return {
      requiredStages,
      minPractices: normalizeInteger(source.minPractices, 1, 0, 99),
      minArtworks: normalizeInteger(source.minArtworks, 1, 0, 99),
      minReports: normalizeInteger(source.minReports, 1, 0, 99),
      minAverageScore: normalizeInteger(source.minAverageScore, 0, 0, 100)
    };
  }

  function getTaskRuleSummary(rules) {
    const parts = [];
    if (rules.requiredStages.length) {
      parts.push(`阶段${rules.requiredStages.length}项`);
    }
    if (rules.minPractices > 0) {
      parts.push(`练习${rules.minPractices}次`);
    }
    if (rules.minArtworks > 0) {
      parts.push(`作品${rules.minArtworks}幅`);
    }
    if (rules.minReports > 0) {
      parts.push(`报告${rules.minReports}份`);
    }
    if (rules.minAverageScore > 0) {
      parts.push(`均分${rules.minAverageScore}+`);
    }
    return parts.length ? parts.join(" / ") : "无硬性条件";
  }

  function getTaskDependencyStatus(task, visited = new Set()) {
    const dependsOn = Array.isArray(task?.dependsOn)
      ? task.dependsOn.map((id) => String(id || "")).filter(Boolean)
      : [];
    if (!dependsOn.length) {
      return {
        locked: false,
        label: "无前置",
        reason: "该任务没有前置任务。",
        dependencies: []
      };
    }

    const dependencies = dependsOn.map((id) => {
      const dependency = getTaskById(id);
      if (!dependency) {
        return {
          id,
          title: "未知任务",
          done: false,
          percent: 0,
          statusLabel: "依赖缺失",
          reason: "前置任务配置缺失。"
        };
      }
      if (visited.has(dependency.id)) {
        return {
          id: dependency.id,
          title: dependency.taskTitle,
          done: false,
          percent: 0,
          statusLabel: "依赖循环",
          reason: "前置任务配置存在循环依赖。"
        };
      }
      const progress = getTaskProgress(dependency.id, { visited });
      return {
        id: dependency.id,
        title: dependency.taskTitle,
        done: Boolean(progress.complete),
        percent: progress.percent,
        statusLabel: progress.statusLabel,
        reason: progress.complete
          ? `已完成前置任务“${dependency.taskTitle}”。`
          : `前置任务“${dependency.taskTitle}”尚未完成。`
      };
    });
    const doneCount = dependencies.filter((item) => item.done).length;
    const locked = doneCount < dependencies.length;
    const pendingTitles = dependencies.filter((item) => !item.done).map((item) => item.title).join("、");
    return {
      locked,
      label: locked ? `前置 ${doneCount}/${dependencies.length}` : "前置已完成",
      reason: locked ? `请先完成前置任务：${pendingTitles}。` : "所有前置任务已完成。",
      dependencies
    };
  }

  function getTaskLibrary(mode = state.activeMode) {
    const tasks = getTasksForMode(mode);
    const currentTask = getCurrentTask();
    return {
      activeMode: MODE_CONFIG[mode] ? mode : state.activeMode,
      currentTask: currentTask ? clone({
        ...currentTask,
        progress: getTaskProgress(currentTask.id)
      }) : null,
      tasks: clone(tasks.map((task) => {
        const progress = getTaskProgress(task.id);
        return {
          ...task,
          active: task.id === currentTask?.id,
          progress,
          locked: progress.locked,
          dependencyStatus: progress.dependencyStatus
        };
      }))
    };
  }

  function getTaskProgress(taskId = getCurrentTask()?.id, options = {}) {
    const task = getTaskById(String(taskId || ""));
    if (!task) {
      return {
        taskId: null,
        status: "unknown",
        statusLabel: "未知任务",
        percent: 0,
        complete: false,
        locked: false,
        ruleSummary: "未知任务",
        dependencyStatus: {
          locked: false,
          label: "未知任务",
          reason: "未找到任务配置。",
          dependencies: []
        },
        sessionCount: 0,
        savedSessionCount: 0,
        artworkCount: 0,
        reportCount: 0,
        averageScore: 0,
        latestAt: null
      };
    }

    const sessions = state.sessions.filter((session) => getSessionTaskId(session) === task.id);
    const practicedSessions = sessions.filter((session) => (session.strokeCount || 0) > 0 || session.status === "saved" || session.endedAt);
    const savedSessions = sessions.filter((session) => session.status === "saved" || session.endedAt);
    const activeSessions = sessions.filter((session) => session.status === "active" && !session.endedAt);
    const artworks = state.artworks.filter((artwork) => getArtworkTaskId(artwork) === task.id);
    const reports = state.reports.filter((report) => getReportTaskId(report) === task.id);
    const stageProgress = getStageProgress(task.id);
    const rules = getTaskCompletionRules(task);
    const hasStage = (stage) => stageProgress.stages.some((item) => item.stage === stage && item.done);
    const scores = [
      ...practicedSessions.map((session) => session.score),
      ...artworks.map((artwork) => artwork.score)
    ].filter((score) => Number.isFinite(score) && score > 0);
    const averageScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    const latestAt = [
      ...stageProgress.records.map((record) => record.completedAt || record.createdAt),
      ...sessions.map((session) => session.endedAt || session.snapshotAt || session.startedAt),
      ...artworks.map((artwork) => artwork.createdAt),
      ...reports.map((report) => report.createdAt)
    ]
      .filter(Boolean)
      .filter((date) => Number.isFinite(Date.parse(date)))
      .sort((a, b) => Date.parse(b) - Date.parse(a))[0] || null;

    const milestones = [
      ...rules.requiredStages.map((stage) => ({
        id: stage,
        label: LEARNING_STAGE_CONFIG[stage].label,
        done: hasStage(stage)
      }))
    ];
    if (rules.minPractices > 0) {
      milestones.push({
        id: "practice",
        label: rules.minPractices > 1 ? `完成${rules.minPractices}次练习` : "完成练习",
        done: practicedSessions.length >= rules.minPractices,
        current: practicedSessions.length,
        target: rules.minPractices
      });
    }
    if (rules.minArtworks > 0) {
      milestones.push({
        id: "artwork",
        label: rules.minArtworks > 1 ? `保存${rules.minArtworks}幅作品` : "保存作品",
        done: artworks.length >= rules.minArtworks,
        current: artworks.length,
        target: rules.minArtworks
      });
    }
    if (rules.minReports > 0) {
      milestones.push({
        id: "report",
        label: rules.minReports > 1 ? `导出${rules.minReports}份报告` : "导出报告",
        done: reports.length >= rules.minReports,
        current: reports.length,
        target: rules.minReports
      });
    }
    if (rules.minAverageScore > 0) {
      milestones.push({
        id: "averageScore",
        label: `均分达到${rules.minAverageScore}`,
        done: averageScore >= rules.minAverageScore,
        current: averageScore,
        target: rules.minAverageScore
      });
    }
    const doneCount = milestones.filter((item) => item.done).length;
    const percent = milestones.length ? Math.round((doneCount / milestones.length) * 100) : 100;
    const shouldCheckDependencies = options.includeDependencies !== false;
    const nextVisited = options.visited instanceof Set ? new Set(options.visited) : new Set();
    nextVisited.add(task.id);
    const dependencyStatus = shouldCheckDependencies
      ? getTaskDependencyStatus(task, nextVisited)
      : { locked: false, label: "未检查前置", reason: "本次进度计算未检查前置任务。", dependencies: [] };
    const locked = Boolean(dependencyStatus.locked);
    const complete = !locked && percent === 100;
    const status = locked
      ? "locked"
      : complete
        ? "complete"
        : reports.length > 0
          ? "reported"
          : hasStage("review")
            ? "reviewed"
        : artworks.length > 0 || savedSessions.length > 0
          ? "artwork"
          : hasStage("creation")
            ? "creating"
          : activeSessions.length > 0
            ? "active"
          : practicedSessions.length > 0
            ? "practiced"
            : hasStage("strokeBreakdown")
              ? "breakdown"
              : "todo";

    return {
      taskId: task.id,
      status,
      statusLabel: getTaskProgressLabel(status),
      percent,
      complete,
      locked,
      ruleSummary: getTaskRuleSummary(rules),
      completionRules: clone(rules),
      dependencyStatus: clone(dependencyStatus),
      milestones: clone(milestones),
      stageCount: stageProgress.records.length,
      latestStage: stageProgress.latestRecord,
      sessionCount: sessions.length,
      practicedSessionCount: practicedSessions.length,
      savedSessionCount: savedSessions.length,
      activeSessionCount: activeSessions.length,
      artworkCount: artworks.length,
      reportCount: reports.length,
      averageScore,
      latestAt
    };
  }

  function isTaskSelectable(task) {
    return Boolean(task?.id) && !getTaskProgress(task.id).locked;
  }

  function getNextSelectableTask(tasks, currentIndex, predicate = () => true) {
    if (!tasks.length) return null;
    const start = Math.max(0, currentIndex + 1);
    const orderedTasks = [
      ...tasks.slice(start),
      ...tasks.slice(0, start)
    ];
    return orderedTasks.find((task) => predicate(task) && isTaskSelectable(task)) || null;
  }

  function getTaskLockedResult(task) {
    const progress = getTaskProgress(task?.id);
    return {
      ok: false,
      locked: true,
      task: task ? clone(task) : null,
      progress,
      message: progress.dependencyStatus?.reason || "请先完成前置任务和当前完成条件。"
    };
  }

  function getTaskProgressLabel(status) {
    const labels = {
      reported: "已报告",
      reviewed: "已复习",
      complete: "已完成",
      locked: "未解锁",
      artwork: "已保存",
      creating: "创作中",
      active: "练习中",
      practiced: "已练习",
      breakdown: "拆解中",
      todo: "待开始",
      unknown: "未知任务"
    };
    return labels[status] || labels.unknown;
  }

  function getStageProgress(taskId = getCurrentTask()?.id) {
    const task = getTaskById(String(taskId || "")) || getCurrentTask();
    const records = state.stageRecords
      .filter((record) => !task?.id || record.taskId === task.id)
      .sort((a, b) => Date.parse(a.completedAt || a.createdAt) - Date.parse(b.completedAt || b.createdAt));
    const stages = Object.entries(LEARNING_STAGE_CONFIG).map(([stage, config]) => {
      const stageRecords = records.filter((record) => record.stage === stage);
      const latestRecord = stageRecords[stageRecords.length - 1] || null;
      return {
        stage,
        label: config.label,
        done: stageRecords.length > 0,
        count: stageRecords.length,
        latestAt: latestRecord?.completedAt || latestRecord?.createdAt || null
      };
    });
    const done = stages.filter((stage) => stage.done).length;
    return {
      taskId: task?.id || null,
      total: stages.length,
      done,
      percent: Math.round((done / Math.max(1, stages.length)) * 100),
      stages,
      records: clone(records),
      latestRecord: clone(records[records.length - 1] || null)
    };
  }

  function getSessionTaskId(session) {
    if (!session) return null;
    if (getTaskById(session.taskId)) return session.taskId;
    return findTaskForState(session.mode, session.glyph, session.copybook)?.id || null;
  }

  function getArtworkTaskId(artwork) {
    if (!artwork) return null;
    if (getTaskById(artwork.taskId)) return artwork.taskId;
    const linkedSession = artwork.sessionId
      ? state.sessions.find((session) => session.id === artwork.sessionId) || null
      : null;
    return getSessionTaskId(linkedSession)
      || findTaskForState(artwork.mode, artwork.glyph, artwork.copybook)?.id
      || null;
  }

  function getReportTaskId(report) {
    if (!report) return null;
    if (getTaskById(report.taskId)) return report.taskId;
    const linkedSession = report.latestSessionId
      ? state.sessions.find((session) => session.id === report.latestSessionId) || null
      : null;
    const linkedArtwork = report.latestArtworkId
      ? state.artworks.find((artwork) => artwork.id === report.latestArtworkId) || null
      : null;
    return getSessionTaskId(linkedSession) || getArtworkTaskId(linkedArtwork) || null;
  }

  function applyTask(task, options = {}) {
    if (!task) return null;
    state.activeMode = task.mode;
    state.selectedTaskId = task.id;
    state.selectedGlyph = task.glyph;
    state.selectedCopybook = task.copybook;
    state.activeStrokeIndex = 0;
    if (options.resetSession !== false) {
      state.currentSessionId = null;
    }
    resetLecture();
    return task;
  }

  function getCurrentSession() {
    return state.sessions.find((session) => session.id === state.currentSessionId) || null;
  }

  function createLecture(status = "idle") {
    const now = new Date().toISOString();
    return {
      id: makeId("lecture"),
      mode: state.activeMode,
      glyph: state.selectedGlyph,
      copybook: state.selectedCopybook,
      status,
      stepIndex: status === "complete" ? LECTURE_STEP_COUNT - 1 : 0,
      startedAt: status === "idle" ? null : now,
      updatedAt: status === "idle" ? null : now,
      completedAt: status === "complete" ? now : null
    };
  }

  function resetLecture() {
    state.lecture = createLecture("idle");
    syncLectureStatus();
  }

  function syncLectureStatus() {
    state.lectureStatus = state.lecture?.status || "idle";
  }

  function getLectureProgress() {
    const lecture = normalizeLecture(state.lecture, {
      mode: state.activeMode,
      glyph: state.selectedGlyph,
      copybook: state.selectedCopybook,
      fallbackStatus: state.lectureStatus
    });
    const steps = getLectureSteps(lecture);
    const completedSteps = lecture.status === "complete"
      ? steps.length
      : lecture.status === "idle"
        ? 0
        : lecture.stepIndex + 1;
    const progressPercent = Math.round((completedSteps / Math.max(1, steps.length)) * 100);
    return {
      ...clone(lecture),
      steps: clone(steps),
      currentStep: clone(steps[lecture.stepIndex] || steps[0]),
      completedSteps,
      totalSteps: steps.length,
      progressPercent,
      elapsedSeconds: completedSteps * LECTURE_STEP_SECONDS,
      totalSeconds: steps.length * LECTURE_STEP_SECONDS
    };
  }

  function getPlanProgress(plan) {
    const items = Array.isArray(plan?.items) ? plan.items : [];
    const doneCount = items.filter((item) => item.done).length;
    return {
      total: items.length,
      done: doneCount,
      percent: items.length ? Math.round((doneCount / items.length) * 100) : 0
    };
  }

  function getLatestPlan() {
    const plan = state.plans[state.plans.length - 1] || null;
    return plan ? decoratePlan(plan) : null;
  }

  function getPlan(planId = null) {
    if (!planId) {
      return getLatestPlan();
    }
    const plan = state.plans.find((item) => item.id === String(planId));
    return plan ? decoratePlan(plan) : null;
  }

  function getPlanHistory() {
    return [...state.plans]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .map(decoratePlan);
  }

  function decoratePlan(plan) {
    const items = Array.isArray(plan?.items)
      ? plan.items.map((item) => ({
        ...clone(item),
        reminder: getPlanItemReminder(item)
      }))
      : [];
    return {
      ...clone(plan),
      items,
      progress: getPlanProgress(plan),
      reminderSummary: getPlanReminderSummary(items)
    };
  }

  function getPlanItemReminder(item, nowValue = Date.now()) {
    const now = Number.isFinite(nowValue) ? nowValue : Date.now();
    const dueTime = Date.parse(item?.dueAt || "");
    const remindTime = Date.parse(item?.remindAt || "");
    const snoozeTime = Date.parse(item?.snoozedUntil || "");
    const reviewAction = normalizePlanReviewAction(item?.reviewAction);
    const reviewLabel = PLAN_REVIEW_ACTIONS[reviewAction].label;
    let status = "unscheduled";
    let tone = "idle";
    let label = "未设置提醒";

    if (item?.done) {
      if (item.reviewDoneAt) {
        status = "reviewed";
        tone = "done";
        label = "已完成复盘";
      } else {
        status = "review-pending";
        tone = "review";
        label = "待复盘";
      }
    } else if (Number.isFinite(snoozeTime) && snoozeTime > now) {
      status = "snoozed";
      tone = "snoozed";
      label = `已顺延至 ${formatPlanDate(item.snoozedUntil)}`;
    } else if (Number.isFinite(dueTime) && dueTime < now) {
      status = "overdue";
      tone = "danger";
      label = "已逾期";
    } else if (Number.isFinite(remindTime) && remindTime <= now) {
      status = "due";
      tone = "warning";
      label = "已到提醒";
    } else if (Number.isFinite(dueTime)) {
      status = "scheduled";
      tone = "idle";
      label = "未到期";
    }

    return {
      status,
      tone,
      label,
      dueAt: Number.isFinite(dueTime) ? new Date(dueTime).toISOString() : null,
      dueLabel: Number.isFinite(dueTime) ? `到期 ${formatPlanDate(dueTime)}` : "未设置到期",
      remindAt: Number.isFinite(remindTime) ? new Date(remindTime).toISOString() : null,
      remindLabel: Number.isFinite(remindTime) ? `提醒 ${formatPlanDate(remindTime)}` : "未设置提醒",
      snoozedUntil: Number.isFinite(snoozeTime) ? new Date(snoozeTime).toISOString() : null,
      snoozeLabel: Number.isFinite(snoozeTime) ? `顺延 ${formatPlanDate(snoozeTime)}` : "",
      reviewAction,
      reviewLabel,
      reviewDoneAt: normalizePlanDate(item?.reviewDoneAt),
      reviewDoneLabel: item?.reviewDoneAt ? `复盘 ${formatPlanDate(item.reviewDoneAt)}` : "待完成复盘"
    };
  }

  function getPlanReminderSummary(items = []) {
    const reminders = items.map((item) => item.reminder || getPlanItemReminder(item));
    const counts = reminders.reduce((acc, reminder) => {
      acc[reminder.status] = (acc[reminder.status] || 0) + 1;
      return acc;
    }, {});
    const pendingDates = reminders
      .filter((reminder) => !["reviewed", "review-pending"].includes(reminder.status) && reminder.dueAt)
      .map((reminder) => reminder.dueAt)
      .sort((a, b) => Date.parse(a) - Date.parse(b));
    const nextDueAt = pendingDates[0] || null;
    const overdue = counts.overdue || 0;
    const due = counts.due || 0;
    const reviewPending = counts["review-pending"] || 0;
    const snoozed = counts.snoozed || 0;
    let label = "暂无计划提醒";

    if (overdue) {
      label = `${overdue} 项逾期，建议优先处理`;
    } else if (reviewPending) {
      label = `${reviewPending} 项待复盘，点击复盘可触发下一步`;
    } else if (due) {
      label = `${due} 项已到提醒`;
    } else if (snoozed) {
      label = `${snoozed} 项已顺延`;
    } else if (nextDueAt) {
      label = `下一项到期：${formatPlanDate(nextDueAt)}`;
    }

    return {
      total: reminders.length,
      overdue,
      due,
      reviewPending,
      snoozed,
      reviewed: counts.reviewed || 0,
      scheduled: counts.scheduled || 0,
      nextDueAt,
      label
    };
  }

  function getStats() {
    const sessions = state.sessions;
    const currentTask = getCurrentTask();
    const savedSessions = sessions.filter((session) => session.status === "saved" || session.endedAt);
    const practicedSessions = sessions.filter((session) => (session.strokeCount || 0) > 0 || session.status === "saved" || session.endedAt);
    const scoredSessions = practicedSessions.filter((session) => Number.isFinite(session.score) && session.score > 0);
    const scoredArtworks = state.artworks.filter((artwork) => Number.isFinite(artwork.score) && artwork.score > 0);
    const scoredReports = state.reports.filter((report) => Number.isFinite(report.averageScore) && report.averageScore > 0);
    const scores = [
      ...scoredSessions.map((session) => session.score),
      ...scoredArtworks.map((artwork) => artwork.score),
      ...scoredReports.map((report) => report.averageScore)
    ];
    const averageScore = scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;
    const learningMinutes = Math.max(0, sessions.reduce((sum, session) => {
      const start = Date.parse(session.startedAt);
      const end = Date.parse(session.endedAt || session.startedAt);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
        return sum + (session.status === "saved" ? 8 : 0);
      }
      return sum + Math.max(1, Math.round((end - start) / 60000));
    }, 0));
    const latestSession = sessions[sessions.length - 1] || null;
    const latestArtwork = state.artworks[state.artworks.length - 1] || null;
    const latestReport = state.reports[state.reports.length - 1] || null;
    const latestPlan = getLatestPlan();
    const stageProgress = getStageProgress(currentTask?.id);
    const latestStageRecord = state.stageRecords[state.stageRecords.length - 1] || null;
    const recordCount = sessions.length + state.artworks.length + state.reports.length + state.stageRecords.length;
    const practicedGlyphs = new Set([
      ...practicedSessions.map((session) => session.glyph),
      ...state.artworks.map((artwork) => artwork.glyph)
    ].filter(Boolean));
    const practicedCopybooks = new Set([
      ...practicedSessions.map((session) => session.copybook),
      ...state.artworks.map((artwork) => {
        const linkedSession = artwork.sessionId
          ? sessions.find((session) => session.id === artwork.sessionId) || null
          : null;
        return linkedSession?.copybook || state.selectedCopybook;
      })
    ].filter(Boolean));
    const latestRecordAt = [
      ...sessions.map((session) => session.endedAt || session.snapshotAt || session.startedAt),
      ...state.artworks.map((artwork) => artwork.createdAt),
      ...state.reports.map((report) => report.createdAt),
      ...state.stageRecords.map((record) => record.completedAt || record.createdAt)
    ]
      .filter(Boolean)
      .filter((date) => Number.isFinite(Date.parse(date)))
      .sort((a, b) => Date.parse(b) - Date.parse(a))[0] || null;
    const latestFeedback = latestSession?.feedback?.length
      ? latestSession.feedback
      : latestArtwork?.feedback?.length
        ? latestArtwork.feedback
        : [];
    const lectureProgress = getLectureProgress();
    const taskProgress = getTaskProgress(currentTask?.id);
    return {
      activeMode: state.activeMode,
      modeLabel: getModeConfig().label,
      selectedTaskId: currentTask?.id || state.selectedTaskId,
      taskTitle: currentTask?.taskTitle || getModeConfig().taskTitle,
      taskDescription: currentTask?.description || getModeConfig().description,
      taskFocus: currentTask?.focus || "基础笔势",
      taskLevel: currentTask?.level || "基础",
      taskSteps: clone(currentTask?.strokePlan || []),
      taskProgress,
      glyph: state.selectedGlyph,
      copybook: state.selectedCopybook,
      activeStroke: STROKES[state.activeStrokeIndex],
      trainingMode: state.trainingMode,
      lectureStatus: state.lectureStatus,
      lectureProgress,
      stageProgress,
      sessionCount: sessions.length,
      practicedSessionCount: practicedSessions.length,
      savedSessionCount: savedSessions.length,
      artworkCount: state.artworks.length,
      reportCount: state.reports.length,
      planCount: state.plans.length,
      stageRecordCount: state.stageRecords.length,
      recordCount,
      scoreCount: scores.length,
      practicedGlyphCount: practicedGlyphs.size,
      practicedCopybookCount: practicedCopybooks.size,
      latestRecordAt,
      averageScore,
      learningMinutes,
      latestSession,
      latestArtwork,
      latestReport,
      latestPlan,
      latestStageRecord,
      latestFeedback
    };
  }

  function addEvent(type, label) {
    state.events.push({
      id: makeId("event"),
      type,
      label,
      createdAt: new Date().toISOString()
    });
    if (state.events.length > MAX_EVENTS) {
      state.events = state.events.slice(-MAX_EVENTS);
    }
  }

  function setMode(mode) {
    if (!MODE_CONFIG[mode]) {
      return { ok: false, message: "未知学习模式。" };
    }
    const config = MODE_CONFIG[mode];
    const task = getTasksForMode(mode)[0] || findTaskForState(mode, config.glyph, config.copybook);
    applyTask(task);
    addEvent("mode", `切换到${config.label}：${task.taskTitle}`);
    saveState();
    return {
      ok: true,
      task: clone(task),
      message: `已切换到${config.label}，当前任务为“${task.taskTitle}”。`
    };
  }

  function selectDailyGlyph() {
    const tasks = getTasksForMode(state.activeMode);
    const currentTask = getCurrentTask();
    const currentIndex = tasks.findIndex((task) => task.id === currentTask?.id);
    const task = getNextSelectableTask(tasks, currentIndex) || null;
    if (!task) {
      return {
        ok: false,
        locked: true,
        task: currentTask ? clone(currentTask) : null,
        progress: getTaskProgress(currentTask?.id),
        message: "后续任务尚未解锁，请先完成当前任务的阶段、练习、作品和报告条件。"
      };
    }
    applyTask(task);
    addEvent("task", task.taskTitle);
    saveState();
    return {
      ok: true,
      task: clone(task),
      message: `已确认${task.taskTitle}，碑帖为“${task.copybook}”。`
    };
  }

  function rotateCopybook() {
    const tasks = getTasksForMode(state.activeMode);
    const currentTask = getCurrentTask();
    const currentIndex = tasks.findIndex((task) => task.id === currentTask?.id);
    const task = getNextSelectableTask(tasks, currentIndex, (item) => item.copybook !== state.selectedCopybook)
      || getNextSelectableTask(tasks, currentIndex)
      || null;
    if (!task) {
      return {
        ok: false,
        locked: true,
        task: currentTask ? clone(currentTask) : null,
        progress: getTaskProgress(currentTask?.id),
        message: "可切换的碑帖任务尚未解锁，请先完成当前任务条件。"
      };
    }
    applyTask(task);
    addEvent("copybook", `切换碑帖：${task.copybook}`);
    saveState();
    return {
      ok: true,
      task: clone(task),
      message: `已切换到“${task.copybook}”，当前任务为“${task.taskTitle}”。`
    };
  }

  function selectTask(taskId) {
    const task = getTaskById(String(taskId || ""));
    if (!task) {
      return { ok: false, message: "未找到这个学习任务。" };
    }
    if (!isTaskSelectable(task)) {
      return getTaskLockedResult(task);
    }
    applyTask(task);
    addEvent("task", `选择任务：${task.taskTitle}`);
    saveState();
    return {
      ok: true,
      task: clone(task),
      message: `已选择“${task.taskTitle}”，重点练习：${task.focus}。`
    };
  }

  function playLecture() {
    return advanceLecture();
  }

  function recordLearningStage(stage, options = {}) {
    const config = LEARNING_STAGE_CONFIG[stage];
    if (!config) {
      return { ok: false, message: "未知学习阶段。" };
    }

    const task = getCurrentTask();
    const now = new Date().toISOString();
    const targetStep = normalizeInteger(options.targetStep ?? options.target, config.targetStep, 0, 9);
    const record = {
      id: makeId("stage"),
      stage,
      label: config.label,
      taskId: task?.id || null,
      mode: state.activeMode,
      glyph: state.selectedGlyph,
      copybook: state.selectedCopybook,
      targetStep,
      createdAt: now,
      completedAt: now,
      note: String(options.note || config.summary).slice(0, 160)
    };

    state.stageRecords.push(record);
    if (state.stageRecords.length > MAX_STAGE_RECORDS) {
      state.stageRecords = state.stageRecords.slice(-MAX_STAGE_RECORDS);
    }
    if (stage === "strokeBreakdown" || stage === "review") {
      state.activeStrokeIndex = normalizeInteger(options.strokeIndex, state.activeStrokeIndex, 0, STROKES.length - 1);
    }
    addEvent("stage", `${config.label}：${task?.taskTitle || state.selectedGlyph}`);
    saveState();

    const stageProgress = getStageProgress(task?.id);
    return {
      ok: true,
      stageRecord: clone(record),
      stageProgress,
      detail: getStageActionDetail(record, stageProgress, task),
      target: targetStep,
      message: `${config.label}已写入本机学习阶段记录：${stageProgress.done}/${stageProgress.total} 个阶段已完成。`
    };
  }

  function getStageActionDetail(record, stageProgress, task = getCurrentTask()) {
    const config = LEARNING_STAGE_CONFIG[record.stage] || LEARNING_STAGE_CONFIG.strokeBreakdown;
    return {
      type: "stage",
      eyebrow: "本机阶段记录",
      title: config.label,
      status: `阶段 ${stageProgress.done}/${stageProgress.total}`,
      summary: record.note || config.summary,
      metrics: [
        { label: "任务", value: task?.taskTitle || `${record.glyph}字学习` },
        { label: "字帖", value: record.copybook },
        { label: "阶段进度", value: `${stageProgress.percent}%` }
      ],
      items: stageProgress.stages.map((stage) => `${stage.done ? "已完成" : "待完成"}：${stage.label}`)
    };
  }

  function startLecture() {
    if (!state.lecture || state.lecture.status === "idle" || state.lecture.status === "complete") {
      state.lecture = createLecture("playing");
      addEvent("lecture", `开始${state.selectedGlyph}字讲解`);
    } else {
      state.lecture.updatedAt = new Date().toISOString();
    }
    syncLectureStatus();
    saveState();
    const progress = getLectureProgress();
    return {
      ok: true,
      lecture: progress,
      message: `AI 讲解已开始：${progress.currentStep.title}，${progress.completedSteps}/${progress.totalSteps}。`
    };
  }

  function advanceLecture() {
    if (!state.lecture || state.lecture.status === "idle") {
      state.lecture = createLecture("playing");
      addEvent("lecture", `开始${state.selectedGlyph}字讲解`);
    } else if (state.lecture.status === "complete") {
      state.lecture = createLecture("playing");
      addEvent("lecture", `重播${state.selectedGlyph}字讲解`);
    } else if (state.lecture.stepIndex < LECTURE_STEP_COUNT - 1) {
      state.lecture.stepIndex += 1;
    } else {
      state.lecture.status = "complete";
      state.lecture.completedAt = new Date().toISOString();
      addEvent("lecture", `完成${state.selectedGlyph}字讲解`);
    }

    state.lecture.updatedAt = new Date().toISOString();
    syncLectureStatus();
    saveState();
    const progress = getLectureProgress();
    const statusLabel = progress.status === "complete" ? "已完成" : "播放中";
    return {
      ok: true,
      lecture: progress,
      message: `${statusLabel}：${progress.currentStep.title}，${progress.completedSteps}/${progress.totalSteps}。${progress.currentStep.body}`
    };
  }

  function startPractice() {
    const existing = getCurrentSession();
    if (existing && existing.status === "active") {
      return {
        ok: true,
        session: clone(existing),
        message: `已继续当前练习会话：${existing.glyph}字，模式为${existing.trainingMode === "compare" ? "对比" : "示范"}。`
      };
    }

    const scoreBase = 84 + Math.min(10, state.sessions.length * 2);
    const session = {
      id: makeId("session"),
      title: "",
      taskId: getCurrentTask()?.id || `${state.activeMode}-${state.selectedGlyph}`,
      mode: state.activeMode,
      glyph: state.selectedGlyph,
      copybook: state.selectedCopybook,
      startedAt: new Date().toISOString(),
      endedAt: null,
      trainingMode: state.trainingMode,
      strokeIndex: state.activeStrokeIndex,
      strokes: [],
      strokeCount: 0,
      pointCount: 0,
      bounds: null,
      metrics: normalizeMetrics({
        structure: scoreBase + 2,
        stroke: scoreBase,
        technique: scoreBase + 1,
        fluency: scoreBase,
        force: scoreBase - 1
      }),
      score: normalizeScore(scoreBase + 1, 86),
      scoreEvidence: null,
      feedback: [],
      snapshotAt: null,
      status: "active"
    };
    state.sessions.push(session);
    state.currentSessionId = session.id;
    addEvent("practice", `开始练习：${session.glyph}`);
    saveState();
    return {
      ok: true,
      session: clone(session),
      message: `已创建真实练习会话：${session.glyph}字。刷新页面后仍可在学习记录中看到。`
    };
  }

  function setTrainingMode(mode) {
    state.trainingMode = mode === "compare" ? "compare" : "guide";
    const session = getCurrentSession();
    if (session) {
      session.trainingMode = state.trainingMode;
    }
    addEvent("training-mode", state.trainingMode === "compare" ? "对比模式" : "示范模式");
    saveState();
    return {
      ok: true,
      message: `已切换为${state.trainingMode === "compare" ? "对比模式" : "示范模式"}，当前练习会话会保存该模式。`
    };
  }

  function moveStroke(delta) {
    state.activeStrokeIndex = normalizeInteger(state.activeStrokeIndex + delta, 0, 0, STROKES.length - 1);
    const session = getCurrentSession();
    if (session) {
      session.strokeIndex = state.activeStrokeIndex;
    }
    addEvent("stroke", `查看笔画：${STROKES[state.activeStrokeIndex]}`);
    saveState();
    return {
      ok: true,
      message: `当前笔画已切换为“${STROKES[state.activeStrokeIndex]}”。`
    };
  }

  function setArtworkStyle(style) {
    state.artworkStyle = String(style || "楷书");
    addEvent("style", `创作风格：${state.artworkStyle}`);
    saveState();
    return {
      ok: true,
      message: `已切换为${state.artworkStyle}风格，保存作品时会写入作品记录。`
    };
  }

  function recordPracticeResult(result = {}) {
    const practice = normalizePracticeResult(result);
    let session = getCurrentSession();
    if (!session || session.status !== "active") {
      startPractice();
      session = getCurrentSession();
    }

    if (!session) {
      return { ok: false, message: "无法创建练习会话。" };
    }

    session.strokes = practice.strokes;
    session.strokeCount = practice.strokeCount;
    session.pointCount = practice.pointCount;
    session.bounds = practice.bounds;
    session.metrics = practice.metrics;
    session.score = practice.score;
    session.scoreEvidence = practice.scoreEvidence;
    session.feedback = practice.feedback;
    session.snapshotAt = new Date().toISOString();
    addEvent("practice-score", `记录笔迹评分：${practice.score}`);
    saveState();
    return {
      ok: true,
      session: clone(session),
      practice: clone(practice),
      message: `已记录 ${practice.strokeCount} 笔、${practice.pointCount} 个采样点，当前评分 ${practice.score}。`
    };
  }

  function saveArtwork(practiceResult = null) {
    let session = getCurrentSession();
    let practice = null;

    if (practiceResult) {
      const recorded = recordPracticeResult(practiceResult);
      if (!recorded.ok) return recorded;
      session = getCurrentSession();
      practice = recorded.practice;
    }

    if (!session || session.status !== "active") {
      startPractice();
      session = getCurrentSession();
    }

    const now = new Date().toISOString();
    session.endedAt = now;
    session.status = "saved";
    session.trainingMode = state.trainingMode;
    session.strokeIndex = state.activeStrokeIndex;
    const artwork = {
      id: makeId("artwork"),
      sessionId: session.id,
      taskId: getSessionTaskId(session),
      title: `${session.glyph}字${state.artworkStyle}练习`,
      glyph: session.glyph,
      mode: session.mode,
      copybook: session.copybook,
      style: state.artworkStyle,
      score: session.score,
      strokeCount: session.strokeCount || practice?.strokeCount || 0,
      pointCount: session.pointCount || practice?.pointCount || 0,
      scoreEvidence: session.scoreEvidence || practice?.scoreEvidence || null,
      feedback: session.feedback || practice?.feedback || [],
      tags: getDefaultArtworkTags({
        glyph: session.glyph,
        style: state.artworkStyle,
        copybook: session.copybook,
        mode: session.mode
      }),
      imageData: practice?.imageData || null,
      createdAt: now
    };
    state.artworks.push(artwork);
    state.currentSessionId = null;
    addEvent("artwork", `保存作品：${artwork.title}`);
    saveState();
    return {
      ok: true,
      artwork: clone(artwork),
      message: `作品已真实保存到本机记录：${artwork.title}，评分 ${artwork.score}。`
    };
  }

  function filterExcellentRecords() {
    const excellent = state.artworks.filter((artwork) => artwork.score >= 88);
    return {
      ok: true,
      message: excellent.length
        ? `已筛出 ${excellent.length} 条优秀作品：${excellent.slice(-3).map((item) => `${item.glyph}${item.score}`).join("、")}。`
        : "当前还没有 88 分以上作品，先完成并保存一次练习。"
    };
  }

  function createPlan() {
    const stats = getStats();
    const currentTask = getCurrentTask();
    const latestMetrics = stats.latestSession?.metrics || getReportScoreBreakdown();
    const weakness = getWeakestMetric(latestMetrics);
    const taskProgress = getTaskProgress(currentTask.id);
    const hasArtwork = taskProgress.artworkCount > 0;
    const hasReport = taskProgress.reportCount > 0;
    const plan = {
      id: makeId("plan"),
      createdAt: new Date().toISOString(),
      title: `${currentTask.taskTitle}下一阶段练习计划`,
      mode: state.activeMode,
      taskId: currentTask.id,
      glyph: state.selectedGlyph,
      copybook: state.selectedCopybook,
      summary: `围绕“${currentTask.taskTitle}”和“${state.selectedCopybook}”安排可勾选任务，重点是${currentTask.focus}。`,
      items: [
        makePlanItem("plan-practice", `完成 1 次${state.selectedGlyph}字临摹`, `使用${state.trainingMode === "compare" ? "对比" : "示范"}模式书写，并保留真实笔迹。`, { dueDays: 1, reviewAction: "practice" }),
        makePlanItem("plan-task-focus", `复盘${currentTask.focus}`, `按照任务步骤完成：${currentTask.strokePlan.join("、")}。`, { dueDays: 2, reviewAction: "task" }),
        makePlanItem("plan-weakness", `专项补强${weakness.label}`, weakness.advice, { dueDays: 3, reviewAction: "weakness" }),
        makePlanItem("plan-artwork", hasArtwork ? "复盘最近作品" : "保存 1 幅作品", hasArtwork ? "回放最近作品笔迹，记录一条最需要调整的结构或笔法问题。" : "完成书写后保存作品，让复盘区生成截图和评分。", { dueDays: 4, reviewAction: "artwork" }),
        makePlanItem("plan-report", hasReport ? "对比最近学习报告" : "导出 1 份 HTML 学习报告", hasReport ? "查看最近报告中的能力结构，把最低维度作为下一次练习目标。" : "导出报告，把练习次数、作品数量和能力结构沉淀为文件。", { dueDays: 5, reviewAction: "report" })
      ],
      completedAt: null
    };
    state.plans.push(plan);
    addEvent("plan", plan.title);
    saveState();
    return {
      ok: true,
      plan: getLatestPlan(),
      message: `已生成并保存下一阶段练习计划：${plan.items.length} 个任务。`
    };
  }

  function makePlanItem(id, title, detail, options = {}) {
    const dueAt = normalizePlanDate(options.dueAt) || makePlanDueAt(options.dueDays || 1, 18);
    const remindAt = normalizePlanDate(options.remindAt) || makePlanReminderAt(dueAt);
    return {
      id,
      title,
      detail,
      done: false,
      completedAt: null,
      dueAt,
      remindAt,
      snoozedUntil: null,
      reviewAction: normalizePlanReviewAction(options.reviewAction),
      reviewDoneAt: null
    };
  }

  function getWeakestMetric(metrics = {}) {
    const labels = {
      structure: ["结构", "先慢写外轮廓，检查重心是否稳定。"],
      stroke: ["笔画", "单独练起笔、行笔和收笔，避免笔画断裂。"],
      technique: ["笔法", "重点观察转折和提按，让线条有轻重变化。"],
      fluency: ["流畅度", "用回放检查行笔停顿，减少不必要的抖动。"],
      force: ["力度", "控制按压变化，让主笔更明确、辅笔更轻。"]
    };
    return Object.entries(labels)
      .map(([key, [label, advice]]) => ({
        key,
        label,
        advice,
        score: normalizeScore(metrics?.[key], 100)
      }))
      .sort((a, b) => a.score - b.score)[0];
  }

  function togglePlanItem(planId, itemId, done = null) {
    const plan = state.plans.find((item) => item.id === String(planId || ""));
    if (!plan) {
      return { ok: false, message: "未找到学习计划。" };
    }
    const item = plan.items.find((entry) => entry.id === String(itemId || ""));
    if (!item) {
      return { ok: false, message: "未找到计划任务。" };
    }

    item.done = typeof done === "boolean" ? done : !item.done;
    item.completedAt = item.done ? new Date().toISOString() : null;
    if (!item.done) {
      item.reviewDoneAt = null;
    }
    updatePlanCompletion(plan);
    addEvent("plan-item", `${item.done ? "完成" : "取消"}计划项：${item.title}`);
    saveState();
    return {
      ok: true,
      plan: decoratePlan(plan),
      message: item.done ? `已完成计划项：${item.title}。` : `已取消完成：${item.title}。`
    };
  }

  function updatePlanItem(planId, itemId, updates = {}) {
    const plan = state.plans.find((item) => item.id === String(planId || ""));
    if (!plan) {
      return { ok: false, message: "未找到学习计划。" };
    }
    const item = plan.items.find((entry) => entry.id === String(itemId || ""));
    if (!item) {
      return { ok: false, message: "未找到计划任务。" };
    }

    const nextTitle = String(updates.title ?? item.title).trim().replace(/\s+/g, " ").slice(0, 64);
    const nextDetail = String(updates.detail ?? item.detail).trim().replace(/\s+/g, " ").slice(0, 140);
    if (nextTitle.length < 2) {
      return { ok: false, message: "计划项标题至少需要 2 个字符。" };
    }

    let nextDueAt = item.dueAt;
    let nextRemindAt = item.remindAt;
    if (Object.prototype.hasOwnProperty.call(updates, "dueAt")) {
      const parsedDue = normalizeEditablePlanDate(updates.dueAt, 18);
      if (!parsedDue.ok) {
        return { ok: false, message: "到期时间格式无效，请使用 YYYY-MM-DD 或可识别的时间。" };
      }
      nextDueAt = parsedDue.value;
    }
    if (Object.prototype.hasOwnProperty.call(updates, "remindAt")) {
      const parsedRemind = normalizeEditablePlanDate(updates.remindAt, 9);
      if (!parsedRemind.ok) {
        return { ok: false, message: "提醒时间格式无效，请使用 YYYY-MM-DD 或可识别的时间。" };
      }
      nextRemindAt = parsedRemind.value;
    } else if (Object.prototype.hasOwnProperty.call(updates, "dueAt") && nextDueAt && !nextRemindAt) {
      nextRemindAt = makePlanReminderAt(nextDueAt);
    }
    if (nextDueAt && nextRemindAt && Date.parse(nextRemindAt) > Date.parse(nextDueAt)) {
      return { ok: false, message: "提醒时间不能晚于到期时间。" };
    }

    item.title = nextTitle;
    item.detail = nextDetail;
    item.dueAt = nextDueAt;
    item.remindAt = nextRemindAt;
    if (Object.prototype.hasOwnProperty.call(updates, "reviewAction")) {
      item.reviewAction = normalizePlanReviewAction(updates.reviewAction);
    }
    addEvent("plan-item-edit", `编辑计划项：${item.title}`);
    saveState();
    return { ok: true, plan: decoratePlan(plan), message: `已更新计划项：${item.title}。` };
  }

  function addPlanItem(planId, item = {}) {
    const plan = state.plans.find((entry) => entry.id === String(planId || ""));
    if (!plan) {
      return { ok: false, message: "请先生成一份学习计划。" };
    }
    if (plan.items.length >= MAX_PLAN_ITEMS) {
      return { ok: false, message: `单份计划最多保留 ${MAX_PLAN_ITEMS} 个任务，请先删除不需要的计划项。` };
    }

    const title = String(item.title || "").trim().replace(/\s+/g, " ").slice(0, 64);
    const detail = String(item.detail || "").trim().replace(/\s+/g, " ").slice(0, 140);
    if (title.length < 2) {
      return { ok: false, message: "新增计划项标题至少需要 2 个字符。" };
    }

    const parsedDue = normalizeEditablePlanDate(item.dueAt, 18);
    if (!parsedDue.ok) {
      return { ok: false, message: "到期时间格式无效，请使用 YYYY-MM-DD 或可识别的时间。" };
    }
    const parsedRemind = normalizeEditablePlanDate(item.remindAt, 9);
    if (!parsedRemind.ok) {
      return { ok: false, message: "提醒时间格式无效，请使用 YYYY-MM-DD 或可识别的时间。" };
    }
    const dueAt = parsedDue.value || makePlanDueAt(Math.min(plan.items.length + 1, MAX_PLAN_ITEMS), 18);
    const remindAt = parsedRemind.value || makePlanReminderAt(dueAt);
    if (Date.parse(remindAt) > Date.parse(dueAt)) {
      return { ok: false, message: "提醒时间不能晚于到期时间。" };
    }

    const planItem = makePlanItem(makeId("plan-custom"), title, detail || "自定义补充任务，完成后可勾选保存进度。", {
      dueAt,
      remindAt,
      reviewAction: item.reviewAction || "custom"
    });
    plan.items.push(planItem);
    plan.completedAt = null;
    addEvent("plan-item-add", `新增计划项：${planItem.title}`);
    saveState();
    return { ok: true, plan: decoratePlan(plan), item: clone(planItem), message: `已新增计划项：${planItem.title}。` };
  }

  function movePlanItem(planId, itemId, direction) {
    const plan = state.plans.find((item) => item.id === String(planId || ""));
    if (!plan) {
      return { ok: false, message: "未找到学习计划。" };
    }
    const index = plan.items.findIndex((item) => item.id === String(itemId || ""));
    if (index < 0) {
      return { ok: false, message: "未找到计划任务。" };
    }
    const offset = direction === "down" ? 1 : -1;
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= plan.items.length) {
      return { ok: false, message: "该计划项已经在边界位置。" };
    }

    const [item] = plan.items.splice(index, 1);
    plan.items.splice(nextIndex, 0, item);
    addEvent("plan-item-move", `调整计划项顺序：${item.title}`);
    saveState();
    return { ok: true, plan: decoratePlan(plan), message: `已调整计划项顺序：${item.title}。` };
  }

  function deletePlanItem(planId, itemId) {
    const plan = state.plans.find((item) => item.id === String(planId || ""));
    if (!plan) {
      return { ok: false, message: "未找到学习计划。" };
    }
    const index = plan.items.findIndex((item) => item.id === String(itemId || ""));
    if (index < 0) {
      return { ok: false, message: "未找到计划任务。" };
    }

    const [item] = plan.items.splice(index, 1);
    updatePlanCompletion(plan);
    addEvent("plan-item-delete", `删除计划项：${item.title}`);
    saveState();
    return { ok: true, plan: decoratePlan(plan), message: `已删除计划项：${item.title}。` };
  }

  function snoozePlanItem(planId, itemId, days = 1) {
    const plan = state.plans.find((item) => item.id === String(planId || ""));
    if (!plan) {
      return { ok: false, message: "未找到学习计划。" };
    }
    const item = plan.items.find((entry) => entry.id === String(itemId || ""));
    if (!item) {
      return { ok: false, message: "未找到计划任务。" };
    }
    if (item.done) {
      return { ok: false, message: "已完成计划项无需顺延，可以直接复盘。" };
    }

    const duration = normalizeInteger(days, 1, 1, 14);
    const dueTime = Date.parse(item.dueAt || "");
    const base = Number.isFinite(dueTime) && dueTime > Date.now()
      ? new Date(dueTime)
      : new Date();
    item.dueAt = makePlanDueAt(duration, 18, base);
    item.remindAt = makePlanReminderAt(item.dueAt);
    item.snoozedUntil = makePlanSnoozedUntil(duration);
    addEvent("plan-item-snooze", `顺延计划项：${item.title}`);
    saveState();
    return {
      ok: true,
      plan: decoratePlan(plan),
      message: `已顺延计划项：${item.title}，新的到期时间 ${formatPlanDate(item.dueAt)}。`
    };
  }

  function completePlanItemReview(planId, itemId) {
    const plan = state.plans.find((item) => item.id === String(planId || ""));
    if (!plan) {
      return { ok: false, message: "未找到学习计划。" };
    }
    const item = plan.items.find((entry) => entry.id === String(itemId || ""));
    if (!item) {
      return { ok: false, message: "未找到计划任务。" };
    }

    const now = new Date().toISOString();
    item.done = true;
    item.completedAt = item.completedAt || now;
    item.reviewDoneAt = now;
    item.snoozedUntil = null;
    updatePlanCompletion(plan);
    const nextAction = getPlanReviewNextAction(item);
    addEvent("plan-item-review", `完成计划项复盘：${item.title}`);
    saveState();
    return {
      ok: true,
      plan: decoratePlan(plan),
      nextAction,
      message: `已完成复盘：${item.title}。${nextAction?.label ? `下一步：${nextAction.label}。` : ""}`
    };
  }

  function updatePlanCompletion(plan) {
    const progress = getPlanProgress(plan);
    plan.completedAt = progress.total > 0 && progress.done === progress.total
      ? new Date().toISOString()
      : null;
  }

  function getPlanReviewNextAction(item) {
    const reviewAction = normalizePlanReviewAction(item?.reviewAction);
    const meta = PLAN_REVIEW_ACTIONS[reviewAction];
    const stats = getStats();
    if (reviewAction === "artwork" && stats.latestArtwork?.id) {
      return { type: reviewAction, label: "打开最近作品复盘", openArtworkId: stats.latestArtwork.id };
    }
    if (reviewAction === "report" && stats.latestReport?.id) {
      return { type: reviewAction, label: "打开最近学习报告", openReportId: stats.latestReport.id };
    }
    return { type: reviewAction, label: meta.label, targetStep: meta.targetStep };
  }

  function createReport() {
    const stats = getStats();
    const reportTrend = getReportTrend();
    const report = {
      id: makeId("report"),
      taskId: stats.selectedTaskId,
      title: "学习报告",
      createdAt: new Date().toISOString(),
      range: "all",
      format: "html",
      summary: `累计 ${stats.sessionCount} 次练习、${stats.artworkCount} 幅作品，平均评分 ${stats.averageScore}。`,
      sessionCount: stats.sessionCount,
      artworkCount: stats.artworkCount,
      averageScore: stats.averageScore,
      learningMinutes: stats.learningMinutes,
      latestSessionId: stats.latestSession?.id || null,
      latestArtworkId: stats.latestArtwork?.id || null,
      latestStrokeCount: stats.latestSession?.strokeCount || 0,
      latestPointCount: stats.latestSession?.pointCount || 0,
      scoreBreakdown: getReportScoreBreakdown(),
      trend: reportTrend,
      recommendations: [
        ...stats.latestFeedback,
        "优先补齐结构稳定度和重心控制。",
        "每次保存作品后对比最近一次记录。",
        "继续保留真实笔迹，用于后续更精细的笔法分析。"
      ].filter(Boolean).slice(0, 6)
    };
    state.reports.push(report);
    addEvent("report", "导出学习报告");
    saveState();
    downloadHtml(createReportHtml(report), `mr-calligraphy-report-${report.id}.html`);
    return {
      ok: true,
      report: clone(report),
      message: `学习报告已生成：站内可复盘，HTML 文件已下载，含能力雷达、签名水印和打印样式，${stats.sessionCount} 次练习、${stats.artworkCount} 幅作品。`
    };
  }

  function downloadJson(record, filename) {
    const payload = JSON.stringify(record, null, 2);
    const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function downloadHtml(html, filename) {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function getReportScoreBreakdown() {
    const sessions = state.sessions.filter((session) => session.metrics && (session.status === "saved" || session.endedAt));
    const source = sessions.length
      ? sessions.map((session) => session.metrics)
      : state.sessions.length
        ? [state.sessions[state.sessions.length - 1].metrics]
        : [normalizeMetrics(null)];
    const keys = ["structure", "stroke", "technique", "fluency", "force"];
    return keys.reduce((result, key) => {
      const values = source.map((metrics) => normalizeScore(metrics?.[key], 0));
      result[key] = values.length
        ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
        : 0;
      return result;
    }, {});
  }

  function getReportTrend() {
    return [
      ...state.sessions
        .filter((session) => Number.isFinite(session.score) && session.score > 0)
        .map((session) => ({
          label: `${session.glyph}练习`,
          type: "practice",
          score: session.score,
          createdAt: session.endedAt || session.startedAt
        })),
      ...state.artworks
        .filter((artwork) => Number.isFinite(artwork.score) && artwork.score > 0)
        .map((artwork) => ({
          label: artwork.title,
          type: "artwork",
          score: artwork.score,
          createdAt: artwork.createdAt
        }))
    ]
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
      .slice(-8);
  }

  function getReportMetricTrend(report = null) {
    const reportTime = Date.parse(report?.createdAt || "") || Infinity;
    const isInRange = (value) => {
      const time = Date.parse(value || "");
      return !Number.isFinite(reportTime) || Number.isNaN(time) || time <= reportTime;
    };
    const hasMetrics = (metrics) => metrics && Object.values(metrics).some((value) => Number.isFinite(Number(value)) && Number(value) > 0);

    return [
      ...state.sessions
        .filter((session) => hasMetrics(session.metrics) && isInRange(session.endedAt || session.snapshotAt || session.startedAt))
        .map((session) => ({
          id: session.id,
          label: `${session.glyph || "字"}练习`,
          type: "practice",
          score: session.score || 0,
          createdAt: session.endedAt || session.snapshotAt || session.startedAt,
          metrics: normalizeMetrics(session.metrics)
        })),
      ...state.artworks
        .map((artwork) => {
          const session = artwork.sessionId
            ? state.sessions.find((item) => item.id === artwork.sessionId)
            : null;
          if (!session || !hasMetrics(session.metrics) || !isInRange(artwork.createdAt)) {
            return null;
          }
          return {
            id: artwork.id,
            label: artwork.title || `${artwork.glyph || "作品"}`,
            type: "artwork",
            score: artwork.score || session.score || 0,
            createdAt: artwork.createdAt,
            metrics: normalizeMetrics(session.metrics)
          };
        })
        .filter(Boolean),
      ...state.reports
        .map(normalizeReport)
        .filter((item) => hasMetrics(item.scoreBreakdown) && isInRange(item.createdAt))
        .map((item) => ({
          id: item.id,
          label: item.title || "学习报告",
          type: "report",
          score: item.averageScore || 0,
          createdAt: item.createdAt,
          metrics: normalizeMetrics(item.scoreBreakdown)
        }))
    ]
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
      .slice(-12);
  }

  function createReportHtml(report) {
    const normalizedReport = normalizeReport(report);
    const metrics = normalizedReport.scoreBreakdown;
    const trend = normalizedReport.trend.length ? normalizedReport.trend : getReportTrend();
    const latestArtwork = findReportArtwork(normalizedReport);
    const latestSession = findReportSession(normalizedReport);
    const metricLabels = [
      ["structure", "结构"],
      ["stroke", "笔画"],
      ["technique", "笔法"],
      ["fluency", "流畅"],
      ["force", "力度"]
    ];
    const watermarkText = `MR 书法本机学习报告 · ${normalizedReport.id} · ${formatDateTime(normalizedReport.createdAt)}`;
    const radarChart = createReportRadarSvg(metricLabels, metrics);
    const maxTrendScore = Math.max(100, ...trend.map((item) => item.score));
    const imageBlock = latestArtwork?.imageData
      ? `<figure class="artwork"><img src="${escapeAttr(latestArtwork.imageData)}" alt="${escapeAttr(latestArtwork.title)}"><figcaption>${escapeHtml(latestArtwork.title)} · ${latestArtwork.score} 分</figcaption></figure>`
      : `<div class="empty">暂无可嵌入的作品截图。保存作品时生成截图后，报告会自动带上最近作品。</div>`;
    const trendBars = trend.length
      ? trend.map((item) => {
        const height = Math.max(8, Math.round((item.score / maxTrendScore) * 100));
        return `<li><span class="bar" style="height:${height}%"></span><strong>${item.score}</strong><small>${escapeHtml(item.label)}</small></li>`;
      }).join("")
      : `<li class="trend-empty"><small>暂无分数趋势</small></li>`;

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MR 书法学习报告</title>
  <style>
    :root { color-scheme: light; --ink:#17221f; --muted:#61706a; --line:#dbe8e2; --jade:#247a67; --paper:#fbf7ee; --wash:#eef8f3; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--paper); font: 15px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; }
    main { position: relative; z-index: 1; width: min(960px, calc(100% - 32px)); margin: 0 auto; padding: 34px 0 46px; }
    .watermark { position: fixed; inset: 0; z-index: 0; display: grid; place-items: center; pointer-events: none; color: rgba(36, 122, 103, 0.08); font-size: clamp(28px, 6vw, 72px); font-weight: 900; line-height: 1.2; text-align: center; transform: rotate(-28deg); }
    header { display: grid; gap: 12px; padding-bottom: 22px; border-bottom: 2px solid var(--ink); }
    h1, h2, p { margin: 0; }
    h1 { font-size: clamp(30px, 6vw, 56px); line-height: 1.05; letter-spacing: 0; }
    h2 { font-size: 18px; }
    .meta, .muted { color: var(--muted); }
    .summary { margin-top: 18px; padding: 18px; border: 1px solid var(--line); border-radius: 8px; background: #fffdf8; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 18px; }
    .stat { padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    .stat span { display: block; color: var(--muted); font-size: 12px; }
    .stat strong { display: block; margin-top: 4px; font-size: 26px; line-height: 1.1; }
    section { margin-top: 26px; }
    .report-toolbar { position: sticky; top: 0; z-index: 2; display: flex; justify-content: flex-end; margin-bottom: 14px; padding: 10px 0; background: var(--paper); }
    .report-toolbar button { min-height: 38px; padding: 0 16px; border: 1px solid var(--ink); border-radius: 8px; color: #ffffff; background: var(--ink); font: inherit; cursor: pointer; }
    .report-toolbar button:hover { background: var(--jade); }
    .report-layout { display: grid; grid-template-columns: minmax(250px, 0.95fr) minmax(0, 1.05fr); gap: 18px; align-items: center; margin-top: 12px; }
    .radar-card { min-width: 0; padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    .radar-chart { display: block; width: 100%; max-width: 320px; aspect-ratio: 1; margin: 0 auto; overflow: visible; }
    .radar-ring, .radar-axis { stroke: var(--line); stroke-width: 1; fill: none; }
    .radar-area { fill: rgba(36, 122, 103, 0.24); stroke: var(--jade); stroke-width: 2.5; }
    .radar-point { fill: var(--jade); stroke: #ffffff; stroke-width: 2; }
    .radar-label { fill: var(--ink); font-size: 12px; font-weight: 700; }
    .radar-value { fill: var(--muted); font-size: 10px; }
    .metrics { display: grid; gap: 10px; margin: 12px 0 0; padding: 0; list-style: none; }
    .metrics li { display: grid; grid-template-columns: 64px 1fr 44px; gap: 10px; align-items: center; }
    .track { height: 12px; overflow: hidden; border-radius: 99px; background: var(--line); }
    .fill { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--jade), #80b89d); }
    .trend { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); align-items: end; gap: 8px; height: 180px; margin: 14px 0 0; padding: 0; list-style: none; }
    .trend li { display: grid; grid-template-rows: 1fr auto auto; gap: 4px; min-width: 0; height: 100%; text-align: center; }
    .bar { align-self: end; width: 100%; min-height: 8px; border-radius: 6px 6px 0 0; background: var(--jade); }
    .trend small { overflow: hidden; color: var(--muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
    .trend-empty { grid-column: 1 / -1; place-items: center; border: 1px dashed var(--line); border-radius: 8px; }
    .artwork { margin: 14px 0 0; padding: 12px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    .artwork img { display: block; width: 100%; max-height: 420px; object-fit: contain; border-radius: 6px; background: var(--wash); }
    .artwork figcaption { margin-top: 8px; color: var(--muted); font-size: 13px; }
    .empty { margin-top: 12px; padding: 16px; border: 1px dashed var(--line); border-radius: 8px; color: var(--muted); background: #ffffff; }
    .recommendations { display: grid; gap: 8px; margin: 12px 0 0; padding-left: 20px; }
    footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    @media print {
      @page { size: A4; margin: 14mm; }
      body { background: #ffffff; font-size: 12px; }
      main { width: 100%; padding: 0; }
      .watermark { color: rgba(36, 122, 103, 0.09); font-size: 40px; }
      .report-toolbar { display: none; }
      header, section, .summary, .stat, .radar-card, .artwork { break-inside: avoid; page-break-inside: avoid; }
      .summary, .stat, .radar-card, .artwork, .empty { background: #ffffff; }
      .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .trend { height: 140px; }
      .artwork img { max-height: 300px; }
      footer { font-size: 10px; }
    }
    @media (max-width: 720px) { main { width: min(100% - 20px, 960px); padding-top: 20px; } .grid, .report-layout { grid-template-columns: 1fr; } .trend { grid-template-columns: repeat(4, minmax(0, 1fr)); height: 260px; } }
  </style>
</head>
<body>
  <div class="watermark" aria-hidden="true">${escapeHtml(watermarkText)}</div>
  <main>
    <div class="report-toolbar">
      <button type="button" onclick="window.print()">打印 / 保存 PDF</button>
    </div>

    <header>
      <p class="meta">MR Calligraphy Report · ${escapeHtml(formatDateTime(normalizedReport.createdAt))}</p>
      <h1>MR 书法学习报告</h1>
      <p class="muted">${escapeHtml(normalizedReport.summary || "本报告基于当前浏览器中的真实练习、作品和评分记录生成。")}</p>
    </header>

    <div class="grid" aria-label="学习统计">
      <div class="stat"><span>练习次数</span><strong>${normalizedReport.sessionCount}</strong></div>
      <div class="stat"><span>保存作品</span><strong>${normalizedReport.artworkCount}</strong></div>
      <div class="stat"><span>平均评分</span><strong>${normalizedReport.averageScore}</strong></div>
      <div class="stat"><span>学习分钟</span><strong>${normalizedReport.learningMinutes}</strong></div>
    </div>

    <section class="summary">
      <h2>最近一次笔迹</h2>
      <p class="muted">${latestSession ? `${escapeHtml(latestSession.glyph)}字练习，${latestSession.strokeCount || 0} 笔，${latestSession.pointCount || 0} 个采样点。` : "暂无可统计的练习会话。"}</p>
    </section>

    <section>
      <h2>能力结构</h2>
      <div class="report-layout">
        <div class="radar-card">${radarChart}</div>
        <ul class="metrics">
          ${metricLabels.map(([key, label]) => {
            const value = normalizeScore(metrics[key], 0);
            return `<li><span>${label}</span><span class="track"><span class="fill" style="width:${value}%"></span></span><strong>${value}</strong></li>`;
          }).join("")}
        </ul>
      </div>
    </section>

    <section>
      <h2>最近分数趋势</h2>
      <ul class="trend">${trendBars}</ul>
    </section>

    <section>
      <h2>最近作品</h2>
      ${imageBlock}
    </section>

    <section>
      <h2>练习建议</h2>
      <ol class="recommendations">
        ${(normalizedReport.recommendations.length ? normalizedReport.recommendations : ["完成一次书写并保存作品后，会生成更具体的复盘建议。"]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ol>
    </section>

    <footer>报告数据来自本机浏览器存储：${escapeHtml(STORAGE_KEY)}。报告水印：${escapeHtml(watermarkText)}。如需迁移项目，请在主后台导出项目档案。</footer>
  </main>
</body>
</html>`;
  }

  function createReportRadarSvg(metricLabels, metrics) {
    const center = 160;
    const maxRadius = 96;
    const labelRadius = 126;
    const ringValues = [25, 50, 75, 100];
    const getAngle = (index) => -Math.PI / 2 + (Math.PI * 2 * index) / metricLabels.length;
    const axisPoints = metricLabels.map(([, label], index) => {
      const angle = getAngle(index);
      return {
        label,
        outer: getRadarPoint(center, maxRadius, angle),
        labelPoint: getRadarPoint(center, labelRadius, angle)
      };
    });
    const areaPoints = metricLabels.map(([key], index) => {
      const value = normalizeScore(metrics[key], 0);
      return {
        value,
        point: getRadarPoint(center, maxRadius * (value / 100), getAngle(index))
      };
    });
    const rings = ringValues.map((value) => {
      const points = metricLabels
        .map((_, index) => getRadarPoint(center, maxRadius * (value / 100), getAngle(index)))
        .map((point) => `${point.x},${point.y}`)
        .join(" ");
      return `<polygon class="radar-ring" points="${points}"></polygon>`;
    }).join("");
    const axes = axisPoints
      .map((axis) => `<line class="radar-axis" x1="${center}" y1="${center}" x2="${axis.outer.x}" y2="${axis.outer.y}"></line>`)
      .join("");
    const area = areaPoints.map(({ point }) => `${point.x},${point.y}`).join(" ");
    const points = areaPoints
      .map(({ point }) => `<circle class="radar-point" cx="${point.x}" cy="${point.y}" r="4"></circle>`)
      .join("");
    const labels = axisPoints.map((axis, index) => {
      const anchor = axis.labelPoint.x > center + 8 ? "start" : axis.labelPoint.x < center - 8 ? "end" : "middle";
      const value = areaPoints[index].value;
      return `<text class="radar-label" x="${axis.labelPoint.x}" y="${axis.labelPoint.y}" text-anchor="${anchor}" dominant-baseline="central">${escapeHtml(axis.label)}</text><text class="radar-value" x="${axis.labelPoint.x}" y="${axis.labelPoint.y + 14}" text-anchor="${anchor}" dominant-baseline="central">${value}</text>`;
    }).join("");

    return `<svg class="radar-chart" viewBox="0 0 320 320" role="img" aria-label="能力雷达图"><title>能力雷达图</title><g>${rings}</g><g>${axes}</g><polygon class="radar-area" points="${area}"></polygon><g>${points}</g><g>${labels}</g></svg>`;
  }

  function getRadarPoint(center, radius, angle) {
    return {
      x: Number((center + Math.cos(angle) * radius).toFixed(2)),
      y: Number((center + Math.sin(angle) * radius).toFixed(2))
    };
  }

  function findReportArtwork(report) {
    if (report.latestArtworkId) {
      const artwork = state.artworks.find((item) => item.id === report.latestArtworkId);
      if (artwork) return artwork;
    }
    return state.artworks[state.artworks.length - 1] || null;
  }

  function findReportSession(report) {
    if (report.latestSessionId) {
      const session = state.sessions.find((item) => item.id === report.latestSessionId);
      if (session) return session;
    }
    return state.sessions[state.sessions.length - 1] || null;
  }

  function getArtworkSharePackage(artworkId = null) {
    const artwork = findArtworkForShare(artworkId);
    if (!artwork) {
      return {
        ok: false,
        message: "还没有可导出的作品分享页。请先完成书写并保存作品。"
      };
    }

    const session = findArtworkSession(artwork);
    const metrics = pickRealMetrics(session?.metrics) || {};
    const exportedAt = new Date().toISOString();
    const share = {
      exportedAt,
      version: VERSION,
      storageKey: STORAGE_KEY,
      title: `${artwork.title || `${artwork.glyph}字作品`}分享页`,
      artwork: decorateArtworkGalleryItem(artwork),
      session: session
        ? {
            id: session.id,
            title: session.title || `${session.glyph}字练习`,
            glyph: session.glyph,
            copybook: session.copybook,
            trainingMode: session.trainingMode,
            score: session.score || 0,
            strokeCount: session.strokeCount || 0,
            pointCount: session.pointCount || 0,
            createdAt: session.endedAt || session.snapshotAt || session.startedAt,
            feedback: clone(session.feedback || []),
            metrics
          }
        : null,
      metrics,
      report: state.reports[state.reports.length - 1]
        ? {
            id: state.reports[state.reports.length - 1].id,
            title: state.reports[state.reports.length - 1].title || "学习报告",
            averageScore: state.reports[state.reports.length - 1].averageScore || 0,
            createdAt: state.reports[state.reports.length - 1].createdAt
          }
        : null
    };

    return {
      ok: true,
      share: clone(share),
      html: createArtworkShareHtml(share),
      filename: `mr-calligraphy-share-${makeDownloadSlug(artwork.glyph || artwork.id)}-${artwork.id}.html`,
      message: `已生成“${artwork.title}”的本机分享页，包含作品图、评分、标签、反馈和打印样式。`
    };
  }

  function findArtworkForShare(artworkId = null) {
    const recordId = String(artworkId || "").trim();
    if (recordId) {
      return state.artworks.find((item) => item.id === recordId) || null;
    }
    return state.artworks[state.artworks.length - 1] || null;
  }

  function findArtworkSession(artwork) {
    if (!artwork?.sessionId) return null;
    return state.sessions.find((item) => item.id === artwork.sessionId) || null;
  }

  function downloadArtworkSharePage(artworkId = null) {
    const result = getArtworkSharePackage(artworkId);
    if (!result.ok) {
      return result;
    }
    downloadHtml(result.html, result.filename);
    return {
      ok: true,
      filename: result.filename,
      message: `${result.message} 已下载：${result.filename}。`
    };
  }

  function createArtworkShareHtml(share) {
    const artwork = share.artwork;
    const metrics = share.metrics || {};
    const feedback = artwork.feedback?.length
      ? artwork.feedback
      : share.session?.feedback?.length
        ? share.session.feedback
        : ["这幅作品暂无自动反馈，可继续保存更多练习形成复盘。"];
    const tags = artwork.tags?.length ? artwork.tags : [artwork.glyph, artwork.style].filter(Boolean);
    const metricRows = SCORE_METRICS.map((metric) => {
      const value = normalizeScore(metrics[metric.key], 0);
      return `<li><span>${escapeHtml(metric.label)}</span><b><i style="width:${value}%"></i></b><strong>${value || "-"}</strong></li>`;
    }).join("");
    const artworkImage = artwork.imageData
      ? `<figure class="artwork"><img src="${escapeAttr(artwork.imageData)}" alt="${escapeAttr(artwork.title)}"><figcaption>${escapeHtml(artwork.title)} · ${artwork.score || 0} 分</figcaption></figure>`
      : `<div class="artwork-empty">${escapeHtml(artwork.glyph || "作品")}</div>`;
    const watermarkText = `MR 书法本机作品分享 · ${artwork.id} · ${formatDateTime(share.exportedAt)}`;

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(artwork.title)} · MR 书法作品分享</title>
  <style>
    :root { color-scheme: light; --ink:#17221f; --muted:#5f6f69; --line:#d9e6df; --jade:#257861; --gold:#bb8138; --paper:#fbf7ee; --wash:#eef8f3; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--paper); font: 15px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; }
    main { position: relative; z-index: 1; width: min(880px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0 40px; }
    .watermark { position: fixed; inset: 0; z-index: 0; display: grid; place-items: center; pointer-events: none; color: rgba(37, 120, 97, 0.08); font-size: clamp(26px, 6vw, 64px); font-weight: 900; text-align: center; transform: rotate(-26deg); }
    .toolbar { position: sticky; top: 0; z-index: 2; display: flex; justify-content: flex-end; margin-bottom: 14px; padding: 9px 0; background: var(--paper); }
    button { min-height: 38px; padding: 0 16px; border: 1px solid var(--ink); border-radius: 8px; color: #fff; background: var(--ink); font: inherit; cursor: pointer; }
    button:hover { background: var(--jade); }
    header { display: grid; gap: 9px; padding-bottom: 18px; border-bottom: 2px solid var(--ink); }
    h1, h2, p, figure { margin: 0; }
    h1 { font-size: clamp(30px, 7vw, 58px); line-height: 1.05; letter-spacing: 0; }
    h2 { font-size: 18px; }
    .meta, .muted { color: var(--muted); }
    .layout { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(250px, 0.92fr); gap: 18px; align-items: start; margin-top: 18px; }
    .artwork { padding: 12px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    .artwork img { display: block; width: 100%; max-height: 560px; object-fit: contain; border-radius: 6px; background: var(--wash); }
    .artwork figcaption { margin-top: 8px; color: var(--muted); font-size: 13px; }
    .artwork-empty { display: grid; min-height: 360px; place-items: center; border: 1px dashed var(--line); border-radius: 8px; color: rgba(23, 34, 31, 0.62); background: #fff; font-size: 88px; font-weight: 900; }
    .panel { display: grid; gap: 14px; }
    .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .stat, .box { padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    .stat span { display: block; color: var(--muted); font-size: 12px; }
    .stat strong { display: block; margin-top: 4px; font-size: 28px; line-height: 1.1; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tags span { min-height: 26px; padding: 3px 9px; border-radius: 99px; color: var(--ink); background: #edf5ef; font-size: 12px; font-weight: 800; }
    .metrics, .feedback { display: grid; gap: 8px; margin: 8px 0 0; padding: 0; list-style: none; }
    .metrics li { display: grid; grid-template-columns: 56px 1fr 38px; gap: 9px; align-items: center; }
    .metrics b { height: 11px; overflow: hidden; border-radius: 99px; background: var(--line); }
    .metrics i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--jade), var(--gold)); }
    .metrics strong { text-align: right; }
    .feedback li { padding-left: 10px; border-left: 3px solid rgba(37, 120, 97, 0.28); color: var(--muted); }
    footer { margin-top: 24px; padding-top: 14px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    @media print {
      @page { size: A4; margin: 14mm; }
      body { background: #fff; font-size: 12px; }
      main { width: 100%; padding: 0; }
      .toolbar { display: none; }
      .watermark { color: rgba(37, 120, 97, 0.08); font-size: 40px; }
      header, .artwork, .panel, .box, .stat { break-inside: avoid; page-break-inside: avoid; }
      .artwork img { max-height: 430px; }
    }
    @media (max-width: 760px) { main { width: min(100% - 20px, 880px); padding-top: 18px; } .layout, .stats { grid-template-columns: 1fr; } .artwork-empty { min-height: 260px; } }
  </style>
</head>
<body>
  <div class="watermark" aria-hidden="true">${escapeHtml(watermarkText)}</div>
  <main>
    <div class="toolbar"><button type="button" onclick="window.print()">打印 / 保存 PDF</button></div>
    <header>
      <p class="meta">MR Calligraphy Artwork · ${escapeHtml(formatDateTime(artwork.createdAt))}</p>
      <h1>${escapeHtml(artwork.title)}</h1>
      <p class="muted">这是一份本机导出的作品分享页，包含作品图、基础评分、标签和复盘建议；不是云端公开链接。</p>
      <div class="tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
    </header>
    <section class="layout">
      ${artworkImage}
      <div class="panel">
        <div class="stats">
          <div class="stat"><span>评分</span><strong>${artwork.score || 0}</strong></div>
          <div class="stat"><span>练习字</span><strong>${escapeHtml(artwork.glyph || "-")}</strong></div>
          <div class="stat"><span>笔画</span><strong>${artwork.strokeCount || 0}</strong></div>
          <div class="stat"><span>采样</span><strong>${artwork.pointCount || 0}</strong></div>
        </div>
        <section class="box">
          <h2>能力维度</h2>
          <ul class="metrics">${metricRows}</ul>
        </section>
        <section class="box">
          <h2>复盘建议</h2>
          <ol class="feedback">${feedback.slice(0, 6).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
        </section>
        <section class="box">
          <h2>学习来源</h2>
          <p class="muted">${share.session ? `${escapeHtml(share.session.copybook || "本机练习")} / ${share.session.trainingMode === "compare" ? "对比模式" : "示范模式"} / ${escapeHtml(formatDateTime(share.session.createdAt))}` : "这幅作品没有关联练习会话。"}</p>
          <p class="muted">${share.report ? `最近报告平均 ${share.report.averageScore || 0} 分，生成于 ${escapeHtml(formatDateTime(share.report.createdAt))}。` : "暂无关联学习报告。"}</p>
        </section>
      </div>
    </section>
    <footer>分享页数据来自本机浏览器存储：${escapeHtml(STORAGE_KEY)}。导出时间：${escapeHtml(formatDateTime(share.exportedAt))}。迁移项目请在主后台导出项目档案。</footer>
  </main>
</body>
</html>`;
  }

  function makeDownloadSlug(value) {
    return String(value || "artwork")
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      .slice(0, 48) || "artwork";
  }

  function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "时间未知";
    }

    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function getReportPreview() {
    const stats = getStats();
    const averageText = stats.scoreCount ? `平均 ${stats.averageScore} 分` : "暂无真实评分";
    return `本机记录：${stats.sessionCount} 次练习 / ${stats.artworkCount} 幅作品 / ${averageText}`;
  }

  function getLatestReview() {
    const artwork = state.artworks[state.artworks.length - 1] || null;
    const session = artwork
      ? artwork.sessionId
        ? state.sessions.find((item) => item.id === artwork.sessionId) || null
        : null
      : state.sessions[state.sessions.length - 1] || null;
    const report = state.reports[state.reports.length - 1] || null;
    return {
      artwork: artwork ? clone(artwork) : null,
      session: session ? clone(session) : null,
      report: report ? clone(report) : null,
      stats: clone(getStats())
    };
  }

  function getReportDetail(reportId = null) {
    const recordId = String(reportId || "");
    const report = recordId
      ? state.reports.find((item) => item.id === recordId)
      : state.reports[state.reports.length - 1];
    if (!report) {
      return null;
    }

    const normalizedReport = normalizeReport(report);
    const latestSession = findReportSession(normalizedReport);
    const latestArtwork = findReportArtwork(normalizedReport);
    return {
      id: normalizedReport.id,
      type: "report",
      title: normalizedReport.title || "学习报告",
      createdAt: normalizedReport.createdAt,
      status: normalizedReport.format === "html" ? "HTML 报告" : "站内报告",
      summary: normalizedReport.summary,
      sessionCount: normalizedReport.sessionCount,
      artworkCount: normalizedReport.artworkCount,
      averageScore: normalizedReport.averageScore,
      learningMinutes: normalizedReport.learningMinutes,
      latestStrokeCount: normalizedReport.latestStrokeCount,
      latestPointCount: normalizedReport.latestPointCount,
      scoreBreakdown: clone(normalizedReport.scoreBreakdown || normalizeMetrics(null)),
      trend: clone(normalizedReport.trend || []),
      metricTrend: clone(getReportMetricTrend(normalizedReport)),
      recommendations: clone(normalizedReport.recommendations || []),
      latestSession: latestSession
        ? {
            id: latestSession.id,
            title: latestSession.title || `${latestSession.glyph}字练习`,
            glyph: latestSession.glyph,
            score: latestSession.score,
            strokeCount: latestSession.strokeCount || 0,
            pointCount: latestSession.pointCount || 0,
            createdAt: latestSession.endedAt || latestSession.snapshotAt || latestSession.startedAt,
            feedback: clone(latestSession.feedback || [])
          }
        : null,
      latestArtwork: latestArtwork
        ? {
            id: latestArtwork.id,
            title: latestArtwork.title,
            style: latestArtwork.style,
            score: latestArtwork.score,
            strokeCount: latestArtwork.strokeCount || 0,
            pointCount: latestArtwork.pointCount || 0,
            createdAt: latestArtwork.createdAt,
            imageData: latestArtwork.imageData || null,
            feedback: clone(latestArtwork.feedback || [])
          }
        : null
    };
  }

  function getReportComparison(reportId = null) {
    const reports = getSortedReports();
    const total = reports.length;
    if (total < 2) {
      return {
        ok: false,
        total,
        message: "至少需要两份本机学习报告，才能生成跨版本对比。"
      };
    }

    const recordId = String(reportId || "").trim();
    const currentIndex = recordId
      ? reports.findIndex((item) => item.id === recordId)
      : total - 1;
    if (currentIndex < 0) {
      return {
        ok: false,
        total,
        message: "未找到要对比的本机学习报告。"
      };
    }
    if (currentIndex === 0) {
      return {
        ok: false,
        total,
        current: makeReportComparisonSnapshot(reports[currentIndex]),
        message: "这已经是第一份报告，还没有更早报告可对比。"
      };
    }

    const previous = makeReportComparisonSnapshot(reports[currentIndex - 1]);
    const current = makeReportComparisonSnapshot(reports[currentIndex]);
    const metricDeltas = SCORE_METRICS.map((metric) => {
      const previousValue = normalizeScore(previous.scoreBreakdown[metric.key], 0);
      const currentValue = normalizeScore(current.scoreBreakdown[metric.key], 0);
      return {
        key: metric.key,
        label: metric.label,
        previous: previousValue,
        current: currentValue,
        delta: currentValue - previousValue
      };
    });
    const averageDelta = current.averageScore - previous.averageScore;
    const strongestMetric = [...metricDeltas].sort((a, b) => b.delta - a.delta)[0] || null;
    const weakestMetric = [...metricDeltas].sort((a, b) => a.delta - b.delta)[0] || null;
    const summary = averageDelta > 0
      ? `较上一份报告平均分提升 ${averageDelta} 分。`
      : averageDelta < 0
        ? `较上一份报告平均分回落 ${Math.abs(averageDelta)} 分。`
        : "平均分与上一份报告持平。";

    return {
      ok: true,
      total,
      previous,
      current,
      averageDelta,
      sessionDelta: current.sessionCount - previous.sessionCount,
      artworkDelta: current.artworkCount - previous.artworkCount,
      learningMinutesDelta: current.learningMinutes - previous.learningMinutes,
      metricDeltas,
      strongestMetric,
      weakestMetric,
      summary,
      message: "已生成两份本机学习报告的跨版本对比。"
    };
  }

  function getReportComparisonExport(reportId = null) {
    const comparison = getReportComparison(reportId);
    if (!comparison.ok) {
      return {
        ok: false,
        comparison: clone(comparison),
        message: comparison.message || "还没有可导出的报告对比。"
      };
    }

    const exportedAt = new Date().toISOString();
    const filename = `mr-calligraphy-report-comparison-${makeDownloadSlug(comparison.current.id)}.html`;
    return {
      ok: true,
      comparison: clone(comparison),
      exportedAt,
      filename,
      html: createReportComparisonHtml(comparison, exportedAt),
      message: "已生成报告对比离线 HTML，可打开后打印或保存为 PDF。"
    };
  }

  function createReportComparisonHtml(comparison, exportedAt = new Date().toISOString()) {
    const statRows = [
      ["平均分", comparison.previous.averageScore, comparison.current.averageScore, comparison.averageDelta, "分"],
      ["练习次数", comparison.previous.sessionCount, comparison.current.sessionCount, comparison.sessionDelta, "次"],
      ["作品数量", comparison.previous.artworkCount, comparison.current.artworkCount, comparison.artworkDelta, "幅"],
      ["学习分钟", comparison.previous.learningMinutes, comparison.current.learningMinutes, comparison.learningMinutesDelta, "分钟"]
    ].map(([label, previous, current, delta, unit]) => {
      const tone = delta > 0 ? "up" : delta < 0 ? "down" : "same";
      return `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(previous)}${escapeHtml(unit)}</td><td>${escapeHtml(current)}${escapeHtml(unit)}</td><td class="${tone}">${escapeHtml(formatReportComparisonDelta(delta, unit))}</td></tr>`;
    }).join("");
    const metricRows = (comparison.metricDeltas || []).map((metric) => {
      const tone = metric.delta > 0 ? "up" : metric.delta < 0 ? "down" : "same";
      const previousWidth = Math.max(0, Math.min(100, Number(metric.previous) || 0));
      const currentWidth = Math.max(0, Math.min(100, Number(metric.current) || 0));
      return `<li>
        <div class="metric-head"><strong>${escapeHtml(metric.label)}</strong><span class="${tone}">${escapeHtml(formatReportComparisonDelta(metric.delta, "分"))}</span></div>
        <div class="bars">
          <span><b style="width:${previousWidth}%"></b><em>上份 ${escapeHtml(metric.previous)} 分</em></span>
          <span><b style="width:${currentWidth}%"></b><em>本份 ${escapeHtml(metric.current)} 分</em></span>
        </div>
      </li>`;
    }).join("");
    const strongest = comparison.strongestMetric
      ? `${comparison.strongestMetric.label} ${formatReportComparisonDelta(comparison.strongestMetric.delta, "分")}`
      : "暂无";
    const weakest = comparison.weakestMetric
      ? `${comparison.weakestMetric.label} ${formatReportComparisonDelta(comparison.weakestMetric.delta, "分")}`
      : "暂无";

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MR 书法报告对比</title>
  <style>
    :root { color-scheme: light; --ink:#17221f; --muted:#61706a; --line:#dbe8e2; --jade:#247a67; --paper:#fbf7ee; --wash:#eef8f3; --warm:#a45d2f; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--paper); font: 15px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; }
    main { width: min(960px, calc(100% - 32px)); margin: 0 auto; padding: 34px 0 46px; }
    h1, h2, p { margin: 0; }
    h1 { font-size: clamp(30px, 6vw, 54px); line-height: 1.08; letter-spacing: 0; }
    h2 { margin-bottom: 12px; font-size: 18px; }
    header { display: grid; gap: 12px; padding-bottom: 22px; border-bottom: 2px solid var(--ink); }
    .muted { color: var(--muted); }
    .toolbar { position: sticky; top: 0; z-index: 2; display: flex; justify-content: flex-end; margin-bottom: 14px; padding: 10px 0; background: var(--paper); }
    .toolbar button { min-height: 38px; padding: 0 16px; border: 1px solid var(--ink); border-radius: 8px; color: #ffffff; background: var(--ink); font: inherit; cursor: pointer; }
    .toolbar button:hover { background: var(--jade); }
    .summary { margin-top: 18px; padding: 18px; border: 1px solid var(--line); border-radius: 8px; background: #fffdf8; }
    .pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 18px; }
    .report { padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    .report span { display: block; color: var(--muted); font-size: 12px; }
    .report strong { display: block; margin-top: 5px; font-size: 24px; line-height: 1.15; }
    section { margin-top: 26px; }
    table { width: 100%; border-collapse: collapse; overflow: hidden; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    th, td { padding: 11px 12px; border-bottom: 1px solid var(--line); text-align: left; }
    tr:last-child th, tr:last-child td { border-bottom: 0; }
    th { width: 24%; color: var(--muted); font-weight: 800; }
    .up { color: var(--jade); font-weight: 900; }
    .down { color: var(--warm); font-weight: 900; }
    .same { color: var(--muted); font-weight: 900; }
    .metrics { display: grid; gap: 10px; padding: 0; list-style: none; }
    .metrics li { padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    .metric-head { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
    .bars { display: grid; gap: 8px; margin-top: 12px; }
    .bars span { position: relative; display: block; min-height: 26px; overflow: hidden; border-radius: 8px; background: var(--wash); }
    .bars b { position: absolute; inset: 0 auto 0 0; display: block; min-width: 4px; background: rgba(36, 122, 103, 0.28); }
    .bars span:nth-child(2) b { background: rgba(164, 93, 47, 0.22); }
    .bars em { position: relative; z-index: 1; display: block; padding: 3px 9px; color: var(--ink); font-style: normal; font-weight: 800; }
    .notes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .note { padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    @media (max-width: 720px) {
      .pair, .notes { grid-template-columns: 1fr; }
      table, tbody, tr, th, td { display: block; width: 100%; }
      tr { border-bottom: 1px solid var(--line); }
      tr:last-child { border-bottom: 0; }
      th, td { border-bottom: 0; }
    }
    @media print {
      body { background: #ffffff; }
      main { width: 100%; padding: 0; }
      .toolbar { display: none; }
    }
  </style>
</head>
<body>
  <main>
    <div class="toolbar"><button type="button" onclick="window.print()">打印 / 保存 PDF</button></div>
    <header>
      <p class="muted">本机报告对比 · ${escapeHtml(comparison.previous.id)} → ${escapeHtml(comparison.current.id)}</p>
      <h1>MR 书法报告对比</h1>
      <p>${escapeHtml(comparison.summary || "已读取两份本机报告进行对比。")}</p>
    </header>
    <section class="pair" aria-label="对比报告">
      <article class="report"><span>上份报告</span><strong>${escapeHtml(comparison.previous.title)}</strong><p class="muted">${escapeHtml(formatDateTime(comparison.previous.createdAt))} · ${escapeHtml(comparison.previous.averageScore)} 分</p></article>
      <article class="report"><span>本份报告</span><strong>${escapeHtml(comparison.current.title)}</strong><p class="muted">${escapeHtml(formatDateTime(comparison.current.createdAt))} · ${escapeHtml(comparison.current.averageScore)} 分</p></article>
    </section>
    <p class="summary">这份离线页只汇总当前浏览器本机保存的相邻两份报告，不是云端长期报告，也不会上传任何学习数据。</p>
    <section>
      <h2>统计变化</h2>
      <table><tbody>${statRows}</tbody></table>
    </section>
    <section>
      <h2>能力字段变化</h2>
      <ul class="metrics">${metricRows}</ul>
    </section>
    <section class="notes">
      <div class="note"><strong>提升最明显</strong><p class="muted">${escapeHtml(strongest)}</p></div>
      <div class="note"><strong>最需要复盘</strong><p class="muted">${escapeHtml(weakest)}</p></div>
    </section>
    <footer>数据来源：${escapeHtml(STORAGE_KEY)}。导出时间：${escapeHtml(formatDateTime(exportedAt))}。如需长期迁移，请在主后台导出项目档案。</footer>
  </main>
</body>
</html>`;
  }

  function getReportSeries(reportId = null) {
    const reports = getSortedReports();
    const total = reports.length;
    if (!total) {
      return {
        ok: false,
        total,
        points: [],
        metricSeries: [],
        message: "还没有可生成趋势的本机学习报告。"
      };
    }

    const recordId = String(reportId || "").trim();
    const currentIndex = recordId
      ? reports.findIndex((item) => item.id === recordId)
      : total - 1;
    if (currentIndex < 0) {
      return {
        ok: false,
        total,
        points: [],
        metricSeries: [],
        message: "未找到要生成趋势的本机学习报告。"
      };
    }

    const current = reports[currentIndex];
    const points = reports
      .slice(0, currentIndex + 1)
      .slice(-8)
      .map((report) => makeReportSeriesPoint(report, reports.indexOf(report) + 1, current.id));
    if (points.length < 2) {
      return {
        ok: false,
        total,
        currentId: current.id,
        points,
        metricSeries: [],
        message: "至少需要两份本机学习报告，才能生成多报告趋势。"
      };
    }

    const first = points[0];
    const latest = points[points.length - 1];
    const metricSeries = SCORE_METRICS.map((metric) => {
      const metricPoints = points
        .map((point) => ({
          id: point.id,
          title: point.title,
          createdAt: point.createdAt,
          value: normalizeScore(point.scoreBreakdown[metric.key], 0)
        }))
        .filter((point) => point.value > 0);
      const firstMetric = metricPoints[0]?.value || 0;
      const latestMetric = metricPoints[metricPoints.length - 1]?.value || 0;
      return {
        key: metric.key,
        label: metric.label,
        points: metricPoints,
        first: firstMetric,
        latest: latestMetric,
        delta: latestMetric - firstMetric
      };
    });
    const averageDelta = latest.averageScore - first.averageScore;

    return {
      ok: true,
      total,
      currentId: current.id,
      points,
      averageDelta,
      metricSeries,
      summary: `已汇总最近 ${points.length} 份本机报告，平均分较首份${formatReportDeltaText(averageDelta)}。`,
      message: "已生成本机多报告趋势。"
    };
  }

  function getSortedReports() {
    return state.reports
      .map(normalizeReport)
      .filter(Boolean)
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  }

  function makeReportComparisonSnapshot(report) {
    return {
      id: report.id,
      title: report.title || "学习报告",
      createdAt: report.createdAt,
      sessionCount: report.sessionCount || 0,
      artworkCount: report.artworkCount || 0,
      averageScore: report.averageScore || 0,
      learningMinutes: report.learningMinutes || 0,
      scoreBreakdown: clone(report.scoreBreakdown || normalizeMetrics(null))
    };
  }

  function makeReportSeriesPoint(report, sequence, currentId) {
    return {
      id: report.id,
      sequence,
      title: report.title || "学习报告",
      createdAt: report.createdAt,
      averageScore: report.averageScore || 0,
      sessionCount: report.sessionCount || 0,
      artworkCount: report.artworkCount || 0,
      learningMinutes: report.learningMinutes || 0,
      scoreBreakdown: clone(report.scoreBreakdown || normalizeMetrics(null)),
      current: report.id === currentId
    };
  }

  function formatReportDeltaText(value) {
    const number = Number(value) || 0;
    if (number > 0) return `提升 ${number} 分`;
    if (number < 0) return `回落 ${Math.abs(number)} 分`;
    return "持平";
  }

  function formatReportComparisonDelta(value, unit = "") {
    const number = Number(value) || 0;
    const suffix = String(unit || "");
    if (number > 0) return `+${number}${suffix}`;
    if (number < 0) return `${number}${suffix}`;
    return `0${suffix}`;
  }

  function downloadReport(reportId = null) {
    const report = reportId
      ? state.reports.find((item) => item.id === reportId)
      : state.reports[state.reports.length - 1];
    if (!report) {
      return { ok: false, message: "还没有可下载的报告。" };
    }
    downloadHtml(createReportHtml(report), `mr-calligraphy-report-${report.id}.html`);
    return { ok: true, message: `已下载${reportId ? "所选" : "最近"} HTML 学习报告，含能力雷达、签名水印和打印样式。` };
  }

  function downloadReportComparison(reportId = null) {
    const result = getReportComparisonExport(reportId);
    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    downloadHtml(result.html, result.filename);
    return {
      ok: true,
      filename: result.filename,
      message: "已下载报告对比离线 HTML，可打开后用浏览器打印保存为 PDF。"
    };
  }

  function getHistory(options = {}) {
    const filter = String(options.filter || "all");
    const limit = normalizeInteger(options.limit, 8, 1, 50);
    const entries = [
      ...state.sessions.map(sessionToHistoryEntry),
      ...state.artworks.map(artworkToHistoryEntry),
      ...state.reports.map(reportToHistoryEntry)
    ]
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    const filteredEntries = entries.filter((entry) => {
      if (filter === "all") return true;
      if (filter === "excellent") return entry.score >= 88;
      return entry.type === filter;
    });
    const scoreEntries = entries
      .filter((entry) => Number.isFinite(entry.score) && entry.score > 0)
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
      .slice(-8);
    const dailyTrend = getHistoryDailyTrend(entries);
    const metricTrend = getHistoryMetricTrend();
    return {
      filter,
      entries: filteredEntries.slice(0, limit).map(clone),
      total: entries.length,
      filteredTotal: filteredEntries.length,
      allIds: entries.map((entry) => entry.id),
      filteredIds: filteredEntries.map((entry) => entry.id),
      limit,
      hasMore: filteredEntries.length > limit,
      summary: getHistorySummary(entries),
      trend: scoreEntries.map((entry) => ({
        id: entry.id,
        type: entry.type,
        label: entry.shortLabel,
        score: entry.score,
        createdAt: entry.createdAt
      })),
      dailyTrend,
      metricTrend
    };
  }

  function getArtworkGallery(options = {}) {
    const query = String(options.query || "").trim().toLowerCase();
    const tag = String(options.tag || "").trim();
    const limit = normalizeInteger(options.limit, 12, 1, 60);
    const items = state.artworks
      .map(decorateArtworkGalleryItem)
      .sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0));
    const filteredItems = items.filter((item) => {
      const matchesQuery = query ? getArtworkSearchText(item).includes(query) : true;
      const matchesTag = tag ? item.tags.includes(tag) : true;
      return matchesQuery && matchesTag;
    });

    return {
      query,
      tag,
      total: items.length,
      filteredTotal: filteredItems.length,
      hasMore: filteredItems.length > limit,
      items: filteredItems.slice(0, limit).map(clone),
      tags: getArtworkTagCloud(items),
      glyphs: getArtworkGlyphCloud(items),
      summary: items.length
        ? `作品集共 ${items.length} 幅，当前显示 ${Math.min(filteredItems.length, limit)} 幅。`
        : "保存作品后会在这里形成可搜索、可打标签的本机作品集。"
    };
  }

  function decorateArtworkGalleryItem(artwork) {
    const linkedSession = artwork.sessionId
      ? state.sessions.find((session) => session.id === artwork.sessionId) || null
      : null;
    const tags = Array.isArray(artwork.tags) ? normalizeArtworkTags(artwork.tags) : getDefaultArtworkTags(artwork);
    return {
      id: artwork.id,
      type: "artwork",
      title: artwork.title,
      glyph: artwork.glyph,
      mode: artwork.mode,
      copybook: artwork.copybook,
      style: artwork.style,
      score: artwork.score || 0,
      strokeCount: artwork.strokeCount || 0,
      pointCount: artwork.pointCount || 0,
      createdAt: artwork.createdAt,
      imageData: artwork.imageData || null,
      tags,
      feedback: clone(artwork.feedback || linkedSession?.feedback || []),
      sessionId: artwork.sessionId,
      hasStrokes: Boolean(linkedSession?.strokes?.length)
    };
  }

  function getArtworkSearchText(item) {
    return [
      item.title,
      item.glyph,
      item.style,
      item.copybook,
      item.mode,
      `${item.score}`,
      ...(item.tags || []),
      ...(item.feedback || [])
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  function getArtworkTagCloud(items) {
    const counts = new Map();
    items.forEach((item) => {
      (item.tags || []).forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });
    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh-Hans-CN"))
      .slice(0, 18);
  }

  function getArtworkGlyphCloud(items) {
    const counts = new Map();
    items.forEach((item) => {
      const glyph = String(item.glyph || "").trim();
      if (glyph) {
        counts.set(glyph, (counts.get(glyph) || 0) + 1);
      }
    });
    return [...counts.entries()]
      .map(([glyph, count]) => ({ glyph, count }))
      .sort((a, b) => b.count - a.count || a.glyph.localeCompare(b.glyph, "zh-Hans-CN"));
  }

  function updateArtworkTags(id, tags) {
    const recordId = String(id || "").trim();
    const artwork = state.artworks.find((item) => item.id === recordId);
    if (!artwork) {
      return { ok: false, message: "未找到这幅作品。" };
    }

    artwork.tags = normalizeArtworkTags(tags);
    addEvent("artwork-tags", `更新作品标签：${artwork.title}`);
    saveState();
    return {
      ok: true,
      artwork: decorateArtworkGalleryItem(artwork),
      detail: getHistoryDetail(artwork.id),
      message: artwork.tags.length
        ? `已更新作品标签：${artwork.tags.join("、")}。`
        : "已清空这幅作品的自定义标签。"
    };
  }

  function getArtworkComparison(glyph = "") {
    const requestedGlyph = String(glyph || state.selectedGlyph || "").trim();
    const groups = groupArtworksForComparison();
    const requestedGroup = requestedGlyph ? groups.find((group) => group.glyph === requestedGlyph) : null;
    const fallbackGroup = groups.find((group) => group.count >= 2) || null;
    const group = requestedGroup?.count >= 2 ? requestedGroup : fallbackGroup;

    if (!group) {
      return {
        ok: false,
        glyph: requestedGlyph || groups[0]?.glyph || "",
        artworkCount: state.artworks.length,
        groups: groups.map(({ artworks, ...summary }) => summary),
        message: state.artworks.length
          ? "同一个字至少保存两幅作品后，这里会显示前后截图、评分和笔迹指标对比。"
          : "保存两幅同字作品后，这里会显示真实作品对比。"
      };
    }

    const previous = group.artworks[group.artworks.length - 2];
    const latest = group.artworks[group.artworks.length - 1];
    const previousView = decorateArtworkForComparison(previous);
    const latestView = decorateArtworkForComparison(latest);
    const metricDeltas = getArtworkMetricDeltas(previousView.metrics, latestView.metrics);
    const scoreDelta = latestView.score - previousView.score;

    return {
      ok: true,
      glyph: group.glyph,
      total: group.count,
      previous: previousView,
      latest: latestView,
      scoreDelta,
      strokeDelta: latestView.strokeCount - previousView.strokeCount,
      pointDelta: latestView.pointCount - previousView.pointCount,
      metricDeltas,
      summary: `${group.glyph}字最近两幅作品评分${scoreDelta >= 0 ? "提升" : "下降"} ${Math.abs(scoreDelta)} 分。`
    };
  }

  function groupArtworksForComparison() {
    const groups = new Map();
    state.artworks.forEach((artwork) => {
      const glyph = String(artwork.glyph || "作品").trim() || "作品";
      if (!groups.has(glyph)) {
        groups.set(glyph, []);
      }
      groups.get(glyph).push(artwork);
    });

    return [...groups.entries()]
      .map(([glyph, artworks]) => {
        const sorted = artworks
          .slice()
          .sort((a, b) => Date.parse(a.createdAt || 0) - Date.parse(b.createdAt || 0));
        const latest = sorted[sorted.length - 1] || null;
        return {
          glyph,
          count: sorted.length,
          latestAt: latest?.createdAt || "",
          latestScore: latest?.score || 0,
          artworks: sorted
        };
      })
      .sort((a, b) => Date.parse(b.latestAt || 0) - Date.parse(a.latestAt || 0));
  }

  function decorateArtworkForComparison(artwork) {
    const linkedSession = artwork?.sessionId
      ? state.sessions.find((session) => session.id === artwork.sessionId) || null
      : null;
    const metrics = pickRealMetrics(linkedSession?.metrics) || {};
    return {
      id: artwork.id,
      title: artwork.title,
      glyph: artwork.glyph,
      style: artwork.style,
      score: artwork.score || 0,
      strokeCount: artwork.strokeCount || 0,
      pointCount: artwork.pointCount || 0,
      createdAt: artwork.createdAt,
      imageData: artwork.imageData || null,
      feedback: clone(artwork.feedback || linkedSession?.feedback || []),
      metrics
    };
  }

  function getArtworkMetricDeltas(previousMetrics = {}, latestMetrics = {}) {
    return SCORE_METRICS
      .map((metric) => {
        const previous = Number(previousMetrics[metric.key]) || 0;
        const latest = Number(latestMetrics[metric.key]) || 0;
        if (!previous && !latest) {
          return null;
        }
        return {
          key: metric.key,
          label: metric.label,
          previous,
          latest,
          delta: latest - previous
        };
      })
      .filter(Boolean);
  }

  function getHistoryDailyTrend(entries) {
    const groups = new Map();
    entries.forEach((entry) => {
      const date = new Date(entry.createdAt);
      if (!Number.isFinite(date.getTime())) {
        return;
      }
      const key = date.toISOString().slice(0, 10);
      if (!groups.has(key)) {
        groups.set(key, {
          date: key,
          label: key.slice(5),
          scores: [],
          practiceCount: 0,
          artworkCount: 0,
          reportCount: 0,
          totalCount: 0
        });
      }
      const group = groups.get(key);
      group.totalCount += 1;
      if (entry.type === "practice") group.practiceCount += 1;
      if (entry.type === "artwork") group.artworkCount += 1;
      if (entry.type === "report") group.reportCount += 1;
      if (Number.isFinite(entry.score) && entry.score > 0) {
        group.scores.push(entry.score);
      }
    });

    return [...groups.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map((group) => ({
        date: group.date,
        label: group.label,
        averageScore: group.scores.length
          ? Math.round(group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length)
          : 0,
        scoreCount: group.scores.length,
        practiceCount: group.practiceCount,
        artworkCount: group.artworkCount,
        reportCount: group.reportCount,
        totalCount: group.totalCount
      }));
  }

  function getHistoryMetricTrend() {
    const sources = getMetricTrendSources();
    return SCORE_METRICS
      .map((metric) => {
        const points = sources
          .filter((source) => Number.isFinite(source.metrics?.[metric.key]) && source.metrics[metric.key] > 0)
          .map((source) => ({
            id: source.id,
            type: source.type,
            label: source.label,
            date: source.date,
            shortDate: source.date.slice(5),
            value: source.metrics[metric.key]
          }));

        if (!points.length) {
          return null;
        }

        const latest = points[points.length - 1].value;
        const first = points[0].value;
        const average = Math.round(points.reduce((sum, point) => sum + point.value, 0) / points.length);
        return {
          key: metric.key,
          label: metric.label,
          average,
          latest,
          delta: latest - first,
          points
        };
      })
      .filter(Boolean);
  }

  function getMetricTrendSources() {
    const sources = [];
    const coveredSessionIds = new Set();

    state.sessions.forEach((session) => {
      if (!isMetricSession(session)) return;
      const metrics = pickRealMetrics(session.metrics);
      if (!metrics) return;
      coveredSessionIds.add(session.id);
      sources.push({
        id: session.id,
        type: "practice",
        label: `${session.glyph}练习`,
        date: toDateKey(session.endedAt || session.snapshotAt || session.startedAt),
        metrics
      });
    });

    state.artworks.forEach((artwork) => {
      const linkedSession = artwork.sessionId
        ? state.sessions.find((session) => session.id === artwork.sessionId) || null
        : null;
      if (!linkedSession || coveredSessionIds.has(linkedSession.id) || !isMetricSession(linkedSession)) {
        return;
      }
      const metrics = pickRealMetrics(linkedSession.metrics);
      if (!metrics) return;
      sources.push({
        id: artwork.id,
        type: "artwork",
        label: artwork.title || `${artwork.glyph}作品`,
        date: toDateKey(artwork.createdAt),
        metrics
      });
    });

    state.reports.forEach((report) => {
      if ((report.sessionCount || 0) + (report.artworkCount || 0) <= 0) return;
      if (!Number.isFinite(report.averageScore) || report.averageScore <= 0) return;
      const metrics = pickRealMetrics(report.scoreBreakdown);
      if (!metrics) return;
      sources.push({
        id: report.id,
        type: "report",
        label: report.title || "学习报告",
        date: toDateKey(report.createdAt),
        metrics
      });
    });

    return sources
      .filter((source) => source.date)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-12);
  }

  function isMetricSession(session) {
    return Boolean(
      session
      && ((session.strokeCount || 0) > 0 || session.status === "saved" || session.endedAt)
      && Number.isFinite(session.score)
      && session.score > 0
    );
  }

  function pickRealMetrics(metrics) {
    if (!metrics || typeof metrics !== "object") return null;
    const picked = {};
    SCORE_METRICS.forEach((metric) => {
      const value = Number(metrics[metric.key]);
      if (Number.isFinite(value) && value > 0) {
        picked[metric.key] = Math.min(100, Math.max(0, Math.round(value)));
      }
    });
    return Object.keys(picked).length ? picked : null;
  }

  function toDateKey(value) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : "";
  }

  function sessionToHistoryEntry(session) {
    return {
      id: session.id,
      type: "practice",
      title: session.title || `${session.glyph}字${session.trainingMode === "compare" ? "对比" : "示范"}练习`,
      shortLabel: session.glyph,
      createdAt: session.endedAt || session.startedAt,
      score: session.score,
      meta: `${session.strokeCount || 0} 笔 / ${session.pointCount || 0} 点`,
      status: session.status === "saved" ? "已保存" : "进行中",
      sessionId: session.id
    };
  }

  function artworkToHistoryEntry(artwork) {
    return {
      id: artwork.id,
      type: "artwork",
      title: artwork.title,
      shortLabel: artwork.glyph,
      createdAt: artwork.createdAt,
      score: artwork.score,
      meta: `${artwork.style} / ${artwork.strokeCount || 0} 笔`,
      status: artwork.imageData ? "有截图" : "无截图",
      sessionId: artwork.sessionId
    };
  }

  function reportToHistoryEntry(report) {
    return {
      id: report.id,
      type: "report",
      title: report.title || "学习报告",
      shortLabel: "报告",
      createdAt: report.createdAt,
      score: report.averageScore,
      meta: `${report.sessionCount} 次练习 / ${report.artworkCount} 幅作品`,
      status: "可下载",
      reportId: report.id
    };
  }

  function getHistoryDetail(id) {
    const recordId = String(id || "");
    const session = state.sessions.find((item) => item.id === recordId);
    if (session) {
      return {
        type: "practice",
        id: session.id,
        title: session.title || `${session.glyph}字${session.trainingMode === "compare" ? "对比" : "示范"}练习`,
        createdAt: session.endedAt || session.startedAt,
        score: session.score,
        status: session.status === "saved" ? "已保存" : "进行中",
        summary: `${session.copybook} / ${session.strokeCount || 0} 笔 / ${session.pointCount || 0} 个采样点`,
        glyph: session.glyph,
        copybook: session.copybook,
        trainingMode: session.trainingMode,
        strokeCount: session.strokeCount || 0,
        pointCount: session.pointCount || 0,
        metrics: clone(session.metrics),
        feedback: clone(session.feedback || []),
        strokes: clone(session.strokes || [])
      };
    }

    const artwork = state.artworks.find((item) => item.id === recordId);
    if (artwork) {
      const linkedSession = artwork.sessionId
        ? state.sessions.find((item) => item.id === artwork.sessionId) || null
        : null;
      return {
        type: "artwork",
        id: artwork.id,
        title: artwork.title,
        createdAt: artwork.createdAt,
        score: artwork.score,
        status: artwork.imageData ? "有截图" : "无截图",
        summary: `${artwork.style} / ${artwork.strokeCount || 0} 笔 / ${artwork.pointCount || 0} 个采样点`,
        glyph: artwork.glyph,
        copybook: artwork.copybook,
        style: artwork.style,
        tags: clone(artwork.tags || []),
        strokeCount: artwork.strokeCount || 0,
        pointCount: artwork.pointCount || 0,
        feedback: clone(artwork.feedback || linkedSession?.feedback || []),
        imageData: artwork.imageData || null,
        sessionId: artwork.sessionId,
        strokes: clone(linkedSession?.strokes || [])
      };
    }

    const report = state.reports.find((item) => item.id === recordId);
    if (report) {
      return {
        type: "report",
        id: report.id,
        title: report.title || "学习报告",
        createdAt: report.createdAt,
        score: report.averageScore,
        status: report.format === "html" ? "HTML" : "可下载",
        summary: report.summary,
        sessionCount: report.sessionCount,
        artworkCount: report.artworkCount,
        averageScore: report.averageScore,
        learningMinutes: report.learningMinutes || 0,
        latestStrokeCount: report.latestStrokeCount || 0,
        latestPointCount: report.latestPointCount || 0,
        recommendations: clone(report.recommendations || []),
        scoreBreakdown: clone(report.scoreBreakdown || normalizeMetrics(null)),
        trend: clone(report.trend || [])
      };
    }

    return null;
  }

  function getHistorySummary(entries) {
    const practiceCount = entries.filter((entry) => entry.type === "practice").length;
    const artworkCount = entries.filter((entry) => entry.type === "artwork").length;
    const reportCount = entries.filter((entry) => entry.type === "report").length;
    const scored = entries.filter((entry) => entry.score > 0);
    const average = scored.length
      ? Math.round(scored.reduce((sum, entry) => sum + entry.score, 0) / scored.length)
      : 0;
    return {
      total: entries.length,
      practiceCount,
      artworkCount,
      reportCount,
      averageScore: average
    };
  }

  function renameHistoryRecord(id, title) {
    const recordId = String(id || "");
    const nextTitle = String(title || "").trim().replace(/\s+/g, " ").slice(0, 48);
    if (!recordId) {
      return { ok: false, message: "请选择一条记录。" };
    }
    if (nextTitle.length < 2) {
      return { ok: false, message: "标题至少需要 2 个字符。" };
    }

    const session = state.sessions.find((item) => item.id === recordId);
    if (session) {
      session.title = nextTitle;
      addEvent("history-rename", `重命名练习：${nextTitle}`);
      saveState();
      return { ok: true, detail: getHistoryDetail(recordId), message: `已重命名练习记录：${nextTitle}。` };
    }

    const artwork = state.artworks.find((item) => item.id === recordId);
    if (artwork) {
      artwork.title = nextTitle;
      addEvent("history-rename", `重命名作品：${nextTitle}`);
      saveState();
      return { ok: true, detail: getHistoryDetail(recordId), message: `已重命名作品记录：${nextTitle}。` };
    }

    const report = state.reports.find((item) => item.id === recordId);
    if (report) {
      report.title = nextTitle;
      addEvent("history-rename", `重命名报告：${nextTitle}`);
      saveState();
      return { ok: true, detail: getHistoryDetail(recordId), message: `已重命名报告记录：${nextTitle}。` };
    }

    return { ok: false, message: "未找到要重命名的记录。" };
  }

  function normalizeHistoryIds(ids) {
    return [...new Set((Array.isArray(ids) ? ids : [ids])
      .map((id) => String(id || "").trim())
      .filter(Boolean))];
  }

  function collectHistoryRecords(ids) {
    const selected = new Set(normalizeHistoryIds(ids));
    return {
      practice: state.sessions.filter((session) => selected.has(session.id)),
      artwork: state.artworks.filter((artwork) => selected.has(artwork.id)),
      report: state.reports.filter((report) => selected.has(report.id))
    };
  }

  function getDeletedHistoryCount(deleted) {
    return (deleted.practice?.length || 0) + (deleted.artwork?.length || 0) + (deleted.report?.length || 0);
  }

  function collectHistoryDeleteReferences(deleted) {
    const deletedSessionIds = new Set((deleted.practice || []).map((session) => session.id));
    const deletedArtworkIds = new Set((deleted.artwork || []).map((artwork) => artwork.id));
    return {
      currentSessionId: deletedSessionIds.has(state.currentSessionId) ? state.currentSessionId : null,
      artworkSessionLinks: state.artworks
        .filter((artwork) => deletedSessionIds.has(artwork.sessionId))
        .map((artwork) => ({ artworkId: artwork.id, sessionId: artwork.sessionId })),
      reportSessionLinks: state.reports
        .filter((report) => deletedSessionIds.has(report.latestSessionId))
        .map((report) => ({ reportId: report.id, sessionId: report.latestSessionId })),
      reportArtworkLinks: state.reports
        .filter((report) => deletedArtworkIds.has(report.latestArtworkId))
        .map((report) => ({ reportId: report.id, artworkId: report.latestArtworkId }))
    };
  }

  function pushHistoryTrash(deleted, references, title = "") {
    const deletedCount = getDeletedHistoryCount(deleted);
    const entry = normalizeHistoryTrashEntry({
      id: makeId("trash"),
      title: title || summarizeHistoryTrash(deleted, deletedCount),
      deletedAt: new Date().toISOString(),
      records: {
        sessions: (deleted.practice || []).map(clone),
        artworks: (deleted.artwork || []).map(clone),
        reports: (deleted.report || []).map(clone)
      },
      references
    });
    if (!entry) return null;

    state.historyTrash = [
      entry,
      ...state.historyTrash.filter((item) => item.id !== entry.id)
    ].slice(0, MAX_HISTORY_TRASH);
    return entry;
  }

  function summarizeHistoryTrash(deleted, deletedCount) {
    if (deletedCount === 1) {
      const record = deleted.practice?.[0] || deleted.artwork?.[0] || deleted.report?.[0];
      return `已删除：${record?.title || record?.glyph || "学习档案"}`;
    }
    return `批量删除 ${deletedCount} 条学习档案`;
  }

  function applyHistoryDeletion(deleted) {
    const deletedSessionIds = new Set((deleted.practice || []).map((session) => session.id));
    const deletedArtworkIds = new Set((deleted.artwork || []).map((artwork) => artwork.id));
    const selectedIds = new Set([
      ...deletedSessionIds,
      ...deletedArtworkIds,
      ...(deleted.report || []).map((report) => report.id)
    ]);

    state.sessions = state.sessions.filter((session) => !selectedIds.has(session.id));
    state.artworks = state.artworks.filter((artwork) => !selectedIds.has(artwork.id));
    state.reports = state.reports.filter((report) => !selectedIds.has(report.id));

    if (deletedSessionIds.has(state.currentSessionId)) {
      state.currentSessionId = null;
    }

    state.artworks.forEach((artwork) => {
      if (deletedSessionIds.has(artwork.sessionId)) {
        artwork.sessionId = null;
      }
    });
    state.reports.forEach((report) => {
      if (deletedSessionIds.has(report.latestSessionId)) {
        report.latestSessionId = null;
      }
      if (deletedArtworkIds.has(report.latestArtworkId)) {
        report.latestArtworkId = null;
      }
    });
  }

  function deleteHistoryRecord(id) {
    const recordId = String(id || "");
    if (!recordId) {
      return { ok: false, message: "请选择一条记录。" };
    }

    const deleted = collectHistoryRecords([recordId]);
    const deletedCount = getDeletedHistoryCount(deleted);
    if (!deletedCount) {
      return { ok: false, message: "未找到要删除的记录。" };
    }

    const references = collectHistoryDeleteReferences(deleted);
    const trash = pushHistoryTrash(deleted, references);
    applyHistoryDeletion(deleted);
    const deletedType = deleted.practice.length ? "practice" : deleted.artwork.length ? "artwork" : "report";
    const record = deleted.practice[0] || deleted.artwork[0] || deleted.report[0];
    addEvent("history-delete", `移入回收站：${record.title || record.glyph || "学习档案"}`);
    saveState();
    return {
      ok: true,
      deletedType,
      trash: decorateHistoryTrashEntry(trash),
      message: `已移入回收站：${record.title || record.glyph || "学习档案"}。可用“恢复最近删除”找回。`
    };
  }

  function getHistoryExportPayload(ids) {
    const selectedIds = normalizeHistoryIds(ids);
    const selected = new Set(selectedIds);
    const sessions = state.sessions.filter((session) => selected.has(session.id));
    const artworks = state.artworks.filter((artwork) => selected.has(artwork.id));
    const reports = state.reports.filter((report) => selected.has(report.id));
    const history = [
      ...sessions.map(sessionToHistoryEntry),
      ...artworks.map(artworkToHistoryEntry),
      ...reports.map(reportToHistoryEntry)
    ]
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return {
      exportedAt: new Date().toISOString(),
      version: VERSION,
      selectedIds,
      summary: getHistorySummary(history),
      records: {
        sessions: sessions.map(clone),
        artworks: artworks.map(clone),
        reports: reports.map(clone)
      },
      history: history.map((entry) => getHistoryDetail(entry.id)).filter(Boolean)
    };
  }

  function downloadHistoryRecords(ids) {
    const payload = getHistoryExportPayload(ids);
    if (!payload.history.length) {
      return { ok: false, message: "请选择要导出的学习档案记录。" };
    }
    downloadJson(payload, `mr-calligraphy-history-selection-${Date.now()}.json`);
    return { ok: true, count: payload.history.length, message: `已导出 ${payload.history.length} 条所选学习档案。` };
  }

  function deleteHistoryRecords(ids) {
    const selectedIds = normalizeHistoryIds(ids);
    if (!selectedIds.length) {
      return { ok: false, message: "请选择要删除的学习档案记录。" };
    }

    const deleted = collectHistoryRecords(selectedIds);
    const deletedCount = getDeletedHistoryCount(deleted);
    if (!deletedCount) {
      return { ok: false, message: "未找到要删除的学习档案记录。" };
    }

    const references = collectHistoryDeleteReferences(deleted);
    const trash = pushHistoryTrash(deleted, references, `批量删除 ${deletedCount} 条学习档案`);
    applyHistoryDeletion(deleted);
    addEvent("history-batch-delete", `移入回收站：${deletedCount} 条学习档案`);
    saveState();
    return {
      ok: true,
      deletedCount,
      trash: decorateHistoryTrashEntry(trash),
      deleted: {
        practice: deleted.practice.length,
        artwork: deleted.artwork.length,
        report: deleted.report.length
      },
      message: `已将 ${deletedCount} 条学习档案移入回收站，可用“恢复最近删除”找回。`
    };
  }

  function getHistoryTrash() {
    const entries = state.historyTrash.map(decorateHistoryTrashEntry).filter(Boolean);
    return {
      entries,
      total: entries.length,
      recordCount: entries.reduce((sum, entry) => sum + entry.recordCount, 0),
      latest: entries[0] || null
    };
  }

  function decorateHistoryTrashEntry(entry) {
    if (!entry) return null;
    const sessions = entry.records?.sessions || [];
    const artworks = entry.records?.artworks || [];
    const reports = entry.records?.reports || [];
    const recordCount = sessions.length + artworks.length + reports.length;
    return {
      id: entry.id,
      title: entry.title,
      deletedAt: entry.deletedAt,
      recordCount,
      counts: {
        practice: sessions.length,
        artwork: artworks.length,
        report: reports.length
      }
    };
  }

  function restoreHistoryTrash(trashId = null) {
    const targetId = trashId ? String(trashId) : state.historyTrash[0]?.id;
    const trash = state.historyTrash.find((entry) => entry.id === targetId);
    if (!trash) {
      return { ok: false, message: "回收站里没有可恢复的学习档案。" };
    }

    const restored = {
      practice: restoreRecords(state.sessions, trash.records.sessions, normalizeSession),
      artwork: restoreRecords(state.artworks, trash.records.artworks, normalizeArtwork),
      report: restoreRecords(state.reports, trash.records.reports, normalizeReport)
    };
    restoreHistoryReferences(trash.references);
    state.historyTrash = state.historyTrash.filter((entry) => entry.id !== trash.id);
    const restoredCount = restored.practice + restored.artwork + restored.report;
    addEvent("history-restore", `恢复学习档案：${trash.title}`);
    saveState();
    return {
      ok: true,
      restored,
      restoredCount,
      message: restoredCount
        ? `已恢复 ${restoredCount} 条学习档案：${trash.title}。`
        : `回收站条目“${trash.title}”已清理；原记录当前已存在，无需重复恢复。`
    };
  }

  function restoreRecords(target, records, normalize) {
    let restored = 0;
    (records || []).forEach((record) => {
      const normalized = normalize(record);
      if (!normalized || target.some((item) => item.id === normalized.id)) {
        return;
      }
      target.push(normalized);
      restored += 1;
    });
    return restored;
  }

  function restoreHistoryReferences(references = {}) {
    const sessionIds = new Set(state.sessions.map((session) => session.id));
    const artworkIds = new Set(state.artworks.map((artwork) => artwork.id));
    const reportIds = new Set(state.reports.map((report) => report.id));

    if (references.currentSessionId && sessionIds.has(references.currentSessionId)) {
      state.currentSessionId = references.currentSessionId;
    }
    (references.artworkSessionLinks || []).forEach((link) => {
      const artwork = state.artworks.find((item) => item.id === link.artworkId);
      if (artwork && sessionIds.has(link.sessionId)) {
        artwork.sessionId = link.sessionId;
      }
    });
    (references.reportSessionLinks || []).forEach((link) => {
      const report = state.reports.find((item) => item.id === link.reportId);
      if (report && sessionIds.has(link.sessionId)) {
        report.latestSessionId = link.sessionId;
      }
    });
    (references.reportArtworkLinks || []).forEach((link) => {
      const report = state.reports.find((item) => item.id === link.reportId);
      if (report && reportIds.has(link.reportId) && artworkIds.has(link.artworkId)) {
        report.latestArtworkId = link.artworkId;
      }
    });
  }

  function clearHistoryTrash() {
    const count = state.historyTrash.length;
    const recordCount = getHistoryTrash().recordCount;
    if (!count) {
      return { ok: false, message: "回收站已经是空的。" };
    }
    state.historyTrash = [];
    addEvent("history-trash-clear", `清空回收站：${recordCount} 条记录`);
    saveState();
    return { ok: true, count, recordCount, message: `已清空回收站：${recordCount} 条学习档案。` };
  }

  function deleteHistoryTrashEntry(trashId) {
    const targetId = String(trashId || "");
    const trash = state.historyTrash.find((entry) => entry.id === targetId);
    if (!trash) {
      return { ok: false, message: "未找到这条回收站记录。" };
    }

    const recordCount = decorateHistoryTrashEntry(trash)?.recordCount || 0;
    state.historyTrash = state.historyTrash.filter((entry) => entry.id !== trash.id);
    addEvent("history-trash-delete", `永久删除回收站记录：${trash.title}`);
    saveState();
    return {
      ok: true,
      deletedId: trash.id,
      recordCount,
      message: `已永久删除回收站记录：${trash.title}。`
    };
  }

  function downloadArchive() {
    const archive = {
      exportedAt: new Date().toISOString(),
      version: VERSION,
      state: clone(state),
      history: getHistory({ limit: 50 })
    };
    downloadJson(archive, `mr-calligraphy-archive-${Date.now()}.json`);
    return { ok: true, message: "已导出完整学习档案。" };
  }

  window.MRAppState = {
    storageKey: STORAGE_KEY,
    modes: clone(MODE_CONFIG),
    tasks: clone(TASK_LIBRARY),
    copybooks: [...COPYBOOKS],
    strokes: [...STROKES],
    getState: () => clone(state),
    getStats,
    getModeConfig,
    getTaskLibrary,
    getTaskProgress,
    getStageProgress,
    getLectureProgress,
    getPlan,
    getPlanHistory,
    getLatestPlan,
    getReportPreview,
    getReportDetail,
    getReportComparison,
    getReportComparisonExport,
    getReportSeries,
    getArtworkSharePackage,
    getLatestReview,
    getHistory,
    getHistoryDetail,
    getArtworkGallery,
    getArtworkComparison,
    getHistoryTrash,
    renameHistoryRecord,
    updateArtworkTags,
    deleteHistoryRecord,
    deleteHistoryRecords,
    restoreHistoryTrash,
    clearHistoryTrash,
    deleteHistoryTrashEntry,
    downloadHistoryRecords,
    setMode,
    selectDailyGlyph,
    rotateCopybook,
    selectTask,
    recordLearningStage,
    startLecture,
    advanceLecture,
    playLecture,
    startPractice,
    setTrainingMode,
    moveStroke,
    setArtworkStyle,
    recordPracticeResult,
    saveArtwork,
    filterExcellentRecords,
    createPlan,
    togglePlanItem,
    updatePlanItem,
    addPlanItem,
    snoozePlanItem,
    completePlanItemReview,
    movePlanItem,
    deletePlanItem,
    createReport,
    downloadReport,
    downloadReportComparison,
    downloadArtworkSharePage,
    downloadArchive
  };
})();

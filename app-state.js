(function () {
  const STORAGE_KEY = "mr-calligraphy-learning-state-v1";
  const VERSION = 1;
  const MAX_EVENTS = 120;

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
      strokePlan: ["定点位", "练呼应", "保存作品", "报告复盘"]
    }
  ];

  const COPYBOOKS = Array.from(new Set(TASK_LIBRARY.map((task) => task.copybook)));
  const STROKES = ["点", "横", "竖", "撇", "捺", "钩", "提", "折"];
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
      feedback,
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
      ? record.items.map(normalizePlanItem).filter(Boolean).slice(0, 8)
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
        completedAt: null
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
      completedAt: item.completedAt ? String(item.completedAt) : null
    };
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

  function getTaskLibrary(mode = state.activeMode) {
    const tasks = getTasksForMode(mode);
    const currentTask = getCurrentTask();
    return {
      activeMode: MODE_CONFIG[mode] ? mode : state.activeMode,
      currentTask: currentTask ? clone({
        ...currentTask,
        progress: getTaskProgress(currentTask.id)
      }) : null,
      tasks: clone(tasks.map((task) => ({
        ...task,
        active: task.id === currentTask?.id,
        progress: getTaskProgress(task.id)
      })))
    };
  }

  function getTaskProgress(taskId = getCurrentTask()?.id) {
    const task = getTaskById(String(taskId || ""));
    if (!task) {
      return {
        taskId: null,
        status: "unknown",
        statusLabel: "未知任务",
        percent: 0,
        sessionCount: 0,
        savedSessionCount: 0,
        artworkCount: 0,
        reportCount: 0,
        averageScore: 0,
        latestAt: null
      };
    }

    const sessions = state.sessions.filter((session) => getSessionTaskId(session) === task.id);
    const savedSessions = sessions.filter((session) => session.status === "saved" || session.endedAt);
    const activeSessions = sessions.filter((session) => session.status === "active" && !session.endedAt);
    const artworks = state.artworks.filter((artwork) => getArtworkTaskId(artwork) === task.id);
    const reports = state.reports.filter((report) => getReportTaskId(report) === task.id);
    const scores = [
      ...savedSessions.map((session) => session.score),
      ...artworks.map((artwork) => artwork.score)
    ].filter((score) => Number.isFinite(score) && score > 0);
    const latestAt = [
      ...sessions.map((session) => session.endedAt || session.snapshotAt || session.startedAt),
      ...artworks.map((artwork) => artwork.createdAt),
      ...reports.map((report) => report.createdAt)
    ]
      .filter(Boolean)
      .filter((date) => Number.isFinite(Date.parse(date)))
      .sort((a, b) => Date.parse(b) - Date.parse(a))[0] || null;

    const milestones = [
      { id: "practice", label: "完成练习", done: sessions.length > 0 },
      { id: "artwork", label: "保存作品", done: savedSessions.length > 0 || artworks.length > 0 },
      { id: "report", label: "导出报告", done: reports.length > 0 }
    ];
    const doneCount = milestones.filter((item) => item.done).length;
    const status = reports.length > 0
      ? "reported"
      : artworks.length > 0 || savedSessions.length > 0
        ? "artwork"
        : activeSessions.length > 0
          ? "active"
          : sessions.length > 0
            ? "practiced"
            : "todo";

    return {
      taskId: task.id,
      status,
      statusLabel: getTaskProgressLabel(status),
      percent: Math.round((doneCount / milestones.length) * 100),
      milestones: clone(milestones),
      sessionCount: sessions.length,
      savedSessionCount: savedSessions.length,
      activeSessionCount: activeSessions.length,
      artworkCount: artworks.length,
      reportCount: reports.length,
      averageScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
      latestAt
    };
  }

  function getTaskProgressLabel(status) {
    const labels = {
      reported: "已报告",
      artwork: "已保存",
      active: "练习中",
      practiced: "已练习",
      todo: "待开始",
      unknown: "未知任务"
    };
    return labels[status] || labels.unknown;
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
    if (!plan) return null;
    return {
      ...clone(plan),
      progress: getPlanProgress(plan)
    };
  }

  function getStats() {
    const sessions = state.sessions;
    const currentTask = getCurrentTask();
    const savedSessions = sessions.filter((session) => session.status === "saved" || session.endedAt);
    const scores = savedSessions.length ? savedSessions.map((session) => session.score) : sessions.map((session) => session.score);
    const averageScore = scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 86;
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
      sessionCount: sessions.length,
      savedSessionCount: savedSessions.length,
      artworkCount: state.artworks.length,
      reportCount: state.reports.length,
      planCount: state.plans.length,
      averageScore,
      learningMinutes,
      latestSession,
      latestArtwork,
      latestReport,
      latestPlan,
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
    const task = tasks[(currentIndex + 1 + tasks.length) % tasks.length] || currentTask;
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
    const orderedTasks = [
      ...tasks.slice(Math.max(0, currentIndex + 1)),
      ...tasks.slice(0, Math.max(0, currentIndex + 1))
    ];
    const task = orderedTasks.find((item) => item.copybook !== state.selectedCopybook)
      || tasks[(currentIndex + 1 + tasks.length) % tasks.length]
      || currentTask;
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
      feedback: session.feedback || practice?.feedback || [],
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
        makePlanItem("plan-practice", `完成 1 次${state.selectedGlyph}字临摹`, `使用${state.trainingMode === "compare" ? "对比" : "示范"}模式书写，并保留真实笔迹。`),
        makePlanItem("plan-task-focus", `复盘${currentTask.focus}`, `按照任务步骤完成：${currentTask.strokePlan.join("、")}。`),
        makePlanItem("plan-weakness", `专项补强${weakness.label}`, weakness.advice),
        makePlanItem("plan-artwork", hasArtwork ? "复盘最近作品" : "保存 1 幅作品", hasArtwork ? "回放最近作品笔迹，记录一条最需要调整的结构或笔法问题。" : "完成书写后保存作品，让复盘区生成截图和评分。"),
        makePlanItem("plan-report", hasReport ? "对比最近学习报告" : "导出 1 份 HTML 学习报告", hasReport ? "查看最近报告中的能力结构，把最低维度作为下一次练习目标。" : "导出报告，把练习次数、作品数量和能力结构沉淀为文件。")
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

  function makePlanItem(id, title, detail) {
    return {
      id,
      title,
      detail,
      done: false,
      completedAt: null
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
    const progress = getPlanProgress(plan);
    plan.completedAt = progress.total > 0 && progress.done === progress.total
      ? new Date().toISOString()
      : null;
    addEvent("plan-item", `${item.done ? "完成" : "取消"}计划项：${item.title}`);
    saveState();
    return {
      ok: true,
      plan: getLatestPlan(),
      message: item.done ? `已完成计划项：${item.title}。` : `已取消完成：${item.title}。`
    };
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
      message: `HTML 学习报告已生成并下载：含能力雷达和打印样式，${stats.sessionCount} 次练习、${stats.artworkCount} 幅作品。`
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
    main { width: min(960px, calc(100% - 32px)); margin: 0 auto; padding: 34px 0 46px; }
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

    <footer>报告数据来自本机浏览器存储：${escapeHtml(STORAGE_KEY)}。如需迁移项目，请在主后台导出项目档案。</footer>
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
    return `本机记录：${stats.sessionCount} 次练习 / ${stats.artworkCount} 幅作品 / 平均 ${stats.averageScore} 分`;
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

  function downloadReport(reportId = null) {
    const report = reportId
      ? state.reports.find((item) => item.id === reportId)
      : state.reports[state.reports.length - 1];
    if (!report) {
      return { ok: false, message: "还没有可下载的报告。" };
    }
    downloadHtml(createReportHtml(report), `mr-calligraphy-report-${report.id}.html`);
    return { ok: true, message: "已下载最近的 HTML 学习报告，含能力雷达和打印样式。" };
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
      }))
    };
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
        style: artwork.style,
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

  function deleteHistoryRecord(id) {
    const recordId = String(id || "");
    if (!recordId) {
      return { ok: false, message: "请选择一条记录。" };
    }

    const sessionIndex = state.sessions.findIndex((item) => item.id === recordId);
    if (sessionIndex >= 0) {
      const [session] = state.sessions.splice(sessionIndex, 1);
      if (state.currentSessionId === recordId) {
        state.currentSessionId = null;
      }
      state.artworks.forEach((artwork) => {
        if (artwork.sessionId === recordId) {
          artwork.sessionId = null;
        }
      });
      state.reports.forEach((report) => {
        if (report.latestSessionId === recordId) {
          report.latestSessionId = null;
        }
      });
      addEvent("history-delete", `删除练习：${session.title || session.glyph}`);
      saveState();
      return { ok: true, deletedType: "practice", message: "已删除所选练习记录，并解除相关作品引用。" };
    }

    const artworkIndex = state.artworks.findIndex((item) => item.id === recordId);
    if (artworkIndex >= 0) {
      const [artwork] = state.artworks.splice(artworkIndex, 1);
      state.reports.forEach((report) => {
        if (report.latestArtworkId === recordId) {
          report.latestArtworkId = null;
        }
      });
      addEvent("history-delete", `删除作品：${artwork.title}`);
      saveState();
      return { ok: true, deletedType: "artwork", message: `已删除作品记录：${artwork.title}。` };
    }

    const reportIndex = state.reports.findIndex((item) => item.id === recordId);
    if (reportIndex >= 0) {
      const [report] = state.reports.splice(reportIndex, 1);
      addEvent("history-delete", `删除报告：${report.title || "学习报告"}`);
      saveState();
      return { ok: true, deletedType: "report", message: `已删除报告记录：${report.title || "学习报告"}。` };
    }

    return { ok: false, message: "未找到要删除的记录。" };
  }

  function normalizeHistoryIds(ids) {
    return [...new Set((Array.isArray(ids) ? ids : [ids])
      .map((id) => String(id || "").trim())
      .filter(Boolean))];
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

    const selected = new Set(selectedIds);
    const deleted = {
      practice: state.sessions.filter((session) => selected.has(session.id)),
      artwork: state.artworks.filter((artwork) => selected.has(artwork.id)),
      report: state.reports.filter((report) => selected.has(report.id))
    };
    const deletedCount = deleted.practice.length + deleted.artwork.length + deleted.report.length;

    if (!deletedCount) {
      return { ok: false, message: "未找到要删除的学习档案记录。" };
    }

    const deletedSessionIds = new Set(deleted.practice.map((session) => session.id));
    const deletedArtworkIds = new Set(deleted.artwork.map((artwork) => artwork.id));
    state.sessions = state.sessions.filter((session) => !selected.has(session.id));
    state.artworks = state.artworks.filter((artwork) => !selected.has(artwork.id));
    state.reports = state.reports.filter((report) => !selected.has(report.id));

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

    addEvent("history-batch-delete", `批量删除学习档案：${deletedCount} 条`);
    saveState();
    return {
      ok: true,
      deletedCount,
      deleted: {
        practice: deleted.practice.length,
        artwork: deleted.artwork.length,
        report: deleted.report.length
      },
      message: `已删除 ${deletedCount} 条学习档案记录。`
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
    getLectureProgress,
    getLatestPlan,
    getReportPreview,
    getLatestReview,
    getHistory,
    getHistoryDetail,
    renameHistoryRecord,
    deleteHistoryRecord,
    deleteHistoryRecords,
    downloadHistoryRecords,
    setMode,
    selectDailyGlyph,
    rotateCopybook,
    selectTask,
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
    createReport,
    downloadReport,
    downloadArchive
  };
})();

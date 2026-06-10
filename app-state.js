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

  const COPYBOOKS = ["永字八法", "欧体楷书", "颜体楷书", "赵体行书"];
  const STROKES = ["点", "横", "竖", "撇", "捺", "钩", "提", "折"];

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
    return {
      version: VERSION,
      activeMode,
      selectedGlyph: String(source?.selectedGlyph || modeConfig.glyph),
      selectedCopybook: String(source?.selectedCopybook || modeConfig.copybook),
      activeStrokeIndex: normalizeInteger(source?.activeStrokeIndex, 0, 0, STROKES.length - 1),
      trainingMode: ["guide", "compare"].includes(source?.trainingMode) ? source.trainingMode : "guide",
      lectureStatus: ["idle", "playing", "complete"].includes(source?.lectureStatus) ? source.lectureStatus : "idle",
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
    return {
      id: String(record.id || makeId("artwork")),
      sessionId: record.sessionId ? String(record.sessionId) : null,
      title: String(record.title || "书法练习作品"),
      glyph: String(record.glyph || "永"),
      mode: MODE_CONFIG[record.mode] ? record.mode : "single",
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
    return {
      id: String(record.id || makeId("plan")),
      createdAt: String(record.createdAt || new Date().toISOString()),
      title: String(record.title || "下一阶段练习计划"),
      items: Array.isArray(record.items) ? record.items.map(String).filter(Boolean) : []
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

  function getCurrentSession() {
    return state.sessions.find((session) => session.id === state.currentSessionId) || null;
  }

  function getStats() {
    const sessions = state.sessions;
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
    const latestFeedback = latestSession?.feedback?.length
      ? latestSession.feedback
      : latestArtwork?.feedback?.length
        ? latestArtwork.feedback
        : [];
    return {
      activeMode: state.activeMode,
      modeLabel: getModeConfig().label,
      glyph: state.selectedGlyph,
      copybook: state.selectedCopybook,
      activeStroke: STROKES[state.activeStrokeIndex],
      trainingMode: state.trainingMode,
      lectureStatus: state.lectureStatus,
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
    state.activeMode = mode;
    state.selectedGlyph = config.glyph;
    state.selectedCopybook = config.copybook;
    state.currentSessionId = null;
    state.lectureStatus = "idle";
    state.activeStrokeIndex = 0;
    addEvent("mode", `切换到${config.label}`);
    saveState();
    return {
      ok: true,
      message: `已切换到${config.label}，当前任务为“${config.taskTitle}”。`
    };
  }

  function selectDailyGlyph() {
    const config = getModeConfig();
    state.selectedGlyph = config.glyph;
    state.selectedCopybook = config.copybook;
    addEvent("task", config.taskTitle);
    saveState();
    return {
      ok: true,
      message: `已确认${config.taskTitle}，碑帖为“${config.copybook}”。`
    };
  }

  function rotateCopybook() {
    const index = COPYBOOKS.indexOf(state.selectedCopybook);
    state.selectedCopybook = COPYBOOKS[(index + 1 + COPYBOOKS.length) % COPYBOOKS.length];
    addEvent("copybook", `切换碑帖：${state.selectedCopybook}`);
    saveState();
    return {
      ok: true,
      message: `已切换到“${state.selectedCopybook}”，后续练习会记录到当前任务。`
    };
  }

  function playLecture() {
    state.lectureStatus = "complete";
    addEvent("lecture", `完成${state.selectedGlyph}字讲解`);
    saveState();
    return {
      ok: true,
      message: `讲解已记录为完成：${state.selectedGlyph}字，碑帖“${state.selectedCopybook}”。`
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
      taskId: `${state.activeMode}-${state.selectedGlyph}`,
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
      title: `${session.glyph}字${state.artworkStyle}练习`,
      glyph: session.glyph,
      mode: session.mode,
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
    const plan = {
      id: makeId("plan"),
      createdAt: new Date().toISOString(),
      title: "下一阶段练习计划",
      items: ["每天完成 1 次单字临摹", "复盘最低分维度", "保存 3 幅可对比作品"]
    };
    state.plans.push(plan);
    addEvent("plan", plan.title);
    saveState();
    return {
      ok: true,
      plan: clone(plan),
      message: "已生成并保存下一阶段练习计划。"
    };
  }

  function createReport() {
    const stats = getStats();
    const reportTrend = getReportTrend();
    const report = {
      id: makeId("report"),
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
      message: `HTML 学习报告已生成并下载：${stats.sessionCount} 次练习、${stats.artworkCount} 幅作品。`
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
    @media (max-width: 720px) { main { width: min(100% - 20px, 960px); padding-top: 20px; } .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .trend { grid-template-columns: repeat(4, minmax(0, 1fr)); height: 260px; } }
  </style>
</head>
<body>
  <main>
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
      <ul class="metrics">
        ${metricLabels.map(([key, label]) => {
          const value = normalizeScore(metrics[key], 0);
          return `<li><span>${label}</span><span class="track"><span class="fill" style="width:${value}%"></span></span><strong>${value}</strong></li>`;
        }).join("")}
      </ul>
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
    const session = artwork?.sessionId
      ? state.sessions.find((item) => item.id === artwork.sessionId) || null
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
    return { ok: true, message: "已下载最近的 HTML 学习报告。" };
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
      title: `${session.glyph}字${session.trainingMode === "compare" ? "对比" : "示范"}练习`,
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
      title: "学习报告",
      shortLabel: "报告",
      createdAt: report.createdAt,
      score: report.averageScore,
      meta: `${report.sessionCount} 次练习 / ${report.artworkCount} 幅作品`,
      status: "可下载",
      reportId: report.id
    };
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
    strokes: [...STROKES],
    getState: () => clone(state),
    getStats,
    getModeConfig,
    getReportPreview,
    getLatestReview,
    getHistory,
    setMode,
    selectDailyGlyph,
    rotateCopybook,
    playLecture,
    startPractice,
    setTrainingMode,
    moveStroke,
    setArtworkStyle,
    recordPracticeResult,
    saveArtwork,
    filterExcellentRecords,
    createPlan,
    createReport,
    downloadReport,
    downloadArchive
  };
})();

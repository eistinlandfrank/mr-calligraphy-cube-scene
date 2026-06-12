(function () {
  const STORAGE_KEY = "mr-calligraphy-learning-state-v1";
  const VERSION = 1;
  const MAX_EVENTS = 120;
  const MAX_HISTORY_TRASH = 12;
  const MAX_HISTORY_BATCH_RECEIPTS = 20;
  const MAX_ARTWORK_TAGS = 8;
  const MAX_ARTWORK_REPOSITORY_CONFLICTS = 12;
  const MAX_SHARE_RECORDS = 24;
  const MAX_VIDEO_EXPORT_RECORDS = 18;
  const MAX_VIDEO_EXPORT_JOBS = 24;
  const MAX_PLAN_ITEMS = 12;
  const DEFAULT_PLAN_CYCLE_DAYS = 7;
  const MAX_STAGE_RECORDS = 80;
  const LEARNING_PATH_BOUNDARY = "学习路径服务由当前浏览器中的 LearningTask、PracticeSession、ArtworkRecord、ReportRecord 和 PlanRecord 推导；它不是云端课程编排、教师下发任务或跨设备学习进度。";
  const SCORE_SERVICE_BOUNDARY = "基础评分服务使用当前浏览器的本机启发式算法和真实笔迹采样；它不是专业书法评级、云端识别模型、教师人工评分或硬件压感校准结果。";
  const DEFAULT_SCORE_ALGORITHM_VERSION = "local-heuristic-v2.2.0";
  const LECTURE_SERVICE_BOUNDARY = "本机讲解服务使用当前浏览器的 Web Speech 或文本计时推进；它不是云端 AI 音频、真人录音、视频流或按实时笔迹生成的动态讲解。";
  const SHARE_SERVICE_BOUNDARY = "本机分享链接只在当前浏览器和本机存储内可访问；它不是公网 URL、微信分享、班级作品墙或跨设备发布。";
  const SHARE_REPOSITORY_KIND = "mr-calligraphy-share-repository-v1";
  const SHARE_REPOSITORY_DEFAULT_WORKSPACE = "local-browser";
  const SHARE_REPOSITORY_BOUNDARY = "作品分享远端 API adapter 会把当前分享包真实发送到用户配置的 endpoint，并携带 Workspace 空间 ID 保存 publicUrl 与回执；它仍不是内置账号系统、微信发布、班级作品墙或生产 CDN。";
  const SHARE_REPOSITORY_RECEIPT_KIND = "mr-calligraphy-share-repository-receipt-v1";
  const SHARE_REPOSITORY_MAX_RECEIPTS = 12;
  const SHARE_REPOSITORY_MAX_FAILURES = 12;
  const SHARE_REPOSITORY_REQUEST_TIMEOUT_MS = 8000;
  const SHARE_REPOSITORY_RETRY_BASE_MS = 15000;
  const ARTWORK_REPOSITORY_KIND = "mr-calligraphy-artwork-repository-v1";
  const ARTWORK_REPOSITORY_DEFAULT_WORKSPACE = "local-browser";
  const ARTWORK_REPOSITORY_BOUNDARY = "作品仓库导出当前浏览器中的 ArtworkRecord、关联练习摘要和评分证据，便于本机备份、迁移或课堂收集后手动导入；它不是账号化公开作品集、课堂作品墙或云端存储。";
  const ARTWORK_REPOSITORY_DIGEST_ALGORITHM = "sha256-stable-json";
  const ARTWORK_COLLECTION_KIND = "mr-calligraphy-artwork-collection-v1";
  const ARTWORK_COLLECTION_BOUNDARY = "作品集 HTML 导出会把当前浏览器里的多幅 ArtworkRecord 渲染成可离线打开、打印或手动分享的静态作品集；它不是云端公开链接、课堂作品墙、账号权限或生产 CDN。";
  const ARTWORK_CLASSROOM_REVIEW_KIND = "mr-calligraphy-classroom-review-v1";
  const ARTWORK_CLASSROOM_REVIEW_NOTES_KIND = "mr-calligraphy-classroom-review-notes-v1";
  const ARTWORK_CLASSROOM_REVIEW_SUMMARY_KIND = "mr-calligraphy-classroom-review-summary-v1";
  const ARTWORK_CLASSROOM_REVIEW_NOTES_DIGEST_ALGORITHM = "sha256-stable-json";
  const ARTWORK_CLASSROOM_REVIEW_BOUNDARY = "课堂评阅表导出会把当前浏览器里的作品生成可离线打开、填写、打印和导出评阅 JSON 的 HTML；它不是账号化教师端、课堂作品墙、云端批改或生产权限系统。";
  const ARTWORK_CLASSROOM_REVIEW_SUMMARY_BOUNDARY = "课堂评阅汇总导出会把已导回当前浏览器的作品评阅记录生成可离线打开和打印的 HTML；它不是账号化教师端、班级成绩册、云端批改或服务端不可篡改审计。";
  const VIDEO_EXPORT_BOUNDARY = "书写回放视频由当前浏览器用真实笔迹和 Canvas 录制生成 WebM，并保存本机封面与导出记录；它不是 MP4/GIF 转码、云端压缩队列或公网分享链路。";
  const VIDEO_EXPORT_AUDIT_KIND = "mr-calligraphy-video-export-audit-v1";
  const VIDEO_EXPORT_AUDIT_BOUNDARY = "视频导出回执审计由当前浏览器的 videoExportService.records 和 jobs 生成，记录 WebM/PNG 产物、队列状态、失败原因和重试来源；它不是云端转码日志、生产签名回执或页面关闭后的后台队列审计。";
  const PLAN_REMINDER_BOUNDARY = "本机提醒只在当前浏览器和页面可用，不是云端推送、跨设备提醒或教师端通知。";
  const PLAN_REPOSITORY_KIND = "mr-calligraphy-plan-repository-v1";
  const PLAN_REPOSITORY_DEFAULT_WORKSPACE = "local-browser";
  const PLAN_REPOSITORY_BOUNDARY = "未配置远端时同步仓库是本机 JSON 同步包；配置远端 API 后会通过 fetch 同步计划包，并携带 Workspace 空间 ID 做服务端隔离第一版，但仍不包含完整账号权限、教师端排课或后台推送。";
  const PLAN_REPOSITORY_RECEIPT_KIND = "mr-calligraphy-plan-repository-receipt-v1";
  const PLAN_REPOSITORY_MAX_RECEIPTS = 12;
  const PLAN_REPOSITORY_MAX_FAILURES = 8;
  const PLAN_REPOSITORY_REQUEST_TIMEOUT_MS = 8000;
  const PLAN_REPOSITORY_RETRY_BASE_MS = 15000;
  const HISTORY_REPOSITORY_KIND = "mr-calligraphy-history-repository-v1";
  const HISTORY_REPOSITORY_DEFAULT_WORKSPACE = "local-browser";
  const HISTORY_REPOSITORY_BOUNDARY = "学习档案仓库同步练习、作品、报告和阶段记录；配置远端 API 后会通过 fetch 同步档案包、携带 Workspace 空间 ID 并按 nextPageUrl 追取分页，但仍不包含完整账号权限、教师批注审计或公开作品墙。";
  const HISTORY_REPOSITORY_RECEIPT_KIND = "mr-calligraphy-history-repository-receipt-v1";
  const HISTORY_REPOSITORY_MAX_RECEIPTS = 12;
  const HISTORY_REPOSITORY_MAX_PULL_PAGES = 20;
  const HISTORY_REPOSITORY_MAX_CONFLICTS = 12;
  const HISTORY_REPOSITORY_MAX_FAILURES = 12;
  const HISTORY_REPOSITORY_REQUEST_TIMEOUT_MS = 8000;
  const HISTORY_REPOSITORY_RETRY_BASE_MS = 15000;
  const REPORT_REPOSITORY_KIND = "mr-calligraphy-report-repository-v1";
  const REPORT_REPOSITORY_DEFAULT_WORKSPACE = "local-browser";
  const REPORT_REPOSITORY_BOUNDARY = "报告仓库同步本机 ReportRecord 和本机验真摘要；配置远端 API 后会通过 fetch 保存和拉取报告包，携带 Workspace 空间 ID 做服务端隔离第一版，并可保存远端签名回执；当前仍不包含账号化教师端、生产证书签章、不可篡改审计或云端 PDF 渲染。";
  const REPORT_REPOSITORY_RECEIPT_KIND = "mr-calligraphy-report-repository-receipt-v1";
  const REPORT_REPOSITORY_MAX_RECEIPTS = 12;
  const REPORT_REPOSITORY_MAX_CONFLICTS = 12;
  const REPORT_REPOSITORY_MAX_FAILURES = 12;
  const REPORT_REPOSITORY_REQUEST_TIMEOUT_MS = 8000;
  const REPORT_REPOSITORY_RETRY_BASE_MS = 15000;
  const REPORT_TEACHER_REVIEW_AUDIT_KIND = "mr-calligraphy-report-teacher-review-audit-v1";
  const REPORT_TEACHER_REVIEW_SIGNATURE_KIND = "mr-calligraphy-report-teacher-review-local-signature-v1";
  const REPORT_TEACHER_REVIEW_SIGNATURE_ALGORITHM = "sha256-stable-json";
  const REPORT_TEACHER_REVIEW_SIGNED_FIELDS = ["reportId", "reportCreatedAt", "reviewer", "role", "note", "reviewedAt", "source", "reviewDigest"];
  const REPORT_TEACHER_REVIEW_MAX_AUDITS = 30;
  const REPORT_TEACHER_REVIEW_AUDIT_BOUNDARY = "教师批注审计保存在当前浏览器 localStorage 中，记录本机保存/清除动作、角色、批注摘要、本机签名摘要和时间；它不是云端教师账号、生产电子签章或不可篡改审计链。";
  const REPORT_REPOSITORY_CONFLICT_FIELDS = ["title", "summary", "averageScore", "sessionCount", "artworkCount", "teacherReview", "recommendations", "createdAt"];
  const REPORT_REPOSITORY_CONFLICT_LABELS = {
    title: "标题",
    summary: "摘要",
    averageScore: "平均分",
    sessionCount: "练习次数",
    artworkCount: "作品数量",
    teacherReview: "教师批注",
    recommendations: "练习建议",
    createdAt: "生成时间"
  };
  const REPORT_VERIFICATION_KIND = "mr-calligraphy-report-verification-v1";
  const REPORT_VERIFICATION_ALGORITHM = "sha256-stable-json";
  const REPORT_VERIFICATION_BOUNDARY = "本机报告验真摘要由当前浏览器用报告核心字段、关联练习和最近作品截图摘要计算 SHA-256；它不是服务端证书、教师签名或不可篡改审计。";
  const REPORT_PDF_MAX_EMBEDDED_IMAGE_BYTES = 1800000;
  const HISTORY_REPOSITORY_CONFLICT_FIELDS = {
    session: ["title", "glyph", "copybook", "score", "feedback", "metrics", "endedAt", "status"],
    artwork: ["title", "glyph", "style", "score", "feedback", "tags", "createdAt"],
    report: ["title", "averageScore", "summary", "teacherReview", "createdAt"],
    stage: ["label", "glyph", "copybook", "targetStep", "note", "completedAt"]
  };
  const HISTORY_REPOSITORY_CONFLICT_LABELS = {
    session: "练习",
    artwork: "作品",
    report: "报告",
    stage: "阶段",
    title: "标题",
    label: "阶段",
    glyph: "字",
    copybook: "碑帖",
    targetStep: "目标步骤",
    note: "说明",
    completedAt: "完成时间",
    score: "评分",
    feedback: "反馈",
    metrics: "能力指标",
    endedAt: "完成时间",
    status: "状态",
    style: "风格",
    tags: "标签",
    createdAt: "创建时间",
    averageScore: "平均分",
    summary: "摘要",
    teacherReview: "教师批注",
    generatedAt: "生成时间"
  };
  const PLAN_REPOSITORY_MERGE_PLAN_FIELDS = ["title", "summary"];
  const PLAN_REPOSITORY_MERGE_ITEM_FIELDS = ["title", "detail", "dueAt", "remindAt", "reviewAction"];
  const PLAN_REPOSITORY_MERGE_LABELS = {
    title: "标题",
    summary: "摘要",
    detail: "说明",
    dueAt: "到期",
    remindAt: "提醒",
    reviewAction: "复盘动作"
  };
  const PLAN_CALENDAR_BOUNDARY = "学习计划日历导出会生成标准 .ics 文件，便于导入系统日历或手机日历；它不是云端推送提醒，导入后的提醒由用户自己的日历应用负责。";

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
  let planRepositoryAutoSyncTimer = null;

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
    const sessions = Array.isArray(source?.sessions) ? source.sessions.map(normalizeSession).filter(Boolean) : [];
    const artworks = Array.isArray(source?.artworks) ? source.artworks.map(normalizeArtwork).filter(Boolean) : [];
    const reports = Array.isArray(source?.reports) ? source.reports.map(normalizeReport).filter(Boolean) : [];
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
      lectureService: normalizeLectureService(source?.lectureService),
      scoreService: normalizeScoreService(source?.scoreService, sessions),
      artworkStyle: String(source?.artworkStyle || "楷书"),
      currentSessionId: typeof source?.currentSessionId === "string" ? source.currentSessionId : null,
      sessions,
      artworks,
      reports,
      reportTeacherReviewAudits: normalizeReportTeacherReviewAudits(source?.reportTeacherReviewAudits),
      videoExportService: normalizeVideoExportService(source?.videoExportService),
      plans: Array.isArray(source?.plans) ? source.plans.map(normalizePlan).filter(Boolean) : [],
      shareService: normalizeShareService(source?.shareService),
      artworkRepository: normalizeArtworkRepository(source?.artworkRepository),
      planReminderService: normalizePlanReminderService(source?.planReminderService),
      planRepository: normalizePlanRepository(source?.planRepository),
      historyRepository: normalizeHistoryRepository(source?.historyRepository),
      reportRepository: normalizeReportRepository(source?.reportRepository),
      stageRecords: Array.isArray(source?.stageRecords) ? source.stageRecords.map(normalizeStageRecord).filter(Boolean).slice(-MAX_STAGE_RECORDS) : [],
      historyTrash: Array.isArray(source?.historyTrash) ? source.historyTrash.map(normalizeHistoryTrashEntry).filter(Boolean).slice(0, MAX_HISTORY_TRASH) : [],
      historyBatchReceipts: Array.isArray(source?.historyBatchReceipts) ? source.historyBatchReceipts.map(normalizeHistoryBatchReceipt).filter(Boolean).slice(0, MAX_HISTORY_BATCH_RECEIPTS) : [],
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
    const id = String(record.id || makeId("artwork"));
    const title = String(record.title || "书法练习作品");
    return {
      id,
      sessionId: record.sessionId ? String(record.sessionId) : null,
      taskId: getTaskById(record.taskId) ? String(record.taskId) : null,
      title,
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
      createdAt: String(record.createdAt || new Date().toISOString()),
      classroomReview: normalizeArtworkClassroomReview(record.classroomReview, {
        artworkId: id,
        artworkTitle: title,
        artworkCreatedAt: String(record.createdAt || "")
      })
    };
  }

  function normalizeArtworkClassroomReview(review, context = {}) {
    const source = review && typeof review === "object" ? review : {};
    const teacherScoreSource = source.teacherScore ?? source.score ?? source.teacher_score;
    const teacherScore = teacherScoreSource === "" || teacherScoreSource === null || typeof teacherScoreSource === "undefined"
      ? null
      : normalizeInteger(teacherScoreSource, -1, 0, 100);
    const normalizedScore = teacherScore === -1 ? null : teacherScore;
    const level = normalizeArtworkClassroomReviewLevel(source.level || source.reviewLevel || source.grade);
    const reviewer = String(source.reviewer || source.teacher || "").trim().slice(0, 80);
    const note = String(source.note || source.comment || source.feedback || "").trim().replace(/\s+/g, " ").slice(0, 800);
    if (normalizedScore === null && !level && !reviewer && !note) return null;
    const reviewedAt = normalizeIsoDate(source.reviewedAt || source.updatedAt || source.exportedAt || source.createdAt);
    const packageId = String(source.packageId || context.packageId || "").trim().slice(0, 160);
    const artworkId = String(context.artworkId || source.artworkId || "").trim().slice(0, 120);
    const artworkTitle = String(context.artworkTitle || source.title || source.artworkTitle || "").trim().slice(0, 160);
    const reviewSource = String(source.source || "classroom-review-notes-import").trim().slice(0, 80) || "classroom-review-notes-import";
    const core = {
      kind: ARTWORK_CLASSROOM_REVIEW_NOTES_KIND,
      artworkId,
      artworkTitle,
      teacherScore: normalizedScore,
      level: level || "",
      reviewer: reviewer || "本机课堂评阅",
      note,
      reviewedAt,
      packageId,
      source: reviewSource
    };
    const reviewDigest = String(source.reviewDigest || source.digest || "").match(/^[a-f0-9]{64}$/i)
      ? String(source.reviewDigest || source.digest).toLowerCase()
      : sha256StableJson(core);
    return {
      teacherScore: normalizedScore,
      level: level || "",
      reviewer: reviewer || "本机课堂评阅",
      note,
      reviewedAt,
      source: reviewSource,
      packageId,
      reviewDigest
    };
  }

  function normalizeArtworkClassroomReviewLevel(value) {
    const text = String(value || "").trim();
    if (!text || text === "未评定") return "";
    if (["展示", "达标", "需复练"].includes(text)) return text;
    return text.slice(0, 40);
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
      scoreEvidenceSummary: normalizeReportScoreEvidenceSummary(record.scoreEvidenceSummary),
      recommendations: Array.isArray(record.recommendations) ? record.recommendations.map(String) : [],
      teacherReview: normalizeReportTeacherReview(record.teacherReview, {
        reportId: String(record.id || ""),
        reportCreatedAt: String(record.createdAt || "")
      })
    };
  }

  function normalizeReportTeacherReview(review, context = {}) {
    const source = review && typeof review === "object" ? review : {};
    const note = String(source.note || source.comment || "").trim().replace(/\s+/g, " ").slice(0, 800);
    if (!note) return null;
    const reviewer = String(source.reviewer || source.teacher || "本机教师").trim().slice(0, 80) || "本机教师";
    const role = normalizeReportTeacherReviewRole(source.role || source.reviewerRole || source.teacherRole);
    const reviewedAt = normalizeIsoDate(source.reviewedAt || source.updatedAt || source.createdAt);
    const reviewSource = String(source.source || "local-teacher-review").trim().slice(0, 80) || "local-teacher-review";
    const reportId = String(context.reportId || source.reportId || "").trim().slice(0, 120);
    const reportCreatedAt = normalizeIsoDate(context.reportCreatedAt || source.reportCreatedAt || "");
    const core = {
      kind: "mr-calligraphy-report-teacher-review-core-v1",
      reviewer,
      role,
      note,
      reviewedAt,
      source: reviewSource
    };
    const reviewDigest = normalizeReportTeacherReviewDigest(source.reviewDigest) || sha256StableJson(core);
    const signaturePayload = {
      kind: REPORT_TEACHER_REVIEW_SIGNATURE_KIND,
      version: 1,
      algorithm: REPORT_TEACHER_REVIEW_SIGNATURE_ALGORITHM,
      signedFields: REPORT_TEACHER_REVIEW_SIGNED_FIELDS,
      reportId,
      reportCreatedAt,
      review: core,
      reviewDigest
    };
    const localSignatureDigest = normalizeReportTeacherReviewDigest(source.localSignatureDigest || source.signatureDigest || source.signature) || sha256StableJson(signaturePayload);
    return {
      reviewer,
      role,
      note,
      reviewedAt,
      source: reviewSource,
      reviewDigest,
      signatureKind: REPORT_TEACHER_REVIEW_SIGNATURE_KIND,
      signatureAlgorithm: REPORT_TEACHER_REVIEW_SIGNATURE_ALGORITHM,
      signedFields: [...REPORT_TEACHER_REVIEW_SIGNED_FIELDS],
      localSignatureDigest
    };
  }

  function normalizeReportTeacherReviewAudits(records) {
    const source = Array.isArray(records) ? records : [];
    const seen = new Set();
    return source
      .map(normalizeReportTeacherReviewAudit)
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0))
      .filter((record) => {
        if (seen.has(record.id)) return false;
        seen.add(record.id);
        return true;
      })
      .slice(0, REPORT_TEACHER_REVIEW_MAX_AUDITS);
  }

  function normalizeReportTeacherReviewAudit(record) {
    if (!record || typeof record !== "object") return null;
    const reportId = String(record.reportId || "").trim();
    const action = ["save", "clear"].includes(record.action) ? record.action : "";
    const createdAt = normalizePlanDate(record.createdAt || record.reviewedAt);
    if (!reportId || !action || !createdAt) return null;
    const previousDigest = normalizeReportTeacherReviewDigest(record.previousDigest);
    const nextDigest = normalizeReportTeacherReviewDigest(record.nextDigest);
    const previousReviewDigest = normalizeReportTeacherReviewDigest(record.previousReviewDigest);
    const nextReviewDigest = normalizeReportTeacherReviewDigest(record.nextReviewDigest);
    const previousSignatureDigest = normalizeReportTeacherReviewDigest(record.previousSignatureDigest || record.previousLocalSignatureDigest || previousDigest);
    const nextSignatureDigest = normalizeReportTeacherReviewDigest(record.nextSignatureDigest || record.nextLocalSignatureDigest || nextDigest);
    const signedFields = Array.isArray(record.signedFields)
      ? record.signedFields.map((field) => String(field || "").trim()).filter(Boolean).slice(0, 16)
      : [...REPORT_TEACHER_REVIEW_SIGNED_FIELDS];
    const id = String(record.id || `teacher-review-audit-${sha256StableJson({
      reportId,
      action,
      createdAt,
      previousDigest,
      nextDigest
    }).slice(0, 18)}`).trim();
    return {
      kind: REPORT_TEACHER_REVIEW_AUDIT_KIND,
      id: id.slice(0, 120),
      reportId,
      reportTitle: String(record.reportTitle || reportId).trim().slice(0, 140) || reportId,
      action,
      reviewer: String(record.reviewer || "本机教师").trim().slice(0, 80) || "本机教师",
      role: normalizeReportTeacherReviewRole(record.role || record.reviewerRole || record.teacherRole),
      source: String(record.source || "local-teacher-review").trim().slice(0, 80) || "local-teacher-review",
      previousDigest,
      nextDigest,
      previousReviewDigest,
      nextReviewDigest,
      previousSignatureDigest,
      nextSignatureDigest,
      signatureKind: String(record.signatureKind || REPORT_TEACHER_REVIEW_SIGNATURE_KIND).trim().slice(0, 100) || REPORT_TEACHER_REVIEW_SIGNATURE_KIND,
      signatureAlgorithm: String(record.signatureAlgorithm || REPORT_TEACHER_REVIEW_SIGNATURE_ALGORITHM).trim().slice(0, 60) || REPORT_TEACHER_REVIEW_SIGNATURE_ALGORITHM,
      signedFields,
      previousPreview: normalizeReportTeacherReviewPreview(record.previousPreview),
      nextPreview: normalizeReportTeacherReviewPreview(record.nextPreview),
      reviewedAt: normalizePlanDate(record.reviewedAt) || createdAt,
      createdAt,
      message: String(record.message || "").trim().slice(0, 220)
    };
  }

  function normalizeReportTeacherReviewRole(value) {
    const normalized = String(value || "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9_.:-]/g, "")
      .slice(0, 60);
    return normalized || "local-teacher";
  }

  function normalizeReportTeacherReviewDigest(value) {
    const digest = String(value || "").trim().toLowerCase();
    return /^[a-f0-9]{64}$/.test(digest) ? digest : "";
  }

  function normalizeReportTeacherReviewPreview(value) {
    return String(value || "").trim().replace(/\s+/g, " ").slice(0, 180);
  }

  function createReportTeacherReviewDigest(review, report = null) {
    const normalized = normalizeReportTeacherReview(review, {
      reportId: report?.id || "",
      reportCreatedAt: report?.createdAt || ""
    });
    return normalized ? normalized.localSignatureDigest || normalized.reviewDigest || sha256StableJson(normalized) : "";
  }

  function createReportTeacherReviewPreview(review) {
    const normalized = normalizeReportTeacherReview(review);
    return normalized ? normalizeReportTeacherReviewPreview(normalized.note) : "";
  }

  function createReportTeacherReviewAuditRecord(report, action, previousReview, nextReview) {
    const createdAt = new Date().toISOString();
    const reviewer = nextReview?.reviewer || previousReview?.reviewer || "本机教师";
    const role = nextReview?.role || previousReview?.role || "local-teacher";
    const previousNormalized = normalizeReportTeacherReview(previousReview, { reportId: report?.id || "", reportCreatedAt: report?.createdAt || "" });
    const nextNormalized = normalizeReportTeacherReview(nextReview, { reportId: report?.id || "", reportCreatedAt: report?.createdAt || "" });
    const previousDigest = createReportTeacherReviewDigest(previousReview, report);
    const nextDigest = createReportTeacherReviewDigest(nextReview, report);
    const reportId = String(report?.id || "").trim();
    const payload = {
      kind: REPORT_TEACHER_REVIEW_AUDIT_KIND,
      reportId,
      reportTitle: String(report?.title || reportId || "学习报告").slice(0, 140),
      action,
      reviewer,
      role,
      source: "local-teacher-review",
      previousDigest,
      nextDigest,
      previousReviewDigest: previousNormalized?.reviewDigest || "",
      nextReviewDigest: nextNormalized?.reviewDigest || "",
      previousSignatureDigest: previousNormalized?.localSignatureDigest || "",
      nextSignatureDigest: nextNormalized?.localSignatureDigest || "",
      signatureKind: REPORT_TEACHER_REVIEW_SIGNATURE_KIND,
      signatureAlgorithm: REPORT_TEACHER_REVIEW_SIGNATURE_ALGORITHM,
      signedFields: [...REPORT_TEACHER_REVIEW_SIGNED_FIELDS],
      previousPreview: createReportTeacherReviewPreview(previousReview),
      nextPreview: createReportTeacherReviewPreview(nextReview),
      reviewedAt: nextReview?.reviewedAt || previousReview?.reviewedAt || createdAt,
      createdAt
    };
    payload.id = `teacher-review-audit-${createdAt.replace(/[-:.TZ]/g, "").slice(0, 14)}-${sha256StableJson(payload).slice(0, 10)}`;
    payload.message = action === "clear"
      ? `${reviewer} 清除了报告“${payload.reportTitle}”的本机教师批注。`
      : `${reviewer} 保存了报告“${payload.reportTitle}”的本机教师批注。`;
    return normalizeReportTeacherReviewAudit(payload);
  }

  function appendReportTeacherReviewAudit(record) {
    const normalized = normalizeReportTeacherReviewAudit(record);
    if (!normalized) return null;
    const existing = normalizeReportTeacherReviewAudits(state.reportTeacherReviewAudits);
    state.reportTeacherReviewAudits = [normalized, ...existing.filter((item) => item.id !== normalized.id)]
      .slice(0, REPORT_TEACHER_REVIEW_MAX_AUDITS);
    return normalized;
  }

  function normalizeVideoExportService(record = {}) {
    const source = record && typeof record === "object" ? record : {};
    return {
      records: Array.isArray(source.records)
        ? source.records.map(normalizeVideoExportRecord).filter(Boolean).slice(0, MAX_VIDEO_EXPORT_RECORDS)
        : [],
      jobs: Array.isArray(source.jobs)
        ? source.jobs.map((job) => normalizeVideoExportJob(job, { recoverRunning: true })).filter(Boolean).slice(0, MAX_VIDEO_EXPORT_JOBS)
        : [],
      lastQueuedAt: normalizePlanDate(source.lastQueuedAt),
      lastStartedAt: normalizePlanDate(source.lastStartedAt),
      lastExportedAt: normalizePlanDate(source.lastExportedAt),
      lastError: source.lastError ? String(source.lastError).slice(0, 180) : ""
    };
  }

  function normalizeVideoExportRecord(record) {
    if (!record || typeof record !== "object") return null;
    const id = String(record.id || "").trim();
    const createdAt = normalizePlanDate(record.createdAt) || new Date().toISOString();
    if (!id) return null;
    const source = ["当前练习", "最近作品"].includes(record.source) ? record.source : "当前练习";
    const coverDataUrl = typeof record.coverDataUrl === "string" && record.coverDataUrl.startsWith("data:image/")
      ? record.coverDataUrl
      : "";
    return {
      id,
      source,
      sourceId: String(record.sourceId || "").trim().slice(0, 120),
      artworkId: String(record.artworkId || "").trim().slice(0, 120),
      sessionId: String(record.sessionId || "").trim().slice(0, 120),
      glyph: String(record.glyph || "永").trim().slice(0, 12) || "永",
      title: String(record.title || "书写回放视频").trim().slice(0, 140) || "书写回放视频",
      videoFilename: String(record.videoFilename || "").trim().slice(0, 180),
      coverFilename: String(record.coverFilename || "").trim().slice(0, 180),
      mimeType: String(record.mimeType || "video/webm").trim().slice(0, 80) || "video/webm",
      videoBytes: normalizeInteger(record.videoBytes, 0, 0, 999999999),
      coverBytes: normalizeInteger(record.coverBytes, estimateDataUrlBytes(coverDataUrl), 0, 999999999),
      durationMs: normalizeInteger(record.durationMs, 0, 0, 600000),
      strokeCount: normalizeInteger(record.strokeCount, 0, 0, 9999),
      pointCount: normalizeInteger(record.pointCount, 0, 0, 999999),
      coverDataUrl,
      createdAt,
      message: String(record.message || "").trim().slice(0, 220)
    };
  }

  function normalizeVideoExportJob(record, options = {}) {
    if (!record || typeof record !== "object") return null;
    const id = String(record.id || "").trim();
    if (!id) return null;
    const rawStatus = ["queued", "running", "succeeded", "failed"].includes(record.status)
      ? record.status
      : "queued";
    const interrupted = options.recoverRunning === true && rawStatus === "running" && !normalizePlanDate(record.finishedAt);
    const status = interrupted ? "failed" : rawStatus;
    const createdAt = normalizePlanDate(record.createdAt) || new Date().toISOString();
    const updatedAt = normalizePlanDate(record.updatedAt) || createdAt;
    const source = ["当前练习", "最近作品"].includes(record.source) ? record.source : "当前练习";
    return {
      id,
      status,
      source,
      sourceId: String(record.sourceId || "").trim().slice(0, 120),
      artworkId: String(record.artworkId || "").trim().slice(0, 120),
      sessionId: String(record.sessionId || "").trim().slice(0, 120),
      glyph: String(record.glyph || "永").trim().slice(0, 12) || "永",
      title: String(record.title || "书写回放视频").trim().slice(0, 140) || "书写回放视频",
      strokeCount: normalizeInteger(record.strokeCount, 0, 0, 9999),
      pointCount: normalizeInteger(record.pointCount, 0, 0, 999999),
      retryOf: String(record.retryOf || "").trim().slice(0, 120),
      retryCount: normalizeInteger(record.retryCount, 0, 0, 99),
      recordId: String(record.recordId || "").trim().slice(0, 120),
      videoFilename: String(record.videoFilename || "").trim().slice(0, 180),
      coverFilename: String(record.coverFilename || "").trim().slice(0, 180),
      error: interrupted
        ? "页面刷新或关闭中断了这次视频导出，请重试。"
        : String(record.error || "").trim().slice(0, 180),
      createdAt,
      queuedAt: normalizePlanDate(record.queuedAt) || createdAt,
      startedAt: normalizePlanDate(record.startedAt),
      finishedAt: normalizePlanDate(record.finishedAt),
      updatedAt
    };
  }

  function estimateDataUrlBytes(dataUrl) {
    const match = String(dataUrl || "").match(/^data:[^;,]+;base64,([\s\S]+)$/i);
    if (!match) return 0;
    const clean = match[1].replace(/\s+/g, "");
    if (!clean) return 0;
    const padding = clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0;
    return Math.max(0, Math.floor((clean.length * 3) / 4) - padding);
  }

  function normalizeShareService(record = {}) {
    const source = record && typeof record === "object" ? record : {};
    const mode = source.mode === "remote-api" ? "remote-api" : "local-link";
    const workspaceId = normalizeShareRepositoryWorkspaceId(source.workspaceId || source.remoteWorkspaceId || source.accountId);
    const receipts = normalizeShareRepositoryReceipts(source, { expectedWorkspaceId: workspaceId });
    const lastRemoteDirection = normalizeShareRepositoryFailureAction(source.lastRemoteDirection);
    const lastReceipt = normalizeShareRepositoryReceipt({
      ...(source.lastReceipt || source.latestReceipt || source.receipt || {}),
      expectedWorkspaceId: workspaceId
    })
      || receipts[0]
      || null;
    return {
      mode,
      records: Array.isArray(source.records)
        ? source.records.map(normalizeShareRecord).filter(Boolean).slice(0, MAX_SHARE_RECORDS)
        : [],
      lastCreatedAt: normalizePlanDate(source.lastCreatedAt),
      lastCopiedAt: normalizePlanDate(source.lastCopiedAt),
      lastOpenedAt: normalizePlanDate(source.lastOpenedAt),
      lastRevokedAt: normalizePlanDate(source.lastRevokedAt),
      remoteEndpoint: source.remoteEndpoint ? String(source.remoteEndpoint).trim().slice(0, 420) : "",
      remoteToken: source.remoteToken ? String(source.remoteToken).trim().slice(0, 240) : "",
      workspaceId,
      lastCheckedAt: normalizePlanDate(source.lastCheckedAt),
      lastRemoteSyncAt: normalizePlanDate(source.lastRemoteSyncAt),
      lastRemotePushAt: normalizePlanDate(source.lastRemotePushAt || (lastRemoteDirection === "push" ? source.lastRemoteSyncAt : null)),
      lastRemoteRevokeAt: normalizePlanDate(source.lastRemoteRevokeAt || (lastRemoteDirection === "revoke" ? source.lastRemoteSyncAt : null)),
      lastRemoteDirection,
      lastRemoteStatus: source.lastRemoteStatus ? String(source.lastRemoteStatus).trim().slice(0, 260) : "",
      lastPackageId: source.lastPackageId ? String(source.lastPackageId).trim().slice(0, 160) : "",
      lastRemoteShareId: source.lastRemoteShareId ? String(source.lastRemoteShareId).trim().slice(0, 120) : "",
      lastRemotePublicUrl: normalizeSharePublicUrl(source.lastRemotePublicUrl),
      lastReceipt,
      receipts: appendShareRepositoryReceipt({ receipts, workspaceId }, lastReceipt),
      lastRemoteFailureAt: normalizePlanDate(source.lastRemoteFailureAt),
      lastFailureAction: normalizeShareRepositoryFailureAction(source.lastFailureAction),
      remoteRetryAfter: normalizePlanDate(source.remoteRetryAfter),
      remoteFailureHistory: Array.isArray(source.remoteFailureHistory)
        ? source.remoteFailureHistory.map(normalizeShareRepositoryFailure).filter(Boolean).slice(0, SHARE_REPOSITORY_MAX_FAILURES)
        : [],
      lastError: source.lastError ? String(source.lastError).trim().slice(0, 220) : ""
    };
  }

  function normalizeShareRecord(record) {
    if (!record || typeof record !== "object") return null;
    const id = String(record.id || "").trim();
    const artworkId = String(record.artworkId || "").trim();
    if (!id || !artworkId) return null;
    const rawRemoteWorkspace = record.remoteWorkspaceId || record.remoteWorkspace || record.workspaceId || record.accountId;
    const hasRemoteState = record.remotePublicUrl || record.remotePackageId || record.remotePublishedAt || record.remoteReceiptDigest || record.remoteRevokedAt || record.remoteRevokeReceiptDigest;
    return {
      id,
      artworkId,
      title: String(record.title || "作品分享链接").slice(0, 120),
      glyph: String(record.glyph || "").slice(0, 12),
      score: normalizeScore(record.score, 0),
      permission: record.permission === "local-browser" ? "local-browser" : "local-link",
      createdAt: normalizePlanDate(record.createdAt) || new Date().toISOString(),
      expiresAt: normalizePlanDate(record.expiresAt),
      revokedAt: normalizePlanDate(record.revokedAt),
      copiedAt: normalizePlanDate(record.copiedAt),
      lastViewedAt: normalizePlanDate(record.lastViewedAt),
      remotePublishedAt: normalizePlanDate(record.remotePublishedAt),
      remoteRevokedAt: normalizePlanDate(record.remoteRevokedAt),
      remoteWorkspaceId: rawRemoteWorkspace ? normalizeShareRepositoryWorkspaceId(rawRemoteWorkspace) : hasRemoteState ? SHARE_REPOSITORY_DEFAULT_WORKSPACE : "",
      remotePublicUrl: normalizeSharePublicUrl(record.remotePublicUrl),
      remotePackageId: record.remotePackageId ? String(record.remotePackageId).trim().slice(0, 160) : "",
      remoteReceiptDigest: normalizeShareRepositoryHex(record.remoteReceiptDigest),
      remoteRevokeReceiptDigest: normalizeShareRepositoryHex(record.remoteRevokeReceiptDigest),
      viewCount: normalizeInteger(record.viewCount, 0, 0, 999999),
      copyCount: normalizeInteger(record.copyCount, 0, 0, 999999)
    };
  }

  function normalizeSharePublicUrl(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    try {
      const base = typeof location !== "undefined" && location.href ? location.href : "http://localhost/";
      const url = new URL(text, base);
      return ["http:", "https:"].includes(url.protocol) ? url.href.slice(0, 420) : "";
    } catch (error) {
      return "";
    }
  }

  function normalizeShareRepositoryWorkspaceId(value) {
    const normalized = String(value || "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9_.:-]/g, "")
      .slice(0, 64);
    return normalized || SHARE_REPOSITORY_DEFAULT_WORKSPACE;
  }

  function normalizeShareRepositoryReceipts(source = {}, context = {}) {
    const candidates = Array.isArray(source.receipts)
      ? source.receipts
      : Array.isArray(source.remoteReceipts)
        ? source.remoteReceipts
        : [];
    const receipts = [];
    candidates
      .map((receipt) => normalizeShareRepositoryReceipt({
        ...receipt,
        expectedWorkspaceId: context.expectedWorkspaceId || source.workspaceId || source.remoteWorkspaceId || source.accountId
      }))
      .filter(Boolean)
      .forEach((receipt) => {
        const key = getShareRepositoryReceiptKey(receipt);
        if (key && !receipts.some((item) => getShareRepositoryReceiptKey(item) === key)) {
          receipts.push(receipt);
        }
      });
    return receipts.slice(0, SHARE_REPOSITORY_MAX_RECEIPTS);
  }

  function normalizeShareRepositoryReceipt(record) {
    if (!record || typeof record !== "object") return null;
    const receiptKind = String(record.receiptKind || "").trim();
    const repositoryDigest = normalizeShareRepositoryHex(record.repositoryDigest);
    const receiptDigest = normalizeShareRepositoryHex(record.receiptDigest);
    if (receiptKind !== SHARE_REPOSITORY_RECEIPT_KIND || !repositoryDigest || !receiptDigest) {
      return null;
    }
    const workspaceId = normalizeShareRepositoryWorkspaceId(record.workspaceId || record.remoteWorkspaceId || record.accountId);
    const publicUrl = normalizeSharePublicUrl(record.publicUrl);
    const acceptedAt = normalizePlanDate(record.acceptedAt);
    const verification = verifyShareRepositoryReceipt({
      ...record,
      sourcePackageId: String(record.sourcePackageId || "").slice(0, 160),
      workspaceId,
      shareId: String(record.shareId || "").slice(0, 120),
      repositoryDigest,
      publicUrl,
      acceptedAt,
      receiptDigest
    }, {
      expectedWorkspaceId: record.expectedWorkspaceId || record.contextWorkspaceId || record.currentWorkspaceId || ""
    });
    return {
      receiptKind,
      id: String(record.id || `share-receipt-${receiptDigest.slice(0, 16)}`).slice(0, 120),
      remoteVersion: String(record.remoteVersion || "").slice(0, 120),
      packageId: String(record.packageId || "").slice(0, 160),
      sourcePackageId: String(record.sourcePackageId || "").slice(0, 160),
      workspaceId,
      shareId: String(record.shareId || "").slice(0, 120),
      artworkId: String(record.artworkId || "").slice(0, 120),
      repositoryDigest,
      receiptDigest,
      publicUrl,
      acceptedAt,
      shareCount: normalizeInteger(record.shareCount, 0, 0, 9999),
      htmlBytes: normalizeInteger(record.htmlBytes, 0, 0, 999999999),
      warningCount: normalizeInteger(record.warningCount, 0, 0, 9999),
      warnings: normalizeStringList(record.warnings).slice(0, 12),
      direction: ["check", "push", "revoke"].includes(record.direction) ? record.direction : "",
      endpoint: record.endpoint ? String(record.endpoint).slice(0, 420) : "",
      receivedAt: normalizePlanDate(record.receivedAt),
      verificationStatus: verification.status,
      verificationMessage: verification.message,
      verificationDigest: verification.digest,
      verificationExpectedDigest: verification.expectedDigest,
      verificationWorkspaceStatus: verification.workspaceStatus,
      verificationAction: verification.action,
      message: record.message ? String(record.message).slice(0, 260) : ""
    };
  }

  function verifyShareRepositoryReceipt(receipt = {}, context = {}) {
    const sourcePackageId = String(receipt.sourcePackageId || "").trim();
    const workspaceId = normalizeShareRepositoryWorkspaceId(receipt.workspaceId || receipt.remoteWorkspaceId || receipt.accountId);
    const shareId = String(receipt.shareId || "").trim();
    const repositoryDigest = normalizeShareRepositoryHex(receipt.repositoryDigest);
    const publicUrl = normalizeSharePublicUrl(receipt.publicUrl);
    const acceptedAt = normalizePlanDate(receipt.acceptedAt);
    const receiptDigest = normalizeShareRepositoryHex(receipt.receiptDigest);
    const direction = String(receipt.direction || context.direction || "").trim();
    const actionHint = String(receipt.action || receipt.verificationAction || context.action || "").trim();
    const forceRevokeDigest = direction === "revoke" || actionHint === "revoke";
    const expectedWorkspaceId = context.expectedWorkspaceId
      ? normalizeShareRepositoryWorkspaceId(context.expectedWorkspaceId)
      : "";
    const publishDigest = sourcePackageId && workspaceId && repositoryDigest && publicUrl && acceptedAt
      ? sha256StableJson({
        sourcePackageId,
        workspaceId,
        repositoryDigest,
        publicUrl,
        acceptedAt
      })
      : "";
    const revokeDigest = sourcePackageId && workspaceId && shareId && repositoryDigest && publicUrl && acceptedAt
      ? sha256StableJson({
        action: "revoke",
        sourcePackageId,
        workspaceId,
        shareId,
        repositoryDigest,
        publicUrl,
        acceptedAt
      })
      : "";
    const expectedDigest = forceRevokeDigest
      ? revokeDigest
      : receiptDigest && receiptDigest === revokeDigest
      ? revokeDigest
      : publishDigest;
    const action = forceRevokeDigest || receiptDigest && receiptDigest === revokeDigest ? "revoke" : "publish";
    const digestOk = Boolean(expectedDigest && receiptDigest && expectedDigest === receiptDigest);
    const workspaceOk = !expectedWorkspaceId || expectedWorkspaceId === workspaceId;
    const status = digestOk && workspaceOk
      ? "verified"
      : digestOk
        ? "workspace-mismatch"
        : "digest-mismatch";
    const actionLabel = action === "revoke" ? "撤销" : "发布";
    const messages = {
      verified: `本机一致性校验通过：${actionLabel}回执 receiptDigest 与声明字段一致，Workspace 匹配当前空间。`,
      "workspace-mismatch": `本机一致性校验警告：receiptDigest 一致，但回执空间 ${workspaceId} 与当前空间 ${expectedWorkspaceId} 不一致。`,
      "digest-mismatch": "本机一致性校验失败：receiptDigest 无法按分享回执声明字段重算匹配。"
    };
    return {
      status,
      message: messages[status],
      digest: receiptDigest,
      expectedDigest,
      workspaceStatus: workspaceOk ? "matched" : "mismatch",
      action
    };
  }

  function decorateShareRepositoryReceipt(receipt, context = {}) {
    const normalized = normalizeShareRepositoryReceipt({
      ...receipt,
      workspaceId: receipt?.workspaceId || context.workspaceId,
      expectedWorkspaceId: context.workspaceId || receipt?.expectedWorkspaceId,
      direction: context.direction || receipt?.direction
    });
    if (!normalized) return null;
    return {
      ...normalized,
      direction: context.direction || normalized.direction,
      endpoint: context.endpoint || normalized.endpoint,
      receivedAt: context.receivedAt || normalized.receivedAt,
      message: context.message || normalized.message
    };
  }

  function appendShareRepositoryReceipt(repository, receipt) {
    const normalized = normalizeShareRepositoryReceipt({
      ...receipt,
      expectedWorkspaceId: repository?.workspaceId || receipt?.expectedWorkspaceId
    });
    const existing = Array.isArray(repository?.receipts) ? repository.receipts : [];
    if (!normalized) {
      return existing
        .map((item) => normalizeShareRepositoryReceipt({
          ...item,
          expectedWorkspaceId: repository?.workspaceId || item?.expectedWorkspaceId
        }))
        .filter(Boolean)
        .slice(0, SHARE_REPOSITORY_MAX_RECEIPTS);
    }
    const key = getShareRepositoryReceiptKey(normalized);
    return [
      normalized,
      ...existing
        .map((item) => normalizeShareRepositoryReceipt({
          ...item,
          expectedWorkspaceId: repository?.workspaceId || item?.expectedWorkspaceId
        }))
        .filter(Boolean)
        .filter((item) => getShareRepositoryReceiptKey(item) !== key)
    ].slice(0, SHARE_REPOSITORY_MAX_RECEIPTS);
  }

  function getShareRepositoryReceiptKey(receipt) {
    if (!receipt) return "";
    return receipt.receiptDigest || `${receipt.repositoryDigest}:${receipt.packageId}:${receipt.sourcePackageId}:${receipt.acceptedAt}` || receipt.id || "";
  }

  function normalizeShareRepositoryHex(value) {
    const hex = String(value || "").trim().toLowerCase();
    return /^[a-f0-9]{64}$/.test(hex) ? hex : "";
  }

  function normalizeShareRepositoryFailureAction(action) {
    return ["check", "push", "revoke"].includes(action) ? action : "";
  }

  function normalizeShareRepositoryFailure(record) {
    if (!record || typeof record !== "object") return null;
    const failedAt = normalizePlanDate(record.failedAt) || new Date().toISOString();
    const message = String(record.message || "").trim().slice(0, 260);
    if (!message) return null;
    const action = normalizeShareRepositoryFailureAction(record.action) || "check";
    return {
      id: String(record.id || `share-repository-failure-${action}-${failedAt.replace(/[-:.TZ]/g, "").slice(0, 14)}`).slice(0, 120),
      action,
      failedAt,
      retryAfter: normalizePlanDate(record.retryAfter),
      attemptCount: normalizeInteger(record.attemptCount, 0, 0, 9999),
      shareCount: normalizeInteger(record.shareCount, 0, 0, 99999),
      endpoint: String(record.endpoint || "").trim().slice(0, 420),
      workspaceId: normalizeShareRepositoryWorkspaceId(record.workspaceId),
      shareId: String(record.shareId || "").trim().slice(0, 120),
      packageId: String(record.packageId || "").trim().slice(0, 160),
      packageDigest: normalizeShareRepositoryHex(record.packageDigest),
      publicUrl: normalizeSharePublicUrl(record.publicUrl),
      failureKind: ["http", "network", "timeout", "validation", "response", "unknown"].includes(record.failureKind)
        ? record.failureKind
        : classifyShareRepositoryFailure(message),
      message
    };
  }

  function classifyShareRepositoryFailure(message = "") {
    const text = String(message || "");
    if (/超时|timeout/i.test(text)) return "timeout";
    if (/HTTP\s+\d+/.test(text)) return "http";
    if (/网络请求异常|Failed|Network/i.test(text)) return "network";
    if (/格式|结构|JSON|缺少|不是/.test(text)) return "validation";
    if (/没有返回|无响应|请求失败/.test(text)) return "response";
    return "unknown";
  }

  function getShareRepositoryRetryDelayMs(attemptCount, options = {}) {
    if (Number.isFinite(Number(options.retryDelayMs))) {
      return Math.max(0, Math.min(3600000, Math.round(Number(options.retryDelayMs))));
    }
    const attempt = normalizeInteger(attemptCount, 1, 1, 10);
    return Math.min(10 * 60 * 1000, SHARE_REPOSITORY_RETRY_BASE_MS * Math.max(1, 2 ** (attempt - 1)));
  }

  function getShareRepositoryRetrySummary(service = state.shareService) {
    const normalized = normalizeShareService(service);
    if (!normalized.remoteFailureHistory.length || !normalized.remoteRetryAfter) {
      return "";
    }
    const latestFailure = normalized.remoteFailureHistory[0] || null;
    const actionLabel = {
      check: "检查",
      push: "发布",
      revoke: "撤销"
    }[latestFailure?.action] || "同步";
    const reason = latestFailure?.failureKind === "timeout"
      ? "请求超时"
      : latestFailure?.failureKind === "http"
        ? "服务端拒收"
        : latestFailure?.failureKind === "network"
          ? "网络异常"
          : latestFailure?.failureKind === "validation"
            ? "结构校验失败"
            : "远端响应未完成";
    return `失败历史 ${normalized.remoteFailureHistory.length} 次，最近一次${actionLabel}为${reason}；建议 ${formatPlanDate(normalized.remoteRetryAfter)} 后重试。`;
  }

  function hasShareRepositoryPushRetryPending(service = state.shareService) {
    const normalized = normalizeShareService(service);
    const lastPushTime = Date.parse(normalized.lastRemotePushAt || "") || 0;
    return normalized.remoteFailureHistory.some((failure) => {
      if (failure.action !== "push") return false;
      const failedAt = Date.parse(failure.failedAt || "") || 0;
      return failedAt > lastPushTime;
    });
  }

  function hasShareRepositoryRevokeRetryPending(service = state.shareService) {
    const normalized = normalizeShareService(service);
    const lastRevokeTime = Date.parse(normalized.lastRemoteRevokeAt || "") || 0;
    return normalized.remoteFailureHistory.some((failure) => {
      if (failure.action !== "revoke") return false;
      const failedAt = Date.parse(failure.failedAt || "") || 0;
      return failedAt > lastRevokeTime;
    });
  }

  function normalizeIsoDate(value) {
    const time = Date.parse(value);
    return Number.isFinite(time) ? new Date(time).toISOString() : "";
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
    const items = normalizePlanDependencies(Array.isArray(record.items)
      ? record.items.map(normalizePlanItem).filter(Boolean).slice(0, MAX_PLAN_ITEMS)
      : []);
    const fallbackTask = findTaskForState(record.mode, record.glyph, record.copybook);
    return {
      id: String(record.id || makeId("plan")),
      createdAt: String(record.createdAt || new Date().toISOString()),
      updatedAt: normalizePlanDate(record.updatedAt) || normalizePlanDate(record.createdAt) || new Date().toISOString(),
      title: String(record.title || "下一阶段练习计划"),
      taskId: getTaskById(record.taskId) ? String(record.taskId) : fallbackTask?.id || null,
      mode: MODE_CONFIG[record.mode] ? record.mode : "single",
      glyph: String(record.glyph || "永"),
      copybook: String(record.copybook || "永字八法"),
      summary: String(record.summary || ""),
      items,
      cycleRule: normalizePlanCycleRule(record.cycleRule, items, record.createdAt),
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
        reviewDoneAt: null,
        dependsOn: index > 0 ? [`plan-item-${index}`] : []
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
      reviewDoneAt: normalizePlanDate(item.reviewDoneAt),
      dependsOn: Array.isArray(item.dependsOn)
        ? [...new Set(item.dependsOn.map(String).filter(Boolean))].slice(0, 4)
        : null
    };
  }

  function normalizePlanDependencies(items = []) {
    const idSet = new Set(items.map((item) => item.id));
    return items.map((item, index) => {
      const explicit = Array.isArray(item.dependsOn);
      const fallback = index > 0 ? [items[index - 1].id] : [];
      const dependsOn = (explicit ? item.dependsOn : fallback)
        .map(String)
        .filter((id) => id && id !== item.id && idSet.has(id));
      return {
        ...item,
        dependsOn: [...new Set(dependsOn)].slice(0, 4)
      };
    });
  }

  function normalizePlanCycleRule(rule = {}, items = [], createdAt = null) {
    const source = rule && typeof rule === "object" ? rule : {};
    const intervalDays = normalizeInteger(source.intervalDays, DEFAULT_PLAN_CYCLE_DAYS, 1, 60);
    const cycleIndex = normalizeInteger(source.cycleIndex, 1, 1, 999);
    const nextCycleAt = normalizePlanDate(source.nextCycleAt) || makePlanCycleNextAt(createdAt, intervalDays);
    return {
      enabled: source.enabled !== false,
      intervalDays,
      cycleIndex,
      nextCycleAt,
      previousPlanId: source.previousPlanId ? String(source.previousPlanId) : null,
      generatedAt: normalizePlanDate(source.generatedAt),
      generatedNextPlanId: source.generatedNextPlanId ? String(source.generatedNextPlanId) : null,
      itemCount: Array.isArray(items) ? items.length : 0
    };
  }

  function normalizePlanReminderService(record = {}) {
    const source = record && typeof record === "object" ? record : {};
    const permission = ["default", "granted", "denied", "unsupported"].includes(source.permission)
      ? source.permission
      : "default";
    return {
      enabled: source.enabled === true,
      permission,
      supported: source.supported === true,
      channel: ["browser-notification", "in-page"].includes(source.channel) ? source.channel : "in-page",
      lastCheckedAt: normalizePlanDate(source.lastCheckedAt),
      requestedAt: normalizePlanDate(source.requestedAt),
      acknowledgedAt: normalizePlanDate(source.acknowledgedAt),
      lastDispatchedAt: normalizePlanDate(source.lastDispatchedAt),
      lastPlanId: source.lastPlanId ? String(source.lastPlanId) : null,
      lastItemId: source.lastItemId ? String(source.lastItemId) : null,
      lastReminderFingerprint: source.lastReminderFingerprint ? String(source.lastReminderFingerprint) : null
    };
  }

  function normalizePlanRepository(record = {}) {
    const source = record && typeof record === "object" ? record : {};
    const lastRemoteDirection = ["check", "push", "pull"].includes(source.lastRemoteDirection)
      ? source.lastRemoteDirection
      : "";
    const workspaceId = normalizePlanRepositoryWorkspaceId(source.workspaceId || source.remoteWorkspaceId || source.accountId);
    const receipts = normalizePlanRepositoryReceipts(source, { expectedWorkspaceId: workspaceId });
    const lastReceipt = normalizePlanRepositoryReceipt({
      ...(source.lastReceipt || source.latestReceipt || source.receipt || {}),
      expectedWorkspaceId: workspaceId
    })
      || receipts[0]
      || null;
    return {
      mode: ["local-json", "remote-api"].includes(source.mode) ? source.mode : "local-json",
      remoteEndpoint: typeof source.remoteEndpoint === "string" ? source.remoteEndpoint.trim() : "",
      remoteToken: typeof source.remoteToken === "string" ? source.remoteToken.trim() : "",
      workspaceId,
      lastExportedAt: normalizePlanDate(source.lastExportedAt),
      lastImportedAt: normalizePlanDate(source.lastImportedAt),
      lastCheckedAt: normalizePlanDate(source.lastCheckedAt),
      lastRemoteSyncAt: normalizePlanDate(source.lastRemoteSyncAt),
      lastRemoteDirection,
      lastRemotePlanCount: normalizeInteger(source.lastRemotePlanCount, 0, 0, 9999),
      lastRemoteStatus: source.lastRemoteStatus ? String(source.lastRemoteStatus).slice(0, 180) : "",
      lastExportedPlanCount: normalizeInteger(source.lastExportedPlanCount, 0, 0, 9999),
      lastImportedPlanCount: normalizeInteger(source.lastImportedPlanCount, 0, 0, 9999),
      lastPackageId: source.lastPackageId ? String(source.lastPackageId) : null,
      autoSyncEnabled: source.autoSyncEnabled === true,
      pendingAutoSync: source.pendingAutoSync === true,
      pendingSince: normalizePlanDate(source.pendingSince),
      pendingReason: source.pendingReason ? String(source.pendingReason).slice(0, 160) : "",
      pendingPlanCount: normalizeInteger(source.pendingPlanCount, 0, 0, 9999),
      autoSyncAttemptCount: normalizeInteger(source.autoSyncAttemptCount, 0, 0, 9999),
      lastAutoSyncAt: normalizePlanDate(source.lastAutoSyncAt),
      lastAutoSyncStatus: source.lastAutoSyncStatus ? String(source.lastAutoSyncStatus).slice(0, 180) : "",
      lastAutoSyncFailureAt: normalizePlanDate(source.lastAutoSyncFailureAt),
      autoSyncRetryAfter: normalizePlanDate(source.autoSyncRetryAfter),
      autoSyncFailureHistory: Array.isArray(source.autoSyncFailureHistory)
        ? source.autoSyncFailureHistory.map(normalizePlanRepositoryAutoSyncFailure).filter(Boolean).slice(0, PLAN_REPOSITORY_MAX_FAILURES)
        : [],
      lastSyncConflictAt: normalizePlanDate(source.lastSyncConflictAt),
      lastSyncConflictCount: normalizeInteger(source.lastSyncConflictCount, 0, 0, 9999),
      lastSyncConflictPlanIds: Array.isArray(source.lastSyncConflictPlanIds)
        ? source.lastSyncConflictPlanIds.map(String).filter(Boolean).slice(0, 12)
        : [],
      lastSyncConflicts: Array.isArray(source.lastSyncConflicts)
        ? source.lastSyncConflicts.map(normalizePlanRepositoryConflict).filter(Boolean).slice(0, 12)
        : [],
      lastSyncConflictPlans: Array.isArray(source.lastSyncConflictPlans)
        ? source.lastSyncConflictPlans.map(normalizePlan).filter(Boolean).slice(0, 12)
        : [],
      lastReceipt,
      receipts: appendPlanRepositoryReceipt({ receipts, workspaceId }, lastReceipt),
      lastError: source.lastError ? String(source.lastError).slice(0, 180) : ""
    };
  }

  function normalizePlanRepositoryWorkspaceId(value) {
    const normalized = String(value || "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9_.:-]/g, "")
      .slice(0, 64);
    return normalized || PLAN_REPOSITORY_DEFAULT_WORKSPACE;
  }

  function normalizePlanRepositoryReceipts(source = {}, context = {}) {
    const candidates = Array.isArray(source.receipts)
      ? source.receipts
      : Array.isArray(source.planReceipts)
        ? source.planReceipts
        : [];
    const seen = new Set();
    const receipts = [];
    candidates
      .map((receipt) => normalizePlanRepositoryReceipt({
        ...receipt,
        expectedWorkspaceId: context.expectedWorkspaceId || source.workspaceId || source.remoteWorkspaceId || source.accountId
      }))
      .filter(Boolean)
      .forEach((receipt) => {
        const key = getPlanRepositoryReceiptKey(receipt);
        if (!key || seen.has(key)) return;
        seen.add(key);
        receipts.push(receipt);
      });
    return receipts.slice(0, PLAN_REPOSITORY_MAX_RECEIPTS);
  }

  function normalizePlanRepositoryReceipt(record) {
    if (!record || typeof record !== "object") return null;
    const receiptKind = String(record.receiptKind || "").trim();
    const repositoryDigest = normalizePlanRepositoryHex(record.repositoryDigest);
    const receiptDigest = normalizePlanRepositoryHex(record.receiptDigest);
    if (receiptKind !== PLAN_REPOSITORY_RECEIPT_KIND || !repositoryDigest || !receiptDigest) {
      return null;
    }
    const warnings = Array.isArray(record.warnings)
      ? record.warnings.map((warning) => String(warning || "").slice(0, 160)).filter(Boolean).slice(0, 8)
      : [];
    const workspaceId = normalizePlanRepositoryWorkspaceId(record.workspaceId || record.remoteWorkspaceId || record.accountId);
    const acceptedAt = normalizePlanDate(record.acceptedAt);
    const verification = verifyPlanRepositoryReceipt({
      ...record,
      sourcePackageId: String(record.sourcePackageId || "").trim().slice(0, 120),
      workspaceId,
      repositoryDigest,
      acceptedAt,
      receiptDigest
    }, {
      expectedWorkspaceId: record.expectedWorkspaceId || record.contextWorkspaceId || record.currentWorkspaceId || ""
    });
    return {
      receiptKind,
      id: String(record.id || `plan-receipt-${receiptDigest.slice(0, 16)}`).slice(0, 120),
      remoteVersion: String(record.remoteVersion || "").trim().slice(0, 80),
      packageId: String(record.packageId || "").trim().slice(0, 120),
      sourcePackageId: String(record.sourcePackageId || "").trim().slice(0, 120),
      workspaceId,
      direction: ["check", "push", "pull"].includes(record.direction) ? record.direction : "",
      endpoint: String(record.endpoint || "").trim().slice(0, 240),
      receivedAt: normalizePlanDate(record.receivedAt),
      repositoryDigest,
      acceptedAt,
      planCount: normalizeInteger(record.planCount, 0, 0, 99999),
      warningCount: normalizeInteger(record.warningCount, warnings.length, 0, 99999),
      warnings,
      receiptDigest,
      verificationStatus: verification.status,
      verificationMessage: verification.message,
      verificationDigest: verification.digest,
      verificationExpectedDigest: verification.expectedDigest,
      verificationWorkspaceStatus: verification.workspaceStatus,
      message: String(record.message || "").slice(0, 180)
    };
  }

  function verifyPlanRepositoryReceipt(receipt = {}, context = {}) {
    const sourcePackageId = String(receipt.sourcePackageId || "").trim();
    const workspaceId = normalizePlanRepositoryWorkspaceId(receipt.workspaceId || receipt.remoteWorkspaceId || receipt.accountId);
    const repositoryDigest = normalizePlanRepositoryHex(receipt.repositoryDigest);
    const acceptedAt = normalizePlanDate(receipt.acceptedAt);
    const receiptDigest = normalizePlanRepositoryHex(receipt.receiptDigest);
    const expectedWorkspaceId = context.expectedWorkspaceId
      ? normalizePlanRepositoryWorkspaceId(context.expectedWorkspaceId)
      : "";
    const expectedDigest = sourcePackageId && workspaceId && repositoryDigest && acceptedAt
      ? sha256StableJson({
        sourcePackageId,
        workspaceId,
        repositoryDigest,
        acceptedAt
      })
      : "";
    const digestOk = Boolean(expectedDigest && receiptDigest && expectedDigest === receiptDigest);
    const workspaceOk = !expectedWorkspaceId || expectedWorkspaceId === workspaceId;
    const status = digestOk && workspaceOk
      ? "verified"
      : digestOk
        ? "workspace-mismatch"
        : "digest-mismatch";
    const messages = {
      verified: "本机一致性校验通过：receiptDigest 与计划仓库声明字段一致，Workspace 匹配当前空间。",
      "workspace-mismatch": `本机一致性校验警告：receiptDigest 一致，但回执空间 ${workspaceId} 与当前空间 ${expectedWorkspaceId} 不一致。`,
      "digest-mismatch": "本机一致性校验失败：receiptDigest 无法按 sourcePackageId、workspaceId、repositoryDigest 和 acceptedAt 重算匹配。"
    };
    return {
      status,
      message: messages[status],
      digest: receiptDigest,
      expectedDigest,
      workspaceStatus: workspaceOk ? "matched" : "mismatch"
    };
  }

  function decoratePlanRepositoryReceipt(receipt, context = {}) {
    const normalized = normalizePlanRepositoryReceipt({
      ...receipt,
      direction: context.direction || receipt?.direction,
      endpoint: context.endpoint || receipt?.endpoint,
      workspaceId: context.workspaceId || receipt?.workspaceId,
      expectedWorkspaceId: context.workspaceId || receipt?.expectedWorkspaceId,
      receivedAt: context.receivedAt || receipt?.receivedAt,
      message: context.message || receipt?.message
    });
    return normalized;
  }

  function appendPlanRepositoryReceipt(repository, receipt) {
    const normalized = normalizePlanRepositoryReceipt({
      ...receipt,
      expectedWorkspaceId: repository?.workspaceId || receipt?.expectedWorkspaceId
    });
    const existing = Array.isArray(repository?.receipts) ? repository.receipts : [];
    if (!normalized) {
      return existing
        .map((item) => normalizePlanRepositoryReceipt({
          ...item,
          expectedWorkspaceId: repository?.workspaceId || item?.expectedWorkspaceId
        }))
        .filter(Boolean)
        .slice(0, PLAN_REPOSITORY_MAX_RECEIPTS);
    }
    const seen = new Set([getPlanRepositoryReceiptKey(normalized)]);
    const next = [normalized];
    existing
      .map((item) => normalizePlanRepositoryReceipt({
        ...item,
        expectedWorkspaceId: repository?.workspaceId || item?.expectedWorkspaceId
      }))
      .filter(Boolean)
      .forEach((item) => {
        const key = getPlanRepositoryReceiptKey(item);
        if (!key || seen.has(key)) return;
        seen.add(key);
        next.push(item);
      });
    return next.slice(0, PLAN_REPOSITORY_MAX_RECEIPTS);
  }

  function getPlanRepositoryReceiptKey(receipt) {
    if (!receipt) return "";
    return receipt.receiptDigest || `${receipt.repositoryDigest}:${receipt.packageId}:${receipt.sourcePackageId}:${receipt.acceptedAt}` || receipt.id || "";
  }

  function normalizePlanRepositoryHex(value) {
    const hex = String(value || "").trim().toLowerCase();
    return /^[a-f0-9]{64}$/.test(hex) ? hex : "";
  }

  function normalizePlanRepositoryAutoSyncFailure(record) {
    if (!record || typeof record !== "object") return null;
    const failedAt = normalizePlanDate(record.failedAt) || new Date().toISOString();
    const message = String(record.message || "").trim().slice(0, 220);
    if (!message) return null;
    return {
      id: String(record.id || `plan-sync-failure-${failedAt.replace(/[-:.TZ]/g, "").slice(0, 14)}`).slice(0, 120),
      failedAt,
      retryAfter: normalizePlanDate(record.retryAfter),
      attemptCount: normalizeInteger(record.attemptCount, 0, 0, 9999),
      planCount: normalizeInteger(record.planCount, 0, 0, 9999),
      pendingReason: String(record.pendingReason || "").trim().slice(0, 160),
      endpoint: String(record.endpoint || "").trim().slice(0, 240),
      workspaceId: normalizePlanRepositoryWorkspaceId(record.workspaceId),
      packageId: String(record.packageId || "").trim().slice(0, 120),
      failureKind: ["http", "network", "timeout", "validation", "unknown"].includes(record.failureKind)
        ? record.failureKind
        : classifyPlanRepositoryFailure(message),
      message
    };
  }

  function classifyPlanRepositoryFailure(message = "") {
    const text = String(message || "");
    if (/超时|timeout/i.test(text)) return "timeout";
    if (/HTTP\s+\d+/.test(text)) return "http";
    if (/网络请求异常|Failed|Network/i.test(text)) return "network";
    if (/格式|结构|JSON|缺少|不是/.test(text)) return "validation";
    return "unknown";
  }

  function getPlanRepositoryRetryDelayMs(attemptCount, options = {}) {
    if (Number.isFinite(Number(options.retryDelayMs))) {
      return Math.max(0, Math.min(3600000, Math.round(Number(options.retryDelayMs))));
    }
    const attempt = normalizeInteger(attemptCount, 1, 1, 10);
    return Math.min(10 * 60 * 1000, PLAN_REPOSITORY_RETRY_BASE_MS * Math.max(1, 2 ** (attempt - 1)));
  }

  function recordPlanRepositoryAutoSyncFailure(repository, message, options = {}) {
    const current = normalizePlanRepository(repository || state.planRepository);
    const now = new Date().toISOString();
    const attemptCount = normalizeInteger(current.autoSyncAttemptCount, 0, 0, 9999);
    const retryDelayMs = getPlanRepositoryRetryDelayMs(attemptCount || 1, options);
    const retryAfter = retryDelayMs ? new Date(Date.now() + retryDelayMs).toISOString() : now;
    const normalizedMessage = String(message || "计划自动同步失败。").trim().slice(0, 220);
    const failure = normalizePlanRepositoryAutoSyncFailure({
      failedAt: now,
      retryAfter,
      attemptCount,
      planCount: current.pendingPlanCount || state.plans.length,
      pendingReason: current.pendingReason || "本机计划待同步",
      endpoint: current.remoteEndpoint,
      workspaceId: current.workspaceId,
      packageId: options.packageId || current.lastPackageId || "",
      failureKind: options.failureKind || classifyPlanRepositoryFailure(normalizedMessage),
      message: normalizedMessage
    });
    const history = [failure, ...current.autoSyncFailureHistory]
      .filter(Boolean)
      .slice(0, PLAN_REPOSITORY_MAX_FAILURES);
    const retryText = retryAfter ? `下次可重试：${formatPlanDate(retryAfter)}。` : "可立即重试。";
    state.planRepository = normalizePlanRepository({
      ...current,
      pendingAutoSync: true,
      pendingSince: current.pendingSince || now,
      pendingReason: current.pendingReason || "本机计划待同步",
      pendingPlanCount: current.pendingPlanCount || state.plans.length,
      lastCheckedAt: now,
      lastAutoSyncAt: options.autoSync ? now : current.lastAutoSyncAt,
      lastAutoSyncStatus: `自动同步第 ${attemptCount || 1} 次失败，队列已保留。${retryText}`,
      lastAutoSyncFailureAt: now,
      autoSyncRetryAfter: retryAfter,
      autoSyncFailureHistory: history,
      lastError: `${normalizedMessage} 队列已保留，${retryText}`
    });
    saveState();
    return {
      ok: false,
      status: getPlanRepositoryStatus(),
      failure: failure ? clone(failure) : null,
      message: state.planRepository.lastError
    };
  }

  function normalizePlanRepositoryConflict(record) {
    if (!record || typeof record !== "object") return null;
    const id = String(record.id || "").trim();
    if (!id) return null;
    return {
      id,
      title: String(record.title || record.remoteTitle || record.localTitle || id).slice(0, 120),
      localTitle: String(record.localTitle || record.title || id).slice(0, 120),
      remoteTitle: String(record.remoteTitle || record.title || id).slice(0, 120),
      localUpdatedAt: normalizePlanDate(record.localUpdatedAt),
      remoteUpdatedAt: normalizePlanDate(record.remoteUpdatedAt),
      fieldDiffs: normalizePlanRepositoryFieldDiffs(record.fieldDiffs)
    };
  }

  function normalizePlanRepositoryFieldDiffs(fieldDiffs = {}) {
    const source = fieldDiffs && typeof fieldDiffs === "object" ? fieldDiffs : {};
    return {
      plan: Array.isArray(source.plan)
        ? source.plan.map(normalizePlanRepositoryFieldDiff).filter(Boolean).slice(0, PLAN_REPOSITORY_MERGE_PLAN_FIELDS.length)
        : [],
      items: Array.isArray(source.items)
        ? source.items.map(normalizePlanRepositoryItemDiff).filter(Boolean).slice(0, MAX_PLAN_ITEMS)
        : []
    };
  }

  function normalizePlanRepositoryFieldDiff(record) {
    if (!record || typeof record !== "object") return null;
    const field = String(record.field || "").trim();
    if (!field) return null;
    return {
      field,
      label: String(record.label || PLAN_REPOSITORY_MERGE_LABELS[field] || field).slice(0, 32),
      localValue: formatPlanRepositoryMergeValue(record.localValue),
      remoteValue: formatPlanRepositoryMergeValue(record.remoteValue)
    };
  }

  function normalizePlanRepositoryItemDiff(record) {
    if (!record || typeof record !== "object") return null;
    const itemId = String(record.itemId || record.id || "").trim();
    if (!itemId) return null;
    const fields = Array.isArray(record.fields)
      ? record.fields.map(normalizePlanRepositoryFieldDiff).filter(Boolean).slice(0, PLAN_REPOSITORY_MERGE_ITEM_FIELDS.length)
      : [];
    if (!fields.length) return null;
    return {
      itemId,
      localTitle: String(record.localTitle || itemId).slice(0, 80),
      remoteTitle: String(record.remoteTitle || itemId).slice(0, 80),
      fields
    };
  }

  function normalizeHistoryRepository(record = {}) {
    const source = record && typeof record === "object" ? record : {};
    const lastRemoteDirection = ["check", "push", "pull"].includes(source.lastRemoteDirection)
      ? source.lastRemoteDirection
      : "";
    const workspaceId = normalizeHistoryRepositoryWorkspaceId(source.workspaceId || source.remoteWorkspaceId || source.accountId);
    const receipts = normalizeHistoryRepositoryReceipts(source, { expectedWorkspaceId: workspaceId });
    const lastReceipt = normalizeHistoryRepositoryReceipt({
      ...(source.lastReceipt || source.latestReceipt || source.receipt || {}),
      expectedWorkspaceId: workspaceId
    })
      || receipts[0]
      || null;
    const lastConflictRecords = Array.isArray(source.lastConflictRecords)
      ? source.lastConflictRecords.map(normalizeHistoryRepositoryConflict).filter(Boolean).slice(0, HISTORY_REPOSITORY_MAX_CONFLICTS)
      : [];
    return {
      mode: ["local-json", "remote-api"].includes(source.mode) ? source.mode : "local-json",
      remoteEndpoint: typeof source.remoteEndpoint === "string" ? source.remoteEndpoint.trim() : "",
      remoteToken: typeof source.remoteToken === "string" ? source.remoteToken.trim() : "",
      workspaceId,
      lastExportedAt: normalizePlanDate(source.lastExportedAt),
      lastImportedAt: normalizePlanDate(source.lastImportedAt),
      lastCheckedAt: normalizePlanDate(source.lastCheckedAt),
      lastRemoteSyncAt: normalizePlanDate(source.lastRemoteSyncAt),
      lastRemotePushAt: normalizePlanDate(source.lastRemotePushAt || (lastRemoteDirection === "push" ? source.lastRemoteSyncAt : null)),
      lastRemoteDirection,
      lastRemoteStatus: source.lastRemoteStatus ? String(source.lastRemoteStatus).slice(0, 180) : "",
      lastExportedRecordCount: normalizeInteger(source.lastExportedRecordCount, 0, 0, 99999),
      lastImportedRecordCount: normalizeInteger(source.lastImportedRecordCount, 0, 0, 99999),
      lastRemoteRecordCount: normalizeInteger(source.lastRemoteRecordCount, 0, 0, 99999),
      lastSkippedConflictCount: normalizeInteger(source.lastSkippedConflictCount, 0, 0, 99999),
      lastConflictRecords,
      lastPackageId: source.lastPackageId ? String(source.lastPackageId) : null,
      lastReceipt,
      receipts: appendHistoryRepositoryReceipt({ receipts, workspaceId }, lastReceipt),
      lastRemoteFailureAt: normalizePlanDate(source.lastRemoteFailureAt),
      lastFailureAction: normalizeHistoryRepositoryFailureAction(source.lastFailureAction),
      remoteRetryAfter: normalizePlanDate(source.remoteRetryAfter),
      remoteFailureHistory: Array.isArray(source.remoteFailureHistory)
        ? source.remoteFailureHistory.map(normalizeHistoryRepositoryFailure).filter(Boolean).slice(0, HISTORY_REPOSITORY_MAX_FAILURES)
        : [],
      lastError: source.lastError ? String(source.lastError).slice(0, 180) : ""
    };
  }

  function normalizeHistoryRepositoryWorkspaceId(value) {
    const normalized = String(value || "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9_.:-]/g, "")
      .slice(0, 64);
    return normalized || HISTORY_REPOSITORY_DEFAULT_WORKSPACE;
  }

  function normalizeHistoryRepositoryReceipts(source = {}, context = {}) {
    const candidates = Array.isArray(source.receipts)
      ? source.receipts
      : Array.isArray(source.historyReceipts)
        ? source.historyReceipts
        : [];
    const seen = new Set();
    const receipts = [];
    candidates
      .map((receipt) => normalizeHistoryRepositoryReceipt({
        ...receipt,
        expectedWorkspaceId: context.expectedWorkspaceId || source.workspaceId || source.remoteWorkspaceId || source.accountId
      }))
      .filter(Boolean)
      .forEach((receipt) => {
        const key = getHistoryRepositoryReceiptKey(receipt);
        if (!key || seen.has(key)) return;
        seen.add(key);
        receipts.push(receipt);
      });
    return receipts.slice(0, HISTORY_REPOSITORY_MAX_RECEIPTS);
  }

  function normalizeHistoryRepositoryReceipt(record) {
    if (!record || typeof record !== "object") return null;
    const receiptKind = String(record.receiptKind || "").trim();
    const repositoryDigest = normalizeHistoryRepositoryHex(record.repositoryDigest);
    const receiptDigest = normalizeHistoryRepositoryHex(record.receiptDigest);
    if (receiptKind !== HISTORY_REPOSITORY_RECEIPT_KIND || !repositoryDigest || !receiptDigest) {
      return null;
    }
    const warnings = Array.isArray(record.warnings)
      ? record.warnings.map((warning) => String(warning || "").slice(0, 180)).filter(Boolean).slice(0, 10)
      : [];
    const workspaceId = normalizeHistoryRepositoryWorkspaceId(record.workspaceId || record.remoteWorkspaceId || record.accountId);
    const acceptedAt = normalizePlanDate(record.acceptedAt);
    const verification = verifyHistoryRepositoryReceipt({
      ...record,
      sourcePackageId: String(record.sourcePackageId || "").trim().slice(0, 160),
      workspaceId,
      repositoryDigest,
      acceptedAt,
      receiptDigest
    }, {
      expectedWorkspaceId: record.expectedWorkspaceId || record.contextWorkspaceId || record.currentWorkspaceId || ""
    });
    return {
      receiptKind,
      id: String(record.id || `history-receipt-${receiptDigest.slice(0, 16)}`).slice(0, 120),
      remoteVersion: String(record.remoteVersion || "").trim().slice(0, 100),
      packageId: String(record.packageId || "").trim().slice(0, 160),
      sourcePackageId: String(record.sourcePackageId || "").trim().slice(0, 160),
      workspaceId,
      direction: ["check", "push", "pull"].includes(record.direction) ? record.direction : "",
      endpoint: String(record.endpoint || "").trim().slice(0, 420),
      receivedAt: normalizePlanDate(record.receivedAt),
      repositoryDigest,
      acceptedAt,
      recordCount: normalizeInteger(record.recordCount, 0, 0, 999999),
      warningCount: normalizeInteger(record.warningCount, warnings.length, 0, 99999),
      warnings,
      receiptDigest,
      verificationStatus: verification.status,
      verificationMessage: verification.message,
      verificationDigest: verification.digest,
      verificationExpectedDigest: verification.expectedDigest,
      verificationWorkspaceStatus: verification.workspaceStatus,
      message: String(record.message || "").slice(0, 220)
    };
  }

  function verifyHistoryRepositoryReceipt(receipt = {}, context = {}) {
    const sourcePackageId = String(receipt.sourcePackageId || "").trim();
    const workspaceId = normalizeHistoryRepositoryWorkspaceId(receipt.workspaceId || receipt.remoteWorkspaceId || receipt.accountId);
    const repositoryDigest = normalizeHistoryRepositoryHex(receipt.repositoryDigest);
    const acceptedAt = normalizePlanDate(receipt.acceptedAt);
    const receiptDigest = normalizeHistoryRepositoryHex(receipt.receiptDigest);
    const expectedWorkspaceId = context.expectedWorkspaceId
      ? normalizeHistoryRepositoryWorkspaceId(context.expectedWorkspaceId)
      : "";
    const expectedDigest = sourcePackageId && workspaceId && repositoryDigest && acceptedAt
      ? sha256StableJson({
        workspaceId,
        sourcePackageId,
        repositoryDigest,
        acceptedAt
      })
      : "";
    const digestOk = Boolean(expectedDigest && receiptDigest && expectedDigest === receiptDigest);
    const workspaceOk = !expectedWorkspaceId || expectedWorkspaceId === workspaceId;
    const status = digestOk && workspaceOk
      ? "verified"
      : digestOk
        ? "workspace-mismatch"
        : "digest-mismatch";
    const messages = {
      verified: "本机一致性校验通过：receiptDigest 与学习档案仓库声明字段一致，Workspace 匹配当前空间。",
      "workspace-mismatch": `本机一致性校验警告：receiptDigest 一致，但回执空间 ${workspaceId} 与当前空间 ${expectedWorkspaceId} 不一致。`,
      "digest-mismatch": "本机一致性校验失败：receiptDigest 无法按 workspaceId、sourcePackageId、repositoryDigest 和 acceptedAt 重算匹配。"
    };
    return {
      status,
      message: messages[status],
      digest: receiptDigest,
      expectedDigest,
      workspaceStatus: workspaceOk ? "matched" : "mismatch"
    };
  }

  function decorateHistoryRepositoryReceipt(receipt, context = {}) {
    return normalizeHistoryRepositoryReceipt({
      ...receipt,
      direction: context.direction || receipt?.direction,
      endpoint: context.endpoint || receipt?.endpoint,
      workspaceId: receipt?.workspaceId || context.workspaceId,
      expectedWorkspaceId: context.workspaceId || receipt?.expectedWorkspaceId,
      receivedAt: context.receivedAt || receipt?.receivedAt,
      message: context.message || receipt?.message
    });
  }

  function appendHistoryRepositoryReceipt(repository, receipt) {
    const normalized = normalizeHistoryRepositoryReceipt({
      ...receipt,
      expectedWorkspaceId: repository?.workspaceId || receipt?.expectedWorkspaceId
    });
    const existing = Array.isArray(repository?.receipts) ? repository.receipts : [];
    if (!normalized) {
      return existing
        .map((item) => normalizeHistoryRepositoryReceipt({
          ...item,
          expectedWorkspaceId: repository?.workspaceId || item?.expectedWorkspaceId
        }))
        .filter(Boolean)
        .slice(0, HISTORY_REPOSITORY_MAX_RECEIPTS);
    }
    const seen = new Set([getHistoryRepositoryReceiptKey(normalized)]);
    const next = [normalized];
    existing
      .map((item) => normalizeHistoryRepositoryReceipt({
        ...item,
        expectedWorkspaceId: repository?.workspaceId || item?.expectedWorkspaceId
      }))
      .filter(Boolean)
      .forEach((item) => {
        const key = getHistoryRepositoryReceiptKey(item);
        if (!key || seen.has(key)) return;
        seen.add(key);
        next.push(item);
      });
    return next.slice(0, HISTORY_REPOSITORY_MAX_RECEIPTS);
  }

  function getHistoryRepositoryReceiptKey(receipt) {
    if (!receipt) return "";
    return receipt.receiptDigest || `${receipt.repositoryDigest}:${receipt.packageId}:${receipt.sourcePackageId}:${receipt.acceptedAt}` || receipt.id || "";
  }

  function normalizeHistoryRepositoryHex(value) {
    const hex = String(value || "").trim().toLowerCase();
    return /^[a-f0-9]{64}$/.test(hex) ? hex : "";
  }

  function normalizeHistoryRepositoryFailureAction(action) {
    return ["check", "push", "pull"].includes(action) ? action : "";
  }

  function normalizeHistoryRepositoryFailure(record) {
    if (!record || typeof record !== "object") return null;
    const failedAt = normalizePlanDate(record.failedAt) || new Date().toISOString();
    const message = String(record.message || "").trim().slice(0, 220);
    if (!message) return null;
    const action = normalizeHistoryRepositoryFailureAction(record.action) || "check";
    return {
      id: String(record.id || `history-repository-failure-${action}-${failedAt.replace(/[-:.TZ]/g, "").slice(0, 14)}`).slice(0, 120),
      action,
      failedAt,
      retryAfter: normalizePlanDate(record.retryAfter),
      attemptCount: normalizeInteger(record.attemptCount, 0, 0, 9999),
      recordCount: normalizeInteger(record.recordCount, 0, 0, 99999),
      endpoint: String(record.endpoint || "").trim().slice(0, 240),
      workspaceId: normalizeHistoryRepositoryWorkspaceId(record.workspaceId),
      packageId: String(record.packageId || "").trim().slice(0, 120),
      packageDigest: normalizeHistoryRepositoryHex(record.packageDigest),
      failureKind: ["http", "network", "timeout", "validation", "response", "unknown"].includes(record.failureKind)
        ? record.failureKind
        : classifyHistoryRepositoryFailure(message),
      message
    };
  }

  function classifyHistoryRepositoryFailure(message = "") {
    const text = String(message || "");
    if (/超时|timeout/i.test(text)) return "timeout";
    if (/HTTP\s+\d+/.test(text)) return "http";
    if (/网络请求异常|Failed|Network/i.test(text)) return "network";
    if (/格式|结构|JSON|缺少|不是/.test(text)) return "validation";
    if (/没有返回|无响应|请求失败/.test(text)) return "response";
    return "unknown";
  }

  function getHistoryRepositoryRetryDelayMs(attemptCount, options = {}) {
    if (Number.isFinite(Number(options.retryDelayMs))) {
      return Math.max(0, Math.min(3600000, Math.round(Number(options.retryDelayMs))));
    }
    const attempt = normalizeInteger(attemptCount, 1, 1, 10);
    return Math.min(10 * 60 * 1000, HISTORY_REPOSITORY_RETRY_BASE_MS * Math.max(1, 2 ** (attempt - 1)));
  }

  function getHistoryRepositoryRetrySummary(repository = state.historyRepository) {
    const normalized = normalizeHistoryRepository(repository);
    if (!normalized.remoteFailureHistory.length || !normalized.remoteRetryAfter) {
      return "";
    }
    const latestFailure = normalized.remoteFailureHistory[0] || null;
    const actionLabel = {
      check: "检查",
      push: "推送",
      pull: "拉取"
    }[latestFailure?.action] || "同步";
    const reason = latestFailure?.failureKind === "timeout"
      ? "请求超时"
      : latestFailure?.failureKind === "http"
        ? "服务端拒收"
        : latestFailure?.failureKind === "network"
          ? "网络异常"
          : latestFailure?.failureKind === "validation"
            ? "结构校验失败"
            : "远端响应未完成";
    return `失败历史 ${normalized.remoteFailureHistory.length} 次，最近一次${actionLabel}为${reason}；建议 ${formatPlanDate(normalized.remoteRetryAfter)} 后重试。`;
  }

  function hasHistoryRepositoryPushRetryPending(repository = state.historyRepository) {
    const normalized = normalizeHistoryRepository(repository);
    const lastPushTime = Date.parse(normalized.lastRemotePushAt || "") || 0;
    return normalized.remoteFailureHistory.some((failure) => {
      if (failure.action !== "push") return false;
      const failedAt = Date.parse(failure.failedAt || "") || 0;
      return failedAt > lastPushTime;
    });
  }

  function normalizeReportRepository(record = {}) {
    const source = record && typeof record === "object" ? record : {};
    const lastRemoteDirection = ["check", "push", "pull"].includes(source.lastRemoteDirection)
      ? source.lastRemoteDirection
      : "";
    const workspaceId = normalizeReportRepositoryWorkspaceId(source.workspaceId || source.remoteWorkspaceId || source.accountId);
    const lastConflictReports = Array.isArray(source.lastConflictReports)
      ? source.lastConflictReports.map(normalizeReportRepositoryConflict).filter(Boolean).slice(0, REPORT_REPOSITORY_MAX_CONFLICTS)
      : [];
    const signedReceipts = normalizeReportRepositorySignedReceipts(source, { expectedWorkspaceId: workspaceId });
    const lastSignedReceipt = normalizeReportRepositorySignedReceipt({
      ...(source.lastSignedReceipt || source.signedReceipt || source.receipt || {}),
      expectedWorkspaceId: workspaceId
    })
      || signedReceipts[0]
      || null;
    return {
      mode: ["local-json", "remote-api"].includes(source.mode) ? source.mode : "local-json",
      remoteEndpoint: typeof source.remoteEndpoint === "string" ? source.remoteEndpoint.trim() : "",
      remoteToken: typeof source.remoteToken === "string" ? source.remoteToken.trim() : "",
      workspaceId,
      lastExportedAt: normalizePlanDate(source.lastExportedAt),
      lastImportedAt: normalizePlanDate(source.lastImportedAt),
      lastCheckedAt: normalizePlanDate(source.lastCheckedAt),
      lastRemoteSyncAt: normalizePlanDate(source.lastRemoteSyncAt),
      lastRemotePushAt: normalizePlanDate(source.lastRemotePushAt || (lastRemoteDirection === "push" ? source.lastRemoteSyncAt : null)),
      lastRemoteDirection,
      lastRemoteStatus: source.lastRemoteStatus ? String(source.lastRemoteStatus).slice(0, 180) : "",
      lastExportedReportCount: normalizeInteger(source.lastExportedReportCount, 0, 0, 99999),
      lastImportedReportCount: normalizeInteger(source.lastImportedReportCount, 0, 0, 99999),
      lastRemoteReportCount: normalizeInteger(source.lastRemoteReportCount, 0, 0, 99999),
      lastSkippedConflictCount: normalizeInteger(source.lastSkippedConflictCount, 0, 0, 99999),
      lastConflictReports,
      lastPackageId: source.lastPackageId ? String(source.lastPackageId) : null,
      lastSignedReceipt,
      signedReceipts: appendReportRepositorySignedReceipt({ signedReceipts, workspaceId }, lastSignedReceipt),
      lastRemoteFailureAt: normalizePlanDate(source.lastRemoteFailureAt),
      lastFailureAction: normalizeReportRepositoryFailureAction(source.lastFailureAction),
      remoteRetryAfter: normalizePlanDate(source.remoteRetryAfter),
      remoteFailureHistory: Array.isArray(source.remoteFailureHistory)
        ? source.remoteFailureHistory.map(normalizeReportRepositoryFailure).filter(Boolean).slice(0, REPORT_REPOSITORY_MAX_FAILURES)
        : [],
      lastError: source.lastError ? String(source.lastError).slice(0, 180) : ""
    };
  }

  function normalizeArtworkRepository(record = {}) {
    const source = record && typeof record === "object" ? record : {};
    const lastConflictRecords = Array.isArray(source.lastConflictRecords)
      ? source.lastConflictRecords.map(normalizeArtworkRepositoryConflict).filter(Boolean).slice(0, MAX_ARTWORK_REPOSITORY_CONFLICTS)
      : [];
    return {
      mode: "local-json",
      workspaceId: normalizeArtworkRepositoryWorkspaceId(source.workspaceId || source.remoteWorkspaceId || source.accountId),
      lastExportedAt: normalizePlanDate(source.lastExportedAt),
      lastImportedAt: normalizePlanDate(source.lastImportedAt),
      lastCheckedAt: normalizePlanDate(source.lastCheckedAt),
      lastExportedArtworkCount: normalizeInteger(source.lastExportedArtworkCount, 0, 0, 99999),
      lastExportedSessionCount: normalizeInteger(source.lastExportedSessionCount, 0, 0, 99999),
      lastImportedArtworkCount: normalizeInteger(source.lastImportedArtworkCount, 0, 0, 99999),
      lastImportedSessionCount: normalizeInteger(source.lastImportedSessionCount, 0, 0, 99999),
      lastCollectionExportedAt: normalizePlanDate(source.lastCollectionExportedAt),
      lastCollectionArtworkCount: normalizeInteger(source.lastCollectionArtworkCount, 0, 0, 99999),
      lastClassroomReviewExportedAt: normalizePlanDate(source.lastClassroomReviewExportedAt),
      lastClassroomReviewArtworkCount: normalizeInteger(source.lastClassroomReviewArtworkCount, 0, 0, 99999),
      lastClassroomReviewImportedAt: normalizePlanDate(source.lastClassroomReviewImportedAt),
      lastClassroomReviewImportedCount: normalizeInteger(source.lastClassroomReviewImportedCount, 0, 0, 99999),
      lastClassroomReviewSkippedCount: normalizeInteger(source.lastClassroomReviewSkippedCount, 0, 0, 99999),
      lastClassroomReviewPackageDigest: normalizeArtworkRepositoryHex(source.lastClassroomReviewPackageDigest || source.classroomReviewPackageDigest || source.reviewPackageDigest),
      lastClassroomReviewSummaryExportedAt: normalizePlanDate(source.lastClassroomReviewSummaryExportedAt),
      lastClassroomReviewSummaryCount: normalizeInteger(source.lastClassroomReviewSummaryCount, 0, 0, 99999),
      lastSkippedConflictCount: normalizeInteger(source.lastSkippedConflictCount, 0, 0, 99999),
      lastConflictRecords,
      lastPackageId: source.lastPackageId ? String(source.lastPackageId).slice(0, 160) : null,
      lastPackageDigest: normalizeArtworkRepositoryHex(source.lastPackageDigest || source.packageDigest || source.repositoryDigest),
      lastError: source.lastError ? String(source.lastError).slice(0, 220) : ""
    };
  }

  function normalizeArtworkRepositoryHex(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return /^[a-f0-9]{64}$/.test(normalized) ? normalized : "";
  }

  function normalizeArtworkRepositoryWorkspaceId(value) {
    const normalized = String(value || "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9_.:-]/g, "")
      .slice(0, 64);
    return normalized || ARTWORK_REPOSITORY_DEFAULT_WORKSPACE;
  }

  function normalizeArtworkRepositoryConflict(record) {
    if (!record || typeof record !== "object") return null;
    const id = String(record.id || "").trim();
    if (!id) return null;
    const type = ["artwork", "session"].includes(record.type) ? record.type : "artwork";
    const incomingRecord = normalizeArtworkRepositoryIncomingRecord(type, record.incomingRecord || record.remoteRecord);
    if (!incomingRecord) return null;
    return {
      id,
      type,
      conflictId: String(record.conflictId || `${type}:${id}`),
      typeLabel: type === "session" ? "关联练习" : "作品",
      title: String(record.title || record.localTitle || record.incomingTitle || record.remoteTitle || id).slice(0, 140),
      localTitle: String(record.localTitle || record.title || id).slice(0, 140),
      incomingTitle: String(record.incomingTitle || record.remoteTitle || record.title || id).slice(0, 140),
      localUpdatedAt: normalizePlanDate(record.localUpdatedAt),
      incomingUpdatedAt: normalizePlanDate(record.incomingUpdatedAt || record.remoteUpdatedAt),
      detectedAt: normalizePlanDate(record.detectedAt) || new Date().toISOString(),
      fieldDiffs: Array.isArray(record.fieldDiffs)
        ? record.fieldDiffs.map(normalizeArtworkRepositoryFieldDiff).filter(Boolean).slice(0, 12)
        : [],
      incomingRecord
    };
  }

  function normalizeArtworkRepositoryIncomingRecord(type, record) {
    if (type === "session") return normalizeSession(record);
    return normalizeArtwork(record);
  }

  function normalizeArtworkRepositoryFieldDiff(record) {
    if (!record || typeof record !== "object") return null;
    const field = String(record.field || "").trim();
    if (!field) return null;
    const incomingValue = record.incomingValue ?? record.remoteValue;
    return {
      field,
      label: String(record.label || HISTORY_REPOSITORY_CONFLICT_LABELS[field] || field).slice(0, 32),
      localValue: formatPlanRepositoryMergeValue(record.localValue),
      incomingValue: formatPlanRepositoryMergeValue(incomingValue),
      remoteValue: formatPlanRepositoryMergeValue(incomingValue)
    };
  }

  function normalizeReportRepositoryWorkspaceId(value) {
    const normalized = String(value || "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9_.:-]/g, "")
      .slice(0, 64);
    return normalized || REPORT_REPOSITORY_DEFAULT_WORKSPACE;
  }

  function normalizeReportRepositorySignedReceipts(source = {}, context = {}) {
    const candidates = Array.isArray(source.signedReceipts)
      ? source.signedReceipts
      : Array.isArray(source.receipts)
        ? source.receipts
        : [];
    const seen = new Set();
    const receipts = [];
    candidates
      .map((receipt) => normalizeReportRepositorySignedReceipt({
        ...receipt,
        expectedWorkspaceId: context.expectedWorkspaceId || source.workspaceId || source.remoteWorkspaceId || source.accountId
      }))
      .filter(Boolean)
      .forEach((receipt) => {
        const key = receipt.signature || receipt.receiptDigest || receipt.id;
        if (!key || seen.has(key)) return;
        seen.add(key);
        receipts.push(receipt);
      });
    return receipts.slice(0, REPORT_REPOSITORY_MAX_RECEIPTS);
  }

  function normalizeReportRepositorySignedReceipt(record) {
    if (!record || typeof record !== "object") return null;
    const receiptKind = String(record.receiptKind || "").trim();
    const signatureAlgorithm = String(record.signatureAlgorithm || "").trim().slice(0, 40);
    const signingKeyId = String(record.signingKeyId || "").trim().slice(0, 80);
    const repositoryDigest = normalizeReportRepositoryHex(record.repositoryDigest);
    const receiptDigest = normalizeReportRepositoryHex(record.receiptDigest);
    const signature = normalizeReportRepositoryHex(record.signature);
    if (receiptKind !== REPORT_REPOSITORY_RECEIPT_KIND || !signatureAlgorithm || !signingKeyId || !repositoryDigest || !receiptDigest || !signature) {
      return null;
    }
    const signedFields = Array.isArray(record.signedFields)
      ? record.signedFields.map((field) => String(field || "").trim()).filter(Boolean).slice(0, 16)
      : [];
    const workspaceId = normalizeReportRepositoryWorkspaceId(record.workspaceId || record.remoteWorkspaceId || record.accountId);
    const verification = verifyReportRepositorySignedReceipt({
      ...record,
      receiptKind,
      sourcePackageId: String(record.sourcePackageId || "").trim().slice(0, 120),
      workspaceId,
      repositoryDigest,
      acceptedAt: normalizePlanDate(record.acceptedAt),
      receiptDigest
    }, {
      expectedWorkspaceId: record.expectedWorkspaceId || record.contextWorkspaceId || record.currentWorkspaceId || ""
    });
    return {
      receiptKind,
      id: String(record.id || `report-receipt-${signature.slice(0, 16)}`).slice(0, 120),
      remoteVersion: String(record.remoteVersion || "").trim().slice(0, 80),
      packageId: String(record.packageId || "").trim().slice(0, 120),
      sourcePackageId: String(record.sourcePackageId || "").trim().slice(0, 120),
      workspaceId,
      direction: ["check", "push", "pull"].includes(record.direction) ? record.direction : "",
      endpoint: String(record.endpoint || "").trim().slice(0, 240),
      receivedAt: normalizePlanDate(record.receivedAt),
      repositoryDigest,
      acceptedAt: normalizePlanDate(record.acceptedAt),
      reportCount: normalizeInteger(record.reportCount, 0, 0, 99999),
      warningCount: normalizeInteger(record.warningCount, 0, 0, 99999),
      warnings: Array.isArray(record.warnings)
        ? record.warnings.map((warning) => String(warning || "").slice(0, 160)).filter(Boolean).slice(0, 8)
        : [],
      receiptDigest,
      signatureAlgorithm,
      signingKeyId,
      signedFields,
      message: String(record.message || "").slice(0, 180),
      verificationStatus: verification.status,
      verificationMessage: verification.message,
      verificationDigest: verification.digest,
      verificationExpectedDigest: verification.expectedDigest,
      verificationWorkspaceStatus: verification.workspaceStatus,
      signature
    };
  }

  function verifyReportRepositorySignedReceipt(receipt = {}, context = {}) {
    const sourcePackageId = String(receipt.sourcePackageId || "").trim();
    const workspaceId = normalizeReportRepositoryWorkspaceId(receipt.workspaceId || receipt.remoteWorkspaceId || receipt.accountId);
    const repositoryDigest = normalizeReportRepositoryHex(receipt.repositoryDigest);
    const acceptedAt = normalizePlanDate(receipt.acceptedAt);
    const receiptDigest = normalizeReportRepositoryHex(receipt.receiptDigest);
    const expectedWorkspaceId = context.expectedWorkspaceId
      ? normalizeReportRepositoryWorkspaceId(context.expectedWorkspaceId)
      : "";
    const expectedDigest = sourcePackageId && workspaceId && repositoryDigest && acceptedAt
      ? sha256StableJson({
        sourcePackageId,
        workspaceId,
        repositoryDigest,
        acceptedAt
      })
      : "";
    const digestOk = Boolean(expectedDigest && receiptDigest && expectedDigest === receiptDigest);
    const workspaceOk = !expectedWorkspaceId || expectedWorkspaceId === workspaceId;
    const status = digestOk && workspaceOk
      ? "verified"
      : digestOk
        ? "workspace-mismatch"
        : "digest-mismatch";
    const messages = {
      verified: "本机一致性校验通过：receiptDigest 与声明字段一致，Workspace 匹配当前空间。",
      "workspace-mismatch": `本机一致性校验警告：receiptDigest 一致，但回执空间 ${workspaceId} 与当前空间 ${expectedWorkspaceId} 不一致。`,
      "digest-mismatch": "本机一致性校验失败：receiptDigest 无法按 sourcePackageId、workspaceId、repositoryDigest 和 acceptedAt 重算匹配。"
    };
    return {
      status,
      message: messages[status],
      digest: receiptDigest,
      expectedDigest,
      workspaceStatus: workspaceOk ? "matched" : "mismatch"
    };
  }

  function decorateReportRepositorySignedReceipt(receipt, context = {}) {
    const normalized = normalizeReportRepositorySignedReceipt({
      ...receipt,
      direction: context.direction || receipt?.direction,
      endpoint: context.endpoint || receipt?.endpoint,
      workspaceId: context.workspaceId || receipt?.workspaceId,
      expectedWorkspaceId: context.workspaceId || receipt?.expectedWorkspaceId,
      receivedAt: context.receivedAt || receipt?.receivedAt,
      message: context.message || receipt?.message
    });
    return normalized;
  }

  function appendReportRepositorySignedReceipt(repository, receipt) {
    const normalized = normalizeReportRepositorySignedReceipt({
      ...receipt,
      expectedWorkspaceId: repository?.workspaceId || receipt?.expectedWorkspaceId
    });
    const existing = Array.isArray(repository?.signedReceipts) ? repository.signedReceipts : [];
    if (!normalized) {
      return existing
        .map((item) => normalizeReportRepositorySignedReceipt({
          ...item,
          expectedWorkspaceId: repository?.workspaceId || item?.expectedWorkspaceId
        }))
        .filter(Boolean)
        .slice(0, REPORT_REPOSITORY_MAX_RECEIPTS);
    }
    const seen = new Set([normalized.signature]);
    const next = [normalized];
    existing
      .map((item) => item && normalizeReportRepositorySignedReceipt({
        ...item,
        expectedWorkspaceId: repository?.workspaceId || item?.expectedWorkspaceId
      }))
      .filter(Boolean)
      .forEach((item) => {
        const key = item.signature || item.receiptDigest || item.id;
        if (!key || seen.has(key)) return;
        seen.add(key);
        next.push(item);
      });
    return next.slice(0, REPORT_REPOSITORY_MAX_RECEIPTS);
  }

  function normalizeReportRepositoryHex(value) {
    const hex = String(value || "").trim().toLowerCase();
    return /^[a-f0-9]{64}$/.test(hex) ? hex : "";
  }

  function normalizeReportRepositoryFailureAction(action) {
    return ["check", "push", "pull"].includes(action) ? action : "";
  }

  function normalizeReportRepositoryFailure(record) {
    if (!record || typeof record !== "object") return null;
    const failedAt = normalizePlanDate(record.failedAt) || new Date().toISOString();
    const message = String(record.message || "").trim().slice(0, 220);
    if (!message) return null;
    const action = normalizeReportRepositoryFailureAction(record.action) || "check";
    return {
      id: String(record.id || `report-repository-failure-${action}-${failedAt.replace(/[-:.TZ]/g, "").slice(0, 14)}`).slice(0, 120),
      action,
      failedAt,
      retryAfter: normalizePlanDate(record.retryAfter),
      attemptCount: normalizeInteger(record.attemptCount, 0, 0, 9999),
      reportCount: normalizeInteger(record.reportCount, 0, 0, 99999),
      endpoint: String(record.endpoint || "").trim().slice(0, 240),
      workspaceId: normalizeReportRepositoryWorkspaceId(record.workspaceId),
      packageId: String(record.packageId || "").trim().slice(0, 120),
      packageDigest: normalizeReportRepositoryHex(record.packageDigest),
      failureKind: ["http", "network", "timeout", "validation", "response", "unknown"].includes(record.failureKind)
        ? record.failureKind
        : classifyReportRepositoryFailure(message),
      message
    };
  }

  function classifyReportRepositoryFailure(message = "") {
    const text = String(message || "");
    if (/超时|timeout/i.test(text)) return "timeout";
    if (/HTTP\s+\d+/.test(text)) return "http";
    if (/网络请求异常|Failed|Network/i.test(text)) return "network";
    if (/格式|结构|JSON|缺少|不是/.test(text)) return "validation";
    if (/没有返回|无响应|请求失败/.test(text)) return "response";
    return "unknown";
  }

  function getReportRepositoryRetryDelayMs(attemptCount, options = {}) {
    if (Number.isFinite(Number(options.retryDelayMs))) {
      return Math.max(0, Math.min(3600000, Math.round(Number(options.retryDelayMs))));
    }
    const attempt = normalizeInteger(attemptCount, 1, 1, 10);
    return Math.min(10 * 60 * 1000, REPORT_REPOSITORY_RETRY_BASE_MS * Math.max(1, 2 ** (attempt - 1)));
  }

  function getReportRepositoryRetrySummary(repository = state.reportRepository) {
    const normalized = normalizeReportRepository(repository);
    if (!normalized.remoteFailureHistory.length || !normalized.remoteRetryAfter) {
      return "";
    }
    const latestFailure = normalized.remoteFailureHistory[0] || null;
    const actionLabel = {
      check: "检查",
      push: "推送",
      pull: "拉取"
    }[latestFailure?.action] || "同步";
    const reason = latestFailure?.failureKind === "timeout"
      ? "请求超时"
      : latestFailure?.failureKind === "http"
        ? "服务端拒收"
        : latestFailure?.failureKind === "network"
          ? "网络异常"
          : latestFailure?.failureKind === "validation"
            ? "结构校验失败"
            : "远端响应未完成";
    return `失败历史 ${normalized.remoteFailureHistory.length} 次，最近一次${actionLabel}为${reason}；建议 ${formatPlanDate(normalized.remoteRetryAfter)} 后重试。`;
  }

  function hasReportRepositoryPushRetryPending(repository = state.reportRepository) {
    const normalized = normalizeReportRepository(repository);
    const lastPushTime = Date.parse(normalized.lastRemotePushAt || "") || 0;
    return normalized.remoteFailureHistory.some((failure) => {
      if (failure.action !== "push") return false;
      const failedAt = Date.parse(failure.failedAt || "") || 0;
      return failedAt > lastPushTime;
    });
  }

  function normalizeReportRepositoryConflict(record) {
    if (!record || typeof record !== "object") return null;
    const id = String(record.id || "").trim();
    if (!id) return null;
    const remoteReport = normalizeReport(record.remoteReport || record.remoteRecord);
    if (!remoteReport) return null;
    return {
      id,
      conflictId: String(record.conflictId || `report:${id}`),
      typeLabel: "报告",
      title: String(record.title || record.remoteTitle || record.localTitle || id).slice(0, 120),
      localTitle: String(record.localTitle || record.title || id).slice(0, 120),
      remoteTitle: String(record.remoteTitle || record.title || id).slice(0, 120),
      localUpdatedAt: normalizePlanDate(record.localUpdatedAt),
      remoteUpdatedAt: normalizePlanDate(record.remoteUpdatedAt),
      detectedAt: normalizePlanDate(record.detectedAt) || new Date().toISOString(),
      fieldDiffs: Array.isArray(record.fieldDiffs)
        ? record.fieldDiffs.map(normalizeReportRepositoryFieldDiff).filter(Boolean).slice(0, 12)
        : [],
      remoteReport
    };
  }

  function normalizeReportRepositoryFieldDiff(record) {
    if (!record || typeof record !== "object") return null;
    const field = String(record.field || "").trim();
    if (!field) return null;
    return {
      field,
      label: String(record.label || REPORT_REPOSITORY_CONFLICT_LABELS[field] || field).slice(0, 32),
      localValue: formatPlanRepositoryMergeValue(record.localValue),
      remoteValue: formatPlanRepositoryMergeValue(record.remoteValue)
    };
  }

  function normalizeHistoryRepositoryConflict(record) {
    if (!record || typeof record !== "object") return null;
    const id = String(record.id || "").trim();
    const type = ["session", "artwork", "report", "stage"].includes(record.type) ? record.type : "";
    if (!id || !type) return null;
    const remoteRecord = normalizeHistoryConflictRemoteRecord(type, record.remoteRecord);
    if (!remoteRecord) return null;
    return {
      id,
      type,
      conflictId: String(record.conflictId || `${type}:${id}`),
      typeLabel: HISTORY_REPOSITORY_CONFLICT_LABELS[type] || type,
      title: String(record.title || record.remoteTitle || record.localTitle || id).slice(0, 120),
      localTitle: String(record.localTitle || record.title || id).slice(0, 120),
      remoteTitle: String(record.remoteTitle || record.title || id).slice(0, 120),
      localUpdatedAt: normalizePlanDate(record.localUpdatedAt),
      remoteUpdatedAt: normalizePlanDate(record.remoteUpdatedAt),
      detectedAt: normalizePlanDate(record.detectedAt) || new Date().toISOString(),
      fieldDiffs: Array.isArray(record.fieldDiffs)
        ? record.fieldDiffs.map(normalizeHistoryRepositoryFieldDiff).filter(Boolean).slice(0, 12)
        : [],
      remoteRecord
    };
  }

  function normalizeHistoryConflictRemoteRecord(type, record) {
    if (type === "session") return normalizeSession(record);
    if (type === "artwork") return normalizeArtwork(record);
    if (type === "report") return normalizeReport(record);
    if (type === "stage") return normalizeStageRecord(record);
    return null;
  }

  function normalizeHistoryRepositoryFieldDiff(record) {
    if (!record || typeof record !== "object") return null;
    const field = String(record.field || "").trim();
    if (!field) return null;
    return {
      field,
      label: String(record.label || HISTORY_REPOSITORY_CONFLICT_LABELS[field] || field).slice(0, 32),
      localValue: formatPlanRepositoryMergeValue(record.localValue),
      remoteValue: formatPlanRepositoryMergeValue(record.remoteValue)
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

  function makePlanCycleNextAt(baseValue = new Date(), intervalDays = DEFAULT_PLAN_CYCLE_DAYS) {
    const date = new Date(baseValue || new Date());
    if (Number.isNaN(date.getTime())) {
      date.setTime(Date.now());
    }
    date.setDate(date.getDate() + normalizeInteger(intervalDays, DEFAULT_PLAN_CYCLE_DAYS, 1, 60));
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
    const stages = Array.isArray(records.stages) ? records.stages.map(normalizeStageRecord).filter(Boolean) : [];
    const deletedCount = sessions.length + artworks.length + reports.length + stages.length;
    if (!deletedCount) return null;

    return {
      id: String(record.id || makeId("trash")),
      title: String(record.title || `已删除 ${deletedCount} 条学习档案`).slice(0, 72),
      deletedAt: Number.isFinite(Date.parse(record.deletedAt)) ? String(record.deletedAt) : new Date().toISOString(),
      records: { sessions, artworks, reports, stages },
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

  function normalizeHistoryBatchReceipt(record) {
    if (!record || typeof record !== "object") return null;
    const action = String(record.action || "history-action").slice(0, 48);
    const createdAt = Number.isFinite(Date.parse(record.createdAt))
      ? String(record.createdAt)
      : new Date().toISOString();
    const counts = record.counts && typeof record.counts === "object" ? record.counts : {};
    const selectedIds = Array.isArray(record.selectedIds)
      ? record.selectedIds.map((id) => String(id || "").trim()).filter(Boolean).slice(0, 60)
      : [];
    const recordCount = normalizeInteger(
      record.recordCount,
      normalizeInteger(counts.practice, 0, 0, 9999)
        + normalizeInteger(counts.artwork, 0, 0, 9999)
        + normalizeInteger(counts.report, 0, 0, 9999)
        + normalizeInteger(counts.stage, 0, 0, 9999),
      0,
      9999
    );

    return {
      id: String(record.id || makeId("history-batch")),
      action,
      label: String(record.label || formatHistoryBatchActionLabel(action)).slice(0, 80),
      status: String(record.status || "success").slice(0, 24),
      createdAt,
      recordCount,
      counts: {
        practice: normalizeInteger(counts.practice, 0, 0, 9999),
        artwork: normalizeInteger(counts.artwork, 0, 0, 9999),
        report: normalizeInteger(counts.report, 0, 0, 9999),
        stage: normalizeInteger(counts.stage, 0, 0, 9999)
      },
      selectedIds,
      filename: record.filename ? String(record.filename).slice(0, 160) : "",
      trashId: record.trashId ? String(record.trashId).slice(0, 120) : "",
      message: String(record.message || "").slice(0, 240),
      boundary: String(record.boundary || "学习档案批量操作回执保存在当前浏览器本机状态中，不是服务端不可篡改审计。").slice(0, 240)
    };
  }

  function formatHistoryBatchActionLabel(action) {
    return {
      export: "导出所选",
      delete: "移入回收站",
      restore: "恢复回收站",
      "trash-delete": "永久删除",
      "trash-clear": "清空回收站"
    }[action] || "学习档案操作";
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

  function normalizeLectureService(record = {}) {
    const source = record && typeof record === "object" ? record : {};
    const mode = ["local-tts", "local-text-timer", "remote-ai-audio", "remote-ai-text"].includes(source.mode)
      ? source.mode
      : "local-tts";
    const status = ["idle", "ready", "playing", "fallback", "complete", "error"].includes(source.status)
      ? source.status
      : "idle";
    return {
      mode,
      status,
      supported: source.supported === true,
      voiceName: source.voiceName ? String(source.voiceName).slice(0, 120) : "",
      lastMessage: source.lastMessage ? String(source.lastMessage).slice(0, 220) : "",
      lastStepTitle: source.lastStepTitle ? String(source.lastStepTitle).slice(0, 80) : "",
      spokenStepCount: normalizeInteger(source.spokenStepCount, 0, 0, 9999),
      fallbackStepCount: normalizeInteger(source.fallbackStepCount, 0, 0, 9999),
      errorCount: normalizeInteger(source.errorCount, 0, 0, 9999),
      lastStartedAt: normalizePlanDate(source.lastStartedAt),
      lastPlayedAt: normalizePlanDate(source.lastPlayedAt),
      lastFallbackAt: normalizePlanDate(source.lastFallbackAt),
      lastCompletedAt: normalizePlanDate(source.lastCompletedAt),
      lastCheckedAt: normalizePlanDate(source.lastCheckedAt)
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
    const glyph = String(source.glyph || record.glyph || "永").slice(0, 16);
    const strokeCount = normalizeInteger(rawEvidence.strokeCount ?? record.strokeCount, 0, 0, 999);
    const pointCount = normalizeInteger(rawEvidence.pointCount ?? record.pointCount, 0, 0, 99999);
    const targetStrokeNames = normalizeStrokeNameList(rawEvidence.targetStrokeNames || source.targetStrokeNames);
    const targetStrokeCount = normalizeInteger(rawEvidence.targetStrokeCount, Math.max(1, targetStrokeNames.length || strokeCount || 8), 1, 80);
    const fallbackCoverage = getBoundsCoveragePercent(record.bounds);
    const algorithmVersion = String(source.algorithmVersion || source.kind || DEFAULT_SCORE_ALGORITHM_VERSION).slice(0, 80);
    const copybook = String(source.copybook || rawEvidence.copybook || record.copybook || "").slice(0, 32);
    const pressurePointCount = normalizeInteger(rawEvidence.pressurePointCount, 0, 0, 99999);
    const strokeMatches = normalizeStrokeMatchList(rawEvidence.strokeMatches);
    const strokeOrderWarnings = normalizeStringList(rawEvidence.strokeOrderWarnings);
    const pathErrorHotspots = normalizePathErrorHotspots(rawEvidence.pathErrorHotspots);
    const strokePathErrors = normalizeStrokePathErrors(rawEvidence.strokePathErrors);
    const normalized = {
      kind: String(source.kind || algorithmVersion || DEFAULT_SCORE_ALGORITHM_VERSION).slice(0, 80),
      algorithmVersion,
      label: String(source.label || "基础练习评分"),
      disclaimer: String(source.disclaimer || "该分数来自浏览器本机启发式算法，用于练习复盘，不等同于专业书法评级。"),
      glyph,
      copybook,
      targetStrokeNames,
      weights: normalizeScoreWeights(source.weights),
      evidence: {
        copybook,
        targetStrokeCount,
        targetStrokeNames,
        strokeOrderMatchPercent: normalizeInteger(rawEvidence.strokeOrderMatchPercent, 0, 0, 100),
        strokeOrderCoveragePercent: normalizeInteger(rawEvidence.strokeOrderCoveragePercent, 0, 0, 100),
        strokeShapeMatchPercent: normalizeInteger(rawEvidence.strokeShapeMatchPercent, 0, 0, 100),
        strokeOrderVerdict: normalizeStrokeOrderVerdict(rawEvidence.strokeOrderVerdict),
        strokeOrderWarnings,
        strokeMatches,
        pathFitPercent: normalizeInteger(rawEvidence.pathFitPercent, 0, 0, 100),
        pathErrorPercent: normalizeInteger(rawEvidence.pathErrorPercent, 0, 0, 100),
        pathErrorSampleCount: normalizeInteger(rawEvidence.pathErrorSampleCount, 0, 0, 99999),
        pathErrorHotspots,
        strokePathErrors,
        strokeCount,
        strokeCountDelta: normalizeInteger(rawEvidence.strokeCountDelta, Math.abs(strokeCount - targetStrokeCount), 0, 999),
        pointCount,
        coveragePercent: normalizeInteger(rawEvidence.coveragePercent, fallbackCoverage, 0, 100),
        centerOffsetPercent: normalizeInteger(rawEvidence.centerOffsetPercent, getBoundsCenterOffsetPercent(record.bounds), 0, 100),
        totalLength: normalizeNumber(rawEvidence.totalLength, 0, 0, 999),
        segmentVariationPercent: normalizeInteger(rawEvidence.segmentVariationPercent, 0, 0, 300),
        longBreaks: normalizeInteger(rawEvidence.longBreaks, 0, 0, 999),
        pressureAvailable: Boolean(rawEvidence.pressureAvailable) || pressurePointCount > 0,
        pressurePointCount,
        pressureSpreadPercent: normalizeInteger(rawEvidence.pressureSpreadPercent, 0, 0, 100),
        pressureAveragePercent: normalizeInteger(rawEvidence.pressureAveragePercent, 0, 0, 100),
        pressureMinPercent: normalizeInteger(rawEvidence.pressureMinPercent, 0, 0, 100),
        pressureMaxPercent: normalizeInteger(rawEvidence.pressureMaxPercent, 0, 0, 100),
        boundsWidthPercent: normalizeInteger(rawEvidence.boundsWidthPercent, getBoundsWidthPercent(record.bounds), 0, 100),
        boundsHeightPercent: normalizeInteger(rawEvidence.boundsHeightPercent, getBoundsHeightPercent(record.bounds), 0, 100)
      },
      reasons: normalizeScoreReasons(source.reasons, metrics, {
        targetStrokeCount,
        targetStrokeNames,
        strokeOrderMatchPercent: normalizeInteger(rawEvidence.strokeOrderMatchPercent, 0, 0, 100),
        strokeOrderCoveragePercent: normalizeInteger(rawEvidence.strokeOrderCoveragePercent, 0, 0, 100),
        pathFitPercent: normalizeInteger(rawEvidence.pathFitPercent, 0, 0, 100),
        pathErrorPercent: normalizeInteger(rawEvidence.pathErrorPercent, 0, 0, 100),
        strokeCount,
        pointCount,
        pressurePointCount
      })
    };
    return normalized;
  }

  function normalizeReportScoreEvidenceSummary(value) {
    const source = value && typeof value === "object" ? value : null;
    if (!source) return null;
    const targetStrokeNames = normalizeStrokeNameList(source.targetStrokeNames);
    const hotspots = normalizePathErrorHotspots(source.hotspots || source.pathErrorHotspots);
    const strokePathErrors = normalizeStrokePathErrors(source.strokePathErrors);
    const strokeOrderWarnings = normalizeStringList(source.strokeOrderWarnings);
    const weakestSource = source.weakestReason && typeof source.weakestReason === "object" ? source.weakestReason : null;
    const weakestReason = weakestSource
      ? {
          key: String(weakestSource.key || "").slice(0, 32),
          label: String(weakestSource.label || weakestSource.key || "最低项").slice(0, 24),
          score: normalizeScore(weakestSource.score, 0),
          evidence: String(weakestSource.evidence || "").slice(0, 180)
        }
      : null;
    const summary = String(source.summary || "").trim().replace(/\s+/g, " ").slice(0, 260);
    const strokeCount = normalizeInteger(source.strokeCount, 0, 0, 999);
    const pointCount = normalizeInteger(source.pointCount, 0, 0, 99999);
    const hasEvidence = strokeCount > 0
      || pointCount > 0
      || targetStrokeNames.length > 0
      || hotspots.length > 0
      || strokePathErrors.length > 0
      || normalizeInteger(source.pathFitPercent, 0, 0, 100) > 0
      || normalizeInteger(source.pressurePointCount, 0, 0, 99999) > 0;
    if (!hasEvidence) return null;
    return {
      kind: "mr-calligraphy-score-evidence-summary-v1",
      sourceType: ["session", "artwork"].includes(source.sourceType) ? source.sourceType : "session",
      sourceId: String(source.sourceId || "").slice(0, 120),
      label: String(source.label || "基础练习评分").slice(0, 80),
      algorithmVersion: String(source.algorithmVersion || DEFAULT_SCORE_ALGORITHM_VERSION).slice(0, 80),
      disclaimer: String(source.disclaimer || "该摘要来自浏览器本机启发式评分证据，用于报告复盘。").slice(0, 180),
      glyph: String(source.glyph || "永").slice(0, 16),
      copybook: String(source.copybook || "").slice(0, 32),
      score: normalizeScore(source.score, 0),
      strokeCount,
      pointCount,
      targetStrokeCount: normalizeInteger(source.targetStrokeCount, Math.max(1, targetStrokeNames.length || strokeCount || 1), 1, 80),
      targetStrokeNames,
      strokeOrderMatchPercent: normalizeInteger(source.strokeOrderMatchPercent, 0, 0, 100),
      strokeOrderCoveragePercent: normalizeInteger(source.strokeOrderCoveragePercent, 0, 0, 100),
      strokeShapeMatchPercent: normalizeInteger(source.strokeShapeMatchPercent, 0, 0, 100),
      pathFitPercent: normalizeInteger(source.pathFitPercent, 0, 0, 100),
      pathErrorPercent: normalizeInteger(source.pathErrorPercent, 0, 0, 100),
      pathErrorSampleCount: normalizeInteger(source.pathErrorSampleCount, 0, 0, 99999),
      coveragePercent: normalizeInteger(source.coveragePercent, 0, 0, 100),
      centerOffsetPercent: normalizeInteger(source.centerOffsetPercent, 0, 0, 100),
      pressurePointCount: normalizeInteger(source.pressurePointCount, 0, 0, 99999),
      pressureSpreadPercent: normalizeInteger(source.pressureSpreadPercent, 0, 0, 100),
      hotspots,
      strokePathErrors,
      strokeOrderWarnings,
      weakestReason,
      summary
    };
  }

  function createReportScoreEvidenceSummary(record, sourceType = "session") {
    if (!record || typeof record !== "object") return null;
    const scoreEvidence = normalizeScoreEvidence(record.scoreEvidence, record);
    const evidence = scoreEvidence.evidence || {};
    const reasons = Array.isArray(scoreEvidence.reasons) ? scoreEvidence.reasons : [];
    const weakestReason = reasons
      .filter((reason) => reason && Number.isFinite(Number(reason.score)))
      .sort((a, b) => Number(a.score) - Number(b.score))[0] || null;
    return normalizeReportScoreEvidenceSummary({
      sourceType,
      sourceId: record.id || "",
      label: scoreEvidence.label,
      algorithmVersion: scoreEvidence.algorithmVersion || scoreEvidence.kind,
      disclaimer: scoreEvidence.disclaimer,
      glyph: scoreEvidence.glyph || record.glyph,
      copybook: scoreEvidence.copybook || evidence.copybook || record.copybook,
      score: record.score,
      strokeCount: evidence.strokeCount ?? record.strokeCount,
      pointCount: evidence.pointCount ?? record.pointCount,
      targetStrokeCount: evidence.targetStrokeCount,
      targetStrokeNames: evidence.targetStrokeNames || scoreEvidence.targetStrokeNames,
      strokeOrderMatchPercent: evidence.strokeOrderMatchPercent,
      strokeOrderCoveragePercent: evidence.strokeOrderCoveragePercent,
      strokeShapeMatchPercent: evidence.strokeShapeMatchPercent,
      pathFitPercent: evidence.pathFitPercent,
      pathErrorPercent: evidence.pathErrorPercent,
      pathErrorSampleCount: evidence.pathErrorSampleCount,
      pathErrorHotspots: evidence.pathErrorHotspots,
      strokePathErrors: evidence.strokePathErrors,
      strokeOrderWarnings: evidence.strokeOrderWarnings,
      coveragePercent: evidence.coveragePercent,
      centerOffsetPercent: evidence.centerOffsetPercent,
      pressurePointCount: evidence.pressurePointCount,
      pressureSpreadPercent: evidence.pressureSpreadPercent,
      weakestReason,
      summary: summarizeScoreEvidence(scoreEvidence)
    });
  }

  function getReportScoreEvidenceSummary(report, latestSession = null, latestArtwork = null) {
    const stored = normalizeReportScoreEvidenceSummary(report?.scoreEvidenceSummary);
    if (stored) return stored;
    return createReportScoreEvidenceSummary(latestArtwork, "artwork")
      || createReportScoreEvidenceSummary(latestSession, "session");
  }

  function normalizeScoreService(record = {}, records = []) {
    const source = record && typeof record === "object" ? record : {};
    const scoredRecords = getScoredPracticeRecords(records);
    const latestRecord = scoredRecords.at(-1) || null;
    const latestEvidence = latestRecord ? normalizeScoreEvidence(latestRecord.scoreEvidence, latestRecord) : null;
    const mode = ["local-heuristic", "remote-professional", "remote-ai"].includes(source.mode)
      ? source.mode
      : "local-heuristic";
    const fallbackStatus = latestRecord ? "scored" : "idle";
    const sourceHasServiceHistory = normalizeScore(source.lastScore, 0) > 0
      || normalizeInteger(source.scoredSessionCount, 0, 0, 99999) > 0
      || normalizeInteger(source.totalPointCount, 0, 0, 9999999) > 0
      || Boolean(source.lastEvidenceSummary);
    const status = ["idle", "ready", "scored", "no-data", "error"].includes(source.status) && (sourceHasServiceHistory || !latestRecord)
      ? source.status
      : fallbackStatus;
    const scoredFallback = scoredRecords.length;
    const strokeFallback = scoredRecords.reduce((sum, item) => sum + normalizeInteger(item.strokeCount, 0, 0, 999), 0);
    const pointFallback = scoredRecords.reduce((sum, item) => sum + normalizeInteger(item.pointCount, 0, 0, 99999), 0);
    const lastScore = normalizeScore(source.lastScore, latestRecord?.score || 0);
    const latestSummary = latestEvidence ? summarizeScoreEvidence(latestEvidence) : "";
    return {
      mode,
      status,
      algorithmVersion: String(source.algorithmVersion || latestEvidence?.algorithmVersion || latestEvidence?.kind || DEFAULT_SCORE_ALGORITHM_VERSION).slice(0, 80),
      lastScore,
      lastGlyph: String(source.lastGlyph || latestRecord?.glyph || "").slice(0, 16),
      lastEvidenceSummary: String(source.lastEvidenceSummary || latestSummary).slice(0, 220),
      lastMessage: String(source.lastMessage || "").slice(0, 220),
      scoredSessionCount: normalizeInteger(source.scoredSessionCount, scoredFallback, 0, 99999),
      totalStrokeCount: normalizeInteger(source.totalStrokeCount, strokeFallback, 0, 999999),
      totalPointCount: normalizeInteger(source.totalPointCount, pointFallback, 0, 9999999),
      errorCount: normalizeInteger(source.errorCount, 0, 0, 9999),
      lastScoredAt: normalizePlanDate(source.lastScoredAt || latestRecord?.snapshotAt || latestRecord?.endedAt),
      lastCheckedAt: normalizePlanDate(source.lastCheckedAt)
    };
  }

  function getScoredPracticeRecords(records = []) {
    return (Array.isArray(records) ? records : [])
      .filter((record) => record && typeof record === "object")
      .filter((record) => normalizeScore(record.score, 0) > 0 && normalizeInteger(record.pointCount, 0, 0, 99999) > 0)
      .sort((a, b) => Date.parse(a.snapshotAt || a.endedAt || a.startedAt || 0) - Date.parse(b.snapshotAt || b.endedAt || b.startedAt || 0));
  }

  function summarizeScoreEvidence(evidence = {}) {
    const source = evidence && typeof evidence === "object" ? evidence : {};
    const detail = source.evidence && typeof source.evidence === "object" ? source.evidence : {};
    const targetStrokeNames = normalizeStrokeNameList(detail.targetStrokeNames || source.targetStrokeNames);
    const reasons = Array.isArray(source.reasons) ? source.reasons : [];
    const weakest = reasons
      .filter((reason) => reason && Number.isFinite(Number(reason.score)))
      .sort((a, b) => Number(a.score) - Number(b.score))[0];
    const weakText = weakest ? `，最低项：${weakest.label || weakest.key}${normalizeScore(weakest.score, 0)}分` : "";
    const copybookText = source.copybook || detail.copybook
      ? `，范字${source.copybook || detail.copybook}${targetStrokeNames.length ? `${targetStrokeNames.length}步` : ""}`
      : "";
    const strokeOrderText = normalizeInteger(detail.strokeOrderMatchPercent, 0, 0, 100)
      ? `，笔顺匹配${normalizeInteger(detail.strokeOrderMatchPercent, 0, 0, 100)}%`
      : "";
    const pathText = normalizeInteger(detail.pathFitPercent, 0, 0, 100)
      ? `，路径贴合${normalizeInteger(detail.pathFitPercent, 0, 0, 100)}%`
      : "";
    const pressureText = normalizeInteger(detail.pressurePointCount, 0, 0, 99999)
      ? `，压感${normalizeInteger(detail.pressurePointCount, 0, 0, 99999)}点`
      : "";
    return `采样${normalizeInteger(detail.pointCount, 0, 0, 99999)}点，${normalizeInteger(detail.strokeCount, 0, 0, 999)}笔，覆盖${normalizeInteger(detail.coveragePercent, 0, 0, 100)}%，重心偏移${normalizeInteger(detail.centerOffsetPercent, 0, 0, 100)}%${copybookText}${strokeOrderText}${pathText}${pressureText}${weakText}`;
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
      stroke: `依据 ${fallback.strokeCount || 0} 笔、目标 ${fallback.targetStrokeCount || 0} 笔、逐笔匹配 ${fallback.strokeOrderMatchPercent || 0}%、目标覆盖 ${fallback.strokeOrderCoveragePercent || 0}%、路径贴合 ${fallback.pathFitPercent || 0}%${fallback.targetStrokeNames?.length ? `和范字笔顺 ${fallback.targetStrokeNames.slice(0, 6).join("、")}` : ""}估算。`,
      technique: `依据笔迹长度、${fallback.pointCount || 0} 个采样点和路径误差 ${fallback.pathErrorPercent || 0}%估算。`,
      fluency: "依据线段变化和长停顿次数估算。",
      force: `依据压感跨度、${fallback.pressurePointCount || 0} 个压感采样和笔画数量差估算。`
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

  function normalizeStrokeNameList(value) {
    return Array.isArray(value)
      ? value.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 24)
      : [];
  }

  function normalizeStrokeMatchList(value) {
    if (!Array.isArray(value)) return [];
    return value
      .filter((item) => item && typeof item === "object")
      .map((item, index) => ({
        index: normalizeInteger(item.index, index + 1, 1, 80),
        expected: String(item.expected || "").slice(0, 24),
        matched: String(item.matched || "").slice(0, 24),
        matchedIndex: normalizeInteger(item.matchedIndex, 0, 0, 80),
        status: normalizeStrokeMatchStatus(item.status),
        matchScore: normalizeInteger(item.matchScore, 0, 0, 100),
        bestScore: normalizeInteger(item.bestScore, 0, 0, 100),
        actualDirection: String(item.actualDirection || "").slice(0, 24),
        expectedDirection: String(item.expectedDirection || "").slice(0, 24),
        angleDelta: normalizeInteger(item.angleDelta, 0, 0, 180)
      }))
      .slice(0, 80);
  }

  function normalizeStrokeMatchStatus(status) {
    return ["match", "weak-match", "possible-misorder", "extra"].includes(status)
      ? status
      : "weak-match";
  }

  function normalizeStrokeOrderVerdict(value) {
    return ["aligned", "partial", "needs-shape-review", "needs-order-review"].includes(value)
      ? value
      : "partial";
  }

  function normalizePathErrorHotspots(value) {
    if (!Array.isArray(value)) return [];
    return value
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        zone: String(item.zone || "").slice(0, 12),
        label: String(item.label || "").slice(0, 24),
        errorPercent: normalizeInteger(item.errorPercent, 0, 0, 100),
        sampleCount: normalizeInteger(item.sampleCount, 0, 0, 99999)
      }))
      .filter((item) => item.zone || item.label)
      .slice(0, 8);
  }

  function normalizeStrokePathErrors(value) {
    if (!Array.isArray(value)) return [];
    return value
      .filter((item) => item && typeof item === "object")
      .map((item, index) => ({
        index: normalizeInteger(item.index, index + 1, 1, 80),
        expected: String(item.expected || "").slice(0, 24),
        errorPercent: normalizeInteger(item.errorPercent, 0, 0, 100),
        fitPercent: normalizeInteger(item.fitPercent, 0, 0, 100),
        sampleCount: normalizeInteger(item.sampleCount, 0, 0, 99999)
      }))
      .slice(0, 80);
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

  function sha256StableJson(value) {
    return sha256Hex(stablePlanStringify(value));
  }

  function sha256Hex(text) {
    const bytes = utf8Bytes(String(text || ""));
    const words = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];
    const constants = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    const message = bytes.slice();
    const bitLength = message.length * 8;
    message.push(0x80);
    while ((message.length % 64) !== 56) message.push(0);
    const highLength = Math.floor(bitLength / 0x100000000);
    const lowLength = bitLength >>> 0;
    [highLength, lowLength].forEach((part) => {
      message.push((part >>> 24) & 0xff, (part >>> 16) & 0xff, (part >>> 8) & 0xff, part & 0xff);
    });

    const schedule = new Array(64);
    for (let offset = 0; offset < message.length; offset += 64) {
      for (let index = 0; index < 16; index += 1) {
        const cursor = offset + index * 4;
        schedule[index] = (
          (message[cursor] << 24)
          | (message[cursor + 1] << 16)
          | (message[cursor + 2] << 8)
          | message[cursor + 3]
        ) >>> 0;
      }
      for (let index = 16; index < 64; index += 1) {
        const sigma0 = rotateRight(schedule[index - 15], 7) ^ rotateRight(schedule[index - 15], 18) ^ (schedule[index - 15] >>> 3);
        const sigma1 = rotateRight(schedule[index - 2], 17) ^ rotateRight(schedule[index - 2], 19) ^ (schedule[index - 2] >>> 10);
        schedule[index] = (schedule[index - 16] + sigma0 + schedule[index - 7] + sigma1) >>> 0;
      }

      let [a, b, c, d, e, f, g, h] = words;
      for (let index = 0; index < 64; index += 1) {
        const sigma1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
        const choice = (e & f) ^ (~e & g);
        const temp1 = (h + sigma1 + choice + constants[index] + schedule[index]) >>> 0;
        const sigma0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
        const majority = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (sigma0 + majority) >>> 0;
        h = g;
        g = f;
        f = e;
        e = (d + temp1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) >>> 0;
      }

      words[0] = (words[0] + a) >>> 0;
      words[1] = (words[1] + b) >>> 0;
      words[2] = (words[2] + c) >>> 0;
      words[3] = (words[3] + d) >>> 0;
      words[4] = (words[4] + e) >>> 0;
      words[5] = (words[5] + f) >>> 0;
      words[6] = (words[6] + g) >>> 0;
      words[7] = (words[7] + h) >>> 0;
    }

    return words.map((word) => word.toString(16).padStart(8, "0")).join("");
  }

  function rotateRight(value, bits) {
    return (value >>> bits) | (value << (32 - bits));
  }

  function utf8Bytes(text) {
    if (typeof TextEncoder !== "undefined") {
      return Array.from(new TextEncoder().encode(text));
    }
    const bytes = [];
    for (let index = 0; index < text.length; index += 1) {
      let codePoint = text.charCodeAt(index);
      if (codePoint >= 0xd800 && codePoint <= 0xdbff && index + 1 < text.length) {
        const next = text.charCodeAt(index + 1);
        if (next >= 0xdc00 && next <= 0xdfff) {
          codePoint = 0x10000 + ((codePoint - 0xd800) << 10) + (next - 0xdc00);
          index += 1;
        }
      }
      if (codePoint <= 0x7f) {
        bytes.push(codePoint);
      } else if (codePoint <= 0x7ff) {
        bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
      } else if (codePoint <= 0xffff) {
        bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
      } else {
        bytes.push(
          0xf0 | (codePoint >> 18),
          0x80 | ((codePoint >> 12) & 0x3f),
          0x80 | ((codePoint >> 6) & 0x3f),
          0x80 | (codePoint & 0x3f)
        );
      }
    }
    return bytes;
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

  function getScoreServiceStatus() {
    const service = normalizeScoreService(state.scoreService, state.sessions);
    const modeLabel = getScoreServiceModeLabel(service.mode);
    const statusLabel = getScoreServiceStatusLabel(service.status);
    const scoreText = service.lastScore ? `，最近 ${service.lastGlyph || state.selectedGlyph} 字 ${service.lastScore} 分` : "";
    const algorithmText = service.algorithmVersion ? `算法 ${service.algorithmVersion}。` : "";
    return {
      ...clone(service),
      modeLabel,
      statusLabel,
      boundary: SCORE_SERVICE_BOUNDARY,
      message: `${modeLabel} / ${statusLabel}${scoreText}。${algorithmText}累计评分 ${service.scoredSessionCount} 次，采样 ${service.totalPointCount} 点。${service.lastEvidenceSummary || "等待真实笔迹采样。"}`.trim()
    };
  }

  function recordScoreServiceResult(practice = {}) {
    const source = practice && typeof practice === "object" ? practice : {};
    const evidence = normalizeScoreEvidence(source.scoreEvidence, source);
    const now = new Date().toISOString();
    const hasData = normalizeInteger(source.pointCount, 0, 0, 99999) > 0 && normalizeScore(source.score, 0) > 0;
    const next = normalizeScoreService({
      ...state.scoreService,
      mode: "local-heuristic",
      status: hasData ? "scored" : "no-data",
      algorithmVersion: evidence.kind,
      lastScore: hasData ? source.score : 0,
      lastGlyph: source.glyph || evidence.glyph || state.selectedGlyph,
      lastEvidenceSummary: summarizeScoreEvidence(evidence),
      lastMessage: hasData
        ? "已用本机基础评分算法记录真实笔迹证据。"
        : "没有足够笔迹采样，未生成有效评分。",
      scoredSessionCount: state.scoreService.scoredSessionCount + (hasData ? 1 : 0),
      totalStrokeCount: state.scoreService.totalStrokeCount + (hasData ? normalizeInteger(source.strokeCount, 0, 0, 999) : 0),
      totalPointCount: state.scoreService.totalPointCount + (hasData ? normalizeInteger(source.pointCount, 0, 0, 99999) : 0),
      lastScoredAt: hasData ? now : state.scoreService.lastScoredAt,
      lastCheckedAt: now
    });
    state.scoreService = next;
    addEvent("score-service", `${getScoreServiceModeLabel(next.mode)}：${getScoreServiceStatusLabel(next.status)}`);
    return next;
  }

  function getScoreServiceModeLabel(mode) {
    if (mode === "remote-professional") return "远端专业评分";
    if (mode === "remote-ai") return "远端 AI 评分";
    return "本机基础评分";
  }

  function getScoreServiceStatusLabel(status) {
    if (status === "ready") return "可用";
    if (status === "scored") return "已评分";
    if (status === "no-data") return "采样不足";
    if (status === "error") return "失败";
    return "待评分";
  }

  function getLectureServiceStatus() {
    const service = normalizeLectureService(state.lectureService);
    const modeLabel = getLectureServiceModeLabel(service.mode);
    const statusLabel = getLectureServiceStatusLabel(service.status);
    const voiceText = service.voiceName ? `，声音：${service.voiceName}` : "";
    return {
      ...clone(service),
      modeLabel,
      statusLabel,
      boundary: LECTURE_SERVICE_BOUNDARY,
      message: `${modeLabel} / ${statusLabel}${voiceText}。已朗读 ${service.spokenStepCount} 段，文本降级 ${service.fallbackStepCount} 段，失败 ${service.errorCount} 次。`
    };
  }

  function updateLectureServiceCapabilities(capabilities = {}) {
    const source = capabilities && typeof capabilities === "object" ? capabilities : {};
    state.lectureService = normalizeLectureService({
      ...state.lectureService,
      supported: source.supported === true,
      voiceName: source.voiceName ? String(source.voiceName).slice(0, 120) : state.lectureService.voiceName,
      mode: source.supported === true ? "local-tts" : "local-text-timer",
      status: source.supported === true ? "ready" : "fallback",
      lastMessage: source.supported === true
        ? "浏览器支持本机语音合成。"
        : "浏览器不支持本机语音合成，将使用文本计时推进。",
      lastCheckedAt: new Date().toISOString()
    });
    saveState();
    return {
      ok: true,
      status: getLectureServiceStatus(),
      message: state.lectureService.lastMessage
    };
  }

  function recordLectureServiceEvent(event = {}) {
    const source = event && typeof event === "object" ? event : {};
    const now = new Date().toISOString();
    const eventStatus = ["ready", "playing", "fallback", "complete", "error"].includes(source.status)
      ? source.status
      : "ready";
    const eventMode = ["local-tts", "local-text-timer", "remote-ai-audio", "remote-ai-text"].includes(source.mode)
      ? source.mode
      : eventStatus === "fallback"
        ? "local-text-timer"
        : "local-tts";
    const next = normalizeLectureService({
      ...state.lectureService,
      mode: eventMode,
      status: eventStatus,
      supported: source.supported === true || (eventMode === "local-tts" && state.lectureService.supported),
      voiceName: source.voiceName ? String(source.voiceName).slice(0, 120) : state.lectureService.voiceName,
      lastMessage: source.message || state.lectureService.lastMessage,
      lastStepTitle: source.stepTitle || state.lectureService.lastStepTitle,
      spokenStepCount: state.lectureService.spokenStepCount + (source.spoken === true ? 1 : 0),
      fallbackStepCount: state.lectureService.fallbackStepCount + (eventStatus === "fallback" ? 1 : 0),
      errorCount: state.lectureService.errorCount + (eventStatus === "error" ? 1 : 0),
      lastStartedAt: eventStatus === "playing" && !state.lectureService.lastStartedAt ? now : state.lectureService.lastStartedAt,
      lastPlayedAt: eventStatus === "playing" || source.spoken === true ? now : state.lectureService.lastPlayedAt,
      lastFallbackAt: eventStatus === "fallback" ? now : state.lectureService.lastFallbackAt,
      lastCompletedAt: eventStatus === "complete" ? now : state.lectureService.lastCompletedAt,
      lastCheckedAt: now
    });
    state.lectureService = next;
    addEvent("lecture-service", `${getLectureServiceModeLabel(next.mode)}：${getLectureServiceStatusLabel(next.status)}`);
    saveState();
    return {
      ok: true,
      status: getLectureServiceStatus(),
      message: next.lastMessage || "已更新本机讲解服务状态。"
    };
  }

  function getLectureServiceModeLabel(mode) {
    if (mode === "remote-ai-audio") return "云端 AI 音频";
    if (mode === "remote-ai-text") return "云端 AI 文本";
    if (mode === "local-text-timer") return "本机文本计时";
    return "本机语音";
  }

  function getLectureServiceStatusLabel(status) {
    if (status === "ready") return "可用";
    if (status === "playing") return "播放中";
    if (status === "fallback") return "降级";
    if (status === "complete") return "已完成";
    if (status === "error") return "失败";
    return "待检查";
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
    const progress = getPlanProgress({ items });
    const dependencyGraph = buildPlanDependencyGraph(items);
    const cycleRule = normalizePlanCycleRule(plan?.cycleRule, items, plan?.createdAt);
    return {
      ...clone(plan),
      items,
      cycleRule,
      progress,
      reminderSummary: getPlanReminderSummary(items),
      dependencyGraph,
      cycleStatus: buildPlanCycleStatus({ ...clone(plan), items, cycleRule }, progress)
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

  function getPlanDependencyGraph(planId = null) {
    const plan = getPlan(planId);
    if (!plan) {
      return {
        ok: false,
        message: "还没有可查看依赖图的学习计划。"
      };
    }

    return {
      ok: true,
      planId: plan.id,
      title: plan.title,
      ...clone(plan.dependencyGraph || buildPlanDependencyGraph(plan.items || []))
    };
  }

  function getPlanCycleStatus(planId = null) {
    const plan = getPlan(planId);
    if (!plan) {
      return {
        ok: false,
        message: "还没有可循环推进的学习计划。"
      };
    }

    return {
      ok: true,
      planId: plan.id,
      title: plan.title,
      ...clone(plan.cycleStatus || buildPlanCycleStatus(plan, plan.progress))
    };
  }

  function getPlanRepositoryStatus() {
    const repository = normalizePlanRepository(state.planRepository);
    const planCount = state.plans.length;
    const remoteConfigured = Boolean(repository.remoteEndpoint);
    let tone = "idle";
    let message = remoteConfigured
      ? `远端计划 API 已配置：${repository.remoteEndpoint}，空间 ${repository.workspaceId}。`
      : planCount
        ? `本机同步仓库有 ${planCount} 份计划，可导出 JSON 同步包。`
        : "还没有可同步的学习计划。";

    if (repository.lastRemoteSyncAt) {
      const directionLabel = {
        check: "检查",
        push: "推送",
        pull: "拉取"
      }[repository.lastRemoteDirection] || "同步";
      tone = "ready";
      message = repository.lastRemoteStatus
        || `最近${directionLabel}远端计划仓库：${formatPlanDate(repository.lastRemoteSyncAt)}，${repository.lastRemotePlanCount} 份计划。`;
    } else if (repository.lastImportedAt) {
      tone = "ready";
      message = `最近导入 ${repository.lastImportedPlanCount} 份计划：${formatPlanDate(repository.lastImportedAt)}。`;
    } else if (repository.lastExportedAt) {
      tone = "ready";
      message = `最近导出 ${repository.lastExportedPlanCount} 份计划：${formatPlanDate(repository.lastExportedAt)}。`;
    }
    if (repository.pendingAutoSync) {
      tone = "warning";
      message = repository.remoteEndpoint
        ? `有 ${repository.pendingPlanCount || planCount} 份计划待自动同步：${repository.pendingReason || "本机计划已变更"}。`
        : `有 ${repository.pendingPlanCount || planCount} 份计划待同步，请先配置远端计划 API 或导出 JSON 同步包。`;
    }
    if (repository.lastSyncConflictCount > 0) {
      tone = "warning";
      message = `远端计划与本机待同步变更存在 ${repository.lastSyncConflictCount} 个冲突，请先手动推送或确认拉取策略。`;
    }
    if (repository.lastError) {
      tone = "warning";
      message = repository.lastError;
      const retrySummary = getPlanRepositoryAutoSyncRetrySummary(repository);
      if (retrySummary) {
        message = `${message} ${retrySummary}`;
      }
    }
    const receiptSummary = getPlanRepositoryReceiptSummary(repository.lastReceipt);
    if (receiptSummary && !repository.lastError) {
      message = `${message} ${receiptSummary}`;
    }

    return {
      ok: true,
      kind: PLAN_REPOSITORY_KIND,
      mode: repository.mode,
      remoteConfigured,
      remoteEndpoint: remoteConfigured ? repository.remoteEndpoint : "",
      hasRemoteToken: Boolean(repository.remoteToken),
      workspaceId: repository.workspaceId,
      fetchSupported: typeof fetch === "function",
      planCount,
      tone,
      message,
      boundary: PLAN_REPOSITORY_BOUNDARY,
      lastExportedAt: repository.lastExportedAt,
      lastImportedAt: repository.lastImportedAt,
      lastCheckedAt: repository.lastCheckedAt,
      lastRemoteSyncAt: repository.lastRemoteSyncAt,
      lastRemoteDirection: repository.lastRemoteDirection,
      lastRemotePlanCount: repository.lastRemotePlanCount,
      lastRemoteStatus: repository.lastRemoteStatus,
      lastExportedPlanCount: repository.lastExportedPlanCount,
      lastImportedPlanCount: repository.lastImportedPlanCount,
      lastPackageId: repository.lastPackageId,
      autoSyncEnabled: repository.autoSyncEnabled,
      pendingAutoSync: repository.pendingAutoSync,
      pendingSince: repository.pendingSince,
      pendingReason: repository.pendingReason,
      pendingPlanCount: repository.pendingPlanCount,
      autoSyncAttemptCount: repository.autoSyncAttemptCount,
      lastAutoSyncAt: repository.lastAutoSyncAt,
      lastAutoSyncStatus: repository.lastAutoSyncStatus,
      lastAutoSyncFailureAt: repository.lastAutoSyncFailureAt,
      autoSyncRetryAfter: repository.autoSyncRetryAfter,
      autoSyncFailureCount: repository.autoSyncFailureHistory.length,
      autoSyncFailureHistory: clone(repository.autoSyncFailureHistory),
      autoSyncRetrySummary: getPlanRepositoryAutoSyncRetrySummary(repository),
      lastSyncConflictAt: repository.lastSyncConflictAt,
      lastSyncConflictCount: repository.lastSyncConflictCount,
      lastSyncConflictPlanIds: [...repository.lastSyncConflictPlanIds],
      lastSyncConflicts: clone(repository.lastSyncConflicts),
      lastReceipt: repository.lastReceipt ? clone(repository.lastReceipt) : null,
      receiptCount: repository.receipts.length,
      receipts: clone(repository.receipts),
      receiptStatus: receiptSummary,
      lastError: repository.lastError
    };
  }

  function getPlanRepositoryReceiptSummary(receipt) {
    const normalized = normalizePlanRepositoryReceipt(receipt);
    if (!normalized) return "";
    const digestShort = normalized.repositoryDigest.slice(0, 12);
    const receiptShort = normalized.receiptDigest.slice(0, 12);
    const acceptedAt = normalized.acceptedAt ? `，${formatPlanDate(normalized.acceptedAt)}` : "";
    const verificationLabel = formatPlanRepositoryReceiptVerificationStatus(normalized.verificationStatus);
    return `已收到远端计划回执：仓库摘要 ${digestShort}，回执 ${receiptShort}${acceptedAt}；${verificationLabel}。`;
  }

  function getPlanRepositoryAutoSyncRetrySummary(repository = state.planRepository) {
    const normalized = normalizePlanRepository(repository);
    if (!normalized.pendingAutoSync || !normalized.autoSyncAttemptCount || !normalized.autoSyncRetryAfter) {
      return "";
    }
    const latestFailure = normalized.autoSyncFailureHistory[0] || null;
    const reason = latestFailure?.failureKind === "timeout"
      ? "最近一次为请求超时"
      : latestFailure?.failureKind === "http"
        ? "最近一次为服务端拒收"
        : latestFailure?.failureKind === "network"
          ? "最近一次为网络异常"
          : "最近一次同步未完成";
    return `${reason}；已失败 ${normalized.autoSyncAttemptCount} 次，建议 ${formatPlanDate(normalized.autoSyncRetryAfter)} 后点击“重试队列”。`;
  }

  function getPlanRepositoryReceiptAudit() {
    const repository = normalizePlanRepository(state.planRepository);
    const receipts = repository.receipts;
    const verifiedCount = receipts.filter((receipt) => receipt.verificationStatus === "verified").length;
    return {
      ok: true,
      kind: "mr-calligraphy-plan-repository-receipt-audit-v1",
      workspaceId: repository.workspaceId,
      total: receipts.length,
      verifiedCount,
      latestReceipt: receipts[0] || null,
      receipts: clone(receipts),
      boundary: PLAN_REPOSITORY_BOUNDARY,
      message: receipts.length
        ? `已保存 ${receipts.length} 条计划仓库回执，本机校验通过 ${verifiedCount} 条，最近一次：${formatPlanDate(receipts[0].receivedAt || receipts[0].acceptedAt)}。`
        : "暂无计划仓库回执。"
    };
  }

  function getPlanRepositoryReceiptAuditExport() {
    const audit = getPlanRepositoryReceiptAudit();
    if (!audit.total) {
      return {
        ok: false,
        message: "暂无可导出的计划仓库回执。"
      };
    }
    const exportedAt = new Date().toISOString();
    return {
      ok: true,
      filename: `mr-calligraphy-plan-repository-receipts-${exportedAt.slice(0, 10)}.html`,
      html: renderPlanRepositoryReceiptAuditHtml(audit, exportedAt),
      audit,
      message: `已生成 ${audit.total} 条计划仓库回执审计导出。`
    };
  }

  function downloadPlanRepositoryReceiptAudit() {
    const result = getPlanRepositoryReceiptAuditExport();
    if (!result.ok) {
      return result;
    }
    downloadHtml(result.html, result.filename);
    return {
      ok: true,
      filename: result.filename,
      receiptCount: result.audit.total,
      message: result.message
    };
  }

  function renderPlanRepositoryReceiptAuditHtml(audit, exportedAt) {
    const rows = audit.receipts.map((receipt) => {
      const warnings = Array.isArray(receipt.warnings) && receipt.warnings.length ? receipt.warnings.join("；") : "无";
      return `
        <section class="receipt">
          <h2>${escapeHtml(receipt.packageId || receipt.sourcePackageId || "packageId 未知")}</h2>
          <dl>
            <dt>方向</dt><dd>${escapeHtml(formatPlanRepositoryReceiptDirection(receipt.direction))}</dd>
            <dt>计划数量</dt><dd>${escapeHtml(receipt.planCount || 0)}</dd>
            <dt>Repository Digest</dt><dd>${escapeHtml(receipt.repositoryDigest || "未知")}</dd>
            <dt>Receipt Digest</dt><dd>${escapeHtml(receipt.receiptDigest || "未知")}</dd>
            <dt>本机校验</dt><dd>${escapeHtml(formatPlanRepositoryReceiptVerificationStatus(receipt.verificationStatus))}</dd>
            <dt>校验说明</dt><dd>${escapeHtml(receipt.verificationMessage || "未执行")}</dd>
            <dt>重算摘要</dt><dd>${escapeHtml(receipt.verificationExpectedDigest || "未知")}</dd>
            <dt>Remote Version</dt><dd>${escapeHtml(receipt.remoteVersion || "未知")}</dd>
            <dt>Workspace</dt><dd>${escapeHtml(receipt.workspaceId || PLAN_REPOSITORY_DEFAULT_WORKSPACE)}</dd>
            <dt>Endpoint</dt><dd>${escapeHtml(receipt.endpoint || "未知")}</dd>
            <dt>Accepted At</dt><dd>${escapeHtml(receipt.acceptedAt || "未知")}</dd>
            <dt>Received At</dt><dd>${escapeHtml(receipt.receivedAt || "未知")}</dd>
            <dt>Message</dt><dd>${escapeHtml(receipt.message || "无")}</dd>
            <dt>Warnings</dt><dd>${escapeHtml(warnings)}</dd>
          </dl>
          <pre>${escapeHtml(JSON.stringify(receipt, null, 2))}</pre>
        </section>`;
    }).join("");
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>MR 书法计划仓库回执审计</title>
  <style>
    body { margin: 0; padding: 32px; color: #1f2937; background: #f7f4ee; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { max-width: 980px; margin: 0 auto; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    .meta { margin: 0 0 18px; color: #5f6b7a; line-height: 1.6; }
    .receipt { margin: 18px 0; padding: 18px; border: 1px solid #ddd3c2; border-radius: 8px; background: #fffaf2; }
    h2 { margin: 0 0 12px; font-size: 17px; overflow-wrap: anywhere; }
    dl { display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 8px 12px; margin: 0; }
    dt { color: #5f6b7a; font-weight: 700; }
    dd { margin: 0; overflow-wrap: anywhere; }
    pre { margin: 14px 0 0; padding: 12px; overflow: auto; border-radius: 6px; background: #1f2937; color: #f8fafc; font-size: 12px; line-height: 1.5; }
  </style>
</head>
<body>
  <main>
    <h1>MR 书法计划仓库回执审计</h1>
    <p class="meta">导出时间：${escapeHtml(formatDateTime(exportedAt))} · 回执数量：${audit.total}<br>${escapeHtml(audit.boundary)}</p>
    ${rows}
  </main>
</body>
</html>`;
  }

  function formatPlanRepositoryReceiptDirection(direction) {
    return {
      check: "检查",
      push: "推送",
      pull: "拉取"
    }[direction] || "远端回执";
  }

  function formatPlanRepositoryReceiptVerificationStatus(status) {
    return {
      verified: "本机校验通过",
      "workspace-mismatch": "空间不匹配",
      "digest-mismatch": "摘要不匹配"
    }[status] || "未校验";
  }

  function getPlanReminderServiceStatus(planId = null) {
    const plan = getPlan(planId);
    const browser = getBrowserNotificationState();
    const stored = normalizePlanReminderService(state.planReminderService);
    const permission = browser.supported ? browser.permission : "unsupported";
    const enabled = stored.enabled === true && permission === "granted";
    const channel = enabled ? "browser-notification" : "in-page";
    const summary = plan?.reminderSummary || null;
    const pendingItem = plan?.items?.find((item) => item.reminder?.status === "overdue" || item.reminder?.status === "due")
      || null;
    const nextItem = pendingItem
      || plan?.items?.find((item) => item.reminder?.dueAt && item.reminder.dueAt === summary?.nextDueAt)
      || null;
    let tone = "idle";
    let message = "页面内提醒已可用；未启用浏览器通知。";

    if (!browser.supported) {
      tone = "warning";
      message = "当前浏览器不支持 Notification，本机只显示页面内提醒。";
    } else if (permission === "denied") {
      tone = "danger";
      message = "浏览器已拒绝通知权限，只能保留页面内提醒。";
    } else if (enabled) {
      tone = "ready";
      message = "浏览器通知已启用；页面打开时可触发本机提醒。";
    } else if (permission === "granted") {
      tone = "ready";
      message = "浏览器已授权通知，可启用本机提醒。";
    }

    if (summary?.label && plan) {
      message = `${message} 当前计划：${summary.label}。`;
    }

    return {
      ok: true,
      supported: browser.supported,
      permission,
      enabled,
      channel,
      tone,
      message,
      boundary: PLAN_REMINDER_BOUNDARY,
      canRequestPermission: browser.supported && permission === "default",
      canEnable: browser.supported && permission === "granted",
      planId: plan?.id || null,
      nextDueAt: summary?.nextDueAt || null,
      nextDueLabel: summary?.nextDueAt ? formatPlanDate(summary.nextDueAt) : "",
      nextItemId: nextItem?.id || null,
      nextItemTitle: nextItem?.title || "",
      pendingItemId: pendingItem?.id || null,
      pendingItemTitle: pendingItem?.title || "",
      hasPendingLocalReminder: Boolean(enabled && pendingItem),
      lastCheckedAt: stored.lastCheckedAt,
      requestedAt: stored.requestedAt,
      acknowledgedAt: stored.acknowledgedAt,
      lastDispatchedAt: stored.lastDispatchedAt,
      lastItemId: stored.lastItemId,
      lastReminderFingerprint: stored.lastReminderFingerprint
    };
  }

  function getBrowserNotificationState() {
    const api = typeof window !== "undefined" ? window.Notification : null;
    const supported = Boolean(api && (typeof api === "function" || typeof api === "object"));
    const permission = supported && ["default", "granted", "denied"].includes(api.permission)
      ? api.permission
      : supported
        ? "default"
        : "unsupported";
    return {
      api,
      supported,
      permission
    };
  }

  function setPlanReminderServicePreference(enabled = true, planId = null, permissionOverride = null) {
    const browser = getBrowserNotificationState();
    const permission = permissionOverride || (browser.supported ? browser.permission : "unsupported");
    const canEnable = enabled === true && permission === "granted";
    const now = new Date().toISOString();
    state.planReminderService = normalizePlanReminderService({
      ...state.planReminderService,
      enabled: canEnable,
      supported: browser.supported,
      permission,
      channel: canEnable ? "browser-notification" : "in-page",
      lastCheckedAt: now,
      acknowledgedAt: now,
      lastPlanId: planId || state.planReminderService?.lastPlanId || null
    });
    saveState();
    const status = getPlanReminderServiceStatus(planId);
    return {
      ok: canEnable,
      status,
      message: canEnable
        ? "已启用本机浏览器提醒。页面关闭或跨设备时不会推送。"
        : `${status.message} ${PLAN_REMINDER_BOUNDARY}`
    };
  }

  async function requestPlanReminderPermission(planId = null) {
    const browser = getBrowserNotificationState();
    const now = new Date().toISOString();
    state.planReminderService = normalizePlanReminderService({
      ...state.planReminderService,
      requestedAt: now,
      lastCheckedAt: now,
      lastPlanId: planId || state.planReminderService?.lastPlanId || null
    });

    if (!browser.supported || !browser.api || typeof browser.api.requestPermission !== "function") {
      saveState();
      return setPlanReminderServicePreference(false, planId, "unsupported");
    }

    let permission = browser.permission;
    if (permission === "default") {
      try {
        const requestResult = browser.api.requestPermission();
        permission = typeof requestResult?.then === "function"
          ? await requestResult
          : requestResult || browser.api.permission || permission;
      } catch (error) {
        console.warn("本机提醒权限请求失败", error);
        permission = browser.api.permission || "default";
      }
    }

    if (!["default", "granted", "denied"].includes(permission)) {
      permission = browser.api.permission || "default";
    }

    return setPlanReminderServicePreference(permission === "granted", planId, permission);
  }

  function dispatchPlanReminderNotification(planId = null, options = {}) {
    const plan = getPlan(planId);
    const status = getPlanReminderServiceStatus(plan?.id || planId);
    if (!plan) {
      return { ok: false, status, message: "还没有可触发本机提醒的学习计划。" };
    }
    if (!status.enabled || !status.supported || status.permission !== "granted") {
      return {
        ok: false,
        status,
        message: `${status.message} ${PLAN_REMINDER_BOUNDARY}`
      };
    }
    const item = plan.items.find((entry) => entry.id === status.pendingItemId) || null;
    if (!item) {
      return { ok: false, status, message: "当前没有到点或逾期的计划项；本机提醒已保持启用。" };
    }

    const reminder = item.reminder || getPlanItemReminder(item);
    const fingerprint = `${plan.id}:${item.id}:${reminder.status}:${reminder.dueAt || ""}:${reminder.snoozedUntil || ""}`;
    const stored = normalizePlanReminderService(state.planReminderService);
    if (options.force !== true && stored.lastReminderFingerprint === fingerprint) {
      return { ok: false, status, message: "这条本机提醒已经触发过；刷新后不会重复打扰。" };
    }

    const browser = getBrowserNotificationState();
    try {
      const title = reminder.status === "overdue" ? "学习计划已逾期" : "学习计划提醒";
      const body = `${item.title} / ${reminder.dueLabel || "查看计划面板"}`;
      if (typeof browser.api === "function") {
        new browser.api(title, {
          body,
          tag: `mr-calligraphy-plan-${plan.id}-${item.id}`,
          renotify: false
        });
      }
    } catch (error) {
      console.warn("本机提醒通知触发失败", error);
      return {
        ok: false,
        status,
        message: "浏览器通知触发失败，页面内提醒仍然可用。"
      };
    }

    const now = new Date().toISOString();
    state.planReminderService = normalizePlanReminderService({
      ...state.planReminderService,
      enabled: true,
      supported: true,
      permission: "granted",
      channel: "browser-notification",
      lastCheckedAt: now,
      acknowledgedAt: now,
      lastDispatchedAt: now,
      lastPlanId: plan.id,
      lastItemId: item.id,
      lastReminderFingerprint: fingerprint
    });
    saveState();
    return {
      ok: true,
      status: getPlanReminderServiceStatus(plan.id),
      message: `已触发本机浏览器提醒：${item.title}。${PLAN_REMINDER_BOUNDARY}`
    };
  }

  function buildPlanCycleStatus(plan, progress = getPlanProgress(plan)) {
    const cycleRule = normalizePlanCycleRule(plan?.cycleRule, plan?.items || [], plan?.createdAt);
    const total = progress?.total || 0;
    const done = progress?.done || 0;
    const complete = total > 0 && done === total;
    const nextTime = Date.parse(cycleRule.nextCycleAt || "");
    const daysUntilNext = Number.isFinite(nextTime)
      ? Math.ceil((nextTime - Date.now()) / 86400000)
      : null;
    const generatedNext = Boolean(cycleRule.generatedNextPlanId);
    const nextCycleIndex = cycleRule.cycleIndex + 1;
    const canCreateNext = cycleRule.enabled && complete && !generatedNext;
    let tone = "idle";
    let label = `第 ${cycleRule.cycleIndex} 轮 · ${done}/${total}`;
    let message = Number.isFinite(daysUntilNext)
      ? `下周期建议 ${formatPlanDate(cycleRule.nextCycleAt)}`
      : "下周期时间待定";

    if (generatedNext) {
      tone = "done";
      message = `已生成第 ${nextCycleIndex} 轮`;
    } else if (canCreateNext) {
      tone = "ready";
      message = `本周期已完成，可生成第 ${nextCycleIndex} 轮`;
    } else if (complete) {
      tone = "ready";
      message = "本周期已完成";
    } else if (Number.isFinite(daysUntilNext) && daysUntilNext <= 0) {
      tone = "warning";
      message = `已到第 ${nextCycleIndex} 轮建议时间，完成本周期后可生成`;
    }

    return {
      enabled: cycleRule.enabled,
      cycleIndex: cycleRule.cycleIndex,
      nextCycleIndex,
      intervalDays: cycleRule.intervalDays,
      nextCycleAt: cycleRule.nextCycleAt,
      nextCycleLabel: formatPlanDate(cycleRule.nextCycleAt),
      previousPlanId: cycleRule.previousPlanId,
      generatedNextPlanId: cycleRule.generatedNextPlanId,
      generatedNext,
      daysUntilNext,
      complete,
      canCreateNext,
      done,
      total,
      tone,
      label,
      message
    };
  }

  function buildPlanDependencyGraph(items = []) {
    const normalizedItems = Array.isArray(items) ? items : [];
    const itemMap = new Map(normalizedItems.map((item) => [item.id, item]));
    const nodes = normalizedItems.map((item, index) => {
      const reminder = item.reminder || getPlanItemReminder(item);
      const dependsOn = Array.isArray(item.dependsOn)
        ? item.dependsOn.filter((id) => itemMap.has(id) && id !== item.id)
        : [];
      const blockerIds = dependsOn.filter((id) => itemMap.get(id)?.done !== true);
      const dependencyLabels = dependsOn.map((id) => itemMap.get(id)?.title || id);
      const blockerLabels = blockerIds.map((id) => itemMap.get(id)?.title || id);
      const blocked = blockerIds.length > 0 && item.done !== true;
      let status = "ready";
      let tone = "ready";
      let label = "可开始";

      if (item.done && item.reviewDoneAt) {
        status = "reviewed";
        tone = "done";
        label = "已复盘";
      } else if (item.done) {
        status = "review-pending";
        tone = "review";
        label = "待复盘";
      } else if (blocked) {
        status = "blocked";
        tone = "blocked";
        label = `等待：${blockerLabels.slice(0, 2).join("、")}`;
      } else if (reminder.status === "overdue") {
        status = "overdue";
        tone = "danger";
        label = "已逾期";
      } else if (reminder.status === "due") {
        status = "due";
        tone = "warning";
        label = "已到提醒";
      }

      return {
        id: item.id,
        index,
        step: index + 1,
        title: item.title,
        dependsOn,
        dependencyLabels,
        blockerIds,
        blockerLabels,
        blocked,
        status,
        tone,
        label,
        dueLabel: reminder.dueLabel || "未设置到期",
        reviewLabel: reminder.reviewLabel || "自定义复盘"
      };
    });
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const edges = nodes.flatMap((node) => node.dependsOn.map((sourceId) => ({
      from: sourceId,
      to: node.id,
      fromTitle: nodeMap.get(sourceId)?.title || sourceId,
      toTitle: node.title,
      resolved: itemMap.get(sourceId)?.done === true
    })));
    const blockedCount = nodes.filter((node) => node.status === "blocked").length;
    const readyCount = nodes.filter((node) => ["ready", "due", "overdue"].includes(node.status)).length;
    const reviewedCount = nodes.filter((node) => node.status === "reviewed").length;
    const reviewPendingCount = nodes.filter((node) => node.status === "review-pending").length;
    const summary = blockedCount
      ? `${blockedCount} 项等待前置任务，先完成依赖链起点`
      : reviewPendingCount
        ? `${reviewPendingCount} 项待复盘，依赖链已推进`
        : reviewedCount === nodes.length && nodes.length
          ? "计划依赖已全部完成"
          : `${readyCount} 项可开始，按依赖链推进`;

    return {
      nodes,
      edges,
      summary,
      blockedCount,
      readyCount,
      reviewedCount,
      reviewPendingCount
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

  function getLearningPathStatus() {
    const stats = getStats();
    const task = getCurrentTask();
    const taskProgress = stats.taskProgress || getTaskProgress(task?.id);
    const stageProgress = stats.stageProgress || getStageProgress(task?.id);
    const latestPlan = stats.latestPlan || getLatestPlan();
    const shareStatus = getShareServiceStatus(stats.latestArtwork?.id);
    const steps = buildLearningPathSteps({
      stats,
      task,
      taskProgress,
      stageProgress,
      latestPlan,
      shareStatus
    });
    const doneCount = steps.filter((step) => step.done).length;
    const nextStep = steps.find((step) => !step.done && !step.locked) || steps[steps.length - 1] || null;
    const progressPercent = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;

    return {
      kind: "mr-calligraphy-learning-path-v1",
      source: ["LearningTask", "PracticeSession", "ArtworkRecord", "ReportRecord", "PlanRecord"],
      boundary: LEARNING_PATH_BOUNDARY,
      task: task ? clone(task) : null,
      taskProgress: clone(taskProgress),
      doneCount,
      total: steps.length,
      progressPercent,
      nextStep: nextStep ? clone(nextStep) : null,
      steps: clone(steps),
      message: `${stats.taskTitle}：学习路径已完成 ${doneCount}/${steps.length} 步，下一步 ${nextStep?.shortName || "继续学习"}。${LEARNING_PATH_BOUNDARY}`
    };
  }

  function buildLearningPathSteps(context) {
    const { stats, task, taskProgress, stageProgress, latestPlan, shareStatus } = context;
    const stageMap = new Map((stageProgress?.stages || []).map((stage) => [stage.stage, stage]));
    const hasStage = (stage) => Boolean(stageMap.get(stage)?.done);
    const getStageCount = (stage) => normalizeInteger(stageMap.get(stage)?.count, 0, 0, 999);
    const lectureProgress = stats.lectureProgress || getLectureProgress();
    const planProgress = latestPlan?.progress || (latestPlan ? getPlanProgress(latestPlan) : null);
    const hasPlan = Boolean(planProgress?.total);
    const planDone = Boolean(hasPlan && planProgress.done === planProgress.total);
    const hasTaskRecord = (taskProgress.practicedSessionCount || 0) > 0
      || (taskProgress.artworkCount || 0) > 0
      || (taskProgress.reportCount || 0) > 0
      || (taskProgress.stageCount || 0) > 0;
    const latestTime = stats.latestRecordAt ? formatDateTime(stats.latestRecordAt) : "暂无记录";
    const taskTitle = stats.taskTitle || task?.taskTitle || "当前任务";
    const glyph = stats.glyph || task?.glyph || "永";
    const copybook = stats.copybook || task?.copybook || "当前碑帖";
    const taskFocus = stats.taskFocus || task?.focus || "基础笔势";
    const taskPercent = normalizeInteger(taskProgress.percent, 0, 0, 100);
    const practicedCount = normalizeInteger(taskProgress.practicedSessionCount, 0, 0, 9999);
    const activePracticeCount = normalizeInteger(taskProgress.activeSessionCount, 0, 0, 9999);
    const artworkCount = normalizeInteger(taskProgress.artworkCount, 0, 0, 9999);
    const reportCount = normalizeInteger(taskProgress.reportCount, 0, 0, 9999);
    const averageScore = normalizeScore(taskProgress.averageScore, 0);
    const latestArtworkTitle = stats.latestArtwork?.title || "暂无作品";
    const planLabel = hasPlan ? `${planProgress.done}/${planProgress.total}` : "未制定";

    return [
      makeLearningPathStep({
        index: 0,
        id: "entry",
        shortName: "准备",
        title: `${taskTitle} / 沉浸准备`,
        description: `当前学习任务是“${taskTitle}”，练习字为“${glyph}”，碑帖为“${copybook}”。`,
        focus: `先确认任务重点：${taskFocus}。路径状态由本机任务和学习记录推导。`,
        done: Boolean(task),
        active: !task,
        nextActionLabel: "选择日课字",
        evidence: [`任务状态：${taskProgress.statusLabel || "待开始"}`, `完成条件：${taskProgress.ruleSummary || "阶段 / 练习 / 作品 / 报告"}`],
        activeLabel: "准备中",
        doneLabel: "已准备",
        pendingLabel: "待准备"
      }),
      makeLearningPathStep({
        index: 1,
        id: "task",
        shortName: "任务",
        title: `${taskTitle} / 任务确认`,
        description: `当前任务进度 ${taskPercent}%，级别为${stats.taskLevel || task?.level || "基础"}，重点练习“${taskFocus}”。`,
        focus: taskProgress.locked
          ? taskProgress.dependencyStatus?.reason || "请先完成前置任务。"
          : `本轮需要完成：${taskProgress.ruleSummary || "阶段、练习、作品和报告"}`,
        done: Boolean(task && !taskProgress.locked),
        locked: Boolean(taskProgress.locked),
        nextActionLabel: "选择日课字",
        evidence: [`练习字：${glyph}`, `碑帖：${copybook}`, `依赖：${taskProgress.dependencyStatus?.label || "无前置"}`],
        activeLabel: "确认中",
        doneLabel: "已选字",
        pendingLabel: "待选字",
        lockedLabel: "未解锁"
      }),
      makeLearningPathStep({
        index: 2,
        id: "lecture",
        shortName: "讲解",
        title: `${taskTitle} / 本机讲解`,
        description: `讲解进度 ${lectureProgress.progressPercent || 0}%，当前段落：${lectureProgress.currentStep?.title || "待开始"}。`,
        focus: "本机讲解会记录浏览器语音或文本计时进度，不伪装成云端 AI 音频。",
        done: stats.lectureStatus === "complete",
        active: stats.lectureStatus === "playing",
        nextActionLabel: stats.lectureStatus === "complete" ? "开始临摹" : "播放讲解",
        evidence: [`段落：${lectureProgress.completedSteps || 0}/${lectureProgress.totalSteps || 0}`, `状态：${stats.lectureStatus || "idle"}`],
        activeLabel: "讲解中",
        doneLabel: "已讲解",
        pendingLabel: "待讲解"
      }),
      makeLearningPathStep({
        index: 3,
        id: "practice",
        shortName: "临摹",
        title: `${taskTitle} / 真实临摹`,
        description: practicedCount
          ? `当前任务已有 ${practicedCount} 次真实笔迹练习，均分 ${averageScore || 0}。`
          : "当前任务还没有真实笔迹练习，请在米字格中书写后保存采样。",
        focus: `练习模式为${stats.trainingMode === "compare" ? "对比" : "示范"}，评分会读取真实笔迹点位和本机基础评分证据。`,
        done: practicedCount > 0,
        active: activePracticeCount > 0,
        nextActionLabel: practicedCount > 0 ? "查看笔画分析" : "进入临摹训练",
        evidence: [`真实练习：${practicedCount}次`, `活动会话：${activePracticeCount}次`, `均分：${averageScore || "未评分"}`],
        activeLabel: activePracticeCount > 0 ? "练习中" : "待创建",
        doneLabel: "已练习",
        pendingLabel: "待练习"
      }),
      makeLearningPathStep({
        index: 4,
        id: "stroke-breakdown",
        shortName: "拆解",
        title: `${taskTitle} / 笔画拆解`,
        description: hasStage("strokeBreakdown")
          ? `已记录 ${getStageCount("strokeBreakdown")} 次笔画拆解，当前笔画为“${state.activeStrokeIndex + 1}/${STROKES.length} ${STROKES[state.activeStrokeIndex]}”。`
          : `围绕“${glyph}”的${taskFocus}拆解笔画，阶段记录会写入本机学习档案。`,
        focus: "笔画拆解阶段会影响当前任务完成度，不再只是静态热点说明。",
        done: hasStage("strokeBreakdown"),
        active: practicedCount > 0 && !hasStage("strokeBreakdown"),
        nextActionLabel: "进入笔画拆解",
        evidence: [`阶段记录：${getStageCount("strokeBreakdown")}次`, `当前笔画：${STROKES[state.activeStrokeIndex]}`],
        activeLabel: "拆解中",
        doneLabel: "已拆解",
        pendingLabel: "待拆解"
      }),
      makeLearningPathStep({
        index: 5,
        id: "creation",
        shortName: "创作",
        title: `${taskTitle} / 作品创作`,
        description: artworkCount
          ? `当前任务已保存 ${artworkCount} 幅作品，最近作品为“${latestArtworkTitle}”。`
          : `用“${glyph}”完成一幅作品，保存时会关联当前任务和真实笔迹。`,
        focus: hasStage("creation")
          ? `创作阶段已记录 ${getStageCount("creation")} 次，下一步应保存作品或进入复盘。`
          : "创作实践阶段和作品保存都会进入任务完成条件。",
        done: artworkCount > 0,
        active: hasStage("creation") || taskProgress.savedSessionCount > 0,
        nextActionLabel: artworkCount > 0 ? "查看作品" : "保存作品",
        evidence: [`作品：${artworkCount}幅`, `创作阶段：${getStageCount("creation")}次`, `风格：${state.artworkStyle}`],
        activeLabel: "创作中",
        doneLabel: "已保存",
        pendingLabel: "待创作"
      }),
      makeLearningPathStep({
        index: 6,
        id: "history",
        shortName: "档案",
        title: `${taskTitle} / 本机学习档案`,
        description: hasTaskRecord
          ? `当前任务已有练习、作品、报告或阶段记录，最近更新时间：${latestTime}。`
          : "当前任务还没有可复盘记录，完成练习或保存作品后会进入学习档案。",
        focus: "学习档案读取本机浏览器记录，不再显示固定学习时长或静态优秀样本。",
        done: hasTaskRecord,
        active: hasTaskRecord,
        nextActionLabel: hasTaskRecord ? "打开历史记录" : "进入临摹训练",
        evidence: [`练习：${practicedCount}次`, `作品：${artworkCount}幅`, `报告：${reportCount}份`],
        activeLabel: "记录中",
        doneLabel: "有记录",
        pendingLabel: "无记录"
      }),
      makeLearningPathStep({
        index: 7,
        id: "review-share",
        shortName: "复盘",
        title: `${taskTitle} / 作品复盘与分享`,
        description: artworkCount
          ? `可复盘最近作品“${latestArtworkTitle}”；本机分享服务有 ${shareStatus.activeCount || 0} 条有效链接。`
          : "还没有作品可复盘或分享，先完成一次真实书写并保存作品。",
        focus: "分享页是本机 HTML 和浏览器内链接，不伪装成公网作品墙。",
        done: artworkCount > 0,
        active: artworkCount > 0 && !shareStatus.activeCount,
        nextActionLabel: artworkCount > 0 ? "导出分享页" : "保存作品",
        evidence: [`有效分享：${shareStatus.activeCount || 0}条`, `已撤销：${shareStatus.revokedCount || 0}条`, `作品：${artworkCount}幅`],
        activeLabel: "复盘中",
        doneLabel: "可复盘",
        pendingLabel: "待作品"
      }),
      makeLearningPathStep({
        index: 8,
        id: "report",
        shortName: "报告",
        title: `${taskTitle} / 学习报告`,
        description: reportCount
          ? `当前任务已有 ${reportCount} 份报告，最近报告会读取本机练习和作品记录。`
          : "报告尚未导出。完成练习或保存作品后，可生成本机 HTML/PDF 报告。",
        focus: "报告分数来自本机练习、作品和评分证据，不读取静态高分。",
        done: reportCount > 0,
        active: artworkCount > 0 && reportCount === 0,
        nextActionLabel: reportCount > 0 ? "查看详情" : "导出报告",
        evidence: [`报告：${reportCount}份`, `平均分：${averageScore || "未评分"}`, `最近记录：${latestTime}`],
        activeLabel: "报告中",
        doneLabel: "已导出",
        pendingLabel: "待报告"
      }),
      makeLearningPathStep({
        index: 9,
        id: "review-plan",
        shortName: "巩固",
        title: `${taskTitle} / 复习巩固`,
        description: taskProgress.complete
          ? "当前任务已满足阶段、练习、作品和报告条件，可进入下一任务或制定下一周期计划。"
          : `当前任务完成度 ${taskPercent}%，计划进度 ${planLabel}。`,
        focus: hasPlan
          ? `计划“${latestPlan.title}”正在跟踪 ${planProgress.done}/${planProgress.total} 个任务项。`
          : "复习巩固会读取阶段记录和学习计划，不再使用固定总结文案。",
        done: Boolean(taskProgress.complete || planDone),
        active: hasPlan || hasStage("review"),
        nextActionLabel: taskProgress.complete ? "选择日课字" : "制定计划",
        evidence: [`任务完成：${taskProgress.complete ? "是" : "否"}`, `复习阶段：${getStageCount("review")}次`, `计划：${planLabel}`],
        activeLabel: hasPlan ? `计划 ${planLabel}` : "总结中",
        doneLabel: taskProgress.complete ? "任务完成" : "计划完成",
        pendingLabel: "待计划"
      })
    ];
  }

  function makeLearningPathStep(step) {
    const locked = Boolean(step.locked);
    const done = Boolean(step.done) && !locked;
    const active = !done && !locked && Boolean(step.active);
    const status = locked ? "locked" : done ? "done" : active ? "active" : "todo";
    const statusLabel = step.statusLabel || getLearningPathStatusLabel(status);
    const evidence = Array.isArray(step.evidence)
      ? step.evidence.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 5)
      : [];
    const nextActionLabel = String(step.nextActionLabel || "继续学习").slice(0, 40);

    return {
      index: step.index,
      id: step.id,
      shortName: step.shortName,
      title: step.title,
      description: step.description,
      focus: step.focus,
      status,
      statusLabel,
      done,
      active,
      locked,
      activeLabel: step.activeLabel || statusLabel,
      doneLabel: step.doneLabel || "已完成",
      pendingLabel: step.pendingLabel || "待完成",
      lockedLabel: step.lockedLabel || "未解锁",
      nextActionLabel,
      actionHint: `${statusLabel}：${step.description} 下一步：${nextActionLabel}。`,
      evidence
    };
  }

  function getLearningPathStatusLabel(status) {
    if (status === "done") return "已完成";
    if (status === "active") return "进行中";
    if (status === "locked") return "未解锁";
    return "待完成";
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
        { label: "阶段记录 ID", value: record.id || "未保存" },
        { label: "任务", value: task?.taskTitle || `${record.glyph}字学习` },
        { label: "字帖", value: record.copybook },
        { label: "目标步骤", value: `第 ${normalizeInteger(record.targetStep, config.targetStep, 0, 9) + 1} 步` },
        { label: "阶段进度", value: `${stageProgress.percent}%` }
      ],
      items: [
        `阶段记录 ID：${record.id || "未保存"}。`,
        `写入时间：${formatPlanDate(record.completedAt || record.createdAt)}。`,
        ...stageProgress.stages.map((stage) => `${stage.done ? "已完成" : "待完成"}：${stage.label}`)
      ]
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
    recordScoreServiceResult({ ...practice, glyph: session.glyph });
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
    const planItems = [
      makePlanItem("plan-practice", `完成 1 次${state.selectedGlyph}字临摹`, `使用${state.trainingMode === "compare" ? "对比" : "示范"}模式书写，并保留真实笔迹。`, { dueDays: 1, reviewAction: "practice" }),
      makePlanItem("plan-task-focus", `复盘${currentTask.focus}`, `按照任务步骤完成：${currentTask.strokePlan.join("、")}。`, { dueDays: 2, reviewAction: "task", dependsOn: ["plan-practice"] }),
      makePlanItem("plan-weakness", `专项补强${weakness.label}`, weakness.advice, { dueDays: 3, reviewAction: "weakness", dependsOn: ["plan-task-focus"] }),
      makePlanItem("plan-artwork", hasArtwork ? "复盘最近作品" : "保存 1 幅作品", hasArtwork ? "回放最近作品笔迹，记录一条最需要调整的结构或笔法问题。" : "完成书写后保存作品，让复盘区生成截图和评分。", { dueDays: 4, reviewAction: "artwork", dependsOn: ["plan-weakness"] }),
      makePlanItem("plan-report", hasReport ? "对比最近学习报告" : "导出 1 份 HTML 学习报告", hasReport ? "查看最近报告中的能力结构，把最低维度作为下一次练习目标。" : "导出报告，把练习次数、作品数量和能力结构沉淀为文件。", { dueDays: 5, reviewAction: "report", dependsOn: ["plan-artwork"] })
    ];
    const plan = {
      id: makeId("plan"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: `${currentTask.taskTitle}下一阶段练习计划`,
      mode: state.activeMode,
      taskId: currentTask.id,
      glyph: state.selectedGlyph,
      copybook: state.selectedCopybook,
      summary: `围绕“${currentTask.taskTitle}”和“${state.selectedCopybook}”安排可勾选任务，重点是${currentTask.focus}。`,
      items: planItems,
      cycleRule: {
        enabled: true,
        intervalDays: DEFAULT_PLAN_CYCLE_DAYS,
        cycleIndex: 1,
        nextCycleAt: makePlanCycleNextAt(new Date(), DEFAULT_PLAN_CYCLE_DAYS),
        previousPlanId: null,
        generatedAt: new Date().toISOString(),
        generatedNextPlanId: null
      },
      completedAt: null
    };
    state.plans.push(plan);
    addEvent("plan", plan.title);
    queuePlanRepositorySync("生成新的学习计划", { save: false });
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
      reviewDoneAt: null,
      dependsOn: Array.isArray(options.dependsOn)
        ? [...new Set(options.dependsOn.map(String).filter(Boolean))].slice(0, 4)
        : []
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
    touchPlan(plan);
    updatePlanCompletion(plan);
    addEvent("plan-item", `${item.done ? "完成" : "取消"}计划项：${item.title}`);
    queuePlanRepositorySync(`${item.done ? "完成" : "取消"}计划项：${item.title}`, { save: false });
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
    touchPlan(plan);
    addEvent("plan-item-edit", `编辑计划项：${item.title}`);
    queuePlanRepositorySync(`编辑计划项：${item.title}`, { save: false });
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

    const previousItem = plan.items[plan.items.length - 1] || null;
    const planItem = makePlanItem(makeId("plan-custom"), title, detail || "自定义补充任务，完成后可勾选保存进度。", {
      dueAt,
      remindAt,
      reviewAction: item.reviewAction || "custom",
      dependsOn: previousItem ? [previousItem.id] : []
    });
    plan.items.push(planItem);
    plan.completedAt = null;
    touchPlan(plan);
    addEvent("plan-item-add", `新增计划项：${planItem.title}`);
    queuePlanRepositorySync(`新增计划项：${planItem.title}`, { save: false });
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
    touchPlan(plan);
    addEvent("plan-item-move", `调整计划项顺序：${item.title}`);
    queuePlanRepositorySync(`调整计划项顺序：${item.title}`, { save: false });
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
    plan.items.forEach((entry) => {
      if (!Array.isArray(entry.dependsOn) || !entry.dependsOn.includes(item.id)) {
        return;
      }
      const rewired = entry.dependsOn
        .filter((id) => id !== item.id)
        .concat(Array.isArray(item.dependsOn) ? item.dependsOn : []);
      entry.dependsOn = [...new Set(rewired)]
        .filter((id) => id && id !== entry.id && plan.items.some((candidate) => candidate.id === id))
        .slice(0, 4);
    });
    updatePlanCompletion(plan);
    touchPlan(plan);
    addEvent("plan-item-delete", `删除计划项：${item.title}`);
    queuePlanRepositorySync(`删除计划项：${item.title}`, { save: false });
    saveState();
    return { ok: true, plan: decoratePlan(plan), message: `已删除计划项：${item.title}。` };
  }

  function createNextPlanCycle(planId = null) {
    const sourcePlan = planId
      ? state.plans.find((item) => item.id === String(planId))
      : state.plans[state.plans.length - 1] || null;
    if (!sourcePlan) {
      return { ok: false, message: "还没有可循环推进的学习计划。" };
    }

    const decoratedSource = decoratePlan(sourcePlan);
    const cycleStatus = decoratedSource.cycleStatus || buildPlanCycleStatus(decoratedSource, decoratedSource.progress);
    if (!cycleStatus.canCreateNext) {
      return {
        ok: false,
        message: cycleStatus.generatedNext
          ? "这份计划已经生成过下一周期。"
          : "请先完成本周期全部计划项，再生成下周期。"
      };
    }

    const createdAt = new Date().toISOString();
    const intervalDays = normalizeInteger(decoratedSource.cycleRule?.intervalDays, DEFAULT_PLAN_CYCLE_DAYS, 1, 60);
    const nextCycleIndex = normalizeInteger(decoratedSource.cycleRule?.cycleIndex, 1, 1, 999) + 1;
    const idSet = new Set(decoratedSource.items.map((item) => item.id));
    const items = decoratedSource.items.map((item, index) => ({
      id: item.id,
      title: item.title,
      detail: item.detail || "",
      done: false,
      completedAt: null,
      dueAt: makePlanDueAt(index + 1, 18, createdAt),
      remindAt: makePlanReminderAt(makePlanDueAt(index + 1, 18, createdAt)),
      snoozedUntil: null,
      reviewAction: normalizePlanReviewAction(item.reviewAction),
      reviewDoneAt: null,
      dependsOn: Array.isArray(item.dependsOn)
        ? item.dependsOn.filter((id) => idSet.has(id) && id !== item.id)
        : []
    }));
    const titleBase = String(decoratedSource.title || "下一阶段练习计划").replace(/（第\d+轮）$/, "");
    const nextPlan = {
      id: makeId("plan"),
      createdAt,
      updatedAt: createdAt,
      title: `${titleBase}（第${nextCycleIndex}轮）`,
      mode: decoratedSource.mode,
      taskId: decoratedSource.taskId,
      glyph: decoratedSource.glyph,
      copybook: decoratedSource.copybook,
      summary: `${decoratedSource.summary || "本机学习计划"} 第 ${nextCycleIndex} 轮。`,
      items,
      cycleRule: {
        enabled: true,
        intervalDays,
        cycleIndex: nextCycleIndex,
        nextCycleAt: makePlanCycleNextAt(createdAt, intervalDays),
        previousPlanId: decoratedSource.id,
        generatedAt: createdAt,
        generatedNextPlanId: null
      },
      completedAt: null
    };
    sourcePlan.cycleRule = {
      ...normalizePlanCycleRule(sourcePlan.cycleRule, sourcePlan.items, sourcePlan.createdAt),
      generatedNextPlanId: nextPlan.id
    };
    touchPlan(sourcePlan);
    state.plans.push(nextPlan);
    addEvent("plan-cycle", `生成学习计划第 ${nextCycleIndex} 轮`);
    queuePlanRepositorySync(`生成学习计划第 ${nextCycleIndex} 轮`, { save: false });
    saveState();
    return {
      ok: true,
      plan: decoratePlan(nextPlan),
      sourcePlan: decoratePlan(sourcePlan),
      message: `已生成第 ${nextCycleIndex} 轮学习计划，并保留原依赖链。`
    };
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
    touchPlan(plan);
    addEvent("plan-item-snooze", `顺延计划项：${item.title}`);
    queuePlanRepositorySync(`顺延计划项：${item.title}`, { save: false });
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
    touchPlan(plan);
    const nextAction = getPlanReviewNextAction(item);
    addEvent("plan-item-review", `完成计划项复盘：${item.title}`);
    queuePlanRepositorySync(`完成计划项复盘：${item.title}`, { save: false });
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

  function getPlanExport(planId = null) {
    const plan = getPlan(planId);
    if (!plan) {
      return {
        ok: false,
        message: "还没有可导出的学习计划。请先点击“制定计划”。"
      };
    }

    const exportedAt = new Date().toISOString();
    const safePlanId = String(plan.id || "latest").replace(/[^\w-]+/g, "-");
    const filename = `mr-calligraphy-plan-${safePlanId}.html`;
    return {
      ok: true,
      plan: clone(plan),
      exportedAt,
      filename,
      html: createPlanExportHtml(plan, exportedAt),
      message: "已生成学习计划离线 HTML，可下载后打印或保存为 PDF。"
    };
  }

  function getPlanCalendarExport(planId = null) {
    const plan = getPlan(planId);
    if (!plan) {
      return {
        ok: false,
        message: "还没有可导出的学习计划提醒日历。请先点击“制定计划”。"
      };
    }

    const items = (plan.items || [])
      .filter((item) => Number.isFinite(Date.parse(item.dueAt || "")));
    if (!items.length) {
      return {
        ok: false,
        plan: clone(plan),
        message: "这份计划还没有带到期时间的任务，无法生成日历提醒。"
      };
    }

    const exportedAt = new Date().toISOString();
    const safePlanId = String(plan.id || "latest").replace(/[^\w-]+/g, "-");
    return {
      ok: true,
      plan: clone(plan),
      exportedAt,
      filename: `mr-calligraphy-plan-calendar-${safePlanId}.ics`,
      mimeType: "text/calendar;charset=utf-8",
      eventCount: items.length,
      calendar: createPlanCalendarIcs(plan, items, exportedAt),
      boundary: PLAN_CALENDAR_BOUNDARY,
      message: `已生成 ${items.length} 个计划任务的日历提醒，可导入系统日历。${PLAN_CALENDAR_BOUNDARY}`
    };
  }

  function createPlanCalendarIcs(plan, scheduledItems, exportedAt) {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//MR Calligraphy//Learning Plan//CN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${escapeIcsText(`MR 书法：${plan.title || "学习计划"}`)}`,
      `X-WR-CALDESC:${escapeIcsText(PLAN_CALENDAR_BOUNDARY)}`
    ];
    scheduledItems.forEach((item) => {
      const due = new Date(item.dueAt);
      const end = new Date(due.getTime() + 30 * 60 * 1000);
      const reminder = item.reminder || getPlanItemReminder(item);
      const remindTime = Date.parse(item.remindAt || "");
      const dueTime = due.getTime();
      const triggerMinutes = Number.isFinite(remindTime) && remindTime <= dueTime
        ? Math.max(0, Math.round((dueTime - remindTime) / 60000))
        : null;
      const reviewMeta = PLAN_REVIEW_ACTIONS[normalizePlanReviewAction(item.reviewAction)];
      const description = [
        item.detail || "完成后回到前台勾选，进度会保存到本机。",
        `计划：${plan.title || plan.id}`,
        `复盘：${reviewMeta.label}`,
        reminder.dueLabel || "",
        reminder.remindLabel || "",
        PLAN_CALENDAR_BOUNDARY
      ].filter(Boolean).join("\\n");
      lines.push(
        "BEGIN:VEVENT",
        `UID:${escapeIcsText(`${plan.id}-${item.id}@mr-calligraphy.local`)}`,
        `DTSTAMP:${formatIcsDateTime(exportedAt)}`,
        `DTSTART:${formatIcsDateTime(due)}`,
        `DTEND:${formatIcsDateTime(end)}`,
        `SUMMARY:${escapeIcsText(`MR书法：${item.title || "计划任务"}`)}`,
        `DESCRIPTION:${escapeIcsText(description)}`,
        `CATEGORIES:${escapeIcsText("MR书法,学习计划")}`,
        `STATUS:${item.done ? "COMPLETED" : "CONFIRMED"}`,
        `X-MR-PLAN-ID:${escapeIcsText(plan.id || "")}`,
        `X-MR-PLAN-ITEM-ID:${escapeIcsText(item.id || "")}`
      );
      if (triggerMinutes !== null) {
        lines.push(
          "BEGIN:VALARM",
          "ACTION:DISPLAY",
          `DESCRIPTION:${escapeIcsText(`MR书法提醒：${item.title || "计划任务"}`)}`,
          `TRIGGER:${triggerMinutes ? `-PT${triggerMinutes}M` : "PT0M"}`,
          "END:VALARM"
        );
      }
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return lines.map(foldIcsLine).join("\r\n") + "\r\n";
  }

  function formatIcsDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return formatIcsDateTime(new Date());
    }
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  }

  function escapeIcsText(value) {
    return String(value ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/\r\n|\r|\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  }

  function foldIcsLine(line) {
    const text = String(line || "");
    if (text.length <= 72) return text;
    const parts = [];
    let rest = text;
    while (rest.length > 72) {
      parts.push(rest.slice(0, 72));
      rest = rest.slice(72);
    }
    parts.push(rest);
    return parts.map((part, index) => index ? ` ${part}` : part).join("\r\n");
  }

  function createPlanExportHtml(plan, exportedAt) {
    const progress = plan.progress || getPlanProgress(plan);
    const reminderSummary = plan.reminderSummary || getPlanReminderSummary(plan.items || []);
    const dependencyGraph = plan.dependencyGraph || buildPlanDependencyGraph(plan.items || []);
    const cycleStatus = plan.cycleStatus || buildPlanCycleStatus(plan, progress);
    const dependencyMap = new Map((dependencyGraph.nodes || []).map((node) => [node.id, node]));
    const items = Array.isArray(plan.items) ? plan.items : [];
    const itemRows = items.length
      ? items.map((item, index) => {
        const reminder = item.reminder || getPlanItemReminder(item);
        const dependencyNode = dependencyMap.get(item.id) || null;
        const dependencyText = dependencyNode?.dependencyLabels?.length
          ? `依赖：${dependencyNode.dependencyLabels.join("、")}`
          : "依赖：起点任务";
        const status = item.done ? "已完成" : "待完成";
        const reviewStatus = reminder.reviewDoneAt ? reminder.reviewDoneLabel : reminder.reviewDoneLabel || "待完成复盘";
        return `<article class="plan-item">
          <div class="plan-index">${index + 1}</div>
          <div>
            <div class="plan-item-head"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(status)}</span></div>
            <p>${escapeHtml(item.detail || "完成后回到前台勾选，进度会保存到本机。")}</p>
            <ul>
              <li>${escapeHtml(reminder.label || "未设置提醒")}</li>
              <li>${escapeHtml(reminder.dueLabel || "未设置到期")}</li>
              <li>${escapeHtml(reminder.remindLabel || "未设置提醒")}</li>
              <li>复盘：${escapeHtml(reminder.reviewLabel || "自定义复盘")}</li>
              <li>${escapeHtml(dependencyText)}</li>
              <li>${escapeHtml(reviewStatus)}</li>
            </ul>
          </div>
        </article>`;
      }).join("")
      : `<p class="empty">这份计划暂时没有任务项。</p>`;

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(plan.title || "MR 书法学习计划")}</title>
  <style>
    :root { color-scheme: light; font-family: "Noto Serif SC", "Songti SC", serif; color: #1f2933; background: #f7f4ee; }
    body { margin: 0; padding: 32px; }
    main { max-width: 920px; margin: 0 auto; background: #fffdf8; border: 1px solid #d8c7a2; box-shadow: 0 18px 48px rgba(31, 41, 51, 0.12); }
    header { padding: 32px; border-bottom: 1px solid #e6d8bb; background: #efe3cb; }
    h1 { margin: 8px 0 12px; font-size: 32px; line-height: 1.2; }
    .meta, .muted { color: #6b5f4b; }
    .eyebrow { font-size: 13px; letter-spacing: 0; color: #8b5e34; }
    .summary { padding: 24px 32px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    .stat { border: 1px solid #eadcc4; padding: 14px; background: #fffaf0; }
    .stat span { display: block; font-size: 12px; color: #7a6b55; }
    .stat strong { display: block; margin-top: 6px; font-size: 20px; }
    .content { padding: 0 32px 32px; }
    .notice { margin: 0 0 20px; padding: 14px; background: #f3efe5; border-left: 4px solid #936d3d; color: #574831; }
    .plan-item { display: grid; grid-template-columns: 42px 1fr; gap: 16px; padding: 18px 0; border-top: 1px solid #eadcc4; }
    .plan-index { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: #1f2933; color: white; font-weight: 700; }
    .plan-item-head { display: flex; justify-content: space-between; gap: 16px; align-items: baseline; }
    .plan-item-head strong { font-size: 18px; }
    .plan-item-head span { color: #8b5e34; white-space: nowrap; }
    p { line-height: 1.7; }
    ul { margin: 10px 0 0; padding-left: 20px; color: #5f523f; line-height: 1.7; }
    footer { padding: 20px 32px; border-top: 1px solid #eadcc4; color: #6b5f4b; font-size: 13px; }
    @media (max-width: 720px) {
      body { padding: 16px; }
      header, .summary, .content, footer { padding-left: 20px; padding-right: 20px; }
      .summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .plan-item-head { display: block; }
    }
    @media print {
      body { padding: 0; background: white; }
      main { box-shadow: none; border: 0; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div class="eyebrow">MR Calligraphy Plan · ${escapeHtml(formatDateTime(exportedAt))}</div>
      <h1>${escapeHtml(plan.title || "MR 书法学习计划")}</h1>
      <p class="meta">${escapeHtml(plan.summary || "本计划基于当前浏览器里的本机学习状态生成。")}</p>
    </header>
    <section class="summary" aria-label="计划摘要">
      <div class="stat"><span>当前字</span><strong>${escapeHtml(plan.glyph || "-")}</strong></div>
      <div class="stat"><span>碑帖</span><strong>${escapeHtml(plan.copybook || "-")}</strong></div>
      <div class="stat"><span>完成度</span><strong>${escapeHtml(`${progress.done || 0}/${progress.total || 0}`)}</strong></div>
      <div class="stat"><span>提醒</span><strong>${escapeHtml(reminderSummary.label || "暂无计划提醒")}</strong></div>
    </section>
    <section class="content" aria-label="计划任务">
      <p class="notice">这是一份本机导出的学习计划，包含任务、到期、提醒、顺延和复盘状态；不是云端同步、消息推送或教师端排课服务。</p>
      <p class="notice">周期摘要：${escapeHtml(cycleStatus.label || "暂无周期")}，${escapeHtml(cycleStatus.message || "暂无下周期建议")}。</p>
      <p class="notice">依赖图摘要：${escapeHtml(dependencyGraph.summary || "暂无依赖摘要")}。</p>
      ${itemRows}
    </section>
    <footer>计划 ID：${escapeHtml(plan.id || "-")}。创建时间：${escapeHtml(formatDateTime(plan.createdAt))}。数据来源：${escapeHtml(STORAGE_KEY)}。导出时间：${escapeHtml(formatDateTime(exportedAt))}。</footer>
  </main>
</body>
</html>`;
  }

  function createReport() {
    const stats = getStats();
    const reportTrend = getReportTrend();
    const scoreEvidenceSummary = createReportScoreEvidenceSummary(stats.latestArtwork, "artwork")
      || createReportScoreEvidenceSummary(stats.latestSession, "session");
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
      scoreEvidenceSummary,
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

  function updateReportTeacherReview(reportId = null, review = {}) {
    const report = findReportForUpdate(reportId);
    if (!report) {
      return { ok: false, message: "还没有可批注的学习报告。" };
    }
    const teacherReview = normalizeReportTeacherReview({
      reviewer: review.reviewer || review.teacher,
      role: review.role || review.reviewerRole || review.teacherRole,
      note: review.note || review.comment,
      reviewedAt: new Date().toISOString(),
      source: "local-teacher-review"
    }, {
      reportId: report.id,
      reportCreatedAt: report.createdAt
    });
    if (!teacherReview) {
      return { ok: false, message: "教师批注内容不能为空。" };
    }

    const previousReview = report.teacherReview ? clone(report.teacherReview) : null;
    report.teacherReview = teacherReview;
    const auditRecord = appendReportTeacherReviewAudit(createReportTeacherReviewAuditRecord(report, "save", previousReview, teacherReview));
    addEvent("report-review", `教师批注：${report.id}`);
    saveState();
    return {
      ok: true,
      report: getReportDetail(report.id),
      teacherReview: clone(teacherReview),
      auditRecord: auditRecord ? clone(auditRecord) : null,
      auditCount: state.reportTeacherReviewAudits.length,
      message: `已保存 ${teacherReview.reviewer}（${formatReportTeacherReviewRole(teacherReview.role)}）对报告“${report.title || report.id}”的本机教师批注，签名 ${teacherReview.localSignatureDigest.slice(0, 12)}。`
    };
  }

  function clearReportTeacherReview(reportId = null) {
    const report = findReportForUpdate(reportId);
    if (!report) {
      return { ok: false, message: "还没有可清除批注的学习报告。" };
    }
    if (!report.teacherReview) {
      return {
        ok: true,
        report: getReportDetail(report.id),
        teacherReview: null,
        message: "这份报告还没有教师批注。"
      };
    }

    const previousReview = clone(report.teacherReview);
    report.teacherReview = null;
    const auditRecord = appendReportTeacherReviewAudit(createReportTeacherReviewAuditRecord(report, "clear", previousReview, null));
    addEvent("report-review-clear", `清除教师批注：${report.id}`);
    saveState();
    return {
      ok: true,
      report: getReportDetail(report.id),
      teacherReview: null,
      auditRecord: auditRecord ? clone(auditRecord) : null,
      auditCount: state.reportTeacherReviewAudits.length,
      message: `已清除报告“${report.title || report.id}”的本机教师批注。`
    };
  }

  function findReportForUpdate(reportId = null) {
    const recordId = String(reportId || "").trim();
    if (recordId) {
      return state.reports.find((item) => item.id === recordId) || null;
    }
    return state.reports[state.reports.length - 1] || null;
  }

  function getReportTeacherReviewAudit(reportId = null) {
    const targetReportId = String(reportId || "").trim();
    const records = normalizeReportTeacherReviewAudits(state.reportTeacherReviewAudits);
    const filtered = targetReportId
      ? records.filter((record) => record.reportId === targetReportId)
      : records;
    const latestAudit = filtered[0] || null;
    return {
      ok: true,
      kind: "mr-calligraphy-report-teacher-review-audit-log-v1",
      reportId: targetReportId,
      total: filtered.length,
      allTotal: records.length,
      latestAudit: latestAudit ? clone(latestAudit) : null,
      records: clone(filtered),
      boundary: REPORT_TEACHER_REVIEW_AUDIT_BOUNDARY,
      message: filtered.length
        ? `已保存 ${filtered.length} 条教师批注审计记录，最近一次：${formatPlanDate(latestAudit.createdAt)}。`
        : targetReportId
          ? "当前报告暂无教师批注审计记录。"
          : "暂无教师批注审计记录。"
    };
  }

  function getReportTeacherReviewAuditExport(reportId = null) {
    const audit = getReportTeacherReviewAudit(reportId);
    if (!audit.total) {
      return {
        ok: false,
        message: audit.message || "暂无可导出的教师批注审计记录。"
      };
    }
    const exportedAt = new Date().toISOString();
    const reportSlug = audit.reportId ? makeDownloadSlug(audit.reportId) : "all";
    return {
      ok: true,
      filename: `mr-calligraphy-teacher-review-audit-${reportSlug}-${exportedAt.slice(0, 10)}.html`,
      html: renderReportTeacherReviewAuditHtml(audit, exportedAt),
      audit,
      message: `已生成 ${audit.total} 条教师批注审计导出。`
    };
  }

  function downloadReportTeacherReviewAudit(reportId = null) {
    const result = getReportTeacherReviewAuditExport(reportId);
    if (!result.ok) {
      return result;
    }
    downloadHtml(result.html, result.filename);
    return {
      ok: true,
      filename: result.filename,
      auditCount: result.audit.total,
      message: result.message
    };
  }

  function renderReportTeacherReviewAuditHtml(audit, exportedAt) {
    const rows = audit.records.map((record) => `
      <section class="audit">
        <h2>${escapeHtml(formatReportTeacherReviewAuditAction(record.action))} · ${escapeHtml(record.reportTitle || record.reportId)}</h2>
        <dl>
          <dt>报告 ID</dt><dd>${escapeHtml(record.reportId)}</dd>
          <dt>批注人</dt><dd>${escapeHtml(record.reviewer || "本机教师")}</dd>
          <dt>角色</dt><dd>${escapeHtml(formatReportTeacherReviewRole(record.role))}</dd>
          <dt>动作</dt><dd>${escapeHtml(formatReportTeacherReviewAuditAction(record.action))}</dd>
          <dt>签名类型</dt><dd>${escapeHtml(record.signatureKind || REPORT_TEACHER_REVIEW_SIGNATURE_KIND)}</dd>
          <dt>签名算法</dt><dd>${escapeHtml(record.signatureAlgorithm || REPORT_TEACHER_REVIEW_SIGNATURE_ALGORITHM)}</dd>
          <dt>签名字段</dt><dd>${escapeHtml((record.signedFields || []).join("、") || REPORT_TEACHER_REVIEW_SIGNED_FIELDS.join("、"))}</dd>
          <dt>前一批注摘要</dt><dd>${escapeHtml(record.previousReviewDigest || "无")}</dd>
          <dt>后一批注摘要</dt><dd>${escapeHtml(record.nextReviewDigest || "无")}</dd>
          <dt>前一本机签名</dt><dd>${escapeHtml(record.previousSignatureDigest || record.previousDigest || "无")}</dd>
          <dt>后一本机签名</dt><dd>${escapeHtml(record.nextSignatureDigest || record.nextDigest || "无")}</dd>
          <dt>前一预览</dt><dd>${escapeHtml(record.previousPreview || "无")}</dd>
          <dt>后一预览</dt><dd>${escapeHtml(record.nextPreview || "无")}</dd>
          <dt>批注时间</dt><dd>${escapeHtml(record.reviewedAt || "未知")}</dd>
          <dt>审计时间</dt><dd>${escapeHtml(record.createdAt || "未知")}</dd>
          <dt>说明</dt><dd>${escapeHtml(record.message || "无")}</dd>
        </dl>
        <pre>${escapeHtml(JSON.stringify(record, null, 2))}</pre>
      </section>`).join("");
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>MR 书法教师批注审计</title>
  <style>
    body { margin: 0; padding: 32px; color: #1f2937; background: #f7f4ee; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { max-width: 980px; margin: 0 auto; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    .meta { margin: 0 0 18px; color: #5f6b7a; line-height: 1.6; }
    .audit { margin: 18px 0; padding: 18px; border: 1px solid #ddd3c2; border-radius: 8px; background: #fffaf2; }
    h2 { margin: 0 0 12px; font-size: 17px; overflow-wrap: anywhere; }
    dl { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 8px 12px; margin: 0; }
    dt { color: #5f6b7a; font-weight: 700; }
    dd { margin: 0; overflow-wrap: anywhere; }
    pre { margin: 14px 0 0; padding: 12px; overflow: auto; border-radius: 6px; background: #1f2937; color: #f8fafc; font-size: 12px; line-height: 1.5; }
  </style>
</head>
<body>
  <main>
    <h1>MR 书法教师批注审计</h1>
    <p class="meta">导出时间：${escapeHtml(formatDateTime(exportedAt))} · 审计记录：${audit.total}<br>${escapeHtml(audit.boundary)}</p>
    ${rows}
  </main>
</body>
</html>`;
  }

  function formatReportTeacherReviewAuditAction(action) {
    return action === "clear" ? "清除批注" : "保存批注";
  }

  function formatReportTeacherReviewRole(role) {
    const normalized = normalizeReportTeacherReviewRole(role);
    const labels = {
      "local-teacher": "授课教师",
      "local-assistant": "助教",
      "local-reviewer": "教研审核"
    };
    return labels[normalized] || normalized || "授课教师";
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

  function downloadText(text, filename, mimeType = "text/plain;charset=utf-8") {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function downloadPdf(pdf, filename) {
    const blob = new Blob([pdf], { type: "application/pdf" });
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

  function getReportTrend(report = null) {
    const cutoffTime = Date.parse(report?.createdAt || "");
    const hasCutoff = Number.isFinite(cutoffTime);
    const isInRange = (value) => {
      const time = Date.parse(value || "");
      return !hasCutoff || Number.isNaN(time) || time <= cutoffTime;
    };
    return [
      ...state.sessions
        .filter((session) => Number.isFinite(session.score) && session.score > 0 && isInRange(session.endedAt || session.startedAt))
        .map((session) => ({
          label: `${session.glyph}练习`,
          type: "practice",
          score: session.score,
          createdAt: session.endedAt || session.startedAt
        })),
      ...state.artworks
        .filter((artwork) => Number.isFinite(artwork.score) && artwork.score > 0 && isInRange(artwork.createdAt))
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

  function createReportVerification(report) {
    const normalizedReport = normalizeReport(report);
    if (!normalizedReport) return null;
    const payload = createReportVerificationPayload(normalizedReport);
    const canonical = stablePlanStringify(payload);
    const digest = sha256Hex(canonical);
    return {
      kind: REPORT_VERIFICATION_KIND,
      version: 1,
      algorithm: REPORT_VERIFICATION_ALGORITHM,
      digest,
      reportId: normalizedReport.id,
      reportCreatedAt: normalizedReport.createdAt,
      storageKey: STORAGE_KEY,
      payloadBytes: utf8Bytes(canonical).length,
      boundary: REPORT_VERIFICATION_BOUNDARY
    };
  }

  function createReportVerificationPayload(report) {
    const normalizedReport = normalizeReport(report);
    const latestSession = findReportSession(normalizedReport);
    const latestArtwork = findReportArtwork(normalizedReport);
    const scoreEvidenceSummary = getReportScoreEvidenceSummary(normalizedReport, latestSession, latestArtwork);
    return {
      kind: REPORT_VERIFICATION_KIND,
      version: 1,
      storageKey: STORAGE_KEY,
      boundary: REPORT_VERIFICATION_BOUNDARY,
      report: {
        id: normalizedReport.id,
        taskId: normalizedReport.taskId,
        title: normalizedReport.title,
        createdAt: normalizedReport.createdAt,
        range: normalizedReport.range,
        format: normalizedReport.format,
        summary: normalizedReport.summary,
        sessionCount: normalizedReport.sessionCount,
        artworkCount: normalizedReport.artworkCount,
        averageScore: normalizedReport.averageScore,
        learningMinutes: normalizedReport.learningMinutes,
        latestSessionId: normalizedReport.latestSessionId,
        latestArtworkId: normalizedReport.latestArtworkId,
        latestStrokeCount: normalizedReport.latestStrokeCount,
        latestPointCount: normalizedReport.latestPointCount,
        scoreBreakdown: normalizedReport.scoreBreakdown,
        trend: normalizedReport.trend,
        scoreEvidenceSummary,
        recommendations: normalizedReport.recommendations,
        teacherReview: normalizedReport.teacherReview
      },
      evidence: {
        latestSession: latestSession ? {
          id: latestSession.id || "",
          taskId: latestSession.taskId || getSessionTaskId(latestSession),
          title: latestSession.title || "",
          glyph: latestSession.glyph || "",
          mode: latestSession.mode || "",
          copybook: latestSession.copybook || "",
          trainingMode: latestSession.trainingMode || "",
          score: normalizeScore(latestSession.score, 0),
          strokeCount: normalizeInteger(latestSession.strokeCount, 0, 0, 999),
          pointCount: normalizeInteger(latestSession.pointCount, 0, 0, 99999),
          metrics: normalizeMetrics(latestSession.metrics),
          createdAt: latestSession.createdAt || "",
          endedAt: latestSession.endedAt || ""
        } : null,
        latestArtwork: latestArtwork ? {
          id: latestArtwork.id || "",
          title: latestArtwork.title || "",
          glyph: latestArtwork.glyph || "",
          mode: latestArtwork.mode || "",
          copybook: latestArtwork.copybook || "",
          style: latestArtwork.style || "",
          score: normalizeScore(latestArtwork.score, 0),
          strokeCount: normalizeInteger(latestArtwork.strokeCount, 0, 0, 999),
          pointCount: normalizeInteger(latestArtwork.pointCount, 0, 0, 99999),
          tags: Array.isArray(latestArtwork.tags) ? normalizeArtworkTags(latestArtwork.tags) : [],
          imageSha256: latestArtwork.imageData ? sha256Hex(latestArtwork.imageData) : "",
          createdAt: latestArtwork.createdAt || ""
        } : null
      }
    };
  }

  function getReportVerification(reportId = null) {
    const report = reportId
      ? state.reports.find((item) => item.id === String(reportId))
      : state.reports[state.reports.length - 1];
    if (!report) {
      return { ok: false, message: "还没有可验真的学习报告。" };
    }
    const normalizedReport = normalizeReport(report);
    const verification = createReportVerification(normalizedReport);
    return {
      ok: true,
      reportId: normalizedReport.id,
      report: clone(normalizedReport),
      verification: clone(verification),
      digest: verification.digest,
      message: "已根据本机报告核心字段重新计算验真摘要。"
    };
  }

  function getReportRepositoryStatus() {
    const repository = normalizeReportRepository(state.reportRepository);
    const reports = state.reports.map(normalizeReport).filter(Boolean);
    const reportCount = reports.length;
    const remoteConfigured = Boolean(repository.remoteEndpoint);
    let tone = "idle";
    let message = remoteConfigured
      ? `远端报告 API 已配置：${repository.remoteEndpoint}，空间 ${repository.workspaceId}。`
      : reportCount
        ? `本机报告仓库有 ${reportCount} 份报告，可推送到远端 API adapter。`
        : "还没有可同步的学习报告。";

    if (repository.lastRemoteSyncAt) {
      const directionLabel = {
        check: "检查",
        push: "推送",
        pull: "拉取"
      }[repository.lastRemoteDirection] || "同步";
      tone = "ready";
      message = repository.lastRemoteStatus
        || `最近${directionLabel}远端报告仓库：${formatPlanDate(repository.lastRemoteSyncAt)}，${repository.lastRemoteReportCount} 份报告。`;
    } else if (remoteConfigured && repository.lastRemoteStatus) {
      tone = "ready";
      message = repository.lastRemoteStatus;
    } else if (repository.lastImportedAt) {
      tone = "ready";
      message = `最近导入 ${repository.lastImportedReportCount} 份报告：${formatPlanDate(repository.lastImportedAt)}。`;
    } else if (repository.lastExportedAt) {
      tone = "ready";
      message = `最近导出 ${repository.lastExportedReportCount} 份报告：${formatPlanDate(repository.lastExportedAt)}。`;
    }
    if (repository.lastSkippedConflictCount > 0) {
      tone = "warning";
      message = repository.lastConflictReports.length
        ? `远端报告有 ${repository.lastConflictReports.length} 份同 ID 差异已保存冲突审计，未覆盖本机报告。`
        : `远端报告有 ${repository.lastSkippedConflictCount} 份同 ID 差异已跳过，未覆盖本机报告。`;
    }
    if (repository.lastError) {
      tone = "warning";
      message = repository.lastError;
      const retrySummary = getReportRepositoryRetrySummary(repository);
      if (retrySummary) {
        message = `${message} ${retrySummary}`;
      }
    }
    const signedReceiptSummary = getReportRepositorySignedReceiptSummary(repository.lastSignedReceipt);
    if (signedReceiptSummary && !repository.lastError) {
      message = `${message} ${signedReceiptSummary}`;
    }
    const remoteRetrySummary = getReportRepositoryRetrySummary(repository);

    return {
      ok: true,
      kind: REPORT_REPOSITORY_KIND,
      mode: repository.mode,
      workspaceId: repository.workspaceId,
      remoteConfigured,
      remoteEndpoint: remoteConfigured ? repository.remoteEndpoint : "",
      hasRemoteToken: Boolean(repository.remoteToken),
      fetchSupported: typeof fetch === "function",
      reportCount,
      teacherReviewedReportCount: reports.filter((report) => report.teacherReview?.note).length,
      verifiedReportCount: reports.filter((report) => Boolean(createReportVerification(report)?.digest)).length,
      tone,
      message,
      boundary: REPORT_REPOSITORY_BOUNDARY,
      lastExportedAt: repository.lastExportedAt,
      lastImportedAt: repository.lastImportedAt,
      lastCheckedAt: repository.lastCheckedAt,
      lastRemoteSyncAt: repository.lastRemoteSyncAt,
      lastRemotePushAt: repository.lastRemotePushAt,
      lastRemoteDirection: repository.lastRemoteDirection,
      lastRemoteStatus: repository.lastRemoteStatus,
      lastExportedReportCount: repository.lastExportedReportCount,
      lastImportedReportCount: repository.lastImportedReportCount,
      lastRemoteReportCount: repository.lastRemoteReportCount,
      lastSkippedConflictCount: repository.lastSkippedConflictCount,
      lastConflictReports: clone(repository.lastConflictReports),
      lastPackageId: repository.lastPackageId,
      lastSignedReceipt: repository.lastSignedReceipt ? clone(repository.lastSignedReceipt) : null,
      signedReceiptCount: repository.signedReceipts.length,
      signedReceipts: clone(repository.signedReceipts),
      signedReceiptStatus: signedReceiptSummary,
      lastRemoteFailureAt: repository.lastRemoteFailureAt,
      lastFailureAction: repository.lastFailureAction,
      remoteRetryAfter: repository.remoteRetryAfter,
      remoteFailureCount: repository.remoteFailureHistory.length,
      remoteFailureHistory: clone(repository.remoteFailureHistory),
      remoteRetrySummary,
      reportPushRetryPending: hasReportRepositoryPushRetryPending(repository),
      lastError: repository.lastError
    };
  }

  function getReportRepositorySignedReceiptSummary(receipt) {
    const normalized = normalizeReportRepositorySignedReceipt(receipt);
    if (!normalized) return "";
    const signatureShort = normalized.signature.slice(0, 12);
    const digestShort = normalized.repositoryDigest.slice(0, 12);
    const acceptedAt = normalized.acceptedAt ? `，${formatPlanDate(normalized.acceptedAt)}` : "";
    const verificationLabel = formatReportRepositoryReceiptVerificationStatus(normalized.verificationStatus);
    return `已收到远端签名回执：${normalized.signatureAlgorithm} / ${normalized.signingKeyId}，空间 ${normalized.workspaceId}，签名 ${signatureShort}，仓库摘要 ${digestShort}${acceptedAt}；${verificationLabel}。`;
  }

  function getReportRepositoryReceiptAudit() {
    const repository = normalizeReportRepository(state.reportRepository);
    const receipts = repository.signedReceipts;
    const verifiedCount = receipts.filter((receipt) => receipt.verificationStatus === "verified").length;
    return {
      ok: true,
      kind: "mr-calligraphy-report-repository-receipt-audit-v1",
      total: receipts.length,
      verifiedCount,
      workspaceId: repository.workspaceId,
      latestReceipt: receipts[0] || null,
      receipts: clone(receipts),
      boundary: REPORT_REPOSITORY_BOUNDARY,
      message: receipts.length
        ? `已保存 ${receipts.length} 条报告仓库签名回执，当前空间 ${repository.workspaceId}，本机校验通过 ${verifiedCount} 条，最近一次：${formatPlanDate(receipts[0].receivedAt || receipts[0].acceptedAt)}。`
        : "暂无报告仓库签名回执。"
    };
  }

  function getReportRepositoryReceiptAuditExport() {
    const audit = getReportRepositoryReceiptAudit();
    if (!audit.total) {
      return {
        ok: false,
        message: "暂无可导出的报告仓库签名回执。"
      };
    }
    const exportedAt = new Date().toISOString();
    return {
      ok: true,
      filename: `mr-calligraphy-report-repository-receipts-${exportedAt.slice(0, 10)}.html`,
      html: renderReportRepositoryReceiptAuditHtml(audit, exportedAt),
      audit,
      message: `已生成 ${audit.total} 条报告仓库签名回执审计导出。`
    };
  }

  function downloadReportRepositoryReceiptAudit() {
    const result = getReportRepositoryReceiptAuditExport();
    if (!result.ok) {
      return result;
    }
    downloadHtml(result.html, result.filename);
    return {
      ok: true,
      filename: result.filename,
      receiptCount: result.audit.total,
      message: result.message
    };
  }

  function renderReportRepositoryReceiptAuditHtml(audit, exportedAt) {
    const rows = audit.receipts.map((receipt) => {
      const warnings = Array.isArray(receipt.warnings) && receipt.warnings.length ? receipt.warnings.join("；") : "无";
      return `
        <section class="receipt">
          <h2>${escapeHtml(receipt.packageId || "packageId 未知")}</h2>
          <dl>
            <dt>方向</dt><dd>${escapeHtml(formatReportRepositoryReceiptDirection(receipt.direction))}</dd>
            <dt>报告数量</dt><dd>${escapeHtml(receipt.reportCount || 0)}</dd>
            <dt>Workspace</dt><dd>${escapeHtml(receipt.workspaceId || REPORT_REPOSITORY_DEFAULT_WORKSPACE)}</dd>
            <dt>签名算法</dt><dd>${escapeHtml(receipt.signatureAlgorithm || "未知")}</dd>
            <dt>签名 Key</dt><dd>${escapeHtml(receipt.signingKeyId || "未知")}</dd>
            <dt>Signature</dt><dd>${escapeHtml(receipt.signature || "未知")}</dd>
            <dt>Repository Digest</dt><dd>${escapeHtml(receipt.repositoryDigest || "未知")}</dd>
            <dt>Receipt Digest</dt><dd>${escapeHtml(receipt.receiptDigest || "未知")}</dd>
            <dt>本机校验</dt><dd>${escapeHtml(formatReportRepositoryReceiptVerificationStatus(receipt.verificationStatus))}</dd>
            <dt>校验说明</dt><dd>${escapeHtml(receipt.verificationMessage || "未执行")}</dd>
            <dt>重算摘要</dt><dd>${escapeHtml(receipt.verificationExpectedDigest || "未知")}</dd>
            <dt>Remote Version</dt><dd>${escapeHtml(receipt.remoteVersion || "未知")}</dd>
            <dt>Endpoint</dt><dd>${escapeHtml(receipt.endpoint || "未知")}</dd>
            <dt>Accepted At</dt><dd>${escapeHtml(receipt.acceptedAt || "未知")}</dd>
            <dt>Received At</dt><dd>${escapeHtml(receipt.receivedAt || "未知")}</dd>
            <dt>Message</dt><dd>${escapeHtml(receipt.message || "无")}</dd>
            <dt>Warnings</dt><dd>${escapeHtml(warnings)}</dd>
          </dl>
          <pre>${escapeHtml(JSON.stringify(receipt, null, 2))}</pre>
        </section>`;
    }).join("");
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>MR 书法报告仓库签名回执审计</title>
  <style>
    body { margin: 0; padding: 32px; color: #1f2937; background: #f7f4ee; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { max-width: 980px; margin: 0 auto; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    .meta { margin: 0 0 18px; color: #5f6b7a; line-height: 1.6; }
    .receipt { margin: 18px 0; padding: 18px; border: 1px solid #ddd3c2; border-radius: 8px; background: #fffaf2; }
    h2 { margin: 0 0 12px; font-size: 17px; overflow-wrap: anywhere; }
    dl { display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 8px 12px; margin: 0; }
    dt { color: #5f6b7a; font-weight: 700; }
    dd { margin: 0; overflow-wrap: anywhere; }
    pre { margin: 14px 0 0; padding: 12px; overflow: auto; border-radius: 6px; background: #1f2937; color: #f8fafc; font-size: 12px; line-height: 1.5; }
  </style>
</head>
<body>
  <main>
    <h1>MR 书法报告仓库签名回执审计</h1>
    <p class="meta">导出时间：${escapeHtml(formatDateTime(exportedAt))} · 回执数量：${audit.total} · 当前空间：${escapeHtml(audit.workspaceId || REPORT_REPOSITORY_DEFAULT_WORKSPACE)}<br>${escapeHtml(audit.boundary)}</p>
    ${rows}
  </main>
</body>
</html>`;
  }

  function formatReportRepositoryReceiptDirection(direction) {
    return {
      check: "检查",
      push: "推送",
      pull: "拉取"
    }[direction] || "远端回执";
  }

  function formatReportRepositoryReceiptVerificationStatus(status) {
    return {
      verified: "本机校验通过",
      "workspace-mismatch": "空间不匹配",
      "digest-mismatch": "摘要不匹配"
    }[status] || "未校验";
  }

  function getReportRepositoryRemoteConfig() {
    const repository = normalizeReportRepository(state.reportRepository);
    return {
      ok: true,
      mode: repository.mode,
      workspaceId: repository.workspaceId,
      remoteEndpoint: repository.remoteEndpoint,
      remoteToken: repository.remoteToken,
      hasRemoteToken: Boolean(repository.remoteToken),
      boundary: REPORT_REPOSITORY_BOUNDARY
    };
  }

  function getReportRepositoryPackage(options = {}) {
    const repository = normalizeReportRepository(state.reportRepository);
    const workspaceId = repository.workspaceId;
    const selectedIds = Array.isArray(options.ids)
      ? new Set(options.ids.map(String).filter(Boolean))
      : null;
    const reports = state.reports
      .filter((report) => !selectedIds || selectedIds.has(report.id))
      .map(normalizeReport)
      .filter(Boolean);
    if (!reports.length) {
      return {
        ok: false,
        message: "还没有可生成同步包的学习报告。"
      };
    }

    const exportedAt = new Date().toISOString();
    const packageId = `report-repository-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const verifications = reports
      .map(createReportVerification)
      .filter(Boolean);
    return {
      ok: true,
      filename: `mr-calligraphy-report-repository-${Date.now()}.json`,
      package: {
        kind: REPORT_REPOSITORY_KIND,
        version: VERSION,
        packageId,
        workspaceId,
        exportedAt,
        storageKey: STORAGE_KEY,
        source: {
          mode: repository.mode,
          workspaceId,
          boundary: REPORT_REPOSITORY_BOUNDARY
        },
        summary: getReportRepositorySummary(reports, verifications),
        reports: clone(reports),
        verifications: clone(verifications)
      },
      message: `已生成 ${reports.length} 份报告的本机报告仓库同步包。${REPORT_REPOSITORY_BOUNDARY}`
    };
  }

  function downloadReportRepository(options = {}) {
    const result = getReportRepositoryPackage(options);
    if (!result.ok) {
      return result;
    }
    downloadJson(result.package, result.filename);
    const now = new Date().toISOString();
    state.reportRepository = normalizeReportRepository({
      ...state.reportRepository,
      mode: "local-json",
      lastExportedAt: now,
      lastCheckedAt: now,
      lastExportedReportCount: result.package.reports.length,
      lastPackageId: result.package.packageId,
      lastSignedReceipt: null,
      signedReceipts: [],
      lastRemoteStatus: "",
      lastError: ""
    });
    addEvent("report-repository-export", `导出报告仓库同步包：${result.package.reports.length} 份报告`);
    saveState();
    return {
      ok: true,
      filename: result.filename,
      exportedReportCount: result.package.reports.length,
      status: getReportRepositoryStatus(),
      message: `已下载报告仓库 JSON 同步包：${result.filename}。${REPORT_REPOSITORY_BOUNDARY}`
    };
  }

  function getReportRepositorySummary(reports = [], verifications = []) {
    const reportCount = reports.length;
    const averageScore = reportCount
      ? Math.round(reports.reduce((sum, report) => sum + normalizeScore(report.averageScore, 0), 0) / reportCount)
      : 0;
    const latestReport = reports
      .slice()
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0] || null;
    return {
      total: reportCount,
      teacherReviewedReportCount: reports.filter((report) => report.teacherReview?.note).length,
      verifiedReportCount: verifications.filter((verification) => /^[a-f0-9]{64}$/.test(verification.digest || "")).length,
      averageScore,
      latestReportId: latestReport?.id || null,
      latestReportAt: latestReport?.createdAt || null
    };
  }

  function parseReportRepositoryPackage(input) {
    let source = input;
    if (typeof input === "string") {
      try {
        source = JSON.parse(input);
      } catch (error) {
        return { ok: false, message: "报告仓库同步包 JSON 解析失败。" };
      }
    }
    if (!source || typeof source !== "object") {
      return { ok: false, message: "报告仓库同步包格式无效。" };
    }
    if (source.kind !== REPORT_REPOSITORY_KIND) {
      return { ok: false, message: "这不是 MR 书法学习报告仓库同步包。" };
    }
    if (!Array.isArray(source.reports)) {
      return { ok: false, message: "报告仓库同步包缺少 reports 数组。" };
    }
    return { ok: true, package: source };
  }

  function recordReportRepositoryError(message, options = {}) {
    const current = normalizeReportRepository(state.reportRepository);
    const now = new Date().toISOString();
    const normalizedMessage = String(message || "报告仓库同步失败。").trim().slice(0, 220);
    const action = normalizeReportRepositoryFailureAction(options.action);
    const trackRemote = Boolean(action || options.trackRemote === true);
    let remoteRetryAfter = current.remoteRetryAfter;
    let remoteFailureHistory = current.remoteFailureHistory;
    let lastRemoteFailureAt = current.lastRemoteFailureAt;
    let lastFailureAction = current.lastFailureAction;

    if (trackRemote) {
      const attemptCount = normalizeInteger(options.attemptCount, current.remoteFailureHistory.length + 1, 1, 9999);
      const retryDelayMs = getReportRepositoryRetryDelayMs(attemptCount, options);
      const retryAfter = retryDelayMs ? new Date(Date.now() + retryDelayMs).toISOString() : now;
      const failure = normalizeReportRepositoryFailure({
        failedAt: now,
        retryAfter,
        attemptCount,
        action: action || "check",
        endpoint: options.endpoint || current.remoteEndpoint,
        workspaceId: options.workspaceId || current.workspaceId,
        packageId: options.packageId || current.lastPackageId || "",
        packageDigest: options.packageDigest || "",
        reportCount: options.reportCount ?? current.lastRemoteReportCount ?? state.reports.length,
        failureKind: options.failureKind || classifyReportRepositoryFailure(normalizedMessage),
        message: normalizedMessage
      });
      remoteFailureHistory = [failure, ...current.remoteFailureHistory]
        .filter(Boolean)
        .slice(0, REPORT_REPOSITORY_MAX_FAILURES);
      remoteRetryAfter = retryAfter;
      lastRemoteFailureAt = now;
      lastFailureAction = failure?.action || action || current.lastFailureAction;
    }

    state.reportRepository = normalizeReportRepository({
      ...current,
      lastCheckedAt: now,
      lastRemoteFailureAt,
      lastFailureAction,
      remoteRetryAfter,
      remoteFailureHistory,
      lastError: normalizedMessage
    });
    saveState();
  }

  function createReportRepositoryConflict(localReport, remoteReport) {
    const local = normalizeReport(localReport);
    const remote = normalizeReport(remoteReport);
    if (!local || !remote) return null;
    const fieldDiffs = REPORT_REPOSITORY_CONFLICT_FIELDS
      .filter((field) => stablePlanStringify(local[field] ?? "") !== stablePlanStringify(remote[field] ?? ""))
      .map((field) => ({
        field,
        label: REPORT_REPOSITORY_CONFLICT_LABELS[field] || field,
        localValue: local[field],
        remoteValue: remote[field]
      }));
    return normalizeReportRepositoryConflict({
      id: remote.id,
      conflictId: `report:${remote.id}`,
      title: remote.title || local.title || `报告 ${remote.id}`,
      localTitle: local.title || local.id,
      remoteTitle: remote.title || remote.id,
      localUpdatedAt: getReportRepositoryRecordUpdatedAt(local),
      remoteUpdatedAt: getReportRepositoryRecordUpdatedAt(remote),
      detectedAt: new Date().toISOString(),
      fieldDiffs,
      remoteReport: remote
    });
  }

  function getReportRepositoryRecordUpdatedAt(report = {}) {
    return report.teacherReview?.reviewedAt || report.generatedAt || report.createdAt || null;
  }

  function getReportRepositoryConflictRecords(conflicts = []) {
    return conflicts
      .map(normalizeReportRepositoryConflict)
      .filter(Boolean)
      .slice(0, REPORT_REPOSITORY_MAX_CONFLICTS);
  }

  function mergeReportRepositoryReports(incomingReports = []) {
    const existingIndex = new Map(state.reports.map((report, index) => [report.id, index]));
    let importedCount = 0;
    let skippedConflictCount = 0;
    const conflicts = [];

    incomingReports
      .map(normalizeReport)
      .filter(Boolean)
      .forEach((report) => {
        if (!existingIndex.has(report.id)) {
          state.reports.push(report);
          existingIndex.set(report.id, state.reports.length - 1);
          importedCount += 1;
          return;
        }
        const existing = normalizeReport(state.reports[existingIndex.get(report.id)]);
        if (stablePlanStringify(existing) === stablePlanStringify(report)) {
          return;
        }
        skippedConflictCount += 1;
        const conflict = createReportRepositoryConflict(existing, report);
        if (conflict) {
          conflicts.push(conflict);
        }
      });

    return {
      importedCount,
      skippedConflictCount,
      conflicts: getReportRepositoryConflictRecords(conflicts)
    };
  }

  function importReportRepositoryPackage(input) {
    const parsed = parseReportRepositoryPackage(input);
    if (!parsed.ok) {
      recordReportRepositoryError(parsed.message);
      return parsed;
    }
    const incomingReports = parsed.package.reports.map(normalizeReport).filter(Boolean);
    if (!incomingReports.length) {
      const message = "报告仓库同步包里没有可导入的报告。";
      recordReportRepositoryError(message);
      return { ok: false, message };
    }

    const merged = mergeReportRepositoryReports(incomingReports);

    const now = new Date().toISOString();
    state.reportRepository = normalizeReportRepository({
      ...state.reportRepository,
      mode: "local-json",
      lastImportedAt: now,
      lastCheckedAt: now,
      lastImportedReportCount: merged.importedCount,
      lastSkippedConflictCount: merged.skippedConflictCount,
      lastConflictReports: merged.conflicts,
      lastPackageId: parsed.package.packageId || null,
      lastSignedReceipt: null,
      signedReceipts: [],
      lastRemoteStatus: "",
      lastError: merged.skippedConflictCount
        ? `有 ${merged.skippedConflictCount} 份同 ID 差异报告已跳过，已保存冲突审计，未覆盖本机报告。`
        : ""
    });
    addEvent("report-repository-import", `导入报告仓库同步包：新增 ${merged.importedCount}，跳过冲突 ${merged.skippedConflictCount}`);
    saveState();
    return {
      ok: true,
      importedCount: merged.importedCount,
      skippedConflictCount: merged.skippedConflictCount,
      conflicts: merged.conflicts,
      totalReportCount: state.reports.length,
      status: getReportRepositoryStatus(),
      message: merged.skippedConflictCount
        ? `已导入报告仓库同步包：新增 ${merged.importedCount} 份，跳过 ${merged.skippedConflictCount} 份同 ID 差异报告，并保存冲突审计。${REPORT_REPOSITORY_BOUNDARY}`
        : `已导入报告仓库同步包：新增 ${merged.importedCount} 份报告。${REPORT_REPOSITORY_BOUNDARY}`
    };
  }

  function configureReportRepositoryRemote(config = {}) {
    const repository = normalizeReportRepository(state.reportRepository);
    const endpointInput = config.remoteEndpoint ?? config.endpoint ?? "";
    const tokenInput = config.remoteToken ?? config.token;
    const workspaceInput = config.workspaceId ?? config.remoteWorkspaceId ?? config.accountId ?? repository.workspaceId;
    const remoteEndpoint = String(endpointInput || "").trim();
    const remoteToken = tokenInput === undefined
      ? repository.remoteToken
      : String(tokenInput || "").trim();
    const workspaceId = normalizeReportRepositoryWorkspaceId(workspaceInput);

    if (!remoteEndpoint) {
      state.reportRepository = normalizeReportRepository({
        ...repository,
        mode: "local-json",
        remoteEndpoint: "",
        remoteToken: "",
        workspaceId,
        lastCheckedAt: new Date().toISOString(),
        lastSignedReceipt: null,
        signedReceipts: [],
        lastSkippedConflictCount: 0,
        lastConflictReports: [],
        lastRemoteStatus: "",
        lastRemoteFailureAt: null,
        lastFailureAction: "",
        remoteRetryAfter: null,
        remoteFailureHistory: [],
        lastError: ""
      });
      addEvent("report-repository-remote", `清除远端报告 API 配置，保留空间 ${workspaceId}`);
      saveState();
      return {
        ok: true,
        status: getReportRepositoryStatus(),
        message: `已清除远端报告 API 配置，当前回到本机报告仓库，空间 ${workspaceId}。`
      };
    }

    const validation = validatePlanRepositoryEndpoint(remoteEndpoint);
    if (!validation.ok) {
      const message = validation.message.replace("远端计划 API", "远端报告 API");
      recordReportRepositoryError(message);
      return { ok: false, status: getReportRepositoryStatus(), message };
    }

    const sameRemoteSpace = validation.endpoint === repository.remoteEndpoint && workspaceId === repository.workspaceId;
    state.reportRepository = normalizeReportRepository({
      ...repository,
      mode: "remote-api",
      remoteEndpoint: validation.endpoint,
      remoteToken,
      workspaceId,
      lastSignedReceipt: sameRemoteSpace ? repository.lastSignedReceipt : null,
      signedReceipts: sameRemoteSpace ? repository.signedReceipts : [],
      lastSkippedConflictCount: sameRemoteSpace ? repository.lastSkippedConflictCount : 0,
      lastConflictReports: sameRemoteSpace ? repository.lastConflictReports : [],
      lastCheckedAt: new Date().toISOString(),
      remoteRetryAfter: null,
      lastRemoteStatus: `远端报告 API 已配置，空间 ${workspaceId} 尚未检查服务可用性。`,
      lastError: ""
    });
    addEvent("report-repository-remote", `配置远端报告 API：${validation.endpoint} / ${workspaceId}`);
    saveState();
    return {
      ok: true,
      status: getReportRepositoryStatus(),
      message: `已保存远端报告 API 配置，空间 ${workspaceId}。请点击“检查远端”确认服务可用。`
    };
  }

  function buildReportRepositoryRequest(repository, options = {}) {
    const headers = {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {})
    };
    if (repository.remoteToken) {
      headers.Authorization = `Bearer ${repository.remoteToken}`;
    }
    headers["X-MR-Workspace-Id"] = normalizeReportRepositoryWorkspaceId(repository.workspaceId);
    return {
      method: options.method || "GET",
      headers,
      ...(options.body ? { body: JSON.stringify(options.body) } : {})
    };
  }

  function requestReportRepository(repository, fetchApi, options = {}) {
    const requestUrl = options.requestUrl || repository.remoteEndpoint;
    const timeoutMs = normalizeInteger(options.timeoutMs, REPORT_REPOSITORY_REQUEST_TIMEOUT_MS, 1, 600000);
    const request = buildReportRepositoryRequest(repository, options);
    let timer = null;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        const error = new Error(`请求超时 ${timeoutMs}ms`);
        error.name = "TimeoutError";
        reject(error);
      }, timeoutMs);
    });
    const requestPromise = Promise.resolve().then(() => fetchApi(requestUrl, request));
    return Promise.race([requestPromise, timeout]).finally(() => {
      if (timer) {
        clearTimeout(timer);
      }
    });
  }

  async function parseRemoteReportRepositoryResponse(response) {
    if (!response || response.ok === false) {
      const status = response?.status ? `HTTP ${response.status}` : "无响应";
      return { ok: false, message: `远端报告 API 请求失败：${status}。` };
    }

    let payload = {};
    try {
      const text = typeof response.text === "function"
        ? await response.text()
        : JSON.stringify(typeof response.json === "function" ? await response.json() : {});
      payload = text ? JSON.parse(text) : {};
    } catch (error) {
      return { ok: false, message: "远端报告 API 返回的不是可解析 JSON。" };
    }

    const candidate = payload.package && typeof payload.package === "object"
      ? payload.package
      : payload.repository && typeof payload.repository === "object"
        ? payload.repository
        : payload;
    const parsed = parseReportRepositoryPackage(candidate);
    const signedReceipt = normalizeReportRepositorySignedReceipt(payload.receipt || payload.latestReceipt || payload.signedReceipt || null);
    if (parsed.ok) {
      return {
        ok: true,
        package: parsed.package,
        signedReceipt,
        message: payload.message || `远端报告仓库包含 ${parsed.package.reports.length} 份报告。`
      };
    }
    if (payload.ok === true) {
      return {
        ok: true,
        package: null,
        signedReceipt,
        message: payload.message || "远端报告 API 检查通过，但没有返回报告包。"
      };
    }
    return {
      ok: false,
      message: payload.message || parsed.message || "远端报告 API 返回格式无效。"
    };
  }

  function formatReportRepositoryNetworkError(action, error) {
    const detail = String(error?.message || "").trim();
    if (error?.name === "TimeoutError" || /超时|timeout/i.test(detail)) {
      return detail
        ? `远端报告 API ${action}失败：请求超时（${detail}）。`
        : `远端报告 API ${action}失败：请求超时。`;
    }
    return detail
      ? `远端报告 API ${action}失败：网络请求异常（${detail}）。`
      : `远端报告 API ${action}失败：网络请求异常。`;
  }

  function checkRemoteReportRepository(options = {}) {
    const repository = normalizeReportRepository(state.reportRepository);
    const remoteConfigured = Boolean(repository.remoteEndpoint);
    const fetchApi = getPlanRepositoryFetch();
    const now = new Date().toISOString();
    state.reportRepository = normalizeReportRepository({
      ...repository,
      mode: remoteConfigured ? "remote-api" : "local-json",
      lastCheckedAt: now,
      lastError: remoteConfigured ? "" : "尚未配置远端报告 repository；当前只能使用本机报告仓库。"
    });
    if (!remoteConfigured || !fetchApi) {
      if (remoteConfigured && !fetchApi) {
        state.reportRepository = normalizeReportRepository({
          ...state.reportRepository,
          lastError: "当前运行环境不支持 fetch，无法检查远端报告 API。"
        });
      }
      saveState();
      const status = getReportRepositoryStatus();
      return { ok: false, status, message: `${status.message} ${REPORT_REPOSITORY_BOUNDARY}` };
    }
    return checkRemoteReportRepositoryAsync(repository, fetchApi, options);
  }

  async function checkRemoteReportRepositoryAsync(repository, fetchApi, options = {}) {
    try {
      const response = await requestReportRepository(repository, fetchApi, options);
      const parsed = await parseRemoteReportRepositoryResponse(response);
      const now = new Date().toISOString();
      if (!parsed.ok) {
        recordReportRepositoryError(parsed.message, {
          action: "check",
          failureKind: classifyReportRepositoryFailure(parsed.message),
          retryDelayMs: options.retryDelayMs
        });
        return { ok: false, status: getReportRepositoryStatus(), message: parsed.message };
      }
      const reportCount = parsed.package?.reports?.length || 0;
      const parsedReceipt = parsed.signedReceipt
        ? decorateReportRepositorySignedReceipt(parsed.signedReceipt, {
          direction: "check",
          endpoint: repository.remoteEndpoint,
          workspaceId: repository.workspaceId,
          receivedAt: now,
          message: parsed.message
        })
        : null;
      const signedReceipt = parsedReceipt || repository.lastSignedReceipt || null;
      state.reportRepository = normalizeReportRepository({
        ...repository,
        mode: "remote-api",
        workspaceId: repository.workspaceId,
        lastCheckedAt: now,
        lastRemoteSyncAt: now,
        lastRemoteDirection: "check",
        lastRemoteReportCount: reportCount,
        lastPackageId: parsed.package?.packageId || repository.lastPackageId,
        lastSignedReceipt: signedReceipt,
        signedReceipts: appendReportRepositorySignedReceipt(repository, parsedReceipt),
        lastRemoteStatus: `${parsed.message} 空间：${repository.workspaceId}。`,
        remoteRetryAfter: null,
        lastError: ""
      });
      addEvent("report-repository-remote-check", `检查远端报告 API：${repository.workspaceId} / ${reportCount} 份报告`);
      saveState();
      return {
        ok: true,
        status: getReportRepositoryStatus(),
        package: parsed.package || null,
        signedReceipt: signedReceipt ? clone(signedReceipt) : null,
        message: `${parsed.message} 空间 ${repository.workspaceId}。${REPORT_REPOSITORY_BOUNDARY}`
      };
    } catch (error) {
      const message = formatReportRepositoryNetworkError("检查", error);
      recordReportRepositoryError(message, {
        action: "check",
        failureKind: classifyReportRepositoryFailure(message),
        retryDelayMs: options.retryDelayMs
      });
      return { ok: false, status: getReportRepositoryStatus(), message };
    }
  }

  function pushReportRepositoryToRemote(options = {}) {
    const repository = normalizeReportRepository(state.reportRepository);
    const fetchApi = getPlanRepositoryFetch();
    if (!repository.remoteEndpoint) {
      return checkRemoteReportRepository(options);
    }
    if (!fetchApi) {
      const message = "当前运行环境不支持 fetch，无法推送报告到远端 API。";
      recordReportRepositoryError(message, {
        action: "push",
        failureKind: "network",
        retryDelayMs: options.retryDelayMs
      });
      return { ok: false, status: getReportRepositoryStatus(), message };
    }
    const packageResult = getReportRepositoryPackage(options);
    if (!packageResult.ok) {
      return packageResult;
    }
    return pushReportRepositoryToRemoteAsync(repository, fetchApi, packageResult.package, options);
  }

  async function pushReportRepositoryToRemoteAsync(repository, fetchApi, repositoryPackage, options = {}) {
    try {
      const response = await requestReportRepository(repository, fetchApi, {
        method: "PUT",
        body: repositoryPackage,
        timeoutMs: options.timeoutMs
      });
      const parsed = await parseRemoteReportRepositoryResponse(response);
      const acceptedPackageId = parsed.package?.packageId || repositoryPackage.packageId;
      const reportCount = repositoryPackage.reports.length;
      const now = new Date().toISOString();
      if (!parsed.ok) {
        const packageDigest = sha256StableJson(repositoryPackage);
        recordReportRepositoryError(parsed.message, {
          action: "push",
          packageId: repositoryPackage.packageId,
          packageDigest,
          reportCount,
          failureKind: classifyReportRepositoryFailure(parsed.message),
          retryDelayMs: options.retryDelayMs
        });
        return { ok: false, status: getReportRepositoryStatus(), message: parsed.message };
      }

      const signedReceipt = parsed.signedReceipt
        ? decorateReportRepositorySignedReceipt(parsed.signedReceipt, {
          direction: "push",
          endpoint: repository.remoteEndpoint,
          workspaceId: repository.workspaceId,
          receivedAt: now,
          message: parsed.message
        })
        : null;
      const remoteStatus = signedReceipt
        ? `已推送 ${reportCount} 份报告到远端 API，空间 ${repository.workspaceId}，并收到签名回执 ${signedReceipt.signature.slice(0, 12)}。`
        : `已推送 ${reportCount} 份报告到远端 API，空间 ${repository.workspaceId}，远端未返回签名回执。`;
      state.reportRepository = normalizeReportRepository({
        ...repository,
        mode: "remote-api",
        workspaceId: repository.workspaceId,
        lastCheckedAt: now,
        lastRemoteSyncAt: now,
        lastRemotePushAt: now,
        lastRemoteDirection: "push",
        lastRemoteReportCount: reportCount,
        lastExportedAt: now,
        lastExportedReportCount: reportCount,
        lastPackageId: acceptedPackageId,
        lastSignedReceipt: signedReceipt,
        signedReceipts: appendReportRepositorySignedReceipt(repository, signedReceipt),
        lastSkippedConflictCount: 0,
        lastConflictReports: [],
        lastRemoteStatus: remoteStatus,
        remoteRetryAfter: null,
        lastError: ""
      });
      addEvent("report-repository-remote-push", `推送报告到远端 API：${repository.workspaceId} / ${reportCount} 份报告`);
      saveState();
      return {
        ok: true,
        status: getReportRepositoryStatus(),
        packageId: acceptedPackageId,
        pushedReportCount: reportCount,
        signedReceipt: signedReceipt ? clone(signedReceipt) : null,
        message: `${remoteStatus} ${REPORT_REPOSITORY_BOUNDARY}`
      };
    } catch (error) {
      const message = formatReportRepositoryNetworkError("推送", error);
      const packageDigest = sha256StableJson(repositoryPackage);
      recordReportRepositoryError(message, {
        action: "push",
        packageId: repositoryPackage.packageId,
        packageDigest,
        reportCount: repositoryPackage.reports.length,
        failureKind: classifyReportRepositoryFailure(message),
        retryDelayMs: options.retryDelayMs
      });
      return { ok: false, status: getReportRepositoryStatus(), message };
    }
  }

  function pullReportRepositoryFromRemote(options = {}) {
    const repository = normalizeReportRepository(state.reportRepository);
    const fetchApi = getPlanRepositoryFetch();
    if (!repository.remoteEndpoint) {
      return checkRemoteReportRepository(options);
    }
    if (!fetchApi) {
      const message = "当前运行环境不支持 fetch，无法从远端 API 拉取报告。";
      recordReportRepositoryError(message, {
        action: "pull",
        failureKind: "network",
        retryDelayMs: options.retryDelayMs
      });
      return { ok: false, status: getReportRepositoryStatus(), message };
    }
    return pullReportRepositoryFromRemoteAsync(repository, fetchApi, options);
  }

  async function pullReportRepositoryFromRemoteAsync(repository, fetchApi, options = {}) {
    try {
      const response = await requestReportRepository(repository, fetchApi, options);
      const parsed = await parseRemoteReportRepositoryResponse(response);
      if (!parsed.ok) {
        recordReportRepositoryError(parsed.message, {
          action: "pull",
          failureKind: classifyReportRepositoryFailure(parsed.message),
          retryDelayMs: options.retryDelayMs
        });
        return { ok: false, status: getReportRepositoryStatus(), message: parsed.message };
      }
      if (!parsed.package) {
        const message = "远端报告 API 没有返回可导入的报告包。";
        recordReportRepositoryError(message, {
          action: "pull",
          failureKind: "response",
          retryDelayMs: options.retryDelayMs
        });
        return { ok: false, status: getReportRepositoryStatus(), message };
      }

      const imported = importReportRepositoryPackage(parsed.package);
      const now = new Date().toISOString();
      const parsedReceipt = parsed.signedReceipt
        ? decorateReportRepositorySignedReceipt(parsed.signedReceipt, {
          direction: "pull",
          endpoint: repository.remoteEndpoint,
          workspaceId: repository.workspaceId,
          receivedAt: now,
          message: parsed.message
        })
        : null;
      const signedReceipt = parsedReceipt || repository.lastSignedReceipt || null;
      state.reportRepository = normalizeReportRepository({
        ...state.reportRepository,
        mode: "remote-api",
        remoteEndpoint: repository.remoteEndpoint,
        remoteToken: repository.remoteToken,
        workspaceId: repository.workspaceId,
        lastCheckedAt: now,
        lastRemoteSyncAt: now,
        lastRemoteDirection: "pull",
        lastRemoteReportCount: parsed.package.reports.length,
        lastImportedAt: now,
        lastImportedReportCount: imported.importedCount || 0,
        lastPackageId: parsed.package.packageId || repository.lastPackageId || null,
        lastSignedReceipt: signedReceipt,
        signedReceipts: appendReportRepositorySignedReceipt(repository, parsedReceipt),
        lastSkippedConflictCount: imported.skippedConflictCount || 0,
        lastRemoteStatus: `已从远端 API 拉取 ${parsed.package.reports.length} 份报告，空间 ${repository.workspaceId}，新增 ${imported.importedCount || 0}，跳过冲突 ${imported.skippedConflictCount || 0}。`,
        remoteRetryAfter: null,
        lastError: imported.skippedConflictCount
          ? `有 ${imported.skippedConflictCount} 份同 ID 差异报告已跳过，已保存冲突审计，未覆盖本机报告。`
          : ""
      });
      addEvent("report-repository-remote-pull", `从远端 API 拉取报告：${repository.workspaceId} / ${parsed.package.reports.length} 份报告`);
      saveState();
      return {
        ok: true,
        status: getReportRepositoryStatus(),
        importedCount: imported.importedCount || 0,
        skippedConflictCount: imported.skippedConflictCount || 0,
        pulledReportCount: parsed.package.reports.length,
        signedReceipt: signedReceipt ? clone(signedReceipt) : null,
        message: imported.skippedConflictCount
          ? `已从远端 API 拉取报告，空间 ${repository.workspaceId}：新增 ${imported.importedCount || 0}，跳过 ${imported.skippedConflictCount} 份同 ID 差异报告，并保存冲突审计。${REPORT_REPOSITORY_BOUNDARY}`
          : `已从远端 API 拉取报告，空间 ${repository.workspaceId}：新增 ${imported.importedCount || 0} 份报告。${REPORT_REPOSITORY_BOUNDARY}`
      };
    } catch (error) {
      const message = formatReportRepositoryNetworkError("拉取", error);
      recordReportRepositoryError(message, {
        action: "pull",
        failureKind: classifyReportRepositoryFailure(message),
        retryDelayMs: options.retryDelayMs
      });
      return { ok: false, status: getReportRepositoryStatus(), message };
    }
  }

  function getReportRepositoryConflicts() {
    const repository = normalizeReportRepository(state.reportRepository);
    return {
      ok: true,
      count: repository.lastConflictReports.length,
      conflicts: clone(repository.lastConflictReports),
      message: repository.lastConflictReports.length
        ? `当前有 ${repository.lastConflictReports.length} 份报告仓库冲突审计。`
        : "当前没有待处理的报告仓库冲突审计。"
    };
  }

  function resolveReportRepositoryConflict(action, options = {}) {
    const strategy = String(action || "").trim();
    const repository = normalizeReportRepository(state.reportRepository);
    const conflicts = repository.lastConflictReports;
    const conflictId = String(options.conflictId || options.id || "").trim();
    const targets = conflictId
      ? conflicts.filter((conflict) => conflict.conflictId === conflictId)
      : conflicts;
    if (!targets.length) {
      return {
        ok: false,
        status: getReportRepositoryStatus(),
        message: "当前没有匹配的报告仓库冲突审计。"
      };
    }

    if (strategy === "copy-remote") {
      const copied = targets.map(copyReportRepositoryConflictRemoteReport).filter(Boolean);
      updateReportRepositoryConflictRecordsAfterResolve(repository, targets, `已将 ${copied.length} 份远端冲突报告另存为本机副本。`);
      addEvent("report-repository-conflict-copy", `远端冲突报告另存副本：${copied.length} 份`);
      saveState();
      return {
        ok: true,
        copiedCount: copied.length,
        copied,
        status: getReportRepositoryStatus(),
        message: `已将 ${copied.length} 份远端冲突报告另存为本机副本；原本机报告仍保留。`
      };
    }

    if (strategy === "merge-fields") {
      return mergeReportRepositoryConflictFields(repository, targets, options);
    }

    if (strategy === "dismiss") {
      updateReportRepositoryConflictRecordsAfterResolve(repository, targets, `已忽略 ${targets.length} 份报告仓库冲突审计。`);
      addEvent("report-repository-conflict-dismiss", `忽略报告仓库冲突审计：${targets.length} 份`);
      saveState();
      return {
        ok: true,
        dismissedCount: targets.length,
        status: getReportRepositoryStatus(),
        message: `已忽略 ${targets.length} 份报告仓库冲突审计；本机报告保持不变。`
      };
    }

    return {
      ok: false,
      status: getReportRepositoryStatus(),
      message: "未知的报告仓库冲突处理方式。"
    };
  }

  function mergeReportRepositoryConflictFields(repository, targets, options = {}) {
    let mergedCount = 0;
    let remoteFieldCount = 0;
    let localFieldCount = 0;

    targets.forEach((conflict) => {
      const localIndex = state.reports.findIndex((report) => report.id === conflict.id);
      const remoteReport = normalizeReport(conflict.remoteReport);
      if (localIndex < 0 || !remoteReport) return;

      const localReport = normalizeReport(state.reports[localIndex]);
      if (!localReport) return;
      const nextReport = clone(localReport);
      const selections = getReportRepositoryConflictMergeSelections(conflict, options);
      const fields = getReportRepositoryMergeFields(conflict);
      fields.forEach((field) => {
        if (stablePlanStringify(localReport[field] ?? "") === stablePlanStringify(remoteReport[field] ?? "")) {
          return;
        }
        const choice = selections[field] === "remote" ? "remote" : "local";
        if (choice === "remote") {
          nextReport[field] = clone(remoteReport[field]);
          remoteFieldCount += 1;
        } else {
          localFieldCount += 1;
        }
      });

      state.reports[localIndex] = normalizeReport(nextReport);
      mergedCount += 1;
    });

    if (!mergedCount) {
      return {
        ok: false,
        status: getReportRepositoryStatus(),
        message: "没有找到可字段合并的本机冲突报告。"
      };
    }

    updateReportRepositoryConflictRecordsAfterResolve(
      repository,
      targets,
      `已按字段合并 ${mergedCount} 份报告仓库冲突，远端字段 ${remoteFieldCount} 项，本机字段 ${localFieldCount} 项。`
    );
    addEvent("report-repository-conflict-merge", `字段级合并报告仓库冲突：${mergedCount} 份`);
    saveState();
    return {
      ok: true,
      mergedCount,
      remoteFieldCount,
      localFieldCount,
      status: getReportRepositoryStatus(),
      message: `已按字段合并 ${mergedCount} 份报告仓库冲突：采用远端字段 ${remoteFieldCount} 项，保留本机字段 ${localFieldCount} 项。`
    };
  }

  function getReportRepositoryMergeFields(conflict) {
    const diffFields = Array.isArray(conflict.fieldDiffs)
      ? conflict.fieldDiffs.map((field) => String(field.field || "").trim()).filter(Boolean)
      : [];
    return [...new Set([...diffFields, ...REPORT_REPOSITORY_CONFLICT_FIELDS])];
  }

  function getReportRepositoryConflictMergeSelections(conflict, options = {}) {
    const source = options && typeof options === "object" ? options : {};
    const selections = source.selections && typeof source.selections === "object"
      ? source.selections
      : source.fields && typeof source.fields === "object"
        ? source.fields
        : source;
    const nested = selections?.[conflict.conflictId] || selections?.[conflict.id] || selections;
    const result = {};
    Object.entries(nested || {}).forEach(([field, value]) => {
      if (["conflictId", "id", "selections", "fields"].includes(field)) return;
      result[field] = value === "remote" ? "remote" : "local";
    });
    return result;
  }

  function updateReportRepositoryConflictRecordsAfterResolve(repository, targets, statusMessage) {
    const targetIds = new Set(targets.map((conflict) => conflict.conflictId));
    const remaining = repository.lastConflictReports.filter((conflict) => !targetIds.has(conflict.conflictId));
    state.reportRepository = normalizeReportRepository({
      ...repository,
      lastCheckedAt: new Date().toISOString(),
      lastSkippedConflictCount: remaining.length,
      lastConflictReports: remaining,
      lastRemoteStatus: statusMessage,
      lastError: remaining.length
        ? `仍有 ${remaining.length} 份报告仓库冲突审计待处理。`
        : ""
    });
  }

  function copyReportRepositoryConflictRemoteReport(conflict) {
    const normalized = normalizeReport(conflict.remoteReport);
    if (!normalized) return null;
    const copy = clone(normalized);
    copy.id = makeId("report-remote-copy");
    copy.title = appendHistoryRepositoryCopyTitle(copy.title || conflict.remoteTitle || conflict.title || "远端冲突报告");
    copy.latestSessionId = null;
    copy.latestArtworkId = null;
    state.reports.push(normalizeReport(copy));
    return copy;
  }

  function createReportHtml(report, verification = null) {
    const normalizedReport = normalizeReport(report);
    const verificationInfo = verification || createReportVerification(normalizedReport);
    const metrics = normalizedReport.scoreBreakdown;
    const trend = normalizedReport.trend.length ? normalizedReport.trend : getReportTrend();
    const latestArtwork = findReportArtwork(normalizedReport);
    const latestSession = findReportSession(normalizedReport);
    const scoreEvidenceSummary = getReportScoreEvidenceSummary(normalizedReport, latestSession, latestArtwork);
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
    const scoreEvidenceBlock = scoreEvidenceSummary
      ? `<section class="score-evidence" aria-label="基础评分证据"><h2>基础评分证据</h2><p>${escapeHtml(scoreEvidenceSummary.summary || "本报告保留了最近一次本机评分证据。")}</p><dl><div><dt>算法</dt><dd>${escapeHtml(scoreEvidenceSummary.algorithmVersion)}</dd></div><div><dt>来源</dt><dd>${escapeHtml(scoreEvidenceSummary.sourceType === "artwork" ? "最近作品" : "最近练习")} · ${escapeHtml(scoreEvidenceSummary.copybook || "通用范字")}</dd></div><div><dt>笔顺</dt><dd>匹配 ${scoreEvidenceSummary.strokeOrderMatchPercent}% · 覆盖 ${scoreEvidenceSummary.strokeOrderCoveragePercent}% · 形态 ${scoreEvidenceSummary.strokeShapeMatchPercent}%</dd></div><div><dt>路径</dt><dd>贴合 ${scoreEvidenceSummary.pathFitPercent}% · 误差 ${scoreEvidenceSummary.pathErrorPercent}% · 采样 ${scoreEvidenceSummary.pathErrorSampleCount} 点</dd></div><div><dt>压感</dt><dd>${scoreEvidenceSummary.pressurePointCount} 点 · 跨度 ${scoreEvidenceSummary.pressureSpreadPercent}%</dd></div></dl>${scoreEvidenceSummary.targetStrokeNames.length ? `<p class="muted">范字笔顺：${escapeHtml(scoreEvidenceSummary.targetStrokeNames.slice(0, 8).join("、"))}</p>` : ""}${scoreEvidenceSummary.hotspots.length ? `<ul>${scoreEvidenceSummary.hotspots.slice(0, 4).map((item) => `<li>${escapeHtml(item.label || item.zone)}：误差 ${item.errorPercent}% / ${item.sampleCount} 点</li>`).join("")}</ul>` : ""}${scoreEvidenceSummary.weakestReason ? `<p class="muted">最低项：${escapeHtml(scoreEvidenceSummary.weakestReason.label)} ${scoreEvidenceSummary.weakestReason.score} 分，${escapeHtml(scoreEvidenceSummary.weakestReason.evidence)}</p>` : ""}<small>${escapeHtml(scoreEvidenceSummary.disclaimer)}</small></section>`
      : `<section class="score-evidence is-empty" aria-label="基础评分证据"><h2>基础评分证据</h2><p>暂无可写入报告的真实评分证据。完成一次书写并保存作品后，报告会记录算法版本、笔顺、路径误差和压感摘要。</p></section>`;
    const trendBars = trend.length
      ? trend.map((item) => {
        const height = Math.max(8, Math.round((item.score / maxTrendScore) * 100));
        return `<li><span class="bar" style="height:${height}%"></span><strong>${item.score}</strong><small>${escapeHtml(item.label)}</small></li>`;
      }).join("")
      : `<li class="trend-empty"><small>暂无分数趋势</small></li>`;
    const teacherReviewSignature = normalizedReport.teacherReview?.localSignatureDigest || "";
    const teacherReviewBlock = normalizedReport.teacherReview
      ? `<section class="teacher-review"><h2>教师批注</h2><p>${escapeHtml(normalizedReport.teacherReview.note)}</p><small>${escapeHtml(normalizedReport.teacherReview.reviewer)} · ${escapeHtml(formatReportTeacherReviewRole(normalizedReport.teacherReview.role))} · ${escapeHtml(formatDateTime(normalizedReport.teacherReview.reviewedAt))} · 本机签名 ${escapeHtml(teacherReviewSignature ? teacherReviewSignature.slice(0, 16) : "未生成")}</small></section>`
      : `<section class="teacher-review is-empty"><h2>教师批注</h2><p>暂无本机教师批注。</p><small>批注会保存在当前浏览器报告记录中，不代表云端教师端。</small></section>`;
    const verificationBlock = verificationInfo
      ? `<section class="report-verification" aria-label="报告本机验真摘要"><h2>本机验真摘要</h2><dl><div><dt>算法</dt><dd>${escapeHtml(verificationInfo.algorithm)}</dd></div><div><dt>摘要</dt><dd><code>${escapeHtml(verificationInfo.digest)}</code></dd></div><div><dt>来源</dt><dd>${escapeHtml(verificationInfo.storageKey)} · ${escapeHtml(verificationInfo.kind)}</dd></div></dl><p class="muted">${escapeHtml(verificationInfo.boundary)}</p></section>`
      : "";

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
    .score-evidence { padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    .score-evidence p { margin-top: 8px; }
    .score-evidence dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 12px 0 0; }
    .score-evidence div { padding: 10px; border: 1px solid var(--line); border-radius: 8px; background: var(--wash); }
    .score-evidence dt { color: var(--muted); font-size: 12px; }
    .score-evidence dd { margin: 2px 0 0; font-weight: 800; }
    .score-evidence ul { display: grid; gap: 6px; margin: 12px 0 0; padding-left: 20px; }
    .score-evidence small { display: block; margin-top: 10px; color: var(--muted); }
    .score-evidence.is-empty { color: var(--muted); }
    .recommendations { display: grid; gap: 8px; margin: 12px 0 0; padding-left: 20px; }
    .teacher-review { margin-top: 26px; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fffdf8; }
    .teacher-review p { margin-top: 8px; }
    .teacher-review small { display: block; margin-top: 10px; color: var(--muted); }
    .teacher-review.is-empty { color: var(--muted); background: #ffffff; }
    .report-verification { margin-top: 26px; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    .report-verification dl { display: grid; gap: 8px; margin: 10px 0 0; }
    .report-verification div { display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 10px; align-items: start; }
    .report-verification dt { color: var(--muted); font-size: 12px; }
    .report-verification dd { margin: 0; }
    .report-verification code { word-break: break-all; font-family: "SFMono-Regular", Consolas, monospace; font-size: 12px; }
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

    ${scoreEvidenceBlock}

    <section>
      <h2>练习建议</h2>
      <ol class="recommendations">
        ${(normalizedReport.recommendations.length ? normalizedReport.recommendations : ["完成一次书写并保存作品后，会生成更具体的复盘建议。"]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ol>
    </section>

    ${teacherReviewBlock}
    ${verificationBlock}

    <footer>报告数据来自本机浏览器存储：${escapeHtml(STORAGE_KEY)}。报告水印：${escapeHtml(watermarkText)}。验真摘要：${escapeHtml(verificationInfo?.digest || "未生成")}。如需迁移项目，请在主后台导出项目档案。</footer>
  </main>
</body>
</html>`;
  }

  function getReportPdfExport(reportId = null) {
    const report = reportId
      ? state.reports.find((item) => item.id === String(reportId))
      : state.reports[state.reports.length - 1];
    if (!report) {
      return { ok: false, message: "还没有可导出的 PDF 学习报告。" };
    }

    const normalizedReport = normalizeReport(report);
    const verification = createReportVerification(normalizedReport);
    const pdfResult = createReportPdf(normalizedReport, verification);
    const pdf = typeof pdfResult === "string" ? pdfResult : pdfResult.pdf;
    const pdfFeatures = pdfResult?.features || {};
    const latestArtwork = findReportArtwork(normalizedReport);
    const latestSession = findReportSession(normalizedReport);
    const scoreEvidenceSummary = getReportScoreEvidenceSummary(normalizedReport, latestSession, latestArtwork);
    const trendCount = normalizeInteger(pdfFeatures.trendCount, 0, 0, 99);
    const radarMetricCount = normalizeInteger(pdfFeatures.radarMetricCount, 0, 0, 99);
    return {
      ok: true,
      report: clone(normalizedReport),
      verification: clone(verification),
      filename: `mr-calligraphy-report-${normalizedReport.id}.pdf`,
      mimeType: "application/pdf",
      pdf,
      byteLength: pdf.length,
      features: {
        metricBars: true,
        metricCount: 5,
        radarChart: Boolean(pdfFeatures.radarChart),
        radarMetricCount,
        trendBars: Boolean(pdfFeatures.trendBars),
        trendCount,
        artworkCard: true,
        artworkAvailable: Boolean(latestArtwork),
        artworkImageAvailable: Boolean(latestArtwork?.imageData),
        artworkImageEmbedded: Boolean(pdfFeatures.artworkImageEmbedded),
        artworkImageMime: pdfFeatures.artworkImageMime || "",
        artworkImageDigest: pdfFeatures.artworkImageDigest || "",
        teacherReview: Boolean(normalizedReport.teacherReview),
        teacherReviewSignatureDigest: normalizedReport.teacherReview?.localSignatureDigest || "",
        scoreEvidenceSummary: Boolean(scoreEvidenceSummary),
        scoreEvidenceAlgorithm: scoreEvidenceSummary?.algorithmVersion || "",
        scoreEvidencePathFitPercent: scoreEvidenceSummary?.pathFitPercent || 0,
        verification: Boolean(verification),
        verificationDigest: verification?.digest || ""
      },
      message: pdfFeatures.artworkImageEmbedded
        ? "已生成包含能力条形图、能力雷达图、分数趋势图、最近作品截图、评分证据摘要、教师批注状态和本机验真摘要的原生 PDF 学习报告。"
        : "已生成包含能力条形图、能力雷达图、分数趋势图、最近作品卡片、评分证据摘要、教师批注状态和本机验真摘要的原生 PDF 学习报告。"
    };
  }

  function getReportHtmlExport(reportId = null) {
    const report = reportId
      ? state.reports.find((item) => item.id === String(reportId))
      : state.reports[state.reports.length - 1];
    if (!report) {
      return { ok: false, message: "还没有可导出的 HTML 学习报告。" };
    }
    const normalizedReport = normalizeReport(report);
    const verification = createReportVerification(normalizedReport);
    const latestArtwork = findReportArtwork(normalizedReport);
    const latestSession = findReportSession(normalizedReport);
    const scoreEvidenceSummary = getReportScoreEvidenceSummary(normalizedReport, latestSession, latestArtwork);
    return {
      ok: true,
      report: clone(normalizedReport),
      verification: clone(verification),
      filename: `mr-calligraphy-report-${normalizedReport.id}.html`,
      mimeType: "text/html;charset=utf-8",
      html: createReportHtml(normalizedReport, verification),
      features: {
        scoreEvidenceSummary: Boolean(scoreEvidenceSummary),
        scoreEvidenceAlgorithm: scoreEvidenceSummary?.algorithmVersion || "",
        scoreEvidencePathFitPercent: scoreEvidenceSummary?.pathFitPercent || 0,
        teacherReview: Boolean(normalizedReport.teacherReview),
        teacherReviewSignatureDigest: normalizedReport.teacherReview?.localSignatureDigest || "",
        verification: Boolean(verification),
        verificationDigest: verification?.digest || ""
      },
      message: "已生成包含评分证据摘要、本机教师批注状态和验真摘要的 HTML 学习报告。"
    };
  }

  function createReportPdf(report, verification = null) {
    const normalizedReport = normalizeReport(report);
    const verificationInfo = verification || createReportVerification(normalizedReport);
    const latestSession = findReportSession(normalizedReport);
    const latestArtwork = findReportArtwork(normalizedReport);
    const scoreEvidenceSummary = getReportScoreEvidenceSummary(normalizedReport, latestSession, latestArtwork);
    const metricLabels = [
      ["structure", "结构"],
      ["stroke", "笔画"],
      ["technique", "笔法"],
      ["fluency", "流畅"],
      ["force", "力度"]
    ];
    const metricItems = metricLabels.map(([key, label]) => ({
      key,
      label,
      value: normalizeScore(normalizedReport.scoreBreakdown?.[key], 0)
    }));
    const radarMetricCount = metricItems.filter((item) => item.value > 0).length;
    const trendItems = (normalizedReport.trend.length ? normalizedReport.trend : getReportTrend(normalizedReport))
      .map(normalizeReportTrendPoint)
      .filter((item) => item && item.score > 0)
      .slice(-8);
    const artworkPdfImage = createReportPdfArtworkImage(latestArtwork);
    const lines = [
      { text: "MR 书法学习报告", size: 22 },
      { text: `报告 ID：${normalizedReport.id}`, size: 11 },
      { text: `生成时间：${formatDateTime(normalizedReport.createdAt)}`, size: 11 },
      { text: `来源：${STORAGE_KEY}。这是本机原生 PDF 导出，不是云端长期报告。`, size: 10 },
      { text: "", size: 6 },
      { text: `摘要：${normalizedReport.summary || "本报告基于当前浏览器中的练习、作品和评分记录生成。"}`, size: 12 },
      { text: `练习次数：${normalizedReport.sessionCount}    保存作品：${normalizedReport.artworkCount}    平均评分：${normalizedReport.averageScore}    学习分钟：${normalizedReport.learningMinutes}`, size: 12 },
      { text: "", size: 6 },
      { text: "能力维度", size: 16 },
      { type: "metricBars", items: metricItems, radarChart: radarMetricCount > 0 },
      { text: "分数趋势", size: 16 },
      { type: "trendBars", items: trendItems },
      { text: "", size: 6 },
      { text: "最近练习与作品", size: 16 },
      {
        text: latestSession
          ? `最近练习：${latestSession.glyph || "-"}字，${latestSession.strokeCount || 0} 笔，${latestSession.pointCount || 0} 个采样点，评分 ${latestSession.score || 0}。`
          : "最近练习：暂无可统计的练习会话。",
        size: 12
      },
      {
        text: latestArtwork
          ? `最近作品：${latestArtwork.title || "作品"}，${latestArtwork.strokeCount || 0} 笔，${latestArtwork.pointCount || 0} 个采样点，评分 ${latestArtwork.score || 0}。`
          : "最近作品：暂无保存作品。",
        size: 12
      },
      { type: "artworkCard", artwork: latestArtwork, session: latestSession, image: artworkPdfImage },
      { text: "", size: 6 },
      { text: "评分证据摘要", size: 16 },
      {
        text: scoreEvidenceSummary
          ? `算法：${scoreEvidenceSummary.algorithmVersion}；来源：${scoreEvidenceSummary.sourceType === "artwork" ? "最近作品" : "最近练习"}；范字：${scoreEvidenceSummary.copybook || "通用范字"}；笔顺匹配 ${scoreEvidenceSummary.strokeOrderMatchPercent}%；路径贴合 ${scoreEvidenceSummary.pathFitPercent}%；路径误差 ${scoreEvidenceSummary.pathErrorPercent}%；压感 ${scoreEvidenceSummary.pressurePointCount} 点。`
          : "暂无可写入报告的真实评分证据。",
        size: 12
      },
      {
        text: scoreEvidenceSummary?.hotspots?.length
          ? `误差热力：${scoreEvidenceSummary.hotspots.slice(0, 3).map((item) => `${item.label || item.zone}${item.errorPercent}%`).join("；")}。`
          : "误差热力：暂无高误差区域。",
        size: 10
      },
      { text: "", size: 6 },
      { text: "教师批注", size: 16 },
      {
        text: normalizedReport.teacherReview
          ? `${normalizedReport.teacherReview.reviewer}（${formatReportTeacherReviewRole(normalizedReport.teacherReview.role)}）：${normalizedReport.teacherReview.note}`
          : "暂无本机教师批注。",
        size: 12
      },
      {
        text: normalizedReport.teacherReview
          ? `批注时间：${formatDateTime(normalizedReport.teacherReview.reviewedAt)}。来源：本机教师批注记录。本机签名：${normalizedReport.teacherReview.localSignatureDigest || "无"}。`
          : "教师批注功能只保存到当前浏览器报告记录，不代表云端教师端。",
        size: 10
      },
      { text: "", size: 6 },
      { text: "本机验真摘要", size: 16 },
      { text: `算法：${verificationInfo.algorithm}    类型：${verificationInfo.kind}`, size: 10 },
      { text: `摘要：${verificationInfo.digest}`, size: 10 },
      { text: `边界：${verificationInfo.boundary}`, size: 9 },
      { text: "", size: 6 },
      { text: "练习建议", size: 16 },
      ...(normalizedReport.recommendations.length ? normalizedReport.recommendations : ["完成一次书写并保存作品后，会生成更具体的复盘建议。"])
        .slice(0, 6)
        .map((item, index) => ({ text: `${index + 1}. ${item}`, size: 12 }))
    ];

    const pdf = createSimplePdf(lines, {
      title: "MR Calligraphy Report",
      subject: normalizedReport.id,
      source: STORAGE_KEY,
      metricCount: metricItems.length,
      radarChart: radarMetricCount > 0,
      radarMetricCount,
      trendCount: trendItems.length,
      artworkCard: true,
      artworkAvailable: Boolean(latestArtwork),
      artworkImageAvailable: Boolean(latestArtwork?.imageData),
      artworkImageEmbedded: Boolean(artworkPdfImage),
      artworkImageMime: artworkPdfImage?.mimeType || "",
      artworkImageDigest: artworkPdfImage?.digest || "",
      teacherReview: Boolean(normalizedReport.teacherReview),
      teacherReviewSignatureDigest: normalizedReport.teacherReview?.localSignatureDigest || "",
      scoreEvidenceSummary: Boolean(scoreEvidenceSummary),
      scoreEvidenceAlgorithm: scoreEvidenceSummary?.algorithmVersion || "",
      scoreEvidencePathFitPercent: scoreEvidenceSummary?.pathFitPercent || 0,
      verificationKind: verificationInfo.kind,
      verificationAlgorithm: verificationInfo.algorithm,
      verificationDigest: verificationInfo.digest
    });
    return {
      pdf,
      features: {
        radarChart: radarMetricCount > 0,
        radarMetricCount,
        trendBars: trendItems.length > 0,
        trendCount: trendItems.length,
        artworkImageEmbedded: Boolean(artworkPdfImage),
        artworkImageMime: artworkPdfImage?.mimeType || "",
        artworkImageDigest: artworkPdfImage?.digest || "",
        teacherReviewSignatureDigest: normalizedReport.teacherReview?.localSignatureDigest || "",
        scoreEvidenceSummary: Boolean(scoreEvidenceSummary),
        scoreEvidenceAlgorithm: scoreEvidenceSummary?.algorithmVersion || "",
        scoreEvidencePathFitPercent: scoreEvidenceSummary?.pathFitPercent || 0
      }
    };
  }

  function createReportPdfArtworkImage(artwork) {
    const imageData = typeof artwork?.imageData === "string" ? artwork.imageData : "";
    if (!imageData) return null;
    const parsed = parseReportPdfImageDataUrl(imageData);
    if (!parsed || parsed.bytes.length > REPORT_PDF_MAX_EMBEDDED_IMAGE_BYTES) return null;
    if (!/^image\/jpe?g$/i.test(parsed.mimeType)) return null;
    const dimensions = getJpegDimensions(parsed.bytes);
    if (!dimensions) return null;
    return {
      mimeType: "image/jpeg",
      width: dimensions.width,
      height: dimensions.height,
      hex: bytesToHex(parsed.bytes),
      digest: sha256Hex(imageData)
    };
  }

  function parseReportPdfImageDataUrl(dataUrl) {
    const match = String(dataUrl || "").match(/^data:([^;,]+);base64,([\s\S]+)$/i);
    if (!match) return null;
    const bytes = decodeBase64ToBytes(match[2]);
    if (!bytes?.length) return null;
    return {
      mimeType: match[1].toLowerCase(),
      bytes
    };
  }

  function decodeBase64ToBytes(base64) {
    const clean = String(base64 || "").replace(/\s+/g, "");
    if (!clean) return null;
    try {
      if (typeof atob === "function") {
        const binary = atob(clean);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
          bytes[index] = binary.charCodeAt(index);
        }
        return bytes;
      }
      if (typeof Buffer !== "undefined") {
        return new Uint8Array(Buffer.from(clean, "base64"));
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  function getJpegDimensions(bytes) {
    if (!bytes || bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
    let index = 2;
    const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    while (index + 3 < bytes.length) {
      while (index < bytes.length && bytes[index] !== 0xff) index += 1;
      while (index < bytes.length && bytes[index] === 0xff) index += 1;
      const marker = bytes[index];
      index += 1;
      if (!marker || marker === 0xd9 || marker === 0xda) break;
      if (index + 1 >= bytes.length) break;
      const segmentLength = (bytes[index] << 8) + bytes[index + 1];
      if (segmentLength < 2 || index + segmentLength > bytes.length) break;
      if (sofMarkers.has(marker) && segmentLength >= 7) {
        const height = (bytes[index + 3] << 8) + bytes[index + 4];
        const width = (bytes[index + 5] << 8) + bytes[index + 6];
        return width > 0 && height > 0 ? { width, height } : null;
      }
      index += segmentLength;
    }
    return null;
  }

  function bytesToHex(bytes) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  function createSimplePdf(lines, metadata = {}) {
    const pageWidth = 595;
    const pageHeight = 842;
    const marginX = 54;
    const startY = 790;
    const minY = 60;
    const maxChars = 38;
    const content = [];
    const pdfImages = [];
    let y = startY;
    const drawTextAt = (text, size, x, textY) => {
      content.push(`0.07 0.11 0.10 rg BT /F1 ${size} Tf ${x} ${textY} Td <${toUtf16BEHex(text)}> Tj ET`);
    };
    const drawRect = (x, rectY, width, height, color = "0.90 0.94 0.92") => {
      content.push(`${color} rg ${x} ${rectY} ${width} ${height} re f`);
    };
    const strokeRect = (x, rectY, width, height, color = "0.72 0.78 0.75") => {
      content.push(`${color} RG 0.8 w ${x} ${rectY} ${width} ${height} re S`);
    };
    const formatPdfNumber = (value) => Number(value || 0).toFixed(2).replace(/\.?0+$/, "");
    const drawStrokeLine = (x1, y1, x2, y2, color = "0.72 0.78 0.75", width = 0.8) => {
      content.push(`${color} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
    };
    const drawPolygon = (points = [], strokeColor = "0.72 0.78 0.75", fillColor = "", width = 0.8) => {
      const validPoints = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
      if (validPoints.length < 3) return;
      const path = validPoints
        .map((point, index) => `${formatPdfNumber(point.x)} ${formatPdfNumber(point.y)} ${index ? "l" : "m"}`)
        .join(" ");
      content.push(`${fillColor ? `${fillColor} rg ` : ""}${strokeColor} RG ${width} w ${path} h ${fillColor ? "B" : "S"}`);
    };
    const drawLine = (text, size = 12) => {
      const lineHeight = Math.max(14, Math.round(size * 1.45));
      if (y < minY) return;
      drawTextAt(text, size, marginX, y);
      y -= lineHeight;
    };
    const registerImage = (image) => {
      if (!image?.hex || !image.width || !image.height) return null;
      const existing = pdfImages.find((item) => item.digest && item.digest === image.digest);
      if (existing) return existing;
      const item = {
        ...image,
        name: `Im${pdfImages.length + 1}`
      };
      pdfImages.push(item);
      return item;
    };
    const drawImage = (image, x, imageY, boxWidth, boxHeight) => {
      const registered = registerImage(image);
      if (!registered) return false;
      const scale = Math.min(boxWidth / registered.width, boxHeight / registered.height);
      const width = Number((registered.width * scale).toFixed(2));
      const height = Number((registered.height * scale).toFixed(2));
      const offsetX = Number((x + (boxWidth - width) / 2).toFixed(2));
      const offsetY = Number((imageY + (boxHeight - height) / 2).toFixed(2));
      content.push(`q ${width} 0 0 ${height} ${offsetX} ${offsetY} cm /${registered.name} Do Q`);
      return true;
    };
    const drawMetricBars = (items = [], options = {}) => {
      const normalizedItems = items
        .map((item) => ({
          label: String(item.label || item.key || "维度"),
          value: normalizeScore(item.value, 0)
        }))
        .filter((item) => item.label);
      if (!normalizedItems.length) return;

      const rowHeight = 23;
      const withRadar = Boolean(options.radarChart && normalizedItems.some((item) => item.value > 0));
      const labelX = marginX;
      const trackX = marginX + 68;
      const trackWidth = withRadar ? 178 : 310;
      const trackHeight = 9;
      const valueX = trackX + trackWidth + 14;
      const blockHeight = Math.max(normalizedItems.length * rowHeight + 12, withRadar ? 126 : 0);
      if (y - blockHeight < minY) return;

      content.push(`% MetricBars: ${normalizedItems.length}`);
      content.push(`% RadarChart: ${withRadar ? normalizedItems.length : 0}`);
      drawRect(marginX - 10, y - blockHeight + 6, 466, blockHeight, "0.97 0.99 0.97");
      strokeRect(marginX - 10, y - blockHeight + 6, 466, blockHeight, "0.81 0.87 0.84");
      normalizedItems.forEach((item, index) => {
        const rowY = y - 18 - index * rowHeight;
        const fillWidth = Number(((trackWidth * item.value) / 100).toFixed(2));
        drawTextAt(item.label, 10, labelX, rowY);
        drawRect(trackX, rowY - 1, trackWidth, trackHeight, "0.86 0.91 0.88");
        drawRect(trackX, rowY - 1, fillWidth, trackHeight, "0.14 0.48 0.40");
        drawTextAt(`${item.value} 分`, 10, valueX, rowY);
      });
      if (withRadar) {
        const cardY = y - blockHeight + 6;
        const centerX = marginX + 374;
        const centerY = cardY + 64;
        const radius = 42;
        const angleFor = (index) => -Math.PI / 2 + (Math.PI * 2 * index) / normalizedItems.length;
        const pointFor = (score, index) => {
          const distance = radius * (normalizeScore(score, 0) / 100);
          const angle = angleFor(index);
          return {
            x: Number((centerX + Math.cos(angle) * distance).toFixed(2)),
            y: Number((centerY + Math.sin(angle) * distance).toFixed(2))
          };
        };
        const outerPoints = normalizedItems.map((_, index) => pointFor(100, index));
        [0.25, 0.5, 0.75, 1].forEach((ratio) => {
          drawPolygon(
            normalizedItems.map((_, index) => pointFor(100 * ratio, index)),
            "0.76 0.82 0.79",
            "",
            0.45
          );
        });
        outerPoints.forEach((point) => drawStrokeLine(centerX, centerY, point.x, point.y, "0.76 0.82 0.79", 0.45));
        const areaPoints = normalizedItems.map((item, index) => pointFor(item.value, index));
        drawPolygon(areaPoints, "0.14 0.48 0.40", "0.70 0.84 0.80", 1.1);
        areaPoints.forEach((point) => drawRect(point.x - 1.6, point.y - 1.6, 3.2, 3.2, "0.08 0.36 0.30"));
        drawTextAt("能力雷达", 8, centerX - 24, centerY + radius + 11);
      }
      y -= blockHeight + 8;
    };
    const drawTrendBars = (items = []) => {
      const normalizedItems = items
        .map((item, index) => ({
          label: String(item.label || `记录${index + 1}`),
          score: normalizeScore(item.score, 0)
        }))
        .filter((item) => item.score > 0)
        .slice(-8);
      const blockHeight = normalizedItems.length ? 86 : 48;
      if (y - blockHeight < minY) return;

      const cardX = marginX - 10;
      const cardY = y - blockHeight + 8;
      content.push(`% TrendBars: ${normalizedItems.length}`);
      drawRect(cardX, cardY, 466, blockHeight, "0.97 0.98 0.99");
      strokeRect(cardX, cardY, 466, blockHeight, "0.80 0.85 0.88");

      if (!normalizedItems.length) {
        drawTextAt("暂无真实分数趋势。完成练习或保存作品后，PDF 会写入趋势图。", 10, marginX, y - 22);
        y -= blockHeight + 8;
        return;
      }

      const chartX = marginX + 6;
      const chartY = cardY + 22;
      const chartWidth = 406;
      const chartHeight = 38;
      const columnWidth = chartWidth / normalizedItems.length;
      drawTextAt("按创建时间排序，最多展示最近 8 条练习/作品分数。", 9, marginX, y - 16);
      drawStrokeLine(chartX, chartY, chartX + chartWidth, chartY, "0.70 0.76 0.78", 0.7);
      normalizedItems.forEach((item, index) => {
        const barHeight = Math.max(5, Number(((chartHeight * item.score) / 100).toFixed(2)));
        const barWidth = Math.max(12, Math.min(28, Number((columnWidth * 0.42).toFixed(2))));
        const barX = Number((chartX + index * columnWidth + (columnWidth - barWidth) / 2).toFixed(2));
        const barY = chartY;
        drawRect(barX, barY, barWidth, barHeight, "0.18 0.43 0.64");
        drawTextAt(`${item.score}`, 7, Math.max(cardX + 4, barX - 1), barY + barHeight + 7);
        drawTextAt(`${index + 1}`, 7, barX + barWidth / 2 - 2, cardY + 9);
      });
      y -= blockHeight + 8;
    };
    const drawArtworkCard = (artwork, session, image = null) => {
      const blockHeight = artwork ? 92 : 52;
      if (y - blockHeight < minY) return;

      const cardX = marginX - 10;
      const cardY = y - blockHeight + 8;
      content.push(`% ArtworkCard: ${artwork ? "yes" : "empty"}`);
      content.push(`% ArtworkImageAvailable: ${artwork?.imageData ? "yes" : "no"}`);
      content.push(`% ArtworkImageEmbedded: ${image ? "yes" : "no"}`);
      drawRect(cardX, cardY, 466, blockHeight, "0.99 0.97 0.92");
      strokeRect(cardX, cardY, 466, blockHeight, "0.83 0.78 0.68");

      if (!artwork) {
        drawTextAt("暂无保存作品。保存作品后，PDF 会写入最近作品卡片。", 11, marginX, y - 18);
        y -= blockHeight + 8;
        return;
      }

      const previewX = marginX;
      const previewY = cardY + 16;
      drawRect(previewX, previewY, 86, 54, "0.92 0.96 0.94");
      strokeRect(previewX, previewY, 86, 54, "0.66 0.74 0.70");
      const embedded = drawImage(image, previewX + 2, previewY + 2, 82, 50);
      if (!embedded) {
        drawTextAt("作品截图", 9, previewX + 18, previewY + 34);
        drawTextAt(artwork.imageData ? "未嵌入" : "未保存", 9, previewX + 22, previewY + 19);
      }

      const title = artwork.title || `${artwork.glyph || "作品"}练习作品`;
      const score = normalizeScore(artwork.score || session?.score, 0);
      drawTextAt(`最近作品：${title}`, 12, marginX + 104, y - 18);
      drawTextAt(`评分：${score}    笔画：${artwork.strokeCount || 0}    采样点：${artwork.pointCount || 0}`, 10, marginX + 104, y - 38);
      drawTextAt(`保存时间：${formatDateTime(artwork.createdAt)}`, 10, marginX + 104, y - 56);
      drawTextAt(embedded
        ? "PDF 已嵌入最近作品截图；验真摘要仍使用本机报告核心字段。"
        : "当前截图格式暂未嵌入 PDF；HTML 报告仍可查看原图。", 9, marginX + 104, y - 74);
      y -= blockHeight + 8;
    };

    lines.forEach((line) => {
      if (line.type === "metricBars") {
        drawMetricBars(line.items, { radarChart: line.radarChart });
        return;
      }
      if (line.type === "trendBars") {
        drawTrendBars(line.items);
        return;
      }
      if (line.type === "artworkCard") {
        drawArtworkCard(line.artwork, line.session, line.image);
        return;
      }
      const size = Number(line.size) || 12;
      const text = String(line.text ?? "");
      if (!text) {
        y -= Math.max(8, Math.round(size * 1.2));
        return;
      }
      wrapPdfText(text, maxChars).forEach((part, index) => {
        drawLine(part, index === 0 ? size : Math.max(10, size - 1));
      });
    });

    const stream = `${content.join("\n")}\n`;
    const title = sanitizePdfInfo(metadata.title || "MR Calligraphy Report");
    const subject = sanitizePdfInfo(metadata.subject || "");
    const source = sanitizePdfInfo(metadata.source || "");
    const verificationKind = sanitizePdfComment(metadata.verificationKind || "");
    const verificationAlgorithm = sanitizePdfComment(metadata.verificationAlgorithm || "");
    const verificationDigest = sanitizePdfComment(metadata.verificationDigest || "");
    const artworkImageMime = sanitizePdfComment(metadata.artworkImageMime || "");
    const artworkImageDigest = sanitizePdfComment(metadata.artworkImageDigest || "");
    const teacherReviewSignatureDigest = sanitizePdfComment(metadata.teacherReviewSignatureDigest || "");
    const scoreEvidenceAlgorithm = sanitizePdfComment(metadata.scoreEvidenceAlgorithm || "");
    const scoreEvidencePathFitPercent = normalizeInteger(metadata.scoreEvidencePathFitPercent, 0, 0, 100);
    const pdfComments = [
      `% Source: ${source}`,
      `% MetricBars: ${Number(metadata.metricCount) || 0}`,
      `% RadarChart: ${metadata.radarChart ? Number(metadata.radarMetricCount) || 0 : 0}`,
      `% TrendBars: ${Number(metadata.trendCount) || 0}`,
      `% ArtworkCard: ${metadata.artworkCard ? "yes" : "no"}`,
      `% ArtworkAvailable: ${metadata.artworkAvailable ? "yes" : "no"}`,
      `% ArtworkImageAvailable: ${metadata.artworkImageAvailable ? "yes" : "no"}`,
      `% ArtworkImageEmbedded: ${metadata.artworkImageEmbedded ? "yes" : "no"}`,
      `% ArtworkImageMime: ${artworkImageMime}`,
      `% ArtworkImageDigest: ${artworkImageDigest}`,
      `% TeacherReview: ${metadata.teacherReview ? "yes" : "no"}`,
      `% TeacherReviewSignatureDigest: ${teacherReviewSignatureDigest}`,
      `% ScoreEvidence: ${metadata.scoreEvidenceSummary ? "yes" : "no"}`,
      `% ScoreEvidenceAlgorithm: ${scoreEvidenceAlgorithm}`,
      `% ScoreEvidencePathFit: ${scoreEvidencePathFitPercent}`,
      `% ReportVerification: ${verificationDigest ? "yes" : "no"}`,
      `% ReportVerificationKind: ${verificationKind}`,
      `% ReportVerificationAlgorithm: ${verificationAlgorithm}`,
      `% ReportDigest: ${verificationDigest}`
    ].join("\n");
    const xObjectResources = pdfImages.length
      ? `/XObject << ${pdfImages.map((image, index) => `/${image.name} ${8 + index} 0 R`).join(" ")} >>`
      : "";
    const imageObjects = pdfImages.map((image) => {
      const imageStream = `${image.hex}>\n`;
      return `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${imageStream.length} >>\nstream\n${imageStream}endstream`;
    });
    const infoObjectNumber = 8 + imageObjects.length;
    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /ProcSet [/PDF /Text /ImageC] /Font << /F1 4 0 R >> ${xObjectResources} >> /Contents 6 0 R >>`,
      "<< /Type /Font /Subtype /Type0 /BaseFont /STSong-Light /Encoding /UniGB-UCS2-H /DescendantFonts [5 0 R] >>",
      "<< /Type /Font /Subtype /CIDFontType0 /BaseFont /STSong-Light /CIDSystemInfo << /Registry (Adobe) /Ordering (GB1) /Supplement 2 >> /FontDescriptor 7 0 R >>",
      `<< /Length ${stream.length} >>\nstream\n${stream}endstream`,
      "<< /Type /FontDescriptor /FontName /STSong-Light /Flags 6 /FontBBox [0 -200 1000 900] /ItalicAngle 0 /Ascent 880 /Descent -120 /CapHeight 700 /StemV 80 >>",
      ...imageObjects,
      `<< /Title (${title}) /Subject (${subject}) /Creator (MR Calligraphy) >>`
    ];
    let pdf = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n${pdfComments}\n`;
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoObjectNumber} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return pdf;
  }

  function wrapPdfText(text, maxChars = 38) {
    const source = String(text || "");
    const result = [];
    let line = "";
    Array.from(source).forEach((char) => {
      line += char;
      if (line.length >= maxChars || /[。！？；]/.test(char)) {
        result.push(line.trim());
        line = "";
      }
    });
    if (line.trim()) result.push(line.trim());
    return result.length ? result : [source];
  }

  function toUtf16BEHex(text) {
    const bytes = [];
    for (let index = 0; index < text.length; index += 1) {
      const code = text.charCodeAt(index);
      bytes.push((code >> 8) & 0xff, code & 0xff);
    }
    return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  function sanitizePdfInfo(value) {
    return String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .slice(0, 120);
  }

  function sanitizePdfComment(value) {
    return String(value || "")
      .replace(/[\r\n%]/g, "")
      .slice(0, 180);
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
    const scoreEvidenceSource = hasUsableScoreEvidence(artwork.scoreEvidence)
      ? { type: "artwork", id: artwork.id, record: artwork, rawScoreEvidence: artwork.scoreEvidence }
      : hasUsableScoreEvidence(session?.scoreEvidence)
        ? { type: "session", id: session.id, record: session, rawScoreEvidence: session.scoreEvidence }
        : null;
    const scoreEvidence = scoreEvidenceSource
      ? normalizeScoreEvidence(scoreEvidenceSource.rawScoreEvidence, scoreEvidenceSource.record)
      : null;
    const scoreEvidenceFeatures = getScoreEvidenceFeatureFlags(scoreEvidence);
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
      scoreEvidence,
      scoreEvidenceSource: scoreEvidenceSource
        ? {
            type: scoreEvidenceSource.type,
            id: scoreEvidenceSource.id
          }
        : null,
      features: {
        scoreEvidence: Boolean(scoreEvidence),
        ...scoreEvidenceFeatures
      },
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
      message: scoreEvidence
        ? `已生成“${artwork.title}”的本机分享页，包含作品图、评分、标签、反馈、评分证据和打印样式。`
        : `已生成“${artwork.title}”的本机分享页，包含作品图、评分、标签、反馈和打印样式；当前作品没有可嵌入的评分证据。`
    };
  }

  function findArtworkForShare(artworkId = null) {
    const recordId = String(artworkId || "").trim();
    if (recordId) {
      return state.artworks.find((item) => item.id === recordId) || null;
    }
    return state.artworks[state.artworks.length - 1] || null;
  }

  function getArtworkShareRemotePackage(shareId = null) {
    const record = getShareRecordForRemote(shareId);
    if (!record) {
      return {
        ok: false,
        boundary: SHARE_REPOSITORY_BOUNDARY,
        message: "没有可发布到远端的有效分享链接。请先生成本机分享链接。"
      };
    }
    const decorated = decorateShareRecord(record);
    if (!decorated.isActive) {
      return {
        ok: false,
        record: decorated,
        boundary: SHARE_REPOSITORY_BOUNDARY,
        message: "这条分享链接已失效，不能发布到远端。"
      };
    }
    const packageResult = getArtworkSharePackage(record.artworkId);
    if (!packageResult.ok) {
      return {
        ok: false,
        record: decorated,
        boundary: SHARE_REPOSITORY_BOUNDARY,
        message: packageResult.message || "分享链接对应的作品已不存在，无法发布到远端。"
      };
    }

    const workspaceId = normalizeShareRepositoryWorkspaceId(state.shareService.workspaceId);
    const exportedAt = new Date().toISOString();
    const payloadCore = {
      workspaceId,
      shareRecord: decorated,
      share: packageResult.share,
      html: packageResult.html
    };
    const packageDigest = sha256StableJson(payloadCore);
    const repositoryPackage = {
      kind: SHARE_REPOSITORY_KIND,
      version: VERSION,
      storageKey: STORAGE_KEY,
      packageId: `share-package-${record.id}-${packageDigest.slice(0, 12)}`,
      workspaceId,
      exportedAt,
      summary: {
        workspaceId,
        shareCount: 1,
        shareId: record.id,
        artworkId: record.artworkId,
        title: decorated.title,
        glyph: decorated.glyph,
        htmlBytes: packageResult.html.length,
        imageEmbedded: Boolean(packageResult.share?.artwork?.imageData),
        scoreEvidence: Boolean(packageResult.share?.features?.scoreEvidence),
        scoreEvidenceSource: packageResult.share?.scoreEvidenceSource?.type || ""
      },
      records: [clone(record)],
      shares: [{
        shareId: record.id,
        artworkId: record.artworkId,
        share: packageResult.share,
        html: packageResult.html,
        filename: packageResult.filename,
        digest: packageDigest
      }]
    };
    return {
      ok: true,
      package: repositoryPackage,
      record: decorated,
      boundary: SHARE_REPOSITORY_BOUNDARY,
      message: `已生成“${decorated.artworkTitle || decorated.title}”的远端分享包。`
    };
  }

  function findArtworkSession(artwork) {
    if (!artwork?.sessionId) return null;
    return state.sessions.find((item) => item.id === artwork.sessionId) || null;
  }

  function getShareServiceStatus(artworkId = null) {
    const service = normalizeShareService(state.shareService);
    const recordId = String(artworkId || "").trim();
    const records = getDecoratedShareRecords();
    const activeRecords = records.filter((record) => record.status === "active");
    const revokedRecords = records.filter((record) => record.status === "revoked");
    const expiredRecords = records.filter((record) => record.status === "expired");
    const currentRecord = recordId
      ? activeRecords.find((record) => record.artworkId === recordId)
        || records.find((record) => record.artworkId === recordId)
        || null
      : activeRecords[0] || records[0] || null;
    const remoteRetrySummary = getShareRepositoryRetrySummary(service);

    return {
      ok: true,
      boundary: SHARE_SERVICE_BOUNDARY,
      total: records.length,
      activeCount: activeRecords.length,
      revokedCount: revokedRecords.length,
      expiredCount: expiredRecords.length,
      latestRecord: records[0] || null,
      currentRecord,
      records,
      mode: service.mode,
      remoteConfigured: Boolean(service.remoteEndpoint),
      remoteEndpoint: service.remoteEndpoint,
      workspaceId: service.workspaceId,
      lastRemoteStatus: service.lastRemoteStatus,
      lastRemoteSyncAt: service.lastRemoteSyncAt,
      lastRemotePushAt: service.lastRemotePushAt,
      lastRemoteRevokeAt: service.lastRemoteRevokeAt,
      lastRemoteDirection: service.lastRemoteDirection,
      lastRemoteShareId: service.lastRemoteShareId,
      lastRemotePublicUrl: service.lastRemotePublicUrl,
      lastPackageId: service.lastPackageId,
      lastRemoteFailureAt: service.lastRemoteFailureAt,
      lastFailureAction: service.lastFailureAction,
      remoteRetryAfter: service.remoteRetryAfter,
      remoteFailureCount: service.remoteFailureHistory.length,
      remoteFailureHistory: clone(service.remoteFailureHistory),
      remoteRetrySummary,
      sharePushRetryPending: hasShareRepositoryPushRetryPending(service),
      shareRevokeRetryPending: hasShareRepositoryRevokeRetryPending(service),
      lastError: service.lastError,
      lastReceipt: service.lastReceipt ? clone(service.lastReceipt) : null,
      receiptCount: service.receipts.length,
      receipts: clone(service.receipts),
      message: records.length
        ? `本机分享服务有 ${activeRecords.length} 条有效链接、${revokedRecords.length} 条已撤销、${expiredRecords.length} 条已过期。`
        : "本机分享服务尚未生成链接。保存作品后可生成当前浏览器内可访问的分享链接。"
    };
  }

  function getShareRepositoryReceiptAudit() {
    const service = normalizeShareService(state.shareService);
    const receipts = service.receipts;
    const verifiedCount = receipts.filter((receipt) => receipt.verificationStatus === "verified").length;
    return {
      ok: true,
      kind: "mr-calligraphy-share-repository-receipt-audit-v1",
      workspaceId: service.workspaceId,
      total: receipts.length,
      verifiedCount,
      latestReceipt: receipts[0] || null,
      receipts: clone(receipts),
      boundary: SHARE_REPOSITORY_BOUNDARY,
      message: receipts.length
        ? `已保存 ${receipts.length} 条作品分享远端回执，本机校验通过 ${verifiedCount} 条，当前空间 ${service.workspaceId}，最近一次：${formatPlanDate(receipts[0].receivedAt || receipts[0].acceptedAt)}。`
        : "暂无作品分享远端回执。"
    };
  }

  function getShareRepositoryReceiptAuditExport() {
    const audit = getShareRepositoryReceiptAudit();
    if (!audit.total) {
      return {
        ok: false,
        message: "暂无可导出的作品分享远端回执。"
      };
    }
    const exportedAt = new Date().toISOString();
    return {
      ok: true,
      filename: `mr-calligraphy-share-repository-receipts-${exportedAt.slice(0, 10)}.html`,
      html: renderShareRepositoryReceiptAuditHtml(audit, exportedAt),
      audit,
      message: `已生成 ${audit.total} 条作品分享远端回执审计导出。`
    };
  }

  function downloadShareRepositoryReceiptAudit() {
    const result = getShareRepositoryReceiptAuditExport();
    if (!result.ok) {
      return result;
    }
    downloadHtml(result.html, result.filename);
    return {
      ok: true,
      filename: result.filename,
      receiptCount: result.audit.total,
      message: result.message
    };
  }

  function renderShareRepositoryReceiptAuditHtml(audit, exportedAt) {
    const rows = audit.receipts.map((receipt) => {
      const warnings = Array.isArray(receipt.warnings) && receipt.warnings.length ? receipt.warnings.join("；") : "无";
      return `
        <section class="receipt">
          <h2>${escapeHtml(receipt.packageId || receipt.sourcePackageId || receipt.shareId || "packageId 未知")}</h2>
          <dl>
            <dt>方向</dt><dd>${escapeHtml(formatShareRepositoryReceiptDirection(receipt.direction))}</dd>
            <dt>Workspace</dt><dd>${escapeHtml(receipt.workspaceId || audit.workspaceId || SHARE_REPOSITORY_DEFAULT_WORKSPACE)}</dd>
            <dt>分享数量</dt><dd>${escapeHtml(receipt.shareCount || 0)}</dd>
            <dt>Share ID</dt><dd>${escapeHtml(receipt.shareId || "未知")}</dd>
            <dt>Artwork ID</dt><dd>${escapeHtml(receipt.artworkId || "未知")}</dd>
            <dt>Public URL</dt><dd>${escapeHtml(receipt.publicUrl || "未返回")}</dd>
            <dt>HTML Bytes</dt><dd>${escapeHtml(receipt.htmlBytes || 0)}</dd>
            <dt>Repository Digest</dt><dd>${escapeHtml(receipt.repositoryDigest || "未知")}</dd>
            <dt>Receipt Digest</dt><dd>${escapeHtml(receipt.receiptDigest || "未知")}</dd>
            <dt>本机校验</dt><dd>${escapeHtml(formatShareRepositoryReceiptVerificationStatus(receipt.verificationStatus))}</dd>
            <dt>校验说明</dt><dd>${escapeHtml(receipt.verificationMessage || "未执行")}</dd>
            <dt>重算摘要</dt><dd>${escapeHtml(receipt.verificationExpectedDigest || "未知")}</dd>
            <dt>Remote Version</dt><dd>${escapeHtml(receipt.remoteVersion || "未知")}</dd>
            <dt>Endpoint</dt><dd>${escapeHtml(receipt.endpoint || "未知")}</dd>
            <dt>Accepted At</dt><dd>${escapeHtml(receipt.acceptedAt || "未知")}</dd>
            <dt>Received At</dt><dd>${escapeHtml(receipt.receivedAt || "未知")}</dd>
            <dt>Message</dt><dd>${escapeHtml(receipt.message || "无")}</dd>
            <dt>Warnings</dt><dd>${escapeHtml(warnings)}</dd>
          </dl>
          <pre>${escapeHtml(JSON.stringify(receipt, null, 2))}</pre>
        </section>`;
    }).join("");
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>MR 书法作品分享远端回执审计</title>
  <style>
    body { margin: 0; padding: 32px; color: #1f2937; background: #f7f4ee; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { max-width: 980px; margin: 0 auto; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    .meta { margin: 0 0 18px; color: #5f6b7a; line-height: 1.6; }
    .receipt { margin: 18px 0; padding: 18px; border: 1px solid #ddd3c2; border-radius: 8px; background: #fffaf2; }
    h2 { margin: 0 0 12px; font-size: 17px; overflow-wrap: anywhere; }
    dl { display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 8px 12px; margin: 0; }
    dt { color: #5f6b7a; font-weight: 700; }
    dd { margin: 0; overflow-wrap: anywhere; }
    pre { margin: 14px 0 0; padding: 12px; overflow: auto; border-radius: 6px; background: #1f2937; color: #f8fafc; font-size: 12px; line-height: 1.5; }
  </style>
</head>
<body>
  <main>
    <h1>MR 书法作品分享远端回执审计</h1>
    <p class="meta">导出时间：${escapeHtml(formatDateTime(exportedAt))} · 当前空间：${escapeHtml(audit.workspaceId || SHARE_REPOSITORY_DEFAULT_WORKSPACE)} · 回执数量：${audit.total}<br>${escapeHtml(audit.boundary)}</p>
    ${rows}
  </main>
</body>
</html>`;
  }

  function formatShareRepositoryReceiptDirection(direction) {
    return {
      check: "检查",
      push: "发布",
      revoke: "撤销"
    }[direction] || "远端回执";
  }

  function formatShareRepositoryReceiptVerificationStatus(status) {
    return {
      verified: "本机校验通过",
      "workspace-mismatch": "空间不匹配",
      "digest-mismatch": "摘要不匹配"
    }[status] || "未校验";
  }

  function getShareServiceRemoteConfig() {
    const service = normalizeShareService(state.shareService);
    return {
      ok: true,
      mode: service.mode,
      remoteEndpoint: service.remoteEndpoint,
      remoteToken: service.remoteToken,
      hasRemoteToken: Boolean(service.remoteToken),
      workspaceId: service.workspaceId,
      boundary: SHARE_REPOSITORY_BOUNDARY
    };
  }

  function configureShareServiceRemote(config = {}) {
    const service = normalizeShareService(state.shareService);
    const endpointInput = config.remoteEndpoint ?? config.endpoint ?? "";
    const tokenInput = config.remoteToken ?? config.token;
    const workspaceInput = config.workspaceId ?? config.remoteWorkspaceId ?? config.accountId ?? service.workspaceId;
    const remoteEndpoint = String(endpointInput || "").trim();
    const remoteToken = tokenInput === undefined
      ? service.remoteToken
      : String(tokenInput || "").trim();
    const workspaceId = normalizeShareRepositoryWorkspaceId(workspaceInput);

    if (!remoteEndpoint) {
      state.shareService = normalizeShareService({
        ...service,
        mode: "local-link",
        remoteEndpoint: "",
        remoteToken: "",
        workspaceId,
        lastCheckedAt: new Date().toISOString(),
        lastRemoteSyncAt: null,
        lastRemotePushAt: null,
        lastRemoteRevokeAt: null,
        lastRemoteDirection: "",
        lastRemoteStatus: "",
        lastRemoteFailureAt: null,
        lastFailureAction: "",
        remoteRetryAfter: null,
        remoteFailureHistory: [],
        lastError: "",
        lastPackageId: "",
        lastRemoteShareId: "",
        lastRemotePublicUrl: "",
        lastReceipt: null,
        receipts: []
      });
      addEvent("share-remote", `清除远端分享 API 配置，保留空间 ${workspaceId}`);
      saveState();
      return {
        ok: true,
        status: getShareServiceStatus(),
        message: `已清除远端分享 API 配置，当前仅保留本机分享链接，空间 ${workspaceId}。`
      };
    }

    const validation = validateShareRepositoryEndpoint(remoteEndpoint);
    if (!validation.ok) {
      recordShareRepositoryError(validation.message);
      return {
        ok: false,
        status: getShareServiceStatus(),
        message: validation.message
      };
    }

    const sameRemoteSpace = validation.endpoint === service.remoteEndpoint && workspaceId === service.workspaceId;
    state.shareService = normalizeShareService({
      ...service,
      mode: "remote-api",
      remoteEndpoint: validation.endpoint,
      remoteToken,
      workspaceId,
      lastCheckedAt: new Date().toISOString(),
      lastRemoteSyncAt: sameRemoteSpace ? service.lastRemoteSyncAt : null,
      lastRemoteDirection: sameRemoteSpace ? service.lastRemoteDirection : "",
      lastPackageId: sameRemoteSpace ? service.lastPackageId : "",
      lastRemoteShareId: sameRemoteSpace ? service.lastRemoteShareId : "",
      lastRemotePublicUrl: sameRemoteSpace ? service.lastRemotePublicUrl : "",
      lastReceipt: sameRemoteSpace ? service.lastReceipt : null,
      receipts: sameRemoteSpace ? service.receipts : [],
      lastRemoteStatus: `远端分享 API 配置已保存，空间 ${workspaceId} 尚未检查服务可用性。`,
      remoteRetryAfter: null,
      lastError: ""
    });
    addEvent("share-remote", `配置远端分享 API：${validation.endpoint} / ${workspaceId}`);
    saveState();
    return {
      ok: true,
      status: getShareServiceStatus(),
      message: `已保存远端分享 API 配置，空间 ${workspaceId}。请点击“检查远端”确认服务可用。`
    };
  }

  function validateShareRepositoryEndpoint(endpoint) {
    try {
      const base = typeof location !== "undefined" && location.href ? location.href : "http://localhost/";
      const url = new URL(endpoint, base);
      if (!["http:", "https:"].includes(url.protocol)) {
        return { ok: false, message: "远端分享 API 只支持 http 或 https 地址。" };
      }
      return { ok: true, endpoint: url.href };
    } catch (error) {
      return { ok: false, message: "远端分享 API 地址无效。" };
    }
  }

  function getShareRepositoryFetch() {
    return typeof fetch === "function" ? fetch.bind(typeof globalThis !== "undefined" ? globalThis : null) : null;
  }

  function buildShareRepositoryRequest(service, options = {}) {
    const headers = {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {})
    };
    if (service.remoteToken) {
      headers.Authorization = `Bearer ${service.remoteToken}`;
    }
    headers["X-MR-Workspace-Id"] = normalizeShareRepositoryWorkspaceId(service.workspaceId);
    return {
      method: options.method || "GET",
      headers,
      ...(options.body ? { body: JSON.stringify(options.body) } : {})
    };
  }

  function requestShareRepository(service, fetchApi, options = {}) {
    const requestUrl = options.requestUrl || service.remoteEndpoint;
    const timeoutMs = normalizeInteger(options.timeoutMs, SHARE_REPOSITORY_REQUEST_TIMEOUT_MS, 1, 600000);
    const request = buildShareRepositoryRequest(service, options);
    let timer = null;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        const error = new Error(`请求超时 ${timeoutMs}ms`);
        error.name = "TimeoutError";
        reject(error);
      }, timeoutMs);
    });
    const requestPromise = Promise.resolve().then(() => fetchApi(requestUrl, request));
    return Promise.race([requestPromise, timeout]).finally(() => {
      if (timer) {
        clearTimeout(timer);
      }
    });
  }

  async function parseRemoteShareRepositoryResponse(response) {
    if (!response || response.ok === false) {
      const status = response?.status ? `HTTP ${response.status}` : "无响应";
      return { ok: false, message: `远端分享 API 请求失败：${status}。` };
    }

    let payload = {};
    try {
      const text = typeof response.text === "function"
        ? await response.text()
        : JSON.stringify(typeof response.json === "function" ? await response.json() : {});
      payload = text ? JSON.parse(text) : {};
    } catch (error) {
      return { ok: false, message: "远端分享 API 返回的不是可解析 JSON。" };
    }

    const candidate = payload.package && typeof payload.package === "object"
      ? payload.package
      : payload.repository && typeof payload.repository === "object"
        ? payload.repository
        : payload;
    const parsed = parseShareRepositoryPackage(candidate);
    const receipt = normalizeShareRepositoryReceipt(payload.receipt || payload.latestReceipt || null);
    const publicUrl = normalizeSharePublicUrl(payload.publicUrl || payload.shareUrl || payload.url || receipt?.publicUrl);
    if (parsed.ok) {
      return {
        ok: true,
        package: parsed.package,
        receipt,
        publicUrl,
        message: payload.message || `远端分享仓库包含 ${parsed.package.records.length} 条分享记录。`
      };
    }
    if (payload.ok === true) {
      return {
        ok: true,
        package: null,
        receipt,
        publicUrl,
        message: payload.message || "远端分享 API 检查通过，但没有返回分享包。"
      };
    }
    return {
      ok: false,
      message: payload.message || parsed.message || "远端分享 API 返回格式无效。"
    };
  }

  function parseShareRepositoryPackage(payload) {
    if (!payload || typeof payload !== "object") {
      return { ok: false, message: "分享仓库包为空。" };
    }
    if (payload.kind !== SHARE_REPOSITORY_KIND) {
      return { ok: false, message: "分享仓库包 kind 不匹配。" };
    }
    const records = Array.isArray(payload.records)
      ? payload.records.map(normalizeShareRecord).filter(Boolean).slice(0, MAX_SHARE_RECORDS)
      : [];
    const shares = Array.isArray(payload.shares) ? payload.shares.filter((item) => item && typeof item === "object") : [];
    if (!records.length || !shares.length) {
      return { ok: false, message: "分享仓库包缺少 records 或 shares。" };
    }
    return {
      ok: true,
      package: {
        kind: SHARE_REPOSITORY_KIND,
        version: normalizeInteger(payload.version, VERSION, 1, 999),
        storageKey: String(payload.storageKey || STORAGE_KEY).slice(0, 120),
        packageId: String(payload.packageId || "").slice(0, 160),
        workspaceId: normalizeShareRepositoryWorkspaceId(payload.workspaceId || payload.summary?.workspaceId),
        exportedAt: normalizePlanDate(payload.exportedAt) || new Date().toISOString(),
        acceptedAt: normalizePlanDate(payload.acceptedAt),
        repositoryDigest: normalizeShareRepositoryHex(payload.repositoryDigest),
        summary: payload.summary && typeof payload.summary === "object" ? clone(payload.summary) : {},
        records,
        shares: shares.slice(0, MAX_SHARE_RECORDS)
      }
    };
  }

  function formatShareRepositoryNetworkError(action, error) {
    const detail = String(error?.message || "").trim();
    if (error?.name === "TimeoutError" || /超时|timeout/i.test(detail)) {
      return detail
        ? `远端分享 API ${action}失败：请求超时（${detail}）。`
        : `远端分享 API ${action}失败：请求超时。`;
    }
    return detail
      ? `远端分享 API ${action}失败：网络请求异常（${detail}）。`
      : `远端分享 API ${action}失败：网络请求异常。`;
  }

  function recordShareRepositoryError(message, options = {}) {
    const current = normalizeShareService(state.shareService);
    const now = new Date().toISOString();
    const normalizedMessage = String(message || "作品分享远端同步失败。").trim().slice(0, 260);
    const action = normalizeShareRepositoryFailureAction(options.action);
    const trackRemote = Boolean(action || options.trackRemote === true);
    let remoteRetryAfter = current.remoteRetryAfter;
    let remoteFailureHistory = current.remoteFailureHistory;
    let lastRemoteFailureAt = current.lastRemoteFailureAt;
    let lastFailureAction = current.lastFailureAction;

    if (trackRemote) {
      const attemptCount = normalizeInteger(options.attemptCount, current.remoteFailureHistory.length + 1, 1, 9999);
      const retryDelayMs = getShareRepositoryRetryDelayMs(attemptCount, options);
      const retryAfter = retryDelayMs ? new Date(Date.now() + retryDelayMs).toISOString() : now;
      const failure = normalizeShareRepositoryFailure({
        failedAt: now,
        retryAfter,
        attemptCount,
        action: action || "check",
        endpoint: options.endpoint || current.remoteEndpoint,
        workspaceId: options.workspaceId || current.workspaceId,
        shareId: options.shareId || current.lastRemoteShareId || "",
        packageId: options.packageId || current.lastPackageId || "",
        packageDigest: options.packageDigest || "",
        publicUrl: options.publicUrl || current.lastRemotePublicUrl || "",
        shareCount: options.shareCount ?? current.records.length,
        failureKind: options.failureKind || classifyShareRepositoryFailure(normalizedMessage),
        message: normalizedMessage
      });
      remoteFailureHistory = [failure, ...current.remoteFailureHistory]
        .filter(Boolean)
        .slice(0, SHARE_REPOSITORY_MAX_FAILURES);
      remoteRetryAfter = retryAfter;
      lastRemoteFailureAt = now;
      lastFailureAction = failure?.action || action || current.lastFailureAction;
    }

    state.shareService = normalizeShareService({
      ...current,
      mode: current.remoteEndpoint ? "remote-api" : "local-link",
      lastCheckedAt: now,
      lastRemoteFailureAt,
      lastFailureAction,
      remoteRetryAfter,
      remoteFailureHistory,
      lastError: normalizedMessage
    });
    saveState();
  }

  function checkRemoteShareService(options = {}) {
    const service = normalizeShareService(state.shareService);
    const now = new Date().toISOString();
    const remoteConfigured = Boolean(service.remoteEndpoint);
    const fetchApi = getShareRepositoryFetch();
    state.shareService = normalizeShareService({
      ...service,
      mode: remoteConfigured ? "remote-api" : "local-link",
      lastCheckedAt: now,
      lastError: remoteConfigured ? "" : "尚未配置远端分享 API；当前只能使用本机分享链接。"
    });
    if (!remoteConfigured || !fetchApi) {
      if (remoteConfigured && !fetchApi) {
        const message = "当前运行环境不支持 fetch，无法检查远端分享 API。";
        recordShareRepositoryError(message, {
          action: "check",
          failureKind: "network",
          retryDelayMs: options.retryDelayMs
        });
      } else {
        saveState();
      }
      const status = getShareServiceStatus();
      return {
        ok: false,
        status,
        message: `${status.lastError || status.message} ${SHARE_REPOSITORY_BOUNDARY}`
      };
    }
    return checkRemoteShareServiceAsync(service, fetchApi, options);
  }

  async function checkRemoteShareServiceAsync(service, fetchApi, options = {}) {
    try {
      const response = await requestShareRepository(service, fetchApi, options);
      const parsed = await parseRemoteShareRepositoryResponse(response);
      const now = new Date().toISOString();
      if (!parsed.ok) {
        recordShareRepositoryError(parsed.message, {
          action: "check",
          failureKind: classifyShareRepositoryFailure(parsed.message),
          retryDelayMs: options.retryDelayMs
        });
        return { ok: false, status: getShareServiceStatus(), message: parsed.message };
      }

      const receipt = parsed.receipt
        ? decorateShareRepositoryReceipt(parsed.receipt, {
          direction: "check",
          endpoint: service.remoteEndpoint,
          workspaceId: service.workspaceId,
          receivedAt: now,
          message: parsed.message
        })
        : null;
      state.shareService = normalizeShareService({
        ...service,
        mode: "remote-api",
        lastCheckedAt: now,
        lastRemoteSyncAt: now,
        lastRemoteDirection: "check",
        lastPackageId: parsed.package?.packageId || service.lastPackageId,
        lastReceipt: receipt || service.lastReceipt,
        receipts: appendShareRepositoryReceipt(service, receipt),
        lastRemoteStatus: `${parsed.message} 空间：${service.workspaceId}。`,
        remoteRetryAfter: null,
        lastError: ""
      });
      addEvent("share-remote-check", `检查远端分享 API：${service.workspaceId}`);
      saveState();
      return {
        ok: true,
        status: getShareServiceStatus(),
        package: parsed.package || null,
        receipt: receipt ? clone(receipt) : null,
        publicUrl: parsed.publicUrl,
        message: `${parsed.message} 空间 ${service.workspaceId}。${SHARE_REPOSITORY_BOUNDARY}`
      };
    } catch (error) {
      const message = formatShareRepositoryNetworkError("检查", error);
      recordShareRepositoryError(message, {
        action: "check",
        failureKind: classifyShareRepositoryFailure(message),
        retryDelayMs: options.retryDelayMs
      });
      return { ok: false, status: getShareServiceStatus(), message };
    }
  }

  function pushArtworkShareToRemote(shareId = null, options = {}) {
    const service = normalizeShareService(state.shareService);
    const fetchApi = getShareRepositoryFetch();
    if (!service.remoteEndpoint) {
      return checkRemoteShareService(options);
    }
    if (!fetchApi) {
      const message = "当前运行环境不支持 fetch，无法发布作品分享到远端 API。";
      recordShareRepositoryError(message, {
        action: "push",
        failureKind: "network",
        retryDelayMs: options.retryDelayMs
      });
      return { ok: false, status: getShareServiceStatus(), message };
    }
    const packageResult = getArtworkShareRemotePackage(shareId);
    if (!packageResult.ok) {
      return packageResult;
    }
    return pushArtworkShareToRemoteAsync(service, fetchApi, packageResult.package, packageResult.record, options);
  }

  async function pushArtworkShareToRemoteAsync(service, fetchApi, repositoryPackage, shareRecord, options = {}) {
    try {
      const response = await requestShareRepository(service, fetchApi, {
        method: "PUT",
        body: repositoryPackage,
        timeoutMs: options.timeoutMs
      });
      const parsed = await parseRemoteShareRepositoryResponse(response);
      const now = new Date().toISOString();
      if (!parsed.ok) {
        const packageDigest = sha256StableJson(repositoryPackage);
        recordShareRepositoryError(parsed.message, {
          action: "push",
          shareId: shareRecord.id,
          packageId: repositoryPackage.packageId,
          packageDigest,
          shareCount: repositoryPackage.records.length,
          publicUrl: shareRecord.remotePublicUrl || "",
          failureKind: classifyShareRepositoryFailure(parsed.message),
          retryDelayMs: options.retryDelayMs
        });
        return { ok: false, status: getShareServiceStatus(), message: parsed.message };
      }

      const receipt = parsed.receipt
        ? decorateShareRepositoryReceipt(parsed.receipt, {
          direction: "push",
          endpoint: service.remoteEndpoint,
          workspaceId: service.workspaceId,
          receivedAt: now,
          message: parsed.message
        })
        : null;
      const acceptedPackageId = parsed.package?.packageId || receipt?.packageId || repositoryPackage.packageId;
      const publicUrl = parsed.publicUrl || receipt?.publicUrl || "";
      const record = findShareRecord(shareRecord.id);
      if (record) {
        record.remotePublishedAt = now;
        record.remoteRevokedAt = "";
        record.remotePublicUrl = publicUrl;
        record.remotePackageId = acceptedPackageId;
        record.remoteWorkspaceId = service.workspaceId;
        record.remoteReceiptDigest = receipt?.receiptDigest || "";
        record.remoteRevokeReceiptDigest = "";
      }
      const remoteStatus = publicUrl
        ? `已发布作品分享到远端 API 空间 ${service.workspaceId}：${publicUrl}`
        : `已发布作品分享到远端 API 空间 ${service.workspaceId}，远端未返回 publicUrl。`;
      state.shareService = normalizeShareService({
        ...state.shareService,
        mode: "remote-api",
        remoteEndpoint: service.remoteEndpoint,
        remoteToken: service.remoteToken,
        workspaceId: service.workspaceId,
        lastCheckedAt: now,
        lastRemoteSyncAt: now,
        lastRemotePushAt: now,
        lastRemoteDirection: "push",
        lastPackageId: acceptedPackageId,
        lastRemoteShareId: shareRecord.id,
        lastRemotePublicUrl: publicUrl,
        lastReceipt: receipt || service.lastReceipt,
        receipts: appendShareRepositoryReceipt(service, receipt),
        lastRemoteStatus: remoteStatus,
        remoteRetryAfter: null,
        lastError: ""
      });
      addEvent("share-remote-push", `发布远端分享：${service.workspaceId} / ${shareRecord.title || shareRecord.id}`);
      saveState();
      return {
        ok: true,
        status: getShareServiceStatus(shareRecord.artworkId),
        packageId: acceptedPackageId,
        publicUrl,
        receipt: receipt ? clone(receipt) : null,
        message: `${remoteStatus} ${SHARE_REPOSITORY_BOUNDARY}`
      };
    } catch (error) {
      const message = formatShareRepositoryNetworkError("发布", error);
      const packageDigest = sha256StableJson(repositoryPackage);
      recordShareRepositoryError(message, {
        action: "push",
        shareId: shareRecord.id,
        packageId: repositoryPackage.packageId,
        packageDigest,
        shareCount: repositoryPackage.records.length,
        publicUrl: shareRecord.remotePublicUrl || "",
        failureKind: classifyShareRepositoryFailure(message),
        retryDelayMs: options.retryDelayMs
      });
      return { ok: false, status: getShareServiceStatus(), message };
    }
  }

  function getArtworkShareRemoteRevokePackage(shareId = null) {
    const record = getShareRecordForRemote(shareId);
    if (!record) {
      return {
        ok: false,
        message: "未找到可撤销远端发布的分享记录。"
      };
    }
    if (!record.remotePublicUrl && !record.remotePackageId) {
      return {
        ok: false,
        record: decorateShareRecord(record),
        message: "这条分享还没有远端发布记录，无法撤销远端链接。"
      };
    }
    const remoteWorkspaceId = record.remoteWorkspaceId || SHARE_REPOSITORY_DEFAULT_WORKSPACE;
    const currentWorkspaceId = state.shareService.workspaceId || SHARE_REPOSITORY_DEFAULT_WORKSPACE;
    if (remoteWorkspaceId !== currentWorkspaceId) {
      return {
        ok: false,
        record: decorateShareRecord(record),
        message: `这条分享属于远端空间 ${remoteWorkspaceId}，当前空间 ${currentWorkspaceId} 不能直接撤销。`
      };
    }
    if (record.remoteRevokedAt) {
      return {
        ok: false,
        record: decorateShareRecord(record),
        message: `这条分享的远端链接已于 ${formatDateTime(record.remoteRevokedAt)} 撤销。`
      };
    }
    const now = new Date().toISOString();
    return {
      ok: true,
      record,
      revoke: {
        kind: "mr-calligraphy-share-repository-revoke-v1",
        version: VERSION,
        storageKey: STORAGE_KEY,
        workspaceId: currentWorkspaceId,
        shareId: record.id,
        artworkId: record.artworkId,
        title: record.title || "",
        packageId: record.remotePackageId || state.shareService.lastPackageId || "",
        publicUrl: record.remotePublicUrl || state.shareService.lastRemotePublicUrl || "",
        receiptDigest: record.remoteReceiptDigest || "",
        requestedAt: now,
        reason: "local-user-revoked-remote-share"
      }
    };
  }

  function revokeArtworkShareRemote(shareId = null, options = {}) {
    const service = normalizeShareService(state.shareService);
    const fetchApi = getShareRepositoryFetch();
    if (!service.remoteEndpoint) {
      return checkRemoteShareService(options);
    }
    if (!fetchApi) {
      const message = "当前运行环境不支持 fetch，无法撤销远端分享链接。";
      recordShareRepositoryError(message, {
        action: "revoke",
        failureKind: "network",
        retryDelayMs: options.retryDelayMs
      });
      return { ok: false, status: getShareServiceStatus(), message };
    }
    const revokeResult = getArtworkShareRemoteRevokePackage(shareId);
    if (!revokeResult.ok) {
      return revokeResult;
    }
    return revokeArtworkShareRemoteAsync(service, fetchApi, revokeResult.revoke, revokeResult.record, options);
  }

  async function revokeArtworkShareRemoteAsync(service, fetchApi, revokePackage, shareRecord, options = {}) {
    try {
      const response = await requestShareRepository(service, fetchApi, {
        method: "DELETE",
        body: revokePackage,
        requestUrl: createShareRepositoryRevokeUrl(service.remoteEndpoint, revokePackage),
        timeoutMs: options.timeoutMs
      });
      const parsed = await parseRemoteShareRepositoryResponse(response);
      const now = new Date().toISOString();
      if (!parsed.ok) {
        const packageDigest = sha256StableJson(revokePackage);
        recordShareRepositoryError(parsed.message, {
          action: "revoke",
          shareId: shareRecord.id,
          packageId: revokePackage.packageId || shareRecord.remotePackageId || "",
          packageDigest,
          shareCount: 1,
          publicUrl: revokePackage.publicUrl || shareRecord.remotePublicUrl || "",
          failureKind: classifyShareRepositoryFailure(parsed.message),
          retryDelayMs: options.retryDelayMs
        });
        return { ok: false, status: getShareServiceStatus(), message: parsed.message };
      }

      const receipt = parsed.receipt
        ? decorateShareRepositoryReceipt(parsed.receipt, {
          direction: "revoke",
          endpoint: service.remoteEndpoint,
          workspaceId: service.workspaceId,
          receivedAt: now,
          message: parsed.message
        })
        : null;
      const record = findShareRecord(shareRecord.id);
      if (record) {
        record.remoteRevokedAt = now;
        record.remoteWorkspaceId = service.workspaceId;
        record.remoteRevokeReceiptDigest = receipt?.receiptDigest || "";
      }
      const remoteStatus = `已请求远端撤销作品分享：${shareRecord.title || shareRecord.id}，空间 ${service.workspaceId}。`;
      state.shareService = normalizeShareService({
        ...state.shareService,
        mode: "remote-api",
        remoteEndpoint: service.remoteEndpoint,
        remoteToken: service.remoteToken,
        workspaceId: service.workspaceId,
        lastCheckedAt: now,
        lastRemoteSyncAt: now,
        lastRemoteRevokeAt: now,
        lastRemoteDirection: "revoke",
        lastRemoteShareId: shareRecord.id,
        lastRemotePublicUrl: "",
        lastReceipt: receipt || service.lastReceipt,
        receipts: appendShareRepositoryReceipt(service, receipt),
        lastRemoteStatus: remoteStatus,
        remoteRetryAfter: null,
        lastError: ""
      });
      addEvent("share-remote-revoke", `撤销远端分享：${service.workspaceId} / ${shareRecord.title || shareRecord.id}`);
      saveState();
      return {
        ok: true,
        status: getShareServiceStatus(shareRecord.artworkId),
        receipt: receipt ? clone(receipt) : null,
        message: `${remoteStatus} ${SHARE_REPOSITORY_BOUNDARY}`
      };
    } catch (error) {
      const message = formatShareRepositoryNetworkError("撤销", error);
      const packageDigest = sha256StableJson(revokePackage);
      recordShareRepositoryError(message, {
        action: "revoke",
        shareId: shareRecord.id,
        packageId: revokePackage.packageId || shareRecord.remotePackageId || "",
        packageDigest,
        shareCount: 1,
        publicUrl: revokePackage.publicUrl || shareRecord.remotePublicUrl || "",
        failureKind: classifyShareRepositoryFailure(message),
        retryDelayMs: options.retryDelayMs
      });
      return { ok: false, status: getShareServiceStatus(), message };
    }
  }

  function createShareRepositoryRevokeUrl(endpoint, revokePackage) {
    try {
      const url = new URL(endpoint, typeof location !== "undefined" && location.href ? location.href : "http://localhost/");
      [
        ["shareId", revokePackage.shareId],
        ["packageId", revokePackage.packageId],
        ["publicUrl", revokePackage.publicUrl],
        ["workspaceId", revokePackage.workspaceId]
      ].forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value);
      });
      return url.href;
    } catch (error) {
      return endpoint;
    }
  }

  function getShareRecordForRemote(shareId = null) {
    const id = String(shareId || "").trim();
    if (id) return findShareRecord(id);
    return getDecoratedShareRecords()
      .map((record) => findShareRecord(record.id))
      .find((record) => record && getShareRecordStatus(record) === "active") || null;
  }

  function createArtworkShareLink(artworkId = null, options = {}) {
    const artwork = findArtworkForShare(artworkId);
    if (!artwork) {
      return {
        ok: false,
        message: "还没有可分享的作品。请先完成书写并保存作品。"
      };
    }

    const existing = getActiveShareRecordForArtwork(artwork.id);
    if (existing) {
      return {
        ok: true,
        reused: true,
        record: decorateShareRecord(existing),
        boundary: SHARE_SERVICE_BOUNDARY,
        message: `“${artwork.title}”已有有效的本机分享链接，可直接复制或撤销。`
      };
    }

    const now = new Date();
    const expiresInDays = normalizeInteger(options.expiresInDays, 7, 1, 365);
    const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
    const record = normalizeShareRecord({
      id: makeId("share"),
      artworkId: artwork.id,
      title: artwork.title || `${artwork.glyph || "作品"}分享`,
      glyph: artwork.glyph || "",
      score: artwork.score || 0,
      permission: "local-link",
      createdAt: now.toISOString(),
      expiresAt,
      viewCount: 0,
      copyCount: 0
    });

    state.shareService.records = [record, ...state.shareService.records]
      .filter(Boolean)
      .slice(0, MAX_SHARE_RECORDS);
    state.shareService.lastCreatedAt = now.toISOString();
    addEvent("share-link", `生成本机分享链接：${artwork.title || artwork.id}`);
    saveState();

    return {
      ok: true,
      record: decorateShareRecord(record),
      boundary: SHARE_SERVICE_BOUNDARY,
      message: `已为“${artwork.title}”生成本机分享链接，有效期 ${expiresInDays} 天。`
    };
  }

  function openArtworkShareLink(shareId) {
    const record = findShareRecord(shareId);
    if (!record) {
      return {
        ok: false,
        message: "未找到这条本机分享链接，可能已被清理或来自其他浏览器。"
      };
    }

    const decorated = decorateShareRecord(record);
    if (decorated.status === "revoked") {
      return {
        ok: false,
        record: decorated,
        boundary: SHARE_SERVICE_BOUNDARY,
        message: `这条本机分享链接已于 ${formatDateTime(record.revokedAt)} 撤销。`
      };
    }
    if (decorated.status === "expired") {
      return {
        ok: false,
        record: decorated,
        boundary: SHARE_SERVICE_BOUNDARY,
        message: `这条本机分享链接已于 ${formatDateTime(record.expiresAt)} 过期。`
      };
    }

    const packageResult = getArtworkSharePackage(record.artworkId);
    if (!packageResult.ok) {
      return {
        ok: false,
        record: decorated,
        boundary: SHARE_SERVICE_BOUNDARY,
        message: "分享链接对应的作品已不存在，无法打开。"
      };
    }

    const now = new Date().toISOString();
    record.viewCount = normalizeInteger(record.viewCount, 0, 0, 999999) + 1;
    record.lastViewedAt = now;
    state.shareService.lastOpenedAt = now;
    addEvent("share-open", `访问本机分享链接：${record.title || record.id}`);
    saveState();

    return {
      ok: true,
      record: decorateShareRecord(record),
      share: packageResult.share,
      boundary: SHARE_SERVICE_BOUNDARY,
      message: `已打开“${record.title}”的本机分享链接。`
    };
  }

  function markArtworkShareLinkCopied(shareId) {
    const record = findShareRecord(shareId);
    if (!record) {
      return { ok: false, message: "未找到可复制的本机分享链接。" };
    }
    if (getShareRecordStatus(record) !== "active") {
      return {
        ok: false,
        record: decorateShareRecord(record),
        message: "这条本机分享链接已失效，不能继续复制。"
      };
    }

    const now = new Date().toISOString();
    record.copyCount = normalizeInteger(record.copyCount, 0, 0, 999999) + 1;
    record.copiedAt = now;
    state.shareService.lastCopiedAt = now;
    addEvent("share-copy", `复制本机分享链接：${record.title || record.id}`);
    saveState();
    return {
      ok: true,
      record: decorateShareRecord(record),
      message: "已记录本机分享链接复制动作。"
    };
  }

  function revokeArtworkShareLink(shareId) {
    const record = findShareRecord(shareId);
    if (!record) {
      return { ok: false, message: "未找到可撤销的本机分享链接。" };
    }
    if (record.revokedAt) {
      return {
        ok: true,
        record: decorateShareRecord(record),
        message: "这条本机分享链接此前已撤销。"
      };
    }

    const now = new Date().toISOString();
    record.revokedAt = now;
    state.shareService.lastRevokedAt = now;
    addEvent("share-revoke", `撤销本机分享链接：${record.title || record.id}`);
    saveState();
    return {
      ok: true,
      record: decorateShareRecord(record),
      message: `已撤销“${record.title || record.id}”的本机分享链接。`
    };
  }

  function getDecoratedShareRecords() {
    return state.shareService.records
      .map(decorateShareRecord)
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0));
  }

  function getActiveShareRecordForArtwork(artworkId) {
    return state.shareService.records.find((record) => (
      record.artworkId === artworkId && getShareRecordStatus(record) === "active"
    )) || null;
  }

  function findShareRecord(shareId) {
    const id = String(shareId || "").trim();
    if (!id) return null;
    return state.shareService.records.find((record) => record.id === id) || null;
  }

  function decorateShareRecord(record) {
    if (!record) return null;
    const artwork = state.artworks.find((item) => item.id === record.artworkId) || null;
    const status = getShareRecordStatus(record);
    return {
      ...clone(record),
      title: record.title || artwork?.title || "作品分享链接",
      artworkTitle: artwork?.title || record.title || record.artworkId,
      glyph: record.glyph || artwork?.glyph || "",
      score: record.score || artwork?.score || 0,
      status,
      statusLabel: getShareRecordStatusLabel(status),
      isActive: status === "active",
      isRevoked: status === "revoked",
      isExpired: status === "expired",
      permissionLabel: record.permission === "local-browser" ? "仅本机浏览器" : "本机链接",
      boundary: SHARE_SERVICE_BOUNDARY
    };
  }

  function getShareRecordStatus(record) {
    if (record.revokedAt) return "revoked";
    if (record.expiresAt && Date.parse(record.expiresAt) <= Date.now()) return "expired";
    return "active";
  }

  function getShareRecordStatusLabel(status) {
    if (status === "revoked") return "已撤销";
    if (status === "expired") return "已过期";
    return "有效";
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

  function getReviewEvidenceExport(sourceId = null) {
    const source = findReviewEvidenceSource(sourceId);
    if (!source) {
      return {
        ok: false,
        message: "还没有可导出的复盘证据。请先完成书写并保存评分证据。"
      };
    }

    const exportedAt = new Date().toISOString();
    const scoreEvidence = normalizeScoreEvidence(source.rawScoreEvidence, source.record);
    const evidence = scoreEvidence.evidence || {};
    const metrics = pickRealMetrics(source.session?.metrics || source.artwork?.metrics || source.record?.metrics) || {};
    const packageData = {
      kind: "mr-calligraphy-review-evidence-v1",
      version: VERSION,
      storageKey: STORAGE_KEY,
      exportedAt,
      sourceType: source.sourceType,
      sourceId: source.record.id,
      artwork: source.artwork ? decorateArtworkGalleryItem(source.artwork) : null,
      session: source.session
        ? {
            id: source.session.id,
            title: source.session.title || `${source.session.glyph}字练习`,
            glyph: source.session.glyph,
            copybook: source.session.copybook,
            trainingMode: source.session.trainingMode,
            score: source.session.score || 0,
            strokeCount: source.session.strokeCount || 0,
            pointCount: source.session.pointCount || 0,
            createdAt: source.session.endedAt || source.session.snapshotAt || source.session.startedAt,
            feedback: clone(source.session.feedback || [])
          }
        : null,
      metrics,
      scoreEvidence,
      features: {
        heatmap: Array.isArray(evidence.pathErrorHotspots) && evidence.pathErrorHotspots.length > 0,
        strokePathErrors: Array.isArray(evidence.strokePathErrors) && evidence.strokePathErrors.length > 0,
        strokeMatches: Array.isArray(evidence.strokeMatches) && evidence.strokeMatches.length > 0,
        pressure: normalizeInteger(evidence.pressurePointCount, 0, 0, 99999) > 0
      }
    };
    const html = createReviewEvidenceHtml(packageData);
    const glyph = source.artwork?.glyph || source.session?.glyph || scoreEvidence.glyph || "review";
    return {
      ok: true,
      evidencePackage: clone(packageData),
      html,
      filename: `mr-calligraphy-review-evidence-${makeDownloadSlug(glyph)}-${source.record.id}.html`,
      message: `已生成“${source.artwork?.title || source.session?.title || `${glyph}字练习`}”的复盘证据页，包含评分依据、路径热力和逐笔证据。`
    };
  }

  function downloadReviewEvidence(sourceId = null) {
    const result = getReviewEvidenceExport(sourceId);
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

  function findReviewEvidenceSource(sourceId = null) {
    const requestedId = String(sourceId || "").trim();
    const fromArtwork = (artwork) => {
      if (!artwork) return null;
      const session = findArtworkSession(artwork);
      const rawScoreEvidence = hasUsableScoreEvidence(artwork.scoreEvidence)
        ? artwork.scoreEvidence
        : hasUsableScoreEvidence(session?.scoreEvidence)
          ? session.scoreEvidence
          : null;
      if (!rawScoreEvidence) return null;
      return { sourceType: "artwork", record: artwork, artwork, session, rawScoreEvidence };
    };
    const fromSession = (session) => {
      if (!session || !hasUsableScoreEvidence(session.scoreEvidence)) return null;
      return { sourceType: "session", record: session, artwork: null, session, rawScoreEvidence: session.scoreEvidence };
    };

    if (requestedId) {
      return fromArtwork(state.artworks.find((item) => item.id === requestedId))
        || fromSession(state.sessions.find((item) => item.id === requestedId));
    }
    return fromArtwork(state.artworks[state.artworks.length - 1])
      || fromSession(state.sessions[state.sessions.length - 1]);
  }

  function hasUsableScoreEvidence(scoreEvidence) {
    if (!scoreEvidence || typeof scoreEvidence !== "object") return false;
    const evidence = scoreEvidence.evidence && typeof scoreEvidence.evidence === "object" ? scoreEvidence.evidence : {};
    return normalizePathErrorHotspots(evidence.pathErrorHotspots).length > 0
      || normalizeStrokePathErrors(evidence.strokePathErrors).length > 0
      || normalizeStrokeMatchList(evidence.strokeMatches).length > 0
      || normalizeInteger(evidence.pressurePointCount, 0, 0, 99999) > 0;
  }

  function getScoreEvidenceFeatureFlags(scoreEvidence) {
    const evidence = scoreEvidence?.evidence && typeof scoreEvidence.evidence === "object"
      ? scoreEvidence.evidence
      : {};
    return {
      heatmap: Array.isArray(evidence.pathErrorHotspots) && evidence.pathErrorHotspots.length > 0,
      strokePathErrors: Array.isArray(evidence.strokePathErrors) && evidence.strokePathErrors.length > 0,
      strokeMatches: Array.isArray(evidence.strokeMatches) && evidence.strokeMatches.length > 0,
      pressure: normalizeInteger(evidence.pressurePointCount, 0, 0, 99999) > 0
    };
  }

  function createReviewEvidenceHtml(packageData) {
    const scoreEvidence = packageData.scoreEvidence || {};
    const evidence = scoreEvidence.evidence || {};
    const artwork = packageData.artwork;
    const session = packageData.session;
    const title = artwork?.title || session?.title || `${scoreEvidence.glyph || "书法"}复盘证据`;
    const metricRows = SCORE_METRICS.map((metric) => {
      const value = normalizeScore(packageData.metrics?.[metric.key] || scoreEvidence.reasons?.find((item) => item.key === metric.key)?.score, 0);
      return `<li><span>${escapeHtml(metric.label)}</span><b><i style="width:${value}%"></i></b><strong>${value || "-"}</strong></li>`;
    }).join("");
    const heatmap = createReviewEvidenceHeatmapHtml(evidence.pathErrorHotspots);
    const strokePathRows = Array.isArray(evidence.strokePathErrors) && evidence.strokePathErrors.length
      ? evidence.strokePathErrors.slice(0, 12).map((item) => `<li><span>第 ${item.index} 笔 ${escapeHtml(item.expected || "")}</span><strong>贴合 ${item.fitPercent || 0}%</strong><small>误差 ${item.errorPercent || 0}% / ${item.sampleCount || 0} 点</small></li>`).join("")
      : `<li><span>暂无逐笔路径误差。</span><strong>-</strong><small>没有真实路径点时不生成假数据。</small></li>`;
    const strokeMatchRows = Array.isArray(evidence.strokeMatches) && evidence.strokeMatches.length
      ? evidence.strokeMatches.slice(0, 12).map((item) => `<li><span>第 ${item.index} 笔 ${escapeHtml(item.expected || "")}</span><strong>${escapeHtml(getStrokeMatchStatusLabel(item.status))}</strong><small>匹配 ${item.matchScore || 0} 分 / 最佳 ${escapeHtml(item.matched || "-")}</small></li>`).join("")
      : `<li><span>暂无逐笔轨迹匹配。</span><strong>-</strong><small>旧记录缺少该字段时不补造。</small></li>`;
    const reasonRows = Array.isArray(scoreEvidence.reasons) && scoreEvidence.reasons.length
      ? scoreEvidence.reasons.map((reason) => `<li>${escapeHtml(reason.label || reason.key)} ${normalizeScore(reason.score, 0)} 分：${escapeHtml(reason.evidence || "")}</li>`).join("")
      : `<li>暂无评分理由。</li>`;
    const artworkImage = artwork?.imageData
      ? `<figure class="artwork"><img src="${escapeAttr(artwork.imageData)}" alt="${escapeAttr(artwork.title)}"><figcaption>${escapeHtml(artwork.title)} · ${artwork.score || 0} 分</figcaption></figure>`
      : `<div class="artwork-empty">${escapeHtml(scoreEvidence.glyph || session?.glyph || "证据")}</div>`;
    const sourceText = packageData.sourceType === "artwork" ? "最近作品" : "最近练习";
    const watermarkText = `MR 书法复盘证据 · ${packageData.sourceId} · ${formatDateTime(packageData.exportedAt)}`;

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} · MR 书法复盘证据</title>
  <style>
    :root { color-scheme: light; --ink:#17221f; --muted:#5f6f69; --line:#d9e6df; --jade:#247a67; --gold:#b98238; --paper:#fbf7ee; --wash:#eef8f3; --hot:#f07b4b; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--paper); font: 15px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; }
    main { position: relative; z-index: 1; width: min(980px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0 42px; }
    .watermark { position: fixed; inset: 0; z-index: 0; display: grid; place-items: center; pointer-events: none; color: rgba(36, 122, 103, 0.08); font-size: clamp(26px, 6vw, 64px); font-weight: 900; text-align: center; transform: rotate(-26deg); }
    .toolbar { position: sticky; top: 0; z-index: 2; display: flex; justify-content: flex-end; margin-bottom: 14px; padding: 9px 0; background: var(--paper); }
    button { min-height: 38px; padding: 0 16px; border: 1px solid var(--ink); border-radius: 8px; color: #fff; background: var(--ink); font: inherit; cursor: pointer; }
    header { display: grid; gap: 9px; padding-bottom: 18px; border-bottom: 2px solid var(--ink); }
    h1, h2, p, figure { margin: 0; }
    h1 { font-size: clamp(30px, 6vw, 58px); line-height: 1.05; letter-spacing: 0; }
    h2 { font-size: 18px; }
    .meta, .muted { color: var(--muted); }
    .layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 0.9fr); gap: 18px; align-items: start; margin-top: 18px; }
    .artwork, .box, .stat { border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    .artwork { padding: 12px; }
    .artwork img { display: block; width: 100%; max-height: 520px; object-fit: contain; border-radius: 6px; background: var(--wash); }
    .artwork figcaption { margin-top: 8px; color: var(--muted); font-size: 13px; }
    .artwork-empty { display: grid; min-height: 360px; place-items: center; border: 1px dashed var(--line); border-radius: 8px; color: rgba(23, 34, 31, 0.62); background: #fff; font-size: 72px; font-weight: 900; }
    .panel { display: grid; gap: 14px; }
    .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .stat, .box { padding: 14px; }
    .stat span { display: block; color: var(--muted); font-size: 12px; }
    .stat strong { display: block; margin-top: 4px; font-size: 25px; line-height: 1.1; }
    .metrics, .evidence-list, .reason-list { display: grid; gap: 8px; margin: 10px 0 0; padding: 0; list-style: none; }
    .metrics li { display: grid; grid-template-columns: 56px 1fr 38px; gap: 9px; align-items: center; }
    .metrics b { height: 11px; overflow: hidden; border-radius: 99px; background: var(--line); }
    .metrics i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--jade), var(--gold)); }
    .evidence-list li { display: grid; grid-template-columns: minmax(0, 1fr) 88px; gap: 8px; padding: 8px; border-radius: 7px; background: var(--wash); }
    .evidence-list small { grid-column: 1 / -1; color: var(--muted); }
    .reason-list li { padding-left: 10px; border-left: 3px solid rgba(36, 122, 103, 0.28); color: var(--muted); }
    .heatmap { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; margin-top: 12px; }
    .heat-cell { position: relative; display: grid; place-items: center; min-height: 72px; overflow: hidden; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    .heat-cell::before { content: ""; position: absolute; inset: 18%; border-radius: 999px; opacity: var(--heat-alpha, 0.12); transform: scale(var(--heat-scale, 0.45)); background: radial-gradient(circle, #f4c96f 0%, var(--hot) 56%, rgba(240, 123, 75, 0) 72%); }
    .heat-cell[data-active="true"] { border-color: rgba(185, 130, 56, 0.56); background: #fff8eb; }
    .heat-cell em, .heat-cell small { position: relative; z-index: 1; max-width: 100%; overflow: hidden; text-align: center; text-overflow: ellipsis; white-space: nowrap; }
    .heat-cell em { display: block; font-style: normal; font-weight: 900; }
    .heat-cell small { color: var(--muted); font-size: 11px; }
    footer { margin-top: 24px; padding-top: 14px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    @media print { @page { size: A4; margin: 14mm; } body { background: #fff; font-size: 12px; } main { width: 100%; padding: 0; } .toolbar { display: none; } .watermark { color: rgba(36, 122, 103, 0.08); font-size: 40px; } .box, .stat, .artwork { break-inside: avoid; page-break-inside: avoid; } }
    @media (max-width: 760px) { main { width: min(100% - 20px, 980px); padding-top: 18px; } .layout, .stats { grid-template-columns: 1fr; } .heat-cell { min-height: 62px; } }
  </style>
</head>
<body>
  <div class="watermark" aria-hidden="true">${escapeHtml(watermarkText)}</div>
  <main>
    <div class="toolbar"><button type="button" onclick="window.print()">打印 / 保存 PDF</button></div>
    <header>
      <p class="meta">MR Calligraphy Review Evidence · ${escapeHtml(formatDateTime(packageData.exportedAt))}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="muted">这是一份本机离线复盘证据页，来源为${escapeHtml(sourceText)}；包含真实保存的评分证据，不是云端教师评级。</p>
    </header>
    <section class="layout">
      ${artworkImage}
      <div class="panel">
        <div class="stats">
          <div class="stat"><span>算法</span><strong>${escapeHtml(scoreEvidence.algorithmVersion || scoreEvidence.kind || DEFAULT_SCORE_ALGORITHM_VERSION)}</strong></div>
          <div class="stat"><span>综合评分</span><strong>${artwork?.score || session?.score || 0}</strong></div>
          <div class="stat"><span>路径贴合</span><strong>${evidence.pathFitPercent || 0}%</strong></div>
          <div class="stat"><span>热力采样</span><strong>${evidence.pathErrorSampleCount || 0}</strong></div>
        </div>
        <section class="box">
          <h2>路径误差热力</h2>
          <p class="muted">按 4×4 区域聚合真实笔迹采样点到本机范字参考线的误差。</p>
          ${heatmap}
        </section>
        <section class="box">
          <h2>能力维度</h2>
          <ul class="metrics">${metricRows}</ul>
        </section>
        <section class="box">
          <h2>逐笔路径贴合</h2>
          <ul class="evidence-list">${strokePathRows}</ul>
        </section>
        <section class="box">
          <h2>逐笔轨迹匹配</h2>
          <ul class="evidence-list">${strokeMatchRows}</ul>
        </section>
        <section class="box">
          <h2>评分理由</h2>
          <ol class="reason-list">${reasonRows}</ol>
        </section>
      </div>
    </section>
    <footer>数据来自本机浏览器存储：${escapeHtml(STORAGE_KEY)}。证据来源：${escapeHtml(packageData.sourceType)} / ${escapeHtml(packageData.sourceId)}。导出时间：${escapeHtml(formatDateTime(packageData.exportedAt))}。</footer>
  </main>
</body>
</html>`;
  }

  function createReviewEvidenceHeatmapHtml(hotspots) {
    const records = normalizePathErrorHotspots(hotspots);
    if (!records.length) {
      return `<p class="muted">暂无可视化热力点。没有真实路径误差时不生成假热力图。</p>`;
    }
    const byZone = new Map(records.map((item) => [item.zone, item]));
    const cells = [];
    for (let y = 1; y <= 4; y += 1) {
      for (let x = 1; x <= 4; x += 1) {
        const zone = `${x}-${y}`;
        const item = byZone.get(zone);
        const error = normalizeInteger(item?.errorPercent, 0, 0, 100);
        const alpha = Number((0.1 + error / 120).toFixed(2));
        const scale = Number((0.35 + error / 100).toFixed(2));
        cells.push(item
          ? `<span class="heat-cell" data-active="true" style="--heat-alpha:${alpha};--heat-scale:${scale}" title="${escapeAttr(`${item.label || zone}，误差 ${error}%，${item.sampleCount} 点`)}"><em>${error}%</em><small>${escapeHtml(item.label || zone)}</small></span>`
          : `<span class="heat-cell" aria-label="${escapeAttr(`${zone} 暂无集中误差`)}"></span>`);
      }
    }
    return `<div class="heatmap" role="img" aria-label="4乘4路径误差热力格">${cells.join("")}</div>`;
  }

  function getStrokeMatchStatusLabel(status) {
    return {
      match: "匹配",
      "weak-match": "形态偏弱",
      "possible-misorder": "疑似错序",
      extra: "超出目标"
    }[status] || "需复核";
  }

  function createArtworkShareHtml(share) {
    const artwork = share.artwork;
    const metrics = share.metrics || {};
    const scoreEvidence = share.scoreEvidence || null;
    const evidence = scoreEvidence?.evidence || {};
    const evidenceSourceText = share.scoreEvidenceSource?.type === "artwork"
      ? "作品评分证据"
      : share.scoreEvidenceSource?.type === "session"
        ? "练习评分证据"
        : "无评分证据";
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
    const scoreEvidenceBlock = scoreEvidence
      ? createArtworkShareEvidenceBlock(scoreEvidence, evidence, evidenceSourceText)
      : `<section class="box score-evidence score-evidence-empty">
          <h2>评分证据</h2>
          <p class="muted">这幅作品没有可嵌入的路径热力、逐笔路径或压感证据；分享页不会补造评分依据。请用新版画布完成一次真实书写并保存作品后重新导出。</p>
        </section>`;
    const watermarkText = `MR 书法本机作品分享 · ${artwork.id} · ${formatDateTime(share.exportedAt)}`;

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(artwork.title)} · MR 书法作品分享</title>
  <style>
    :root { color-scheme: light; --ink:#17221f; --muted:#5f6f69; --line:#d9e6df; --jade:#257861; --gold:#bb8138; --paper:#fbf7ee; --wash:#eef8f3; --hot:#f07b4b; }
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
    .metrics, .feedback, .evidence-list, .reason-list, .evidence-stats { display: grid; gap: 8px; margin: 8px 0 0; padding: 0; list-style: none; }
    .metrics li { display: grid; grid-template-columns: 56px 1fr 38px; gap: 9px; align-items: center; }
    .metrics b { height: 11px; overflow: hidden; border-radius: 99px; background: var(--line); }
    .metrics i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--jade), var(--gold)); }
    .metrics strong { text-align: right; }
    .feedback li { padding-left: 10px; border-left: 3px solid rgba(37, 120, 97, 0.28); color: var(--muted); }
    .score-evidence { display: grid; gap: 12px; }
    .evidence-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .evidence-stats li { padding: 9px; border-radius: 7px; background: var(--wash); }
    .evidence-stats span { display: block; color: var(--muted); font-size: 12px; }
    .evidence-stats strong { display: block; margin-top: 2px; font-size: 16px; }
    .evidence-list li { display: grid; grid-template-columns: minmax(0, 1fr) 88px; gap: 8px; padding: 8px; border-radius: 7px; background: var(--wash); }
    .evidence-list strong { text-align: right; }
    .evidence-list small { grid-column: 1 / -1; color: var(--muted); }
    .reason-list li { padding-left: 10px; border-left: 3px solid rgba(37, 120, 97, 0.28); color: var(--muted); }
    .heatmap { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; margin-top: 8px; }
    .heat-cell { position: relative; display: grid; place-items: center; min-height: 60px; overflow: hidden; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    .heat-cell::before { content: ""; position: absolute; inset: 18%; border-radius: 999px; opacity: var(--heat-alpha, 0.12); transform: scale(var(--heat-scale, 0.45)); background: radial-gradient(circle, #f4c96f 0%, var(--hot) 56%, rgba(240, 123, 75, 0) 72%); }
    .heat-cell[data-active="true"] { border-color: rgba(187, 129, 56, 0.56); background: #fff8eb; }
    .heat-cell em, .heat-cell small { position: relative; z-index: 1; max-width: 100%; overflow: hidden; text-align: center; text-overflow: ellipsis; white-space: nowrap; }
    .heat-cell em { display: block; font-style: normal; font-weight: 900; }
    .heat-cell small { color: var(--muted); font-size: 11px; }
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
    @media (max-width: 760px) { main { width: min(100% - 20px, 880px); padding-top: 18px; } .layout, .stats, .evidence-stats { grid-template-columns: 1fr; } .artwork-empty { min-height: 260px; } .heat-cell { min-height: 54px; } }
  </style>
</head>
<body>
  <div class="watermark" aria-hidden="true">${escapeHtml(watermarkText)}</div>
  <main>
    <div class="toolbar"><button type="button" onclick="window.print()">打印 / 保存 PDF</button></div>
    <header>
      <p class="meta">MR Calligraphy Artwork · ${escapeHtml(formatDateTime(artwork.createdAt))}</p>
      <h1>${escapeHtml(artwork.title)}</h1>
      <p class="muted">这是一份本机导出的作品分享页，包含作品图、基础评分、标签、复盘建议和可追溯评分证据；不是云端公开链接。</p>
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
        ${scoreEvidenceBlock}
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

  function createArtworkShareEvidenceBlock(scoreEvidence, evidence, sourceText) {
    const heatmap = createReviewEvidenceHeatmapHtml(evidence.pathErrorHotspots);
    const targetStrokeText = Array.isArray(evidence.targetStrokeNames) && evidence.targetStrokeNames.length
      ? evidence.targetStrokeNames.slice(0, 8).join("、")
      : "暂无范字笔顺";
    const warningText = Array.isArray(evidence.strokeOrderWarnings) && evidence.strokeOrderWarnings.length
      ? `<p class="muted">笔顺提醒：${escapeHtml(evidence.strokeOrderWarnings.slice(0, 3).join("；"))}</p>`
      : "";
    const strokePathRows = Array.isArray(evidence.strokePathErrors) && evidence.strokePathErrors.length
      ? evidence.strokePathErrors.slice(0, 8).map((item) => `<li><span>第 ${item.index} 笔 ${escapeHtml(item.expected || "")}</span><strong>贴合 ${item.fitPercent || 0}%</strong><small>误差 ${item.errorPercent || 0}% / ${item.sampleCount || 0} 点</small></li>`).join("")
      : `<li><span>暂无逐笔路径误差。</span><strong>-</strong><small>旧作品缺少真实路径误差字段时不生成假数据。</small></li>`;
    const strokeMatchRows = Array.isArray(evidence.strokeMatches) && evidence.strokeMatches.length
      ? evidence.strokeMatches.slice(0, 8).map((item) => `<li><span>第 ${item.index} 笔 ${escapeHtml(item.expected || "")}</span><strong>${escapeHtml(getStrokeMatchStatusLabel(item.status))}</strong><small>匹配 ${item.matchScore || 0} 分 / 最佳 ${escapeHtml(item.matched || "-")}</small></li>`).join("")
      : `<li><span>暂无逐笔轨迹匹配。</span><strong>-</strong><small>没有真实笔顺匹配时不补造。</small></li>`;
    const reasonRows = Array.isArray(scoreEvidence.reasons) && scoreEvidence.reasons.length
      ? scoreEvidence.reasons.slice(0, 5).map((reason) => `<li>${escapeHtml(reason.label || reason.key)} ${normalizeScore(reason.score, 0)} 分：${escapeHtml(reason.evidence || "")}</li>`).join("")
      : `<li>暂无评分理由。</li>`;

    return `<section class="box score-evidence">
          <h2>评分证据</h2>
          <p class="muted">来源：${escapeHtml(sourceText)}。该证据来自本机保存的笔迹采样和启发式算法，不等同于专业书法评级。</p>
          <ul class="evidence-stats">
            <li><span>算法</span><strong>${escapeHtml(scoreEvidence.algorithmVersion || scoreEvidence.kind || DEFAULT_SCORE_ALGORITHM_VERSION)}</strong></li>
            <li><span>范字</span><strong>${escapeHtml(scoreEvidence.copybook || evidence.copybook || "通用范字")}</strong></li>
            <li><span>笔顺</span><strong>匹配 ${evidence.strokeOrderMatchPercent || 0}% / 覆盖 ${evidence.strokeOrderCoveragePercent || 0}%</strong></li>
            <li><span>路径</span><strong>贴合 ${evidence.pathFitPercent || 0}% / 误差 ${evidence.pathErrorPercent || 0}%</strong></li>
            <li><span>采样</span><strong>${evidence.pointCount || 0} 点 / 热力 ${evidence.pathErrorSampleCount || 0} 点</strong></li>
            <li><span>压感</span><strong>${evidence.pressurePointCount || 0} 点 / 跨度 ${evidence.pressureSpreadPercent || 0}%</strong></li>
          </ul>
          <p class="muted">范字笔顺：${escapeHtml(targetStrokeText)}</p>
          ${warningText}
          <div>
            <h2>路径误差热力</h2>
            ${heatmap}
          </div>
          <div>
            <h2>逐笔路径贴合</h2>
            <ul class="evidence-list">${strokePathRows}</ul>
          </div>
          <div>
            <h2>逐笔轨迹匹配</h2>
            <ul class="evidence-list">${strokeMatchRows}</ul>
          </div>
          <div>
            <h2>评分理由</h2>
            <ol class="reason-list">${reasonRows}</ol>
          </div>
          <p class="muted">${escapeHtml(scoreEvidence.disclaimer || "本机评分证据仅用于练习复盘。")}</p>
        </section>`;
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

  function recordPracticeVideoExport(payload = {}) {
    const createdAt = new Date().toISOString();
    const record = normalizeVideoExportRecord({
      id: payload.id || makeId("video"),
      source: payload.source,
      sourceId: payload.sourceId,
      artworkId: payload.artworkId,
      sessionId: payload.sessionId,
      glyph: payload.glyph || state.selectedGlyph,
      title: payload.title || "书写回放视频",
      videoFilename: payload.videoFilename,
      coverFilename: payload.coverFilename,
      mimeType: payload.mimeType || "video/webm",
      videoBytes: payload.videoBytes,
      coverBytes: payload.coverBytes,
      durationMs: payload.durationMs,
      strokeCount: payload.strokeCount,
      pointCount: payload.pointCount,
      coverDataUrl: payload.coverDataUrl,
      createdAt,
      message: payload.message || "已生成本机书写回放视频和封面。"
    });
    if (!record) {
      return { ok: false, message: "视频导出记录缺少必要信息，未写入本机状态。" };
    }
    state.videoExportService.records = [record, ...state.videoExportService.records]
      .filter(Boolean)
      .slice(0, MAX_VIDEO_EXPORT_RECORDS);
    state.videoExportService.lastExportedAt = createdAt;
    state.videoExportService.lastError = "";
    completePracticeVideoExportJob(payload.jobId, record, { save: false });
    addEvent("video-export", `导出书写回放视频：${record.title}`);
    saveState();
    return {
      ok: true,
      record: decorateVideoExportRecord(record),
      status: getPracticeVideoExportStatus({
        artworkId: record.artworkId,
        sessionId: record.sessionId,
        sourceId: record.sourceId
      }),
      boundary: VIDEO_EXPORT_BOUNDARY,
      message: `已记录“${record.title}”的视频导出，包含 WebM 和 PNG 封面。`
    };
  }

  function recordPracticeVideoExportError(message = "", options = {}) {
    const text = String(message || "书写回放视频导出失败。").trim().slice(0, 180);
    state.videoExportService.lastError = text;
    failPracticeVideoExportJob(options.jobId, text, { save: false });
    saveState();
    return {
      ok: false,
      status: getPracticeVideoExportStatus(options),
      boundary: VIDEO_EXPORT_BOUNDARY,
      message: text
    };
  }

  function queuePracticeVideoExportJob(payload = {}) {
    const now = new Date().toISOString();
    const job = normalizeVideoExportJob({
      id: payload.id || makeId("video-job"),
      status: "queued",
      source: payload.source,
      sourceId: payload.sourceId,
      artworkId: payload.artworkId,
      sessionId: payload.sessionId,
      glyph: payload.glyph || state.selectedGlyph,
      title: payload.title || "书写回放视频",
      strokeCount: payload.strokeCount,
      pointCount: payload.pointCount,
      retryOf: payload.retryOf,
      retryCount: payload.retryCount,
      createdAt: now,
      queuedAt: now,
      updatedAt: now
    });
    if (!job) {
      return { ok: false, message: "视频导出任务缺少必要信息，未加入队列。" };
    }
    state.videoExportService.jobs = [job, ...state.videoExportService.jobs]
      .filter(Boolean)
      .slice(0, MAX_VIDEO_EXPORT_JOBS);
    state.videoExportService.lastQueuedAt = now;
    addEvent("video-export-queued", `加入书写视频导出队列：${job.title}`);
    saveState();
    return {
      ok: true,
      job: decorateVideoExportJob(job),
      status: getPracticeVideoExportStatus({
        artworkId: job.artworkId,
        sessionId: job.sessionId,
        sourceId: job.sourceId
      }),
      boundary: VIDEO_EXPORT_BOUNDARY,
      message: `已加入本机视频导出队列：${job.title}。`
    };
  }

  function startPracticeVideoExportJob(jobId) {
    const job = findVideoExportJob(jobId);
    if (!job) {
      return { ok: false, message: "未找到这条视频导出任务。" };
    }
    const now = new Date().toISOString();
    job.status = "running";
    job.startedAt = now;
    job.updatedAt = now;
    job.error = "";
    state.videoExportService.lastStartedAt = now;
    saveState();
    return {
      ok: true,
      job: decorateVideoExportJob(job),
      status: getPracticeVideoExportStatus({
        artworkId: job.artworkId,
        sessionId: job.sessionId,
        sourceId: job.sourceId
      }),
      message: `正在生成视频：${job.title}。`
    };
  }

  function retryPracticeVideoExportJob(jobId) {
    const job = findVideoExportJob(jobId);
    if (!job) {
      return { ok: false, message: "未找到可重试的视频导出任务。" };
    }
    if (job.status !== "failed") {
      return { ok: false, message: "只有失败的视频导出任务可以重试。" };
    }
    return queuePracticeVideoExportJob({
      source: job.source,
      sourceId: job.sourceId,
      artworkId: job.artworkId,
      sessionId: job.sessionId,
      glyph: job.glyph,
      title: job.title,
      strokeCount: job.strokeCount,
      pointCount: job.pointCount,
      retryOf: job.id,
      retryCount: job.retryCount + 1
    });
  }

  function getPracticeVideoRetrySource(jobId) {
    const job = findVideoExportJob(jobId);
    if (!job) {
      return { ok: false, message: "未找到这条视频导出任务。" };
    }
    if (job.status !== "failed") {
      return { ok: false, job: decorateVideoExportJob(job), message: "只有失败的视频导出任务可以重试。" };
    }
    const session = findVideoExportJobSession(job);
    if (!session?.strokes?.length) {
      return {
        ok: false,
        job: decorateVideoExportJob(job),
        message: "这条任务对应的笔迹记录已不存在，无法重试。"
      };
    }
    const artwork = job.artworkId
      ? state.artworks.find((item) => item.id === job.artworkId) || null
      : null;
    return {
      ok: true,
      job: decorateVideoExportJob(job),
      source: {
        source: job.source,
        sourceId: job.sourceId || artwork?.id || session.id,
        artworkId: artwork?.id || job.artworkId,
        sessionId: session.id,
        glyph: job.glyph || session.glyph || state.selectedGlyph,
        title: job.title || artwork?.title || session.title || `${session.glyph || state.selectedGlyph}字视频回放`,
        strokes: clone(session.strokes || [])
      },
      message: `已找到“${job.title}”的可重试笔迹。`
    };
  }

  function getPracticeVideoExportStatus(options = {}) {
    const source = options && typeof options === "object" ? options : {};
    const artworkId = String(source.artworkId || "").trim();
    const sessionId = String(source.sessionId || "").trim();
    const sourceId = String(source.sourceId || "").trim();
    const records = state.videoExportService.records
      .map(decorateVideoExportRecord)
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0));
    const currentRecord = records.find((record) => (
      (artworkId && record.artworkId === artworkId) ||
      (sessionId && record.sessionId === sessionId) ||
      (sourceId && record.sourceId === sourceId)
    )) || records[0] || null;
    const jobs = state.videoExportService.jobs
      .map(decorateVideoExportJob)
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.updatedAt || b.createdAt || 0) - Date.parse(a.updatedAt || a.createdAt || 0));
    const currentJob = jobs.find((job) => (
      (artworkId && job.artworkId === artworkId) ||
      (sessionId && job.sessionId === sessionId) ||
      (sourceId && job.sourceId === sourceId)
    )) || jobs[0] || null;
    const queuedCount = jobs.filter((job) => job.status === "queued").length;
    const runningCount = jobs.filter((job) => job.status === "running").length;
    const succeededCount = jobs.filter((job) => job.status === "succeeded").length;
    const failedCount = jobs.filter((job) => job.status === "failed").length;

    return {
      ok: true,
      boundary: VIDEO_EXPORT_BOUNDARY,
      total: records.length,
      queueTotal: jobs.length,
      queuedCount,
      runningCount,
      succeededCount,
      failedCount,
      retryableCount: failedCount,
      latestRecord: records[0] || null,
      currentRecord,
      latestJob: jobs[0] || null,
      currentJob,
      records,
      jobs,
      lastExportedAt: state.videoExportService.lastExportedAt,
      lastError: state.videoExportService.lastError,
      message: records.length
        ? `本机已有 ${records.length} 条书写视频导出记录；导出队列 ${jobs.length} 条，失败 ${failedCount} 条。`
        : state.videoExportService.lastError
          ? `最近导出失败：${state.videoExportService.lastError}`
          : jobs.length
            ? `本机视频导出队列 ${jobs.length} 条，失败 ${failedCount} 条。`
            : "还没有书写视频导出记录。生成视频后会保存 WebM、PNG 封面和本机队列记录。"
    };
  }

  function getPracticeVideoExportAudit() {
    const records = state.videoExportService.records
      .map(createVideoExportAuditRecord)
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0));
    const jobs = state.videoExportService.jobs
      .map(createVideoExportAuditJob)
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.updatedAt || b.createdAt || 0) - Date.parse(a.updatedAt || a.createdAt || 0));
    const succeededCount = jobs.filter((job) => job.status === "succeeded").length;
    const failedCount = jobs.filter((job) => job.status === "failed").length;
    const retryCount = jobs.filter((job) => job.retryOf).length;
    const audit = {
      ok: true,
      kind: VIDEO_EXPORT_AUDIT_KIND,
      version: VERSION,
      storageKey: STORAGE_KEY,
      totalRecords: records.length,
      totalJobs: jobs.length,
      succeededCount,
      failedCount,
      retryCount,
      latestRecordId: records[0]?.id || "",
      latestJobId: jobs[0]?.id || "",
      lastExportedAt: state.videoExportService.lastExportedAt,
      lastError: state.videoExportService.lastError,
      records,
      jobs,
      videoBoundary: VIDEO_EXPORT_BOUNDARY,
      boundary: VIDEO_EXPORT_AUDIT_BOUNDARY
    };
    audit.auditDigest = sha256StableJson({
      kind: audit.kind,
      version: audit.version,
      storageKey: audit.storageKey,
      totalRecords: audit.totalRecords,
      totalJobs: audit.totalJobs,
      succeededCount,
      failedCount,
      retryCount,
      latestRecordId: audit.latestRecordId,
      latestJobId: audit.latestJobId,
      lastExportedAt: audit.lastExportedAt,
      lastError: audit.lastError,
      records,
      jobs
    });
    audit.message = jobs.length || records.length
      ? `已汇总 ${records.length} 条 WebM 导出记录和 ${jobs.length} 条本机队列任务，失败 ${failedCount} 条，重试 ${retryCount} 条。`
      : "暂无可审计的视频导出记录。";
    return audit;
  }

  function getPracticeVideoExportAuditExport() {
    const audit = getPracticeVideoExportAudit();
    if (!audit.totalRecords && !audit.totalJobs) {
      return {
        ok: false,
        message: "暂无可导出的视频导出回执审计。"
      };
    }
    const exportedAt = new Date().toISOString();
    return {
      ok: true,
      filename: `mr-calligraphy-video-export-audit-${exportedAt.slice(0, 10)}.html`,
      html: renderPracticeVideoExportAuditHtml(audit, exportedAt),
      audit,
      message: `已生成 ${audit.totalJobs} 条视频导出任务和 ${audit.totalRecords} 条 WebM 产物的回执审计。`
    };
  }

  function downloadPracticeVideoExportAudit() {
    const result = getPracticeVideoExportAuditExport();
    if (!result.ok) {
      return result;
    }
    downloadHtml(result.html, result.filename);
    return {
      ok: true,
      filename: result.filename,
      audit: result.audit,
      message: `已下载视频导出回执审计：${result.filename}。`
    };
  }

  function createVideoExportAuditRecord(record) {
    const normalized = decorateVideoExportRecord(record);
    if (!normalized) return null;
    const payload = {
      id: normalized.id,
      source: normalized.source,
      sourceId: normalized.sourceId,
      artworkId: normalized.artworkId,
      sessionId: normalized.sessionId,
      glyph: normalized.glyph,
      title: normalized.title,
      artworkTitle: normalized.artworkTitle,
      sessionTitle: normalized.sessionTitle,
      videoFilename: normalized.videoFilename,
      coverFilename: normalized.coverFilename,
      mimeType: normalized.mimeType,
      videoBytes: normalized.videoBytes,
      coverBytes: normalized.coverBytes,
      durationMs: normalized.durationMs,
      strokeCount: normalized.strokeCount,
      pointCount: normalized.pointCount,
      coverDataDigest: normalized.coverDataUrl
        ? sha256StableJson({ coverDataUrl: normalized.coverDataUrl })
        : "",
      createdAt: normalized.createdAt,
      createdLabel: normalized.createdLabel,
      durationLabel: normalized.durationLabel,
      videoSizeLabel: normalized.videoSizeLabel,
      coverSizeLabel: normalized.coverSizeLabel,
      sourceLabel: normalized.sourceLabel,
      message: normalized.message
    };
    payload.recordDigest = sha256StableJson(payload);
    return payload;
  }

  function createVideoExportAuditJob(job) {
    const normalized = decorateVideoExportJob(job);
    if (!normalized) return null;
    const payload = {
      id: normalized.id,
      status: normalized.status,
      statusLabel: normalized.statusLabel,
      source: normalized.source,
      sourceLabel: normalized.sourceLabel,
      sourceId: normalized.sourceId,
      artworkId: normalized.artworkId,
      sessionId: normalized.sessionId,
      glyph: normalized.glyph,
      title: normalized.title,
      strokeCount: normalized.strokeCount,
      pointCount: normalized.pointCount,
      retryOf: normalized.retryOf,
      retryCount: normalized.retryCount,
      recordId: normalized.recordId,
      videoFilename: normalized.videoFilename,
      coverFilename: normalized.coverFilename,
      error: normalized.error,
      canRetry: normalized.canRetry,
      createdAt: normalized.createdAt,
      queuedAt: normalized.queuedAt,
      startedAt: normalized.startedAt,
      finishedAt: normalized.finishedAt,
      updatedAt: normalized.updatedAt,
      createdLabel: normalized.createdLabel,
      updatedLabel: normalized.updatedLabel
    };
    payload.jobDigest = sha256StableJson(payload);
    return payload;
  }

  function renderPracticeVideoExportAuditHtml(audit, exportedAt) {
    const recordCards = audit.records.length
      ? audit.records.map((record) => `
        <article>
          <h2>${escapeHtml(record.title || record.videoFilename || "WebM 导出记录")}</h2>
          <dl>
            <dt>来源</dt><dd>${escapeHtml(record.sourceLabel || record.source || "未知")}</dd>
            <dt>视频文件</dt><dd>${escapeHtml(record.videoFilename || "未记录")}</dd>
            <dt>封面文件</dt><dd>${escapeHtml(record.coverFilename || "未记录")}</dd>
            <dt>视频大小</dt><dd>${escapeHtml(record.videoSizeLabel || `${record.videoBytes || 0} B`)}</dd>
            <dt>封面大小</dt><dd>${escapeHtml(record.coverSizeLabel || `${record.coverBytes || 0} B`)}</dd>
            <dt>时长</dt><dd>${escapeHtml(record.durationLabel || "未知")}</dd>
            <dt>笔迹采样</dt><dd>${escapeHtml(`${record.strokeCount || 0} 笔 / ${record.pointCount || 0} 点`)}</dd>
            <dt>封面摘要</dt><dd>${escapeHtml(record.coverDataDigest || "无")}</dd>
            <dt>记录摘要</dt><dd>${escapeHtml(record.recordDigest || "无")}</dd>
            <dt>导出时间</dt><dd>${escapeHtml(formatDateTime(record.createdAt))}</dd>
          </dl>
          <p>${escapeHtml(record.message || "本机 WebM 导出记录。")}</p>
        </article>`).join("")
      : `<p class="empty">暂无 WebM 产物记录。</p>`;
    const jobCards = audit.jobs.length
      ? audit.jobs.map((job) => `
        <article data-status="${escapeAttr(job.status)}">
          <h2>${escapeHtml(job.title || job.id)} · ${escapeHtml(job.statusLabel || getVideoExportJobStatusLabel(job.status))}</h2>
          <dl>
            <dt>任务 ID</dt><dd>${escapeHtml(job.id)}</dd>
            <dt>状态</dt><dd>${escapeHtml(job.statusLabel || job.status)}</dd>
            <dt>来源</dt><dd>${escapeHtml(job.sourceLabel || job.source || "未知")}</dd>
            <dt>重试来源</dt><dd>${escapeHtml(job.retryOf || "非重试任务")}</dd>
            <dt>重试次数</dt><dd>${escapeHtml(job.retryCount || 0)}</dd>
            <dt>关联记录</dt><dd>${escapeHtml(job.recordId || "未生成 WebM")}</dd>
            <dt>视频文件</dt><dd>${escapeHtml(job.videoFilename || "未生成")}</dd>
            <dt>封面文件</dt><dd>${escapeHtml(job.coverFilename || "未生成")}</dd>
            <dt>错误原因</dt><dd>${escapeHtml(job.error || "无")}</dd>
            <dt>排队时间</dt><dd>${escapeHtml(formatDateTime(job.queuedAt || job.createdAt))}</dd>
            <dt>完成时间</dt><dd>${escapeHtml(job.finishedAt ? formatDateTime(job.finishedAt) : "未完成")}</dd>
            <dt>任务摘要</dt><dd>${escapeHtml(job.jobDigest || "无")}</dd>
          </dl>
        </article>`).join("")
      : `<p class="empty">暂无队列任务。</p>`;
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>MR 书法视频导出回执审计</title>
  <style>
    body{margin:0;padding:32px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f7f4ee;color:#1f2421}
    main{max-width:980px;margin:0 auto}
    h1{margin:0 0 8px;font-size:28px}
    h2{margin:0 0 12px;font-size:17px}
    .meta,.empty{color:#5c665f;line-height:1.6}
    .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:20px 0}
    .stat,article{border:1px solid #d8d0c2;border-radius:10px;background:#fffdf8;box-shadow:0 10px 24px rgba(46,39,27,.08)}
    .stat{padding:14px}
    .stat span{display:block;color:#6d766f;font-size:12px}
    .stat strong{display:block;margin-top:5px;font-size:22px}
    section{margin-top:24px}
    article{margin:10px 0;padding:18px}
    article[data-status="failed"]{border-color:#dfb25b;background:#fff8e7}
    dl{display:grid;grid-template-columns:150px minmax(0,1fr);gap:8px 12px;margin:0}
    dt{font-weight:800;color:#405047}
    dd{margin:0;word-break:break-word}
    pre{white-space:pre-wrap;word-break:break-word;border:1px solid #d8d0c2;border-radius:10px;padding:14px;background:#1f2421;color:#f8f2e8}
    footer{margin-top:28px;color:#6d766f;font-size:12px;line-height:1.6}
  </style>
</head>
<body>
  <main>
    <p class="meta">MR Calligraphy Video Export Audit · ${escapeHtml(formatDateTime(exportedAt))}</p>
    <h1>MR 书法视频导出回执审计</h1>
    <p class="meta">${escapeHtml(audit.message)}<br>${escapeHtml(audit.boundary)}<br>${escapeHtml(audit.videoBoundary)}</p>
    <div class="stats">
      <div class="stat"><span>WebM 记录</span><strong>${escapeHtml(audit.totalRecords)}</strong></div>
      <div class="stat"><span>队列任务</span><strong>${escapeHtml(audit.totalJobs)}</strong></div>
      <div class="stat"><span>失败任务</span><strong>${escapeHtml(audit.failedCount)}</strong></div>
      <div class="stat"><span>重试任务</span><strong>${escapeHtml(audit.retryCount)}</strong></div>
    </div>
    <section>
      <h2>WebM 产物</h2>
      ${recordCards}
    </section>
    <section>
      <h2>队列任务</h2>
      ${jobCards}
    </section>
    <section>
      <h2>原始审计 JSON</h2>
      <pre>${escapeHtml(JSON.stringify(audit, null, 2))}</pre>
    </section>
    <footer>审计摘要：${escapeHtml(audit.auditDigest)}。数据来源：${escapeHtml(STORAGE_KEY)}。导出时间：${escapeHtml(formatDateTime(exportedAt))}。</footer>
  </main>
</body>
</html>`;
  }

  function decorateVideoExportRecord(record) {
    const normalized = normalizeVideoExportRecord(record);
    if (!normalized) return null;
    const artwork = normalized.artworkId
      ? state.artworks.find((item) => item.id === normalized.artworkId) || null
      : null;
    const session = normalized.sessionId
      ? state.sessions.find((item) => item.id === normalized.sessionId) || null
      : null;
    return {
      ...clone(normalized),
      artworkTitle: artwork?.title || normalized.title,
      sessionTitle: session?.title || "",
      durationLabel: formatDurationMs(normalized.durationMs),
      videoSizeLabel: formatBytes(normalized.videoBytes),
      coverSizeLabel: formatBytes(normalized.coverBytes),
      createdLabel: formatDateTime(normalized.createdAt),
      sourceLabel: normalized.source === "最近作品" ? "最近作品" : "当前练习",
      boundary: VIDEO_EXPORT_BOUNDARY
    };
  }

  function decorateVideoExportJob(job) {
    const normalized = normalizeVideoExportJob(job);
    if (!normalized) return null;
    return {
      ...clone(normalized),
      sourceLabel: normalized.source === "最近作品" ? "最近作品" : "当前练习",
      statusLabel: getVideoExportJobStatusLabel(normalized.status),
      canRetry: normalized.status === "failed",
      createdLabel: formatDateTime(normalized.createdAt),
      updatedLabel: formatDateTime(normalized.updatedAt),
      boundary: VIDEO_EXPORT_BOUNDARY
    };
  }

  function completePracticeVideoExportJob(jobId, record, options = {}) {
    const job = findVideoExportJob(jobId);
    if (!job) return null;
    const now = new Date().toISOString();
    job.status = "succeeded";
    job.recordId = record.id;
    job.videoFilename = record.videoFilename;
    job.coverFilename = record.coverFilename;
    job.finishedAt = now;
    job.updatedAt = now;
    job.error = "";
    if (options.save !== false) {
      saveState();
    }
    return decorateVideoExportJob(job);
  }

  function failPracticeVideoExportJob(jobId, message, options = {}) {
    const job = findVideoExportJob(jobId);
    if (!job) return null;
    const now = new Date().toISOString();
    job.status = "failed";
    job.error = String(message || "视频导出失败。").trim().slice(0, 180);
    job.finishedAt = now;
    job.updatedAt = now;
    if (options.save !== false) {
      saveState();
    }
    return decorateVideoExportJob(job);
  }

  function findVideoExportJob(jobId) {
    const id = String(jobId || "").trim();
    if (!id) return null;
    return state.videoExportService.jobs.find((job) => job.id === id) || null;
  }

  function findVideoExportJobSession(job) {
    if (!job) return null;
    if (job.sessionId) {
      const session = state.sessions.find((item) => item.id === job.sessionId);
      if (session) return session;
    }
    if (job.artworkId) {
      const artwork = state.artworks.find((item) => item.id === job.artworkId);
      if (artwork?.sessionId) {
        return state.sessions.find((item) => item.id === artwork.sessionId) || null;
      }
    }
    return null;
  }

  function getVideoExportJobStatusLabel(status) {
    if (status === "queued") return "排队中";
    if (status === "running") return "生成中";
    if (status === "succeeded") return "已完成";
    if (status === "failed") return "失败";
    return "未知";
  }

  function formatDurationMs(value) {
    const ms = normalizeInteger(value, 0, 0, 600000);
    if (!ms) return "时长未知";
    return `${(ms / 1000).toFixed(ms >= 10000 ? 0 : 1)} 秒`;
  }

  function formatBytes(value) {
    const bytes = normalizeInteger(value, 0, 0, 999999999);
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${bytes} B`;
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
    const scoreEvidenceSummary = getReportScoreEvidenceSummary(normalizedReport, latestSession, latestArtwork);
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
      scoreEvidenceSummary: scoreEvidenceSummary ? clone(scoreEvidenceSummary) : null,
      teacherReview: normalizedReport.teacherReview ? clone(normalizedReport.teacherReview) : null,
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
    const result = getReportHtmlExport(reportId);
    if (!result.ok) {
      return { ok: false, message: "还没有可下载的报告。" };
    }
    downloadHtml(result.html, result.filename);
    return {
      ok: true,
      filename: result.filename,
      message: `已下载${reportId ? "所选" : "最近"} HTML 学习报告，含能力雷达、签名水印、教师批注状态和打印样式。`
    };
  }

  function downloadReportPdf(reportId = null) {
    const result = getReportPdfExport(reportId);
    if (!result.ok) {
      return { ok: false, message: result.message };
    }
    downloadPdf(result.pdf, result.filename);
    return {
      ok: true,
      filename: result.filename,
      byteLength: result.byteLength,
      message: `已下载原生 PDF 学习报告：${result.filename}。`
    };
  }

  function downloadPlan(planId = null) {
    const result = getPlanExport(planId);
    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    downloadHtml(result.html, result.filename);
    return {
      ok: true,
      filename: result.filename,
      message: "已下载学习计划离线 HTML，可打开后打印或保存为 PDF。"
    };
  }

  function downloadPlanCalendar(planId = null) {
    const result = getPlanCalendarExport(planId);
    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    downloadText(result.calendar, result.filename, result.mimeType);
    return {
      ok: true,
      filename: result.filename,
      eventCount: result.eventCount,
      message: `已下载学习计划提醒日历：${result.filename}。`
    };
  }

  function getPlanRepositoryPackage(options = {}) {
    const selectedIds = Array.isArray(options.planIds)
      ? new Set(options.planIds.map(String).filter(Boolean))
      : null;
    const plans = state.plans
      .filter((plan) => !selectedIds || selectedIds.has(plan.id))
      .map((plan) => normalizePlan(plan))
      .filter(Boolean);
    if (!plans.length) {
      return {
        ok: false,
        message: "还没有可导出的学习计划同步包。"
      };
    }

    const exportedAt = new Date().toISOString();
    const packageId = `plan-repository-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const repository = getPlanRepositoryStatus();
    return {
      ok: true,
      filename: `mr-calligraphy-plan-repository-${Date.now()}.json`,
      package: {
        kind: PLAN_REPOSITORY_KIND,
        version: VERSION,
        packageId,
        workspaceId: repository.workspaceId,
        exportedAt,
        storageKey: STORAGE_KEY,
        source: {
          mode: repository.mode,
          workspaceId: repository.workspaceId,
          boundary: PLAN_REPOSITORY_BOUNDARY
        },
        summary: {
          planCount: plans.length,
          latestPlanId: plans[plans.length - 1]?.id || null,
          latestPlanTitle: plans[plans.length - 1]?.title || ""
        },
        plans: clone(plans)
      },
      message: `已生成 ${plans.length} 份计划的本机 JSON 同步包。${PLAN_REPOSITORY_BOUNDARY}`
    };
  }

  function downloadPlanRepository(options = {}) {
    const result = getPlanRepositoryPackage(options);
    if (!result.ok) {
      return result;
    }
    downloadJson(result.package, result.filename);
    const now = new Date().toISOString();
    state.planRepository = normalizePlanRepository({
      ...state.planRepository,
      mode: "local-json",
      lastExportedAt: now,
      lastCheckedAt: now,
      lastExportedPlanCount: result.package.plans.length,
      lastPackageId: result.package.packageId,
      lastReceipt: null,
      receipts: [],
      lastRemoteStatus: "",
      lastError: ""
    });
    addEvent("plan-repository-export", `导出计划同步包：${result.package.plans.length} 份计划`);
    saveState();
    return {
      ok: true,
      filename: result.filename,
      status: getPlanRepositoryStatus(),
      message: `已下载计划 JSON 同步包：${result.filename}。${PLAN_REPOSITORY_BOUNDARY}`
    };
  }

  function importPlanRepositoryPackage(input, options = {}) {
    const parsed = parsePlanRepositoryPackage(input);
    if (!parsed.ok) {
      recordPlanRepositoryError(parsed.message);
      return parsed;
    }
    const incomingPlans = parsed.package.plans
      .map(normalizePlan)
      .filter(Boolean);
    if (!incomingPlans.length) {
      const message = "同步包里没有可导入的学习计划。";
      recordPlanRepositoryError(message);
      return { ok: false, message };
    }

    const mode = options.mode === "replace" ? "replace" : "merge";
    const existingIndex = new Map(state.plans.map((plan, index) => [plan.id, index]));
    let importedCount = 0;
    let updatedCount = 0;
    if (mode === "replace") {
      state.plans = incomingPlans;
      importedCount = incomingPlans.length;
      updatedCount = 0;
    } else {
      incomingPlans.forEach((plan) => {
        if (existingIndex.has(plan.id)) {
          state.plans[existingIndex.get(plan.id)] = plan;
          updatedCount += 1;
        } else {
          state.plans.push(plan);
          existingIndex.set(plan.id, state.plans.length - 1);
          importedCount += 1;
        }
      });
    }

    const now = new Date().toISOString();
    state.planRepository = normalizePlanRepository({
      ...state.planRepository,
      mode: "local-json",
      lastImportedAt: now,
      lastCheckedAt: now,
      lastImportedPlanCount: incomingPlans.length,
      lastPackageId: parsed.package.packageId || null,
      lastReceipt: null,
      receipts: [],
      lastRemoteStatus: "",
      lastError: ""
    });
    if (options.skipAutoSync !== true) {
      queuePlanRepositorySync(`导入计划同步包：${incomingPlans.length} 份计划`, { save: false });
    }
    addEvent("plan-repository-import", `导入计划同步包：新增 ${importedCount}，更新 ${updatedCount}`);
    saveState();
    return {
      ok: true,
      mode,
      importedCount,
      updatedCount,
      totalPlanCount: state.plans.length,
      status: getPlanRepositoryStatus(),
      message: `已导入计划同步包：新增 ${importedCount} 份，更新 ${updatedCount} 份。${PLAN_REPOSITORY_BOUNDARY}`
    };
  }

  function parsePlanRepositoryPackage(input) {
    let source = input;
    if (typeof input === "string") {
      try {
        source = JSON.parse(input);
      } catch (error) {
        return { ok: false, message: "计划同步包 JSON 解析失败。" };
      }
    }
    if (!source || typeof source !== "object") {
      return { ok: false, message: "计划同步包格式无效。" };
    }
    if (source.kind !== PLAN_REPOSITORY_KIND) {
      return { ok: false, message: "这不是 MR 书法学习计划同步包。" };
    }
    if (!Array.isArray(source.plans)) {
      return { ok: false, message: "计划同步包缺少 plans 数组。" };
    }
    return { ok: true, package: source };
  }

  function recordPlanRepositoryError(message) {
    state.planRepository = normalizePlanRepository({
      ...state.planRepository,
      lastCheckedAt: new Date().toISOString(),
      lastError: message
    });
    saveState();
  }

  function touchPlan(plan) {
    if (plan) {
      plan.updatedAt = new Date().toISOString();
    }
    return plan;
  }

  function queuePlanRepositorySync(reason = "本机计划已变更", options = {}) {
    if (!state.plans.length) {
      return {
        ok: false,
        status: getPlanRepositoryStatus(),
        message: "还没有可自动同步的学习计划。"
      };
    }
    const repository = normalizePlanRepository(state.planRepository);
    const now = new Date().toISOString();
    state.planRepository = normalizePlanRepository({
      ...repository,
      pendingAutoSync: true,
      pendingSince: repository.pendingSince || now,
      pendingReason: reason,
      pendingPlanCount: state.plans.length,
      lastCheckedAt: now,
      autoSyncRetryAfter: null,
      lastError: ""
    });
    if (options.schedule !== false) {
      schedulePlanRepositoryAutoSync();
    }
    if (options.save !== false) {
      saveState();
    }
    return {
      ok: true,
      status: getPlanRepositoryStatus(),
      message: `已加入计划自动同步队列：${reason}。`
    };
  }

  function schedulePlanRepositoryAutoSync() {
    const repository = normalizePlanRepository(state.planRepository);
    if (!repository.autoSyncEnabled || !repository.remoteEndpoint || !repository.pendingAutoSync) {
      return false;
    }
    if (typeof window === "undefined" || typeof window.setTimeout !== "function" || typeof document === "undefined") {
      return false;
    }
    if (planRepositoryAutoSyncTimer && typeof window.clearTimeout === "function") {
      window.clearTimeout(planRepositoryAutoSyncTimer);
    }
    planRepositoryAutoSyncTimer = window.setTimeout(() => {
      planRepositoryAutoSyncTimer = null;
      flushPlanRepositoryAutoSync({ scheduled: true }).catch((error) => {
        recordPlanRepositoryError(`计划自动同步失败：${error?.message || "网络请求异常"}。`);
      });
    }, 1200);
    return true;
  }

  function flushPlanRepositoryAutoSync(options = {}) {
    const repository = normalizePlanRepository(state.planRepository);
    if (!repository.pendingAutoSync) {
      return Promise.resolve({
        ok: true,
        status: getPlanRepositoryStatus(),
        message: "当前没有待自动同步的学习计划。"
      });
    }
    if (!repository.remoteEndpoint) {
      const message = "计划自动同步等待远端 API 配置。";
      state.planRepository = normalizePlanRepository({
        ...repository,
        lastCheckedAt: new Date().toISOString(),
        lastError: message
      });
      saveState();
      return Promise.resolve({ ok: false, status: getPlanRepositoryStatus(), message });
    }
    state.planRepository = normalizePlanRepository({
      ...repository,
      autoSyncAttemptCount: repository.autoSyncAttemptCount + 1,
      lastCheckedAt: new Date().toISOString(),
      lastError: ""
    });
    saveState();
    return Promise.resolve(pushPlanRepositoryToRemote({ ...options, autoSync: true }));
  }

  function detectPlanRepositoryConflicts(incomingPlans, repository) {
    if (!repository.pendingAutoSync) {
      return [];
    }
    const lastSyncTime = Date.parse(repository.lastRemoteSyncAt || repository.lastImportedAt || repository.lastExportedAt || 0) || 0;
    const localById = new Map(state.plans.map((plan) => [plan.id, normalizePlan(plan)]));
    return incomingPlans
      .map(normalizePlan)
      .filter(Boolean)
      .map((incoming) => {
        const local = localById.get(incoming.id);
        if (!local) return null;
        const localUpdated = Date.parse(local.updatedAt || local.createdAt || "") || 0;
        const remoteUpdated = Date.parse(incoming.updatedAt || incoming.createdAt || "") || 0;
        const bothChangedAfterSync = localUpdated > lastSyncTime && remoteUpdated > lastSyncTime;
        const contentDiffers = stablePlanStringify(local) !== stablePlanStringify(incoming);
        return bothChangedAfterSync && contentDiffers
          ? {
              id: incoming.id,
              title: incoming.title || local.title || incoming.id,
              localTitle: local.title || incoming.id,
              remoteTitle: incoming.title || incoming.id,
              localUpdatedAt: local.updatedAt,
              remoteUpdatedAt: incoming.updatedAt,
              fieldDiffs: getPlanRepositoryFieldDiffs(local, incoming),
              remotePlan: incoming
            }
          : null;
      })
      .filter(Boolean);
  }

  function getPlanRepositoryFieldDiffs(localPlan, remotePlan) {
    const local = normalizePlan(localPlan);
    const remote = normalizePlan(remotePlan);
    if (!local || !remote) {
      return { plan: [], items: [] };
    }
    const plan = PLAN_REPOSITORY_MERGE_PLAN_FIELDS
      .filter((field) => stablePlanStringify(local[field] ?? "") !== stablePlanStringify(remote[field] ?? ""))
      .map((field) => createPlanRepositoryFieldDiff(field, local[field], remote[field]));
    const localItems = new Map(local.items.map((item) => [item.id, item]));
    const items = remote.items
      .map((remoteItem) => {
        const localItem = localItems.get(remoteItem.id);
        if (!localItem) return null;
        const fields = PLAN_REPOSITORY_MERGE_ITEM_FIELDS
          .filter((field) => stablePlanStringify(localItem[field] || "") !== stablePlanStringify(remoteItem[field] || ""))
          .map((field) => createPlanRepositoryFieldDiff(field, localItem[field], remoteItem[field]));
        if (!fields.length) return null;
        return {
          itemId: remoteItem.id,
          localTitle: localItem.title,
          remoteTitle: remoteItem.title,
          fields
        };
      })
      .filter(Boolean);
    return { plan, items };
  }

  function createPlanRepositoryFieldDiff(field, localValue, remoteValue) {
    return {
      field,
      label: PLAN_REPOSITORY_MERGE_LABELS[field] || field,
      localValue: formatPlanRepositoryMergeValue(localValue),
      remoteValue: formatPlanRepositoryMergeValue(remoteValue)
    };
  }

  function formatPlanRepositoryMergeValue(value) {
    if (value === null || value === undefined || value === "") {
      return "空";
    }
    if (Array.isArray(value)) {
      return value.length ? value.map(formatPlanRepositoryMergeValue).join("、").slice(0, 160) : "空";
    }
    if (value && typeof value === "object") {
      return stablePlanStringify(value).slice(0, 160);
    }
    return String(value).slice(0, 160);
  }

  function getPlanRepositoryConflictRecords(conflicts = []) {
    return conflicts
      .map((conflict) => normalizePlanRepositoryConflict(conflict))
      .filter(Boolean);
  }

  function getPlanRepositoryConflictPlans(conflicts = []) {
    return conflicts
      .map((conflict) => normalizePlan(conflict.remotePlan))
      .filter(Boolean);
  }

  function clearPlanRepositoryConflictFields(repository = state.planRepository) {
    return normalizePlanRepository({
      ...repository,
      lastSyncConflictAt: null,
      lastSyncConflictCount: 0,
      lastSyncConflictPlanIds: [],
      lastSyncConflicts: [],
      lastSyncConflictPlans: []
    });
  }

  function stablePlanStringify(value) {
    if (Array.isArray(value)) {
      return `[${value.map(stablePlanStringify).join(",")}]`;
    }
    if (value && typeof value === "object") {
      return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stablePlanStringify(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
  }

  function getPlanRepositoryRemoteConfig() {
    const repository = normalizePlanRepository(state.planRepository);
    return {
      ok: true,
      mode: repository.mode,
      remoteEndpoint: repository.remoteEndpoint,
      remoteToken: repository.remoteToken,
      hasRemoteToken: Boolean(repository.remoteToken),
      workspaceId: repository.workspaceId,
      boundary: PLAN_REPOSITORY_BOUNDARY
    };
  }

  function configurePlanRepositoryRemote(config = {}) {
    const repository = normalizePlanRepository(state.planRepository);
    const endpointInput = config.remoteEndpoint ?? config.endpoint ?? "";
    const tokenInput = config.remoteToken ?? config.token;
    const workspaceInput = config.workspaceId ?? config.remoteWorkspaceId ?? config.accountId ?? repository.workspaceId;
    const remoteEndpoint = String(endpointInput || "").trim();
    const remoteToken = tokenInput === undefined
      ? repository.remoteToken
      : String(tokenInput || "").trim();
    const workspaceId = normalizePlanRepositoryWorkspaceId(workspaceInput);

    if (!remoteEndpoint) {
      state.planRepository = normalizePlanRepository({
        ...repository,
        mode: "local-json",
        remoteEndpoint: "",
        remoteToken: "",
        workspaceId,
        autoSyncEnabled: false,
        pendingAutoSync: false,
        pendingSince: null,
        pendingReason: "",
        pendingPlanCount: 0,
        autoSyncAttemptCount: 0,
        autoSyncRetryAfter: null,
        lastAutoSyncFailureAt: null,
        lastSyncConflictAt: null,
        lastSyncConflictCount: 0,
        lastSyncConflictPlanIds: [],
        lastSyncConflicts: [],
        lastSyncConflictPlans: [],
        lastCheckedAt: new Date().toISOString(),
        lastReceipt: null,
        receipts: [],
        lastRemoteStatus: "",
        lastError: ""
      });
      addEvent("plan-repository-remote", "清除远端计划 API 配置");
      saveState();
      return {
        ok: true,
        status: getPlanRepositoryStatus(),
        message: "已清除远端计划 API 配置，当前回到本机 JSON 同步包。"
      };
    }

    const validation = validatePlanRepositoryEndpoint(remoteEndpoint);
    if (!validation.ok) {
      recordPlanRepositoryError(validation.message);
      return {
        ok: false,
        status: getPlanRepositoryStatus(),
        message: validation.message
      };
    }

    state.planRepository = normalizePlanRepository({
      ...repository,
      mode: "remote-api",
      remoteEndpoint: validation.endpoint,
      remoteToken,
      workspaceId,
      autoSyncEnabled: config.autoSyncEnabled === false ? false : true,
      autoSyncRetryAfter: null,
      lastReceipt: validation.endpoint === repository.remoteEndpoint && workspaceId === repository.workspaceId ? repository.lastReceipt : null,
      receipts: validation.endpoint === repository.remoteEndpoint && workspaceId === repository.workspaceId ? repository.receipts : [],
      lastCheckedAt: new Date().toISOString(),
      lastRemoteStatus: `远端计划 API 配置已保存，空间 ${workspaceId} 尚未检查服务可用性。`,
      lastError: ""
    });
    addEvent("plan-repository-remote", `配置远端计划 API：${validation.endpoint} / ${workspaceId}`);
    saveState();
    return {
      ok: true,
      status: getPlanRepositoryStatus(),
      message: `已保存远端计划 API 配置，空间 ${workspaceId}。请点击“检查远端”确认服务可用。`
    };
  }

  function validatePlanRepositoryEndpoint(endpoint) {
    try {
      const base = typeof location !== "undefined" && location.href ? location.href : "http://localhost/";
      const url = new URL(endpoint, base);
      if (!["http:", "https:"].includes(url.protocol)) {
        return { ok: false, message: "远端计划 API 只支持 http 或 https 地址。" };
      }
      return { ok: true, endpoint: url.href };
    } catch (error) {
      return { ok: false, message: "远端计划 API 地址无效。" };
    }
  }

  function getPlanRepositoryFetch() {
    return typeof fetch === "function" ? fetch.bind(typeof globalThis !== "undefined" ? globalThis : null) : null;
  }

  function buildPlanRepositoryRequest(repository, options = {}) {
    const headers = {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {})
    };
    if (repository.remoteToken) {
      headers.Authorization = `Bearer ${repository.remoteToken}`;
    }
    headers["X-MR-Workspace-Id"] = normalizePlanRepositoryWorkspaceId(repository.workspaceId);
    return {
      method: options.method || "GET",
      headers,
      ...(options.body ? { body: JSON.stringify(options.body) } : {})
    };
  }

  function requestPlanRepository(repository, fetchApi, options = {}) {
    const timeoutMs = normalizeInteger(options.timeoutMs, PLAN_REPOSITORY_REQUEST_TIMEOUT_MS, 1, 600000);
    const request = buildPlanRepositoryRequest(repository, options);
    let timer = null;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        const error = new Error(`请求超时 ${timeoutMs}ms`);
        error.name = "TimeoutError";
        reject(error);
      }, timeoutMs);
    });
    const requestPromise = Promise.resolve().then(() => fetchApi(repository.remoteEndpoint, request));
    return Promise.race([requestPromise, timeout]).finally(() => {
      if (timer) {
        clearTimeout(timer);
      }
    });
  }

  async function parseRemotePlanRepositoryResponse(response) {
    if (!response || response.ok === false) {
      const status = response?.status ? `HTTP ${response.status}` : "无响应";
      return { ok: false, message: `远端计划 API 请求失败：${status}。` };
    }

    let payload = {};
    try {
      const text = typeof response.text === "function"
        ? await response.text()
        : JSON.stringify(typeof response.json === "function" ? await response.json() : {});
      payload = text ? JSON.parse(text) : {};
    } catch (error) {
      return { ok: false, message: "远端计划 API 返回的不是可解析 JSON。" };
    }

    const candidate = payload.package && typeof payload.package === "object"
      ? payload.package
      : payload.repository && typeof payload.repository === "object"
        ? payload.repository
        : payload;
    const parsed = parsePlanRepositoryPackage(candidate);
    const receipt = normalizePlanRepositoryReceipt(payload.receipt || payload.latestReceipt || null);
    if (parsed.ok) {
      return {
        ok: true,
        package: parsed.package,
        receipt,
        message: payload.message || `远端计划仓库包含 ${parsed.package.plans.length} 份计划。`
      };
    }
    if (payload.ok === true) {
      return {
        ok: true,
        package: null,
        receipt,
        message: payload.message || "远端计划 API 检查通过，但没有返回计划包。"
      };
    }
    return {
      ok: false,
      message: payload.message || parsed.message || "远端计划 API 返回格式无效。"
    };
  }

  function formatPlanRepositoryNetworkError(action, error) {
    const detail = String(error?.message || "").trim();
    if (error?.name === "TimeoutError" || /超时|timeout/i.test(detail)) {
      return detail
        ? `远端计划 API ${action}失败：请求超时（${detail}）。`
        : `远端计划 API ${action}失败：请求超时。`;
    }
    return detail
      ? `远端计划 API ${action}失败：网络请求异常（${detail}）。`
      : `远端计划 API ${action}失败：网络请求异常。`;
  }

  function checkRemotePlanRepository(options = {}) {
    const repository = normalizePlanRepository(state.planRepository);
    const now = new Date().toISOString();
    const remoteConfigured = Boolean(repository.remoteEndpoint);
    const fetchApi = getPlanRepositoryFetch();
    state.planRepository = normalizePlanRepository({
      ...repository,
      mode: remoteConfigured ? "remote-api" : "local-json",
      lastCheckedAt: now,
      lastError: remoteConfigured ? "" : "尚未配置远端计划 repository；当前只能使用本机 JSON 同步包。"
    });
    if (!remoteConfigured || !fetchApi) {
      if (remoteConfigured && !fetchApi) {
        state.planRepository = normalizePlanRepository({
          ...state.planRepository,
          lastError: "当前运行环境不支持 fetch，无法检查远端计划 API。"
        });
      }
      saveState();
      const status = getPlanRepositoryStatus();
      return {
        ok: false,
        status,
        message: remoteConfigured
          ? `${status.message} ${PLAN_REPOSITORY_BOUNDARY}`
          : `${status.message} ${PLAN_REPOSITORY_BOUNDARY}`
      };
    }
    return checkRemotePlanRepositoryAsync(repository, fetchApi, options);
  }

  async function checkRemotePlanRepositoryAsync(repository, fetchApi, options = {}) {
    try {
      const response = await requestPlanRepository(repository, fetchApi, options);
      const parsed = await parseRemotePlanRepositoryResponse(response);
      const now = new Date().toISOString();
      if (!parsed.ok) {
        state.planRepository = normalizePlanRepository({
          ...repository,
          mode: "remote-api",
          lastCheckedAt: now,
          lastError: parsed.message
        });
        saveState();
        return { ok: false, status: getPlanRepositoryStatus(), message: parsed.message };
      }

      const remotePlanCount = parsed.package?.plans?.length || 0;
      const parsedReceipt = parsed.receipt
        ? decoratePlanRepositoryReceipt(parsed.receipt, {
          direction: "check",
          endpoint: repository.remoteEndpoint,
          workspaceId: repository.workspaceId,
          receivedAt: now,
          message: parsed.message
        })
        : null;
      const receipt = parsedReceipt || repository.lastReceipt || null;
      state.planRepository = normalizePlanRepository({
        ...repository,
        mode: "remote-api",
        lastCheckedAt: now,
        lastRemoteSyncAt: now,
        lastRemoteDirection: "check",
        lastRemotePlanCount: remotePlanCount,
        lastPackageId: parsed.package?.packageId || repository.lastPackageId,
        lastReceipt: receipt,
        receipts: appendPlanRepositoryReceipt(repository, parsedReceipt),
        lastRemoteStatus: `${parsed.message} 空间：${repository.workspaceId}。`,
        lastError: ""
      });
      addEvent("plan-repository-remote-check", `检查远端计划 API：${remotePlanCount} 份计划`);
      saveState();
      return {
        ok: true,
        status: getPlanRepositoryStatus(),
        package: parsed.package || null,
        receipt: receipt ? clone(receipt) : null,
        message: `${parsed.message} ${PLAN_REPOSITORY_BOUNDARY}`
      };
    } catch (error) {
      const message = formatPlanRepositoryNetworkError("检查", error);
      recordPlanRepositoryError(message);
      return { ok: false, status: getPlanRepositoryStatus(), message };
    }
  }

  function pushPlanRepositoryToRemote(options = {}) {
    const repository = normalizePlanRepository(state.planRepository);
    const fetchApi = getPlanRepositoryFetch();
    if (!repository.remoteEndpoint) {
      return checkRemotePlanRepository();
    }
    if (!fetchApi) {
      const message = "当前运行环境不支持 fetch，无法推送计划到远端 API。";
      if (repository.pendingAutoSync || options.autoSync) {
        return recordPlanRepositoryAutoSyncFailure(repository, message, {
          autoSync: options.autoSync,
          retryDelayMs: options.retryDelayMs,
          failureKind: "network"
        });
      }
      recordPlanRepositoryError(message);
      return { ok: false, status: getPlanRepositoryStatus(), message };
    }
    const packageResult = getPlanRepositoryPackage(options);
    if (!packageResult.ok) {
      return packageResult;
    }
    return pushPlanRepositoryToRemoteAsync(repository, fetchApi, packageResult.package, options);
  }

  async function pushPlanRepositoryToRemoteAsync(repository, fetchApi, repositoryPackage, options = {}) {
    try {
      const response = await requestPlanRepository(repository, fetchApi, {
        method: "PUT",
        body: repositoryPackage,
        timeoutMs: options.timeoutMs
      });
      const parsed = await parseRemotePlanRepositoryResponse(response);
      const acceptedPackageId = parsed.package?.packageId || repositoryPackage.packageId;
      const planCount = repositoryPackage.plans.length;
      const now = new Date().toISOString();
      if (!parsed.ok) {
        if (repository.pendingAutoSync || options.autoSync) {
          return recordPlanRepositoryAutoSyncFailure(repository, parsed.message, {
            autoSync: options.autoSync,
            retryDelayMs: options.retryDelayMs,
            packageId: repositoryPackage.packageId,
            failureKind: classifyPlanRepositoryFailure(parsed.message)
          });
        }
        state.planRepository = normalizePlanRepository({
          ...repository,
          lastCheckedAt: now,
          lastError: parsed.message
        });
        saveState();
        return { ok: false, status: getPlanRepositoryStatus(), message: parsed.message };
      }

      const receipt = parsed.receipt
        ? decoratePlanRepositoryReceipt(parsed.receipt, {
          direction: "push",
          endpoint: repository.remoteEndpoint,
          workspaceId: repository.workspaceId,
          receivedAt: now,
          message: parsed.message
        })
        : null;
      const remoteStatus = receipt
        ? `已推送 ${planCount} 份计划到远端 API 空间 ${repository.workspaceId}，并收到回执 ${receipt.receiptDigest.slice(0, 12)}。`
        : `已推送 ${planCount} 份计划到远端 API 空间 ${repository.workspaceId}，远端未返回完整回执。`;
      state.planRepository = normalizePlanRepository({
        ...repository,
        mode: "remote-api",
        lastCheckedAt: now,
        lastRemoteSyncAt: now,
        lastRemoteDirection: "push",
        lastRemotePlanCount: planCount,
        lastExportedAt: now,
        lastExportedPlanCount: planCount,
        lastPackageId: acceptedPackageId,
        pendingAutoSync: false,
        pendingSince: null,
        pendingReason: "",
        pendingPlanCount: 0,
        autoSyncAttemptCount: 0,
        autoSyncRetryAfter: null,
        lastAutoSyncAt: options.autoSync ? now : repository.lastAutoSyncAt,
        lastAutoSyncStatus: options.autoSync ? `自动同步已推送 ${planCount} 份计划。` : repository.lastAutoSyncStatus,
        lastSyncConflictAt: null,
        lastSyncConflictCount: 0,
        lastSyncConflictPlanIds: [],
        lastSyncConflicts: [],
        lastSyncConflictPlans: [],
        lastReceipt: receipt,
        receipts: appendPlanRepositoryReceipt(repository, receipt),
        lastRemoteStatus: remoteStatus,
        lastError: ""
      });
      addEvent("plan-repository-remote-push", `推送计划到远端 API：${planCount} 份计划`);
      saveState();
      return {
        ok: true,
        status: getPlanRepositoryStatus(),
        packageId: acceptedPackageId,
        pushedPlanCount: planCount,
        receipt: receipt ? clone(receipt) : null,
        message: `${remoteStatus} ${PLAN_REPOSITORY_BOUNDARY}`
      };
    } catch (error) {
      const message = formatPlanRepositoryNetworkError("推送", error);
      if (repository.pendingAutoSync || options.autoSync) {
        return recordPlanRepositoryAutoSyncFailure(repository, message, {
          autoSync: options.autoSync,
          retryDelayMs: options.retryDelayMs,
          packageId: repositoryPackage.packageId,
          failureKind: classifyPlanRepositoryFailure(message)
        });
      }
      recordPlanRepositoryError(message);
      return { ok: false, status: getPlanRepositoryStatus(), message };
    }
  }

  function pullPlanRepositoryFromRemote(options = {}) {
    const repository = normalizePlanRepository(state.planRepository);
    const fetchApi = getPlanRepositoryFetch();
    if (!repository.remoteEndpoint) {
      return checkRemotePlanRepository();
    }
    if (!fetchApi) {
      const message = "当前运行环境不支持 fetch，无法从远端 API 拉取计划。";
      recordPlanRepositoryError(message);
      return { ok: false, status: getPlanRepositoryStatus(), message };
    }
    return pullPlanRepositoryFromRemoteAsync(repository, fetchApi, options);
  }

  async function pullPlanRepositoryFromRemoteAsync(repository, fetchApi, options = {}) {
    try {
      const response = await requestPlanRepository(repository, fetchApi, options);
      const parsed = await parseRemotePlanRepositoryResponse(response);
      if (!parsed.ok) {
        recordPlanRepositoryError(parsed.message);
        return { ok: false, status: getPlanRepositoryStatus(), message: parsed.message };
      }
      if (!parsed.package) {
        const message = "远端计划 API 没有返回可导入的计划包。";
        recordPlanRepositoryError(message);
        return { ok: false, status: getPlanRepositoryStatus(), message };
      }

      const now = new Date().toISOString();
      const incomingPlans = parsed.package.plans.map(normalizePlan).filter(Boolean);
      const parsedReceipt = parsed.receipt
        ? decoratePlanRepositoryReceipt(parsed.receipt, {
          direction: "pull",
          endpoint: repository.remoteEndpoint,
          workspaceId: repository.workspaceId,
          receivedAt: now,
          message: parsed.message
        })
        : null;
      const receipt = parsedReceipt || repository.lastReceipt || null;
      const conflicts = options.force === true ? [] : detectPlanRepositoryConflicts(incomingPlans, repository);
      if (conflicts.length) {
        const conflictRecords = getPlanRepositoryConflictRecords(conflicts);
        const conflictPlans = getPlanRepositoryConflictPlans(conflicts);
        state.planRepository = normalizePlanRepository({
          ...repository,
          mode: "remote-api",
          lastCheckedAt: now,
          lastRemotePlanCount: incomingPlans.length,
          lastSyncConflictAt: now,
          lastSyncConflictCount: conflicts.length,
          lastSyncConflictPlanIds: conflicts.map((item) => item.id),
          lastSyncConflicts: conflictRecords,
          lastSyncConflictPlans: conflictPlans,
          lastReceipt: receipt,
          receipts: appendPlanRepositoryReceipt(repository, parsedReceipt),
          lastError: `远端计划与本机待同步变更存在 ${conflicts.length} 个冲突，请先推送本机计划或使用强制拉取。`
        });
        saveState();
        return {
          ok: false,
          conflict: true,
          conflicts,
          status: getPlanRepositoryStatus(),
          receipt: receipt ? clone(receipt) : null,
          message: state.planRepository.lastError
        };
      }

      const imported = importPlanRepositoryPackage(parsed.package, { mode: options.mode, skipAutoSync: true });
      if (!imported.ok) {
        state.planRepository = normalizePlanRepository({
          ...repository,
          lastCheckedAt: now,
          lastError: imported.message
        });
        saveState();
        return { ok: false, status: getPlanRepositoryStatus(), message: imported.message };
      }

      const planCount = parsed.package.plans.length;
      state.planRepository = normalizePlanRepository({
        ...state.planRepository,
        mode: "remote-api",
        remoteEndpoint: repository.remoteEndpoint,
        remoteToken: repository.remoteToken,
        workspaceId: repository.workspaceId,
        lastCheckedAt: now,
        lastRemoteSyncAt: now,
        lastRemoteDirection: "pull",
        lastRemotePlanCount: planCount,
        lastPackageId: parsed.package.packageId || imported.status?.lastPackageId || null,
        pendingAutoSync: options.force === true ? false : state.planRepository.pendingAutoSync,
        pendingSince: options.force === true ? null : state.planRepository.pendingSince,
        pendingReason: options.force === true ? "" : state.planRepository.pendingReason,
        pendingPlanCount: options.force === true ? 0 : state.planRepository.pendingPlanCount,
        lastSyncConflictAt: null,
        lastSyncConflictCount: 0,
        lastSyncConflictPlanIds: [],
        lastSyncConflicts: [],
        lastSyncConflictPlans: [],
        lastReceipt: receipt,
        receipts: appendPlanRepositoryReceipt(repository, parsedReceipt),
        lastRemoteStatus: `已从远端 API 拉取 ${planCount} 份计划，空间 ${repository.workspaceId}，新增 ${imported.importedCount}，更新 ${imported.updatedCount}。`,
        lastError: ""
      });
      addEvent("plan-repository-remote-pull", `从远端 API 拉取计划：${planCount} 份计划`);
      saveState();
      return {
        ok: true,
        status: getPlanRepositoryStatus(),
        importedCount: imported.importedCount,
        updatedCount: imported.updatedCount,
        pulledPlanCount: planCount,
        receipt: receipt ? clone(receipt) : null,
        message: `已从远端 API 拉取计划，空间 ${repository.workspaceId}：新增 ${imported.importedCount}，更新 ${imported.updatedCount}。${PLAN_REPOSITORY_BOUNDARY}`
      };
    } catch (error) {
      const message = formatPlanRepositoryNetworkError("拉取", error);
      recordPlanRepositoryError(message);
      return { ok: false, status: getPlanRepositoryStatus(), message };
    }
  }

  function resolvePlanRepositoryConflict(strategy = "keep-local", options = {}) {
    const repository = normalizePlanRepository(state.planRepository);
    if (!repository.lastSyncConflictCount) {
      return {
        ok: false,
        status: getPlanRepositoryStatus(),
        message: "当前没有待处理的计划同步冲突。"
      };
    }

    if (strategy === "keep-local") {
      return flushPlanRepositoryAutoSync({ conflictResolution: "keep-local" });
    }
    if (strategy === "use-remote") {
      return pullPlanRepositoryFromRemote({ force: true, conflictResolution: "use-remote" });
    }
    if (strategy === "copy-remote") {
      return copyRemotePlanRepositoryConflicts(repository);
    }
    if (strategy === "merge-fields") {
      return mergePlanRepositoryConflictFields(repository, options);
    }

    return {
      ok: false,
      status: getPlanRepositoryStatus(),
      message: "未知的计划冲突处理方式。"
    };
  }

  function mergePlanRepositoryConflictFields(repository, options = {}) {
    const remotePlans = repository.lastSyncConflictPlans
      .map(normalizePlan)
      .filter(Boolean);
    if (!remotePlans.length) {
      return {
        ok: false,
        status: getPlanRepositoryStatus(),
        message: "没有可用于字段合并的远端冲突计划，请重新拉取远端计划。"
      };
    }

    const selections = normalizePlanRepositoryMergeSelections(options.selections || options);
    const remoteById = new Map(remotePlans.map((plan) => [plan.id, plan]));
    const now = new Date().toISOString();
    let mergedPlanCount = 0;
    let remoteFieldCount = 0;
    let localFieldCount = 0;

    repository.lastSyncConflictPlanIds.forEach((planId) => {
      const localIndex = state.plans.findIndex((plan) => plan.id === planId);
      const remotePlan = remoteById.get(planId);
      if (localIndex < 0 || !remotePlan) return;

      const localPlan = normalizePlan(state.plans[localIndex]);
      if (!localPlan) return;
      const nextPlan = clone(localPlan);
      const planSelection = selections[planId] || {};
      const planFields = planSelection.plan || {};

      PLAN_REPOSITORY_MERGE_PLAN_FIELDS.forEach((field) => {
        if (stablePlanStringify(localPlan[field] || "") === stablePlanStringify(remotePlan[field] || "")) {
          return;
        }
        const choice = planFields[field] === "remote" ? "remote" : "local";
        if (choice === "remote") {
          nextPlan[field] = remotePlan[field];
          remoteFieldCount += 1;
        } else {
          localFieldCount += 1;
        }
      });

      const remoteItems = new Map(remotePlan.items.map((item) => [item.id, item]));
      const itemSelections = planSelection.items || {};
      nextPlan.items = nextPlan.items.map((item) => {
        const remoteItem = remoteItems.get(item.id);
        if (!remoteItem) return item;
        const itemChoice = itemSelections[item.id] || {};
        const nextItem = { ...item };
        PLAN_REPOSITORY_MERGE_ITEM_FIELDS.forEach((field) => {
          if (stablePlanStringify(item[field] || "") === stablePlanStringify(remoteItem[field] || "")) {
            return;
          }
          const choice = itemChoice[field] === "remote" ? "remote" : "local";
          if (choice === "remote") {
            nextItem[field] = remoteItem[field];
            remoteFieldCount += 1;
          } else {
            localFieldCount += 1;
          }
        });
        return nextItem;
      });

      nextPlan.updatedAt = now;
      state.plans[localIndex] = normalizePlan(nextPlan);
      mergedPlanCount += 1;
    });

    if (!mergedPlanCount) {
      return {
        ok: false,
        status: getPlanRepositoryStatus(),
        message: "没有找到可合并的本机冲突计划。"
      };
    }

    state.planRepository = normalizePlanRepository({
      ...clearPlanRepositoryConflictFields(repository),
      pendingAutoSync: true,
      pendingSince: repository.pendingSince || now,
      pendingReason: `字段级合并 ${mergedPlanCount} 份计划冲突`,
      pendingPlanCount: state.plans.length,
      lastCheckedAt: now,
      lastRemoteStatus: `已按字段合并 ${mergedPlanCount} 份计划冲突，远端字段 ${remoteFieldCount} 项，本机字段 ${localFieldCount} 项。`,
      lastError: ""
    });
    addEvent("plan-repository-conflict-merge", `字段级合并计划冲突：${mergedPlanCount} 份`);
    saveState();
    return {
      ok: true,
      mergedCount: mergedPlanCount,
      remoteFieldCount,
      localFieldCount,
      plans: state.plans.filter((plan) => repository.lastSyncConflictPlanIds.includes(plan.id)).map(decoratePlan),
      status: getPlanRepositoryStatus(),
      message: `已按字段合并 ${mergedPlanCount} 份计划冲突，远端字段 ${remoteFieldCount} 项、本机字段 ${localFieldCount} 项已保留，结果已加入待同步队列。`
    };
  }

  function normalizePlanRepositoryMergeSelections(input = {}) {
    const source = input && typeof input === "object" ? input : {};
    return Object.entries(source).reduce((result, [planId, planChoice]) => {
      if (!planChoice || typeof planChoice !== "object") return result;
      const normalizedPlanId = String(planId || "").trim();
      if (!normalizedPlanId) return result;
      const planFields = planChoice.plan && typeof planChoice.plan === "object" ? planChoice.plan : {};
      const items = planChoice.items && typeof planChoice.items === "object" ? planChoice.items : {};
      result[normalizedPlanId] = {
        plan: normalizePlanRepositoryMergeFieldChoices(planFields, PLAN_REPOSITORY_MERGE_PLAN_FIELDS),
        items: Object.entries(items).reduce((itemResult, [itemId, itemChoice]) => {
          const normalizedItemId = String(itemId || "").trim();
          if (!normalizedItemId || !itemChoice || typeof itemChoice !== "object") return itemResult;
          itemResult[normalizedItemId] = normalizePlanRepositoryMergeFieldChoices(itemChoice, PLAN_REPOSITORY_MERGE_ITEM_FIELDS);
          return itemResult;
        }, {})
      };
      return result;
    }, {});
  }

  function normalizePlanRepositoryMergeFieldChoices(source = {}, allowedFields = []) {
    return allowedFields.reduce((result, field) => {
      result[field] = source[field] === "remote" ? "remote" : "local";
      return result;
    }, {});
  }

  function copyRemotePlanRepositoryConflicts(repository) {
    const remotePlans = repository.lastSyncConflictPlans
      .map(normalizePlan)
      .filter(Boolean);
    if (!remotePlans.length) {
      return {
        ok: false,
        status: getPlanRepositoryStatus(),
        message: "没有可另存为副本的远端冲突计划，请重新拉取远端计划。"
      };
    }

    const now = new Date().toISOString();
    const copiedPlans = remotePlans.map((plan) => {
      const copy = normalizePlan({
        ...plan,
        id: makeId("plan"),
        createdAt: now,
        updatedAt: now,
        title: createUniquePlanTitle(`${plan.title || "远端计划"}（远端副本）`),
        cycleRule: {
          ...plan.cycleRule,
          previousPlanId: plan.id,
          generatedAt: now,
          generatedNextPlanId: null
        }
      });
      state.plans.push(copy);
      return copy;
    });

    state.planRepository = normalizePlanRepository({
      ...clearPlanRepositoryConflictFields(repository),
      pendingAutoSync: true,
      pendingSince: repository.pendingSince || now,
      pendingReason: `远端冲突计划另存为本机副本：${copiedPlans.length} 份`,
      pendingPlanCount: state.plans.length,
      lastCheckedAt: now,
      lastRemoteStatus: `已将 ${copiedPlans.length} 份远端冲突计划另存为本机副本。`,
      lastError: ""
    });
    addEvent("plan-repository-conflict-copy", `远端冲突计划另存副本：${copiedPlans.length} 份`);
    saveState();
    return {
      ok: true,
      copiedCount: copiedPlans.length,
      plans: copiedPlans.map(decoratePlan),
      status: getPlanRepositoryStatus(),
      message: `已将 ${copiedPlans.length} 份远端冲突计划另存为本机副本，并加入待同步队列。`
    };
  }

  function createUniquePlanTitle(baseTitle) {
    const base = String(baseTitle || "远端计划（远端副本）");
    const existing = new Set(state.plans.map((plan) => plan.title));
    let title = base.slice(0, 100);
    let index = 2;
    while (existing.has(title)) {
      title = `${base.slice(0, 92)} ${index}`;
      index += 1;
    }
    return title;
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
      ...state.reports.map(reportToHistoryEntry),
      ...state.stageRecords.map(stageToHistoryEntry)
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

  function getArtworkRepositoryStatus() {
    const repository = normalizeArtworkRepository(state.artworkRepository);
    const artworkCount = state.artworks.length;
    const linkedSessionCount = getArtworkRepositoryLinkedSessions(state.artworks).length;
    const classroomReviewCount = state.artworks.filter((artwork) => normalizeArtwork(artwork)?.classroomReview).length;
    let tone = "idle";
    let message = artworkCount
      ? `本机作品仓库有 ${artworkCount} 幅作品，关联 ${linkedSessionCount} 条练习，可导出 JSON 仓库包。`
      : "还没有可导出的作品；保存作品后可生成本机作品仓库包。";

    const lastRepositoryEvents = [
      repository.lastImportedAt
        ? {
            at: repository.lastImportedAt,
            message: `最近导入 ${repository.lastImportedArtworkCount} 幅作品、${repository.lastImportedSessionCount} 条关联练习：${formatPlanDate(repository.lastImportedAt)}${repository.lastPackageDigest ? `，摘要 ${repository.lastPackageDigest.slice(0, 12)}` : ""}。`
          }
        : null,
      repository.lastExportedAt
        ? {
            at: repository.lastExportedAt,
            message: `最近导出 ${repository.lastExportedArtworkCount} 幅作品、${repository.lastExportedSessionCount} 条关联练习：${formatPlanDate(repository.lastExportedAt)}${repository.lastPackageDigest ? `，摘要 ${repository.lastPackageDigest.slice(0, 12)}` : ""}。`
          }
        : null,
      repository.lastCollectionExportedAt
        ? {
            at: repository.lastCollectionExportedAt,
            message: `最近导出 ${repository.lastCollectionArtworkCount} 幅作品的离线 HTML 作品集：${formatPlanDate(repository.lastCollectionExportedAt)}。`
          }
        : null,
      repository.lastClassroomReviewExportedAt
        ? {
            at: repository.lastClassroomReviewExportedAt,
            message: `最近导出 ${repository.lastClassroomReviewArtworkCount} 幅作品的离线课堂评阅表：${formatPlanDate(repository.lastClassroomReviewExportedAt)}。`
          }
        : null,
      repository.lastClassroomReviewImportedAt
        ? {
            at: repository.lastClassroomReviewImportedAt,
            message: `最近导入 ${repository.lastClassroomReviewImportedCount} 条课堂评阅，跳过 ${repository.lastClassroomReviewSkippedCount} 条：${formatPlanDate(repository.lastClassroomReviewImportedAt)}${repository.lastClassroomReviewPackageDigest ? `，摘要 ${repository.lastClassroomReviewPackageDigest.slice(0, 12)}` : ""}。`
          }
        : null,
      repository.lastClassroomReviewSummaryExportedAt
        ? {
            at: repository.lastClassroomReviewSummaryExportedAt,
            message: `最近导出 ${repository.lastClassroomReviewSummaryCount} 条课堂评阅汇总：${formatPlanDate(repository.lastClassroomReviewSummaryExportedAt)}。`
          }
        : null
    ]
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.at || 0) - Date.parse(a.at || 0));
    if (lastRepositoryEvents.length) {
      tone = "ready";
      message = lastRepositoryEvents[0].message;
    }
    if (repository.lastSkippedConflictCount > 0) {
      tone = "warning";
      message = `作品仓库导入时有 ${repository.lastSkippedConflictCount} 条同 ID 差异记录已跳过，未覆盖本机作品。`;
    }
    if (repository.lastError) {
      tone = "warning";
      message = repository.lastError;
    }

    return {
      ok: true,
      kind: ARTWORK_REPOSITORY_KIND,
      mode: repository.mode,
      workspaceId: repository.workspaceId,
      artworkCount,
      linkedSessionCount,
      classroomReviewCount,
      tone,
      message,
      boundary: ARTWORK_REPOSITORY_BOUNDARY,
      lastExportedAt: repository.lastExportedAt,
      lastImportedAt: repository.lastImportedAt,
      lastCheckedAt: repository.lastCheckedAt,
      lastExportedArtworkCount: repository.lastExportedArtworkCount,
      lastExportedSessionCount: repository.lastExportedSessionCount,
      lastImportedArtworkCount: repository.lastImportedArtworkCount,
      lastImportedSessionCount: repository.lastImportedSessionCount,
      lastCollectionExportedAt: repository.lastCollectionExportedAt,
      lastCollectionArtworkCount: repository.lastCollectionArtworkCount,
      lastClassroomReviewExportedAt: repository.lastClassroomReviewExportedAt,
      lastClassroomReviewArtworkCount: repository.lastClassroomReviewArtworkCount,
      lastClassroomReviewImportedAt: repository.lastClassroomReviewImportedAt,
      lastClassroomReviewImportedCount: repository.lastClassroomReviewImportedCount,
      lastClassroomReviewSkippedCount: repository.lastClassroomReviewSkippedCount,
      lastClassroomReviewPackageDigest: repository.lastClassroomReviewPackageDigest,
      lastClassroomReviewSummaryExportedAt: repository.lastClassroomReviewSummaryExportedAt,
      lastClassroomReviewSummaryCount: repository.lastClassroomReviewSummaryCount,
      lastSkippedConflictCount: repository.lastSkippedConflictCount,
      lastConflictRecords: clone(repository.lastConflictRecords),
      lastPackageId: repository.lastPackageId,
      lastPackageDigest: repository.lastPackageDigest,
      lastError: repository.lastError
    };
  }

  function getArtworkRepositoryLinkedSessions(artworks = state.artworks) {
    const sessionIds = new Set(
      (Array.isArray(artworks) ? artworks : [])
        .map((artwork) => artwork?.sessionId)
        .filter(Boolean)
        .map(String)
    );
    return state.sessions
      .filter((session) => sessionIds.has(session.id))
      .map(normalizeSession)
      .filter(Boolean);
  }

  function getArtworkRepositoryPackage(options = {}) {
    const repository = normalizeArtworkRepository(state.artworkRepository);
    const selectedIds = Array.isArray(options.ids)
      ? new Set(options.ids.map(String).filter(Boolean))
      : null;
    const artworks = state.artworks
      .filter((artwork) => !selectedIds || selectedIds.has(artwork.id))
      .map(normalizeArtwork)
      .filter(Boolean);
    if (!artworks.length) {
      return {
        ok: false,
        message: "还没有可导出的作品仓库包。"
      };
    }

    const linkedSessions = getArtworkRepositoryLinkedSessions(artworks);
    const exportedAt = new Date().toISOString();
    const packageId = `artwork-repository-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const packageRecord = {
      kind: ARTWORK_REPOSITORY_KIND,
      version: VERSION,
      packageId,
      workspaceId: repository.workspaceId,
      exportedAt,
      storageKey: STORAGE_KEY,
      source: {
        mode: "local-json",
        workspaceId: repository.workspaceId,
        boundary: ARTWORK_REPOSITORY_BOUNDARY
      },
      summary: getArtworkRepositorySummary(artworks, linkedSessions),
      artworks: clone(artworks),
      linkedSessions: clone(linkedSessions),
      records: {
        artworks: clone(artworks),
        sessions: clone(linkedSessions)
      },
      digestAlgorithm: ARTWORK_REPOSITORY_DIGEST_ALGORITHM
    };
    packageRecord.packageDigest = createArtworkRepositoryPackageDigest(packageRecord);
    return {
      ok: true,
      filename: `mr-calligraphy-artwork-repository-${Date.now()}.json`,
      package: packageRecord,
      message: `已生成 ${artworks.length} 幅作品的本机作品仓库包，摘要 ${packageRecord.packageDigest.slice(0, 12)}。${ARTWORK_REPOSITORY_BOUNDARY}`
    };
  }

  function createArtworkRepositoryPackageDigest(packageRecord = {}) {
    const payload = clone(packageRecord || {});
    delete payload.packageDigest;
    return sha256StableJson(payload);
  }

  function downloadArtworkRepository(options = {}) {
    const result = getArtworkRepositoryPackage(options);
    if (!result.ok) {
      recordArtworkRepositoryError(result.message);
      return result;
    }

    downloadJson(result.package, result.filename);
    const now = new Date().toISOString();
    state.artworkRepository = normalizeArtworkRepository({
      ...state.artworkRepository,
      lastExportedAt: now,
      lastCheckedAt: now,
      lastExportedArtworkCount: result.package.artworks.length,
      lastExportedSessionCount: result.package.linkedSessions.length,
      lastSkippedConflictCount: 0,
      lastConflictRecords: [],
      lastPackageId: result.package.packageId,
      lastPackageDigest: result.package.packageDigest,
      lastError: ""
    });
    addEvent("artwork-repository-export", `导出作品仓库包：${result.package.artworks.length} 幅作品`);
    saveState();
    return {
      ok: true,
      filename: result.filename,
      exportedArtworkCount: result.package.artworks.length,
      exportedSessionCount: result.package.linkedSessions.length,
      status: getArtworkRepositoryStatus(),
      message: `已下载作品仓库 JSON 包：${result.filename}，摘要 ${result.package.packageDigest.slice(0, 12)}。${ARTWORK_REPOSITORY_BOUNDARY}`
    };
  }

  function getArtworkCollectionExport(options = {}) {
    const selectedIds = Array.isArray(options.ids)
      ? new Set(options.ids.map(String).filter(Boolean))
      : null;
    const artworks = state.artworks
      .filter((artwork) => !selectedIds || selectedIds.has(artwork.id))
      .map(normalizeArtwork)
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0));
    if (!artworks.length) {
      return {
        ok: false,
        message: "还没有可导出的作品集。请先保存作品。"
      };
    }

    const linkedSessions = getArtworkRepositoryLinkedSessions(artworks);
    const exportedAt = new Date().toISOString();
    const collection = {
      kind: ARTWORK_COLLECTION_KIND,
      version: VERSION,
      exportedAt,
      storageKey: STORAGE_KEY,
      boundary: ARTWORK_COLLECTION_BOUNDARY,
      summary: getArtworkRepositorySummary(artworks, linkedSessions),
      artworks: artworks.map(decorateArtworkCollectionItem),
      linkedSessions: clone(linkedSessions)
    };
    return {
      ok: true,
      collection: clone(collection),
      html: createArtworkCollectionHtml(collection),
      filename: `mr-calligraphy-artwork-collection-${Date.now()}.html`,
      message: `已生成 ${artworks.length} 幅作品的离线 HTML 作品集。${ARTWORK_COLLECTION_BOUNDARY}`
    };
  }

  function downloadArtworkCollectionPage(options = {}) {
    const result = getArtworkCollectionExport(options);
    if (!result.ok) {
      recordArtworkRepositoryError(result.message);
      return result;
    }
    downloadHtml(result.html, result.filename);
    const now = new Date().toISOString();
    state.artworkRepository = normalizeArtworkRepository({
      ...state.artworkRepository,
      lastCollectionExportedAt: now,
      lastCollectionArtworkCount: result.collection.artworks.length,
      lastCheckedAt: now,
      lastError: ""
    });
    addEvent("artwork-collection-export", `导出离线作品集：${result.collection.artworks.length} 幅作品`);
    saveState();
    return {
      ok: true,
      filename: result.filename,
      exportedArtworkCount: result.collection.artworks.length,
      status: getArtworkRepositoryStatus(),
      message: `${result.message} 已下载：${result.filename}。`
    };
  }

  function decorateArtworkCollectionItem(artwork) {
    const galleryItem = decorateArtworkGalleryItem(artwork);
    const session = findArtworkSession(artwork);
    const metrics = pickRealMetrics(session?.metrics) || {};
    const feedback = galleryItem.feedback?.length
      ? galleryItem.feedback
      : session?.feedback?.length
        ? clone(session.feedback)
        : [];
    const scoreEvidence = hasUsableScoreEvidence(artwork.scoreEvidence)
      ? normalizeScoreEvidence(artwork.scoreEvidence, artwork)
      : hasUsableScoreEvidence(session?.scoreEvidence)
        ? normalizeScoreEvidence(session.scoreEvidence, session)
        : null;
    return {
      ...galleryItem,
      metrics,
      feedback,
      scoreEvidenceSummary: scoreEvidence
        ? {
            algorithmVersion: scoreEvidence.algorithmVersion || DEFAULT_SCORE_ALGORITHM_VERSION,
            pathFitPercent: normalizeInteger(scoreEvidence.evidence?.pathFitPercent, 0, 0, 100),
            pressurePointCount: normalizeInteger(scoreEvidence.evidence?.pressurePointCount, 0, 0, 99999),
            heatmapCount: normalizePathErrorHotspots(scoreEvidence.evidence?.pathErrorHotspots).length,
            strokeMatchCount: normalizeStrokeMatchList(scoreEvidence.evidence?.strokeMatches).length
          }
        : null,
      session: session
        ? {
            id: session.id,
            title: session.title || `${session.glyph}字练习`,
            copybook: session.copybook,
            trainingMode: session.trainingMode,
            createdAt: session.endedAt || session.snapshotAt || session.startedAt
          }
        : null
    };
  }

  function createArtworkCollectionHtml(collection) {
    const summary = collection.summary || {};
    const artworks = Array.isArray(collection.artworks) ? collection.artworks : [];
    const tagCounts = new Map();
    artworks.forEach((artwork) => {
      (artwork.tags || []).forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));
    });
    const tags = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hans-CN"))
      .slice(0, 18);
    const tagCloud = tags.length
      ? tags.map(([tag, count]) => `<span>${escapeHtml(tag)} ${count}</span>`).join("")
      : `<span>未标记</span>`;
    const cards = artworks.map((artwork) => createArtworkCollectionCardHtml(artwork)).join("");
    const watermarkText = `MR 书法作品集 · ${formatDateTime(collection.exportedAt)} · ${artworks.length} 幅作品`;
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MR 书法作品集 · ${escapeHtml(artworks.length)} 幅作品</title>
  <style>
    :root { color-scheme: light; --ink:#17221f; --muted:#66766f; --line:#dce5df; --paper:#fbf7ee; --card:#ffffff; --wash:#eef7f2; --jade:#257861; --gold:#b98238; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--paper); font: 15px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; }
    main { position: relative; z-index: 1; width: min(1120px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0 44px; }
    .watermark { position: fixed; inset: 0; z-index: 0; display: grid; place-items: center; pointer-events: none; color: rgba(37, 120, 97, 0.08); font-size: clamp(28px, 7vw, 68px); font-weight: 900; text-align: center; transform: rotate(-24deg); }
    .toolbar { position: sticky; top: 0; z-index: 2; display: flex; justify-content: flex-end; margin-bottom: 14px; padding: 9px 0; background: var(--paper); }
    button { min-height: 38px; padding: 0 16px; border: 1px solid var(--ink); border-radius: 8px; color: #fff; background: var(--ink); font: inherit; cursor: pointer; }
    header { display: grid; gap: 12px; padding-bottom: 18px; border-bottom: 2px solid var(--ink); }
    h1, h2, h3, p, figure { margin: 0; }
    h1 { font-size: clamp(34px, 7vw, 64px); line-height: 1.05; letter-spacing: 0; }
    h2 { font-size: 20px; }
    h3 { font-size: 17px; line-height: 1.25; }
    .meta, .muted { color: var(--muted); }
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 18px; }
    .stat, .card, .box { border: 1px solid var(--line); border-radius: 8px; background: var(--card); }
    .stat { padding: 14px; }
    .stat span { display: block; color: var(--muted); font-size: 12px; }
    .stat strong { display: block; margin-top: 4px; font-size: 28px; line-height: 1.1; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tags span { min-height: 26px; padding: 3px 9px; border-radius: 99px; color: var(--ink); background: #edf5ef; font-size: 12px; font-weight: 800; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 18px; }
    .card { display: grid; grid-template-rows: 230px minmax(0, 1fr); overflow: hidden; break-inside: avoid; page-break-inside: avoid; }
    .artwork-media { display: grid; min-height: 230px; place-items: center; background: #f1e5ce; }
    .artwork-media img { width: 100%; height: 100%; object-fit: contain; }
    .artwork-media span { color: rgba(48, 34, 20, 0.74); font-size: 64px; font-weight: 900; }
    .card-body { display: grid; gap: 10px; padding: 14px; }
    .card-meta { color: var(--muted); font-size: 12px; font-weight: 760; }
    .card-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
    .card-stats span { min-height: 54px; padding: 8px; border-radius: 7px; background: var(--wash); color: var(--muted); font-size: 12px; }
    .card-stats strong { display: block; color: var(--ink); font-size: 18px; }
    .metrics, .feedback { display: grid; gap: 7px; margin: 0; padding: 0; list-style: none; }
    .metrics li { display: grid; grid-template-columns: 48px 1fr 34px; gap: 7px; align-items: center; font-size: 12px; }
    .metrics b { height: 9px; overflow: hidden; border-radius: 99px; background: var(--line); }
    .metrics i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--jade), var(--gold)); }
    .feedback li { padding-left: 8px; border-left: 3px solid rgba(37, 120, 97, 0.28); color: var(--muted); font-size: 12px; }
    .box { display: grid; gap: 8px; padding: 14px; margin-top: 18px; }
    footer { margin-top: 24px; padding-top: 14px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    @media print { @page { size: A4; margin: 12mm; } body { background: #fff; font-size: 12px; } main { width: 100%; padding: 0; } .toolbar { display: none; } .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } .card { grid-template-rows: 180px minmax(0, 1fr); } .artwork-media { min-height: 180px; } }
    @media (max-width: 900px) { .grid, .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 620px) { main { width: min(100% - 20px, 1120px); padding-top: 18px; } .grid, .stats { grid-template-columns: 1fr; } .card { grid-template-rows: 210px minmax(0, 1fr); } .artwork-media { min-height: 210px; } }
  </style>
</head>
<body>
  <div class="watermark" aria-hidden="true">${escapeHtml(watermarkText)}</div>
  <main>
    <div class="toolbar"><button type="button" onclick="window.print()">打印 / 保存 PDF</button></div>
    <header>
      <p class="meta">MR Calligraphy Artwork Collection · ${escapeHtml(formatDateTime(collection.exportedAt))}</p>
      <h1>MR 书法作品集</h1>
      <p class="muted">这是一份本机离线 HTML 作品集，数据来自当前浏览器保存的真实作品记录；可打印或手动分享，不是云端公开链接。</p>
      <div class="tags">${tagCloud}</div>
    </header>
    <section class="stats" aria-label="作品集摘要">
      <div class="stat"><span>作品</span><strong>${summary.total || artworks.length}</strong></div>
      <div class="stat"><span>平均分</span><strong>${summary.averageScore || 0}</strong></div>
      <div class="stat"><span>有截图</span><strong>${summary.imageCount || 0}</strong></div>
      <div class="stat"><span>关联练习</span><strong>${summary.linkedSessionCount || 0}</strong></div>
    </section>
    <section class="grid" aria-label="作品卡片">
      ${cards}
    </section>
    <section class="box">
      <h2>导出边界</h2>
      <p class="muted">${escapeHtml(collection.boundary || ARTWORK_COLLECTION_BOUNDARY)}</p>
      <p class="muted">ArtworkCollection: yes · StorageKey: ${escapeHtml(collection.storageKey || STORAGE_KEY)} · ExportedAt: ${escapeHtml(collection.exportedAt)}</p>
    </section>
    <footer>作品集包含 ${escapeHtml(artworks.length)} 幅作品。若需要可迁移数据，请同时导出作品仓库 JSON 包。</footer>
  </main>
</body>
</html>`;
  }

  function createArtworkCollectionCardHtml(artwork) {
    const metrics = artwork.metrics || {};
    const image = artwork.imageData
      ? `<img src="${escapeAttr(artwork.imageData)}" alt="${escapeAttr(artwork.title)}">`
      : `<span>${escapeHtml(artwork.glyph || "作品")}</span>`;
    const tags = (artwork.tags?.length ? artwork.tags : [artwork.glyph, artwork.style].filter(Boolean))
      .slice(0, 6)
      .map((tag) => `<span>${escapeHtml(tag)}</span>`)
      .join("");
    const metricRows = SCORE_METRICS.map((metric) => {
      const value = normalizeScore(metrics[metric.key], 0);
      return `<li><span>${escapeHtml(metric.label)}</span><b><i style="width:${value}%"></i></b><strong>${value || "-"}</strong></li>`;
    }).join("");
    const feedback = artwork.feedback?.length
      ? artwork.feedback.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("")
      : `<li>暂无自动反馈；这张卡片只展示已有记录。</li>`;
    const evidence = artwork.scoreEvidenceSummary
      ? `证据 ${artwork.scoreEvidenceSummary.pathFitPercent || 0}% / 热力 ${artwork.scoreEvidenceSummary.heatmapCount || 0}`
      : "无评分证据";
    return `<article class="card">
      <div class="artwork-media">${image}</div>
      <div class="card-body">
        <h3>${escapeHtml(artwork.title)}</h3>
        <p class="card-meta">${escapeHtml(formatDateTime(artwork.createdAt))} / ${escapeHtml(artwork.glyph || "-")} / ${escapeHtml(artwork.style || "-")}</p>
        <div class="tags">${tags}</div>
        <div class="card-stats">
          <span>评分<strong>${artwork.score || 0}</strong></span>
          <span>笔画<strong>${artwork.strokeCount || 0}</strong></span>
          <span>采样<strong>${artwork.pointCount || 0}</strong></span>
        </div>
        <ul class="metrics">${metricRows}</ul>
        <ul class="feedback">${feedback}</ul>
        <p class="card-meta">${escapeHtml(evidence)}${artwork.session ? ` / ${escapeHtml(artwork.session.copybook || "")}` : ""}</p>
      </div>
    </article>`;
  }

  function getArtworkClassroomReviewExport(options = {}) {
    const selectedIds = Array.isArray(options.ids)
      ? new Set(options.ids.map(String).filter(Boolean))
      : null;
    const artworks = state.artworks
      .filter((artwork) => !selectedIds || selectedIds.has(artwork.id))
      .map(normalizeArtwork)
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0));
    if (!artworks.length) {
      return {
        ok: false,
        message: "还没有可导出的课堂评阅表。请先保存作品。"
      };
    }

    const linkedSessions = getArtworkRepositoryLinkedSessions(artworks);
    const exportedAt = new Date().toISOString();
    const stamp = Date.now();
    const reviewPackage = {
      kind: ARTWORK_CLASSROOM_REVIEW_KIND,
      version: VERSION,
      packageId: `classroom-review-${stamp}`,
      exportedAt,
      storageKey: STORAGE_KEY,
      boundary: ARTWORK_CLASSROOM_REVIEW_BOUNDARY,
      summary: getArtworkRepositorySummary(artworks, linkedSessions),
      artworks: artworks.map(decorateArtworkClassroomReviewItem),
      linkedSessions: clone(linkedSessions)
    };
    return {
      ok: true,
      package: clone(reviewPackage),
      html: createArtworkClassroomReviewHtml(reviewPackage),
      filename: `mr-calligraphy-classroom-review-${stamp}.html`,
      message: `已生成 ${artworks.length} 幅作品的离线课堂评阅表。${ARTWORK_CLASSROOM_REVIEW_BOUNDARY}`
    };
  }

  function downloadArtworkClassroomReviewPage(options = {}) {
    const result = getArtworkClassroomReviewExport(options);
    if (!result.ok) {
      recordArtworkRepositoryError(result.message);
      return result;
    }
    downloadHtml(result.html, result.filename);
    const now = new Date().toISOString();
    state.artworkRepository = normalizeArtworkRepository({
      ...state.artworkRepository,
      lastClassroomReviewExportedAt: now,
      lastClassroomReviewArtworkCount: result.package.artworks.length,
      lastCheckedAt: now,
      lastError: ""
    });
    addEvent("artwork-classroom-review-export", `导出课堂评阅表：${result.package.artworks.length} 幅作品`);
    saveState();
    return {
      ok: true,
      filename: result.filename,
      exportedArtworkCount: result.package.artworks.length,
      status: getArtworkRepositoryStatus(),
      message: `${result.message} 已下载：${result.filename}。`
    };
  }

  function decorateArtworkClassroomReviewItem(artwork) {
    const item = decorateArtworkCollectionItem(artwork);
    const metricSource = item.metrics || {};
    const rubric = SCORE_METRICS.map((metric) => {
      const value = normalizeScore(metricSource[metric.key], 0);
      return {
        key: metric.key,
        label: metric.label,
        value,
        suggestion: getClassroomReviewMetricSuggestion(metric.label, value)
      };
    });
    return {
      ...item,
      reviewRubric: rubric,
      reviewHint: item.score >= 88
        ? "可作为课堂展示候选，重点确认章法完整度和落款安排。"
        : item.score >= 76
          ? "适合做同伴互评，重点记录一条保留项和一条改进项。"
          : "建议教师优先给出结构、笔画或节奏中的一个可执行练习目标。"
    };
  }

  function getClassroomReviewMetricSuggestion(label, value) {
    if (value >= 88) return `${label}表现稳定，可记录保留做法。`;
    if (value >= 76) return `${label}已有基础，评阅时补充一个具体改进点。`;
    if (value > 0) return `${label}需要专项练习，建议给出下一次练习目标。`;
    return `${label}暂无有效评分，评阅时以教师观察为准。`;
  }

  function createArtworkClassroomReviewHtml(reviewPackage) {
    const summary = reviewPackage.summary || {};
    const artworks = Array.isArray(reviewPackage.artworks) ? reviewPackage.artworks : [];
    const cards = artworks.map((artwork, index) => createArtworkClassroomReviewCardHtml(artwork, index)).join("");
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MR 课堂作品评阅表 · ${escapeHtml(artworks.length)} 幅作品</title>
  <style>
    :root { color-scheme: light; --ink:#17221f; --muted:#64736c; --line:#dce5df; --paper:#fbf7ee; --card:#ffffff; --wash:#edf7f2; --jade:#257861; --amber:#b98238; --danger:#a8452f; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--paper); font: 15px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; }
    main { width: min(1160px, calc(100% - 28px)); margin: 0 auto; padding: 24px 0 42px; }
    h1, h2, h3, p, figure { margin: 0; }
    h1 { font-size: clamp(30px, 6vw, 54px); line-height: 1.05; letter-spacing: 0; }
    h2 { font-size: 19px; }
    h3 { font-size: 16px; line-height: 1.25; }
    button, input, textarea, select { font: inherit; }
    button { min-height: 38px; padding: 0 14px; border: 1px solid var(--ink); border-radius: 8px; color: #fff; background: var(--ink); cursor: pointer; }
    input, textarea, select { width: 100%; border: 1px solid var(--line); border-radius: 7px; background: #fff; color: var(--ink); }
    input, select { min-height: 36px; padding: 0 9px; }
    textarea { min-height: 86px; padding: 8px 9px; resize: vertical; }
    label { display: grid; gap: 5px; color: var(--muted); font-size: 12px; font-weight: 800; }
    .muted, .meta { color: var(--muted); }
    .toolbar { position: sticky; top: 0; z-index: 2; display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; padding: 9px 0; background: var(--paper); }
    header { display: grid; gap: 10px; padding-bottom: 16px; border-bottom: 2px solid var(--ink); }
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 16px; }
    .stat, .card, .boundary { border: 1px solid var(--line); border-radius: 8px; background: var(--card); }
    .stat { padding: 13px; }
    .stat span { display: block; color: var(--muted); font-size: 12px; }
    .stat strong { display: block; margin-top: 3px; font-size: 26px; line-height: 1.1; }
    .grid { display: grid; gap: 14px; margin-top: 18px; }
    .card { display: grid; grid-template-columns: 240px minmax(0, 1fr); overflow: hidden; break-inside: avoid; page-break-inside: avoid; }
    .artwork-media { display: grid; min-height: 240px; place-items: center; background: #f1e5ce; }
    .artwork-media img { width: 100%; height: 100%; object-fit: contain; }
    .artwork-media span { color: rgba(48, 34, 20, 0.72); font-size: 64px; font-weight: 900; }
    .card-body { display: grid; gap: 11px; padding: 14px; }
    .card-meta { color: var(--muted); font-size: 12px; font-weight: 760; }
    .rubric { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
    .rubric span { min-height: 74px; padding: 8px; border-radius: 7px; background: var(--wash); color: var(--muted); font-size: 12px; }
    .rubric strong { display: block; color: var(--ink); font-size: 18px; }
    .feedback { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
    .feedback li { padding-left: 8px; border-left: 3px solid rgba(37, 120, 97, 0.28); color: var(--muted); font-size: 12px; }
    .review-form { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; padding-top: 4px; border-top: 1px solid var(--line); }
    .review-form label:last-child { grid-column: 1 / -1; }
    .boundary { display: grid; gap: 8px; margin-top: 18px; padding: 14px; }
    .status { min-height: 28px; color: var(--jade); font-size: 13px; font-weight: 850; }
    @media print { @page { size: A4; margin: 12mm; } body { background: #fff; font-size: 12px; } main { width: 100%; padding: 0; } .toolbar { display: none; } .card { grid-template-columns: 170px minmax(0, 1fr); } .artwork-media { min-height: 170px; } textarea { min-height: 64px; } }
    @media (max-width: 900px) { .card { grid-template-columns: 1fr; } .artwork-media { min-height: 220px; } .rubric, .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .review-form { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 620px) { main { width: min(100% - 20px, 1160px); } .rubric, .stats, .review-form { grid-template-columns: 1fr; } }
  </style>
</head>
<body data-package-id="${escapeAttr(reviewPackage.packageId)}">
  <main>
    <div class="toolbar">
      <button type="button" data-export-review-notes>导出评阅 JSON</button>
      <button type="button" onclick="window.print()">打印 / 保存 PDF</button>
    </div>
    <header>
      <p class="meta">MR Calligraphy Classroom Review · ${escapeHtml(formatDateTime(reviewPackage.exportedAt))}</p>
      <h1>MR 课堂作品评阅表</h1>
      <p class="muted">这份评阅表来自当前浏览器的真实作品记录。教师可离线填写评语、保存到本浏览器并导出 JSON，便于线下收集；它不是账号化教师端。</p>
      <p class="status" data-review-status>等待填写评阅。</p>
    </header>
    <section class="stats" aria-label="评阅摘要">
      <div class="stat"><span>作品</span><strong>${summary.total || artworks.length}</strong></div>
      <div class="stat"><span>平均分</span><strong>${summary.averageScore || 0}</strong></div>
      <div class="stat"><span>有截图</span><strong>${summary.imageCount || 0}</strong></div>
      <div class="stat"><span>关联练习</span><strong>${summary.linkedSessionCount || 0}</strong></div>
    </section>
    <section class="grid" aria-label="待评阅作品">
      ${cards}
    </section>
    <section class="boundary">
      <h2>导出边界</h2>
      <p class="muted">${escapeHtml(reviewPackage.boundary || ARTWORK_CLASSROOM_REVIEW_BOUNDARY)}</p>
      <p class="muted">ClassroomReview: yes · PackageId: ${escapeHtml(reviewPackage.packageId)} · StorageKey: ${escapeHtml(reviewPackage.storageKey || STORAGE_KEY)}</p>
    </section>
  </main>
  <script>
(() => {
  const packageId = document.body.dataset.packageId || "classroom-review";
  const storageKey = "mr-calligraphy-classroom-review-notes:" + packageId;
  const status = document.querySelector("[data-review-status]");
  const cards = Array.from(document.querySelectorAll("[data-review-card]"));
  function readSaved() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}") || {};
    } catch (error) {
      return {};
    }
  }
  function collect() {
    return {
      kind: "mr-calligraphy-classroom-review-notes-v1",
      packageId,
      exportedAt: new Date().toISOString(),
      digestAlgorithm: "sha256-stable-json",
      records: cards.map((card) => {
        const get = (field) => card.querySelector('[data-review-field="' + field + '"]')?.value || "";
        return {
          artworkId: card.dataset.artworkId || "",
          title: card.dataset.artworkTitle || "",
          teacherScore: get("teacherScore"),
          level: get("level"),
          reviewer: get("reviewer"),
          note: get("note")
        };
      })
    };
  }
  function stableStringify(value) {
    if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
    if (value && typeof value === "object") {
      return "{" + Object.keys(value).sort().map((key) => JSON.stringify(key) + ":" + stableStringify(value[key])).join(",") + "}";
    }
    return JSON.stringify(value);
  }
  async function sha256StableJson(value) {
    if (!window.crypto?.subtle || typeof TextEncoder === "undefined") return "";
    const encoded = new TextEncoder().encode(stableStringify(value));
    const digest = await window.crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  async function collectForExport() {
    const data = collect();
    const packageDigest = await sha256StableJson(data);
    if (packageDigest) data.packageDigest = packageDigest;
    return data;
  }
  function updateStatus(data = collect()) {
    const filled = data.records.filter((record) => record.teacherScore || record.level || record.reviewer || record.note).length;
    if (status) status.textContent = filled ? "已保存 " + filled + " 条本机评阅，可导出 JSON。" : "等待填写评阅。";
  }
  function restore() {
    const saved = readSaved();
    const byId = new Map((saved.records || []).map((record) => [record.artworkId, record]));
    cards.forEach((card) => {
      const record = byId.get(card.dataset.artworkId || "");
      if (!record) return;
      ["teacherScore", "level", "reviewer", "note"].forEach((field) => {
        const input = card.querySelector('[data-review-field="' + field + '"]');
        if (input) input.value = record[field] || "";
      });
    });
    updateStatus();
  }
  function save() {
    const data = collect();
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      updateStatus(data);
    } catch (error) {
      if (status) status.textContent = "当前浏览器阻止本机保存，请直接导出评阅 JSON。";
    }
  }
  document.addEventListener("input", (event) => {
    if (event.target.closest("[data-review-card]")) save();
  });
  document.querySelector("[data-export-review-notes]")?.addEventListener("click", async () => {
    const data = await collectForExport();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mr-calligraphy-classroom-review-notes-" + packageId + ".json";
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => {
      URL.revokeObjectURL(link.href);
      link.remove();
    }, 0);
    updateStatus(data);
    if (status && data.packageDigest) status.textContent = "已导出 " + data.records.length + " 条本机评阅 JSON，摘要 " + data.packageDigest.slice(0, 12) + "。";
  });
  restore();
})();
  </script>
</body>
</html>`;
  }

  function createArtworkClassroomReviewCardHtml(artwork, index) {
    const image = artwork.imageData
      ? `<img src="${escapeAttr(artwork.imageData)}" alt="${escapeAttr(artwork.title)}">`
      : `<span>${escapeHtml(artwork.glyph || "作品")}</span>`;
    const feedback = artwork.feedback?.length
      ? artwork.feedback.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("")
      : `<li>暂无自动反馈；请以教师现场观察为准。</li>`;
    const rubric = (artwork.reviewRubric || [])
      .map((item) => `<span><strong>${item.value || "-"}</strong>${escapeHtml(item.label)}<br>${escapeHtml(item.suggestion)}</span>`)
      .join("");
    return `<article class="card" data-review-card data-artwork-id="${escapeAttr(artwork.id)}" data-artwork-title="${escapeAttr(artwork.title)}">
      <div class="artwork-media">${image}</div>
      <div class="card-body">
        <h3>${escapeHtml(index + 1)}. ${escapeHtml(artwork.title)}</h3>
        <p class="card-meta">${escapeHtml(formatDateTime(artwork.createdAt))} / ${escapeHtml(artwork.glyph || "-")} / ${escapeHtml(artwork.style || "-")} / 本机评分 ${escapeHtml(artwork.score || 0)}</p>
        <div class="rubric">${rubric}</div>
        <ul class="feedback">${feedback}</ul>
        <p class="card-meta">${escapeHtml(artwork.reviewHint || "")}</p>
        <div class="review-form">
          <label>教师分数<input data-review-field="teacherScore" type="number" min="0" max="100" step="1" placeholder="0-100"></label>
          <label>评阅等级<select data-review-field="level"><option value="">未评定</option><option value="展示">展示</option><option value="达标">达标</option><option value="需复练">需复练</option></select></label>
          <label>评阅人<input data-review-field="reviewer" type="text" maxlength="40" placeholder="教师姓名"></label>
          <label>课堂批注<textarea data-review-field="note" maxlength="800" placeholder="记录一条保留项和一条下一步练习建议"></textarea></label>
        </div>
      </div>
    </article>`;
  }

  function parseArtworkClassroomReviewNotes(input) {
    let source = input;
    if (typeof input === "string") {
      try {
        source = JSON.parse(input);
      } catch (error) {
        return { ok: false, message: "课堂评阅 JSON 解析失败。" };
      }
    }
    if (!source || typeof source !== "object") {
      return { ok: false, message: "课堂评阅 JSON 格式无效。" };
    }
    if (source.kind !== ARTWORK_CLASSROOM_REVIEW_NOTES_KIND) {
      return { ok: false, message: "这不是 MR 书法课堂评阅 JSON。" };
    }
    if (!Array.isArray(source.records)) {
      return { ok: false, message: "课堂评阅 JSON 缺少 records 数组。" };
    }
    const digestVerification = verifyArtworkClassroomReviewNotesPackageDigest(source);
    if (!digestVerification.ok) {
      return {
        ok: false,
        message: digestVerification.message
      };
    }
    return {
      ok: true,
      package: {
        ...source,
        packageId: String(source.packageId || "classroom-review-notes").slice(0, 160),
        records: source.records,
        packageDigest: digestVerification.packageDigest || normalizeArtworkRepositoryHex(source.packageDigest),
        digestAlgorithm: source.digestAlgorithm || (digestVerification.packageDigest ? ARTWORK_CLASSROOM_REVIEW_NOTES_DIGEST_ALGORITHM : "")
      },
      digestVerification
    };
  }

  function createArtworkClassroomReviewNotesPackageDigest(packageRecord = {}) {
    const payload = clone(packageRecord || {});
    delete payload.packageDigest;
    return sha256StableJson(payload);
  }

  function verifyArtworkClassroomReviewNotesPackageDigest(packageRecord = {}) {
    const claimedDigest = normalizeArtworkRepositoryHex(packageRecord.packageDigest);
    const algorithm = String(packageRecord.digestAlgorithm || "").trim();
    if (claimedDigest && algorithm && algorithm !== ARTWORK_CLASSROOM_REVIEW_NOTES_DIGEST_ALGORITHM) {
      return {
        ok: false,
        status: "unsupported-algorithm",
        packageDigest: claimedDigest,
        message: `课堂评阅 JSON 摘要算法不受支持：${algorithm}。未导入任何评阅。`
      };
    }
    if (!claimedDigest) {
      return {
        ok: true,
        status: "missing",
        packageDigest: "",
        message: "课堂评阅 JSON 未声明摘要，按旧版评阅包导入。"
      };
    }
    const actualDigest = createArtworkClassroomReviewNotesPackageDigest(packageRecord);
    if (actualDigest !== claimedDigest) {
      return {
        ok: false,
        status: "digest-mismatch",
        packageDigest: claimedDigest,
        actualDigest,
        message: `课堂评阅 JSON 摘要校验失败：声明 ${claimedDigest.slice(0, 12)}，实际 ${actualDigest.slice(0, 12)}。未导入任何评阅。`
      };
    }
    return {
      ok: true,
      status: "verified",
      packageDigest: claimedDigest,
      actualDigest,
      message: `课堂评阅 JSON 摘要校验通过：${claimedDigest.slice(0, 12)}。`
    };
  }

  function importArtworkClassroomReviewNotes(input) {
    const parsed = parseArtworkClassroomReviewNotes(input);
    if (!parsed.ok) {
      recordArtworkRepositoryError(parsed.message);
      return parsed;
    }

    const packageId = parsed.package.packageId;
    let importedCount = 0;
    let skippedCount = 0;
    const reviewedAt = normalizeIsoDate(parsed.package.exportedAt);
    const byId = new Map(state.artworks.map((artwork, index) => [String(artwork.id), { artwork, index }]));
    parsed.package.records.forEach((record) => {
      const artworkId = String(record?.artworkId || "").trim();
      const target = byId.get(artworkId);
      if (!target) {
        skippedCount += 1;
        return;
      }
      const review = normalizeArtworkClassroomReview({
        ...record,
        packageId,
        reviewedAt: record.reviewedAt || reviewedAt,
        source: "classroom-review-notes-import"
      }, {
        artworkId,
        artworkTitle: target.artwork.title,
        artworkCreatedAt: target.artwork.createdAt,
        packageId
      });
      if (!review) {
        skippedCount += 1;
        return;
      }
      state.artworks[target.index] = normalizeArtwork({
        ...target.artwork,
        classroomReview: review
      });
      importedCount += 1;
    });

    const now = new Date().toISOString();
    state.artworkRepository = normalizeArtworkRepository({
      ...state.artworkRepository,
      lastClassroomReviewImportedAt: now,
      lastClassroomReviewImportedCount: importedCount,
      lastClassroomReviewSkippedCount: skippedCount,
      lastClassroomReviewPackageDigest: parsed.package.packageDigest || "",
      lastCheckedAt: now,
      lastError: importedCount ? "" : "课堂评阅 JSON 没有匹配到可回写的本机作品。"
    });
    if (importedCount) {
      addEvent("artwork-classroom-review-import", `导入课堂评阅：${importedCount} 条，跳过 ${skippedCount} 条${parsed.package.packageDigest ? `，摘要 ${parsed.package.packageDigest.slice(0, 12)}` : ""}`);
    }
    saveState();
    return {
      ok: importedCount > 0,
      importedCount,
      skippedCount,
      packageId,
      packageDigest: parsed.package.packageDigest || "",
      status: getArtworkRepositoryStatus(),
      message: importedCount
        ? `已导入 ${importedCount} 条课堂评阅并回写到本机作品，跳过 ${skippedCount} 条。${parsed.package.packageDigest ? `摘要 ${parsed.package.packageDigest.slice(0, 12)}。` : ""}`
        : `课堂评阅 JSON 没有匹配到本机作品，已跳过 ${skippedCount} 条。`
    };
  }

  function getArtworkClassroomReviewSummaryExport(options = {}) {
    const selectedIds = Array.isArray(options.ids)
      ? new Set(options.ids.map(String).filter(Boolean))
      : null;
    const reviewedArtworks = state.artworks
      .map(normalizeArtwork)
      .filter(Boolean)
      .filter((artwork) => artwork.classroomReview)
      .filter((artwork) => !selectedIds || selectedIds.has(artwork.id))
      .sort((a, b) => Date.parse(b.classroomReview.reviewedAt || b.createdAt || 0) - Date.parse(a.classroomReview.reviewedAt || a.createdAt || 0));
    if (!reviewedArtworks.length) {
      return {
        ok: false,
        message: "还没有可导出的课堂评阅汇总。请先导入评阅 JSON。"
      };
    }

    const exportedAt = new Date().toISOString();
    const packageId = `classroom-review-summary-${Date.now()}`;
    const summaryPackage = {
      kind: ARTWORK_CLASSROOM_REVIEW_SUMMARY_KIND,
      version: VERSION,
      packageId,
      exportedAt,
      storageKey: STORAGE_KEY,
      boundary: ARTWORK_CLASSROOM_REVIEW_SUMMARY_BOUNDARY,
      summary: getArtworkClassroomReviewSummary(reviewedArtworks),
      artworks: reviewedArtworks.map(decorateArtworkClassroomReviewSummaryItem)
    };
    return {
      ok: true,
      package: clone(summaryPackage),
      html: createArtworkClassroomReviewSummaryHtml(summaryPackage),
      filename: `mr-calligraphy-classroom-review-summary-${Date.now()}.html`,
      message: `已生成 ${reviewedArtworks.length} 条课堂评阅汇总。${ARTWORK_CLASSROOM_REVIEW_SUMMARY_BOUNDARY}`
    };
  }

  function downloadArtworkClassroomReviewSummary(options = {}) {
    const result = getArtworkClassroomReviewSummaryExport(options);
    if (!result.ok) {
      recordArtworkRepositoryError(result.message);
      return result;
    }
    downloadHtml(result.html, result.filename);
    const now = new Date().toISOString();
    state.artworkRepository = normalizeArtworkRepository({
      ...state.artworkRepository,
      lastClassroomReviewSummaryExportedAt: now,
      lastClassroomReviewSummaryCount: result.package.artworks.length,
      lastCheckedAt: now,
      lastError: ""
    });
    addEvent("artwork-classroom-review-summary-export", `导出课堂评阅汇总：${result.package.artworks.length} 条`);
    saveState();
    return {
      ok: true,
      filename: result.filename,
      exportedReviewCount: result.package.artworks.length,
      status: getArtworkRepositoryStatus(),
      message: `${result.message} 已下载：${result.filename}。`
    };
  }

  function getArtworkClassroomReviewSummary(artworks = []) {
    const count = artworks.length;
    const teacherScores = artworks
      .map((artwork) => artwork.classroomReview?.teacherScore)
      .filter((score) => Number.isFinite(Number(score)));
    const averageTeacherScore = teacherScores.length
      ? Math.round(teacherScores.reduce((sum, score) => sum + Number(score), 0) / teacherScores.length)
      : 0;
    const levelCounts = artworks.reduce((counts, artwork) => {
      const level = artwork.classroomReview?.level || "未评定";
      counts[level] = (counts[level] || 0) + 1;
      return counts;
    }, {});
    const reviewers = [...new Set(artworks.map((artwork) => artwork.classroomReview?.reviewer).filter(Boolean))];
    return {
      total: count,
      averageTeacherScore,
      scoredCount: teacherScores.length,
      levelCounts,
      reviewers,
      digest: sha256StableJson(artworks.map((artwork) => ({
        id: artwork.id,
        reviewDigest: artwork.classroomReview?.reviewDigest || ""
      })))
    };
  }

  function decorateArtworkClassroomReviewSummaryItem(artwork) {
    return {
      id: artwork.id,
      title: artwork.title,
      glyph: artwork.glyph,
      style: artwork.style,
      score: artwork.score,
      createdAt: artwork.createdAt,
      imageData: artwork.imageData,
      tags: normalizeArtworkTags(artwork.tags),
      feedback: normalizeStringList(artwork.feedback).slice(0, 3),
      classroomReview: clone(artwork.classroomReview)
    };
  }

  function createArtworkClassroomReviewSummaryHtml(summaryPackage) {
    const summary = summaryPackage.summary || {};
    const artworks = Array.isArray(summaryPackage.artworks) ? summaryPackage.artworks : [];
    const levelBadges = Object.entries(summary.levelCounts || {})
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hans-CN"))
      .map(([level, count]) => `<span>${escapeHtml(level)} ${escapeHtml(count)}</span>`)
      .join("") || "<span>未评定 0</span>";
    const rows = artworks.map((artwork, index) => createArtworkClassroomReviewSummaryRowHtml(artwork, index)).join("");
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MR 课堂评阅汇总 · ${escapeHtml(artworks.length)} 条</title>
  <style>
    :root { color-scheme: light; --ink:#17221f; --muted:#65746e; --line:#dce5df; --paper:#fbf7ee; --card:#ffffff; --wash:#edf7f2; --jade:#257861; --gold:#b98238; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--paper); font: 15px/1.62 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; }
    main { width: min(1120px, calc(100% - 28px)); margin: 0 auto; padding: 24px 0 42px; }
    h1, h2, h3, p, figure { margin: 0; }
    h1 { font-size: clamp(30px, 6vw, 54px); line-height: 1.05; letter-spacing: 0; }
    h2 { font-size: 19px; }
    h3 { font-size: 16px; }
    button { min-height: 38px; padding: 0 14px; border: 1px solid var(--ink); border-radius: 8px; color: #fff; background: var(--ink); font: inherit; cursor: pointer; }
    header { display: grid; gap: 10px; padding-bottom: 16px; border-bottom: 2px solid var(--ink); }
    .toolbar { position: sticky; top: 0; z-index: 2; display: flex; justify-content: flex-end; padding: 9px 0; background: var(--paper); }
    .meta, .muted { color: var(--muted); }
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 16px; }
    .stat, .review-row, .boundary { border: 1px solid var(--line); border-radius: 8px; background: var(--card); }
    .stat { padding: 13px; }
    .stat span { display: block; color: var(--muted); font-size: 12px; }
    .stat strong { display: block; margin-top: 3px; font-size: 26px; line-height: 1.1; }
    .badges { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .badges span { min-height: 26px; padding: 3px 9px; border-radius: 99px; background: var(--wash); color: var(--ink); font-size: 12px; font-weight: 850; }
    .list { display: grid; gap: 10px; margin-top: 18px; }
    .review-row { display: grid; grid-template-columns: 86px minmax(0, 1.1fr) minmax(0, 0.9fr) minmax(0, 1.5fr); gap: 10px; align-items: stretch; padding: 10px; break-inside: avoid; page-break-inside: avoid; }
    .thumb { display: grid; min-height: 82px; place-items: center; overflow: hidden; border-radius: 7px; background: #f1e5ce; color: rgba(48, 34, 20, 0.72); font-size: 32px; font-weight: 900; }
    .thumb img { width: 100%; height: 100%; object-fit: contain; }
    .cell { display: grid; gap: 5px; min-width: 0; }
    .cell strong { font-size: 15px; }
    .cell span, .cell p { color: var(--muted); font-size: 12px; overflow-wrap: anywhere; }
    .score { color: var(--jade); font-size: 28px; font-weight: 950; line-height: 1; }
    .boundary { display: grid; gap: 8px; margin-top: 18px; padding: 14px; }
    @media print { @page { size: A4; margin: 12mm; } body { background: #fff; font-size: 12px; } main { width: 100%; padding: 0; } .toolbar { display: none; } .review-row { grid-template-columns: 64px 1fr 0.8fr 1.4fr; } .thumb { min-height: 64px; } }
    @media (max-width: 760px) { .stats, .review-row { grid-template-columns: 1fr; } .thumb { min-height: 160px; } }
  </style>
</head>
<body>
  <main>
    <div class="toolbar"><button type="button" onclick="window.print()">打印 / 保存 PDF</button></div>
    <header>
      <p class="meta">MR Calligraphy Classroom Review Summary · ${escapeHtml(formatDateTime(summaryPackage.exportedAt))}</p>
      <h1>MR 课堂评阅汇总</h1>
      <p class="muted">这份汇总来自当前浏览器已导入的课堂评阅 JSON，适合离线归档、打印或线下交接；它不是账号化教师端或云端成绩册。</p>
      <div class="badges">${levelBadges}</div>
    </header>
    <section class="stats" aria-label="评阅汇总摘要">
      <div class="stat"><span>评阅</span><strong>${summary.total || artworks.length}</strong></div>
      <div class="stat"><span>教师均分</span><strong>${summary.averageTeacherScore || 0}</strong></div>
      <div class="stat"><span>有分数</span><strong>${summary.scoredCount || 0}</strong></div>
      <div class="stat"><span>评阅人</span><strong>${summary.reviewers?.length || 0}</strong></div>
    </section>
    <section class="list" aria-label="评阅明细">
      ${rows}
    </section>
    <section class="boundary">
      <h2>导出边界</h2>
      <p class="muted">${escapeHtml(summaryPackage.boundary || ARTWORK_CLASSROOM_REVIEW_SUMMARY_BOUNDARY)}</p>
      <p class="muted">ClassroomReviewSummary: yes · PackageId: ${escapeHtml(summaryPackage.packageId)} · Digest: ${escapeHtml(summary.digest || "")}</p>
    </section>
  </main>
</body>
</html>`;
  }

  function createArtworkClassroomReviewSummaryRowHtml(artwork, index) {
    const review = artwork.classroomReview || {};
    const image = artwork.imageData
      ? `<img src="${escapeAttr(artwork.imageData)}" alt="${escapeAttr(artwork.title)}">`
      : `${escapeHtml(artwork.glyph || "作品")}`;
    const score = Number.isFinite(Number(review.teacherScore)) ? `${review.teacherScore}` : "-";
    const feedback = artwork.feedback?.length ? artwork.feedback.join("；") : "暂无自动反馈";
    return `<article class="review-row">
      <div class="thumb">${image}</div>
      <div class="cell">
        <strong>${escapeHtml(index + 1)}. ${escapeHtml(artwork.title)}</strong>
        <span>${escapeHtml(formatDateTime(artwork.createdAt))} / ${escapeHtml(artwork.glyph || "-")} / ${escapeHtml(artwork.style || "-")} / 本机 ${escapeHtml(artwork.score || 0)} 分</span>
        <span>${escapeHtml(feedback)}</span>
      </div>
      <div class="cell">
        <strong>${escapeHtml(review.reviewer || "本机课堂评阅")}</strong>
        <span>${escapeHtml(review.level || "未评定")}</span>
        <span>教师分数</span>
        <span class="score">${escapeHtml(score)}</span>
      </div>
      <div class="cell">
        <strong>课堂批注</strong>
        <p>${escapeHtml(review.note || "暂无批注")}</p>
        <span>Digest ${escapeHtml(review.reviewDigest || "")}</span>
      </div>
    </article>`;
  }

  function getArtworkRepositorySummary(artworks = [], linkedSessions = []) {
    const artworkCount = artworks.length;
    const averageScore = artworkCount
      ? Math.round(artworks.reduce((sum, artwork) => sum + normalizeScore(artwork.score, 0), 0) / artworkCount)
      : 0;
    const latestArtwork = artworks
      .slice()
      .sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0))[0] || null;
    const glyphs = [...new Set(artworks.map((artwork) => String(artwork.glyph || "").trim()).filter(Boolean))];
    return {
      total: artworkCount,
      linkedSessionCount: linkedSessions.length,
      glyphs: glyphs.slice(0, 24),
      styleCount: new Set(artworks.map((artwork) => String(artwork.style || "").trim()).filter(Boolean)).size,
      imageCount: artworks.filter((artwork) => Boolean(artwork.imageData)).length,
      scoreEvidenceCount: artworks.filter((artwork) => Boolean(artwork.scoreEvidence?.overall)).length,
      totalStrokeCount: artworks.reduce((sum, artwork) => sum + normalizeInteger(artwork.strokeCount, 0, 0, 9999), 0),
      totalPointCount: artworks.reduce((sum, artwork) => sum + normalizeInteger(artwork.pointCount, 0, 0, 999999), 0),
      averageScore,
      latestArtworkId: latestArtwork?.id || null,
      latestArtworkAt: latestArtwork?.createdAt || null
    };
  }

  function parseArtworkRepositoryPackage(input) {
    let source = input;
    if (typeof input === "string") {
      try {
        source = JSON.parse(input);
      } catch (error) {
        return { ok: false, message: "作品仓库包 JSON 解析失败。" };
      }
    }
    if (!source || typeof source !== "object") {
      return { ok: false, message: "作品仓库包格式无效。" };
    }
    if (source.kind !== ARTWORK_REPOSITORY_KIND) {
      return { ok: false, message: "这不是 MR 书法作品仓库包。" };
    }
    const digestVerification = verifyArtworkRepositoryPackageDigest(source);
    if (!digestVerification.ok) {
      return {
        ok: false,
        message: digestVerification.message
      };
    }
    const artworks = Array.isArray(source.artworks)
      ? source.artworks
      : Array.isArray(source.records?.artworks)
        ? source.records.artworks
        : null;
    const linkedSessions = Array.isArray(source.linkedSessions)
      ? source.linkedSessions
      : Array.isArray(source.sessions)
        ? source.sessions
        : Array.isArray(source.records?.sessions)
          ? source.records.sessions
          : [];
    if (!Array.isArray(artworks)) {
      return { ok: false, message: "作品仓库包缺少 artworks 数组。" };
    }
    return {
      ok: true,
      package: {
        ...source,
        artworks,
        linkedSessions,
        packageDigest: digestVerification.packageDigest || normalizeArtworkRepositoryHex(source.packageDigest),
        digestAlgorithm: source.digestAlgorithm || (digestVerification.packageDigest ? ARTWORK_REPOSITORY_DIGEST_ALGORITHM : "")
      },
      digestVerification
    };
  }

  function verifyArtworkRepositoryPackageDigest(packageRecord = {}) {
    const claimedDigest = normalizeArtworkRepositoryHex(packageRecord.packageDigest);
    if (!claimedDigest) {
      return {
        ok: true,
        status: "missing",
        packageDigest: "",
        message: "作品仓库包未声明摘要，按旧版本机包导入。"
      };
    }
    const actualDigest = createArtworkRepositoryPackageDigest(packageRecord);
    if (actualDigest !== claimedDigest) {
      return {
        ok: false,
        status: "digest-mismatch",
        packageDigest: claimedDigest,
        actualDigest,
        message: `作品仓库包摘要校验失败：声明 ${claimedDigest.slice(0, 12)}，实际 ${actualDigest.slice(0, 12)}。未导入任何作品。`
      };
    }
    return {
      ok: true,
      status: "verified",
      packageDigest: claimedDigest,
      actualDigest,
      message: `作品仓库包摘要校验通过：${claimedDigest.slice(0, 12)}。`
    };
  }

  function recordArtworkRepositoryError(message) {
    const now = new Date().toISOString();
    state.artworkRepository = normalizeArtworkRepository({
      ...state.artworkRepository,
      lastCheckedAt: now,
      lastError: String(message || "作品仓库操作失败。").trim().slice(0, 220)
    });
    saveState();
  }

  function createArtworkRepositoryConflict(type, localRecord, incomingRecord) {
    const local = type === "session" ? normalizeSession(localRecord) : normalizeArtwork(localRecord);
    const incoming = type === "session" ? normalizeSession(incomingRecord) : normalizeArtwork(incomingRecord);
    if (!local || !incoming) return null;
    const fields = getArtworkRepositoryConflictFields(type);
    const fieldDiffs = fields
      .filter((field) => stablePlanStringify(local[field] ?? "") !== stablePlanStringify(incoming[field] ?? ""))
      .map((field) => ({
        field,
        label: HISTORY_REPOSITORY_CONFLICT_LABELS[field] || field,
        localValue: local[field],
        incomingValue: incoming[field]
      }));
    return normalizeArtworkRepositoryConflict({
      id: incoming.id,
      type,
      conflictId: `${type}:${incoming.id}`,
      title: incoming.title || local.title || incoming.glyph || incoming.id,
      localTitle: local.title || local.glyph || local.id,
      incomingTitle: incoming.title || incoming.glyph || incoming.id,
      localUpdatedAt: type === "session"
        ? local.endedAt || local.snapshotAt || local.startedAt
        : local.createdAt,
      incomingUpdatedAt: type === "session"
        ? incoming.endedAt || incoming.snapshotAt || incoming.startedAt
        : incoming.createdAt,
      detectedAt: new Date().toISOString(),
      fieldDiffs,
      incomingRecord: incoming
    });
  }

  function getArtworkRepositoryConflictFields(type) {
    if (type === "session") {
      return ["title", "glyph", "copybook", "score", "feedback", "metrics", "endedAt", "status"];
    }
    return ["title", "glyph", "style", "score", "feedback", "tags", "createdAt"];
  }

  function mergeArtworkRepositoryRecords(collection, incomingRecords, normalizeRecord, type) {
    const existingIndex = new Map(collection.map((record, index) => [record.id, index]));
    let importedCount = 0;
    let skippedConflictCount = 0;
    const conflicts = [];

    incomingRecords
      .map(normalizeRecord)
      .filter(Boolean)
      .forEach((record) => {
        if (!existingIndex.has(record.id)) {
          collection.push(record);
          existingIndex.set(record.id, collection.length - 1);
          importedCount += 1;
          return;
        }
        const existing = normalizeRecord(collection[existingIndex.get(record.id)]);
        if (stablePlanStringify(existing) === stablePlanStringify(record)) {
          return;
        }
        skippedConflictCount += 1;
        const conflict = createArtworkRepositoryConflict(type, existing, record);
        if (conflict) {
          conflicts.push(conflict);
        }
      });

    return {
      importedCount,
      skippedConflictCount,
      conflicts
    };
  }

  function importArtworkRepositoryPackage(input) {
    const parsed = parseArtworkRepositoryPackage(input);
    if (!parsed.ok) {
      recordArtworkRepositoryError(parsed.message);
      return parsed;
    }

    const incomingArtworks = parsed.package.artworks.map(normalizeArtwork).filter(Boolean);
    const incomingSessions = parsed.package.linkedSessions.map(normalizeSession).filter(Boolean);
    if (!incomingArtworks.length) {
      const message = "作品仓库包里没有可导入的作品。";
      recordArtworkRepositoryError(message);
      return { ok: false, message };
    }

    const sessionMerge = mergeArtworkRepositoryRecords(state.sessions, incomingSessions, normalizeSession, "session");
    const artworkMerge = mergeArtworkRepositoryRecords(state.artworks, incomingArtworks, normalizeArtwork, "artwork");
    const skippedConflictCount = sessionMerge.skippedConflictCount + artworkMerge.skippedConflictCount;
    const conflictRecords = [
      ...sessionMerge.conflicts,
      ...artworkMerge.conflicts
    ].slice(0, MAX_ARTWORK_REPOSITORY_CONFLICTS);
    const now = new Date().toISOString();

    state.artworkRepository = normalizeArtworkRepository({
      ...state.artworkRepository,
      lastImportedAt: now,
      lastCheckedAt: now,
      lastImportedArtworkCount: artworkMerge.importedCount,
      lastImportedSessionCount: sessionMerge.importedCount,
      lastSkippedConflictCount: skippedConflictCount,
      lastConflictRecords: conflictRecords,
      lastPackageId: parsed.package.packageId || null,
      lastPackageDigest: parsed.package.packageDigest || "",
      lastError: skippedConflictCount
        ? `有 ${skippedConflictCount} 条同 ID 差异记录已跳过，未覆盖本机作品。`
        : ""
    });
    addEvent("artwork-repository-import", `导入作品仓库包：新增 ${artworkMerge.importedCount} 幅作品，新增 ${sessionMerge.importedCount} 条练习，跳过冲突 ${skippedConflictCount}`);
    saveState();
    return {
      ok: true,
      importedArtworkCount: artworkMerge.importedCount,
      importedSessionCount: sessionMerge.importedCount,
      skippedConflictCount,
      conflicts: clone(conflictRecords),
      totalArtworkCount: state.artworks.length,
      status: getArtworkRepositoryStatus(),
      message: skippedConflictCount
        ? `已导入作品仓库包：新增 ${artworkMerge.importedCount} 幅作品、${sessionMerge.importedCount} 条关联练习，跳过 ${skippedConflictCount} 条同 ID 差异记录。${parsed.package.packageDigest ? `摘要 ${parsed.package.packageDigest.slice(0, 12)}。` : ""}${ARTWORK_REPOSITORY_BOUNDARY}`
        : `已导入作品仓库包：新增 ${artworkMerge.importedCount} 幅作品、${sessionMerge.importedCount} 条关联练习。${parsed.package.packageDigest ? `摘要 ${parsed.package.packageDigest.slice(0, 12)}。` : ""}${ARTWORK_REPOSITORY_BOUNDARY}`
    };
  }

  function getArtworkRepositoryConflicts() {
    const repository = normalizeArtworkRepository(state.artworkRepository);
    return {
      ok: true,
      total: repository.lastConflictRecords.length,
      conflicts: clone(repository.lastConflictRecords),
      message: repository.lastConflictRecords.length
        ? `作品仓库有 ${repository.lastConflictRecords.length} 条同 ID 差异记录待处理。`
        : "暂无作品仓库冲突审计。"
    };
  }

  function resolveArtworkRepositoryConflict(action, options = {}) {
    const repository = normalizeArtworkRepository(state.artworkRepository);
    const conflictId = String(options.conflictId || options.id || "").trim();
    const conflicts = repository.lastConflictRecords;
    const conflict = conflicts.find((item) => getArtworkRepositoryConflictKey(item) === conflictId || item.id === conflictId);
    if (!conflict) {
      return {
        ok: false,
        status: getArtworkRepositoryStatus(),
        message: "未找到这条作品仓库冲突审计。"
      };
    }

    const normalizedAction = action === "copy-remote" ? "copy-incoming" : String(action || "");
    const resolvedKeys = new Set([getArtworkRepositoryConflictKey(conflict)]);
    let message = "";

    if (normalizedAction === "dismiss") {
      message = `已忽略作品仓库冲突审计：${conflict.incomingTitle || conflict.id}。`;
    } else if (normalizedAction === "copy-incoming") {
      const copied = copyArtworkRepositoryIncomingConflict(conflict, conflicts);
      if (!copied.ok) {
        return {
          ok: false,
          status: getArtworkRepositoryStatus(),
          message: copied.message
        };
      }
      copied.resolvedConflictKeys.forEach((key) => resolvedKeys.add(key));
      message = copied.message;
    } else {
      return {
        ok: false,
        status: getArtworkRepositoryStatus(),
        message: "未知的作品仓库冲突处理方式。"
      };
    }

    const nextConflicts = conflicts.filter((item) => !resolvedKeys.has(getArtworkRepositoryConflictKey(item)));
    const now = new Date().toISOString();
    state.artworkRepository = normalizeArtworkRepository({
      ...repository,
      lastCheckedAt: now,
      lastSkippedConflictCount: nextConflicts.length,
      lastConflictRecords: nextConflicts,
      lastError: nextConflicts.length
        ? `作品仓库还有 ${nextConflicts.length} 条同 ID 差异记录待处理。`
        : ""
    });
    addEvent("artwork-repository-conflict", message);
    saveState();
    return {
      ok: true,
      resolvedCount: resolvedKeys.size,
      remainingConflictCount: nextConflicts.length,
      status: getArtworkRepositoryStatus(),
      message
    };
  }

  function copyArtworkRepositoryIncomingConflict(conflict, conflicts = []) {
    const normalized = normalizeArtworkRepositoryConflict(conflict);
    if (!normalized?.incomingRecord) {
      return { ok: false, message: "这条冲突缺少可另存的导入快照。" };
    }
    const resolvedConflictKeys = [getArtworkRepositoryConflictKey(normalized)];

    if (normalized.type === "session") {
      const session = makeArtworkRepositorySessionCopy(normalized.incomingRecord);
      state.sessions.push(session);
      return {
        ok: true,
        resolvedConflictKeys,
        sessionId: session.id,
        message: `已把冲突关联练习另存为本机副本：${session.title || session.id}。`
      };
    }

    const artwork = normalizeArtwork(normalized.incomingRecord);
    if (!artwork) {
      return { ok: false, message: "这条冲突缺少可另存的作品快照。" };
    }

    let sessionId = artwork.sessionId;
    const sessionConflict = sessionId
      ? conflicts.find((item) => item.type === "session" && item.id === sessionId)
      : null;
    if (sessionConflict) {
      const sessionSnapshot = normalizeSession(sessionConflict.incomingRecord);
      if (sessionSnapshot) {
        const session = makeArtworkRepositorySessionCopy(sessionSnapshot);
        state.sessions.push(session);
        sessionId = session.id;
        resolvedConflictKeys.push(getArtworkRepositoryConflictKey(sessionConflict));
      }
    }

    const copy = normalizeArtwork({
      ...artwork,
      id: makeId("artwork"),
      sessionId,
      title: `${artwork.title || "导入作品"}（导入副本）`,
      tags: normalizeArtworkTags([...(artwork.tags || []), "导入副本"]),
      createdAt: new Date().toISOString()
    });
    state.artworks.push(copy);
    return {
      ok: true,
      resolvedConflictKeys,
      artworkId: copy.id,
      sessionId: copy.sessionId,
      message: `已把冲突作品另存为本机副本：${copy.title}。`
    };
  }

  function makeArtworkRepositorySessionCopy(record) {
    const session = normalizeSession({
      ...record,
      id: makeId("session"),
      title: `${record.title || `${record.glyph || "作品"}练习`}（导入副本）`,
      snapshotAt: record.snapshotAt || new Date().toISOString()
    });
    return session;
  }

  function getArtworkRepositoryConflictKey(conflict) {
    return conflict?.conflictId || `${conflict?.type || "artwork"}:${conflict?.id || ""}`;
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
      classroomReview: artwork.classroomReview ? clone(artwork.classroomReview) : null,
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
      ...(item.feedback || []),
      item.classroomReview?.reviewer,
      item.classroomReview?.level,
      item.classroomReview?.note,
      item.classroomReview?.teacherScore
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
          stageCount: 0,
          totalCount: 0
        });
      }
      const group = groups.get(key);
      group.totalCount += 1;
      if (entry.type === "practice") group.practiceCount += 1;
      if (entry.type === "artwork") group.artworkCount += 1;
      if (entry.type === "report") group.reportCount += 1;
      if (entry.type === "stage") group.stageCount += 1;
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
        stageCount: group.stageCount,
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
    const normalizedReport = normalizeReport(report);
    return {
      id: normalizedReport.id,
      type: "report",
      title: normalizedReport.title || "学习报告",
      shortLabel: "报告",
      createdAt: normalizedReport.createdAt,
      score: normalizedReport.averageScore,
      meta: `${normalizedReport.sessionCount} 次练习 / ${normalizedReport.artworkCount} 幅作品`,
      status: normalizedReport.teacherReview ? "有批注" : "可下载",
      reportId: normalizedReport.id,
      hasTeacherReview: Boolean(normalizedReport.teacherReview)
    };
  }

  function stageToHistoryEntry(stageRecord) {
    const record = normalizeStageRecord(stageRecord);
    if (!record) return null;
    const config = LEARNING_STAGE_CONFIG[record.stage] || {};
    return {
      id: record.id,
      type: "stage",
      title: `${record.label || config.label || "学习阶段"}：${record.glyph}`,
      shortLabel: "阶段",
      createdAt: record.completedAt || record.createdAt,
      score: 0,
      meta: `${record.copybook} / 步骤 ${record.targetStep + 1}`,
      status: record.label || config.label || "已记录",
      stage: record.stage,
      targetStep: record.targetStep
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
      const normalizedReport = normalizeReport(report);
      return {
        type: "report",
        id: normalizedReport.id,
        title: normalizedReport.title || "学习报告",
        createdAt: normalizedReport.createdAt,
        score: normalizedReport.averageScore,
        status: normalizedReport.teacherReview ? "有教师批注" : normalizedReport.format === "html" ? "HTML" : "可下载",
        summary: normalizedReport.summary,
        sessionCount: normalizedReport.sessionCount,
        artworkCount: normalizedReport.artworkCount,
        averageScore: normalizedReport.averageScore,
        learningMinutes: normalizedReport.learningMinutes || 0,
        latestStrokeCount: normalizedReport.latestStrokeCount || 0,
        latestPointCount: normalizedReport.latestPointCount || 0,
        recommendations: clone(normalizedReport.recommendations || []),
        teacherReview: normalizedReport.teacherReview ? clone(normalizedReport.teacherReview) : null,
        scoreBreakdown: clone(normalizedReport.scoreBreakdown || normalizeMetrics(null)),
        trend: clone(normalizedReport.trend || [])
      };
    }

    const stageRecord = state.stageRecords.find((item) => item.id === recordId);
    if (stageRecord) {
      const record = normalizeStageRecord(stageRecord);
      const config = LEARNING_STAGE_CONFIG[record.stage] || {};
      const stageProgress = getStageProgress(record.taskId || getCurrentTask()?.id);
      return {
        type: "stage",
        id: record.id,
        title: `${record.label || config.label || "学习阶段"}：${record.glyph}`,
        createdAt: record.completedAt || record.createdAt,
        score: 0,
        status: record.label || config.label || "已记录",
        summary: record.note || config.summary || "阶段记录会保存在当前浏览器本机学习档案中。",
        glyph: record.glyph,
        copybook: record.copybook,
        mode: record.mode,
        stage: record.stage,
        targetStep: record.targetStep,
        stageProgress: clone(stageProgress),
        feedback: [
          `阶段记录 ID：${record.id}。`,
          `目标步骤：${record.targetStep + 1}。`,
          `阶段进度：${stageProgress.done}/${stageProgress.total}。`,
          "阶段记录来自用户点击学习路径按钮，不是静态演示条目。"
        ]
      };
    }

    return null;
  }

  function getHistorySummary(entries) {
    const practiceCount = entries.filter((entry) => entry.type === "practice").length;
    const artworkCount = entries.filter((entry) => entry.type === "artwork").length;
    const reportCount = entries.filter((entry) => entry.type === "report").length;
    const stageCount = entries.filter((entry) => entry.type === "stage").length;
    const teacherReviewedReportCount = entries.filter((entry) => entry.type === "report" && entry.hasTeacherReview).length;
    const scored = entries.filter((entry) => entry.score > 0);
    const average = scored.length
      ? Math.round(scored.reduce((sum, entry) => sum + entry.score, 0) / scored.length)
      : 0;
    return {
      total: entries.length,
      practiceCount,
      artworkCount,
      reportCount,
      stageCount,
      teacherReviewedReportCount,
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
      report: state.reports.filter((report) => selected.has(report.id)),
      stage: state.stageRecords.filter((record) => selected.has(record.id))
    };
  }

  function getDeletedHistoryCount(deleted) {
    return (deleted.practice?.length || 0)
      + (deleted.artwork?.length || 0)
      + (deleted.report?.length || 0)
      + (deleted.stage?.length || 0);
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
        reports: (deleted.report || []).map(clone),
        stages: (deleted.stage || []).map(clone)
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
      const record = deleted.practice?.[0] || deleted.artwork?.[0] || deleted.report?.[0] || deleted.stage?.[0];
      return `已删除：${record?.title || record?.label || record?.glyph || "学习档案"}`;
    }
    return `批量删除 ${deletedCount} 条学习档案`;
  }

  function applyHistoryDeletion(deleted) {
    const deletedSessionIds = new Set((deleted.practice || []).map((session) => session.id));
    const deletedArtworkIds = new Set((deleted.artwork || []).map((artwork) => artwork.id));
    const selectedIds = new Set([
      ...deletedSessionIds,
      ...deletedArtworkIds,
      ...(deleted.report || []).map((report) => report.id),
      ...(deleted.stage || []).map((record) => record.id)
    ]);

    state.sessions = state.sessions.filter((session) => !selectedIds.has(session.id));
    state.artworks = state.artworks.filter((artwork) => !selectedIds.has(artwork.id));
    state.reports = state.reports.filter((report) => !selectedIds.has(report.id));
    state.stageRecords = state.stageRecords.filter((record) => !selectedIds.has(record.id));

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
    const deletedType = deleted.practice.length ? "practice" : deleted.artwork.length ? "artwork" : deleted.report.length ? "report" : "stage";
    const record = deleted.practice[0] || deleted.artwork[0] || deleted.report[0] || deleted.stage[0];
    const recordTitle = record.title || record.label || record.glyph || "学习档案";
    const batchReceipt = appendHistoryBatchReceipt({
      action: "delete",
      label: "移入回收站",
      recordCount: deletedCount,
      counts: getHistoryRecordCounts(deleted),
      selectedIds: [recordId],
      trashId: trash?.id || "",
      message: `已移入回收站：${recordTitle}。`
    });
    addEvent("history-delete", `移入回收站：${recordTitle}`);
    saveState();
    return {
      ok: true,
      deletedType,
      trash: decorateHistoryTrashEntry(trash),
      batchReceipt: batchReceipt ? clone(batchReceipt) : null,
      message: `已移入回收站：${recordTitle}。可用“恢复最近删除”找回。`
    };
  }

  function getHistoryExportPayload(ids) {
    const selectedIds = normalizeHistoryIds(ids);
    const selected = new Set(selectedIds);
    const sessions = state.sessions.filter((session) => selected.has(session.id));
    const artworks = state.artworks.filter((artwork) => selected.has(artwork.id));
    const reports = state.reports.filter((report) => selected.has(report.id));
    const stages = state.stageRecords.filter((record) => selected.has(record.id));
    const history = [
      ...sessions.map(sessionToHistoryEntry),
      ...artworks.map(artworkToHistoryEntry),
      ...reports.map(reportToHistoryEntry),
      ...stages.map(stageToHistoryEntry)
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
        reports: reports.map(clone),
        stages: stages.map(clone)
      },
      history: history.map((entry) => getHistoryDetail(entry.id)).filter(Boolean)
    };
  }

  function downloadHistoryRecords(ids) {
    const payload = getHistoryExportPayload(ids);
    if (!payload.history.length) {
      return { ok: false, message: "请选择要导出的学习档案记录。" };
    }
    const filename = `mr-calligraphy-history-selection-${Date.now()}.json`;
    downloadJson(payload, filename);
    const counts = getHistoryRecordCounts(payload.records);
    const batchReceipt = appendHistoryBatchReceipt({
      action: "export",
      label: "导出所选学习档案",
      recordCount: payload.history.length,
      counts,
      selectedIds: payload.selectedIds,
      filename,
      message: `已导出 ${payload.history.length} 条所选学习档案。`
    });
    addEvent("history-selection-export", `导出所选学习档案：${payload.history.length} 条`);
    saveState();
    return {
      ok: true,
      count: payload.history.length,
      filename,
      batchReceipt: batchReceipt ? clone(batchReceipt) : null,
      message: `已导出 ${payload.history.length} 条所选学习档案。`
    };
  }

  function getHistoryRepositoryRecordCount() {
    return state.sessions.length + state.artworks.length + state.reports.length + state.stageRecords.length;
  }

  function getHistoryRepositoryStatus() {
    const repository = normalizeHistoryRepository(state.historyRepository);
    const recordCount = getHistoryRepositoryRecordCount();
    const remoteConfigured = Boolean(repository.remoteEndpoint);
    let tone = "idle";
    let message = remoteConfigured
      ? `远端学习档案 API 已配置：${repository.remoteEndpoint}，空间 ${repository.workspaceId}。`
      : recordCount
        ? `本机学习档案有 ${recordCount} 条记录，可导出 JSON 同步包。`
        : "还没有可同步的学习档案记录。";

    if (repository.lastRemoteSyncAt) {
      const directionLabel = {
        check: "检查",
        push: "推送",
        pull: "拉取"
      }[repository.lastRemoteDirection] || "同步";
      tone = "ready";
      message = repository.lastRemoteStatus
        || `最近${directionLabel}远端学习档案：${formatPlanDate(repository.lastRemoteSyncAt)}，${repository.lastRemoteRecordCount} 条记录。`;
    } else if (repository.lastImportedAt) {
      tone = "ready";
      message = `最近导入 ${repository.lastImportedRecordCount} 条学习档案：${formatPlanDate(repository.lastImportedAt)}。`;
    } else if (repository.lastExportedAt) {
      tone = "ready";
      message = `最近导出 ${repository.lastExportedRecordCount} 条学习档案：${formatPlanDate(repository.lastExportedAt)}。`;
    }
    if (repository.lastSkippedConflictCount > 0) {
      tone = "warning";
      message = `远端学习档案有 ${repository.lastSkippedConflictCount} 条同 ID 差异记录已跳过，未覆盖本机记录。`;
    }
    if (repository.lastError) {
      tone = "warning";
      message = repository.lastError;
      const retrySummary = getHistoryRepositoryRetrySummary(repository);
      if (retrySummary) {
        message = `${message} ${retrySummary}`;
      }
    }
    const receiptSummary = getHistoryRepositoryReceiptSummary(repository.lastReceipt);
    if (receiptSummary && !repository.lastError) {
      message = `${message} ${receiptSummary}`;
    }
    const remoteRetrySummary = getHistoryRepositoryRetrySummary(repository);

    return {
      ok: true,
      kind: HISTORY_REPOSITORY_KIND,
      mode: repository.mode,
      remoteConfigured,
      remoteEndpoint: remoteConfigured ? repository.remoteEndpoint : "",
      hasRemoteToken: Boolean(repository.remoteToken),
      workspaceId: repository.workspaceId,
      fetchSupported: typeof fetch === "function",
      recordCount,
      sessionCount: state.sessions.length,
      artworkCount: state.artworks.length,
      reportCount: state.reports.length,
      stageCount: state.stageRecords.length,
      tone,
      message,
      boundary: HISTORY_REPOSITORY_BOUNDARY,
      lastExportedAt: repository.lastExportedAt,
      lastImportedAt: repository.lastImportedAt,
      lastCheckedAt: repository.lastCheckedAt,
      lastRemoteSyncAt: repository.lastRemoteSyncAt,
      lastRemotePushAt: repository.lastRemotePushAt,
      lastRemoteDirection: repository.lastRemoteDirection,
      lastRemoteStatus: repository.lastRemoteStatus,
      lastExportedRecordCount: repository.lastExportedRecordCount,
      lastImportedRecordCount: repository.lastImportedRecordCount,
      lastRemoteRecordCount: repository.lastRemoteRecordCount,
      lastSkippedConflictCount: repository.lastSkippedConflictCount,
      lastConflictRecords: clone(repository.lastConflictRecords),
      lastPackageId: repository.lastPackageId,
      lastReceipt: repository.lastReceipt ? clone(repository.lastReceipt) : null,
      receiptCount: repository.receipts.length,
      receipts: clone(repository.receipts),
      receiptStatus: receiptSummary,
      lastRemoteFailureAt: repository.lastRemoteFailureAt,
      lastFailureAction: repository.lastFailureAction,
      remoteRetryAfter: repository.remoteRetryAfter,
      remoteFailureCount: repository.remoteFailureHistory.length,
      remoteFailureHistory: clone(repository.remoteFailureHistory),
      remoteRetrySummary,
      historyPushRetryPending: hasHistoryRepositoryPushRetryPending(repository),
      lastError: repository.lastError
    };
  }

  function getHistoryRepositoryReceiptSummary(receipt) {
    const normalized = normalizeHistoryRepositoryReceipt(receipt);
    if (!normalized) return "";
    const digestShort = normalized.repositoryDigest.slice(0, 12);
    const receiptShort = normalized.receiptDigest.slice(0, 12);
    const acceptedAt = normalized.acceptedAt ? `，${formatPlanDate(normalized.acceptedAt)}` : "";
    const verificationLabel = formatHistoryRepositoryReceiptVerificationStatus(normalized.verificationStatus);
    return `已收到远端学习档案回执：仓库摘要 ${digestShort}，回执 ${receiptShort}${acceptedAt}；${verificationLabel}。`;
  }

  function getHistoryRepositoryReceiptAudit() {
    const repository = normalizeHistoryRepository(state.historyRepository);
    const receipts = repository.receipts;
    const verifiedCount = receipts.filter((receipt) => receipt.verificationStatus === "verified").length;
    return {
      ok: true,
      kind: "mr-calligraphy-history-repository-receipt-audit-v1",
      workspaceId: repository.workspaceId,
      total: receipts.length,
      verifiedCount,
      latestReceipt: receipts[0] || null,
      receipts: clone(receipts),
      boundary: HISTORY_REPOSITORY_BOUNDARY,
      message: receipts.length
        ? `已保存 ${receipts.length} 条学习档案仓库回执，本机校验通过 ${verifiedCount} 条，最近一次：${formatPlanDate(receipts[0].receivedAt || receipts[0].acceptedAt)}。`
        : "暂无学习档案仓库回执。"
    };
  }

  function getHistoryRepositoryReceiptAuditExport() {
    const audit = getHistoryRepositoryReceiptAudit();
    if (!audit.total) {
      return {
        ok: false,
        message: "暂无可导出的学习档案仓库回执。"
      };
    }
    const exportedAt = new Date().toISOString();
    return {
      ok: true,
      filename: `mr-calligraphy-history-repository-receipts-${exportedAt.slice(0, 10)}.html`,
      html: renderHistoryRepositoryReceiptAuditHtml(audit, exportedAt),
      audit,
      message: `已生成 ${audit.total} 条学习档案仓库回执审计导出。`
    };
  }

  function downloadHistoryRepositoryReceiptAudit() {
    const result = getHistoryRepositoryReceiptAuditExport();
    if (!result.ok) {
      return result;
    }
    downloadHtml(result.html, result.filename);
    return {
      ok: true,
      filename: result.filename,
      receiptCount: result.audit.total,
      message: result.message
    };
  }

  function renderHistoryRepositoryReceiptAuditHtml(audit, exportedAt) {
    const rows = audit.receipts.map((receipt) => {
      const warnings = Array.isArray(receipt.warnings) && receipt.warnings.length ? receipt.warnings.join("；") : "无";
      return `
        <section class="receipt">
          <h2>${escapeHtml(receipt.packageId || receipt.sourcePackageId || "packageId 未知")}</h2>
          <dl>
            <dt>方向</dt><dd>${escapeHtml(formatHistoryRepositoryReceiptDirection(receipt.direction))}</dd>
            <dt>档案数量</dt><dd>${escapeHtml(receipt.recordCount || 0)}</dd>
            <dt>Repository Digest</dt><dd>${escapeHtml(receipt.repositoryDigest || "未知")}</dd>
            <dt>Receipt Digest</dt><dd>${escapeHtml(receipt.receiptDigest || "未知")}</dd>
            <dt>本机校验</dt><dd>${escapeHtml(formatHistoryRepositoryReceiptVerificationStatus(receipt.verificationStatus))}</dd>
            <dt>校验说明</dt><dd>${escapeHtml(receipt.verificationMessage || "未执行")}</dd>
            <dt>重算摘要</dt><dd>${escapeHtml(receipt.verificationExpectedDigest || "未知")}</dd>
            <dt>Remote Version</dt><dd>${escapeHtml(receipt.remoteVersion || "未知")}</dd>
            <dt>Workspace</dt><dd>${escapeHtml(receipt.workspaceId || HISTORY_REPOSITORY_DEFAULT_WORKSPACE)}</dd>
            <dt>Endpoint</dt><dd>${escapeHtml(receipt.endpoint || "未知")}</dd>
            <dt>Accepted At</dt><dd>${escapeHtml(receipt.acceptedAt || "未知")}</dd>
            <dt>Received At</dt><dd>${escapeHtml(receipt.receivedAt || "未知")}</dd>
            <dt>Message</dt><dd>${escapeHtml(receipt.message || "无")}</dd>
            <dt>Warnings</dt><dd>${escapeHtml(warnings)}</dd>
          </dl>
          <pre>${escapeHtml(JSON.stringify(receipt, null, 2))}</pre>
        </section>`;
    }).join("");
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>MR 书法学习档案仓库回执审计</title>
  <style>
    body { margin: 0; padding: 32px; color: #1f2937; background: #f7f4ee; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { max-width: 980px; margin: 0 auto; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    .meta { margin: 0 0 18px; color: #5f6b7a; line-height: 1.6; }
    .receipt { margin: 18px 0; padding: 18px; border: 1px solid #ddd3c2; border-radius: 8px; background: #fffaf2; }
    h2 { margin: 0 0 12px; font-size: 17px; overflow-wrap: anywhere; }
    dl { display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 8px 12px; margin: 0; }
    dt { color: #5f6b7a; font-weight: 700; }
    dd { margin: 0; overflow-wrap: anywhere; }
    pre { margin: 14px 0 0; padding: 12px; overflow: auto; border-radius: 6px; background: #1f2937; color: #f8fafc; font-size: 12px; line-height: 1.5; }
  </style>
</head>
<body>
  <main>
    <h1>MR 书法学习档案仓库回执审计</h1>
    <p class="meta">导出时间：${escapeHtml(formatDateTime(exportedAt))} · 回执数量：${audit.total}<br>${escapeHtml(audit.boundary)}</p>
    ${rows}
  </main>
</body>
</html>`;
  }

  function formatHistoryRepositoryReceiptDirection(direction) {
    return {
      check: "检查",
      push: "推送",
      pull: "拉取"
    }[direction] || "远端回执";
  }

  function formatHistoryRepositoryReceiptVerificationStatus(status) {
    return {
      verified: "本机校验通过",
      "workspace-mismatch": "空间不匹配",
      "digest-mismatch": "摘要不匹配"
    }[status] || "未校验";
  }

  function getHistoryRepositoryRemoteConfig() {
    const repository = normalizeHistoryRepository(state.historyRepository);
    return {
      ok: true,
      mode: repository.mode,
      remoteEndpoint: repository.remoteEndpoint,
      remoteToken: repository.remoteToken,
      hasRemoteToken: Boolean(repository.remoteToken),
      workspaceId: repository.workspaceId,
      boundary: HISTORY_REPOSITORY_BOUNDARY
    };
  }

  function getHistoryRepositoryPackage(options = {}) {
    const selectedIds = Array.isArray(options.ids)
      ? new Set(options.ids.map(String).filter(Boolean))
      : null;
    const sessions = state.sessions
      .filter((session) => !selectedIds || selectedIds.has(session.id))
      .map(normalizeSession)
      .filter(Boolean);
    const artworks = state.artworks
      .filter((artwork) => !selectedIds || selectedIds.has(artwork.id))
      .map(normalizeArtwork)
      .filter(Boolean);
    const reports = state.reports
      .filter((report) => !selectedIds || selectedIds.has(report.id))
      .map(normalizeReport)
      .filter(Boolean);
    const stages = state.stageRecords
      .filter((record) => !selectedIds || selectedIds.has(record.id))
      .map(normalizeStageRecord)
      .filter(Boolean);
    const history = [
      ...sessions.map(sessionToHistoryEntry),
      ...artworks.map(artworkToHistoryEntry),
      ...reports.map(reportToHistoryEntry),
      ...stages.map(stageToHistoryEntry)
    ]
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    const recordCount = sessions.length + artworks.length + reports.length + stages.length;
    if (!recordCount) {
      return {
        ok: false,
        message: "还没有可导出的学习档案同步包。"
      };
    }

    const exportedAt = new Date().toISOString();
    const packageId = `history-repository-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const repository = getHistoryRepositoryStatus();
    return {
      ok: true,
      filename: `mr-calligraphy-history-repository-${Date.now()}.json`,
      package: {
        kind: HISTORY_REPOSITORY_KIND,
        version: VERSION,
        packageId,
        workspaceId: repository.workspaceId,
        exportedAt,
        storageKey: STORAGE_KEY,
        source: {
          mode: repository.mode,
          workspaceId: repository.workspaceId,
          boundary: HISTORY_REPOSITORY_BOUNDARY
        },
        summary: getHistorySummary(history),
        records: {
          sessions: clone(sessions),
          artworks: clone(artworks),
          reports: clone(reports),
          stages: clone(stages)
        },
        history: history.map((entry) => getHistoryDetail(entry.id)).filter(Boolean)
      },
      message: `已生成 ${recordCount} 条学习档案的本机 JSON 同步包。${HISTORY_REPOSITORY_BOUNDARY}`
    };
  }

  function downloadHistoryRepository(options = {}) {
    const result = getHistoryRepositoryPackage(options);
    if (!result.ok) {
      return result;
    }
    downloadJson(result.package, result.filename);
    const now = new Date().toISOString();
    state.historyRepository = normalizeHistoryRepository({
      ...state.historyRepository,
      mode: "local-json",
      lastExportedAt: now,
      lastCheckedAt: now,
      lastExportedRecordCount: result.package.summary.total,
      lastPackageId: result.package.packageId,
      lastSkippedConflictCount: 0,
      lastReceipt: null,
      receipts: [],
      lastRemoteStatus: "",
      lastError: ""
    });
    addEvent("history-repository-export", `导出学习档案同步包：${result.package.summary.total} 条记录`);
    saveState();
    return {
      ok: true,
      filename: result.filename,
      status: getHistoryRepositoryStatus(),
      message: `已下载学习档案 JSON 同步包：${result.filename}。${HISTORY_REPOSITORY_BOUNDARY}`
    };
  }

  function parseHistoryRepositoryPackage(input) {
    let source = input;
    if (typeof input === "string") {
      try {
        source = JSON.parse(input);
      } catch (error) {
        return { ok: false, message: "学习档案同步包 JSON 解析失败。" };
      }
    }
    if (!source || typeof source !== "object") {
      return { ok: false, message: "学习档案同步包格式无效。" };
    }
    if (source.kind !== HISTORY_REPOSITORY_KIND) {
      return { ok: false, message: "这不是 MR 书法学习档案同步包。" };
    }
    if (!source.records || typeof source.records !== "object") {
      return { ok: false, message: "学习档案同步包缺少 records 对象。" };
    }
    if (!Array.isArray(source.records.sessions) || !Array.isArray(source.records.artworks) || !Array.isArray(source.records.reports)) {
      return { ok: false, message: "学习档案同步包缺少 sessions、artworks 或 reports 数组。" };
    }
    if (source.records.stages !== undefined && !Array.isArray(source.records.stages)) {
      return { ok: false, message: "学习档案同步包的 stages 字段必须是数组。" };
    }
    return { ok: true, package: source };
  }

  function recordHistoryRepositoryError(message, options = {}) {
    const current = normalizeHistoryRepository(state.historyRepository);
    const now = new Date().toISOString();
    const normalizedMessage = String(message || "学习档案仓库同步失败。").trim().slice(0, 220);
    const action = normalizeHistoryRepositoryFailureAction(options.action);
    const trackRemote = Boolean(action || options.trackRemote === true);
    let remoteRetryAfter = current.remoteRetryAfter;
    let remoteFailureHistory = current.remoteFailureHistory;
    let lastRemoteFailureAt = current.lastRemoteFailureAt;
    let lastFailureAction = current.lastFailureAction;

    if (trackRemote) {
      const attemptCount = normalizeInteger(options.attemptCount, current.remoteFailureHistory.length + 1, 1, 9999);
      const retryDelayMs = getHistoryRepositoryRetryDelayMs(attemptCount, options);
      const retryAfter = retryDelayMs ? new Date(Date.now() + retryDelayMs).toISOString() : now;
      const failure = normalizeHistoryRepositoryFailure({
        failedAt: now,
        retryAfter,
        attemptCount,
        action: action || "check",
        endpoint: options.endpoint || current.remoteEndpoint,
        workspaceId: options.workspaceId || current.workspaceId,
        packageId: options.packageId || current.lastPackageId || "",
        packageDigest: options.packageDigest || "",
        recordCount: options.recordCount ?? current.lastRemoteRecordCount ?? getHistoryRepositoryRecordCount(),
        failureKind: options.failureKind || classifyHistoryRepositoryFailure(normalizedMessage),
        message: normalizedMessage
      });
      remoteFailureHistory = [failure, ...current.remoteFailureHistory]
        .filter(Boolean)
        .slice(0, HISTORY_REPOSITORY_MAX_FAILURES);
      remoteRetryAfter = retryAfter;
      lastRemoteFailureAt = now;
      lastFailureAction = failure?.action || action || current.lastFailureAction;
    }

    state.historyRepository = normalizeHistoryRepository({
      ...current,
      lastCheckedAt: now,
      lastRemoteFailureAt,
      lastFailureAction,
      remoteRetryAfter,
      remoteFailureHistory,
      lastError: normalizedMessage
    });
    saveState();
  }

  function createHistoryRepositoryConflict(type, localRecord, remoteRecord) {
    const local = normalizeHistoryConflictRemoteRecord(type, localRecord);
    const remote = normalizeHistoryConflictRemoteRecord(type, remoteRecord);
    if (!local || !remote) return null;
    const fields = HISTORY_REPOSITORY_CONFLICT_FIELDS[type] || [];
    const fieldDiffs = fields
      .filter((field) => stablePlanStringify(local[field] || "") !== stablePlanStringify(remote[field] || ""))
      .map((field) => ({
        field,
        label: HISTORY_REPOSITORY_CONFLICT_LABELS[field] || field,
        localValue: local[field],
        remoteValue: remote[field]
      }));
    return normalizeHistoryRepositoryConflict({
      id: remote.id,
      type,
      conflictId: `${type}:${remote.id}`,
      title: remote.title || local.title || `${HISTORY_REPOSITORY_CONFLICT_LABELS[type] || type} ${remote.id}`,
      localTitle: local.title || local.glyph || local.id,
      remoteTitle: remote.title || remote.glyph || remote.id,
      localUpdatedAt: getHistoryRepositoryRecordUpdatedAt(type, local),
      remoteUpdatedAt: getHistoryRepositoryRecordUpdatedAt(type, remote),
      detectedAt: new Date().toISOString(),
      fieldDiffs,
      remoteRecord: remote
    });
  }

  function getHistoryRepositoryRecordUpdatedAt(type, record = {}) {
    if (type === "session") return record.endedAt || record.snapshotAt || record.startedAt || null;
    if (type === "artwork") return record.createdAt || null;
    if (type === "report") return record.generatedAt || record.createdAt || null;
    if (type === "stage") return record.completedAt || record.createdAt || null;
    return null;
  }

  function getHistoryRepositoryConflictRecords(conflicts = []) {
    return conflicts
      .map(normalizeHistoryRepositoryConflict)
      .filter(Boolean)
      .slice(0, HISTORY_REPOSITORY_MAX_CONFLICTS);
  }

  function clearHistoryRepositoryConflictFields(repository = state.historyRepository) {
    return normalizeHistoryRepository({
      ...repository,
      lastSkippedConflictCount: 0,
      lastConflictRecords: [],
      lastError: ""
    });
  }

  function mergeHistoryRecords(collection, incomingRecords, normalizeRecord, type = "") {
    const existingIndex = new Map(collection.map((record, index) => [record.id, index]));
    let importedCount = 0;
    let updatedCount = 0;
    let skippedConflictCount = 0;
    const conflicts = [];

    incomingRecords
      .map(normalizeRecord)
      .filter(Boolean)
      .forEach((record) => {
        if (!existingIndex.has(record.id)) {
          collection.push(record);
          existingIndex.set(record.id, collection.length - 1);
          importedCount += 1;
          return;
        }
        const index = existingIndex.get(record.id);
        const existing = normalizeRecord(collection[index]);
        if (stablePlanStringify(existing) === stablePlanStringify(record)) {
          return;
        }
        skippedConflictCount += 1;
        const conflict = createHistoryRepositoryConflict(type, existing, record);
        if (conflict) {
          conflicts.push(conflict);
        }
      });

    return { importedCount, updatedCount, skippedConflictCount, conflicts };
  }

  function importHistoryRepositoryPackage(input) {
    const parsed = parseHistoryRepositoryPackage(input);
    if (!parsed.ok) {
      recordHistoryRepositoryError(parsed.message);
      return parsed;
    }

    const records = parsed.package.records || {};
    const sessions = Array.isArray(records.sessions) ? records.sessions : [];
    const artworks = Array.isArray(records.artworks) ? records.artworks : [];
    const reports = Array.isArray(records.reports) ? records.reports : [];
    const stages = Array.isArray(records.stages) ? records.stages : [];
    const incomingCount = sessions.length + artworks.length + reports.length + stages.length;
    if (!incomingCount) {
      const message = "同步包里没有可导入的学习档案记录。";
      recordHistoryRepositoryError(message);
      return { ok: false, message };
    }

    const sessionMerge = mergeHistoryRecords(state.sessions, sessions, normalizeSession, "session");
    const artworkMerge = mergeHistoryRecords(state.artworks, artworks, normalizeArtwork, "artwork");
    const reportMerge = mergeHistoryRecords(state.reports, reports, normalizeReport, "report");
    const stageMerge = mergeHistoryRecords(state.stageRecords, stages, normalizeStageRecord, "stage");
    const importedCount = sessionMerge.importedCount + artworkMerge.importedCount + reportMerge.importedCount + stageMerge.importedCount;
    const updatedCount = sessionMerge.updatedCount + artworkMerge.updatedCount + reportMerge.updatedCount + stageMerge.updatedCount;
    const skippedConflictCount = sessionMerge.skippedConflictCount + artworkMerge.skippedConflictCount + reportMerge.skippedConflictCount + stageMerge.skippedConflictCount;
    const conflictRecords = getHistoryRepositoryConflictRecords([
      ...sessionMerge.conflicts,
      ...artworkMerge.conflicts,
      ...reportMerge.conflicts,
      ...stageMerge.conflicts
    ]);
    const now = new Date().toISOString();

    state.historyRepository = normalizeHistoryRepository({
      ...state.historyRepository,
      mode: "local-json",
      lastImportedAt: now,
      lastCheckedAt: now,
      lastImportedRecordCount: importedCount + updatedCount,
      lastSkippedConflictCount: skippedConflictCount,
      lastConflictRecords: conflictRecords,
      lastPackageId: parsed.package.packageId || null,
      lastReceipt: null,
      receipts: [],
      lastRemoteStatus: "",
      lastError: skippedConflictCount
        ? `有 ${skippedConflictCount} 条同 ID 差异记录已跳过，已保存冲突审计，未覆盖本机记录。`
        : ""
    });
    addEvent("history-repository-import", `导入学习档案同步包：新增 ${importedCount}，跳过冲突 ${skippedConflictCount}`);
    saveState();
    return {
      ok: true,
      importedCount,
      updatedCount,
      skippedConflictCount,
      totalRecordCount: getHistoryRepositoryRecordCount(),
      status: getHistoryRepositoryStatus(),
      message: skippedConflictCount
        ? `已导入学习档案同步包：新增 ${importedCount} 条，跳过 ${skippedConflictCount} 条同 ID 差异记录，并保存冲突审计。${HISTORY_REPOSITORY_BOUNDARY}`
        : `已导入学习档案同步包：新增 ${importedCount} 条。${HISTORY_REPOSITORY_BOUNDARY}`
    };
  }

  function configureHistoryRepositoryRemote(config = {}) {
    const repository = normalizeHistoryRepository(state.historyRepository);
    const endpointInput = config.remoteEndpoint ?? config.endpoint ?? "";
    const tokenInput = config.remoteToken ?? config.token;
    const workspaceInput = config.workspaceId ?? config.remoteWorkspaceId ?? config.accountId ?? repository.workspaceId;
    const remoteEndpoint = String(endpointInput || "").trim();
    const remoteToken = tokenInput === undefined
      ? repository.remoteToken
      : String(tokenInput || "").trim();
    const workspaceId = normalizeHistoryRepositoryWorkspaceId(workspaceInput);

    if (!remoteEndpoint) {
      state.historyRepository = normalizeHistoryRepository({
        ...repository,
        mode: "local-json",
        remoteEndpoint: "",
        remoteToken: "",
        workspaceId,
        lastSkippedConflictCount: 0,
        lastConflictRecords: [],
        lastCheckedAt: new Date().toISOString(),
        lastReceipt: null,
        receipts: [],
        lastRemoteStatus: "",
        lastRemoteFailureAt: null,
        lastFailureAction: "",
        remoteRetryAfter: null,
        remoteFailureHistory: [],
        lastError: ""
      });
      addEvent("history-repository-remote", "清除远端学习档案 API 配置");
      saveState();
      return {
        ok: true,
        status: getHistoryRepositoryStatus(),
        message: "已清除远端学习档案 API 配置，当前回到本机 JSON 同步包。"
      };
    }

    const validation = validatePlanRepositoryEndpoint(remoteEndpoint);
    if (!validation.ok) {
      recordHistoryRepositoryError(validation.message.replace("远端计划 API", "远端学习档案 API"));
      return {
        ok: false,
        status: getHistoryRepositoryStatus(),
        message: validation.message.replace("远端计划 API", "远端学习档案 API")
      };
    }

    const sameRemoteSpace = validation.endpoint === repository.remoteEndpoint && workspaceId === repository.workspaceId;
    state.historyRepository = normalizeHistoryRepository({
      ...repository,
      mode: "remote-api",
      remoteEndpoint: validation.endpoint,
      remoteToken,
      workspaceId,
      lastSkippedConflictCount: sameRemoteSpace ? repository.lastSkippedConflictCount : 0,
      lastConflictRecords: sameRemoteSpace ? repository.lastConflictRecords : [],
      lastCheckedAt: new Date().toISOString(),
      lastReceipt: sameRemoteSpace ? repository.lastReceipt : null,
      receipts: sameRemoteSpace ? repository.receipts : [],
      remoteRetryAfter: null,
      lastRemoteStatus: `远端学习档案 API 配置已保存，空间 ${workspaceId} 尚未检查服务可用性。`,
      lastError: ""
    });
    addEvent("history-repository-remote", `配置远端学习档案 API：${validation.endpoint} / ${workspaceId}`);
    saveState();
    return {
      ok: true,
      status: getHistoryRepositoryStatus(),
      message: `已保存远端学习档案 API 配置，空间 ${workspaceId}。请点击“检查远端”确认服务可用。`
    };
  }

  function buildHistoryRepositoryRequest(repository, options = {}) {
    const headers = {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {})
    };
    if (repository.remoteToken) {
      headers.Authorization = `Bearer ${repository.remoteToken}`;
    }
    headers["X-MR-Workspace-Id"] = normalizeHistoryRepositoryWorkspaceId(repository.workspaceId);
    return {
      method: options.method || "GET",
      headers,
      ...(options.body ? { body: JSON.stringify(options.body) } : {})
    };
  }

  function requestHistoryRepository(repository, fetchApi, options = {}) {
    const requestUrl = options.requestUrl || repository.remoteEndpoint;
    const timeoutMs = normalizeInteger(options.timeoutMs, HISTORY_REPOSITORY_REQUEST_TIMEOUT_MS, 1, 600000);
    const request = buildHistoryRepositoryRequest(repository, options);
    let timer = null;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        const error = new Error(`请求超时 ${timeoutMs}ms`);
        error.name = "TimeoutError";
        reject(error);
      }, timeoutMs);
    });
    const requestPromise = Promise.resolve().then(() => fetchApi(requestUrl, request));
    return Promise.race([requestPromise, timeout]).finally(() => {
      if (timer) {
        clearTimeout(timer);
      }
    });
  }

  async function parseRemoteHistoryRepositoryResponse(response, options = {}) {
    if (!response || response.ok === false) {
      const status = response?.status ? `HTTP ${response.status}` : "无响应";
      return { ok: false, message: `远端学习档案 API 请求失败：${status}。` };
    }

    let payload = {};
    try {
      const text = typeof response.text === "function"
        ? await response.text()
        : JSON.stringify(typeof response.json === "function" ? await response.json() : {});
      payload = text ? JSON.parse(text) : {};
    } catch (error) {
      return { ok: false, message: "远端学习档案 API 返回的不是可解析 JSON。" };
    }

    const candidate = payload.package && typeof payload.package === "object"
      ? payload.package
      : payload.repository && typeof payload.repository === "object"
        ? payload.repository
        : payload;
    const parsed = parseHistoryRepositoryPackage(candidate);
    const receipt = normalizeHistoryRepositoryReceipt(payload.receipt || payload.latestReceipt || null);
    if (parsed.ok) {
      const summary = parsed.package.summary || {};
      const pagination = getHistoryRepositoryPagination(payload, options.requestUrl || response.url || "");
      const paginationNotice = getHistoryRepositoryPaginationNotice(payload, options);
      const message = payload.message || `远端学习档案包含 ${summary.total || 0} 条记录。`;
      return {
        ok: true,
        package: parsed.package,
        receipt,
        pagination,
        message: paginationNotice ? `${message} ${paginationNotice}` : message
      };
    }
    if (payload.ok === true) {
      return {
        ok: true,
        package: null,
        receipt,
        pagination: getHistoryRepositoryPagination(payload, options.requestUrl || response.url || ""),
        message: payload.message || "远端学习档案 API 检查通过，但没有返回档案包。"
      };
    }
    return {
      ok: false,
      message: payload.message || parsed.message || "远端学习档案 API 返回格式无效。"
    };
  }

  function getHistoryRepositoryPagination(payload = {}, currentUrl = "") {
    const pagination = payload.pagination && typeof payload.pagination === "object" ? payload.pagination : {};
    const rawNextPageUrl = String(pagination.nextPageUrl || payload.nextPageUrl || "").trim();
    const nextPageUrl = resolveHistoryRepositoryPageUrl(rawNextPageUrl, currentUrl);
    const hasMore = Boolean(pagination.hasMore || rawNextPageUrl);
    return {
      hasMore,
      nextPageUrl,
      page: normalizeInteger(pagination.page, 1, 1, 99999),
      pageSize: normalizeInteger(pagination.pageSize || pagination.limit, 0, 0, 99999),
      total: normalizeInteger(pagination.total, 0, 0, 999999)
    };
  }

  function resolveHistoryRepositoryPageUrl(nextPageUrl, currentUrl = "") {
    const rawUrl = String(nextPageUrl || "").trim();
    if (!rawUrl) return "";
    try {
      const baseUrl = currentUrl || (typeof window !== "undefined" ? window.location.href : "");
      return baseUrl ? new URL(rawUrl, baseUrl).toString() : new URL(rawUrl).toString();
    } catch (error) {
      return /^https?:\/\//i.test(rawUrl) ? rawUrl : "";
    }
  }

  function getHistoryRepositoryPaginationNotice(payload = {}, options = {}) {
    const pagination = getHistoryRepositoryPagination(payload, options.requestUrl || "");
    if (!pagination.hasMore) return "";
    const pageText = pagination.pageSize && pagination.total
      ? `当前为第 ${pagination.page} 页，每页 ${pagination.pageSize} 条，共约 ${pagination.total} 条`
      : `当前为第 ${pagination.page} 页`;
    return pagination.nextPageUrl
      ? `远端返回分页结果：${pageText}；拉取时会继续请求后续页面。`
      : `远端返回分页结果：${pageText}；远端未提供下一页地址，当前只能处理本次返回的档案包。`;
  }

  function formatHistoryRepositoryNetworkError(action, error) {
    const detail = String(error?.message || "").trim();
    if (error?.name === "TimeoutError" || /超时|timeout/i.test(detail)) {
      return detail
        ? `远端学习档案 API ${action}失败：请求超时（${detail}）。`
        : `远端学习档案 API ${action}失败：请求超时。`;
    }
    return detail
      ? `远端学习档案 API ${action}失败：网络请求异常（${detail}）。`
      : `远端学习档案 API ${action}失败：网络请求异常。`;
  }

  function checkRemoteHistoryRepository(options = {}) {
    const repository = normalizeHistoryRepository(state.historyRepository);
    const remoteConfigured = Boolean(repository.remoteEndpoint);
    const fetchApi = getPlanRepositoryFetch();
    const now = new Date().toISOString();
    state.historyRepository = normalizeHistoryRepository({
      ...repository,
      mode: remoteConfigured ? "remote-api" : "local-json",
      lastCheckedAt: now,
      lastError: remoteConfigured ? "" : "尚未配置远端学习档案 repository；当前只能使用本机 JSON 同步包。"
    });
    if (!remoteConfigured || !fetchApi) {
      if (remoteConfigured && !fetchApi) {
        state.historyRepository = normalizeHistoryRepository({
          ...state.historyRepository,
          lastError: "当前运行环境不支持 fetch，无法检查远端学习档案 API。"
        });
      }
      saveState();
      const status = getHistoryRepositoryStatus();
      return {
        ok: false,
        status,
        message: `${status.message} ${HISTORY_REPOSITORY_BOUNDARY}`
      };
    }
    return checkRemoteHistoryRepositoryAsync(repository, fetchApi, options);
  }

  async function checkRemoteHistoryRepositoryAsync(repository, fetchApi, options = {}) {
    try {
      const response = await requestHistoryRepository(repository, fetchApi, options);
      const parsed = await parseRemoteHistoryRepositoryResponse(response, { requestUrl: repository.remoteEndpoint });
      const now = new Date().toISOString();
      if (!parsed.ok) {
        recordHistoryRepositoryError(parsed.message, {
          action: "check",
          failureKind: classifyHistoryRepositoryFailure(parsed.message),
          retryDelayMs: options.retryDelayMs
        });
        return { ok: false, status: getHistoryRepositoryStatus(), message: parsed.message };
      }

      const recordCount = parsed.package?.summary?.total || 0;
      const parsedReceipt = parsed.receipt
        ? decorateHistoryRepositoryReceipt(parsed.receipt, {
          direction: "check",
          endpoint: repository.remoteEndpoint,
          workspaceId: repository.workspaceId,
          receivedAt: now,
          message: parsed.message
        })
        : null;
      const receipt = parsedReceipt || repository.lastReceipt || null;
      state.historyRepository = normalizeHistoryRepository({
        ...repository,
        mode: "remote-api",
        workspaceId: repository.workspaceId,
        lastCheckedAt: now,
        lastRemoteSyncAt: now,
        lastRemoteDirection: "check",
        lastRemoteRecordCount: recordCount,
        lastPackageId: parsed.package?.packageId || repository.lastPackageId,
        lastReceipt: receipt,
        receipts: appendHistoryRepositoryReceipt(repository, parsedReceipt),
        lastRemoteStatus: `${parsed.message} 空间：${repository.workspaceId}。`,
        remoteRetryAfter: null,
        lastError: ""
      });
      addEvent("history-repository-remote-check", `检查远端学习档案 API：${repository.workspaceId} / ${recordCount} 条记录`);
      saveState();
      return {
        ok: true,
        status: getHistoryRepositoryStatus(),
        package: parsed.package || null,
        receipt: receipt ? clone(receipt) : null,
        message: `${parsed.message} 空间 ${repository.workspaceId}。${HISTORY_REPOSITORY_BOUNDARY}`
      };
    } catch (error) {
      const message = formatHistoryRepositoryNetworkError("检查", error);
      recordHistoryRepositoryError(message, {
        action: "check",
        failureKind: classifyHistoryRepositoryFailure(message),
        retryDelayMs: options.retryDelayMs
      });
      return { ok: false, status: getHistoryRepositoryStatus(), message };
    }
  }

  function pushHistoryRepositoryToRemote(options = {}) {
    const repository = normalizeHistoryRepository(state.historyRepository);
    const fetchApi = getPlanRepositoryFetch();
    if (!repository.remoteEndpoint) {
      return checkRemoteHistoryRepository(options);
    }
    if (!fetchApi) {
      const message = "当前运行环境不支持 fetch，无法推送学习档案到远端 API。";
      recordHistoryRepositoryError(message, {
        action: "push",
        failureKind: "network",
        retryDelayMs: options.retryDelayMs
      });
      return { ok: false, status: getHistoryRepositoryStatus(), message };
    }
    const packageResult = getHistoryRepositoryPackage(options);
    if (!packageResult.ok) {
      return packageResult;
    }
    return pushHistoryRepositoryToRemoteAsync(repository, fetchApi, packageResult.package, options);
  }

  async function pushHistoryRepositoryToRemoteAsync(repository, fetchApi, repositoryPackage, options = {}) {
    try {
      const response = await requestHistoryRepository(repository, fetchApi, {
        method: "PUT",
        body: repositoryPackage,
        timeoutMs: options.timeoutMs
      });
      const parsed = await parseRemoteHistoryRepositoryResponse(response, { requestUrl: repository.remoteEndpoint });
      const acceptedPackageId = parsed.package?.packageId || repositoryPackage.packageId;
      const recordCount = repositoryPackage.summary.total;
      const now = new Date().toISOString();
      if (!parsed.ok) {
        const packageDigest = sha256StableJson(repositoryPackage);
        recordHistoryRepositoryError(parsed.message, {
          action: "push",
          packageId: repositoryPackage.packageId,
          packageDigest,
          recordCount,
          failureKind: classifyHistoryRepositoryFailure(parsed.message),
          retryDelayMs: options.retryDelayMs
        });
        return { ok: false, status: getHistoryRepositoryStatus(), message: parsed.message };
      }

      const receipt = parsed.receipt
        ? decorateHistoryRepositoryReceipt(parsed.receipt, {
          direction: "push",
          endpoint: repository.remoteEndpoint,
          workspaceId: repository.workspaceId,
          receivedAt: now,
          message: parsed.message
        })
        : null;
      state.historyRepository = normalizeHistoryRepository({
        ...repository,
        mode: "remote-api",
        workspaceId: repository.workspaceId,
        lastCheckedAt: now,
        lastRemoteSyncAt: now,
        lastRemotePushAt: now,
        lastRemoteDirection: "push",
        lastRemoteRecordCount: recordCount,
        lastExportedAt: now,
        lastExportedRecordCount: recordCount,
        lastPackageId: acceptedPackageId,
        lastSkippedConflictCount: 0,
        lastConflictRecords: [],
        lastReceipt: receipt || repository.lastReceipt,
        receipts: appendHistoryRepositoryReceipt(repository, receipt),
        lastRemoteStatus: receipt
          ? `已推送 ${recordCount} 条学习档案到远端 API，空间 ${repository.workspaceId}，并收到回执 ${receipt.receiptDigest.slice(0, 12)}。`
          : `已推送 ${recordCount} 条学习档案到远端 API，空间 ${repository.workspaceId}。`,
        remoteRetryAfter: null,
        lastError: ""
      });
      addEvent("history-repository-remote-push", `推送学习档案到远端 API：${repository.workspaceId} / ${recordCount} 条记录`);
      saveState();
      return {
        ok: true,
        status: getHistoryRepositoryStatus(),
        packageId: acceptedPackageId,
        pushedRecordCount: recordCount,
        receipt: receipt ? clone(receipt) : null,
        message: `已推送 ${recordCount} 条学习档案到远端 API，空间 ${repository.workspaceId}。${HISTORY_REPOSITORY_BOUNDARY}`
      };
    } catch (error) {
      const message = formatHistoryRepositoryNetworkError("推送", error);
      const packageDigest = sha256StableJson(repositoryPackage);
      recordHistoryRepositoryError(message, {
        action: "push",
        packageId: repositoryPackage.packageId,
        packageDigest,
        recordCount: repositoryPackage.summary.total,
        failureKind: classifyHistoryRepositoryFailure(message),
        retryDelayMs: options.retryDelayMs
      });
      return { ok: false, status: getHistoryRepositoryStatus(), message };
    }
  }

  function countHistoryRepositoryPackageRecords(repositoryPackage) {
    const records = repositoryPackage?.records && typeof repositoryPackage.records === "object"
      ? repositoryPackage.records
      : {};
    const sessions = Array.isArray(records.sessions) ? records.sessions.length : 0;
    const artworks = Array.isArray(records.artworks) ? records.artworks.length : 0;
    const reports = Array.isArray(records.reports) ? records.reports.length : 0;
    const stages = Array.isArray(records.stages) ? records.stages.length : 0;
    return sessions + artworks + reports + stages;
  }

  function mergeHistoryRepositoryPackages(repositoryPackages = []) {
    let importedCount = 0;
    let updatedCount = 0;
    let skippedConflictCount = 0;
    let processedRecordCount = 0;
    let latestPackageId = null;
    const conflicts = [];

    repositoryPackages.forEach((repositoryPackage) => {
      const records = repositoryPackage?.records || {};
      const sessions = Array.isArray(records.sessions) ? records.sessions : [];
      const artworks = Array.isArray(records.artworks) ? records.artworks : [];
      const reports = Array.isArray(records.reports) ? records.reports : [];
      const stages = Array.isArray(records.stages) ? records.stages : [];
      processedRecordCount += sessions.length + artworks.length + reports.length + stages.length;
      if (repositoryPackage?.packageId) {
        latestPackageId = repositoryPackage.packageId;
      }

      const sessionMerge = mergeHistoryRecords(state.sessions, sessions, normalizeSession, "session");
      const artworkMerge = mergeHistoryRecords(state.artworks, artworks, normalizeArtwork, "artwork");
      const reportMerge = mergeHistoryRecords(state.reports, reports, normalizeReport, "report");
      const stageMerge = mergeHistoryRecords(state.stageRecords, stages, normalizeStageRecord, "stage");
      importedCount += sessionMerge.importedCount + artworkMerge.importedCount + reportMerge.importedCount + stageMerge.importedCount;
      updatedCount += sessionMerge.updatedCount + artworkMerge.updatedCount + reportMerge.updatedCount + stageMerge.updatedCount;
      skippedConflictCount += sessionMerge.skippedConflictCount + artworkMerge.skippedConflictCount + reportMerge.skippedConflictCount + stageMerge.skippedConflictCount;
      conflicts.push(...sessionMerge.conflicts, ...artworkMerge.conflicts, ...reportMerge.conflicts, ...stageMerge.conflicts);
    });

    return {
      importedCount,
      updatedCount,
      skippedConflictCount,
      processedRecordCount,
      conflicts: getHistoryRepositoryConflictRecords(conflicts),
      latestPackageId,
      totalRecordCount: getHistoryRepositoryRecordCount()
    };
  }

  async function fetchRemoteHistoryRepositoryPages(repository, fetchApi, options = {}) {
    const pages = [];
    const visitedUrls = new Set();
    let nextPageUrl = repository.remoteEndpoint;
    let warning = "";

    while (nextPageUrl) {
      if (pages.length >= HISTORY_REPOSITORY_MAX_PULL_PAGES) {
        warning = `远端分页超过 ${HISTORY_REPOSITORY_MAX_PULL_PAGES} 页，已停止继续追取。`;
        break;
      }
      if (visitedUrls.has(nextPageUrl)) {
        warning = "远端分页 nextPageUrl 出现循环，已停止继续追取。";
        break;
      }

      visitedUrls.add(nextPageUrl);
      const response = await requestHistoryRepository(repository, fetchApi, {
        requestUrl: nextPageUrl,
        timeoutMs: options.timeoutMs
      });
      const parsed = await parseRemoteHistoryRepositoryResponse(response, { requestUrl: nextPageUrl });
      if (!parsed.ok) {
        return {
          ok: false,
          pages,
          warning,
          message: parsed.message
        };
      }

      pages.push(parsed);
      if (!parsed.pagination?.hasMore) {
        break;
      }
      if (!parsed.pagination.nextPageUrl) {
        warning = "远端提示还有后续页面，但未提供下一页地址，已停止继续追取。";
        break;
      }
      nextPageUrl = parsed.pagination.nextPageUrl;
    }

    return {
      ok: true,
      pages,
      warning,
      message: pages.length > 1
        ? `已追取远端学习档案 ${pages.length} 页。`
        : pages[0]?.message || "远端学习档案 API 检查通过。"
    };
  }

  function pullHistoryRepositoryFromRemote(options = {}) {
    const repository = normalizeHistoryRepository(state.historyRepository);
    const fetchApi = getPlanRepositoryFetch();
    if (!repository.remoteEndpoint) {
      return checkRemoteHistoryRepository(options);
    }
    if (!fetchApi) {
      const message = "当前运行环境不支持 fetch，无法从远端 API 拉取学习档案。";
      recordHistoryRepositoryError(message, {
        action: "pull",
        failureKind: "network",
        retryDelayMs: options.retryDelayMs
      });
      return { ok: false, status: getHistoryRepositoryStatus(), message };
    }
    return pullHistoryRepositoryFromRemoteAsync(repository, fetchApi, options);
  }

  async function pullHistoryRepositoryFromRemoteAsync(repository, fetchApi, options = {}) {
    try {
      const remotePages = await fetchRemoteHistoryRepositoryPages(repository, fetchApi, options);
      if (!remotePages.ok) {
        recordHistoryRepositoryError(remotePages.message, {
          action: "pull",
          failureKind: classifyHistoryRepositoryFailure(remotePages.message),
          retryDelayMs: options.retryDelayMs
        });
        return { ok: false, status: getHistoryRepositoryStatus(), message: remotePages.message };
      }
      const repositoryPackages = remotePages.pages.map((page) => page.package).filter(Boolean);
      if (!repositoryPackages.length) {
        const message = "远端学习档案 API 没有返回可导入的档案包。";
        recordHistoryRepositoryError(message, {
          action: "pull",
          failureKind: "response",
          retryDelayMs: options.retryDelayMs
        });
        return { ok: false, status: getHistoryRepositoryStatus(), message };
      }

      const imported = mergeHistoryRepositoryPackages(repositoryPackages);
      const now = new Date().toISOString();
      const recordCount = repositoryPackages.reduce((total, repositoryPackage) => total + countHistoryRepositoryPackageRecords(repositoryPackage), 0);
      const pageCountText = remotePages.pages.length > 1 ? `（${remotePages.pages.length} 页）` : "";
      const warningText = remotePages.warning ? ` ${remotePages.warning}` : "";
      const parsedReceipt = remotePages.pages.find((page) => page.receipt)?.receipt || null;
      const receipt = parsedReceipt
        ? decorateHistoryRepositoryReceipt(parsedReceipt, {
          direction: "pull",
          endpoint: repository.remoteEndpoint,
          workspaceId: repository.workspaceId,
          receivedAt: now,
          message: remotePages.message
        })
        : null;
      state.historyRepository = normalizeHistoryRepository({
        ...state.historyRepository,
        mode: "remote-api",
        remoteEndpoint: repository.remoteEndpoint,
        remoteToken: repository.remoteToken,
        workspaceId: repository.workspaceId,
        lastCheckedAt: now,
        lastRemoteSyncAt: now,
        lastRemoteDirection: "pull",
        lastRemoteRecordCount: recordCount,
        lastImportedAt: now,
        lastImportedRecordCount: imported.importedCount + imported.updatedCount,
        lastPackageId: imported.latestPackageId || repository.lastPackageId || null,
        lastSkippedConflictCount: imported.skippedConflictCount,
        lastConflictRecords: imported.conflicts,
        lastReceipt: receipt || repository.lastReceipt,
        receipts: appendHistoryRepositoryReceipt(repository, receipt),
        lastRemoteStatus: `已从远端 API 拉取 ${recordCount} 条学习档案${pageCountText}，空间 ${repository.workspaceId}，新增 ${imported.importedCount}，跳过冲突 ${imported.skippedConflictCount}。${warningText}`,
        remoteRetryAfter: null,
        lastError: imported.skippedConflictCount
          ? `有 ${imported.skippedConflictCount} 条同 ID 差异记录已跳过，已保存冲突审计，未覆盖本机记录。`
          : ""
      });
      addEvent("history-repository-remote-pull", `从远端 API 拉取学习档案：${repository.workspaceId} / ${recordCount} 条记录，${remotePages.pages.length} 页`);
      saveState();
      return {
        ok: true,
        status: getHistoryRepositoryStatus(),
        importedCount: imported.importedCount,
        skippedConflictCount: imported.skippedConflictCount,
        pulledRecordCount: recordCount,
        conflicts: imported.conflicts,
        receipt: receipt ? clone(receipt) : null,
        message: imported.skippedConflictCount
          ? `已从远端 API 拉取 ${recordCount} 条学习档案${pageCountText}，空间 ${repository.workspaceId}：新增 ${imported.importedCount}，跳过 ${imported.skippedConflictCount} 条同 ID 差异记录，并保存冲突审计。${warningText}${HISTORY_REPOSITORY_BOUNDARY}`
          : `已从远端 API 拉取 ${recordCount} 条学习档案${pageCountText}，空间 ${repository.workspaceId}：新增 ${imported.importedCount} 条记录。${warningText}${HISTORY_REPOSITORY_BOUNDARY}`
      };
    } catch (error) {
      const message = formatHistoryRepositoryNetworkError("拉取", error);
      recordHistoryRepositoryError(message, {
        action: "pull",
        failureKind: classifyHistoryRepositoryFailure(message),
        retryDelayMs: options.retryDelayMs
      });
      return { ok: false, status: getHistoryRepositoryStatus(), message };
    }
  }

  function getHistoryRepositoryConflicts() {
    const repository = normalizeHistoryRepository(state.historyRepository);
    return {
      ok: true,
      count: repository.lastConflictRecords.length,
      conflicts: clone(repository.lastConflictRecords),
      message: repository.lastConflictRecords.length
        ? `当前有 ${repository.lastConflictRecords.length} 条学习档案冲突审计。`
        : "当前没有待处理的学习档案冲突审计。"
    };
  }

  function resolveHistoryRepositoryConflict(action, options = {}) {
    const strategy = String(action || "").trim();
    const repository = normalizeHistoryRepository(state.historyRepository);
    const conflicts = repository.lastConflictRecords;
    const conflictId = String(options.conflictId || options.id || "").trim();
    const targets = conflictId
      ? conflicts.filter((conflict) => conflict.conflictId === conflictId)
      : conflicts;
    if (!targets.length) {
      return {
        ok: false,
        status: getHistoryRepositoryStatus(),
        message: "当前没有匹配的学习档案冲突审计。"
      };
    }

    if (strategy === "copy-remote") {
      const copied = targets.map(copyHistoryRepositoryConflictRemoteRecord).filter(Boolean);
      updateHistoryRepositoryConflictRecordsAfterResolve(repository, targets, `已将 ${copied.length} 条远端冲突档案另存为本机副本。`);
      addEvent("history-repository-conflict-copy", `远端冲突档案另存副本：${copied.length} 条`);
      saveState();
      return {
        ok: true,
        copiedCount: copied.length,
        copied,
        status: getHistoryRepositoryStatus(),
        message: `已将 ${copied.length} 条远端冲突档案另存为本机副本；原本机记录仍保留。`
      };
    }

    if (strategy === "merge-fields") {
      return mergeHistoryRepositoryConflictFields(repository, targets, options);
    }

    if (strategy === "dismiss") {
      updateHistoryRepositoryConflictRecordsAfterResolve(repository, targets, `已忽略 ${targets.length} 条学习档案冲突审计。`);
      addEvent("history-repository-conflict-dismiss", `忽略学习档案冲突审计：${targets.length} 条`);
      saveState();
      return {
        ok: true,
        dismissedCount: targets.length,
        status: getHistoryRepositoryStatus(),
        message: `已忽略 ${targets.length} 条学习档案冲突审计；本机记录保持不变。`
      };
    }

    return {
      ok: false,
      status: getHistoryRepositoryStatus(),
      message: "未知的学习档案冲突处理方式。"
    };
  }

  function mergeHistoryRepositoryConflictFields(repository, targets, options = {}) {
    let mergedCount = 0;
    let remoteFieldCount = 0;
    let localFieldCount = 0;

    targets.forEach((conflict) => {
      const collection = getHistoryRepositoryConflictCollection(conflict.type);
      if (!collection) return;
      const localIndex = collection.records.findIndex((record) => record.id === conflict.id);
      const remoteRecord = normalizeHistoryConflictRemoteRecord(conflict.type, conflict.remoteRecord);
      if (localIndex < 0 || !remoteRecord) return;

      const localRecord = collection.normalize(collection.records[localIndex]);
      if (!localRecord) return;
      const nextRecord = clone(localRecord);
      const selections = getHistoryRepositoryConflictMergeSelections(conflict, options);
      const fields = getHistoryRepositoryMergeFields(conflict);
      fields.forEach((field) => {
        if (stablePlanStringify(localRecord[field] ?? "") === stablePlanStringify(remoteRecord[field] ?? "")) {
          return;
        }
        const choice = selections[field] === "remote" ? "remote" : "local";
        if (choice === "remote") {
          nextRecord[field] = clone(remoteRecord[field]);
          remoteFieldCount += 1;
        } else {
          localFieldCount += 1;
        }
      });

      collection.records[localIndex] = collection.normalize(nextRecord);
      mergedCount += 1;
    });

    if (!mergedCount) {
      return {
        ok: false,
        status: getHistoryRepositoryStatus(),
        message: "没有找到可字段合并的本机冲突档案。"
      };
    }

    updateHistoryRepositoryConflictRecordsAfterResolve(
      repository,
      targets,
      `已按字段合并 ${mergedCount} 条学习档案冲突，远端字段 ${remoteFieldCount} 项，本机字段 ${localFieldCount} 项。`
    );
    addEvent("history-repository-conflict-merge", `字段级合并学习档案冲突：${mergedCount} 条`);
    saveState();
    return {
      ok: true,
      mergedCount,
      remoteFieldCount,
      localFieldCount,
      status: getHistoryRepositoryStatus(),
      message: `已按字段合并 ${mergedCount} 条学习档案冲突：采用远端字段 ${remoteFieldCount} 项，保留本机字段 ${localFieldCount} 项。`
    };
  }

  function getHistoryRepositoryConflictCollection(type) {
    if (type === "session") return { records: state.sessions, normalize: normalizeSession };
    if (type === "artwork") return { records: state.artworks, normalize: normalizeArtwork };
    if (type === "report") return { records: state.reports, normalize: normalizeReport };
    if (type === "stage") return { records: state.stageRecords, normalize: normalizeStageRecord };
    return null;
  }

  function getHistoryRepositoryMergeFields(conflict) {
    const configuredFields = HISTORY_REPOSITORY_CONFLICT_FIELDS[conflict.type] || [];
    const diffFields = Array.isArray(conflict.fieldDiffs)
      ? conflict.fieldDiffs.map((field) => String(field.field || "").trim()).filter(Boolean)
      : [];
    return [...new Set([...diffFields, ...configuredFields])];
  }

  function getHistoryRepositoryConflictMergeSelections(conflict, options = {}) {
    const source = options && typeof options === "object" ? options : {};
    const selections = source.selections && typeof source.selections === "object"
      ? source.selections
      : source.fields && typeof source.fields === "object"
        ? source.fields
        : source;
    const nested = selections?.[conflict.conflictId] || selections?.[conflict.id] || selections;
    const result = {};
    Object.entries(nested || {}).forEach(([field, value]) => {
      if (["conflictId", "id", "selections", "fields"].includes(field)) return;
      result[field] = value === "remote" ? "remote" : "local";
    });
    return result;
  }

  function updateHistoryRepositoryConflictRecordsAfterResolve(repository, targets, statusMessage) {
    const targetIds = new Set(targets.map((conflict) => conflict.conflictId));
    const remaining = repository.lastConflictRecords.filter((conflict) => !targetIds.has(conflict.conflictId));
    state.historyRepository = normalizeHistoryRepository({
      ...repository,
      lastCheckedAt: new Date().toISOString(),
      lastSkippedConflictCount: remaining.length,
      lastConflictRecords: remaining,
      lastRemoteStatus: statusMessage,
      lastError: remaining.length
        ? `仍有 ${remaining.length} 条学习档案冲突审计待处理。`
        : ""
    });
  }

  function copyHistoryRepositoryConflictRemoteRecord(conflict) {
    const normalized = normalizeHistoryConflictRemoteRecord(conflict.type, conflict.remoteRecord);
    if (!normalized) return null;
    const copy = clone(normalized);
    const prefix = {
      session: "session-remote-copy",
      artwork: "artwork-remote-copy",
      report: "report-remote-copy",
      stage: "stage-remote-copy"
    }[conflict.type] || "history-remote-copy";
    copy.id = makeId(prefix);
    copy.title = appendHistoryRepositoryCopyTitle(copy.title || conflict.remoteTitle || conflict.title || "远端冲突档案");
    if (conflict.type === "session") {
      copy.snapshotAt = copy.snapshotAt || new Date().toISOString();
      copy.status = copy.status || "saved";
      state.sessions.push(normalizeSession(copy));
    } else if (conflict.type === "artwork") {
      copy.sessionId = null;
      state.artworks.push(normalizeArtwork(copy));
    } else if (conflict.type === "report") {
      copy.latestSessionId = null;
      copy.latestArtworkId = null;
      state.reports.push(normalizeReport(copy));
    } else if (conflict.type === "stage") {
      state.stageRecords.push(normalizeStageRecord(copy));
    }
    return copy;
  }

  function appendHistoryRepositoryCopyTitle(title) {
    const text = String(title || "远端冲突档案").trim();
    const suffix = "（远端副本）";
    return text.endsWith(suffix) ? text : `${text}${suffix}`;
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
    const batchReceipt = appendHistoryBatchReceipt({
      action: "delete",
      label: "批量移入回收站",
      recordCount: deletedCount,
      counts: getHistoryRecordCounts(deleted),
      selectedIds,
      trashId: trash?.id || "",
      message: `已将 ${deletedCount} 条学习档案移入回收站。`
    });
    addEvent("history-batch-delete", `移入回收站：${deletedCount} 条学习档案`);
    saveState();
    return {
      ok: true,
      deletedCount,
      trash: decorateHistoryTrashEntry(trash),
      batchReceipt: batchReceipt ? clone(batchReceipt) : null,
      deleted: {
        practice: deleted.practice.length,
        artwork: deleted.artwork.length,
        report: deleted.report.length,
        stage: deleted.stage.length
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
    const stages = entry.records?.stages || [];
    const recordCount = sessions.length + artworks.length + reports.length + stages.length;
    return {
      id: entry.id,
      title: entry.title,
      deletedAt: entry.deletedAt,
      recordCount,
      counts: {
        practice: sessions.length,
        artwork: artworks.length,
        report: reports.length,
        stage: stages.length
      }
    };
  }

  function appendHistoryBatchReceipt(record = {}) {
    const receipt = normalizeHistoryBatchReceipt({
      ...record,
      id: record.id || makeId("history-batch"),
      createdAt: record.createdAt || new Date().toISOString()
    });
    if (!receipt) return null;
    state.historyBatchReceipts = [
      receipt,
      ...state.historyBatchReceipts.filter((item) => item.id !== receipt.id)
    ].slice(0, MAX_HISTORY_BATCH_RECEIPTS);
    return receipt;
  }

  function getHistoryBatchReceipts() {
    const records = (state.historyBatchReceipts || [])
      .map(normalizeHistoryBatchReceipt)
      .filter(Boolean)
      .slice(0, MAX_HISTORY_BATCH_RECEIPTS);
    const latest = records[0] || null;
    return {
      total: records.length,
      latest: latest ? clone(latest) : null,
      records: clone(records),
      message: latest
        ? `最近学习档案批量操作：${latest.label}，${latest.recordCount} 条。`
        : "暂无学习档案批量操作回执。"
    };
  }

  function getHistoryRecordCounts(records = {}) {
    return {
      practice: Array.isArray(records.practice)
        ? records.practice.length
        : Array.isArray(records.sessions)
          ? records.sessions.length
          : 0,
      artwork: Array.isArray(records.artwork)
        ? records.artwork.length
        : Array.isArray(records.artworks)
          ? records.artworks.length
          : 0,
      report: Array.isArray(records.report)
        ? records.report.length
        : Array.isArray(records.reports)
          ? records.reports.length
          : 0,
      stage: Array.isArray(records.stage)
        ? records.stage.length
        : Array.isArray(records.stages)
          ? records.stages.length
          : 0
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
      report: restoreRecords(state.reports, trash.records.reports, normalizeReport),
      stage: restoreRecords(state.stageRecords, trash.records.stages, normalizeStageRecord)
    };
    restoreHistoryReferences(trash.references);
    state.historyTrash = state.historyTrash.filter((entry) => entry.id !== trash.id);
    const restoredCount = restored.practice + restored.artwork + restored.report + restored.stage;
    const batchReceipt = appendHistoryBatchReceipt({
      action: "restore",
      label: "恢复回收站学习档案",
      recordCount: restoredCount,
      counts: restored,
      trashId: trash.id,
      message: restoredCount
        ? `已恢复 ${restoredCount} 条学习档案：${trash.title}。`
        : `回收站条目“${trash.title}”已清理；原记录当前已存在。`
    });
    addEvent("history-restore", `恢复学习档案：${trash.title}`);
    saveState();
    return {
      ok: true,
      restored,
      restoredCount,
      batchReceipt: batchReceipt ? clone(batchReceipt) : null,
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
    const counts = state.historyTrash.reduce((sum, entry) => {
      const entryCounts = getHistoryRecordCounts(entry.records || {});
      return {
        practice: sum.practice + entryCounts.practice,
        artwork: sum.artwork + entryCounts.artwork,
        report: sum.report + entryCounts.report,
        stage: sum.stage + entryCounts.stage
      };
    }, { practice: 0, artwork: 0, report: 0, stage: 0 });
    state.historyTrash = [];
    const batchReceipt = appendHistoryBatchReceipt({
      action: "trash-clear",
      label: "清空学习档案回收站",
      recordCount,
      counts,
      message: `已清空回收站：${recordCount} 条学习档案。`
    });
    addEvent("history-trash-clear", `清空回收站：${recordCount} 条记录`);
    saveState();
    return {
      ok: true,
      count,
      recordCount,
      batchReceipt: batchReceipt ? clone(batchReceipt) : null,
      message: `已清空回收站：${recordCount} 条学习档案。`
    };
  }

  function deleteHistoryTrashEntry(trashId) {
    const targetId = String(trashId || "");
    const trash = state.historyTrash.find((entry) => entry.id === targetId);
    if (!trash) {
      return { ok: false, message: "未找到这条回收站记录。" };
    }

    const recordCount = decorateHistoryTrashEntry(trash)?.recordCount || 0;
    state.historyTrash = state.historyTrash.filter((entry) => entry.id !== trash.id);
    const batchReceipt = appendHistoryBatchReceipt({
      action: "trash-delete",
      label: "永久删除回收站记录",
      recordCount,
      counts: getHistoryRecordCounts(trash.records || {}),
      trashId: trash.id,
      message: `已永久删除回收站记录：${trash.title}。`
    });
    addEvent("history-trash-delete", `永久删除回收站记录：${trash.title}`);
    saveState();
    return {
      ok: true,
      deletedId: trash.id,
      recordCount,
      batchReceipt: batchReceipt ? clone(batchReceipt) : null,
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
    getLearningPathStatus,
    getScoreServiceStatus,
    getLectureServiceStatus,
    getPlan,
    getPlanHistory,
    getLatestPlan,
    getPlanDependencyGraph,
    getPlanCycleStatus,
    getPlanReminderServiceStatus,
    getPlanRepositoryStatus,
    getPlanRepositoryRemoteConfig,
    getPlanRepositoryPackage,
    getPlanRepositoryReceiptAudit,
    getPlanRepositoryReceiptAuditExport,
    getPlanCalendarExport,
    getHistoryRepositoryStatus,
    getHistoryBatchReceipts,
    getHistoryRepositoryRemoteConfig,
    getHistoryRepositoryConflicts,
    getHistoryRepositoryPackage,
    getHistoryRepositoryReceiptAudit,
    getHistoryRepositoryReceiptAuditExport,
    getReportRepositoryStatus,
    getReportRepositoryRemoteConfig,
    getReportRepositoryConflicts,
    getReportRepositoryPackage,
    getReportRepositoryReceiptAudit,
    getReportRepositoryReceiptAuditExport,
    getPlanExport,
    getReportPreview,
    getReportDetail,
    getReportVerification,
    getReportHtmlExport,
    getReportPdfExport,
    getReportTeacherReviewAudit,
    getReportTeacherReviewAuditExport,
    getReportComparison,
    getReportComparisonExport,
    getReportSeries,
    getArtworkSharePackage,
    getArtworkShareRemotePackage,
    getArtworkShareRemoteRevokePackage,
    getShareServiceStatus,
    getShareServiceRemoteConfig,
    getShareRepositoryReceiptAudit,
    getShareRepositoryReceiptAuditExport,
    getPracticeVideoExportStatus,
    getPracticeVideoExportAudit,
    getPracticeVideoExportAuditExport,
    getPracticeVideoRetrySource,
    getArtworkRepositoryStatus,
    getArtworkRepositoryPackage,
    getArtworkRepositoryConflicts,
    getLatestReview,
    getReviewEvidenceExport,
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
    downloadHistoryRepository,
    downloadHistoryRepositoryReceiptAudit,
    downloadPlanRepositoryReceiptAudit,
    downloadReportRepository,
    downloadReportRepositoryReceiptAudit,
    downloadReportTeacherReviewAudit,
    downloadPracticeVideoExportAudit,
    downloadArtworkRepository,
    getArtworkCollectionExport,
    downloadArtworkCollectionPage,
    getArtworkClassroomReviewExport,
    downloadArtworkClassroomReviewPage,
    importArtworkClassroomReviewNotes,
    getArtworkClassroomReviewSummaryExport,
    downloadArtworkClassroomReviewSummary,
    configurePlanRepositoryRemote,
    configureHistoryRepositoryRemote,
    configureReportRepositoryRemote,
    queuePlanRepositorySync,
    flushPlanRepositoryAutoSync,
    importPlanRepositoryPackage,
    importHistoryRepositoryPackage,
    importReportRepositoryPackage,
    importArtworkRepositoryPackage,
    resolveArtworkRepositoryConflict,
    checkRemotePlanRepository,
    checkRemoteHistoryRepository,
    checkRemoteReportRepository,
    pushPlanRepositoryToRemote,
    pushHistoryRepositoryToRemote,
    pushReportRepositoryToRemote,
    pullPlanRepositoryFromRemote,
    pullHistoryRepositoryFromRemote,
    pullReportRepositoryFromRemote,
    resolvePlanRepositoryConflict,
    resolveHistoryRepositoryConflict,
    resolveReportRepositoryConflict,
    setMode,
    selectDailyGlyph,
    rotateCopybook,
    selectTask,
    recordLearningStage,
    startLecture,
    advanceLecture,
    playLecture,
    updateLectureServiceCapabilities,
    recordLectureServiceEvent,
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
    createNextPlanCycle,
    setPlanReminderServicePreference,
    requestPlanReminderPermission,
    dispatchPlanReminderNotification,
    snoozePlanItem,
    completePlanItemReview,
    movePlanItem,
    deletePlanItem,
    createReport,
    updateReportTeacherReview,
    clearReportTeacherReview,
    createArtworkShareLink,
    openArtworkShareLink,
    markArtworkShareLinkCopied,
    revokeArtworkShareLink,
    configureShareServiceRemote,
    checkRemoteShareService,
    pushArtworkShareToRemote,
    revokeArtworkShareRemote,
    queuePracticeVideoExportJob,
    startPracticeVideoExportJob,
    retryPracticeVideoExportJob,
    recordPracticeVideoExport,
    recordPracticeVideoExportError,
    downloadPlan,
    downloadPlanCalendar,
    downloadPlanRepository,
    downloadReport,
    downloadReportPdf,
    downloadReportComparison,
    downloadShareRepositoryReceiptAudit,
    downloadReviewEvidence,
    downloadArtworkSharePage,
    downloadArchive
  };
})();

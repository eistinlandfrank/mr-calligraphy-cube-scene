#!/usr/bin/env node

global.window = global;
global.CustomEvent = class CustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
};
global.dispatchEvent = () => true;

const storage = new Map([
  [
    "mr-calligraphy-learning-state-v1",
    JSON.stringify({
      version: 1,
      selectedGlyph: "永",
      sessions: [
        createSession("session-1", "永", 72, "2026-06-10T08:00:00.000Z", {
          structure: 70,
          stroke: 71,
          technique: 72,
          fluency: 68,
          force: 69
        }),
        createSession("session-2", "永", 88, "2026-06-11T08:00:00.000Z", {
          structure: 84,
          stroke: 86,
          technique: 87,
          fluency: 83,
          force: 85
        }),
        createSession("session-3", "和", 80, "2026-06-11T09:00:00.000Z")
      ],
      artworks: [
        createArtwork("artwork-1", "session-1", "永", 72, "2026-06-10T08:10:00.000Z"),
        createArtwork("artwork-2", "session-2", "永", 88, "2026-06-11T08:10:00.000Z"),
        createArtwork("artwork-3", "session-3", "和", 80, "2026-06-11T09:10:00.000Z")
      ],
      reports: [
        createReport("report-1", 76, "2026-06-10T08:20:00.000Z", {
          structure: 72,
          stroke: 73,
          technique: 74,
          fluency: 70,
          force: 71
        }),
        createReport("report-2", 86, "2026-06-11T08:20:00.000Z", {
          structure: 84,
          stroke: 86,
          technique: 87,
          fluency: 83,
          force: 85
        }),
        createReport("report-3", 90, "2026-06-11T09:20:00.000Z", {
          structure: 88,
          stroke: 89,
          technique: 90,
          fluency: 87,
          force: 88
        })
      ],
      plans: [],
      stageRecords: [],
      historyTrash: [],
      events: []
    })
  ]
]);

global.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key)
};

require("../app-state.js");

const comparison = window.MRAppState.getArtworkComparison("永");
assert(comparison.ok, "同字两幅作品应生成作品对比。");
assert(comparison.glyph === "永", "作品对比应保留请求的字。");
assert(comparison.previous.id === "artwork-1", "作品对比应选择较早作品。");
assert(comparison.latest.id === "artwork-2", "作品对比应选择最新作品。");
assert(comparison.scoreDelta === 16, "作品对比应计算评分差。");
assert(comparison.strokeDelta === 4, "作品对比应计算笔画差。");
assert(comparison.pointDelta === 40, "作品对比应计算采样点差。");
assert(comparison.latest.imageData.startsWith("data:image/png"), "作品对比应保留作品截图。");
assert(
  comparison.metricDeltas.some((metric) => metric.key === "structure" && metric.delta === 14),
  "作品对比应基于关联练习计算维度差。"
);

const fallback = window.MRAppState.getArtworkComparison("和");
assert(fallback.ok && fallback.glyph === "永", "请求的字不足两幅时应回退到最近可对比同字作品。");

let gallery = window.MRAppState.getArtworkGallery({ query: "作品 2" });
assert(gallery.filteredTotal === 1 && gallery.items[0].id === "artwork-2", "作品集应支持按标题搜索作品。");

gallery = window.MRAppState.getArtworkGallery({ tag: "永" });
assert(gallery.filteredTotal === 2, "作品集应支持按默认字标签筛选作品。");

const tagUpdate = window.MRAppState.updateArtworkTags("artwork-3", "集字、口部 复盘");
assert(tagUpdate.ok, "作品标签应可写回本机状态。");
assert(tagUpdate.artwork.tags.includes("口部"), "作品标签更新结果应包含新标签。");

gallery = window.MRAppState.getArtworkGallery({ tag: "口部" });
assert(gallery.filteredTotal === 1 && gallery.items[0].id === "artwork-3", "作品集应支持按自定义标签筛选作品。");

const detail = window.MRAppState.getHistoryDetail("artwork-3");
assert(detail.tags.includes("复盘"), "作品详情应返回自定义标签。");

const persisted = JSON.parse(storage.get("mr-calligraphy-learning-state-v1"));
const persistedArtwork = persisted.artworks.find((item) => item.id === "artwork-3");
assert(persistedArtwork.tags.includes("集字"), "作品标签应持久化到 localStorage。");

const sharePackage = window.MRAppState.getArtworkSharePackage("artwork-2");
assert(sharePackage.ok, "作品分享页应能基于指定作品生成。");
assert(sharePackage.filename.includes("mr-calligraphy-share"), "作品分享页应返回可下载文件名。");
assert(sharePackage.html.includes("MR 书法作品分享"), "作品分享页 HTML 应包含分享页标题。");
assert(sharePackage.html.includes("永字作品 2"), "作品分享页 HTML 应包含作品标题。");
assert(sharePackage.html.includes("data:image/png"), "作品分享页 HTML 应嵌入作品截图。");
assert(sharePackage.html.includes("不是云端公开链接"), "作品分享页应明确本机导出边界。");
assert(sharePackage.html.includes("结构"), "作品分享页应包含能力维度。");

const reportComparison = window.MRAppState.getReportComparison("report-2");
assert(reportComparison.ok, "两份报告应生成跨版本对比。");
assert(reportComparison.previous.id === "report-1", "报告对比应选择上一份报告。");
assert(reportComparison.current.id === "report-2", "报告对比应保留当前报告。");
assert(reportComparison.averageDelta === 10, "报告对比应计算平均分变化。");
assert(reportComparison.sessionDelta === 1, "报告对比应计算练习次数变化。");
assert(
  reportComparison.metricDeltas.some((metric) => metric.key === "structure" && metric.delta === 12),
  "报告对比应计算字段级能力变化。"
);
const reportComparisonExport = window.MRAppState.getReportComparisonExport("report-2");
assert(reportComparisonExport.ok, "报告对比应能生成离线导出页。");
assert(reportComparisonExport.filename.includes("mr-calligraphy-report-comparison"), "报告对比导出页应返回可下载文件名。");
assert(reportComparisonExport.html.includes("MR 书法报告对比"), "报告对比导出页 HTML 应包含标题。");
assert(reportComparisonExport.html.includes("report-1") && reportComparisonExport.html.includes("report-2"), "报告对比导出页 HTML 应包含两份报告 ID。");
assert(reportComparisonExport.html.includes("结构") && reportComparisonExport.html.includes("+12分"), "报告对比导出页 HTML 应包含字段差值。");
assert(reportComparisonExport.html.includes("不是云端长期报告"), "报告对比导出页应明确本机导出边界。");
assert(!window.MRAppState.getReportComparison("report-1").ok, "第一份报告不应伪造上一份对比。");

const reportSeries = window.MRAppState.getReportSeries("report-3");
assert(reportSeries.ok, "三份报告应生成多报告趋势。");
assert(reportSeries.points.length === 3, "多报告趋势应返回报告序列点。");
assert(reportSeries.currentId === "report-3", "多报告趋势应标记当前报告。");
assert(reportSeries.averageDelta === 14, "多报告趋势应计算首末平均分变化。");
assert(
  reportSeries.metricSeries.some((metric) => metric.key === "structure" && metric.delta === 16 && metric.points.length === 3),
  "多报告趋势应计算字段级首末变化。"
);
assert(!window.MRAppState.getReportSeries("report-1").ok, "第一份报告不应伪造多报告趋势。");

const breakdownStage = window.MRAppState.recordLearningStage("strokeBreakdown", { target: 4 });
assert(breakdownStage.ok, "进入笔画拆解应写入本机阶段记录。");
assert(breakdownStage.stageRecord.stage === "strokeBreakdown", "笔画拆解阶段记录应保留阶段类型。");
assert(breakdownStage.detail?.type === "stage", "阶段动作应返回可渲染的真实详情。");

const creationStage = window.MRAppState.recordLearningStage("creation", { target: 5 });
assert(creationStage.ok, "进入创作应写入本机阶段记录。");

const reviewStage = window.MRAppState.recordLearningStage("review", { target: 4 });
assert(reviewStage.ok, "复习巩固应写入本机阶段记录。");

const stageProgress = window.MRAppState.getStageProgress();
assert(stageProgress.done === 3 && stageProgress.total === 3, "三类学习阶段应全部计入阶段进度。");
assert(stageProgress.records.length === 3, "阶段进度应返回本机阶段记录。");

const taskProgress = window.MRAppState.getTaskProgress();
assert(taskProgress.stageCount === 3, "任务进度应统计阶段记录数量。");
assert(taskProgress.milestones.some((item) => item.id === "strokeBreakdown" && item.done), "任务里程碑应包含笔画拆解。");
assert(taskProgress.milestones.some((item) => item.id === "creation" && item.done), "任务里程碑应包含创作实践。");
assert(taskProgress.milestones.some((item) => item.id === "review" && item.done), "任务里程碑应包含复习巩固。");

const statsWithStages = window.MRAppState.getStats();
assert(statsWithStages.stageRecordCount === 3, "学习统计应返回阶段记录数量。");
assert(statsWithStages.stageProgress.done === 3, "学习统计应返回当前任务阶段进度。");

const planResult = window.MRAppState.createPlan();
assert(planResult.ok, "学习计划应能基于本机状态生成。");
const latestPlan = window.MRAppState.getLatestPlan();
assert(latestPlan.items.length === 5, "自动学习计划应生成 5 个任务项。");
assert(latestPlan.reminderSummary.total === 5, "学习计划应返回提醒汇总。");
assert(
  latestPlan.items.every((item) => item.dueAt && item.remindAt && item.reviewAction && item.reminder),
  "学习计划项应包含到期、提醒、复盘动作和派生提醒状态。"
);

const firstPlanItem = latestPlan.items[0];
const toggledPlanItem = window.MRAppState.togglePlanItem(latestPlan.id, firstPlanItem.id, true);
assert(toggledPlanItem.ok, "计划项应可勾选完成。");
const pendingReviewItem = toggledPlanItem.plan.items.find((item) => item.id === firstPlanItem.id);
assert(pendingReviewItem.reminder.status === "review-pending", "完成计划项后应进入待复盘状态。");

const reviewResult = window.MRAppState.completePlanItemReview(latestPlan.id, firstPlanItem.id);
assert(reviewResult.ok, "计划项应可写入复盘完成状态。");
const reviewedItem = reviewResult.plan.items.find((item) => item.id === firstPlanItem.id);
assert(reviewedItem.reviewDoneAt && reviewedItem.reminder.status === "reviewed", "复盘完成后应写入 reviewDoneAt 并派生已复盘状态。");
assert(Number.isInteger(reviewResult.nextAction.targetStep), "复盘完成后应返回下一步学习触发目标。");

const secondPlanItem = latestPlan.items[1];
const snoozeResult = window.MRAppState.snoozePlanItem(latestPlan.id, secondPlanItem.id, 1);
assert(snoozeResult.ok, "计划项应可顺延。");
const snoozedItem = snoozeResult.plan.items.find((item) => item.id === secondPlanItem.id);
assert(snoozedItem.snoozedUntil && snoozedItem.reminder.status === "snoozed", "顺延后应写入 snoozedUntil 并派生顺延状态。");

const updatePlanResult = window.MRAppState.updatePlanItem(latestPlan.id, secondPlanItem.id, {
  title: "复盘任务重点",
  detail: "按新的到期时间复盘任务重点。",
  dueAt: "2026-06-20",
  remindAt: "2026-06-19",
  reviewAction: "report"
});
assert(updatePlanResult.ok, "计划项应可更新到期、提醒和复盘动作。");
const updatedPlanItem = updatePlanResult.plan.items.find((item) => item.id === secondPlanItem.id);
assert(updatedPlanItem.reviewAction === "report" && updatedPlanItem.dueAt && updatedPlanItem.remindAt, "计划项编辑结果应保留排期和复盘动作。");

const addPlanResult = window.MRAppState.addPlanItem(latestPlan.id, {
  title: "补充专项练习",
  detail: "补一轮结构练习。",
  dueAt: "2026-06-21",
  remindAt: "2026-06-20",
  reviewAction: "custom"
});
assert(addPlanResult.ok && addPlanResult.plan.items.length === 6, "学习计划应可新增带排期的自定义任务。");

const persistedPlanState = JSON.parse(storage.get("mr-calligraphy-learning-state-v1"));
assert(persistedPlanState.stageRecords.length === 3, "阶段记录应持久化到 localStorage。");
assert(persistedPlanState.plans[0].items[0].reviewDoneAt, "计划复盘状态应持久化到 localStorage。");
assert(persistedPlanState.plans[0].items[1].snoozedUntil, "计划顺延状态应持久化到 localStorage。");

console.log("学习状态检查通过：同字作品对比、作品集检索、分享页、报告对比导出、多报告趋势、学习阶段记录和学习计划提醒复盘已生成。");

function createSession(id, glyph, score, time, metrics = {}) {
  return {
    id,
    title: `${glyph}字练习`,
    glyph,
    mode: "single",
    copybook: "永字八法",
    startedAt: time,
    endedAt: time,
    status: "saved",
    score,
    strokeCount: id === "session-2" ? 12 : 8,
    pointCount: id === "session-2" ? 120 : 80,
    metrics,
    feedback: [`${glyph}字反馈`],
    strokes: []
  };
}

function createArtwork(id, sessionId, glyph, score, time) {
  return {
    id,
    sessionId,
    title: `${glyph}字作品 ${id.slice(-1)}`,
    glyph,
    mode: "single",
    copybook: "永字八法",
    style: "楷书",
    score,
    strokeCount: id === "artwork-2" ? 12 : 8,
    pointCount: id === "artwork-2" ? 120 : 80,
    feedback: [`${glyph}字作品反馈`],
    imageData: "data:image/png;base64,iVBORw0KGgo=",
    createdAt: time
  };
}

function createReport(id, averageScore, time, scoreBreakdown) {
  const reportNumber = id.slice(-1);
  return {
    id,
    title: `学习报告 ${reportNumber}`,
    createdAt: time,
    range: "all",
    format: "html",
    summary: `第 ${reportNumber} 份本机学习报告。`,
    sessionCount: Number(reportNumber),
    artworkCount: Number(reportNumber),
    averageScore,
    learningMinutes: Number(reportNumber) * 12,
    latestSessionId: `session-${reportNumber}`,
    latestArtworkId: `artwork-${reportNumber}`,
    latestStrokeCount: id === "report-2" ? 12 : 8,
    latestPointCount: id === "report-2" ? 120 : 80,
    scoreBreakdown,
    trend: [],
    recommendations: [`第 ${reportNumber} 份报告建议`]
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

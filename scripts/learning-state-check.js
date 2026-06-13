#!/usr/bin/env node

const crypto = require("crypto");

global.window = global;
global.CustomEvent = class CustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
};
global.dispatchEvent = () => true;

const TEST_ARTWORK_JPEG_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/Aaf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/Aaf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Aqf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z";

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

const nativeFetch = typeof global.fetch === "function" ? global.fetch.bind(global) : null;
const { startPlanRepositoryMockServer } = require("./plan-repository-mock-server.js");
const { startHistoryRepositoryMockServer } = require("./history-repository-mock-server.js");
const { startReportRepositoryMockServer } = require("./report-repository-mock-server.js");
const { startShareRepositoryMockServer } = require("./share-repository-mock-server.js");

require("../app-state.js");

const migratedScoreService = window.MRAppState.getScoreServiceStatus();
assert(migratedScoreService.status === "scored", "旧练习记录应迁移出评分服务状态。");
assert(migratedScoreService.boundary.includes("不是专业书法评级"), "评分服务应说明本机启发式边界。");
assert(migratedScoreService.scoredSessionCount === 3, "评分服务应统计已有评分练习次数。");
assert(migratedScoreService.totalPointCount === 280, "评分服务应统计已有练习采样点。");
assert(migratedScoreService.lastScore === 80, "评分服务应读取最近一次已有练习分数。");
assert(migratedScoreService.message.includes("本机基础评分"), "评分服务摘要应标明本机基础评分。");

const initialLearningPath = window.MRAppState.getLearningPathStatus();
assert(initialLearningPath.kind === "mr-calligraphy-learning-path-v1", "学习路径服务应返回稳定 kind。");
assert(initialLearningPath.steps.length === 10, "学习路径服务应返回 10 个步骤。");
assert(initialLearningPath.source.includes("LearningTask"), "学习路径服务应声明 LearningTask 数据来源。");
assert(initialLearningPath.boundary.includes("不是云端课程编排"), "学习路径服务应说明本机路径边界。");
assert(initialLearningPath.steps[0].title.includes("今日单字：永"), "学习路径标题应读取当前任务标题。");
assert(initialLearningPath.steps[3].done, "已有真实练习记录时，临摹步骤应标记完成。");
assert(initialLearningPath.steps[3].evidence.some((item) => item.includes("真实练习")), "临摹步骤应返回练习证据。");
assert(initialLearningPath.steps[4].status !== "done", "尚未记录笔画拆解阶段时，不应伪造拆解完成。");
assert(initialLearningPath.steps[8].done, "已有报告记录时，报告步骤应标记完成。");
assert(initialLearningPath.message.includes("学习路径已完成"), "学习路径服务应返回可读摘要。");

const initialLectureService = window.MRAppState.getLectureServiceStatus();
assert(initialLectureService.status === "idle", "初始讲解服务应为待检查状态。");
assert(initialLectureService.boundary.includes("不是云端 AI 音频"), "讲解服务应说明本机服务边界。");

const lectureCapability = window.MRAppState.updateLectureServiceCapabilities({
  supported: true,
  voiceName: "测试中文语音"
});
assert(lectureCapability.ok, "讲解服务应能记录浏览器语音能力。");
assert(lectureCapability.status.status === "ready", "支持语音时讲解服务应进入可用状态。");
assert(lectureCapability.status.voiceName === "测试中文语音", "讲解服务应记录本机语音名称。");

const lectureStart = window.MRAppState.startLecture();
assert(lectureStart.ok, "讲解应能启动。");
assert(lectureStart.lecture.currentStep.title.includes("永字目标"), "讲解应读取当前任务段落。");

const lecturePlaying = window.MRAppState.recordLectureServiceEvent({
  mode: "local-tts",
  status: "playing",
  supported: true,
  voiceName: "测试中文语音",
  stepTitle: lectureStart.lecture.currentStep.title,
  message: "本机语音测试播放中"
});
assert(lecturePlaying.status.status === "playing", "讲解服务应记录播放中状态。");

const lectureSpoken = window.MRAppState.recordLectureServiceEvent({
  mode: "local-tts",
  status: "playing",
  supported: true,
  voiceName: "测试中文语音",
  stepTitle: lectureStart.lecture.currentStep.title,
  spoken: true,
  message: "已朗读测试段落"
});
assert(lectureSpoken.status.spokenStepCount === 1, "讲解服务应累计真实朗读段数。");

const lectureFallback = window.MRAppState.recordLectureServiceEvent({
  mode: "local-text-timer",
  status: "fallback",
  stepTitle: "结构观察",
  message: "测试文本计时降级"
});
assert(lectureFallback.status.fallbackStepCount === 1, "讲解服务应累计文本降级段数。");

const lectureComplete = window.MRAppState.recordLectureServiceEvent({
  status: "complete",
  stepTitle: "复盘标准",
  message: "本机讲解测试完成"
});
assert(lectureComplete.status.status === "complete", "讲解服务应记录完成状态。");

const persistedLectureService = JSON.parse(storage.get("mr-calligraphy-learning-state-v1")).lectureService;
assert(persistedLectureService.spokenStepCount === 1, "讲解服务朗读次数应持久化。");
assert(persistedLectureService.fallbackStepCount === 1, "讲解服务降级次数应持久化。");
assert(persistedLectureService.lastCompletedAt, "讲解服务完成时间应持久化。");

const learningEventAudit = window.MRAppState.getLearningEventAudit({ limit: 12 });
assert(learningEventAudit.kind === "mr-calligraphy-learning-event-audit-v1", "学习动作审计应返回稳定 kind。");
assert(learningEventAudit.total >= 2, "学习动作审计应统计本机事件。");
assert(learningEventAudit.events.some((event) => event.type === "lecture"), "学习动作审计应包含讲解事件。");
assert(/^[a-f0-9]{64}$/.test(learningEventAudit.auditDigest), "学习动作审计应包含稳定摘要。");
assert(learningEventAudit.boundary.includes("不是云端行为日志"), "学习动作审计应说明本机边界。");
const learningEventAuditExport = window.MRAppState.getLearningEventAuditExport({ limit: 12 });
assert(learningEventAuditExport.ok, "学习动作审计应可导出 HTML。");
assert(learningEventAuditExport.filename.startsWith("mr-calligraphy-learning-action-audit-"), "学习动作审计文件名应可识别。");
assert(learningEventAuditExport.html.includes("MR 书法学习动作审计"), "学习动作审计 HTML 应包含标题。");
assert(learningEventAuditExport.html.includes("本机讲解"), "学习动作审计 HTML 应包含事件类型。");
assert(learningEventAuditExport.html.includes(learningEventAuditExport.audit.auditDigest), "学习动作审计 HTML 应包含审计摘要。");

const linkCopyReportReceipt = window.MRAppState.recordLocalLinkCopyReceipt({
  targetType: "report",
  targetId: "report-2",
  title: "学习报告 2",
  url: "http://localhost:41496/?report=report-2",
  copyStatus: "clipboard"
});
assert(linkCopyReportReceipt.ok, "本机链接复制应能写入报告链接回执。");
const linkCopyHistoryReceipt = window.MRAppState.recordLocalLinkCopyReceipt({
  targetType: "history",
  targetId: "artwork-2",
  title: "永字作品 2",
  url: "http://localhost:41496/?history=artwork-2",
  copyStatus: "route-fallback"
});
assert(linkCopyHistoryReceipt.ok, "本机链接复制应能写入档案链接回执。");
const localLinkCopyAudit = window.MRAppState.getLocalLinkCopyAudit({ limit: 8 });
assert(localLinkCopyAudit.kind === "mr-calligraphy-local-link-copy-audit-v1", "本机链接复制审计应返回稳定 kind。");
assert(localLinkCopyAudit.total >= 2, "本机链接复制审计应统计复制回执。");
assert(localLinkCopyAudit.targetCounts.report >= 1, "本机链接复制审计应统计报告链接。");
assert(localLinkCopyAudit.targetCounts.history >= 1, "本机链接复制审计应统计档案链接。");
assert(localLinkCopyAudit.statusCounts.clipboard >= 1, "本机链接复制审计应统计剪贴板成功。");
assert(localLinkCopyAudit.statusCounts["route-fallback"] >= 1, "本机链接复制审计应统计地址栏降级。");
assert(/^[a-f0-9]{64}$/.test(localLinkCopyAudit.auditDigest), "本机链接复制审计应包含稳定摘要。");
assert(localLinkCopyAudit.boundary.includes("不是公网访问日志"), "本机链接复制审计应说明本机边界。");
const localLinkCopyAuditExport = window.MRAppState.getLocalLinkCopyAuditExport({ limit: 8 });
assert(localLinkCopyAuditExport.ok, "本机链接复制审计应可导出 HTML。");
assert(localLinkCopyAuditExport.filename.startsWith("mr-calligraphy-local-link-copy-audit-"), "本机链接复制审计文件名应可识别。");
assert(localLinkCopyAuditExport.html.includes("MR 书法本机链接复制审计"), "本机链接复制审计 HTML 应包含标题。");
assert(localLinkCopyAuditExport.html.includes("站内报告链接"), "本机链接复制审计 HTML 应包含报告链接类型。");
assert(localLinkCopyAuditExport.html.includes("学习档案链接"), "本机链接复制审计 HTML 应包含档案链接类型。");
assert(localLinkCopyAuditExport.html.includes(localLinkCopyAuditExport.audit.auditDigest), "本机链接复制审计 HTML 应包含审计摘要。");

const reportPrintReceipt = window.MRAppState.recordReportPrintReceipt("report-2", {
  userAgent: "node-learning-state-check",
  printTarget: "browser-print"
});
assert(reportPrintReceipt.ok, "报告打印应能写入本机回执。");
assert(reportPrintReceipt.receipt.reportId === "report-2", "报告打印回执应记录报告 ID。");
assert(reportPrintReceipt.receipt.reportDigest.match(/^[a-f0-9]{64}$/), "报告打印回执应记录报告验真摘要。");
assert(reportPrintReceipt.receipt.receiptDigest.match(/^[a-f0-9]{64}$/), "报告打印回执应包含回执摘要。");
assert(reportPrintReceipt.receipt.boundary.includes("只能证明本页发起"), "报告打印回执应说明能力边界。");
const reportPrintAudit = window.MRAppState.getReportPrintAudit("report-2", { limit: 5 });
assert(reportPrintAudit.kind === "mr-calligraphy-report-print-audit-v1", "报告打印审计应返回稳定 kind。");
assert(reportPrintAudit.total === 1, "报告打印审计应统计当前报告回执。");
assert(reportPrintAudit.statusCounts.requested === 1, "报告打印审计应统计请求状态。");
assert(reportPrintAudit.verifiedCount === 1, "报告打印审计应统计本机校验通过数量。");
assert(reportPrintAudit.failedCount === 0, "报告打印正常回执不应出现摘要失败。");
assert(reportPrintAudit.receipts[0].verificationStatus === "verified", "报告打印回执应通过本机 receiptDigest 重算校验。");
assert(reportPrintAudit.receipts[0].verificationExpectedDigest === reportPrintAudit.receipts[0].receiptDigest, "报告打印回执重算摘要应匹配 receiptDigest。");
assert(/^[a-f0-9]{64}$/.test(reportPrintAudit.auditDigest), "报告打印审计应包含稳定摘要。");
assert(reportPrintAudit.boundary.includes("不代表操作系统打印完成"), "报告打印审计应说明打印边界。");
const reportPrintAuditExport = window.MRAppState.getReportPrintAuditExport("report-2", { limit: 5 });
assert(reportPrintAuditExport.ok, "报告打印审计应可导出 HTML。");
assert(reportPrintAuditExport.filename.startsWith("mr-calligraphy-report-print-audit-report-2-"), "报告打印审计文件名应可识别。");
assert(reportPrintAuditExport.html.includes("MR 书法报告打印回执审计"), "报告打印审计 HTML 应包含标题。");
assert(reportPrintAuditExport.html.includes("浏览器打印请求"), "报告打印审计 HTML 应包含打印请求类型。");
assert(reportPrintAuditExport.html.includes(reportPrintAuditExport.audit.auditDigest), "报告打印审计 HTML 应包含审计摘要。");
assert(reportPrintAuditExport.html.includes("本机校验通过"), "报告打印审计 HTML 应包含本机校验结果。");
assert(reportPrintAuditExport.html.includes("重算摘要"), "报告打印审计 HTML 应包含重算摘要。");

const comparison = window.MRAppState.getArtworkComparison("永");
assert(comparison.ok, "同字两幅作品应生成作品对比。");
assert(comparison.glyph === "永", "作品对比应保留请求的字。");
assert(comparison.previous.id === "artwork-1", "作品对比应选择较早作品。");
assert(comparison.latest.id === "artwork-2", "作品对比应选择最新作品。");
assert(comparison.scoreDelta === 16, "作品对比应计算评分差。");
assert(comparison.strokeDelta === 4, "作品对比应计算笔画差。");
assert(comparison.pointDelta === 40, "作品对比应计算采样点差。");
assert(comparison.latest.imageData.startsWith("data:image/"), "作品对比应保留作品截图。");
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
assert(sharePackage.html.includes("data:image/"), "作品分享页 HTML 应嵌入作品截图。");
assert(sharePackage.html.includes("不是云端公开链接"), "作品分享页应明确本机导出边界。");
assert(sharePackage.html.includes("结构"), "作品分享页应包含能力维度。");
assert(!sharePackage.share.features.scoreEvidence, "旧作品缺少逐笔证据时分享包不应声明包含评分证据。");
assert(sharePackage.html.includes("不会补造评分依据"), "旧作品分享页应说明不会伪造评分证据。");
assert(!sharePackage.html.includes("路径误差热力</h2>"), "旧作品分享页缺少真实证据时不应渲染假热力图。");

const artworkCollectionExport = window.MRAppState.getArtworkCollectionExport();
assert(artworkCollectionExport.ok, "作品集 HTML 应可基于本机作品生成。");
const artworkRepositoryExport = window.MRAppState.getArtworkRepositoryPackage();
assert(artworkRepositoryExport.ok, "作品仓库 JSON 应可基于本机作品生成。");
const artworkRepositoryReceipt = window.MRAppState.recordArtworkExportReceipt({
  exportType: "artwork-repository-json",
  filename: artworkRepositoryExport.filename,
  json: JSON.stringify(artworkRepositoryExport.package, null, 2),
  package: artworkRepositoryExport.package,
  packageId: artworkRepositoryExport.package.packageId,
  packageDigest: artworkRepositoryExport.package.packageDigest
});
assert(artworkRepositoryReceipt.ok, "作品仓库 JSON 导出应可写入作品导出回执。");
assert(artworkRepositoryReceipt.receipt.exportType === "artwork-repository-json", "作品仓库回执应记录 JSON 导出类型。");
assert(artworkRepositoryReceipt.receipt.mimeType === "application/json;charset=utf-8", "作品仓库回执应记录 JSON MIME。");
assert(artworkRepositoryReceipt.receipt.packageDigest === artworkRepositoryExport.package.packageDigest, "作品仓库回执应记录包摘要。");
assert(/^[a-f0-9]{64}$/.test(artworkRepositoryReceipt.receipt.fileDigest), "作品仓库回执应记录 JSON 文件摘要。");
const artworkCollectionReceipt = window.MRAppState.recordArtworkExportReceipt({
  exportType: "artwork-collection",
  filename: artworkCollectionExport.filename,
  content: artworkCollectionExport.html,
  collection: artworkCollectionExport.collection
});
assert(artworkCollectionReceipt.ok, "作品集导出应可写入作品导出回执。");
assert(artworkCollectionReceipt.receipt.exportType === "artwork-collection", "作品集回执应记录导出类型。");
assert(artworkCollectionReceipt.receipt.artworkCount >= 3, "作品集回执应记录作品数量。");
assert(/^[a-f0-9]{64}$/.test(artworkCollectionReceipt.receipt.fileDigest), "作品集回执应记录文件摘要。");

const classroomReviewExport = window.MRAppState.getArtworkClassroomReviewExport();
assert(classroomReviewExport.ok, "课堂评阅表 HTML 应可基于本机作品生成。");
const classroomReviewReceipt = window.MRAppState.recordArtworkExportReceipt({
  exportType: "classroom-review",
  filename: classroomReviewExport.filename,
  content: classroomReviewExport.html,
  package: classroomReviewExport.package,
  packageId: classroomReviewExport.package.packageId
});
assert(classroomReviewReceipt.ok, "课堂评阅表导出应可写入作品导出回执。");
assert(classroomReviewReceipt.receipt.packageId === classroomReviewExport.package.packageId, "课堂评阅回执应记录评阅包 ID。");
assert(classroomReviewReceipt.receipt.artworkCount >= 3, "课堂评阅回执应记录待评阅作品数量。");

const summaryReceipt = window.MRAppState.recordArtworkExportReceipt({
  exportType: "classroom-review-summary",
  filename: "mr-calligraphy-classroom-review-summary-check.html",
  content: "<!doctype html><title>MR 课堂评阅汇总</title>",
  package: {
    kind: "mr-calligraphy-classroom-review-summary-v1",
    packageId: "classroom-summary-check",
    summary: {
      total: 2,
      digest: crypto.createHash("sha256").update("classroom-summary-check").digest("hex")
    },
    artworks: [
      { id: "artwork-1" },
      { id: "artwork-2" }
    ]
  },
  reviewCount: 2
});
assert(summaryReceipt.ok, "课堂评阅汇总导出应可写入作品导出回执。");
assert(summaryReceipt.receipt.reviewCount === 2, "课堂评阅汇总回执应记录评阅数量。");
assert(summaryReceipt.receipt.summaryDigest.match(/^[a-f0-9]{64}$/), "课堂评阅汇总回执应记录汇总摘要。");

const artworkExportAudit = window.MRAppState.getArtworkExportAudit({ limit: 6 });
assert(artworkExportAudit.kind === "mr-calligraphy-artwork-export-audit-v1", "作品导出审计应返回稳定 kind。");
assert(artworkExportAudit.total === 4, "作品导出审计应统计四类导出回执。");
assert(artworkExportAudit.typeCounts["artwork-repository-json"] === 1, "作品导出审计应统计作品仓库 JSON。");
assert(artworkExportAudit.typeCounts["artwork-collection"] === 1, "作品导出审计应统计作品集 HTML。");
assert(artworkExportAudit.typeCounts["classroom-review"] === 1, "作品导出审计应统计课堂评阅表。");
assert(artworkExportAudit.typeCounts["classroom-review-summary"] === 1, "作品导出审计应统计评阅汇总。");
assert(/^[a-f0-9]{64}$/.test(artworkExportAudit.auditDigest), "作品导出审计应包含稳定摘要。");
assert(artworkExportAudit.boundary.includes("不是操作系统保存完成证明"), "作品导出审计应说明本机边界。");
const artworkExportAuditExport = window.MRAppState.getArtworkExportAuditExport({ limit: 6 });
assert(artworkExportAuditExport.ok, "作品导出审计应可生成 HTML。");
assert(artworkExportAuditExport.filename.startsWith("mr-calligraphy-artwork-export-audit-"), "作品导出审计文件名应可识别。");
assert(artworkExportAuditExport.html.includes("MR 书法作品导出回执审计"), "作品导出审计 HTML 应包含标题。");
assert(artworkExportAuditExport.html.includes("作品仓库 JSON"), "作品导出审计 HTML 应包含作品仓库 JSON 类型。");
assert(artworkExportAuditExport.html.includes("作品集 HTML"), "作品导出审计 HTML 应包含作品集类型。");
assert(artworkExportAuditExport.html.includes("课堂评阅表"), "作品导出审计 HTML 应包含评阅表类型。");
assert(artworkExportAuditExport.html.includes("评阅汇总"), "作品导出审计 HTML 应包含汇总类型。");
assert(artworkExportAuditExport.html.includes(artworkExportAuditExport.audit.auditDigest), "作品导出审计 HTML 应包含审计摘要。");

const emptyShareStatus = window.MRAppState.getShareServiceStatus("artwork-2");
assert(emptyShareStatus.total === 0, "初始分享服务不应伪造已有链接。");
assert(emptyShareStatus.boundary.includes("不是公网 URL"), "分享服务应说明本机链接边界。");

const emptyVideoStatus = window.MRAppState.getPracticeVideoExportStatus({
  artworkId: "artwork-2",
  sessionId: "session-2"
});
assert(emptyVideoStatus.total === 0, "初始视频导出服务不应伪造已有记录。");
assert(emptyVideoStatus.boundary.includes("WebM"), "视频导出服务应说明 WebM 和本机记录边界。");

const queuedVideoJob = window.MRAppState.queuePracticeVideoExportJob({
  source: "最近作品",
  sourceId: "artwork-2",
  artworkId: "artwork-2",
  sessionId: "session-2",
  glyph: "永",
  title: "永字视频回放",
  strokeCount: 2,
  pointCount: 80
});
assert(queuedVideoJob.ok && queuedVideoJob.job.status === "queued", "视频导出应先写入本机队列任务。");

const runningVideoJob = window.MRAppState.startPracticeVideoExportJob(queuedVideoJob.job.id);
assert(runningVideoJob.ok && runningVideoJob.job.status === "running", "视频导出任务应能进入生成中状态。");

const videoRecord = window.MRAppState.recordPracticeVideoExport({
  jobId: queuedVideoJob.job.id,
  source: "最近作品",
  sourceId: "artwork-2",
  artworkId: "artwork-2",
  sessionId: "session-2",
  glyph: "永",
  title: "永字视频回放",
  videoFilename: "mr-calligraphy-replay-yong.webm",
  coverFilename: "mr-calligraphy-replay-cover-yong.png",
  mimeType: "video/webm",
  videoBytes: 4096,
  durationMs: 3600,
  strokeCount: 2,
  pointCount: 80,
  coverDataUrl: "data:image/png;base64,iVBORw0KGgo="
});
assert(videoRecord.ok, "视频导出成功后应能写入本机记录。");
assert(videoRecord.status.currentJob.status === "succeeded", "视频导出成功后队列任务应标为已完成。");
assert(videoRecord.record.coverFilename.endsWith(".png"), "视频导出记录应包含封面文件名。");
assert(videoRecord.record.videoSizeLabel === "4 KB", "视频导出记录应显示真实视频大小。");
assert(videoRecord.record.durationLabel.includes("秒"), "视频导出记录应显示导出时长。");

const videoStatus = window.MRAppState.getPracticeVideoExportStatus({
  artworkId: "artwork-2",
  sessionId: "session-2"
});
assert(videoStatus.total === 1, "视频导出服务应统计本机导出记录。");
assert(videoStatus.queueTotal === 1 && videoStatus.succeededCount === 1, "视频导出服务应统计本机队列完成数量。");
assert(videoStatus.currentRecord.coverDataUrl.startsWith("data:image/png"), "视频导出服务应保留封面数据。");
assert(videoStatus.message.includes("书写视频导出记录"), "视频导出服务应返回可读摘要。");

const failedVideoJob = window.MRAppState.queuePracticeVideoExportJob({
  source: "最近作品",
  sourceId: "artwork-2",
  artworkId: "artwork-2",
  sessionId: "session-2",
  glyph: "永",
  title: "失败后可重试的视频",
  strokeCount: 2,
  pointCount: 80
});
window.MRAppState.startPracticeVideoExportJob(failedVideoJob.job.id);
const failedVideo = window.MRAppState.recordPracticeVideoExportError("浏览器不支持 Canvas 视频录制。", {
  jobId: failedVideoJob.job.id,
  artworkId: "artwork-2",
  sessionId: "session-2",
  sourceId: "artwork-2"
});
assert(!failedVideo.ok && failedVideo.status.currentJob.status === "failed", "视频导出失败应写回队列任务。");
assert(failedVideo.status.currentJob.canRetry, "失败的视频导出任务应允许重试。");
const retrySource = window.MRAppState.getPracticeVideoRetrySource(failedVideoJob.job.id);
assert(retrySource.ok && retrySource.source.strokes.length, "失败任务应能找到原始笔迹用于重试。");
const retryJob = window.MRAppState.retryPracticeVideoExportJob(failedVideoJob.job.id);
assert(retryJob.ok && retryJob.job.retryOf === failedVideoJob.job.id, "重试应创建新的队列任务并关联原失败任务。");

const videoAudit = window.MRAppState.getPracticeVideoExportAudit();
assert(videoAudit.kind === "mr-calligraphy-video-export-audit-v1", "视频导出应生成本机回执审计包。");
assert(videoAudit.totalRecords === 1, "视频导出审计应统计 WebM 产物记录。");
assert(videoAudit.totalJobs === 3, "视频导出审计应统计原任务、失败任务和重试任务。");
assert(videoAudit.failedCount === 1 && videoAudit.retryCount === 1, "视频导出审计应统计失败和重试任务。");
assert(videoAudit.records[0].coverDataDigest, "视频导出审计应保存封面摘要而不是只留临时文案。");
assert(videoAudit.auditDigest && videoAudit.auditDigest.length === 64, "视频导出审计应包含稳定摘要。");
const videoAuditExport = window.MRAppState.getPracticeVideoExportAuditExport();
assert(videoAuditExport.ok, "视频导出审计应能导出 HTML。");
assert(videoAuditExport.filename.startsWith("mr-calligraphy-video-export-audit-"), "视频导出审计文件名应可识别。");
assert(videoAuditExport.html.includes("MR 书法视频导出回执审计"), "视频导出审计 HTML 应包含标题。");
assert(videoAuditExport.html.includes("mr-calligraphy-replay-yong.webm"), "视频导出审计 HTML 应包含真实 WebM 文件名。");
assert(videoAuditExport.html.includes("浏览器不支持 Canvas 视频录制"), "视频导出审计 HTML 应包含失败原因。");
assert(videoAuditExport.html.includes(failedVideoJob.job.id), "视频导出审计 HTML 应包含重试来源任务。");

const persistedVideoState = JSON.parse(storage.get("mr-calligraphy-learning-state-v1"));
assert(
  persistedVideoState.videoExportService.records[0].videoFilename === "mr-calligraphy-replay-yong.webm",
  "视频导出记录应持久化到 localStorage。"
);
assert(
  persistedVideoState.videoExportService.jobs.some((job) => job.status === "failed" && job.error.includes("浏览器不支持")),
  "视频导出失败任务应持久化错误原因。"
);

const shareLink = window.MRAppState.createArtworkShareLink("artwork-2", { expiresInDays: 3 });
assert(shareLink.ok, "作品应能生成本机分享链接记录。");
assert(shareLink.record.artworkId === "artwork-2", "分享记录应关联作品 ID。");
assert(shareLink.record.isActive, "新分享记录应处于有效状态。");
assert(shareLink.record.expiresAt, "分享记录应包含过期时间。");

const shareRemotePackage = window.MRAppState.getArtworkShareRemotePackage(shareLink.record.id);
assert(shareRemotePackage.ok, "有效分享链接应能生成远端分享包。");
assert(shareRemotePackage.package.kind === "mr-calligraphy-share-repository-v1", "远端分享包应包含稳定 kind。");
assert(shareRemotePackage.package.workspaceId === "local-browser", "远端分享包应包含默认 workspaceId。");
assert(shareRemotePackage.package.digestAlgorithm === "sha256-stable-json", "远端分享包应声明稳定摘要算法。");
assert(/^[a-f0-9]{64}$/.test(shareRemotePackage.package.packageDigest), "远端分享包应包含 64 位 packageDigest。");
assert(shareRemotePackage.package.records[0].id === shareLink.record.id, "远端分享包应包含分享记录。");
assert(shareRemotePackage.package.shares[0].html.includes("MR 书法作品分享"), "远端分享包应包含可发布 HTML。");
const invalidShareRemote = window.MRAppState.configureShareServiceRemote({
  remoteEndpoint: "ftp://example.test/share-repository"
});
assert(!invalidShareRemote.ok, "远端分享 API 不应接受非 HTTP 地址。");
const configuredShareRemote = window.MRAppState.configureShareServiceRemote({
  remoteEndpoint: "https://example.test/share-repository",
  remoteToken: "share-token",
  workspaceId: "share-alpha"
});
assert(configuredShareRemote.ok, "远端分享 API 配置应可保存 endpoint/token。");
const shareRemoteConfig = window.MRAppState.getShareServiceRemoteConfig();
assert(shareRemoteConfig.remoteEndpoint === "https://example.test/share-repository", "远端分享 API endpoint 应规范化并持久化。");
assert(shareRemoteConfig.remoteToken === "share-token", "远端分享 API token 应持久化。");
assert(shareRemoteConfig.workspaceId === "share-alpha", "远端分享 API workspace 应持久化。");

const reusedShareLink = window.MRAppState.createArtworkShareLink("artwork-2");
assert(reusedShareLink.reused, "同一作品已有有效链接时应复用记录。");
assert(reusedShareLink.record.id === shareLink.record.id, "复用分享链接不应制造重复记录。");

const copiedShare = window.MRAppState.markArtworkShareLinkCopied(shareLink.record.id);
assert(copiedShare.ok && copiedShare.record.copyCount === 1, "复制分享链接应记录复制次数。");

const openedShare = window.MRAppState.openArtworkShareLink(shareLink.record.id);
assert(openedShare.ok, "有效本机分享链接应能打开。");
assert(openedShare.record.viewCount === 1, "打开分享链接应记录访问次数。");
assert(openedShare.share.artwork.id === "artwork-2", "分享链接应返回对应作品分享包。");

let persistedShareState = JSON.parse(storage.get("mr-calligraphy-learning-state-v1"));
const persistedShare = persistedShareState.shareService.records.find((item) => item.id === shareLink.record.id);
assert(persistedShare.copyCount === 1 && persistedShare.viewCount === 1, "分享复制和访问次数应持久化。");

const revokedShare = window.MRAppState.revokeArtworkShareLink(shareLink.record.id);
assert(revokedShare.ok && revokedShare.record.status === "revoked", "分享链接应可撤销。");
const blockedShare = window.MRAppState.openArtworkShareLink(shareLink.record.id);
assert(!blockedShare.ok && blockedShare.message.includes("撤销"), "已撤销分享链接不应继续打开。");
const shareStatus = window.MRAppState.getShareServiceStatus("artwork-2");
assert(shareStatus.activeCount === 0 && shareStatus.revokedCount === 1, "分享服务状态应统计撤销记录。");

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
const reportComparisonExportReceipt = window.MRAppState.recordReportComparisonExportReceipt("report-2", {
  comparison: reportComparison,
  filename: reportComparisonExport.filename,
  content: reportComparisonExport.html,
  exportedAt: reportComparisonExport.exportedAt
});
assert(reportComparisonExportReceipt.ok, "报告对比导出应能写入本机回执。");
assert(reportComparisonExportReceipt.receipt.currentReportId === "report-2", "报告对比导出回执应保留本份报告 ID。");
assert(reportComparisonExportReceipt.receipt.previousReportId === "report-1", "报告对比导出回执应保留上份报告 ID。");
assert(reportComparisonExportReceipt.receipt.averageDelta === 10, "报告对比导出回执应保留平均分差值。");
assert(/^[a-f0-9]{64}$/.test(reportComparisonExportReceipt.receipt.fileDigest), "报告对比导出回执应包含文件摘要。");
const reportComparisonExportAudit = window.MRAppState.getReportComparisonExportAudit("report-2", { limit: 5 });
assert(reportComparisonExportAudit.kind === "mr-calligraphy-report-comparison-export-audit-v1", "报告对比导出审计应返回稳定 kind。");
assert(reportComparisonExportAudit.total === 1, "报告对比导出审计应统计当前报告回执。");
assert(reportComparisonExportAudit.positiveDeltaCount === 1, "报告对比导出审计应统计提升对比。");
assert(reportComparisonExportAudit.verifiedCount === 1, "报告对比导出审计应统计本机校验通过数量。");
assert(reportComparisonExportAudit.failedCount === 0, "报告对比导出正常回执不应出现摘要失败。");
assert(reportComparisonExportAudit.receipts[0].verificationStatus === "verified", "报告对比导出回执应通过本机 receiptDigest 重算校验。");
assert(reportComparisonExportAudit.receipts[0].verificationExpectedDigest === reportComparisonExportAudit.receipts[0].receiptDigest, "报告对比导出回执重算摘要应匹配 receiptDigest。");
assert(/^[a-f0-9]{64}$/.test(reportComparisonExportAudit.auditDigest), "报告对比导出审计应包含稳定摘要。");
assert(reportComparisonExportAudit.boundary.includes("不是云端长期报告"), "报告对比导出审计应说明本机边界。");
const reportComparisonExportAuditExport = window.MRAppState.getReportComparisonExportAuditExport("report-2", { limit: 5 });
assert(reportComparisonExportAuditExport.ok, "报告对比导出审计应可导出 HTML。");
assert(reportComparisonExportAuditExport.filename.startsWith("mr-calligraphy-report-comparison-export-audit-report-2-"), "报告对比导出审计文件名应可识别。");
assert(reportComparisonExportAuditExport.html.includes("MR 书法报告对比导出回执审计"), "报告对比导出审计 HTML 应包含标题。");
assert(reportComparisonExportAuditExport.html.includes("report-1") && reportComparisonExportAuditExport.html.includes("report-2"), "报告对比导出审计 HTML 应包含两份报告 ID。");
assert(reportComparisonExportAuditExport.html.includes(reportComparisonExportReceipt.receipt.receiptDigest), "报告对比导出审计 HTML 应包含回执摘要。");
assert(reportComparisonExportAuditExport.html.includes("本机校验通过"), "报告对比导出审计 HTML 应包含本机校验结果。");
assert(reportComparisonExportAuditExport.html.includes("重算摘要"), "报告对比导出审计 HTML 应包含重算摘要。");
assert(!window.MRAppState.getReportComparison("report-1").ok, "第一份报告不应伪造上一份对比。");

const reportPdfExport = window.MRAppState.getReportPdfExport("report-2");
assert(reportPdfExport.ok, "学习报告应能生成原生 PDF 导出。");
assert(reportPdfExport.filename.endsWith(".pdf"), "PDF 报告应返回 .pdf 文件名。");
assert(reportPdfExport.mimeType === "application/pdf", "PDF 报告应返回 application/pdf MIME。");
assert(reportPdfExport.pdf.startsWith("%PDF-1.4"), "PDF 报告内容应包含 PDF 文件头。");
assert(reportPdfExport.pdf.includes("mr-calligraphy-learning-state-v1"), "PDF 报告应包含本机数据来源。");
assert(reportPdfExport.features.metricBars, "PDF 报告应声明包含能力条形图。");
assert(reportPdfExport.features.metricCount === 5, "PDF 报告应包含五项能力条形图。");
assert(reportPdfExport.features.radarChart, "PDF 报告应声明包含能力雷达图。");
assert(reportPdfExport.features.radarMetricCount === 5, "PDF 报告应包含五项能力雷达图。");
assert(reportPdfExport.features.trendBars, "PDF 报告应声明包含分数趋势图。");
assert(reportPdfExport.features.trendCount === 4, "PDF 报告应按报告时间回填 4 条趋势记录。");
assert(reportPdfExport.features.artworkCard, "PDF 报告应声明包含最近作品卡片。");
assert(reportPdfExport.features.artworkAvailable, "PDF 报告应识别最近作品记录。");
assert(reportPdfExport.features.artworkImageAvailable, "PDF 报告应识别最近作品截图来源。");
assert(reportPdfExport.features.artworkImageEmbedded, "PDF 报告应把可用 JPEG 作品截图嵌入 PDF。");
assert(reportPdfExport.features.artworkImageMime === "image/jpeg", "PDF 报告应记录已嵌入截图 MIME。");
assert(reportPdfExport.features.scoreEvidenceSummary, "PDF 报告应声明包含评分证据摘要。");
assert(reportPdfExport.features.scoreEvidenceAlgorithm === "local-heuristic-v2.2.0", "PDF 报告应声明评分算法版本。");
assert(reportPdfExport.features.verification, "PDF 报告应声明包含本机验真摘要。");
assert(/^[a-f0-9]{64}$/.test(reportPdfExport.verification.digest), "PDF 报告验真摘要应为 64 位 SHA-256。");
assert(reportPdfExport.features.verificationDigest === reportPdfExport.verification.digest, "PDF feature 应暴露同一个验真摘要。");
assert(!reportPdfExport.features.teacherReview, "未批注报告不应伪造教师批注。");
assert(reportPdfExport.pdf.includes("MetricBars: 5"), "PDF 内容应包含能力条形图标记。");
assert(reportPdfExport.pdf.includes("RadarChart: 5"), "PDF 内容应包含能力雷达图标记。");
assert(reportPdfExport.pdf.includes("TrendBars: 4"), "PDF 内容应包含分数趋势图标记。");
assert(reportPdfExport.pdf.includes("ArtworkCard: yes"), "PDF 内容应包含作品卡片标记。");
assert(reportPdfExport.pdf.includes("ArtworkImageEmbedded: yes"), "PDF 内容应包含作品截图嵌入标记。");
assert(reportPdfExport.pdf.includes("ScoreEvidence: yes"), "PDF 内容应包含评分证据标记。");
assert(reportPdfExport.pdf.includes("ScoreEvidenceAlgorithm: local-heuristic-v2.2.0"), "PDF 内容应包含评分算法标记。");
assert(reportPdfExport.pdf.includes("/Subtype /Image"), "PDF 内容应包含图片 XObject。");
assert(reportPdfExport.pdf.includes("/DCTDecode"), "PDF 内容应使用 JPEG DCTDecode 图片流。");
assert(reportPdfExport.pdf.includes("ReportVerification: yes"), "PDF 内容应包含报告验真标记。");
assert(reportPdfExport.pdf.includes(`ReportDigest: ${reportPdfExport.verification.digest}`), "PDF 内容应包含报告验真摘要。");
assert(reportPdfExport.byteLength > 1000, "PDF 报告不应是空壳文件。");

const directReportVerification = window.MRAppState.getReportVerification("report-2");
assert(directReportVerification.ok, "报告验真摘要应可通过无副作用 API 重新计算。");
assert(directReportVerification.digest === reportPdfExport.verification.digest, "重新计算的报告摘要应与 PDF 导出一致。");

const emptyTeacherReview = window.MRAppState.updateReportTeacherReview("report-2", {
  reviewer: "王老师",
  note: ""
});
assert(!emptyTeacherReview.ok, "教师批注为空时不应写入报告。");

const teacherReview = window.MRAppState.updateReportTeacherReview("report-2", {
  reviewer: "王老师",
  role: "local-reviewer",
  note: "结构更稳，下一次重点放慢竖钩收笔。"
});
assert(teacherReview.ok, "报告教师批注应可写入本机状态。");
assert(teacherReview.teacherReview.reviewer === "王老师", "教师批注应保留批注人。");
assert(teacherReview.teacherReview.role === "local-reviewer", "教师批注应保留批注角色。");
assert(teacherReview.teacherReview.note.includes("竖钩"), "教师批注应保留批注内容。");
assert(/^[a-f0-9]{64}$/.test(teacherReview.teacherReview.reviewDigest), "教师批注应生成内容摘要。");
assert(/^[a-f0-9]{64}$/.test(teacherReview.teacherReview.localSignatureDigest), "教师批注应生成本机签名摘要。");
assert(teacherReview.auditRecord?.action === "save", "教师批注保存应生成审计记录。");
assert(/^[a-f0-9]{64}$/.test(teacherReview.auditRecord.nextDigest), "教师批注保存审计应包含后一摘要。");
assert(/^[a-f0-9]{64}$/.test(teacherReview.auditRecord.nextReviewDigest), "教师批注保存审计应包含后一批注摘要。");
assert(/^[a-f0-9]{64}$/.test(teacherReview.auditRecord.nextSignatureDigest), "教师批注保存审计应包含后一本机签名摘要。");

const teacherReviewAudit = window.MRAppState.getReportTeacherReviewAudit("report-2");
assert(teacherReviewAudit.ok && teacherReviewAudit.total === 1, "教师批注审计应可按报告查询。");
assert(teacherReviewAudit.records[0].reviewer === "王老师", "教师批注审计应保留批注人。");
assert(teacherReviewAudit.records[0].role === "local-reviewer", "教师批注审计应保留角色。");
assert(teacherReviewAudit.records[0].nextPreview.includes("竖钩"), "教师批注审计应保留批注预览。");
const teacherReviewAuditExport = window.MRAppState.getReportTeacherReviewAuditExport("report-2");
assert(teacherReviewAuditExport.ok, "教师批注审计应可导出 HTML。");
assert(teacherReviewAuditExport.html.includes("MR 书法教师批注审计"), "教师批注审计导出应包含标题。");
assert(teacherReviewAuditExport.html.includes("王老师") && teacherReviewAuditExport.html.includes("竖钩"), "教师批注审计导出应包含批注人和预览。");
assert(teacherReviewAuditExport.html.includes("教研审核") && teacherReviewAuditExport.html.includes("本机签名"), "教师批注审计导出应包含角色和本机签名。");

const reviewedDetail = window.MRAppState.getReportDetail("report-2");
assert(reviewedDetail.teacherReview.note.includes("结构更稳"), "报告详情应返回教师批注。");
assert(reviewedDetail.teacherReview.localSignatureDigest === teacherReview.teacherReview.localSignatureDigest, "报告详情应返回同一份本机签名摘要。");
assert(reviewedDetail.scoreEvidenceSummary.algorithmVersion === "local-heuristic-v2.2.0", "报告详情应返回评分证据摘要。");
assert(reviewedDetail.scoreEvidenceSummary.pointCount === 120, "报告详情评分证据应关联最近作品采样点。");

const reviewedHtml = window.MRAppState.getReportHtmlExport("report-2");
assert(reviewedHtml.ok, "报告 HTML 应可通过无副作用 API 生成。");
assert(reviewedHtml.features.scoreEvidenceSummary, "HTML 报告导出应声明包含评分证据摘要。");
assert(reviewedHtml.features.scoreEvidenceAlgorithm === "local-heuristic-v2.2.0", "HTML 报告导出应声明评分算法版本。");
assert(reviewedHtml.features.teacherReview, "HTML 报告导出应声明包含教师批注。");
assert(reviewedHtml.features.teacherReviewSignatureDigest === teacherReview.teacherReview.localSignatureDigest, "HTML 报告导出应声明教师批注本机签名摘要。");
assert(reviewedHtml.features.verification, "HTML 报告导出应声明包含本机验真摘要。");
assert(reviewedHtml.html.includes("教师批注") && reviewedHtml.html.includes("结构更稳"), "HTML 报告应包含教师批注内容。");
assert(reviewedHtml.html.includes("教研审核") && reviewedHtml.html.includes(teacherReview.teacherReview.localSignatureDigest.slice(0, 16)), "HTML 报告应包含教师角色和签名短码。");
assert(reviewedHtml.html.includes("本机验真摘要"), "HTML 报告应显示本机验真摘要。");
assert(reviewedHtml.html.includes("基础评分证据") && reviewedHtml.html.includes("路径"), "HTML 报告应显示评分证据摘要。");
assert(reviewedHtml.html.includes(reviewedHtml.verification.digest), "HTML 报告应包含验真摘要文本。");
assert(reviewedHtml.verification.digest !== reportPdfExport.verification.digest, "教师批注变更后报告摘要应随内容变化。");

const reviewedPdf = window.MRAppState.getReportPdfExport("report-2");
assert(reviewedPdf.features.teacherReview, "PDF 报告应声明包含教师批注。");
assert(reviewedPdf.features.scoreEvidenceSummary, "批注后的 PDF 报告应继续包含评分证据摘要。");
assert(reviewedPdf.features.teacherReviewSignatureDigest === teacherReview.teacherReview.localSignatureDigest, "PDF 报告应声明教师批注本机签名摘要。");
assert(reviewedPdf.features.verification, "批注后的 PDF 报告应继续包含本机验真摘要。");
assert(reviewedPdf.pdf.includes("TeacherReview: yes"), "PDF 内容应包含教师批注标记。");
assert(reviewedPdf.pdf.includes(`TeacherReviewSignatureDigest: ${teacherReview.teacherReview.localSignatureDigest}`), "PDF 内容应包含教师批注本机签名摘要。");
assert(reviewedPdf.pdf.includes(`ReportDigest: ${reviewedHtml.verification.digest}`), "批注后的 PDF 摘要应与 HTML 导出一致。");
const reportHtmlExportReceipt = window.MRAppState.recordReportExportReceipt("report-2", {
  exportType: "report-html",
  filename: reviewedHtml.filename,
  mimeType: reviewedHtml.mimeType,
  content: reviewedHtml.html,
  reportDigest: reviewedHtml.verification.digest,
  features: reviewedHtml.features
});
assert(reportHtmlExportReceipt.ok, "报告 HTML 下载应能写入报告导出回执。");
assert(reportHtmlExportReceipt.receipt.exportType === "report-html", "报告 HTML 回执应记录导出类型。");
assert(reportHtmlExportReceipt.receipt.fileDigest.match(/^[a-f0-9]{64}$/), "报告 HTML 回执应包含文件摘要。");
assert(reportHtmlExportReceipt.receipt.reportDigest === reviewedHtml.verification.digest, "报告 HTML 回执应记录报告验真摘要。");
const reportPdfExportReceipt = window.MRAppState.recordReportExportReceipt("report-2", {
  exportType: "report-pdf",
  filename: reviewedPdf.filename,
  mimeType: reviewedPdf.mimeType,
  content: reviewedPdf.pdf,
  byteLength: reviewedPdf.byteLength,
  reportDigest: reviewedPdf.verification.digest,
  features: reviewedPdf.features
});
assert(reportPdfExportReceipt.ok, "报告 PDF 下载应能写入报告导出回执。");
assert(reportPdfExportReceipt.receipt.exportType === "report-pdf", "报告 PDF 回执应记录导出类型。");
assert(reportPdfExportReceipt.receipt.fileDigest.match(/^[a-f0-9]{64}$/), "报告 PDF 回执应包含文件摘要。");
assert(reportPdfExportReceipt.receipt.reportDigest === reviewedPdf.verification.digest, "报告 PDF 回执应记录报告验真摘要。");
const reportExportAudit = window.MRAppState.getReportExportAudit("report-2", { limit: 5 });
assert(reportExportAudit.kind === "mr-calligraphy-report-export-audit-v1", "报告导出审计应返回稳定 kind。");
assert(reportExportAudit.total === 2, "报告导出审计应统计 HTML 和 PDF 两条回执。");
assert(reportExportAudit.typeCounts["report-html"] === 1, "报告导出审计应统计 HTML。");
assert(reportExportAudit.typeCounts["report-pdf"] === 1, "报告导出审计应统计 PDF。");
assert(reportExportAudit.verifiedCount === 2, "报告导出审计应统计本机校验通过数量。");
assert(reportExportAudit.failedCount === 0, "报告导出审计正常回执不应出现摘要失败。");
assert(reportExportAudit.receipts[0].verificationStatus === "verified", "报告导出回执应通过本机 receiptDigest 重算校验。");
assert(reportExportAudit.receipts[0].verificationExpectedDigest === reportExportAudit.receipts[0].receiptDigest, "报告导出回执重算摘要应匹配 receiptDigest。");
assert(/^[a-f0-9]{64}$/.test(reportExportAudit.auditDigest), "报告导出审计应包含稳定摘要。");
assert(reportExportAudit.boundary.includes("不是操作系统保存完成证明"), "报告导出审计应说明本机边界。");
const reportExportAuditExport = window.MRAppState.getReportExportAuditExport("report-2", { limit: 5 });
assert(reportExportAuditExport.ok, "报告导出审计应可导出 HTML。");
assert(reportExportAuditExport.filename.startsWith("mr-calligraphy-report-export-audit-report-2-"), "报告导出审计文件名应可识别。");
assert(reportExportAuditExport.html.includes("MR 书法报告导出回执审计"), "报告导出审计 HTML 应包含标题。");
assert(reportExportAuditExport.html.includes("报告 HTML"), "报告导出审计 HTML 应包含 HTML 类型。");
assert(reportExportAuditExport.html.includes("原生 PDF"), "报告导出审计 HTML 应包含 PDF 类型。");
assert(reportExportAuditExport.html.includes(reportExportAuditExport.audit.auditDigest), "报告导出审计 HTML 应包含审计摘要。");
assert(reportExportAuditExport.html.includes("本机校验通过"), "报告导出审计 HTML 应包含本机校验结果。");
assert(reportExportAuditExport.html.includes("重算摘要"), "报告导出审计 HTML 应包含重算摘要。");

const reportRepositoryStatus = window.MRAppState.getReportRepositoryStatus();
assert(reportRepositoryStatus.ok && reportRepositoryStatus.reportCount >= 3, "报告 repository 应统计本机报告数量。");
assert(!reportRepositoryStatus.remoteConfigured, "未配置远端时不应伪造云端报告仓库。");
assert(reportRepositoryStatus.workspaceId === "local-browser", "报告 repository 未配置远端时应使用默认 workspace。");
assert(reportRepositoryStatus.boundary.includes("不包含账号化教师端"), "报告 repository 应说明远端 adapter 边界。");
const reportRepositoryPackage = window.MRAppState.getReportRepositoryPackage();
assert(reportRepositoryPackage.ok, "报告 repository 应能生成 JSON 同步包。");
assert(typeof window.MRAppState.downloadReportRepository === "function", "报告 repository 应提供本机 JSON 同步包下载 API。");
assert(reportRepositoryPackage.package.kind === "mr-calligraphy-report-repository-v1", "报告同步包应包含稳定 kind。");
assert(reportRepositoryPackage.package.workspaceId === "local-browser", "报告同步包应包含默认 workspaceId。");
assert(reportRepositoryPackage.package.source.workspaceId === "local-browser", "报告同步包 source 应包含默认 workspaceId。");
assert(reportRepositoryPackage.package.digestAlgorithm === "sha256-stable-json", "报告同步包应声明稳定 JSON 摘要算法。");
assert(/^[a-f0-9]{64}$/.test(reportRepositoryPackage.package.packageDigest), "报告同步包应包含 64 位 packageDigest。");
assert(reportRepositoryPackage.package.reports.length >= 3, "报告同步包应包含本机报告列表。");
assert(reportRepositoryPackage.package.verifications.length === reportRepositoryPackage.package.reports.length, "报告同步包应为每份报告生成验真摘要。");
assert(reportRepositoryPackage.package.summary.teacherReviewedReportCount === 1, "报告同步包应统计带教师批注报告数量。");
assert(reportRepositoryPackage.package.summary.verifiedReportCount === reportRepositoryPackage.package.reports.length, "报告同步包应统计验真报告数量。");
const reviewedReportPackage = reportRepositoryPackage.package.reports.find((item) => item.id === "report-2");
assert(reviewedReportPackage.teacherReview.note.includes("竖钩"), "报告同步包应保留教师批注内容。");
const reviewedReportVerificationPackage = reportRepositoryPackage.package.verifications.find((item) => item.reportId === "report-2");
assert(reviewedReportVerificationPackage.digest === reviewedHtml.verification.digest, "报告同步包应保留批注后的验真摘要。");
const reportRepositoryPackageJson = JSON.stringify(reportRepositoryPackage.package, null, 2);
const reportRepositoryExportReceipt = window.MRAppState.recordReportRepositoryExportReceipt({
  filename: reportRepositoryPackage.filename,
  package: reportRepositoryPackage.package,
  content: reportRepositoryPackageJson,
  exportedAt: reportRepositoryPackage.package.exportedAt
});
assert(reportRepositoryExportReceipt.ok, "报告仓库 JSON 同步包导出应能记录本机回执。");
assert(reportRepositoryExportReceipt.receipt.kind === "mr-calligraphy-report-repository-export-audit-v1", "报告仓库导出回执应返回稳定 kind。");
assert(reportRepositoryExportReceipt.receipt.reportCount === reportRepositoryPackage.package.summary.total, "报告仓库导出回执应记录报告数量。");
assert(reportRepositoryExportReceipt.receipt.teacherReviewedReportCount === reportRepositoryPackage.package.summary.teacherReviewedReportCount, "报告仓库导出回执应记录教师批注报告数量。");
assert(reportRepositoryExportReceipt.receipt.verifiedReportCount === reportRepositoryPackage.package.summary.verifiedReportCount, "报告仓库导出回执应记录验真数量。");
assert(reportRepositoryExportReceipt.receipt.packageDigest === reportRepositoryPackage.package.packageDigest, "报告仓库导出回执应记录包摘要。");
assert(reportRepositoryExportReceipt.receipt.fileDigest === crypto.createHash("sha256").update(reportRepositoryPackageJson).digest("hex"), "报告仓库导出回执应记录 JSON 文件摘要。");
assert(reportRepositoryExportReceipt.receipt.receiptDigest.match(/^[a-f0-9]{64}$/), "报告仓库导出回执应包含回执摘要。");
assert(reportRepositoryExportReceipt.receipt.boundary.includes("不是云端报告仓库日志"), "报告仓库导出回执应说明本机边界。");
const reportRepositoryExportAudit = window.MRAppState.getReportRepositoryExportAudit({ limit: 5 });
assert(reportRepositoryExportAudit.kind === "mr-calligraphy-report-repository-export-audit-v1", "报告仓库导出审计应返回稳定 kind。");
assert(reportRepositoryExportAudit.total === 1, "报告仓库导出审计应统计同步包导出回执。");
assert(reportRepositoryExportAudit.latestReceipt.packageDigest === reportRepositoryPackage.package.packageDigest, "报告仓库导出审计应保留最近包摘要。");
assert(/^[a-f0-9]{64}$/.test(reportRepositoryExportAudit.auditDigest), "报告仓库导出审计应包含稳定摘要。");
const reportRepositoryExportAuditExport = window.MRAppState.getReportRepositoryExportAuditExport({ limit: 5 });
assert(reportRepositoryExportAuditExport.ok, "报告仓库导出审计应可导出 HTML。");
assert(reportRepositoryExportAuditExport.filename.startsWith("mr-calligraphy-report-repository-export-audit-"), "报告仓库导出审计文件名应可识别。");
assert(reportRepositoryExportAuditExport.html.includes("MR 书法报告仓库导出回执审计"), "报告仓库导出审计 HTML 应包含标题。");
assert(reportRepositoryExportAuditExport.html.includes(reportRepositoryPackage.package.packageDigest), "报告仓库导出审计 HTML 应包含包摘要。");
assert(reportRepositoryExportAuditExport.html.includes(reportRepositoryExportAuditExport.audit.auditDigest), "报告仓库导出审计 HTML 应包含审计摘要。");

const persistedReviewedState = JSON.parse(storage.get("mr-calligraphy-learning-state-v1"));
const persistedReviewedReport = persistedReviewedState.reports.find((item) => item.id === "report-2");
assert(persistedReviewedReport.teacherReview.note.includes("竖钩"), "教师批注应持久化到 localStorage。");

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

const practiceScoreEvidence = window.MRAppState.recordPracticeResult(createPracticeResult());
assert(practiceScoreEvidence.ok, "带评分证据的练习结果应可写入本机状态。");
assert(practiceScoreEvidence.practice.scoreEvidence.label === "基础练习评分", "练习结果应保留基础评分类型。");
assert(practiceScoreEvidence.practice.scoreEvidence.algorithmVersion === "local-heuristic-v2.2.0", "练习结果应保留评分算法版本。");
assert(practiceScoreEvidence.practice.scoreEvidence.copybook === "永字八法", "练习结果应保留范字来源。");
assert(practiceScoreEvidence.practice.scoreEvidence.evidence.targetStrokeNames.includes("侧点"), "练习结果应保留范字笔顺。");
assert(practiceScoreEvidence.practice.scoreEvidence.evidence.strokeOrderMatchPercent === 67, "练习结果应保留逐笔匹配率。");
assert(practiceScoreEvidence.practice.scoreEvidence.evidence.strokeOrderCoveragePercent === 25, "练习结果应保留目标笔顺覆盖率。");
assert(practiceScoreEvidence.practice.scoreEvidence.evidence.strokeMatches.length === 3, "练习结果应保留逐笔匹配列表。");
assert(practiceScoreEvidence.practice.scoreEvidence.evidence.strokeOrderWarnings.includes("缺少目标笔画 5 笔"), "练习结果应保留笔顺提醒。");
assert(practiceScoreEvidence.practice.scoreEvidence.evidence.pathFitPercent === 72, "练习结果应保留路径贴合率。");
assert(practiceScoreEvidence.practice.scoreEvidence.evidence.pathErrorHotspots[0].label === "中上中右区", "练习结果应保留路径误差热力区。");
assert(practiceScoreEvidence.practice.scoreEvidence.evidence.strokePathErrors.length === 3, "练习结果应保留逐笔路径误差。");
assert(practiceScoreEvidence.practice.scoreEvidence.evidence.coveragePercent === 58, "练习结果应保留覆盖范围证据。");
assert(practiceScoreEvidence.practice.scoreEvidence.evidence.pressurePointCount === 4, "练习结果应保留压感采样点数。");
assert(
  practiceScoreEvidence.practice.scoreEvidence.reasons.some((reason) => reason.key === "structure" && reason.evidence.includes("重心")),
  "练习结果应保留结构评分解释。"
);
const stateAfterPractice = window.MRAppState.getState();
assert(stateAfterPractice.sessions.at(-1).scoreEvidence.reasons.length === 5, "练习会话应持久化五项评分理由。");
const scoreServiceAfterPractice = window.MRAppState.getScoreServiceStatus();
assert(scoreServiceAfterPractice.status === "scored", "评分服务应记录已评分状态。");
assert(scoreServiceAfterPractice.lastScore === 78, "评分服务应记录最近一次真实练习分数。");
assert(scoreServiceAfterPractice.algorithmVersion === "local-heuristic-v2.2.0", "评分服务应记录最近算法版本。");
assert(scoreServiceAfterPractice.scoredSessionCount === 4, "评分服务应累计新增评分次数。");
assert(scoreServiceAfterPractice.totalPointCount === 287, "评分服务应累计新增采样点。");
assert(scoreServiceAfterPractice.lastEvidenceSummary.includes("覆盖58%"), "评分服务应摘要最近一次证据。");
assert(scoreServiceAfterPractice.lastEvidenceSummary.includes("范字永字八法"), "评分服务摘要应包含范字来源。");
assert(scoreServiceAfterPractice.lastEvidenceSummary.includes("笔顺匹配67%"), "评分服务摘要应包含逐笔匹配率。");
assert(scoreServiceAfterPractice.lastEvidenceSummary.includes("路径贴合72%"), "评分服务摘要应包含路径贴合率。");
assert(scoreServiceAfterPractice.lastEvidenceSummary.includes("压感4点"), "评分服务摘要应包含压感采样。");
const reviewEvidenceExport = window.MRAppState.getReviewEvidenceExport();
assert(reviewEvidenceExport.ok, "复盘证据页应可从最新评分证据生成。");
assert(reviewEvidenceExport.filename.includes("mr-calligraphy-review-evidence"), "复盘证据页应返回稳定文件名。");
assert(reviewEvidenceExport.evidencePackage.kind === "mr-calligraphy-review-evidence-v1", "复盘证据页应返回稳定 kind。");
assert(reviewEvidenceExport.evidencePackage.features.heatmap, "复盘证据页应声明包含路径热力。");
assert(reviewEvidenceExport.html.includes("MR 书法复盘证据"), "复盘证据页 HTML 应包含标题。");
assert(reviewEvidenceExport.html.includes("路径误差热力") && reviewEvidenceExport.html.includes("逐笔路径贴合"), "复盘证据页 HTML 应包含热力和逐笔路径证据。");
assert(reviewEvidenceExport.html.includes("local-heuristic-v2.2.0"), "复盘证据页 HTML 应包含评分算法版本。");
const evidenceArtwork = window.MRAppState.saveArtwork();
assert(evidenceArtwork.ok, "带评分证据的当前练习应可保存为作品。");
const evidenceSharePackage = window.MRAppState.getArtworkSharePackage(evidenceArtwork.artwork.id);
assert(evidenceSharePackage.ok, "带评分证据的作品分享页应能生成。");
assert(evidenceSharePackage.share.features.scoreEvidence, "带评分证据的作品分享包应声明包含评分证据。");
assert(evidenceSharePackage.share.features.heatmap, "带评分证据的作品分享包应声明包含路径热力。");
assert(evidenceSharePackage.share.scoreEvidence.algorithmVersion === "local-heuristic-v2.2.0", "作品分享包应保留评分算法版本。");
assert(evidenceSharePackage.html.includes("评分证据"), "带评分证据的作品分享页 HTML 应包含评分证据区。");
assert(evidenceSharePackage.html.includes("路径误差热力"), "带评分证据的作品分享页 HTML 应包含路径热力。");
assert(evidenceSharePackage.html.includes("逐笔路径贴合"), "带评分证据的作品分享页 HTML 应包含逐笔路径贴合。");
assert(evidenceSharePackage.html.includes("逐笔轨迹匹配"), "带评分证据的作品分享页 HTML 应包含逐笔轨迹匹配。");
assert(evidenceSharePackage.message.includes("评分证据"), "带评分证据的作品分享页消息应提示包含证据。");
const reviewImageReceipt = window.MRAppState.recordReviewExportReceipt({
  exportType: "artwork-image",
  sourceType: "artwork",
  sourceId: evidenceArtwork.artwork.id,
  sourceTitle: evidenceArtwork.artwork.title,
  artworkId: evidenceArtwork.artwork.id,
  glyph: evidenceArtwork.artwork.glyph,
  score: evidenceArtwork.artwork.score,
  strokeCount: evidenceArtwork.artwork.strokeCount,
  pointCount: evidenceArtwork.artwork.pointCount,
  filename: "mr-calligraphy-review-image.jpg",
  mimeType: "image/jpeg",
  dataUrl: "data:image/jpeg;base64,cmV2aWV3LWltYWdl"
});
assert(reviewImageReceipt.ok, "作品图片导出应能写入复盘导出回执。");
assert(reviewImageReceipt.receipt.exportType === "artwork-image", "作品图片回执应记录导出类型。");
assert(reviewImageReceipt.receipt.fileDigest.match(/^[a-f0-9]{64}$/), "作品图片回执应包含文件摘要。");
const reviewEvidenceReceipt = window.MRAppState.recordReviewExportReceipt({
  exportType: "review-evidence",
  sourceType: reviewEvidenceExport.evidencePackage.sourceType,
  sourceId: reviewEvidenceExport.evidencePackage.sourceId,
  sourceTitle: evidenceArtwork.artwork.title,
  artworkId: evidenceArtwork.artwork.id,
  sessionId: reviewEvidenceExport.evidencePackage.session?.id || "",
  filename: reviewEvidenceExport.filename,
  mimeType: "text/html;charset=utf-8",
  content: reviewEvidenceExport.html
});
assert(reviewEvidenceReceipt.ok, "复盘证据页导出应能写入回执。");
const reviewShareReceipt = window.MRAppState.recordReviewExportReceipt({
  exportType: "share-html",
  sourceType: "artwork",
  sourceId: evidenceArtwork.artwork.id,
  sourceTitle: evidenceArtwork.artwork.title,
  artworkId: evidenceArtwork.artwork.id,
  filename: evidenceSharePackage.filename,
  mimeType: "text/html;charset=utf-8",
  content: evidenceSharePackage.html
});
assert(reviewShareReceipt.ok, "作品分享页导出应能写入复盘导出回执。");
const reviewReportReceipt = window.MRAppState.recordReviewExportReceipt({
  exportType: "report-html",
  sourceType: "report",
  sourceId: "report-2",
  sourceTitle: "学习报告",
  reportId: "report-2",
  filename: reviewedHtml.filename,
  mimeType: reviewedHtml.mimeType,
  content: reviewedHtml.html,
  score: reviewedHtml.report.averageScore
});
assert(reviewReportReceipt.ok, "学习报告 HTML 导出应能写入复盘导出回执。");
const reviewExportAudit = window.MRAppState.getReviewExportAudit({ limit: 6 });
assert(reviewExportAudit.kind === "mr-calligraphy-review-export-audit-v1", "复盘导出审计应返回稳定 kind。");
assert(reviewExportAudit.total === 4, "复盘导出审计应统计四类导出回执。");
assert(reviewExportAudit.typeCounts["artwork-image"] === 1, "复盘导出审计应统计作品图片。");
assert(reviewExportAudit.typeCounts["review-evidence"] === 1, "复盘导出审计应统计复盘证据。");
assert(reviewExportAudit.typeCounts["share-html"] === 1, "复盘导出审计应统计分享页。");
assert(reviewExportAudit.typeCounts["report-html"] === 1, "复盘导出审计应统计报告 HTML。");
assert(reviewExportAudit.verifiedCount === 4, "复盘导出回执应通过本机 receiptDigest 重算校验。");
assert(reviewExportAudit.failedCount === 0, "复盘导出回执不应出现摘要不匹配。");
assert(reviewExportAudit.receipts.every((receipt) => receipt.verificationStatus === "verified"), "复盘导出回执列表应标记为本机校验通过。");
assert(reviewExportAudit.receipts.every((receipt) => receipt.verificationExpectedDigest === receipt.receiptDigest), "复盘导出回执重算摘要应匹配 receiptDigest。");
assert(/^[a-f0-9]{64}$/.test(reviewExportAudit.auditDigest), "复盘导出审计应包含稳定摘要。");
assert(reviewExportAudit.boundary.includes("不是云端下载日志"), "复盘导出审计应说明本机边界。");
const reviewExportAuditExport = window.MRAppState.getReviewExportAuditExport({ limit: 6 });
assert(reviewExportAuditExport.ok, "复盘导出审计应可导出 HTML。");
assert(reviewExportAuditExport.filename.startsWith("mr-calligraphy-review-export-audit-"), "复盘导出审计文件名应可识别。");
assert(reviewExportAuditExport.html.includes("MR 书法复盘导出回执审计"), "复盘导出审计 HTML 应包含标题。");
assert(reviewExportAuditExport.html.includes("作品图片"), "复盘导出审计 HTML 应包含作品图片类型。");
assert(reviewExportAuditExport.html.includes("复盘证据 HTML"), "复盘导出审计 HTML 应包含复盘证据类型。");
assert(reviewExportAuditExport.html.includes("作品分享页 HTML"), "复盘导出审计 HTML 应包含分享页类型。");
assert(reviewExportAuditExport.html.includes("学习报告 HTML"), "复盘导出审计 HTML 应包含报告类型。");
assert(reviewExportAuditExport.html.includes("本机校验通过"), "复盘导出审计 HTML 应包含本机校验状态。");
assert(reviewExportAuditExport.html.includes("重算摘要"), "复盘导出审计 HTML 应包含重算摘要。");
assert(reviewExportAuditExport.html.includes(reviewExportAuditExport.audit.auditDigest), "复盘导出审计 HTML 应包含审计摘要。");
const historyDetailImageReceipt = window.MRAppState.recordHistoryDetailActionReceipt({
  actionType: "image-download",
  recordType: "artwork",
  recordId: evidenceArtwork.artwork.id,
  recordTitle: evidenceArtwork.artwork.title,
  artworkId: evidenceArtwork.artwork.id,
  filename: "mr-calligraphy-history-detail-image.jpg",
  mimeType: "image/jpeg",
  dataUrl: "data:image/jpeg;base64,aGlzdG9yeS1kZXRhaWwtaW1hZ2U="
});
assert(historyDetailImageReceipt.ok, "学习档案详情图片下载应能写入回执。");
assert(historyDetailImageReceipt.receipt.actionType === "image-download", "详情图片回执应记录操作类型。");
assert(historyDetailImageReceipt.receipt.artifactDigest.match(/^[a-f0-9]{64}$/), "详情图片回执应包含文件摘要。");
const historyDetailReportReceipt = window.MRAppState.recordHistoryDetailActionReceipt({
  actionType: "report-download",
  recordType: "report",
  recordId: reviewedHtml.report.id,
  recordTitle: reviewedHtml.report.title,
  reportId: reviewedHtml.report.id,
  filename: reviewedHtml.filename,
  mimeType: reviewedHtml.mimeType,
  content: reviewedHtml.html
});
assert(historyDetailReportReceipt.ok, "学习档案详情报告下载应能写入回执。");
const historyDetailLinkReceipt = window.MRAppState.recordHistoryDetailActionReceipt({
  actionType: "link-copy",
  recordType: "artwork",
  recordId: evidenceArtwork.artwork.id,
  recordTitle: evidenceArtwork.artwork.title,
  url: `http://localhost:41496/?artwork=${evidenceArtwork.artwork.id}`,
  copyStatus: "clipboard",
  copySucceeded: true
});
assert(historyDetailLinkReceipt.ok, "学习档案详情链接复制应能写入回执。");
const historyDetailActionAudit = window.MRAppState.getHistoryDetailActionAudit({ limit: 6 });
assert(historyDetailActionAudit.kind === "mr-calligraphy-history-detail-action-audit-v1", "详情操作审计应返回稳定 kind。");
assert(historyDetailActionAudit.total === 3, "详情操作审计应统计三类操作回执。");
assert(historyDetailActionAudit.actionCounts["image-download"] === 1, "详情操作审计应统计图片下载。");
assert(historyDetailActionAudit.actionCounts["report-download"] === 1, "详情操作审计应统计报告下载。");
assert(historyDetailActionAudit.actionCounts["link-copy"] === 1, "详情操作审计应统计链接复制。");
assert(historyDetailActionAudit.verifiedCount === 3, "详情操作回执应通过本机 receiptDigest 重算校验。");
assert(historyDetailActionAudit.failedCount === 0, "详情操作回执不应出现摘要不匹配。");
assert(historyDetailActionAudit.receipts.every((receipt) => receipt.verificationStatus === "verified"), "详情操作回执列表应标记为本机校验通过。");
assert(historyDetailActionAudit.receipts.every((receipt) => receipt.verificationExpectedDigest === receipt.receiptDigest), "详情操作回执重算摘要应匹配 receiptDigest。");
assert(/^[a-f0-9]{64}$/.test(historyDetailActionAudit.auditDigest), "详情操作审计应包含稳定摘要。");
assert(historyDetailActionAudit.boundary.includes("不是云端访问日志"), "详情操作审计应说明本机边界。");
const historyDetailScopedAudit = window.MRAppState.getHistoryDetailActionAudit({ recordId: evidenceArtwork.artwork.id, limit: 6 });
assert(historyDetailScopedAudit.total === 2, "按作品记录过滤时应只返回该详情的两条回执。");
assert(historyDetailScopedAudit.verifiedCount === 2, "按作品过滤的详情操作回执应保留本机校验统计。");
const historyDetailActionAuditExport = window.MRAppState.getHistoryDetailActionAuditExport({ limit: 6 });
assert(historyDetailActionAuditExport.ok, "详情操作审计应可导出 HTML。");
assert(historyDetailActionAuditExport.filename.startsWith("mr-calligraphy-history-detail-action-audit-"), "详情操作审计文件名应可识别。");
assert(historyDetailActionAuditExport.html.includes("MR 书法学习档案详情操作回执审计"), "详情操作审计 HTML 应包含标题。");
assert(historyDetailActionAuditExport.html.includes("详情图片下载"), "详情操作审计 HTML 应包含图片下载类型。");
assert(historyDetailActionAuditExport.html.includes("详情报告 HTML 下载"), "详情操作审计 HTML 应包含报告下载类型。");
assert(historyDetailActionAuditExport.html.includes("详情直达链接复制"), "详情操作审计 HTML 应包含链接复制类型。");
assert(historyDetailActionAuditExport.html.includes("本机校验通过"), "详情操作审计 HTML 应包含本机校验状态。");
assert(historyDetailActionAuditExport.html.includes("重算摘要"), "详情操作审计 HTML 应包含重算摘要。");
assert(historyDetailActionAuditExport.html.includes(historyDetailActionAuditExport.audit.auditDigest), "详情操作审计 HTML 应包含审计摘要。");
assert(scoreServiceAfterPractice.message.includes("累计评分 4 次"), "评分服务状态消息应显示累计评分次数。");
assert(scoreServiceAfterPractice.message.includes("local-heuristic-v2.2.0"), "评分服务状态消息应显示算法版本。");
const persistedScoreService = JSON.parse(storage.get("mr-calligraphy-learning-state-v1")).scoreService;
assert(persistedScoreService.lastScore === 78, "评分服务状态应持久化最近分数。");
assert(persistedScoreService.algorithmVersion === "local-heuristic-v2.2.0", "评分服务状态应持久化算法版本。");
assert(persistedScoreService.lastEvidenceSummary.includes("覆盖58%"), "评分服务证据摘要应持久化。");

const lockedLibraryBeforeStages = window.MRAppState.getTaskLibrary("single");
const lockedRenBeforeStages = lockedLibraryBeforeStages.tasks.find((item) => item.id === "single-ren-structure");
assert(lockedRenBeforeStages.locked, "前置任务未完成时，后续单字任务应显示锁定。");
assert(lockedRenBeforeStages.dependencyStatus.reason.includes("前置任务"), "锁定任务应返回前置任务原因。");

const deniedRenBeforeStages = window.MRAppState.selectTask("single-ren-structure");
assert(!deniedRenBeforeStages.ok && deniedRenBeforeStages.locked, "前置任务未完成时不应允许选择后续任务。");

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
assert(taskProgress.complete, "满足阶段、练习、作品和报告条件后，当前任务应标记完成。");

const learningPathAfterStages = window.MRAppState.getLearningPathStatus();
assert(learningPathAfterStages.steps[4].done, "记录笔画拆解后，路径拆解步骤应完成。");
assert(learningPathAfterStages.steps[5].done, "已有作品后，路径创作步骤应完成。");
assert(learningPathAfterStages.steps[9].done, "当前任务完成后，路径复习巩固步骤应完成。");
assert(learningPathAfterStages.doneCount > initialLearningPath.doneCount, "阶段记录写入后，路径完成数应增加。");
assert(learningPathAfterStages.steps[9].nextActionLabel === "选择日课字", "当前任务完成后，复习巩固步骤应指向下一个日课任务。");

const unlockedRenAfterStages = window.MRAppState.getTaskProgress("single-ren-structure");
assert(!unlockedRenAfterStages.locked, "前置任务完成后，下一单字任务应解锁。");
assert(unlockedRenAfterStages.dependencyStatus.dependencies[0].done, "解锁任务应标记前置任务已完成。");

const deniedHeAfterStages = window.MRAppState.selectTask("single-he-balance");
assert(!deniedHeAfterStages.ok && deniedHeAfterStages.locked, "中间任务未完成时，挑战任务仍应锁定。");

const selectedRenAfterStages = window.MRAppState.selectTask("single-ren-structure");
assert(selectedRenAfterStages.ok, "已解锁任务应允许选择。");
const selectedBackToYong = window.MRAppState.selectTask("single-yong-basic");
assert(selectedBackToYong.ok, "无前置的基础任务应可重新选择。");

const statsWithStages = window.MRAppState.getStats();
assert(statsWithStages.stageRecordCount === 3, "学习统计应返回阶段记录数量。");
assert(statsWithStages.stageProgress.done === 3, "学习统计应返回当前任务阶段进度。");

const planResult = window.MRAppState.createPlan();
assert(planResult.ok, "学习计划应能基于本机状态生成。");
const latestPlan = window.MRAppState.getLatestPlan();
assert(latestPlan.items.length === 5, "自动学习计划应生成 5 个任务项。");
assert(latestPlan.reminderSummary.total === 5, "学习计划应返回提醒汇总。");
assert(latestPlan.dependencyGraph.nodes.length === 5, "学习计划应生成任务依赖图节点。");
assert(latestPlan.dependencyGraph.edges.length === 4, "自动学习计划应生成连续依赖边。");
assert(latestPlan.cycleStatus.cycleIndex === 1, "自动学习计划应从第 1 轮开始。");
assert(!latestPlan.cycleStatus.canCreateNext, "计划未完成时不应允许生成下周期。");
const focusDependencyNode = latestPlan.dependencyGraph.nodes.find((item) => item.id === "plan-task-focus");
assert(focusDependencyNode.dependsOn.includes("plan-practice"), "任务重点计划项应依赖首次临摹。");
assert(focusDependencyNode.status === "blocked", "前置临摹未完成时后续计划项应被依赖阻塞。");
assert(
  latestPlan.items.every((item) => item.dueAt && item.remindAt && item.reviewAction && item.reminder),
  "学习计划项应包含到期、提醒、复盘动作和派生提醒状态。"
);

const unsupportedReminderService = window.MRAppState.getPlanReminderServiceStatus(latestPlan.id);
assert(!unsupportedReminderService.supported, "没有 Notification API 时不应伪造浏览器提醒支持。");
assert(unsupportedReminderService.permission === "unsupported", "不支持浏览器通知时应返回 unsupported 权限。");

function MockNotification(title, options = {}) {
  MockNotification.instances.push({ title, options });
}
MockNotification.permission = "granted";
MockNotification.instances = [];
MockNotification.requestPermission = () => Promise.resolve(MockNotification.permission);
global.Notification = MockNotification;

const reminderServiceInitial = window.MRAppState.getPlanReminderServiceStatus(latestPlan.id);
assert(reminderServiceInitial.supported && reminderServiceInitial.permission === "granted", "模拟浏览器通知授权后应返回 granted。");
assert(!reminderServiceInitial.enabled, "未启用前不应伪造本机浏览器提醒已启用。");

const enabledReminderService = window.MRAppState.setPlanReminderServicePreference(true, latestPlan.id);
assert(enabledReminderService.ok, "授权后应可启用本机浏览器提醒。");
const reminderDuePlan = window.MRAppState.updatePlanItem(latestPlan.id, latestPlan.items[0].id, {
  dueAt: "2000-01-01",
  remindAt: "2000-01-01"
});
assert(reminderDuePlan.ok, "计划项应可改写为逾期以触发本机提醒。");
const reminderDueStatus = window.MRAppState.getPlanReminderServiceStatus(latestPlan.id);
assert(reminderDueStatus.enabled && reminderDueStatus.hasPendingLocalReminder, "启用后逾期计划项应成为可触发本机提醒。");
const dispatchedReminder = window.MRAppState.dispatchPlanReminderNotification(latestPlan.id);
assert(dispatchedReminder.ok, "逾期计划项应能触发一次本机浏览器提醒。");
assert(MockNotification.instances.length === 1, "本机提醒应真实调用 Notification 构造器。");
assert(dispatchedReminder.receipt.itemId === latestPlan.items[0].id, "本机提醒应返回计划项回执。");
assert(dispatchedReminder.receipt.receiptDigest.match(/^[a-f0-9]{64}$/), "本机提醒回执应包含稳定摘要。");
assert(dispatchedReminder.receipt.boundary.includes("不是云端推送日志"), "本机提醒回执应说明审计边界。");
const planReminderAudit = window.MRAppState.getPlanReminderAudit(latestPlan.id, { limit: 5 });
assert(planReminderAudit.kind === "mr-calligraphy-plan-reminder-audit-v1", "本机提醒审计应返回稳定 kind。");
assert(planReminderAudit.total === 1, "本机提醒审计应统计当前计划回执。");
assert(planReminderAudit.channelCounts["browser-notification"] === 1, "本机提醒审计应统计浏览器通知渠道。");
assert(planReminderAudit.statusCounts.notified === 1, "本机提醒审计应统计通知请求状态。");
assert(planReminderAudit.verifiedCount === 1, "本机提醒审计应统计本机校验通过数量。");
assert(planReminderAudit.failedCount === 0, "本机提醒正常回执不应出现摘要失败。");
assert(planReminderAudit.receipts[0].verificationStatus === "verified", "本机提醒回执应通过 receiptDigest 重算校验。");
assert(planReminderAudit.receipts[0].verificationExpectedDigest === planReminderAudit.receipts[0].receiptDigest, "本机提醒回执重算摘要应匹配 receiptDigest。");
assert(/^[a-f0-9]{64}$/.test(planReminderAudit.auditDigest), "本机提醒审计应包含稳定摘要。");
assert(planReminderAudit.boundary.includes("不是云端推送日志"), "本机提醒审计应说明本机边界。");
const planReminderAuditExport = window.MRAppState.getPlanReminderAuditExport(latestPlan.id, { limit: 5 });
assert(planReminderAuditExport.ok, "本机提醒审计应可导出 HTML。");
assert(planReminderAuditExport.filename.startsWith("mr-calligraphy-plan-reminder-audit-"), "本机提醒审计文件名应可识别。");
assert(planReminderAuditExport.html.includes("MR 书法计划提醒回执审计"), "本机提醒审计 HTML 应包含标题。");
assert(planReminderAuditExport.html.includes("浏览器 Notification"), "本机提醒审计 HTML 应包含提醒渠道。");
assert(planReminderAuditExport.html.includes(planReminderAuditExport.audit.auditDigest), "本机提醒审计 HTML 应包含审计摘要。");
assert(planReminderAuditExport.html.includes("本机校验通过"), "本机提醒审计 HTML 应包含本机校验结果。");
assert(planReminderAuditExport.html.includes("重算摘要"), "本机提醒审计 HTML 应包含重算摘要。");
const duplicateReminder = window.MRAppState.dispatchPlanReminderNotification(latestPlan.id);
assert(!duplicateReminder.ok && MockNotification.instances.length === 1, "同一条本机提醒不应重复触发。");
assert(dispatchedReminder.message.includes("不是云端推送"), "本机提醒结果应明确边界。");

const firstPlanItem = latestPlan.items[0];
const toggledPlanItem = window.MRAppState.togglePlanItem(latestPlan.id, firstPlanItem.id, true);
assert(toggledPlanItem.ok, "计划项应可勾选完成。");
const pendingReviewItem = toggledPlanItem.plan.items.find((item) => item.id === firstPlanItem.id);
assert(pendingReviewItem.reminder.status === "review-pending", "完成计划项后应进入待复盘状态。");
const dependencyAfterFirstDone = window.MRAppState.getPlanDependencyGraph(latestPlan.id);
const unlockedFocusNode = dependencyAfterFirstDone.nodes.find((item) => item.id === "plan-task-focus");
assert(dependencyAfterFirstDone.ok && unlockedFocusNode.status !== "blocked", "完成前置计划项后依赖图应解锁下一项。");

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
assert(addPlanResult.item.dependsOn.includes("plan-report"), "自定义计划项应默认接到依赖链末端。");
assert(addPlanResult.plan.dependencyGraph.nodes.at(-1).dependsOn.includes("plan-report"), "新增计划项应出现在依赖图中。");

const deniedNextCycle = window.MRAppState.createNextPlanCycle(latestPlan.id);
assert(!deniedNextCycle.ok, "计划未完成时不应生成下周期。");
window.MRAppState.getPlan(latestPlan.id).items.forEach((item) => {
  if (!item.done) {
    const doneResult = window.MRAppState.togglePlanItem(latestPlan.id, item.id, true);
    assert(doneResult.ok, `计划项 ${item.id} 应可完成以推进周期。`);
  }
});
const cycleReady = window.MRAppState.getPlanCycleStatus(latestPlan.id);
assert(cycleReady.ok && cycleReady.canCreateNext, "全部计划项完成后应允许生成下周期。");
const nextCycleResult = window.MRAppState.createNextPlanCycle(latestPlan.id);
assert(nextCycleResult.ok, "完成本周期后应能生成下一周期计划。");
assert(nextCycleResult.plan.cycleStatus.cycleIndex === 2, "下一周期应递增轮次。");
assert(nextCycleResult.plan.cycleStatus.previousPlanId === latestPlan.id, "下一周期应记录上一周期计划 ID。");
assert(nextCycleResult.plan.items.every((item) => !item.done && !item.reviewDoneAt), "下一周期计划项应重置完成和复盘状态。");
assert(nextCycleResult.plan.dependencyGraph.edges.length >= 4, "下一周期应保留计划依赖链。");
const sourceAfterCycle = window.MRAppState.getPlanCycleStatus(latestPlan.id);
assert(sourceAfterCycle.generatedNext && !sourceAfterCycle.canCreateNext, "源计划生成下一周期后不应重复生成。");

const planExport = window.MRAppState.getPlanExport(latestPlan.id);
assert(planExport.ok, "学习计划应能生成离线导出页。");
assert(planExport.filename.includes("mr-calligraphy-plan"), "学习计划导出页应返回可下载文件名。");
assert(planExport.html.includes("MR Calligraphy Plan"), "学习计划导出页 HTML 应包含导出页标识。");
assert(planExport.html.includes(latestPlan.id), "学习计划导出页 HTML 应包含计划 ID。");
assert(planExport.html.includes("本机导出的学习计划"), "学习计划导出页应明确本机导出边界。");
assert(planExport.html.includes("复盘任务重点"), "学习计划导出页应包含更新后的计划项标题。");
assert(planExport.html.includes("到期"), "学习计划导出页应包含到期信息。");
assert(planExport.html.includes("依赖图摘要") && planExport.html.includes("依赖："), "学习计划导出页应包含依赖图摘要和任务依赖。");
assert(planExport.html.includes("周期摘要"), "学习计划导出页应包含周期摘要。");
const planCalendar = window.MRAppState.getPlanCalendarExport(latestPlan.id);
const currentPlanForCalendar = window.MRAppState.getPlan(latestPlan.id);
assert(planCalendar.ok, "学习计划应能生成日历提醒导出。");
assert(planCalendar.filename.endsWith(".ics"), "学习计划日历导出应返回 .ics 文件名。");
assert(planCalendar.eventCount === currentPlanForCalendar.items.length, "学习计划日历导出应为每个计划项生成事件。");
assert(planCalendar.calendar.includes("BEGIN:VCALENDAR"), "学习计划日历导出应包含 VCALENDAR。");
assert(planCalendar.calendar.includes("BEGIN:VEVENT"), "学习计划日历导出应包含 VEVENT。");
assert(planCalendar.calendar.includes("BEGIN:VALARM"), "学习计划日历导出应包含提醒闹钟。");
assert(planCalendar.calendar.includes("MR书法"), "学习计划日历导出应包含任务标题。");
assert(planCalendar.boundary.includes("不是云端推送提醒"), "学习计划日历导出应明确非云端推送边界。");
const planHtmlReceipt = window.MRAppState.recordPlanExportReceipt(latestPlan.id, {
  exportType: "html",
  filename: planExport.filename,
  mimeType: "text/html;charset=utf-8",
  content: planExport.html,
  exportedAt: planExport.exportedAt
});
assert(planHtmlReceipt.ok, "学习计划 HTML 导出应能记录本机回执。");
assert(planHtmlReceipt.receipt.exportType === "html", "学习计划 HTML 回执应记录导出类型。");
assert(planHtmlReceipt.receipt.fileDigest.match(/^[a-f0-9]{64}$/), "学习计划 HTML 回执应包含文件摘要。");
assert(planHtmlReceipt.receipt.receiptDigest.match(/^[a-f0-9]{64}$/), "学习计划 HTML 回执应包含回执摘要。");
const planCalendarReceipt = window.MRAppState.recordPlanExportReceipt(latestPlan.id, {
  exportType: "calendar-ics",
  filename: planCalendar.filename,
  mimeType: planCalendar.mimeType,
  content: planCalendar.calendar,
  exportedAt: planCalendar.exportedAt,
  eventCount: planCalendar.eventCount
});
assert(planCalendarReceipt.ok, "学习计划日历导出应能记录本机回执。");
assert(planCalendarReceipt.receipt.exportType === "calendar-ics", "学习计划日历回执应记录导出类型。");
assert(planCalendarReceipt.receipt.eventCount === planCalendar.eventCount, "学习计划日历回执应记录事件数量。");
assert(planCalendarReceipt.receipt.fileDigest.match(/^[a-f0-9]{64}$/), "学习计划日历回执应包含文件摘要。");
const planExportAudit = window.MRAppState.getPlanExportAudit(latestPlan.id, { limit: 5 });
assert(planExportAudit.kind === "mr-calligraphy-plan-export-audit-v1", "计划导出审计应返回稳定 kind。");
assert(planExportAudit.total === 2, "计划导出审计应统计当前计划回执。");
assert(planExportAudit.typeCounts.html === 1, "计划导出审计应统计 HTML 导出。");
assert(planExportAudit.typeCounts["calendar-ics"] === 1, "计划导出审计应统计日历 ICS 导出。");
assert(planExportAudit.verifiedCount === 2, "计划导出审计应统计本机校验通过数量。");
assert(planExportAudit.failedCount === 0, "计划导出正常回执不应出现摘要失败。");
assert(planExportAudit.receipts.every((receipt) => receipt.verificationStatus === "verified"), "计划导出回执应通过 receiptDigest 重算校验。");
assert(planExportAudit.receipts.every((receipt) => receipt.verificationExpectedDigest === receipt.receiptDigest), "计划导出回执重算摘要应匹配 receiptDigest。");
assert(/^[a-f0-9]{64}$/.test(planExportAudit.auditDigest), "计划导出审计应包含稳定摘要。");
assert(planExportAudit.boundary.includes("不是云端下载日志"), "计划导出审计应说明本机边界。");
const planExportAuditExport = window.MRAppState.getPlanExportAuditExport(latestPlan.id, { limit: 5 });
assert(planExportAuditExport.ok, "计划导出审计应可导出 HTML。");
assert(planExportAuditExport.filename.startsWith("mr-calligraphy-plan-export-audit-"), "计划导出审计文件名应可识别。");
assert(planExportAuditExport.html.includes("MR 书法计划导出回执审计"), "计划导出审计 HTML 应包含标题。");
assert(planExportAuditExport.html.includes("学习计划 HTML"), "计划导出审计 HTML 应包含 HTML 类型。");
assert(planExportAuditExport.html.includes("日历 ICS"), "计划导出审计 HTML 应包含日历类型。");
assert(planExportAuditExport.html.includes(planExportAuditExport.audit.auditDigest), "计划导出审计 HTML 应包含审计摘要。");
assert(planExportAuditExport.html.includes("本机校验通过"), "计划导出审计 HTML 应包含本机校验结果。");
assert(planExportAuditExport.html.includes("重算摘要"), "计划导出审计 HTML 应包含重算摘要。");
assert(!window.MRAppState.getPlanDependencyGraph("missing-plan").ok, "不存在的计划不应伪造依赖图。");
assert(!window.MRAppState.getPlanCycleStatus("missing-plan").ok, "不存在的计划不应伪造周期状态。");
assert(!window.MRAppState.getPlanExport("missing-plan").ok, "不存在的计划不应伪造导出成功。");
assert(!window.MRAppState.getPlanCalendarExport("missing-plan").ok, "不存在的计划不应伪造日历导出成功。");

const planRepositoryStatus = window.MRAppState.getPlanRepositoryStatus();
assert(planRepositoryStatus.ok && planRepositoryStatus.planCount >= 2, "计划 repository 应统计本机计划数量。");
assert(!planRepositoryStatus.remoteConfigured, "未配置远端时不应伪造云端计划仓库。");
assert(planRepositoryStatus.pendingAutoSync, "生成和修改本机计划后应进入待自动同步队列。");
assert(planRepositoryStatus.pendingReason, "待自动同步队列应记录变更原因。");
const planRepositoryPackage = window.MRAppState.getPlanRepositoryPackage();
assert(planRepositoryPackage.ok, "计划 repository 应能生成 JSON 同步包。");
assert(planRepositoryPackage.package.kind === "mr-calligraphy-plan-repository-v1", "计划同步包应包含稳定 kind。");
assert(planRepositoryPackage.package.digestAlgorithm === "sha256-stable-json", "计划同步包应声明稳定 JSON 摘要算法。");
assert(/^[a-f0-9]{64}$/.test(planRepositoryPackage.package.packageDigest), "计划同步包应包含 64 位 packageDigest。");
assert(planRepositoryPackage.package.plans.length >= 2, "计划同步包应包含本机计划列表。");
assert(planRepositoryPackage.message.includes("本机 JSON 同步包"), "计划同步包应明确本机边界。");
const planRepositoryPackageJson = JSON.stringify(planRepositoryPackage.package, null, 2);
const planRepositoryExportReceipt = window.MRAppState.recordPlanRepositoryExportReceipt({
  filename: planRepositoryPackage.filename,
  package: planRepositoryPackage.package,
  content: planRepositoryPackageJson,
  exportedAt: planRepositoryPackage.package.exportedAt
});
assert(planRepositoryExportReceipt.ok, "计划仓库 JSON 同步包导出应能记录本机回执。");
assert(planRepositoryExportReceipt.receipt.kind === "mr-calligraphy-plan-repository-export-audit-v1", "计划仓库导出回执应返回稳定 kind。");
assert(planRepositoryExportReceipt.receipt.planCount === planRepositoryPackage.package.plans.length, "计划仓库导出回执应记录计划数量。");
assert(planRepositoryExportReceipt.receipt.packageDigest === planRepositoryPackage.package.packageDigest, "计划仓库导出回执应记录包摘要。");
assert(planRepositoryExportReceipt.receipt.fileDigest === crypto.createHash("sha256").update(planRepositoryPackageJson).digest("hex"), "计划仓库导出回执应记录 JSON 文件摘要。");
assert(planRepositoryExportReceipt.receipt.receiptDigest.match(/^[a-f0-9]{64}$/), "计划仓库导出回执应包含回执摘要。");
assert(planRepositoryExportReceipt.receipt.boundary.includes("不是云端仓库日志"), "计划仓库导出回执应说明本机边界。");
const planRepositoryExportAudit = window.MRAppState.getPlanRepositoryExportAudit({ limit: 5 });
assert(planRepositoryExportAudit.kind === "mr-calligraphy-plan-repository-export-audit-v1", "计划仓库导出审计应返回稳定 kind。");
assert(planRepositoryExportAudit.total === 1, "计划仓库导出审计应统计同步包导出回执。");
assert(planRepositoryExportAudit.latestReceipt.packageDigest === planRepositoryPackage.package.packageDigest, "计划仓库导出审计应保留最近包摘要。");
assert(planRepositoryExportAudit.verifiedCount === 1, "计划仓库导出审计应统计本机校验通过数量。");
assert(planRepositoryExportAudit.failedCount === 0, "计划仓库导出正常回执不应出现摘要失败。");
assert(planRepositoryExportAudit.receipts[0].verificationStatus === "verified", "计划仓库导出回执应通过 receiptDigest 重算校验。");
assert(planRepositoryExportAudit.receipts[0].verificationExpectedDigest === planRepositoryExportReceipt.receipt.receiptDigest, "计划仓库导出回执重算摘要应匹配 receiptDigest。");
assert(/^[a-f0-9]{64}$/.test(planRepositoryExportAudit.auditDigest), "计划仓库导出审计应包含稳定摘要。");
const planRepositoryExportAuditExport = window.MRAppState.getPlanRepositoryExportAuditExport({ limit: 5 });
assert(planRepositoryExportAuditExport.ok, "计划仓库导出审计应可导出 HTML。");
assert(planRepositoryExportAuditExport.filename.startsWith("mr-calligraphy-plan-repository-export-audit-"), "计划仓库导出审计文件名应可识别。");
assert(planRepositoryExportAuditExport.html.includes("MR 书法计划仓库导出回执审计"), "计划仓库导出审计 HTML 应包含标题。");
assert(planRepositoryExportAuditExport.html.includes(planRepositoryPackage.package.packageDigest), "计划仓库导出审计 HTML 应包含包摘要。");
assert(planRepositoryExportAuditExport.html.includes(planRepositoryExportAuditExport.audit.auditDigest), "计划仓库导出审计 HTML 应包含审计摘要。");
assert(planRepositoryExportAuditExport.html.includes("本机校验通过"), "计划仓库导出审计 HTML 应包含本机校验结果。");
assert(planRepositoryExportAuditExport.html.includes("重算摘要"), "计划仓库导出审计 HTML 应包含重算摘要。");
const tamperedPlanPackage = JSON.parse(JSON.stringify(planRepositoryPackage.package));
tamperedPlanPackage.plans[0].title = "被篡改的计划同步包标题";
const tamperedPlanImport = window.MRAppState.importPlanRepositoryPackage(tamperedPlanPackage, { skipAutoSync: true });
assert(!tamperedPlanImport.ok && tamperedPlanImport.message.includes("摘要校验失败"), "篡改计划同步包但保留旧摘要时应拒绝导入。");
const importedPlan = {
  ...planRepositoryPackage.package.plans[0],
  id: "plan-imported-cross-device",
  title: "导入的跨设备计划草案",
  createdAt: "2026-06-12T08:00:00.000Z"
};
const repositoryImportPackage = refreshPackageDigestInPlace({
  ...planRepositoryPackage.package,
  packageId: "plan-package-test",
  plans: [importedPlan]
});
const repositoryImport = window.MRAppState.importPlanRepositoryPackage(JSON.stringify(repositoryImportPackage));
assert(repositoryImport.ok && repositoryImport.importedCount === 1, "计划同步包应能导入新增计划。");
assert(window.MRAppState.getPlan("plan-imported-cross-device").title === "导入的跨设备计划草案", "导入计划应可从计划历史读取。");
const remoteCheck = window.MRAppState.checkRemotePlanRepository();
assert(!remoteCheck.ok && remoteCheck.message.includes("尚未配置远端计划 repository"), "未配置远端时应明确失败而不是伪造同步成功。");

runRemoteRepositoryChecks().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function runRemoteRepositoryChecks() {
  const invalidRemoteConfig = window.MRAppState.configurePlanRepositoryRemote({
    remoteEndpoint: "ftp://example.test/plan-repository"
  });
  assert(!invalidRemoteConfig.ok, "远端计划 API 不应接受非 HTTP 地址。");

  const configuredRemote = window.MRAppState.configurePlanRepositoryRemote({
    remoteEndpoint: "https://example.test/plan-repository",
    remoteToken: "test-token",
    workspaceId: "class-alpha"
  });
  assert(configuredRemote.ok, "远端计划 API 配置应可写入本机状态。");
  assert(configuredRemote.status.remoteConfigured, "保存远端配置后应显示已配置。");
  assert(configuredRemote.status.workspaceId === "class-alpha", "保存远端配置后应持久化计划仓库 workspace。");
  assert(configuredRemote.status.autoSyncEnabled, "保存远端配置后应默认开启自动同步队列。");

  const remotePlan = {
    ...planRepositoryPackage.package.plans[0],
    id: "plan-remote-pulled",
    title: "远端拉取的跨设备计划",
    createdAt: "2026-06-13T08:00:00.000Z"
  };
  let remotePackage = refreshPackageDigestInPlace({
    ...planRepositoryPackage.package,
    packageId: "remote-package-test",
    exportedAt: "2026-06-13T08:10:00.000Z",
    plans: [remotePlan]
  });
  let capturedPushPackage = null;
  let latestPlanReceipt = null;
  const fetchCalls = [];
  global.fetch = async (url, options = {}) => {
    fetchCalls.push({ url, options });
    if (options.method === "PUT") {
      capturedPushPackage = JSON.parse(options.body);
      const acceptedAt = new Date().toISOString();
      const repositoryDigest = "b".repeat(64);
      latestPlanReceipt = {
        receiptKind: "mr-calligraphy-plan-repository-receipt-v1",
        remoteVersion: "remote-plan-test-v1",
        workspaceId: capturedPushPackage.workspaceId,
        packageId: "remote-accepted-package",
        sourcePackageId: capturedPushPackage.packageId,
        repositoryDigest,
        acceptedAt,
        planCount: capturedPushPackage.plans.length,
        warningCount: 0,
        warnings: [],
        receiptDigest: sha256StableJson({
          sourcePackageId: capturedPushPackage.packageId,
          workspaceId: capturedPushPackage.workspaceId,
          repositoryDigest,
          acceptedAt
        })
      };
      const acceptedPackage = refreshPackageDigestInPlace({
        ...capturedPushPackage,
        packageId: "remote-accepted-package"
      });
      return createJsonResponse({
        ok: true,
        message: "远端已接收计划仓库。",
        package: acceptedPackage,
        receipt: latestPlanReceipt
      });
    }
    return createJsonResponse({
      ok: true,
      message: "远端计划仓库可读。",
      package: remotePackage,
      latestReceipt: latestPlanReceipt
    });
  };

  const checkedRemote = await window.MRAppState.checkRemotePlanRepository();
  assert(checkedRemote.ok, "配置远端后应真实调用 fetch 检查计划仓库。");
  assert(checkedRemote.package.plans.length === 1, "远端检查应解析计划包。");
  assert(fetchCalls[0].url === "https://example.test/plan-repository", "远端检查应请求已保存的 endpoint。");
  assert(fetchCalls[0].options.headers.Authorization === "Bearer test-token", "远端请求应携带本机保存的 Bearer token。");
  assert(fetchCalls[0].options.headers["X-MR-Workspace-Id"] === "class-alpha", "远端请求应携带计划仓库 workspace header。");

  const pushedRemote = await window.MRAppState.pushPlanRepositoryToRemote();
  assert(pushedRemote.ok, "推送计划应真实调用远端 PUT。");
  assert(capturedPushPackage.kind === "mr-calligraphy-plan-repository-v1", "远端推送应发送稳定计划仓库包。");
  assert(capturedPushPackage.workspaceId === "class-alpha", "远端推送包应包含计划仓库 workspaceId。");
  assert(capturedPushPackage.digestAlgorithm === "sha256-stable-json", "远端推送包应声明计划仓库摘要算法。");
  assert(/^[a-f0-9]{64}$/.test(capturedPushPackage.packageDigest), "远端推送包应包含 64 位 packageDigest。");
  assert(capturedPushPackage.plans.length >= 3, "远端推送应包含当前本机计划列表。");
  assert(pushedRemote.packageId === "remote-accepted-package", "推送结果应记录远端接收的 packageId。");
  assert(/^[a-f0-9]{64}$/.test(pushedRemote.packageDigest), "推送结果应返回计划仓库包摘要。");
  assert(pushedRemote.receipt.verificationStatus === "verified", "计划仓库推送回执应标记本机校验通过。");
  assert(pushedRemote.receipt.verificationExpectedDigest === pushedRemote.receipt.receiptDigest, "计划仓库推送回执应保留重算摘要。");
  assert(pushedRemote.status.message.includes("本机校验通过"), "计划仓库状态摘要应提示回执本机校验结果。");
  assert(!pushedRemote.status.pendingAutoSync, "推送成功后应清空待自动同步队列。");

  const pulledRemote = await window.MRAppState.pullPlanRepositoryFromRemote();
  assert(pulledRemote.ok && pulledRemote.importedCount === 1, "拉取远端计划包应导入新增计划。");
  assert(window.MRAppState.getPlan("plan-remote-pulled").title === "远端拉取的跨设备计划", "远端拉取计划应可从计划历史读取。");

  const conflictLocalPlan = window.MRAppState.getPlan("plan-remote-pulled");
  const conflictUpdate = window.MRAppState.updatePlanItem("plan-remote-pulled", conflictLocalPlan.items[0].id, {
    title: "本机修改后的跨设备计划项"
  });
  assert(conflictUpdate.ok, "本机修改远端拉取计划应成功。");
  assert(window.MRAppState.getPlanRepositoryStatus().pendingAutoSync, "本机修改远端计划后应重新进入待同步队列。");
  remotePackage = refreshPackageDigestInPlace({
    ...remotePackage,
    packageId: "remote-conflict-package",
    exportedAt: "2030-01-01T00:00:00.000Z",
    plans: [{
      ...conflictLocalPlan,
      title: "远端也修改过的跨设备计划",
      updatedAt: "2030-01-01T00:00:00.000Z"
    }]
  });
  const conflictPull = await window.MRAppState.pullPlanRepositoryFromRemote();
  assert(!conflictPull.ok && conflictPull.conflict, "本机待同步变更和远端同计划更新冲突时不应静默覆盖。");
  assert(conflictPull.conflicts[0].id === "plan-remote-pulled", "冲突结果应指出具体计划 ID。");
  assert(window.MRAppState.getPlan("plan-remote-pulled").title === "远端拉取的跨设备计划", "冲突拉取不应覆盖本机计划标题。");
  assert(window.MRAppState.getPlan("plan-remote-pulled").items[0].title === "本机修改后的跨设备计划项", "冲突拉取不应覆盖本机待同步计划项。");
  assert(window.MRAppState.getPlanRepositoryStatus().lastSyncConflictCount === 1, "计划 repository 应持久化冲突数量。");
  assert(window.MRAppState.getPlanRepositoryStatus().lastSyncConflicts[0].remoteTitle === "远端也修改过的跨设备计划", "计划 repository 应持久化冲突详情。");

  const copiedConflict = window.MRAppState.resolvePlanRepositoryConflict("copy-remote");
  assert(copiedConflict.ok && copiedConflict.copiedCount === 1, "冲突远端计划应可另存为本机副本。");
  assert(copiedConflict.plans[0].title.includes("远端副本"), "冲突另存副本应标明来源。");
  assert(window.MRAppState.getPlan("plan-remote-pulled").items[0].title === "本机修改后的跨设备计划项", "另存副本不应覆盖本机待同步计划项。");
  assert(!copiedConflict.status.lastSyncConflictCount, "另存副本后应清理冲突状态。");
  assert(copiedConflict.status.pendingAutoSync, "另存副本后应进入待同步队列。");

  const successFetch = global.fetch;
  global.fetch = async () => new Promise((resolve) => {
    setTimeout(() => {
      resolve(createJsonResponse({
        ok: true,
        message: "慢速计划仓库最终返回，但应先被本机超时保护截断。",
        package: capturedPushPackage,
        receipt: latestPlanReceipt
      }));
    }, 30);
  });
  const timedOutAutoSync = await window.MRAppState.flushPlanRepositoryAutoSync({ timeoutMs: 1, retryDelayMs: 5 });
  assert(!timedOutAutoSync.ok, "自动同步超时时不应伪造成成功。");
  assert(timedOutAutoSync.status.pendingAutoSync, "自动同步超时后应保留待同步队列。");
  assert(timedOutAutoSync.status.autoSyncRetryAfter, "自动同步超时后应记录下一次可重试时间。");
  assert(timedOutAutoSync.status.autoSyncFailureHistory[0].failureKind === "timeout", "自动同步超时应写入失败历史。");
  assert(/^[a-f0-9]{64}$/.test(timedOutAutoSync.status.autoSyncFailureHistory[0].packageDigest), "自动同步失败历史应记录待推送计划包摘要。");
  assert(timedOutAutoSync.status.autoSyncRetrySummary.includes("重试队列"), "自动同步失败状态应提示重试队列。");
  global.fetch = successFetch;

  const flushedAutoSync = await window.MRAppState.flushPlanRepositoryAutoSync();
  assert(flushedAutoSync.ok, "待同步队列应可通过 flush 推送到远端。");
  assert(!flushedAutoSync.status.pendingAutoSync, "自动同步 flush 成功后应清空队列。");
  assert(flushedAutoSync.status.lastAutoSyncAt, "自动同步 flush 成功后应记录时间。");
  assert(!flushedAutoSync.status.autoSyncRetryAfter, "自动同步成功后应清除下一次重试时间。");
  assert(flushedAutoSync.status.autoSyncFailureHistory[0].failureKind === "timeout", "自动同步成功后仍应保留最近失败历史。");

  remotePackage = createRemoteConflictPackageFromPush(capturedPushPackage, {
    packageId: "remote-keep-local-conflict-package",
    planId: "plan-remote-pulled",
    title: "远端保留策略冲突计划",
    itemTitle: "远端保留策略冲突项",
    itemDetail: "远端版本不应覆盖选择保留本机后的计划项。"
  });
  await delay(5);
  const keepLocalPlan = window.MRAppState.getPlan("plan-remote-pulled");
  const keepLocalUpdate = window.MRAppState.updatePlanItem("plan-remote-pulled", keepLocalPlan.items[0].id, {
    title: "保留本机策略任务",
    detail: "选择保留本机时，这条本机任务应被推送到远端。"
  });
  assert(keepLocalUpdate.ok, "保留本机策略前应能制造本机计划修改。");
  const keepLocalConflict = await window.MRAppState.pullPlanRepositoryFromRemote();
  assert(!keepLocalConflict.ok && keepLocalConflict.conflict, "保留本机策略前应检测到远端冲突。");
  const keptLocal = await window.MRAppState.resolvePlanRepositoryConflict("keep-local");
  assert(keptLocal.ok, "冲突保留本机策略应可通过远端 PUT 完成。");
  assert(!keptLocal.status.lastSyncConflictCount, "保留本机后应清理冲突状态。");
  assert(!keptLocal.status.pendingAutoSync, "保留本机推送成功后应清空待同步队列。");
  const keptLocalPlan = window.MRAppState.getPlan("plan-remote-pulled");
  assert(keptLocalPlan.items[0].title === "保留本机策略任务", "保留本机不应覆盖本机计划项。");
  const keptPushedPlan = capturedPushPackage.plans.find((plan) => plan.id === "plan-remote-pulled");
  assert(keptPushedPlan.items[0].title === "保留本机策略任务", "保留本机应把本机计划项推送到远端包。");

  remotePackage = createRemoteConflictPackageFromPush(capturedPushPackage, {
    packageId: "remote-use-remote-conflict-package",
    planId: "plan-remote-pulled",
    title: "采用远端策略计划",
    itemTitle: "采用远端策略任务",
    itemDetail: "选择采用远端时，这条远端任务应覆盖本机冲突项。"
  });
  await delay(5);
  const useRemotePlan = window.MRAppState.getPlan("plan-remote-pulled");
  const useRemoteUpdate = window.MRAppState.updatePlanItem("plan-remote-pulled", useRemotePlan.items[0].id, {
    title: "本机即将被远端覆盖",
    detail: "选择采用远端后，这条本机任务应被远端版本替换。"
  });
  assert(useRemoteUpdate.ok, "采用远端策略前应能制造本机计划修改。");
  const useRemoteConflict = await window.MRAppState.pullPlanRepositoryFromRemote();
  assert(!useRemoteConflict.ok && useRemoteConflict.conflict, "采用远端策略前应检测到远端冲突。");
  const usedRemote = await window.MRAppState.resolvePlanRepositoryConflict("use-remote");
  assert(usedRemote.ok, "冲突采用远端策略应可强制拉取远端计划。");
  assert(!usedRemote.status.lastSyncConflictCount, "采用远端后应清理冲突状态。");
  assert(!usedRemote.status.pendingAutoSync, "采用远端后不应继续显示本机待同步。");
  const usedRemotePlan = window.MRAppState.getPlan("plan-remote-pulled");
  assert(usedRemotePlan.title === "采用远端策略计划", "采用远端应覆盖本机计划标题。");
  assert(usedRemotePlan.items[0].title === "采用远端策略任务", "采用远端应覆盖本机冲突计划项。");
  assert(usedRemote.status.lastRemoteDirection === "pull", "采用远端应记录最近同步方向为拉取。");

  const fieldMergeBaselinePush = await window.MRAppState.pushPlanRepositoryToRemote();
  assert(fieldMergeBaselinePush.ok, "字段合并前应能推送当前计划作为远端基线。");
  remotePackage = createRemoteConflictPackageFromPush(capturedPushPackage, {
    packageId: "remote-field-merge-conflict-package",
    planId: "plan-remote-pulled",
    title: "字段合并远端计划标题",
    itemTitle: "字段合并远端任务标题",
    itemDetail: "字段合并时采用的远端任务说明。"
  });
  await delay(5);
  const fieldMergePlan = window.MRAppState.getPlan("plan-remote-pulled");
  const fieldMergeItemId = fieldMergePlan.items[0].id;
  const fieldMergeUpdate = window.MRAppState.updatePlanItem("plan-remote-pulled", fieldMergeItemId, {
    title: "字段合并保留本机任务标题",
    detail: "字段合并时本机说明应被远端说明替换。"
  });
  assert(fieldMergeUpdate.ok, "字段合并前应能制造本机计划修改。");
  const fieldMergeConflict = await window.MRAppState.pullPlanRepositoryFromRemote();
  assert(!fieldMergeConflict.ok && fieldMergeConflict.conflict, "字段合并前应检测到远端冲突。");
  assert(fieldMergeConflict.status.lastSyncConflicts[0].fieldDiffs.plan.some((field) => field.field === "title"), "冲突详情应包含计划标题字段差异。");
  assert(fieldMergeConflict.status.lastSyncConflicts[0].fieldDiffs.items[0].fields.some((field) => field.field === "detail"), "冲突详情应包含任务说明字段差异。");
  const mergedFields = window.MRAppState.resolvePlanRepositoryConflict("merge-fields", {
    selections: {
      "plan-remote-pulled": {
        plan: { title: "remote" },
        items: {
          [fieldMergeItemId]: {
            title: "local",
            detail: "remote"
          }
        }
      }
    }
  });
  assert(mergedFields.ok && mergedFields.mergedCount === 1, "字段级合并应能处理计划冲突。");
  assert(!mergedFields.status.lastSyncConflictCount, "字段级合并后应清理冲突状态。");
  assert(mergedFields.status.pendingAutoSync, "字段级合并后的本机结果应进入待同步队列。");
  assert(mergedFields.remoteFieldCount >= 2, "字段级合并应记录采用远端字段数量。");
  const mergedPlan = window.MRAppState.getPlan("plan-remote-pulled");
  assert(mergedPlan.title === "字段合并远端计划标题", "字段级合并应采用远端计划标题。");
  assert(mergedPlan.items[0].title === "字段合并保留本机任务标题", "字段级合并应保留本机任务标题。");
  assert(mergedPlan.items[0].detail === "字段合并时采用的远端任务说明。", "字段级合并应采用远端任务说明。");

  const persistedPlanState = JSON.parse(storage.get("mr-calligraphy-learning-state-v1"));
  assert(persistedPlanState.sessions.at(-1).scoreEvidence.label === "基础练习评分", "评分证据应持久化到 localStorage。");
  assert(persistedPlanState.stageRecords.length === 3, "阶段记录应持久化到 localStorage。");
  assert(persistedPlanState.plans[0].items[0].reviewDoneAt, "计划复盘状态应持久化到 localStorage。");
  assert(persistedPlanState.plans[0].items[1].snoozedUntil, "计划顺延状态应持久化到 localStorage。");
  assert(persistedPlanState.plans[0].cycleRule.generatedNextPlanId === nextCycleResult.plan.id, "源计划应持久化下一周期 ID。");
  assert(persistedPlanState.plans[1].cycleRule.previousPlanId === latestPlan.id, "下一周期应持久化上一周期 ID。");
  assert(persistedPlanState.planReminderService.enabled, "本机提醒启用状态应持久化到 localStorage。");
  assert(persistedPlanState.planReminderService.lastPlanId === latestPlan.id, "本机提醒应记录最近计划 ID。");
  assert(persistedPlanState.planReminderService.lastItemId === latestPlan.items[0].id, "本机提醒应记录最近触发的计划项 ID。");
  assert(persistedPlanState.planReminderService.receipts.length === 1, "本机提醒回执应持久化到 localStorage。");
  assert(persistedPlanState.planReminderService.receipts[0].receiptDigest.match(/^[a-f0-9]{64}$/), "本机提醒回执摘要应持久化。");
  assert(persistedPlanState.planRepository.mode === "remote-api", "计划 repository 应持久化远端 API 模式。");
  assert(persistedPlanState.planRepository.remoteEndpoint === "https://example.test/plan-repository", "计划 repository 应持久化远端 endpoint。");
  assert(persistedPlanState.planRepository.workspaceId === "class-alpha", "计划 repository 应持久化远端 workspace。");
  assert(persistedPlanState.planRepository.lastImportedPlanCount === remotePackage.plans.length, "计划 repository 导入状态应持久化到 localStorage。");
  assert(persistedPlanState.planRepository.lastPackageId === remotePackage.packageId, "计划 repository 应持久化最近看到的远端冲突包 packageId。");
  assert(persistedPlanState.planRepository.lastPackageDigest === remotePackage.packageDigest, "计划 repository 应持久化最近看到的远端冲突包摘要。");
  assert(persistedPlanState.planRepository.lastRemoteDirection === "push", "字段级合并后最近远端方向应保留为基线推送。");
  assert(persistedPlanState.planRepository.lastRemotePlanCount === remotePackage.plans.length, "计划 repository 应记录最近远端计划数量。");
  assert(persistedPlanState.planRepository.lastReceipt.verificationStatus === "verified", "计划 repository 应持久化回执本机校验状态。");
  assert(persistedPlanState.planRepository.lastReceipt.verificationExpectedDigest === persistedPlanState.planRepository.lastReceipt.receiptDigest, "计划 repository 应持久化回执重算摘要。");
  assert(persistedPlanState.planRepository.pendingAutoSync, "字段级合并后的混合版本应继续显示待同步。");
  assert(persistedPlanState.planRepository.pendingReason.includes("字段级合并"), "字段级合并待同步原因应持久化。");
  assert(persistedPlanState.planRepository.lastAutoSyncAt, "计划 repository 应持久化最近自动同步时间。");
  assert(persistedPlanState.planRepository.autoSyncFailureHistory[0].failureKind === "timeout", "计划 repository 应持久化自动同步失败历史。");
  assert(/^[a-f0-9]{64}$/.test(persistedPlanState.planRepository.autoSyncFailureHistory[0].packageDigest), "计划 repository 应持久化自动同步失败包摘要。");
  assert(persistedPlanState.planRepository.lastSyncConflictCount === 0, "字段级合并后应清理冲突计数。");
  const persistedRemotePlan = persistedPlanState.plans.find((plan) => plan.id === "plan-remote-pulled");
  assert(persistedRemotePlan.title === "字段合并远端计划标题", "字段级合并后的计划标题应持久化到 localStorage。");
  assert(persistedRemotePlan.items[0].title === "字段合并保留本机任务标题", "字段级合并后的本机任务标题应持久化到 localStorage。");
  assert(persistedRemotePlan.items[0].detail === "字段合并时采用的远端任务说明。", "字段级合并后的远端任务说明应持久化到 localStorage。");

  global.fetch = async () => createJsonResponse({
    ok: true,
    message: "远端返回了被篡改的计划仓库回执。",
    package: remotePackage,
    latestReceipt: {
      ...latestPlanReceipt,
      receiptDigest: "0".repeat(64)
    }
  });
  const tamperedPlanReceiptCheck = await window.MRAppState.checkRemotePlanRepository();
  assert(tamperedPlanReceiptCheck.ok, "计划仓库篡改回执检查仍应完成远端读取。");
  assert(tamperedPlanReceiptCheck.receipt.verificationStatus === "digest-mismatch", "计划仓库篡改回执应被标记为摘要不匹配。");
  global.fetch = nativeFetch;

  await runReportRepositoryMockServerChecks(nativeFetch);
  await runHistoryRepositoryMockServerChecks(nativeFetch);
  await runPlanRepositoryMockServerChecks(nativeFetch);
  await runShareRepositoryMockServerChecks(nativeFetch);

  const historyForBatchAudit = window.MRAppState.getHistory({ limit: 200 });
  const historyIdsForBatchAudit = historyForBatchAudit.allIds.slice(0, 3);
  assert(historyIdsForBatchAudit.length >= 3, "批量回执审计验收需要至少 3 条学习档案。");
  const batchDelete = window.MRAppState.deleteHistoryRecords(historyIdsForBatchAudit);
  assert(batchDelete.ok && batchDelete.batchReceipt.action === "delete", "批量删除应写入回执。");
  const batchRestore = window.MRAppState.restoreHistoryTrash(batchDelete.batchReceipt.trashId);
  assert(batchRestore.ok && batchRestore.batchReceipt.action === "restore", "恢复回收站应写入回执。");
  const batchDeleteAgain = window.MRAppState.deleteHistoryRecords(historyIdsForBatchAudit);
  assert(batchDeleteAgain.ok && batchDeleteAgain.batchReceipt.trashId, "再次批量删除应生成回收站 ID。");
  const batchTrashClear = window.MRAppState.clearHistoryTrash();
  assert(batchTrashClear.ok && batchTrashClear.batchReceipt.action === "trash-clear", "清空回收站应写入回执。");
  const batchReceiptAudit = window.MRAppState.getHistoryBatchReceiptAudit({ limit: 6 });
  assert(batchReceiptAudit.kind === "mr-calligraphy-history-batch-receipt-audit-v1", "批量回执审计应返回稳定 kind。");
  assert(batchReceiptAudit.total >= 4, "批量回执审计应统计最近批量操作。");
  assert(batchReceiptAudit.actionCounts.delete >= 2, "批量回执审计应统计删除动作。");
  assert(batchReceiptAudit.actionCounts.restore >= 1, "批量回执审计应统计恢复动作。");
  assert(batchReceiptAudit.actionCounts["trash-clear"] >= 1, "批量回执审计应统计清空回收站动作。");
  assert(/^[a-f0-9]{64}$/.test(batchReceiptAudit.auditDigest), "批量回执审计应包含稳定摘要。");
  assert(batchReceiptAudit.boundary.includes("不是服务端账号审计"), "批量回执审计应说明本机边界。");
  const batchReceiptAuditExport = window.MRAppState.getHistoryBatchReceiptAuditExport({ limit: 6 });
  assert(batchReceiptAuditExport.ok, "批量回执审计应可生成 HTML。");
  assert(batchReceiptAuditExport.filename.startsWith("mr-calligraphy-history-batch-receipts-"), "批量回执审计文件名应可识别。");
  assert(batchReceiptAuditExport.html.includes("MR 书法学习档案批量回执审计"), "批量回执审计 HTML 应包含标题。");
  assert(batchReceiptAuditExport.html.includes("批量移入回收站"), "批量回执审计 HTML 应包含删除回执。");
  assert(batchReceiptAuditExport.html.includes("清空学习档案回收站"), "批量回执审计 HTML 应包含清空回执。");
  assert(batchReceiptAuditExport.html.includes(batchReceiptAuditExport.audit.auditDigest), "批量回执审计 HTML 应包含审计摘要。");

  console.log("学习状态检查通过：学习路径服务、基础评分服务、本机讲解服务、本机链接复制审计、复盘导出回执审计和本机校验、学习档案详情操作回执审计和本机校验、同字作品对比、作品集检索、作品导出回执审计、学习档案批量操作回执审计、学习档案同步仓库、学习档案仓库回执本机校验、学习档案冲突审计和字段级合并、分享页、本机分享链接服务、远端分享 API adapter、远端分享仓库包摘要验真、分享 mock 服务、分享远端撤销和回执审计、分享回执本机校验、书写视频导出记录、封面、队列、失败重试和回执审计、报告原生 PDF、报告 PDF 能力雷达图、报告 PDF 分数趋势图、报告 PDF 作品截图嵌入、报告评分证据摘要、报告教师批注、报告教师批注审计、报告导出回执审计、报告对比导出回执审计、报告打印回执审计、报告本机验真摘要、报告仓库本机 JSON 同步包、报告仓库远端 API adapter、报告仓库签名回执、报告仓库回执本机校验、报告仓库 mock 服务、报告仓库冲突审计、报告冲突字段级合并和远端副本另存、报告对比导出、多报告趋势、评分证据、学习阶段记录、任务依赖完成规则、学习计划提醒复盘、计划提醒服务边界、计划提醒回执审计和本机校验、学习计划日历提醒导出、计划导出回执审计和本机校验、学习计划同步仓库、远端计划 API adapter、计划仓库 mock 服务、计划仓库导出回执审计和本机校验、计划仓库回执审计、计划仓库回执本机校验、学习计划自动同步队列、超时重试失败恢复、计划同步冲突检测、计划冲突另存副本、保留本机、采用远端、计划字段级合并、计划依赖图、计划周期循环和计划离线导出已生成。");
}

async function runShareRepositoryMockServerChecks(fetchApi) {
  assert(fetchApi, "当前 Node 环境需要支持 fetch 以验证作品分享 mock 服务。");
  const previousFetch = global.fetch;
  const mock = await startShareRepositoryMockServer({
    token: "share-token",
    publicBaseUrl: "https://share.example.test"
  });
  try {
    global.fetch = fetchApi;
    const shareLinkForRemote = window.MRAppState.createArtworkShareLink("artwork-3", { expiresInDays: 5 });
    assert(shareLinkForRemote.ok && shareLinkForRemote.record.isActive, "分享 mock 验收前应能生成新的有效分享链接。");
    const configuredMock = window.MRAppState.configureShareServiceRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "share-token",
      workspaceId: "share-alpha"
    });
    assert(configuredMock.ok, "作品分享 mock endpoint 应可保存为远端配置。");
    assert(configuredMock.status.workspaceId === "share-alpha", "作品分享 mock 配置应保存 workspace。");

    const checkedBeforePush = await window.MRAppState.checkRemoteShareService();
    assert(checkedBeforePush.ok, `作品分享 mock GET 检查应真实可访问：${checkedBeforePush.message || "无错误详情"}`);
    assert(checkedBeforePush.package === null, "作品分享 mock 初始未接收包时不应伪造远端分享。");
    const emptyShareReceiptExport = window.MRAppState.getShareRepositoryReceiptAuditExport();
    assert(!emptyShareReceiptExport.ok, "作品分享远端无回执时不应生成空审计导出。");

    const pushedMock = await window.MRAppState.pushArtworkShareToRemote(shareLinkForRemote.record.id);
    assert(pushedMock.ok, "作品分享 mock 应接收真实 PUT 发布。");
    assert(pushedMock.publicUrl.includes(shareLinkForRemote.record.id), "作品分享 mock 应返回可访问 publicUrl。");
    assert(pushedMock.packageId.startsWith("mock-share-repository-share-alpha-"), "作品分享 mock 应返回带 workspace 的服务端 packageId。");
    assert(mock.state.package.workspaceId === "share-alpha", "作品分享 mock 应把最近包写入当前 workspace。");
    assert(mock.state.package.digestAlgorithm === "sha256-stable-json", "作品分享 mock 应保存摘要算法。");
    assert(/^[a-f0-9]{64}$/.test(mock.state.package.packageDigest), "作品分享 mock 应保存 64 位 packageDigest。");
    assert(pushedMock.packageDigest === mock.state.package.packageDigest, "作品分享发布结果应返回远端接受后的包摘要。");
    assert(mock.state.package.records[0].id === shareLinkForRemote.record.id, "作品分享 mock 应在内存中保存最近分享包。");
    assert(mock.state.package.shares[0].html.includes("MR 书法作品分享"), "作品分享 mock 应保存真实 HTML 分享页。");
    assert(mock.state.receipts[0].workspaceId === "share-alpha", "作品分享 mock 回执应包含 workspace。");
    assert(/^[a-f0-9]{64}$/.test(mock.state.receipts[0].receiptDigest), "作品分享 mock 应返回 64 位 receiptDigest。");
    assert(pushedMock.receipt.verificationStatus === "verified", "作品分享发布回执应标记本机校验通过。");
    assert(pushedMock.receipt.verificationExpectedDigest === pushedMock.receipt.receiptDigest, "作品分享发布回执应保留重算摘要。");

    const shareStatus = window.MRAppState.getShareServiceStatus("artwork-3");
    assert(shareStatus.workspaceId === "share-alpha", "分享服务状态应保存当前 workspace。");
    assert(shareStatus.lastPackageDigest === mock.state.package.packageDigest, "分享服务状态应持久化最近远端分享包摘要。");
    assert(shareStatus.lastRemotePublicUrl === pushedMock.publicUrl, "分享服务状态应保存最近远端 publicUrl。");
    assert(shareStatus.receiptCount === 1, "分享服务状态应统计远端回执数量。");
    assert(shareStatus.lastReceipt.receiptDigest === mock.state.receipts[0].receiptDigest, "分享服务状态应持久化最近回执。");
    assert(shareStatus.lastReceipt.verificationStatus === "verified", "分享服务状态应持久化回执校验状态。");
    const remoteShareRecord = shareStatus.records.find((record) => record.id === shareLinkForRemote.record.id);
    assert(remoteShareRecord.remoteWorkspaceId === "share-alpha", "分享记录应保存远端 workspace。");
    assert(remoteShareRecord.remotePublicUrl === pushedMock.publicUrl, "分享记录应保存自己的远端 publicUrl。");
    assert(remoteShareRecord.remoteReceiptDigest === mock.state.receipts[0].receiptDigest, "分享记录应保存远端回执摘要。");
    const shareReceiptAudit = window.MRAppState.getShareRepositoryReceiptAudit();
    assert(shareReceiptAudit.kind === "mr-calligraphy-share-repository-receipt-audit-v1", "作品分享回执审计应包含稳定 kind。");
    assert(shareReceiptAudit.workspaceId === "share-alpha", "作品分享回执审计应返回当前 workspace。");
    assert(shareReceiptAudit.total === 1, "作品分享回执审计应统计最近回执。");
    assert(shareReceiptAudit.verifiedCount === 1, "作品分享回执审计应统计本机校验通过数量。");
    assert(shareReceiptAudit.latestReceipt.publicUrl === pushedMock.publicUrl, "作品分享回执审计应保留 publicUrl。");
    assert(shareReceiptAudit.latestReceipt.verificationStatus === "verified", "作品分享回执审计应保留校验状态。");
    const shareReceiptExport = window.MRAppState.getShareRepositoryReceiptAuditExport();
    assert(shareReceiptExport.ok, "作品分享远端回执应可导出 HTML 审计。");
    assert(shareReceiptExport.filename.includes("mr-calligraphy-share-repository-receipts"), "作品分享回执审计导出应返回稳定文件名。");
    assert(shareReceiptExport.html.includes("MR 书法作品分享远端回执审计"), "作品分享回执审计 HTML 应包含标题。");
    assert(shareReceiptExport.html.includes("share-alpha"), "作品分享回执审计 HTML 应包含 workspace。");
    assert(shareReceiptExport.html.includes(pushedMock.publicUrl), "作品分享回执审计 HTML 应包含远端 publicUrl。");
    assert(shareReceiptExport.html.includes(mock.state.receipts[0].receiptDigest), "作品分享回执审计 HTML 应包含 receiptDigest。");
    assert(shareReceiptExport.html.includes("本机校验通过"), "作品分享回执审计 HTML 应包含本机校验结果。");
    assert(shareReceiptExport.html.includes("重算摘要"), "作品分享回执审计 HTML 应包含重算摘要字段。");

    const checkedAfterPush = await window.MRAppState.checkRemoteShareService();
    assert(checkedAfterPush.ok && checkedAfterPush.package.records.length === 1, "作品分享 mock GET 应返回最近 PUT 保存的分享包。");
    assert(checkedAfterPush.package.workspaceId === "share-alpha", "作品分享 mock GET 应返回当前 workspace 的分享包。");
    assert(checkedAfterPush.package.packageDigest === mock.state.package.packageDigest, "作品分享 mock GET 应返回可验真的分享包摘要。");
    assert(checkedAfterPush.receipt.receiptDigest === mock.state.receipts[0].receiptDigest, "作品分享 GET 检查应带回最近回执。");

    const tamperedSharePackage = JSON.parse(JSON.stringify(mock.state.package));
    tamperedSharePackage.records[0].title = "被篡改的分享标题";
    global.fetch = async () => createJsonResponse({
      ok: true,
      package: tamperedSharePackage,
      latestReceipt: mock.state.receipts[0]
    });
    const tamperedSharePackageCheck = await window.MRAppState.checkRemoteShareService();
    assert(!tamperedSharePackageCheck.ok, "作品分享远端篡改包应被摘要校验拒绝。");
    assert(tamperedSharePackageCheck.message.includes("摘要校验失败"), "作品分享远端篡改包应返回摘要校验失败原因。");
    global.fetch = fetchApi;

    const configuredBeta = window.MRAppState.configureShareServiceRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "share-token",
      workspaceId: "share-beta"
    });
    assert(configuredBeta.ok && configuredBeta.status.workspaceId === "share-beta", "作品分享应能切换到第二个 workspace。");
    const betaCheck = await window.MRAppState.checkRemoteShareService();
    assert(betaCheck.ok && betaCheck.package === null, "切换到 beta workspace 后不应读到 alpha 分享包。");
    const configuredAlphaAgain = window.MRAppState.configureShareServiceRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "share-token",
      workspaceId: "share-alpha"
    });
    assert(configuredAlphaAgain.ok && configuredAlphaAgain.status.workspaceId === "share-alpha", "作品分享应能切回 alpha workspace。");
    const alphaCheck = await window.MRAppState.checkRemoteShareService();
    assert(alphaCheck.ok && alphaCheck.package.records[0].id === shareLinkForRemote.record.id, "切回 alpha workspace 后应能读回原分享包。");

    const revokedRemote = await window.MRAppState.revokeArtworkShareRemote(shareLinkForRemote.record.id);
    assert(revokedRemote.ok, "作品分享 mock 应接收真实 DELETE 撤销。");
    assert(revokedRemote.receipt.workspaceId === "share-alpha", "作品分享撤销回执应包含 workspace。");
    assert(revokedRemote.receipt.shareId === shareLinkForRemote.record.id, "远端撤销回执应指向分享 ID。");
    assert(revokedRemote.receipt.verificationStatus === "verified", "作品分享撤销回执应标记本机校验通过。");
    assert(revokedRemote.receipt.verificationAction === "revoke", "作品分享撤销回执应识别为撤销动作。");
    assert(mock.state.revokedShares[0].workspaceId === "share-alpha", "作品分享 mock 撤销记录应包含 workspace。");
    assert(mock.state.revokedShares[0].shareId === shareLinkForRemote.record.id, "作品分享 mock 应记录撤销过的分享 ID。");
    assert(mock.state.package.records[0].remoteRevokedAt, "作品分享 mock 最近包应标记分享已远端撤销。");
    assert(/^[a-f0-9]{64}$/.test(mock.state.package.packageDigest), "作品分享 mock 撤销后应重新生成 packageDigest。");
    const revokedShareStatus = window.MRAppState.getShareServiceStatus("artwork-3");
    const revokedShareRecord = revokedShareStatus.records.find((record) => record.id === shareLinkForRemote.record.id);
    assert(revokedShareRecord.remoteRevokedAt, "分享记录应保存远端撤销时间。");
    assert(revokedShareRecord.remoteWorkspaceId === "share-alpha", "撤销后分享记录仍应保留远端 workspace。");
    assert(revokedShareRecord.remoteRevokeReceiptDigest === revokedRemote.receipt.receiptDigest, "分享记录应保存远端撤销回执摘要。");
    assert(revokedShareStatus.lastRemoteDirection === "revoke", "分享服务状态应记录最近远端方向为撤销。");
    assert(revokedShareStatus.receiptCount >= 2, "分享服务状态应同时保留发布和撤销回执。");
    const revokedShareReceiptAudit = window.MRAppState.getShareRepositoryReceiptAudit();
    assert(revokedShareReceiptAudit.latestReceipt.direction === "revoke", "作品分享回执审计应把撤销回执放在最近位置。");
    assert(revokedShareReceiptAudit.latestReceipt.verificationStatus === "verified", "作品分享撤销回执审计应保留校验状态。");
    const revokedShareReceiptExport = window.MRAppState.getShareRepositoryReceiptAuditExport();
    assert(revokedShareReceiptExport.html.includes("撤销"), "作品分享回执审计 HTML 应包含撤销方向。");
    assert(revokedShareReceiptExport.html.includes("本机校验通过"), "作品分享回执审计 HTML 应包含撤销校验结果。");

    global.fetch = async () => createJsonResponse({
      ok: true,
      message: "远端返回了被篡改的作品分享回执。",
      package: mock.state.workspaces["share-alpha"].package,
      latestReceipt: {
        ...mock.state.receipts[0],
        receiptDigest: "0".repeat(64)
      }
    });
    const tamperedShareReceiptCheck = await window.MRAppState.checkRemoteShareService();
    assert(tamperedShareReceiptCheck.ok, "作品分享篡改回执检查仍应完成远端读取。");
    assert(tamperedShareReceiptCheck.receipt.verificationStatus === "digest-mismatch", "作品分享篡改回执应被标记为摘要不匹配。");
    global.fetch = fetchApi;

    const badTokenConfig = window.MRAppState.configureShareServiceRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "bad-token",
      workspaceId: "share-alpha"
    });
    assert(badTokenConfig.ok, "作品分享 mock 错误 token 配置应仍可保存以便检查失败态。");
    const rejected = await window.MRAppState.checkRemoteShareService();
    assert(!rejected.ok && rejected.message.includes("HTTP 401"), "作品分享 mock 应拒绝错误 Bearer token。");
  } finally {
    global.fetch = previousFetch;
    await mock.close();
  }
}

async function runReportRepositoryMockServerChecks(fetchApi) {
  assert(fetchApi, "当前 Node 环境需要支持 fetch 以验证报告仓库 mock 服务。");
  const packageResult = window.MRAppState.getReportRepositoryPackage();
  assert(packageResult.ok, "报告 repository 应能生成 JSON 同步包。");
  assert(packageResult.package.kind === "mr-calligraphy-report-repository-v1", "报告同步包应包含稳定 kind。");
  assert(packageResult.package.workspaceId === "local-browser", "报告同步包应包含默认 workspaceId。");
  assert(packageResult.package.source.workspaceId === "local-browser", "报告同步包 source 应包含默认 workspaceId。");
  assert(packageResult.package.digestAlgorithm === "sha256-stable-json", "报告同步包应声明稳定 JSON 摘要算法。");
  assert(/^[a-f0-9]{64}$/.test(packageResult.package.packageDigest), "报告同步包应包含 64 位 packageDigest。");
  assert(packageResult.package.reports.length >= 3, "报告同步包应包含报告记录。");
  assert(packageResult.package.verifications.length === packageResult.package.reports.length, "报告同步包应包含每份报告的验真摘要。");
  const reviewedReportPackage = packageResult.package.reports.find((item) => item.id === "report-2");
  assert(reviewedReportPackage.teacherReview.note.includes("竖钩"), "报告同步包应保留教师批注内容。");
  const tamperedReportPackage = JSON.parse(JSON.stringify(packageResult.package));
  tamperedReportPackage.reports[0].summary = "被篡改的报告仓库摘要";
  const tamperedReportImport = window.MRAppState.importReportRepositoryPackage(tamperedReportPackage);
  assert(!tamperedReportImport.ok && tamperedReportImport.message.includes("摘要校验失败"), "篡改报告仓库同步包应被摘要校验拒绝。");

  const previousFetch = global.fetch;
  const mock = await startReportRepositoryMockServer({ token: "report-token" });
  try {
    global.fetch = fetchApi;
    const configuredMock = window.MRAppState.configureReportRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "report-token",
      workspaceId: "report-alpha"
    });
    assert(configuredMock.ok, "报告仓库 mock endpoint 应可保存为远端配置。");
    assert(configuredMock.status.workspaceId === "report-alpha", "报告仓库远端配置应保存 workspace。");

    const checkedBeforePush = await window.MRAppState.checkRemoteReportRepository();
    assert(checkedBeforePush.ok, "报告仓库 mock GET 检查应真实可访问。");
    assert(checkedBeforePush.package === null, "报告仓库 mock 初始未接收包时不应伪造远端报告。");

    const pushedMock = await window.MRAppState.pushReportRepositoryToRemote();
    assert(pushedMock.ok, "报告仓库 mock 应接收真实 PUT 推送。");
    assert(pushedMock.packageId.startsWith("mock-report-repository-report-alpha-"), "报告仓库 mock 应返回带 workspace 的服务端 packageId。");
    assert(mock.state.package.packageId === pushedMock.packageId, "报告仓库 mock 应在内存中保存最近报告包。");
    assert(mock.state.package.workspaceId === "report-alpha", "报告仓库 mock 应把最近包写入当前 workspace。");
    assert(mock.state.package.digestAlgorithm === "sha256-stable-json", "报告仓库 mock 应保存摘要算法。");
    assert(/^[a-f0-9]{64}$/.test(mock.state.package.packageDigest), "报告仓库 mock 应保存 64 位包摘要。");
    assert(pushedMock.packageDigest === mock.state.package.packageDigest, "报告仓库推送结果应返回服务端接受包摘要。");
    assert(mock.state.workspaces["report-alpha"].package.packageId === pushedMock.packageId, "报告仓库 mock 应按 workspace 保存报告包。");
    assert(mock.state.package.summary.teacherReviewedReportCount === 1, "报告仓库 mock 应保存带教师批注报告计数。");
    assert(mock.state.package.verifications.every((item) => /^[a-f0-9]{64}$/.test(item.digest)), "报告仓库 mock 应保存 64 位报告摘要。");
    assert(mock.state.receipts[0].repositoryDigest, "报告仓库 mock 应返回 repositoryDigest 回执。");
    assert(mock.state.receipts[0].signatureAlgorithm === "HMAC-SHA256", "报告仓库 mock 应返回 HMAC-SHA256 签名算法。");
    assert(mock.state.receipts[0].signingKeyId === "report-repository-mock-hmac-v1", "报告仓库 mock 应返回签名 key id。");
    assert(mock.state.receipts[0].workspaceId === "report-alpha", "报告仓库 mock 签名回执应包含 workspace。");
    assert(/^[a-f0-9]{64}$/.test(mock.state.receipts[0].signature), "报告仓库 mock 应返回 64 位签名。");
    assert(pushedMock.signedReceipt.signature === mock.state.receipts[0].signature, "报告仓库推送结果应暴露服务端签名回执。");
    assert(pushedMock.signedReceipt.workspaceId === "report-alpha", "报告仓库推送结果应保留签名回执 workspace。");
    assert(pushedMock.signedReceipt.verificationStatus === "verified", "报告仓库推送结果应标记回执本机校验通过。");
    assert(pushedMock.signedReceipt.verificationExpectedDigest === pushedMock.signedReceipt.receiptDigest, "报告仓库推送结果应保留重算回执摘要。");
    const signedStatus = window.MRAppState.getReportRepositoryStatus();
    assert(signedStatus.lastPackageDigest === mock.state.package.packageDigest, "报告仓库状态应持久化推送包摘要。");
    assert(signedStatus.lastSignedReceipt.signature === mock.state.receipts[0].signature, "报告仓库状态应持久化最近签名回执。");
    assert(signedStatus.workspaceId === "report-alpha", "报告仓库状态应持久化当前 workspace。");
    assert(signedStatus.lastSignedReceipt.workspaceId === "report-alpha", "报告仓库状态应持久化签名回执 workspace。");
    assert(signedStatus.lastSignedReceipt.verificationStatus === "verified", "报告仓库状态应持久化本机校验状态。");
    assert(signedStatus.signedReceiptCount === 1, "报告仓库状态应记录签名回执审计数量。");
    assert(signedStatus.signedReceipts[0].direction === "push", "报告仓库签名回执审计应记录推送方向。");
    assert(signedStatus.signedReceipts[0].verificationStatus === "verified", "报告仓库签名回执审计应保留校验通过状态。");
    assert(signedStatus.message.includes("签名回执"), "报告仓库状态摘要应提示最近签名回执。");
    assert(signedStatus.message.includes("本机校验通过"), "报告仓库状态摘要应提示回执校验结果。");
    const receiptAudit = window.MRAppState.getReportRepositoryReceiptAudit();
    assert(receiptAudit.ok && receiptAudit.total === 1, "报告仓库签名回执审计 API 应返回最近回执。");
    assert(receiptAudit.verifiedCount === 1, "报告仓库签名回执审计应统计本机校验通过数量。");
    assert(receiptAudit.workspaceId === "report-alpha", "报告仓库签名回执审计应返回当前 workspace。");
    assert(receiptAudit.receipts[0].signature === mock.state.receipts[0].signature, "报告仓库回执审计应保留签名。");
    assert(receiptAudit.receipts[0].workspaceId === "report-alpha", "报告仓库回执审计应保留 workspace。");
    assert(receiptAudit.receipts[0].verificationStatus === "verified", "报告仓库回执审计应保留校验状态。");
    const receiptExport = window.MRAppState.getReportRepositoryReceiptAuditExport();
    assert(receiptExport.ok && receiptExport.html.includes("MR 书法报告仓库签名回执审计"), "报告仓库回执审计应可导出 HTML。");
    assert(receiptExport.html.includes(mock.state.receipts[0].signature), "报告仓库回执审计 HTML 应包含签名。");
    assert(receiptExport.html.includes("report-alpha"), "报告仓库回执审计 HTML 应包含 workspace。");
    assert(receiptExport.html.includes("本机校验通过"), "报告仓库回执审计 HTML 应包含校验结果。");

    const tamperedReceiptPackage = refreshPackageDigestInPlace({
      ...packageResult.package,
      packageId: "tampered-report-package",
      workspaceId: "report-alpha"
    });
    const tamperedResponse = new Response(JSON.stringify({
      ok: true,
      message: "篡改回执测试",
      package: tamperedReceiptPackage,
      receipt: {
        ...mock.state.receipts[0],
        sourcePackageId: "tampered-report-package",
        receiptDigest: "f".repeat(64),
        signature: "d".repeat(64)
      }
    }), { status: 200, headers: { "Content-Type": "application/json" } });
    const previousMockFetch = global.fetch;
    global.fetch = async () => tamperedResponse.clone();
    const tamperedCheck = await window.MRAppState.checkRemoteReportRepository();
    assert(tamperedCheck.ok, "报告仓库应能读取带篡改回执的远端响应用于本机校验。");
    assert(tamperedCheck.signedReceipt.verificationStatus === "digest-mismatch", "篡改回执应被标记为摘要不匹配。");
    assert(tamperedCheck.signedReceipt.verificationExpectedDigest !== tamperedCheck.signedReceipt.receiptDigest, "篡改回执应保留重算摘要用于对比。");
    global.fetch = previousMockFetch;

    const checkedAfterPush = await window.MRAppState.checkRemoteReportRepository();
    assert(checkedAfterPush.ok && checkedAfterPush.package.reports.length === mock.state.package.reports.length, "报告仓库 mock GET 应返回最近 PUT 保存的报告包。");
    assert(checkedAfterPush.package.packageDigest === mock.state.package.packageDigest, "报告仓库 GET 应返回同一个包摘要。");
    assert(checkedAfterPush.signedReceipt.signature === mock.state.receipts[0].signature, "报告仓库 GET 检查应带回最近签名回执。");

    const pulledMock = await window.MRAppState.pullReportRepositoryFromRemote();
    assert(pulledMock.ok, "报告仓库 mock 应支持真实 GET 拉取。");
    assert(pulledMock.pulledReportCount === mock.state.package.reports.length, "报告仓库 mock 拉取结果应保留远端报告数量。");
    assert(pulledMock.signedReceipt.signature === mock.state.receipts[0].signature, "报告仓库拉取结果应保留远端签名回执。");
    assert(pulledMock.signedReceipt.workspaceId === "report-alpha", "报告仓库拉取结果应保留远端签名回执 workspace。");
    assert(pulledMock.skippedConflictCount === 0, "相同报告包拉取不应伪造冲突。");

    const alphaPackageId = pushedMock.packageId;
    const configuredBeta = window.MRAppState.configureReportRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "report-token",
      workspaceId: "report-beta"
    });
    assert(configuredBeta.ok && configuredBeta.status.workspaceId === "report-beta", "报告仓库应能切换到第二个 workspace。");
    assert(configuredBeta.status.signedReceiptCount === 0, "报告仓库切换 workspace 后不应复用其它空间回执。");
    assert(configuredBeta.status.lastConflictReports.length === 0, "报告仓库切换 workspace 后不应复用其它空间冲突审计。");

    const checkedBetaBeforePush = await window.MRAppState.checkRemoteReportRepository();
    assert(checkedBetaBeforePush.ok && checkedBetaBeforePush.package === null, "报告仓库 mock 新 workspace 初始应为空。");
    const pushedBeta = await window.MRAppState.pushReportRepositoryToRemote();
    assert(pushedBeta.ok && pushedBeta.packageId.startsWith("mock-report-repository-report-beta-"), "报告仓库 mock 应保存 beta workspace 包。");
    assert(mock.state.workspaces["report-beta"].package.packageId === pushedBeta.packageId, "报告仓库 mock beta workspace 应有独立包。");
    assert(mock.state.workspaces["report-alpha"].package.packageId === alphaPackageId, "报告仓库 mock alpha workspace 不应被 beta 覆盖。");

    const configuredAlphaAgain = window.MRAppState.configureReportRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "report-token",
      workspaceId: "report-alpha"
    });
    assert(configuredAlphaAgain.ok && configuredAlphaAgain.status.workspaceId === "report-alpha", "报告仓库应能切回 alpha workspace。");
    const checkedAlphaAgain = await window.MRAppState.checkRemoteReportRepository();
    assert(checkedAlphaAgain.ok && checkedAlphaAgain.package.packageId === alphaPackageId, "报告仓库切回 alpha 应读取 alpha 最近包。");
    const alphaWorkspace = mock.state.workspaces["report-alpha"];

    alphaWorkspace.package.reports[0] = {
      ...alphaWorkspace.package.reports[0],
      summary: "远端报告修改不应覆盖本机同 ID 报告。"
    };
    refreshPackageDigestInPlace(alphaWorkspace.package);
    const conflictPull = await window.MRAppState.pullReportRepositoryFromRemote();
    assert(conflictPull.ok && conflictPull.skippedConflictCount >= 1, "报告仓库同 ID 差异应跳过并提示冲突。");
    const conflictStatus = window.MRAppState.getReportRepositoryStatus();
    assert(conflictStatus.lastSkippedConflictCount >= 1, "报告仓库状态应记录跳过冲突数量。");
    assert(conflictStatus.lastConflictReports.length >= 1, "报告仓库状态应保存同 ID 差异冲突审计。");
    const firstConflict = conflictStatus.lastConflictReports[0];
    assert(firstConflict.fieldDiffs.some((field) => field.field === "summary"), "报告仓库冲突审计应记录字段差异。");
    const conflictList = window.MRAppState.getReportRepositoryConflicts();
    assert(conflictList.ok && conflictList.count >= 1, "报告仓库冲突查询 API 应返回待处理审计。");
    const mergeResult = window.MRAppState.resolveReportRepositoryConflict("merge-fields", {
      conflictId: firstConflict.conflictId,
      selections: { summary: "remote" }
    });
    assert(mergeResult.ok && mergeResult.remoteFieldCount >= 1, "报告仓库冲突应支持字段级合并。");
    const mergedReport = window.MRAppState.getState().reports.find((item) => item.id === firstConflict.id);
    assert(mergedReport.summary.includes("远端报告修改"), "报告字段级合并应只把选择的远端字段写回本机报告。");
    assert(window.MRAppState.getReportRepositoryStatus().lastConflictReports.length === 0, "字段级合并后应清理对应报告冲突审计。");

    alphaWorkspace.package.reports[2] = {
      ...alphaWorkspace.package.reports[2],
      title: "远端冲突报告副本"
    };
    refreshPackageDigestInPlace(alphaWorkspace.package);
    const copyConflictPull = await window.MRAppState.pullReportRepositoryFromRemote();
    assert(copyConflictPull.ok && copyConflictPull.skippedConflictCount >= 1, "报告仓库应能再次记录同 ID 差异冲突。");
    const copyConflict = window.MRAppState.getReportRepositoryStatus().lastConflictReports[0];
    const reportCountBeforeCopy = window.MRAppState.getState().reports.length;
    const copyResult = window.MRAppState.resolveReportRepositoryConflict("copy-remote", {
      conflictId: copyConflict.conflictId
    });
    assert(copyResult.ok && copyResult.copiedCount === 1, "报告仓库冲突应支持另存远端副本。");
    const copiedReports = window.MRAppState.getState().reports.filter((item) => item.title.includes("远端冲突报告副本"));
    assert(window.MRAppState.getState().reports.length === reportCountBeforeCopy + 1, "另存远端副本应新增一份本机报告。");
    assert(copiedReports.some((item) => item.title.includes("远端副本")), "远端报告副本标题应标记来源。");

    const badTokenConfig = window.MRAppState.configureReportRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "bad-token",
      workspaceId: "report-alpha"
    });
    assert(badTokenConfig.ok, "报告仓库 mock 错误 token 配置应仍可保存以便检查失败态。");
    const rejected = await window.MRAppState.checkRemoteReportRepository();
    assert(!rejected.ok && rejected.message.includes("HTTP 401"), "报告仓库 mock 应拒绝错误 Bearer token。");
  } finally {
    global.fetch = previousFetch;
    await mock.close();
  }
}

async function runHistoryRepositoryMockServerChecks(fetchApi) {
  assert(fetchApi, "当前 Node 环境需要支持 fetch 以验证学习档案仓库 mock 服务。");
  const packageResult = window.MRAppState.getHistoryRepositoryPackage();
  assert(packageResult.ok, "学习档案 repository 应能生成 JSON 同步包。");
  assert(packageResult.package.kind === "mr-calligraphy-history-repository-v1", "学习档案同步包应包含稳定 kind。");
  assert(packageResult.package.workspaceId === "local-browser", "学习档案同步包应包含默认 workspaceId。");
  assert(packageResult.package.source.workspaceId === "local-browser", "学习档案同步包 source 应记录 workspaceId。");
  assert(packageResult.package.records.sessions.length >= 3, "学习档案同步包应包含练习记录。");
  assert(packageResult.package.records.artworks.length >= 3, "学习档案同步包应包含作品记录。");
  assert(packageResult.package.records.reports.length >= 3, "学习档案同步包应包含报告记录。");
  assert(packageResult.package.records.stages.length >= 3, "学习档案同步包应包含阶段记录。");
  assert(packageResult.package.history.some((item) => item.type === "stage"), "学习档案详情快照应包含阶段记录。");
  assert(packageResult.package.summary.teacherReviewedReportCount === 1, "学习档案同步包应统计带教师批注报告数量。");
  assert(packageResult.package.digestAlgorithm === "sha256-stable-json", "学习档案同步包应声明稳定 JSON 摘要算法。");
  assert(/^[a-f0-9]{64}$/.test(packageResult.package.packageDigest), "学习档案同步包应包含 64 位 packageDigest。");
  const reviewedReportPackage = packageResult.package.records.reports.find((item) => item.id === "report-2");
  assert(reviewedReportPackage.teacherReview.note.includes("竖钩"), "学习档案同步包应保留报告教师批注内容。");
  const reviewedHistoryDetail = packageResult.package.history.find((item) => item.id === "report-2");
  assert(reviewedHistoryDetail.teacherReview.note.includes("结构更稳"), "学习档案详情快照应保留教师批注。");
  const historyRepositoryPackageJson = JSON.stringify(packageResult.package, null, 2);
  const historyRepositoryExportReceipt = window.MRAppState.recordHistoryRepositoryExportReceipt({
    filename: packageResult.filename,
    package: packageResult.package,
    content: historyRepositoryPackageJson,
    exportedAt: packageResult.package.exportedAt
  });
  assert(historyRepositoryExportReceipt.ok, "学习档案仓库 JSON 同步包导出应能记录本机回执。");
  assert(historyRepositoryExportReceipt.receipt.kind === "mr-calligraphy-history-repository-export-audit-v1", "学习档案仓库导出回执应返回稳定 kind。");
  assert(historyRepositoryExportReceipt.receipt.recordCount === packageResult.package.summary.total, "学习档案仓库导出回执应记录总档案数量。");
  assert(historyRepositoryExportReceipt.receipt.practiceCount === packageResult.package.summary.practiceCount, "学习档案仓库导出回执应记录练习数量。");
  assert(historyRepositoryExportReceipt.receipt.artworkCount === packageResult.package.summary.artworkCount, "学习档案仓库导出回执应记录作品数量。");
  assert(historyRepositoryExportReceipt.receipt.reportCount === packageResult.package.summary.reportCount, "学习档案仓库导出回执应记录报告数量。");
  assert(historyRepositoryExportReceipt.receipt.stageCount === packageResult.package.summary.stageCount, "学习档案仓库导出回执应记录阶段数量。");
  assert(historyRepositoryExportReceipt.receipt.packageDigest === packageResult.package.packageDigest, "学习档案仓库导出回执应记录包摘要。");
  assert(historyRepositoryExportReceipt.receipt.fileDigest === crypto.createHash("sha256").update(historyRepositoryPackageJson).digest("hex"), "学习档案仓库导出回执应记录 JSON 文件摘要。");
  assert(historyRepositoryExportReceipt.receipt.receiptDigest.match(/^[a-f0-9]{64}$/), "学习档案仓库导出回执应包含回执摘要。");
  assert(historyRepositoryExportReceipt.receipt.boundary.includes("不是云端档案仓库日志"), "学习档案仓库导出回执应说明本机边界。");
  const historyRepositoryExportAudit = window.MRAppState.getHistoryRepositoryExportAudit({ limit: 5 });
  assert(historyRepositoryExportAudit.kind === "mr-calligraphy-history-repository-export-audit-v1", "学习档案仓库导出审计应返回稳定 kind。");
  assert(historyRepositoryExportAudit.total === 1, "学习档案仓库导出审计应统计同步包导出回执。");
  assert(historyRepositoryExportAudit.latestReceipt.packageDigest === packageResult.package.packageDigest, "学习档案仓库导出审计应保留最近包摘要。");
  assert(/^[a-f0-9]{64}$/.test(historyRepositoryExportAudit.auditDigest), "学习档案仓库导出审计应包含稳定摘要。");
  const historyRepositoryExportAuditExport = window.MRAppState.getHistoryRepositoryExportAuditExport({ limit: 5 });
  assert(historyRepositoryExportAuditExport.ok, "学习档案仓库导出审计应可导出 HTML。");
  assert(historyRepositoryExportAuditExport.filename.startsWith("mr-calligraphy-history-repository-export-audit-"), "学习档案仓库导出审计文件名应可识别。");
  assert(historyRepositoryExportAuditExport.html.includes("MR 书法学习档案仓库导出回执审计"), "学习档案仓库导出审计 HTML 应包含标题。");
  assert(historyRepositoryExportAuditExport.html.includes(packageResult.package.packageDigest), "学习档案仓库导出审计 HTML 应包含包摘要。");
  assert(historyRepositoryExportAuditExport.html.includes(historyRepositoryExportAuditExport.audit.auditDigest), "学习档案仓库导出审计 HTML 应包含审计摘要。");
  const tamperedHistoryPackage = JSON.parse(JSON.stringify(packageResult.package));
  tamperedHistoryPackage.records.sessions[0].title = "被篡改的学习档案";
  const tamperedHistoryImport = window.MRAppState.importHistoryRepositoryPackage(tamperedHistoryPackage);
  assert(!tamperedHistoryImport.ok && tamperedHistoryImport.message.includes("摘要校验失败"), "篡改学习档案同步包应被摘要校验拒绝。");

  const previousFetch = global.fetch;
  const mock = await startHistoryRepositoryMockServer({ token: "history-token" });
  try {
    global.fetch = fetchApi;
    const configuredMock = window.MRAppState.configureHistoryRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "history-token",
      workspaceId: "history-alpha"
    });
    assert(configuredMock.ok, "学习档案仓库 mock endpoint 应可保存为远端配置。");
    assert(configuredMock.status.workspaceId === "history-alpha", "学习档案仓库 mock 配置应保存 workspace。");

    const checkedBeforePush = await window.MRAppState.checkRemoteHistoryRepository();
    assert(checkedBeforePush.ok, "学习档案仓库 mock GET 检查应真实可访问。");
    assert(checkedBeforePush.package === null, "学习档案仓库 mock 初始未接收包时不应伪造远端档案。");

    const pushedMock = await window.MRAppState.pushHistoryRepositoryToRemote();
    assert(pushedMock.ok, "学习档案仓库 mock 应接收真实 PUT 推送。");
    assert(pushedMock.packageId.startsWith("mock-history-repository-history-alpha-"), "学习档案仓库 mock 应返回包含 workspace 的服务端 packageId。");
    assert(mock.state.package.packageId === pushedMock.packageId, "学习档案仓库 mock 应在内存中保存最近档案包。");
    assert(mock.state.package.workspaceId === "history-alpha", "学习档案仓库 mock 应把档案包保存到 alpha workspace。");
    assert(mock.state.package.digestAlgorithm === "sha256-stable-json", "学习档案仓库 mock 应保存摘要算法。");
    assert(/^[a-f0-9]{64}$/.test(mock.state.package.packageDigest), "学习档案仓库 mock 应保存 64 位包摘要。");
    assert(pushedMock.packageDigest === mock.state.package.packageDigest, "学习档案仓库推送结果应返回本机包摘要。");
    assert(mock.state.workspaces["history-alpha"].package.packageId === pushedMock.packageId, "学习档案仓库 mock 应按 workspace 隔离保存 alpha 包。");
    assert(mock.state.package.summary.teacherReviewedReportCount === 1, "学习档案仓库 mock 应保存带教师批注报告计数。");
    assert(mock.state.package.records.reports.find((item) => item.id === "report-2").teacherReview.note.includes("竖钩"), "学习档案仓库 mock 应保存教师批注内容。");
    assert(mock.state.receipts[0].repositoryDigest, "学习档案仓库 mock 应返回 repositoryDigest 回执。");
    assert(mock.state.receipts[0].workspaceId === "history-alpha", "学习档案仓库 mock 回执应包含 workspace。");
    assert(pushedMock.receipt.verificationStatus === "verified", "学习档案仓库回执应标记本机校验通过。");
    assert(pushedMock.receipt.verificationExpectedDigest === pushedMock.receipt.receiptDigest, "学习档案仓库回执应保留重算摘要。");
    const historyStatusAfterPush = window.MRAppState.getHistoryRepositoryStatus();
    assert(historyStatusAfterPush.lastPackageDigest === mock.state.package.packageDigest, "学习档案仓库状态应持久化推送包摘要。");
    assert(historyStatusAfterPush.lastReceipt.verificationStatus === "verified", "学习档案仓库状态应持久化回执校验。");
    assert(historyStatusAfterPush.receiptCount === 1, "学习档案仓库状态应统计回执数量。");
    const historyReceiptAudit = window.MRAppState.getHistoryRepositoryReceiptAudit();
    assert(historyReceiptAudit.kind === "mr-calligraphy-history-repository-receipt-audit-v1", "学习档案仓库回执审计应包含稳定 kind。");
    assert(historyReceiptAudit.workspaceId === "history-alpha", "学习档案仓库回执审计应返回当前 workspace。");
    assert(historyReceiptAudit.total === 1, "学习档案仓库回执审计应统计最近回执。");
    assert(historyReceiptAudit.verifiedCount === 1, "学习档案仓库回执审计应统计本机校验通过数量。");
    assert(historyReceiptAudit.latestReceipt.verificationStatus === "verified", "学习档案仓库回执审计应保留校验状态。");
    const historyReceiptExport = window.MRAppState.getHistoryRepositoryReceiptAuditExport();
    assert(historyReceiptExport.ok, "学习档案仓库回执应可导出 HTML 审计。");
    assert(historyReceiptExport.filename.includes("mr-calligraphy-history-repository-receipts"), "学习档案仓库回执审计导出应返回稳定文件名。");
    assert(historyReceiptExport.html.includes("MR 书法学习档案仓库回执审计"), "学习档案仓库回执审计 HTML 应包含标题。");
    assert(historyReceiptExport.html.includes("history-alpha"), "学习档案仓库回执审计 HTML 应包含 workspace。");
    assert(historyReceiptExport.html.includes(mock.state.receipts[0].receiptDigest), "学习档案仓库回执审计 HTML 应包含 receiptDigest。");
    assert(historyReceiptExport.html.includes("本机校验通过"), "学习档案仓库回执审计 HTML 应包含本机校验结果。");
    assert(historyReceiptExport.html.includes("重算摘要"), "学习档案仓库回执审计 HTML 应包含重算摘要字段。");

    const checkedAfterPush = await window.MRAppState.checkRemoteHistoryRepository();
    assert(checkedAfterPush.ok && checkedAfterPush.package.summary.total === mock.state.package.summary.total, "学习档案仓库 mock GET 应返回最近 PUT 保存的档案包。");
    assert(checkedAfterPush.package.packageDigest === mock.state.package.packageDigest, "学习档案仓库 GET 应返回同一个包摘要。");
    assert(checkedAfterPush.package.summary.teacherReviewedReportCount === 1, "学习档案仓库 mock GET 应返回教师批注摘要。");

    const pulledMock = await window.MRAppState.pullHistoryRepositoryFromRemote();
    assert(pulledMock.ok, "学习档案仓库 mock 应支持真实 GET 拉取。");
    assert(pulledMock.pulledRecordCount === mock.state.package.summary.total, "学习档案仓库 mock 拉取结果应保留远端记录数量。");
    assert(window.MRAppState.getReportDetail("report-2").teacherReview.note.includes("竖钩"), "学习档案仓库拉取后本机报告教师批注不应丢失。");

    const configuredBeta = window.MRAppState.configureHistoryRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "history-token",
      workspaceId: "history-beta"
    });
    assert(configuredBeta.ok && configuredBeta.status.lastConflictRecords.length === 0, "切换学习档案仓库 workspace 应清空本机冲突审计视图。");
    const betaBeforePush = await window.MRAppState.checkRemoteHistoryRepository();
    assert(betaBeforePush.ok && betaBeforePush.package === null, "学习档案仓库 mock 新 workspace 初始不应读取 alpha 包。");
    const betaPush = await window.MRAppState.pushHistoryRepositoryToRemote();
    assert(betaPush.ok && betaPush.packageId.startsWith("mock-history-repository-history-beta-"), "学习档案仓库 mock beta workspace 应可单独推送。");
    assert(mock.state.workspaces["history-beta"].package.packageId === betaPush.packageId, "学习档案仓库 mock 应按 workspace 隔离保存 beta 包。");
    assert(mock.state.workspaces["history-alpha"].package.packageId === pushedMock.packageId, "学习档案仓库 mock beta 推送不应覆盖 alpha 包。");
    const configuredAlphaAgain = window.MRAppState.configureHistoryRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "history-token",
      workspaceId: "history-alpha"
    });
    assert(configuredAlphaAgain.ok, "学习档案仓库 mock 应可切回 alpha workspace。");
    const alphaAgain = await window.MRAppState.checkRemoteHistoryRepository();
    assert(alphaAgain.ok && alphaAgain.package.packageId === pushedMock.packageId, "切回 alpha workspace 应读取 alpha 包。");

    const alphaWorkspace = mock.state.workspaces["history-alpha"];
    const localTitle = window.MRAppState.getState().sessions[0].title;
    alphaWorkspace.package.records.sessions[0] = {
      ...alphaWorkspace.package.records.sessions[0],
      title: "远端改名但不覆盖本机"
    };
    refreshPackageDigestInPlace(alphaWorkspace.package);
    const conflictPull = await window.MRAppState.pullHistoryRepositoryFromRemote();
    assert(conflictPull.ok && conflictPull.skippedConflictCount >= 1, "同 ID 差异学习档案应被跳过而不是静默覆盖。");
    assert(window.MRAppState.getState().sessions[0].title === localTitle, "同 ID 差异拉取不应覆盖本机练习标题。");
    const conflicts = window.MRAppState.getHistoryRepositoryConflicts();
    assert(conflicts.ok && conflicts.count >= 1, "同 ID 差异应写入学习档案冲突审计。");
    assert(conflicts.conflicts[0].fieldDiffs.length >= 1, "学习档案冲突审计应包含字段差异。");
    const mergedConflict = window.MRAppState.resolveHistoryRepositoryConflict("merge-fields", {
      conflictId: conflicts.conflicts[0].conflictId,
      selections: { title: "remote" }
    });
    assert(mergedConflict.ok && mergedConflict.remoteFieldCount >= 1, "学习档案冲突应可按字段采用远端字段。");
    assert(window.MRAppState.getState().sessions[0].title === "远端改名但不覆盖本机", "字段级合并应只把选中的远端字段写入本机练习。");
    assert(window.MRAppState.getHistoryRepositoryConflicts().count === Math.max(0, conflicts.count - 1), "字段级合并后的学习档案冲突审计应减少。");

    alphaWorkspace.package.records.sessions[0] = {
      ...alphaWorkspace.package.records.sessions[0],
      feedback: ["远端副本冲突反馈"]
    };
    refreshPackageDigestInPlace(alphaWorkspace.package);
    const copyConflictPull = await window.MRAppState.pullHistoryRepositoryFromRemote();
    assert(copyConflictPull.ok && copyConflictPull.skippedConflictCount >= 1, "第二次同 ID 差异应继续写入冲突审计。");
    const copyConflicts = window.MRAppState.getHistoryRepositoryConflicts();
    assert(copyConflicts.ok && copyConflicts.count >= 1, "另存副本前应能读取学习档案冲突审计。");
    const sessionCountBeforeCopy = window.MRAppState.getState().sessions.length;
    const copiedConflict = window.MRAppState.resolveHistoryRepositoryConflict("copy-remote", {
      conflictId: copyConflicts.conflicts[0].conflictId
    });
    assert(copiedConflict.ok && copiedConflict.copiedCount === 1, "学习档案远端冲突记录应可另存为本机副本。");
    assert(window.MRAppState.getState().sessions.length === sessionCountBeforeCopy + 1, "另存远端冲突副本应新增一条本机练习。");
    assert(window.MRAppState.getHistoryRepositoryConflicts().count === Math.max(0, copyConflicts.count - 1), "处理后的学习档案冲突审计应减少。");

    global.fetch = async () => createJsonResponse({
      ok: true,
      message: "远端返回了被篡改的学习档案仓库回执。",
      package: mock.state.workspaces["history-alpha"].package,
      latestReceipt: {
        ...mock.state.workspaces["history-alpha"].receipts[0],
        receiptDigest: "0".repeat(64)
      }
    });
    const tamperedHistoryReceiptCheck = await window.MRAppState.checkRemoteHistoryRepository();
    assert(tamperedHistoryReceiptCheck.ok, "学习档案篡改回执检查仍应完成远端读取。");
    assert(tamperedHistoryReceiptCheck.receipt.verificationStatus === "digest-mismatch", "学习档案篡改回执应被标记为摘要不匹配。");
    global.fetch = fetchApi;

    const badTokenConfig = window.MRAppState.configureHistoryRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "bad-token",
      workspaceId: "history-alpha"
    });
    assert(badTokenConfig.ok, "学习档案仓库 mock 错误 token 配置应仍可保存以便检查失败态。");
    const rejected = await window.MRAppState.checkRemoteHistoryRepository();
    assert(!rejected.ok && rejected.message.includes("HTTP 401"), "学习档案仓库 mock 应拒绝错误 Bearer token。");
  } finally {
    global.fetch = previousFetch;
    await mock.close();
  }
}

async function runPlanRepositoryMockServerChecks(fetchApi) {
  assert(fetchApi, "当前 Node 环境需要支持 fetch 以验证计划仓库 mock 服务。");
  const previousFetch = global.fetch;
  const mock = await startPlanRepositoryMockServer({ token: "plan-token" });
  try {
    global.fetch = fetchApi;
    const configuredMock = window.MRAppState.configurePlanRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "plan-token",
      workspaceId: "alpha-class"
    });
    assert(configuredMock.ok, "计划仓库 mock endpoint 应可保存为远端配置。");
    assert(configuredMock.status.workspaceId === "alpha-class", "计划仓库 mock 配置应保存 workspace。");

    const checkedBeforePush = await window.MRAppState.checkRemotePlanRepository();
    assert(checkedBeforePush.ok, "计划仓库 mock GET 检查应真实可访问。");
    assert(checkedBeforePush.package === null, "计划仓库 mock 初始未接收包时不应伪造远端计划。");

    const pushedMock = await window.MRAppState.pushPlanRepositoryToRemote();
    assert(pushedMock.ok, "计划仓库 mock 应接收真实 PUT 推送。");
    assert(pushedMock.packageId.startsWith("mock-plan-repository-alpha-class-"), "计划仓库 mock 应返回包含 workspace 的服务端 packageId。");
    assert(mock.state.package.packageId === pushedMock.packageId, "计划仓库 mock 应在内存中保存最近计划包。");
    assert(mock.state.package.workspaceId === "alpha-class", "计划仓库 mock 应把计划包保存到 alpha workspace。");
    assert(mock.state.package.digestAlgorithm === "sha256-stable-json", "计划仓库 mock 应保存摘要算法。");
    assert(/^[a-f0-9]{64}$/.test(mock.state.package.packageDigest), "计划仓库 mock 应保存 64 位包摘要。");
    assert(pushedMock.packageDigest === mock.state.package.packageDigest, "计划仓库推送结果应返回服务端接受包摘要。");
    assert(mock.state.workspaces["alpha-class"].package.packageId === pushedMock.packageId, "计划仓库 mock 应按 workspace 隔离保存 alpha 包。");
    assert(mock.state.receipts[0].repositoryDigest, "计划仓库 mock 应返回 repositoryDigest 回执。");
    assert(mock.state.receipts[0].workspaceId === "alpha-class", "计划仓库 mock 回执应包含 workspace。");
    assert(/^[a-f0-9]{64}$/.test(mock.state.receipts[0].receiptDigest), "计划仓库 mock 应返回 64 位 receiptDigest。");
    assert(pushedMock.receipt.receiptDigest === mock.state.receipts[0].receiptDigest, "计划仓库推送结果应暴露服务端回执。");
    assert(pushedMock.receipt.workspaceId === "alpha-class", "计划仓库推送结果应暴露 workspace 回执。");
    assert(pushedMock.receipt.verificationStatus === "verified", "计划仓库 mock 推送结果应标记本机校验通过。");
    assert(pushedMock.receipt.verificationExpectedDigest === pushedMock.receipt.receiptDigest, "计划仓库 mock 推送结果应保留重算摘要。");
    const receiptStatus = window.MRAppState.getPlanRepositoryStatus();
    assert(receiptStatus.lastPackageDigest === mock.state.package.packageDigest, "计划仓库状态应持久化推送包摘要。");
    assert(receiptStatus.lastReceipt.receiptDigest === mock.state.receipts[0].receiptDigest, "计划仓库状态应持久化最近回执。");
    assert(receiptStatus.lastReceipt.workspaceId === "alpha-class", "计划仓库状态应持久化回执 workspace。");
    assert(receiptStatus.lastReceipt.verificationStatus === "verified", "计划仓库状态应持久化回执校验状态。");
    assert(receiptStatus.receiptCount === 1, "计划仓库状态应统计最近回执数量。");
    assert(receiptStatus.receipts[0].direction === "push", "计划仓库回执应记录同步方向。");
    const receiptAudit = window.MRAppState.getPlanRepositoryReceiptAudit();
    assert(receiptAudit.ok && receiptAudit.total === 1, "计划仓库回执审计 API 应返回最近回执。");
    assert(receiptAudit.verifiedCount === 1, "计划仓库回执审计应统计本机校验通过数量。");
    assert(receiptAudit.receipts[0].receiptDigest === mock.state.receipts[0].receiptDigest, "计划仓库回执审计应保留 receiptDigest。");
    assert(receiptAudit.receipts[0].verificationStatus === "verified", "计划仓库回执审计应保留校验状态。");
    const receiptExport = window.MRAppState.getPlanRepositoryReceiptAuditExport();
    assert(receiptExport.ok && receiptExport.html.includes("MR 书法计划仓库回执审计"), "计划仓库回执审计应可导出 HTML。");
    assert(receiptExport.html.includes(mock.state.receipts[0].repositoryDigest), "计划仓库回执审计 HTML 应包含仓库摘要。");
    assert(receiptExport.html.includes("本机校验通过"), "计划仓库回执审计 HTML 应包含本机校验结果。");
    assert(receiptExport.html.includes("重算摘要"), "计划仓库回执审计 HTML 应包含重算摘要字段。");
    assert(receiptExport.html.includes("alpha-class"), "计划仓库回执审计 HTML 应包含 workspace。");

    const checkedAfterPush = await window.MRAppState.checkRemotePlanRepository();
    assert(checkedAfterPush.ok && checkedAfterPush.package.plans.length === mock.state.package.plans.length, "计划仓库 mock GET 应返回最近 PUT 保存的计划包。");
    assert(checkedAfterPush.package.packageDigest === mock.state.package.packageDigest, "计划仓库 GET 应返回同一个包摘要。");
    assert(checkedAfterPush.receipt.receiptDigest === mock.state.receipts[0].receiptDigest, "计划仓库 GET 检查应带回最近回执。");

    const pulledMock = await window.MRAppState.pullPlanRepositoryFromRemote({ force: true });
    assert(pulledMock.ok, "计划仓库 mock 应支持真实 GET 拉取。");
    assert(pulledMock.pulledPlanCount === mock.state.package.plans.length, "计划仓库 mock 拉取结果应保留远端计划数量。");
    assert(pulledMock.packageDigest === mock.state.package.packageDigest, "计划仓库拉取结果应返回远端包摘要。");
    assert(pulledMock.receipt.receiptDigest === mock.state.receipts[0].receiptDigest, "计划仓库拉取结果应保留远端回执。");

    const configuredBeta = window.MRAppState.configurePlanRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "plan-token",
      workspaceId: "beta-class"
    });
    assert(configuredBeta.ok && configuredBeta.status.receiptCount === 0, "切换计划仓库 workspace 应清空本机回执视图。");
    const betaBeforePush = await window.MRAppState.checkRemotePlanRepository();
    assert(betaBeforePush.ok && betaBeforePush.package === null, "计划仓库 mock 新 workspace 初始不应读取 alpha 包。");
    const betaPush = await window.MRAppState.pushPlanRepositoryToRemote();
    assert(betaPush.ok && betaPush.packageId.startsWith("mock-plan-repository-beta-class-"), "计划仓库 mock beta workspace 应可单独推送。");
    assert(mock.state.workspaces["beta-class"].package.packageId === betaPush.packageId, "计划仓库 mock 应按 workspace 隔离保存 beta 包。");
    assert(mock.state.workspaces["alpha-class"].package.packageId === pushedMock.packageId, "计划仓库 mock beta 推送不应覆盖 alpha 包。");
    const configuredAlphaAgain = window.MRAppState.configurePlanRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "plan-token",
      workspaceId: "alpha-class"
    });
    assert(configuredAlphaAgain.ok, "计划仓库 mock 应可切回 alpha workspace。");
    const alphaAgain = await window.MRAppState.checkRemotePlanRepository();
    assert(alphaAgain.ok && alphaAgain.package.packageId === pushedMock.packageId, "切回 alpha workspace 应读取 alpha 包。");

    const badTokenConfig = window.MRAppState.configurePlanRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "bad-token",
      workspaceId: "alpha-class"
    });
    assert(badTokenConfig.ok, "计划仓库 mock 错误 token 配置应仍可保存以便检查失败态。");
    const rejected = await window.MRAppState.checkRemotePlanRepository();
    assert(!rejected.ok && rejected.message.includes("HTTP 401"), "计划仓库 mock 应拒绝错误 Bearer token。");
  } finally {
    global.fetch = previousFetch;
    await mock.close();
  }
}

function createJsonResponse(payload, ok = true, status = 200) {
  return {
    ok,
    status,
    text: async () => JSON.stringify(payload)
  };
}

function sha256StableJson(value) {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex");
}

function refreshPackageDigestInPlace(packageRecord) {
  if (!packageRecord || typeof packageRecord !== "object") return packageRecord;
  delete packageRecord.packageDigest;
  packageRecord.packageDigest = sha256StableJson(packageRecord);
  return packageRecord;
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

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
    strokes: [
      [
        { x: 0.42, y: 0.18, t: 0, p: 0.45 },
        { x: 0.5, y: 0.48, t: 160, p: 0.6 }
      ],
      [
        { x: 0.28, y: 0.42, t: 260, p: 0.48 },
        { x: 0.72, y: 0.43, t: 350, p: 0.56 }
      ]
    ]
  };
}

function createRemoteConflictPackageFromPush(sourcePackage, options = {}) {
  assert(sourcePackage?.plans?.length, "构造远端冲突包前需要已有推送包。");
  const planId = options.planId || sourcePackage.plans[0].id;
  const remoteUpdatedAt = options.updatedAt || new Date(Date.now() + 60000).toISOString();
  return refreshPackageDigestInPlace(JSON.parse(JSON.stringify({
    ...sourcePackage,
    packageId: options.packageId || `remote-conflict-${Date.now()}`,
    exportedAt: remoteUpdatedAt,
    plans: sourcePackage.plans.map((plan) => {
      if (plan.id !== planId) return plan;
      return {
        ...plan,
        title: options.title || `${plan.title}（远端冲突）`,
        updatedAt: remoteUpdatedAt,
        items: plan.items.map((item, index) => index === 0
          ? {
              ...item,
              title: options.itemTitle || `${item.title}（远端冲突）`,
              detail: options.itemDetail || item.detail
            }
          : item)
      };
    })
  })));
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
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
    imageData: TEST_ARTWORK_JPEG_DATA_URL,
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

function createPracticeResult() {
  return {
    glyph: "永",
    strokes: [
      [
        { x: 0.42, y: 0.18, t: 0, p: 0.45 },
        { x: 0.48, y: 0.32, t: 80, p: 0.52 },
        { x: 0.5, y: 0.48, t: 160, p: 0.6 }
      ],
      [
        { x: 0.28, y: 0.42, t: 260, p: 0.48 },
        { x: 0.72, y: 0.43, t: 350, p: 0.56 }
      ],
      [
        { x: 0.5, y: 0.2, t: 480, p: 0.5 },
        { x: 0.49, y: 0.78, t: 700, p: 0.62 }
      ]
    ],
    strokeCount: 3,
    pointCount: 7,
    bounds: { minX: 0.28, minY: 0.18, maxX: 0.72, maxY: 0.78 },
    metrics: {
      structure: 82,
      stroke: 74,
      technique: 79,
      fluency: 76,
      force: 81
    },
    score: 78,
    scoreEvidence: {
      kind: "local-heuristic-v2.2.0",
      algorithmVersion: "local-heuristic-v2.2.0",
      label: "基础练习评分",
      disclaimer: "该分数来自浏览器本机启发式算法，用于练习复盘，不等同于专业书法评级。",
      glyph: "永",
      copybook: "永字八法",
      targetStrokeNames: ["侧点", "横勒", "竖弩", "钩趯", "提策", "撇掠", "短撇啄", "捺磔"],
      weights: { structure: 0.26, stroke: 0.24, technique: 0.2, fluency: 0.18, force: 0.12 },
      evidence: {
        copybook: "永字八法",
        targetStrokeCount: 8,
        targetStrokeNames: ["侧点", "横勒", "竖弩", "钩趯", "提策", "撇掠", "短撇啄", "捺磔"],
        strokeOrderMatchPercent: 67,
        strokeOrderCoveragePercent: 25,
        strokeShapeMatchPercent: 63,
        strokeOrderVerdict: "partial",
        strokeOrderWarnings: ["形态偏弱 1 笔", "缺少目标笔画 5 笔"],
        strokeMatches: [
          { index: 1, expected: "侧点", matched: "侧点", matchedIndex: 1, status: "match", matchScore: 84, bestScore: 84, actualDirection: "右下斜行", expectedDirection: "右下斜", angleDelta: 9 },
          { index: 2, expected: "横勒", matched: "横勒", matchedIndex: 2, status: "match", matchScore: 68, bestScore: 68, actualDirection: "横向右行", expectedDirection: "横向", angleDelta: 3 },
          { index: 3, expected: "竖弩", matched: "撇掠", matchedIndex: 6, status: "weak-match", matchScore: 38, bestScore: 60, actualDirection: "左下斜行", expectedDirection: "竖向", angleDelta: 42 }
        ],
        pathFitPercent: 72,
        pathErrorPercent: 28,
        pathErrorSampleCount: 7,
        pathErrorHotspots: [
          { zone: "3-2", label: "中上中右区", errorPercent: 38, sampleCount: 3 },
          { zone: "2-2", label: "中上中左区", errorPercent: 24, sampleCount: 2 }
        ],
        strokePathErrors: [
          { index: 1, expected: "侧点", errorPercent: 18, fitPercent: 82, sampleCount: 3 },
          { index: 2, expected: "横勒", errorPercent: 26, fitPercent: 74, sampleCount: 2 },
          { index: 3, expected: "竖弩", errorPercent: 40, fitPercent: 60, sampleCount: 2 }
        ],
        strokeCount: 3,
        strokeCountDelta: 5,
        pointCount: 7,
        coveragePercent: 58,
        centerOffsetPercent: 6,
        totalLength: 1.42,
        segmentVariationPercent: 35,
        longBreaks: 1,
        pressureAvailable: true,
        pressurePointCount: 4,
        pressureSpreadPercent: 17,
        pressureAveragePercent: 54,
        pressureMinPercent: 45,
        pressureMaxPercent: 62,
        boundsWidthPercent: 44,
        boundsHeightPercent: 60
      },
      reasons: [
        { key: "structure", label: "结构", score: 82, evidence: "重心偏移约 6%，书写覆盖约 58%。" },
        { key: "stroke", label: "笔画", score: 74, evidence: "当前 3 笔，目标约 8 笔；逐笔匹配 67%，轨迹贴合 72%，覆盖 25%；范字笔顺：侧点、横勒、竖弩、钩趯、提策、撇掠。" },
        { key: "technique", label: "笔法", score: 79, evidence: "笔迹总长度 1.42，采样点 7 个，路径误差约 28%。" },
        { key: "fluency", label: "流畅", score: 76, evidence: "线段变化 35%，长停顿 1 次。" },
        { key: "force", label: "力度", score: 81, evidence: "压感采样 4 点，平均约 54%，跨度约 17%，笔画差 5。" }
      ]
    },
    feedback: ["评分证据测试"]
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

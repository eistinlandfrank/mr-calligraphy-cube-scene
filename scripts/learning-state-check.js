#!/usr/bin/env node

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

const emptyShareStatus = window.MRAppState.getShareServiceStatus("artwork-2");
assert(emptyShareStatus.total === 0, "初始分享服务不应伪造已有链接。");
assert(emptyShareStatus.boundary.includes("不是公网 URL"), "分享服务应说明本机链接边界。");

const shareLink = window.MRAppState.createArtworkShareLink("artwork-2", { expiresInDays: 3 });
assert(shareLink.ok, "作品应能生成本机分享链接记录。");
assert(shareLink.record.artworkId === "artwork-2", "分享记录应关联作品 ID。");
assert(shareLink.record.isActive, "新分享记录应处于有效状态。");
assert(shareLink.record.expiresAt, "分享记录应包含过期时间。");

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
assert(reportPdfExport.features.verification, "PDF 报告应声明包含本机验真摘要。");
assert(/^[a-f0-9]{64}$/.test(reportPdfExport.verification.digest), "PDF 报告验真摘要应为 64 位 SHA-256。");
assert(reportPdfExport.features.verificationDigest === reportPdfExport.verification.digest, "PDF feature 应暴露同一个验真摘要。");
assert(!reportPdfExport.features.teacherReview, "未批注报告不应伪造教师批注。");
assert(reportPdfExport.pdf.includes("MetricBars: 5"), "PDF 内容应包含能力条形图标记。");
assert(reportPdfExport.pdf.includes("RadarChart: 5"), "PDF 内容应包含能力雷达图标记。");
assert(reportPdfExport.pdf.includes("TrendBars: 4"), "PDF 内容应包含分数趋势图标记。");
assert(reportPdfExport.pdf.includes("ArtworkCard: yes"), "PDF 内容应包含作品卡片标记。");
assert(reportPdfExport.pdf.includes("ArtworkImageEmbedded: yes"), "PDF 内容应包含作品截图嵌入标记。");
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
  note: "结构更稳，下一次重点放慢竖钩收笔。"
});
assert(teacherReview.ok, "报告教师批注应可写入本机状态。");
assert(teacherReview.teacherReview.reviewer === "王老师", "教师批注应保留批注人。");
assert(teacherReview.teacherReview.note.includes("竖钩"), "教师批注应保留批注内容。");

const reviewedDetail = window.MRAppState.getReportDetail("report-2");
assert(reviewedDetail.teacherReview.note.includes("结构更稳"), "报告详情应返回教师批注。");

const reviewedHtml = window.MRAppState.getReportHtmlExport("report-2");
assert(reviewedHtml.ok, "报告 HTML 应可通过无副作用 API 生成。");
assert(reviewedHtml.features.teacherReview, "HTML 报告导出应声明包含教师批注。");
assert(reviewedHtml.features.verification, "HTML 报告导出应声明包含本机验真摘要。");
assert(reviewedHtml.html.includes("教师批注") && reviewedHtml.html.includes("结构更稳"), "HTML 报告应包含教师批注内容。");
assert(reviewedHtml.html.includes("本机验真摘要"), "HTML 报告应显示本机验真摘要。");
assert(reviewedHtml.html.includes(reviewedHtml.verification.digest), "HTML 报告应包含验真摘要文本。");
assert(reviewedHtml.verification.digest !== reportPdfExport.verification.digest, "教师批注变更后报告摘要应随内容变化。");

const reviewedPdf = window.MRAppState.getReportPdfExport("report-2");
assert(reviewedPdf.features.teacherReview, "PDF 报告应声明包含教师批注。");
assert(reviewedPdf.features.verification, "批注后的 PDF 报告应继续包含本机验真摘要。");
assert(reviewedPdf.pdf.includes("TeacherReview: yes"), "PDF 内容应包含教师批注标记。");
assert(reviewedPdf.pdf.includes(`ReportDigest: ${reviewedHtml.verification.digest}`), "批注后的 PDF 摘要应与 HTML 导出一致。");

const reportRepositoryStatus = window.MRAppState.getReportRepositoryStatus();
assert(reportRepositoryStatus.ok && reportRepositoryStatus.reportCount >= 3, "报告 repository 应统计本机报告数量。");
assert(!reportRepositoryStatus.remoteConfigured, "未配置远端时不应伪造云端报告仓库。");
assert(reportRepositoryStatus.boundary.includes("不包含账号化教师端"), "报告 repository 应说明远端 adapter 边界。");
const reportRepositoryPackage = window.MRAppState.getReportRepositoryPackage();
assert(reportRepositoryPackage.ok, "报告 repository 应能生成 JSON 同步包。");
assert(typeof window.MRAppState.downloadReportRepository === "function", "报告 repository 应提供本机 JSON 同步包下载 API。");
assert(reportRepositoryPackage.package.kind === "mr-calligraphy-report-repository-v1", "报告同步包应包含稳定 kind。");
assert(reportRepositoryPackage.package.reports.length >= 3, "报告同步包应包含本机报告列表。");
assert(reportRepositoryPackage.package.verifications.length === reportRepositoryPackage.package.reports.length, "报告同步包应为每份报告生成验真摘要。");
assert(reportRepositoryPackage.package.summary.teacherReviewedReportCount === 1, "报告同步包应统计带教师批注报告数量。");
assert(reportRepositoryPackage.package.summary.verifiedReportCount === reportRepositoryPackage.package.reports.length, "报告同步包应统计验真报告数量。");
const reviewedReportPackage = reportRepositoryPackage.package.reports.find((item) => item.id === "report-2");
assert(reviewedReportPackage.teacherReview.note.includes("竖钩"), "报告同步包应保留教师批注内容。");
const reviewedReportVerificationPackage = reportRepositoryPackage.package.verifications.find((item) => item.reportId === "report-2");
assert(reviewedReportVerificationPackage.digest === reviewedHtml.verification.digest, "报告同步包应保留批注后的验真摘要。");

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
assert(practiceScoreEvidence.practice.scoreEvidence.evidence.coveragePercent === 58, "练习结果应保留覆盖范围证据。");
assert(
  practiceScoreEvidence.practice.scoreEvidence.reasons.some((reason) => reason.key === "structure" && reason.evidence.includes("重心")),
  "练习结果应保留结构评分解释。"
);
const stateAfterPractice = window.MRAppState.getState();
assert(stateAfterPractice.sessions.at(-1).scoreEvidence.reasons.length === 5, "练习会话应持久化五项评分理由。");
const scoreServiceAfterPractice = window.MRAppState.getScoreServiceStatus();
assert(scoreServiceAfterPractice.status === "scored", "评分服务应记录已评分状态。");
assert(scoreServiceAfterPractice.lastScore === 78, "评分服务应记录最近一次真实练习分数。");
assert(scoreServiceAfterPractice.scoredSessionCount === 4, "评分服务应累计新增评分次数。");
assert(scoreServiceAfterPractice.totalPointCount === 287, "评分服务应累计新增采样点。");
assert(scoreServiceAfterPractice.lastEvidenceSummary.includes("覆盖58%"), "评分服务应摘要最近一次证据。");
assert(scoreServiceAfterPractice.message.includes("累计评分 4 次"), "评分服务状态消息应显示累计评分次数。");
const persistedScoreService = JSON.parse(storage.get("mr-calligraphy-learning-state-v1")).scoreService;
assert(persistedScoreService.lastScore === 78, "评分服务状态应持久化最近分数。");
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
assert(!window.MRAppState.getPlanDependencyGraph("missing-plan").ok, "不存在的计划不应伪造依赖图。");
assert(!window.MRAppState.getPlanCycleStatus("missing-plan").ok, "不存在的计划不应伪造周期状态。");
assert(!window.MRAppState.getPlanExport("missing-plan").ok, "不存在的计划不应伪造导出成功。");

const planRepositoryStatus = window.MRAppState.getPlanRepositoryStatus();
assert(planRepositoryStatus.ok && planRepositoryStatus.planCount >= 2, "计划 repository 应统计本机计划数量。");
assert(!planRepositoryStatus.remoteConfigured, "未配置远端时不应伪造云端计划仓库。");
assert(planRepositoryStatus.pendingAutoSync, "生成和修改本机计划后应进入待自动同步队列。");
assert(planRepositoryStatus.pendingReason, "待自动同步队列应记录变更原因。");
const planRepositoryPackage = window.MRAppState.getPlanRepositoryPackage();
assert(planRepositoryPackage.ok, "计划 repository 应能生成 JSON 同步包。");
assert(planRepositoryPackage.package.kind === "mr-calligraphy-plan-repository-v1", "计划同步包应包含稳定 kind。");
assert(planRepositoryPackage.package.plans.length >= 2, "计划同步包应包含本机计划列表。");
assert(planRepositoryPackage.message.includes("本机 JSON 同步包"), "计划同步包应明确本机边界。");
const importedPlan = {
  ...planRepositoryPackage.package.plans[0],
  id: "plan-imported-cross-device",
  title: "导入的跨设备计划草案",
  createdAt: "2026-06-12T08:00:00.000Z"
};
const repositoryImport = window.MRAppState.importPlanRepositoryPackage(JSON.stringify({
  ...planRepositoryPackage.package,
  packageId: "plan-package-test",
  plans: [importedPlan]
}));
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
    remoteToken: "test-token"
  });
  assert(configuredRemote.ok, "远端计划 API 配置应可写入本机状态。");
  assert(configuredRemote.status.remoteConfigured, "保存远端配置后应显示已配置。");
  assert(configuredRemote.status.autoSyncEnabled, "保存远端配置后应默认开启自动同步队列。");

  const remotePlan = {
    ...planRepositoryPackage.package.plans[0],
    id: "plan-remote-pulled",
    title: "远端拉取的跨设备计划",
    createdAt: "2026-06-13T08:00:00.000Z"
  };
  let remotePackage = {
    ...planRepositoryPackage.package,
    packageId: "remote-package-test",
    exportedAt: "2026-06-13T08:10:00.000Z",
    plans: [remotePlan]
  };
  let capturedPushPackage = null;
  const fetchCalls = [];
  global.fetch = async (url, options = {}) => {
    fetchCalls.push({ url, options });
    if (options.method === "PUT") {
      capturedPushPackage = JSON.parse(options.body);
      return createJsonResponse({
        ok: true,
        message: "远端已接收计划仓库。",
        package: {
          ...capturedPushPackage,
          packageId: "remote-accepted-package"
        }
      });
    }
    return createJsonResponse({
      ok: true,
      message: "远端计划仓库可读。",
      package: remotePackage
    });
  };

  const checkedRemote = await window.MRAppState.checkRemotePlanRepository();
  assert(checkedRemote.ok, "配置远端后应真实调用 fetch 检查计划仓库。");
  assert(checkedRemote.package.plans.length === 1, "远端检查应解析计划包。");
  assert(fetchCalls[0].url === "https://example.test/plan-repository", "远端检查应请求已保存的 endpoint。");
  assert(fetchCalls[0].options.headers.Authorization === "Bearer test-token", "远端请求应携带本机保存的 Bearer token。");

  const pushedRemote = await window.MRAppState.pushPlanRepositoryToRemote();
  assert(pushedRemote.ok, "推送计划应真实调用远端 PUT。");
  assert(capturedPushPackage.kind === "mr-calligraphy-plan-repository-v1", "远端推送应发送稳定计划仓库包。");
  assert(capturedPushPackage.plans.length >= 3, "远端推送应包含当前本机计划列表。");
  assert(pushedRemote.packageId === "remote-accepted-package", "推送结果应记录远端接收的 packageId。");
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
  remotePackage = {
    ...remotePackage,
    packageId: "remote-conflict-package",
    exportedAt: "2030-01-01T00:00:00.000Z",
    plans: [{
      ...conflictLocalPlan,
      title: "远端也修改过的跨设备计划",
      updatedAt: "2030-01-01T00:00:00.000Z"
    }]
  };
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

  const flushedAutoSync = await window.MRAppState.flushPlanRepositoryAutoSync();
  assert(flushedAutoSync.ok, "待同步队列应可通过 flush 推送到远端。");
  assert(!flushedAutoSync.status.pendingAutoSync, "自动同步 flush 成功后应清空队列。");
  assert(flushedAutoSync.status.lastAutoSyncAt, "自动同步 flush 成功后应记录时间。");

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
  assert(persistedPlanState.planRepository.mode === "remote-api", "计划 repository 应持久化远端 API 模式。");
  assert(persistedPlanState.planRepository.remoteEndpoint === "https://example.test/plan-repository", "计划 repository 应持久化远端 endpoint。");
  assert(persistedPlanState.planRepository.lastImportedPlanCount === remotePackage.plans.length, "计划 repository 导入状态应持久化到 localStorage。");
  assert(persistedPlanState.planRepository.lastPackageId === "remote-accepted-package", "字段合并前的远端基线推送 packageId 应持久化。");
  assert(persistedPlanState.planRepository.lastRemoteDirection === "push", "字段级合并后最近远端方向应保留为基线推送。");
  assert(persistedPlanState.planRepository.lastRemotePlanCount === remotePackage.plans.length, "计划 repository 应记录最近远端计划数量。");
  assert(persistedPlanState.planRepository.pendingAutoSync, "字段级合并后的混合版本应继续显示待同步。");
  assert(persistedPlanState.planRepository.pendingReason.includes("字段级合并"), "字段级合并待同步原因应持久化。");
  assert(persistedPlanState.planRepository.lastAutoSyncAt, "计划 repository 应持久化最近自动同步时间。");
  assert(persistedPlanState.planRepository.lastSyncConflictCount === 0, "字段级合并后应清理冲突计数。");
  const persistedRemotePlan = persistedPlanState.plans.find((plan) => plan.id === "plan-remote-pulled");
  assert(persistedRemotePlan.title === "字段合并远端计划标题", "字段级合并后的计划标题应持久化到 localStorage。");
  assert(persistedRemotePlan.items[0].title === "字段合并保留本机任务标题", "字段级合并后的本机任务标题应持久化到 localStorage。");
  assert(persistedRemotePlan.items[0].detail === "字段合并时采用的远端任务说明。", "字段级合并后的远端任务说明应持久化到 localStorage。");

  await runReportRepositoryMockServerChecks(nativeFetch);
  await runHistoryRepositoryMockServerChecks(nativeFetch);
  await runPlanRepositoryMockServerChecks(nativeFetch);

  console.log("学习状态检查通过：学习路径服务、基础评分服务、本机讲解服务、同字作品对比、作品集检索、学习档案同步仓库、学习档案冲突审计和字段级合并、分享页、本机分享链接服务、报告原生 PDF、报告 PDF 能力雷达图、报告 PDF 分数趋势图、报告 PDF 作品截图嵌入、报告教师批注、报告本机验真摘要、报告仓库本机 JSON 同步包、报告仓库远端 API adapter、报告仓库 mock 服务、报告仓库冲突审计、报告冲突字段级合并和远端副本另存、报告对比导出、多报告趋势、评分证据、学习阶段记录、任务依赖完成规则、学习计划提醒复盘、计划提醒服务边界、学习计划同步仓库、远端计划 API adapter、计划仓库 mock 服务、学习计划自动同步队列、计划同步冲突检测、计划冲突另存副本、保留本机、采用远端、计划字段级合并、计划依赖图、计划周期循环和计划离线导出已生成。");
}

async function runReportRepositoryMockServerChecks(fetchApi) {
  assert(fetchApi, "当前 Node 环境需要支持 fetch 以验证报告仓库 mock 服务。");
  const packageResult = window.MRAppState.getReportRepositoryPackage();
  assert(packageResult.ok, "报告 repository 应能生成 JSON 同步包。");
  assert(packageResult.package.kind === "mr-calligraphy-report-repository-v1", "报告同步包应包含稳定 kind。");
  assert(packageResult.package.reports.length >= 3, "报告同步包应包含报告记录。");
  assert(packageResult.package.verifications.length === packageResult.package.reports.length, "报告同步包应包含每份报告的验真摘要。");
  const reviewedReportPackage = packageResult.package.reports.find((item) => item.id === "report-2");
  assert(reviewedReportPackage.teacherReview.note.includes("竖钩"), "报告同步包应保留教师批注内容。");

  const previousFetch = global.fetch;
  const mock = await startReportRepositoryMockServer({ token: "report-token" });
  try {
    global.fetch = fetchApi;
    const configuredMock = window.MRAppState.configureReportRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "report-token"
    });
    assert(configuredMock.ok, "报告仓库 mock endpoint 应可保存为远端配置。");

    const checkedBeforePush = await window.MRAppState.checkRemoteReportRepository();
    assert(checkedBeforePush.ok, "报告仓库 mock GET 检查应真实可访问。");
    assert(checkedBeforePush.package === null, "报告仓库 mock 初始未接收包时不应伪造远端报告。");

    const pushedMock = await window.MRAppState.pushReportRepositoryToRemote();
    assert(pushedMock.ok, "报告仓库 mock 应接收真实 PUT 推送。");
    assert(pushedMock.packageId.startsWith("mock-report-repository-"), "报告仓库 mock 应返回服务端 packageId。");
    assert(mock.state.package.packageId === pushedMock.packageId, "报告仓库 mock 应在内存中保存最近报告包。");
    assert(mock.state.package.summary.teacherReviewedReportCount === 1, "报告仓库 mock 应保存带教师批注报告计数。");
    assert(mock.state.package.verifications.every((item) => /^[a-f0-9]{64}$/.test(item.digest)), "报告仓库 mock 应保存 64 位报告摘要。");
    assert(mock.state.receipts[0].repositoryDigest, "报告仓库 mock 应返回 repositoryDigest 回执。");

    const checkedAfterPush = await window.MRAppState.checkRemoteReportRepository();
    assert(checkedAfterPush.ok && checkedAfterPush.package.reports.length === mock.state.package.reports.length, "报告仓库 mock GET 应返回最近 PUT 保存的报告包。");

    const pulledMock = await window.MRAppState.pullReportRepositoryFromRemote();
    assert(pulledMock.ok, "报告仓库 mock 应支持真实 GET 拉取。");
    assert(pulledMock.pulledReportCount === mock.state.package.reports.length, "报告仓库 mock 拉取结果应保留远端报告数量。");
    assert(pulledMock.skippedConflictCount === 0, "相同报告包拉取不应伪造冲突。");

    mock.state.package.reports[0] = {
      ...mock.state.package.reports[0],
      summary: "远端报告修改不应覆盖本机同 ID 报告。"
    };
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

    mock.state.package.reports[2] = {
      ...mock.state.package.reports[2],
      title: "远端冲突报告副本"
    };
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
      remoteToken: "bad-token"
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
  assert(packageResult.package.records.sessions.length >= 3, "学习档案同步包应包含练习记录。");
  assert(packageResult.package.records.artworks.length >= 3, "学习档案同步包应包含作品记录。");
  assert(packageResult.package.records.reports.length >= 3, "学习档案同步包应包含报告记录。");
  assert(packageResult.package.summary.teacherReviewedReportCount === 1, "学习档案同步包应统计带教师批注报告数量。");
  const reviewedReportPackage = packageResult.package.records.reports.find((item) => item.id === "report-2");
  assert(reviewedReportPackage.teacherReview.note.includes("竖钩"), "学习档案同步包应保留报告教师批注内容。");
  const reviewedHistoryDetail = packageResult.package.history.find((item) => item.id === "report-2");
  assert(reviewedHistoryDetail.teacherReview.note.includes("结构更稳"), "学习档案详情快照应保留教师批注。");

  const previousFetch = global.fetch;
  const mock = await startHistoryRepositoryMockServer({ token: "history-token" });
  try {
    global.fetch = fetchApi;
    const configuredMock = window.MRAppState.configureHistoryRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "history-token"
    });
    assert(configuredMock.ok, "学习档案仓库 mock endpoint 应可保存为远端配置。");

    const checkedBeforePush = await window.MRAppState.checkRemoteHistoryRepository();
    assert(checkedBeforePush.ok, "学习档案仓库 mock GET 检查应真实可访问。");
    assert(checkedBeforePush.package === null, "学习档案仓库 mock 初始未接收包时不应伪造远端档案。");

    const pushedMock = await window.MRAppState.pushHistoryRepositoryToRemote();
    assert(pushedMock.ok, "学习档案仓库 mock 应接收真实 PUT 推送。");
    assert(pushedMock.packageId.startsWith("mock-history-repository-"), "学习档案仓库 mock 应返回服务端 packageId。");
    assert(mock.state.package.packageId === pushedMock.packageId, "学习档案仓库 mock 应在内存中保存最近档案包。");
    assert(mock.state.package.summary.teacherReviewedReportCount === 1, "学习档案仓库 mock 应保存带教师批注报告计数。");
    assert(mock.state.package.records.reports.find((item) => item.id === "report-2").teacherReview.note.includes("竖钩"), "学习档案仓库 mock 应保存教师批注内容。");
    assert(mock.state.receipts[0].repositoryDigest, "学习档案仓库 mock 应返回 repositoryDigest 回执。");

    const checkedAfterPush = await window.MRAppState.checkRemoteHistoryRepository();
    assert(checkedAfterPush.ok && checkedAfterPush.package.summary.total === mock.state.package.summary.total, "学习档案仓库 mock GET 应返回最近 PUT 保存的档案包。");
    assert(checkedAfterPush.package.summary.teacherReviewedReportCount === 1, "学习档案仓库 mock GET 应返回教师批注摘要。");

    const pulledMock = await window.MRAppState.pullHistoryRepositoryFromRemote();
    assert(pulledMock.ok, "学习档案仓库 mock 应支持真实 GET 拉取。");
    assert(pulledMock.pulledRecordCount === mock.state.package.summary.total, "学习档案仓库 mock 拉取结果应保留远端记录数量。");
    assert(window.MRAppState.getReportDetail("report-2").teacherReview.note.includes("竖钩"), "学习档案仓库拉取后本机报告教师批注不应丢失。");

    const localTitle = window.MRAppState.getState().sessions[0].title;
    mock.state.package.records.sessions[0] = {
      ...mock.state.package.records.sessions[0],
      title: "远端改名但不覆盖本机"
    };
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

    mock.state.package.records.sessions[0] = {
      ...mock.state.package.records.sessions[0],
      feedback: ["远端副本冲突反馈"]
    };
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

    const badTokenConfig = window.MRAppState.configureHistoryRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "bad-token"
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
      remoteToken: "plan-token"
    });
    assert(configuredMock.ok, "计划仓库 mock endpoint 应可保存为远端配置。");

    const checkedBeforePush = await window.MRAppState.checkRemotePlanRepository();
    assert(checkedBeforePush.ok, "计划仓库 mock GET 检查应真实可访问。");
    assert(checkedBeforePush.package === null, "计划仓库 mock 初始未接收包时不应伪造远端计划。");

    const pushedMock = await window.MRAppState.pushPlanRepositoryToRemote();
    assert(pushedMock.ok, "计划仓库 mock 应接收真实 PUT 推送。");
    assert(pushedMock.packageId.startsWith("mock-plan-repository-"), "计划仓库 mock 应返回服务端 packageId。");
    assert(mock.state.package.packageId === pushedMock.packageId, "计划仓库 mock 应在内存中保存最近计划包。");
    assert(mock.state.receipts[0].repositoryDigest, "计划仓库 mock 应返回 repositoryDigest 回执。");

    const checkedAfterPush = await window.MRAppState.checkRemotePlanRepository();
    assert(checkedAfterPush.ok && checkedAfterPush.package.plans.length === mock.state.package.plans.length, "计划仓库 mock GET 应返回最近 PUT 保存的计划包。");

    const pulledMock = await window.MRAppState.pullPlanRepositoryFromRemote({ force: true });
    assert(pulledMock.ok, "计划仓库 mock 应支持真实 GET 拉取。");
    assert(pulledMock.pulledPlanCount === mock.state.package.plans.length, "计划仓库 mock 拉取结果应保留远端计划数量。");

    const badTokenConfig = window.MRAppState.configurePlanRepositoryRemote({
      remoteEndpoint: mock.endpoint,
      remoteToken: "bad-token"
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

function createRemoteConflictPackageFromPush(sourcePackage, options = {}) {
  assert(sourcePackage?.plans?.length, "构造远端冲突包前需要已有推送包。");
  const planId = options.planId || sourcePackage.plans[0].id;
  const remoteUpdatedAt = options.updatedAt || new Date(Date.now() + 60000).toISOString();
  return JSON.parse(JSON.stringify({
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
  }));
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
      kind: "local-heuristic-v1",
      label: "基础练习评分",
      disclaimer: "该分数来自浏览器本机启发式算法，用于练习复盘，不等同于专业书法评级。",
      glyph: "永",
      weights: { structure: 0.26, stroke: 0.24, technique: 0.2, fluency: 0.18, force: 0.12 },
      evidence: {
        targetStrokeCount: 8,
        strokeCount: 3,
        pointCount: 7,
        coveragePercent: 58,
        centerOffsetPercent: 6,
        totalLength: 1.42,
        segmentVariationPercent: 35,
        longBreaks: 1,
        pressureSpreadPercent: 17,
        boundsWidthPercent: 44,
        boundsHeightPercent: 60
      },
      reasons: [
        { key: "structure", label: "结构", score: 82, evidence: "重心偏移约 6%，书写覆盖约 58%。" },
        { key: "stroke", label: "笔画", score: 74, evidence: "当前 3 笔，目标约 8 笔。" },
        { key: "technique", label: "笔法", score: 79, evidence: "笔迹总长度 1.42，采样点 7 个。" },
        { key: "fluency", label: "流畅", score: 76, evidence: "线段变化 35%，长停顿 1 次。" },
        { key: "force", label: "力度", score: 81, evidence: "压感跨度约 17%，笔画差 5。" }
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

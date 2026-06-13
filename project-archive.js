(function () {
  const ARCHIVE_KIND = "mr-calligraphy-project-archive";
  const ARCHIVE_VERSION = 1;
  const RESTORE_AUDIT_KEY = "mr-calligraphy-project-archive-audit-v1";
  const RESTORE_AUDIT_DIGEST_ALGORITHM = "sha256-stable-json";
  const MAX_RESTORE_AUDIT_RECORDS = 50;
  const PROJECT_RESTORE_AUDIT_EXPORT_KEY = "mr-calligraphy-project-restore-audit-export-v1";
  const PROJECT_RESTORE_AUDIT_EXPORT_KIND = "mr-calligraphy-project-restore-audit-export-v1";
  const PROJECT_RESTORE_AUDIT_EXPORT_MAX_RECEIPTS = 24;
  const PROJECT_RESTORE_AUDIT_EXPORT_BOUNDARY = "项目档案恢复审计导出回执记录当前浏览器生成恢复审计 HTML 的时间、摘要和恢复记录范围；它不是系统文件保存证明、账号审批或服务端不可篡改日志。";
  const PROJECT_ARCHIVE_EXPORT_AUDIT_KEY = "mr-calligraphy-project-archive-export-audit-v1";
  const PROJECT_ARCHIVE_EXPORT_AUDIT_KIND = "mr-calligraphy-project-archive-export-audit-v1";
  const PROJECT_ARCHIVE_EXPORT_MAX_RECEIPTS = 24;
  const PROJECT_ARCHIVE_EXPORT_BOUNDARY = "项目档案导出回执记录当前浏览器生成 JSON 备份文件的时间、摘要和范围；它不是云端备份完成证明，也不能替代账号权限或服务端不可篡改审计。";
  const PROJECT_IMPACT_EXPORT_AUDIT_KEY = "mr-calligraphy-project-impact-export-audit-v1";
  const PROJECT_IMPACT_EXPORT_AUDIT_KIND = "mr-calligraphy-project-impact-export-audit-v1";
  const PROJECT_IMPACT_EXPORT_MAX_RECEIPTS = 24;
  const PROJECT_IMPACT_EXPORT_BOUNDARY = "项目档案差异报告导出回执记录当前浏览器生成恢复前审阅 HTML 的时间、摘要、风险和选择范围；它不是恢复动作证明，也不能替代多人合并审计或服务端不可篡改日志。";
  const PROJECT_REPOSITORY_REMOTE_KEY = "mr-calligraphy-project-repository-remote-v1";
  const PROJECT_REPOSITORY_PACKAGE_KIND = "mr-calligraphy-project-repository-package-v1";
  const PROJECT_REPOSITORY_EXPORT_AUDIT_KEY = "mr-calligraphy-project-repository-export-audit-v1";
  const PROJECT_REPOSITORY_EXPORT_AUDIT_KIND = "mr-calligraphy-project-repository-export-audit-v1";
  const PROJECT_REPOSITORY_EXPORT_MAX_RECEIPTS = 24;
  const PROJECT_REPOSITORY_RECEIPT_KIND = "mr-calligraphy-project-repository-receipt-v1";
  const PROJECT_REPOSITORY_REMOTE_VERSION = 1;
  const PROJECT_REPOSITORY_DEFAULT_WORKSPACE = "local-browser";
  const PROJECT_REPOSITORY_MAX_RECEIPTS = 12;
  const PROJECT_REPOSITORY_MAX_VERSIONS = 20;
  const PROJECT_REPOSITORY_MAX_FAILURES = 12;
  const PROJECT_REPOSITORY_REQUEST_TIMEOUT_MS = 8000;
  const PROJECT_REPOSITORY_RETRY_BASE_MS = 15000;
  const PROJECT_REPOSITORY_RETRY_MAX_MS = 300000;
  const PROJECT_REPOSITORY_REMOTE_BOUNDARY = "项目仓库远端 API adapter 会真实发送当前本机项目档案包，并携带 Workspace 空间 ID 做服务端隔离第一版；它不是账号权限、多人协作 CMS、CDN 资产库或生产服务端本身。";
  const PROJECT_REPOSITORY_EXPORT_BOUNDARY = "项目仓库包导出会下载与远端推送同结构的本机 JSON 包，并记录文件摘要、包摘要和仓库摘要；它不是云端同步完成证明，也不能替代账号权限、多人协作或服务端不可篡改审计。";
  const STORAGE_ITEMS = [
    { key: "mr-calligraphy-learning-state-v1", label: "学习状态" },
    { key: "mr-calligraphy-room-config-v3-wood", label: "房间与角色配置" },
    { key: "mr-calligraphy-main-scene-layout-v1", label: "主场景布局" },
    { key: "mr-calligraphy-main-scene-history-v1", label: "主场景保存历史" },
    { key: "mr-calligraphy-main-scene-published-v1", label: "主场景发布版本" },
    { key: "mr-calligraphy-realistic-layout-v1", label: "写实场景布局" },
    { key: "mr-calligraphy-realistic-history-v1", label: "写实场景保存历史" },
    { key: "mr-calligraphy-realistic-published-v1", label: "写实场景发布版本" }
  ];
  const DB_ITEMS = [
    { id: "mainModels", label: "主场景导入模型", dbName: "mr-calligraphy-main-model-store", storeName: "models", keyPath: "key" },
    { id: "realisticModels", label: "写实场景导入模型", dbName: "mr-calligraphy-model-store", storeName: "models", keyPath: "id" }
  ];
  const MODEL_FULL_PREVIEW_MAX_LENGTH = 12000;
  const MODEL_PREVIEW_ARRAY_SAMPLE_LIMIT = 12;
  const MODEL_PREVIEW_STRING_LIMIT = 1200;

  async function exportProject() {
    const archive = await createCurrentProjectArchiveSnapshot();
    archive.migrations = [];
    archive.projectSchema = createProjectSchema(archive);

    const filename = `mr-calligraphy-project-${formatTimestamp(new Date())}.json`;
    const payload = JSON.stringify(archive, null, 2);
    downloadJsonPayload(payload, filename);
    const receiptResult = await recordProjectArchiveExportReceipt({
      archive,
      filename,
      payload,
      exportedAt: archive.exportedAt
    });
    const summary = summarizeArchive(archive, "已导出项目档案。");
    return {
      ...summary,
      filename,
      exportReceipt: receiptResult.receipt || null,
      message: receiptResult.ok
        ? `${summary.message} 已写入项目档案导出回执。`
        : `${summary.message} ${receiptResult.message || "导出回执记录失败。"}`
    };
  }

  async function createCurrentProjectArchiveSnapshot() {
    const archive = {
      kind: ARCHIVE_KIND,
      version: ARCHIVE_VERSION,
      exportedAt: new Date().toISOString(),
      source: window.location.href,
      storage: exportLocalStorage(),
      indexedDb: {},
      notes: [
        "该档案包含 MR 书法项目的本机学习记录、场景配置、后台布局和已导入模型文件。",
        "恢复档案前可在主后台选择要恢复的条目；勾选条目会覆盖当前浏览器中的同名项目状态。"
      ]
    };

    for (const item of DB_ITEMS) {
      archive.indexedDb[item.id] = await exportDbStore(item);
    }
    return archive;
  }

  async function getCurrentProjectRepositoryStatus() {
    const archive = await createCurrentProjectArchiveSnapshot();
    archive.projectSchema = createProjectSchema(archive);
    return archive.projectSchema.repository || window.MRProjectSchema?.createProjectRepositoryStatus?.(archive);
  }

  async function createProjectRepositoryPackage() {
    const remoteState = readProjectRepositoryRemoteState();
    const workspaceId = remoteState.workspaceId;
    const archive = await createCurrentProjectArchiveSnapshot();
    archive.migrations = [];
    archive.projectSchema = createProjectSchema(archive);
    const repository = archive.projectSchema.repository || window.MRProjectSchema?.createProjectRepositoryStatus?.(archive);
    const exportedAt = archive.exportedAt || new Date().toISOString();
    const packageBody = {
      kind: PROJECT_REPOSITORY_PACKAGE_KIND,
      version: PROJECT_REPOSITORY_REMOTE_VERSION,
      packageId: `project-repository-${formatTimestamp(new Date())}-${String(Date.now()).slice(-5)}`,
      workspaceId,
      exportedAt,
      source: archive.source || "",
      boundary: PROJECT_REPOSITORY_REMOTE_BOUNDARY,
      repository,
      projectSchema: archive.projectSchema,
      archive,
      summary: createProjectRepositoryPackageSummary(archive, repository)
    };

    packageBody.packageDigest = await createStableJsonSha256(packageBody);
    return packageBody;
  }

  async function downloadProjectRepositoryPackage(options = {}) {
    const repositoryPackage = await createProjectRepositoryPackage();
    const exportedAt = options.exportedAt || repositoryPackage.exportedAt || new Date().toISOString();
    const filename = options.filename || `mr-calligraphy-project-repository-package-${formatTimestamp(new Date(exportedAt))}.json`;
    const payload = JSON.stringify(repositoryPackage, null, 2);
    downloadJsonPayload(payload, filename);
    const receiptResult = await recordProjectRepositoryExportReceipt({
      package: repositoryPackage,
      filename,
      payload,
      exportedAt
    });
    return {
      ok: true,
      filename,
      package: repositoryPackage,
      exportReceipt: receiptResult.receipt || null,
      message: receiptResult.ok
        ? `已导出本机项目仓库包：${filename}，并写入导出回执。`
        : `已导出本机项目仓库包：${filename}。${receiptResult.message || "导出回执记录失败。"}`
    };
  }

  function createProjectRepositoryPackageSummary(archive, repository) {
    const indexedDb = archive.indexedDb && typeof archive.indexedDb === "object" ? archive.indexedDb : {};
    const schemaSummary = archive.projectSchema?.summary || {};
    const repositorySummary = repository?.summary || {};
    const modelCount = Object.values(indexedDb).reduce((sum, pack) => {
      return sum + (Array.isArray(pack?.records) ? pack.records.length : 0);
    }, 0);

    return {
      storageCount: Object.keys(archive.storage || {}).length,
      modelStoreCount: Object.keys(indexedDb).length,
      modelCount,
      sceneCount: Number(repositorySummary.sceneCount || 0),
      draftSceneCount: Number(repositorySummary.draftSceneCount || 0),
      publishedSceneCount: Number(repositorySummary.publishedSceneCount || 0),
      readySceneCount: Number(repositorySummary.readySceneCount || 0),
      importedModels: Number(schemaSummary.importedModels || repositorySummary.importedModelCount || 0),
      textureAssets: Number(schemaSummary.textureAssets || repositorySummary.textureAssetCount || 0),
      missingModelBinaries: Number(schemaSummary.missingModelBinaries || repositorySummary.missingBinaryCount || 0),
      missingTextureBinaries: Number(schemaSummary.missingTextureBinaries || 0),
      unknownModelBinaries: Number(schemaSummary.unknownModelBinaries || repositorySummary.unknownBinaryCount || 0),
      missingModelHashes: Number(schemaSummary.missingModelHashes || repositorySummary.missingHashCount || 0),
      repositoryStatus: String(repository?.status || ""),
      repositoryReadyScenes: Number(repositorySummary.readySceneCount || 0)
    };
  }

  function readProjectRepositoryRemoteState() {
    try {
      const raw = window.localStorage.getItem(PROJECT_REPOSITORY_REMOTE_KEY);
      return normalizeProjectRepositoryRemoteState(raw ? JSON.parse(raw) : {});
    } catch (error) {
      return normalizeProjectRepositoryRemoteState({});
    }
  }

  function writeProjectRepositoryRemoteState(state) {
    const normalized = normalizeProjectRepositoryRemoteState(state);
    window.localStorage.setItem(PROJECT_REPOSITORY_REMOTE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function normalizeProjectRepositoryRemoteState(state = {}) {
    const source = state && typeof state === "object" ? state : {};
    const workspaceId = normalizeProjectRepositoryWorkspaceId(source.workspaceId || source.remoteWorkspaceId || source.accountId);
    return {
      version: PROJECT_REPOSITORY_REMOTE_VERSION,
      endpoint: typeof source.endpoint === "string" ? source.endpoint.trim() : "",
      token: typeof source.token === "string" ? source.token.trim() : "",
      workspaceId,
      lastCheckedAt: normalizeIsoDate(source.lastCheckedAt),
      lastPushedAt: normalizeIsoDate(source.lastPushedAt),
      lastPackageId: source.lastPackageId ? String(source.lastPackageId).slice(0, 160) : "",
      lastRemoteVersion: source.lastRemoteVersion ? String(source.lastRemoteVersion).slice(0, 120) : "",
      lastRemoteStatus: source.lastRemoteStatus ? String(source.lastRemoteStatus).slice(0, 220) : "",
      lastPackageDigest: normalizeSha256(source.lastPackageDigest),
      lastRepositoryDigest: normalizeSha256(source.lastRepositoryDigest),
      lastError: source.lastError ? String(source.lastError).slice(0, 220) : "",
      lastRemoteFailureAt: normalizeIsoDate(source.lastRemoteFailureAt || source.lastFailureAt),
      lastFailureAction: normalizeProjectRepositoryFailureAction(source.lastFailureAction || source.remoteFailureAction),
      remoteRetryAfter: normalizeIsoDate(source.remoteRetryAfter || source.retryAfter),
      remoteFailureHistory: Array.isArray(source.remoteFailureHistory || source.failureHistory)
        ? (source.remoteFailureHistory || source.failureHistory)
          .map((item) => normalizeProjectRepositoryRemoteFailure(item, { workspaceId }))
          .filter(Boolean)
          .slice(0, PROJECT_REPOSITORY_MAX_FAILURES)
        : [],
      versions: Array.isArray(source.versions)
        ? mergeProjectRepositoryVersions(source.versions)
        : [],
      receipts: Array.isArray(source.receipts)
        ? mergeProjectRepositoryReceipts(source.receipts, [], { workspaceId })
        : []
    };
  }

  function normalizeProjectRepositoryWorkspaceId(value) {
    const normalized = String(value || "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9_.:-]/g, "")
      .slice(0, 64);
    return normalized || PROJECT_REPOSITORY_DEFAULT_WORKSPACE;
  }

  function normalizeProjectRepositoryFailureAction(action) {
    const value = String(action || "").trim();
    return ["check", "push", "pull"].includes(value) ? value : "";
  }

  function normalizeProjectRepositoryFailureKind(kind) {
    const value = String(kind || "").trim();
    return ["http", "network", "timeout", "validation", "response", "unknown"].includes(value) ? value : "unknown";
  }

  function normalizeProjectRepositoryRemoteFailure(record = {}, context = {}) {
    const source = record && typeof record === "object" ? record : {};
    const failedAt = normalizeIsoDate(source.failedAt || source.createdAt || source.at) || new Date().toISOString();
    const action = normalizeProjectRepositoryFailureAction(source.action || context.action);
    const message = String(source.message || context.message || "远端项目仓库请求失败。").slice(0, 260);
    if (!message && !action) {
      return null;
    }
    const stableIdSource = [
      action,
      normalizeProjectRepositoryFailureKind(source.failureKind || source.kind || context.failureKind),
      failedAt,
      source.endpoint || context.endpoint || "",
      source.packageId || context.packageId || "",
      message
    ].join("|");
    return {
      id: String(source.id || `project-repository-failure-${sha256StableJson(stableIdSource).slice(0, 16)}`).slice(0, 180),
      action,
      failureKind: normalizeProjectRepositoryFailureKind(source.failureKind || source.kind || context.failureKind),
      message,
      endpoint: String(source.endpoint || context.endpoint || "").trim().slice(0, 240),
      workspaceId: normalizeProjectRepositoryWorkspaceId(source.workspaceId || context.workspaceId),
      failedAt,
      retryAfter: normalizeIsoDate(source.retryAfter || context.retryAfter),
      attemptCount: Math.max(1, Math.round(Number(source.attemptCount || context.attemptCount || 1))),
      packageId: String(source.packageId || context.packageId || "").slice(0, 160),
      packageDigest: normalizeSha256(source.packageDigest || context.packageDigest),
      sceneCount: Math.max(0, Math.round(Number(source.sceneCount ?? context.sceneCount ?? 0))),
      modelCount: Math.max(0, Math.round(Number(source.modelCount ?? context.modelCount ?? 0)))
    };
  }

  function classifyProjectRepositoryFailure(message, error = null) {
    const raw = `${message || ""} ${error?.message || ""}`.toLowerCase();
    if (error?.failureKind === "timeout" || error?.name === "ProjectRepositoryTimeoutError" || /超时|timeout|timed out|aborted/.test(raw)) {
      return "timeout";
    }
    if (/http\s*\d{3}/i.test(message || "") || /http\s*\d{3}/i.test(error?.message || "")) {
      return "http";
    }
    if (/网络请求异常|failed to fetch|networkerror|load failed|network request failed/.test(raw)) {
      return "network";
    }
    if (/不是 json|没有返回 json|响应中没有|kind|版本|摘要|缺少|结构|校验|不匹配/.test(raw)) {
      return "validation";
    }
    if (/response|响应/.test(raw)) {
      return "response";
    }
    return "unknown";
  }

  function getProjectRepositoryRetryDelayMs(attemptCount, options = {}) {
    const configured = Number(options.retryDelayMs);
    if (Number.isFinite(configured) && configured >= 0) {
      return Math.round(configured);
    }
    const attempts = Math.max(1, Math.min(6, Math.round(Number(attemptCount || 1))));
    return Math.min(PROJECT_REPOSITORY_RETRY_MAX_MS, PROJECT_REPOSITORY_RETRY_BASE_MS * (2 ** (attempts - 1)));
  }

  function formatProjectRepositoryFailureAction(action) {
    return {
      check: "检查",
      push: "推送",
      pull: "拉取"
    }[action] || "远端请求";
  }

  function formatProjectRepositoryFailureKind(kind) {
    return {
      http: "HTTP 拒收",
      network: "网络异常",
      timeout: "请求超时",
      validation: "结构校验失败",
      response: "响应异常",
      unknown: "未知失败"
    }[kind] || "未知失败";
  }

  function hasProjectRepositoryPushRetryPending(state = {}) {
    const lastPushedAt = Date.parse(state.lastPushedAt || "");
    return (Array.isArray(state.remoteFailureHistory) ? state.remoteFailureHistory : []).some((failure) => {
      if (failure.action !== "push") {
        return false;
      }
      const failedAt = Date.parse(failure.failedAt || "");
      return Number.isFinite(failedAt) && (!Number.isFinite(lastPushedAt) || failedAt > lastPushedAt);
    });
  }

  function getProjectRepositoryRemoteRetrySummary(state = readProjectRepositoryRemoteState()) {
    const history = Array.isArray(state.remoteFailureHistory) ? state.remoteFailureHistory : [];
    const latest = history[0] || null;
    if (!latest) {
      return "";
    }
    const retryText = latest.retryAfter || state.remoteRetryAfter
      ? `下一次建议重试：${formatArchiveDate(latest.retryAfter || state.remoteRetryAfter)}`
      : "修正 endpoint 或远端服务后可手动重试";
    const actionLabel = formatProjectRepositoryFailureAction(latest.action);
    const kindLabel = formatProjectRepositoryFailureKind(latest.failureKind);
    return `失败历史 ${history.length} 次，最近${actionLabel}为${kindLabel}，${retryText}。`;
  }

  function normalizeProjectRepositoryReceipt(record = {}, context = {}) {
    const source = record && typeof record === "object" ? record : {};
    const receipt = source.receipt && typeof source.receipt === "object" ? source.receipt : {};
    const packageId = String(source.packageId || receipt.packageId || "").slice(0, 160);
    const sourcePackageId = String(source.sourcePackageId || receipt.sourcePackageId || "").slice(0, 160);
    const packageDigest = normalizeSha256(source.packageDigest || receipt.packageDigest);
    const repositoryDigest = normalizeSha256(source.repositoryDigest || receipt.repositoryDigest);
    const acceptedAt = normalizeIsoDate(source.acceptedAt || receipt.acceptedAt);
    const pushedAt = normalizeIsoDate(source.pushedAt);
    const receivedAt = normalizeIsoDate(source.receivedAt || receipt.receivedAt);
    const message = String(source.message || receipt.message || "").slice(0, 220);
    const receiptDigest = normalizeSha256(source.receiptDigest || receipt.receiptDigest);
    const workspaceId = normalizeProjectRepositoryWorkspaceId(source.workspaceId || receipt.workspaceId || source.remoteWorkspaceId || receipt.remoteWorkspaceId || source.accountId || receipt.accountId);
    const verification = verifyProjectRepositoryReceipt({
      sourcePackageId,
      workspaceId,
      repositoryDigest,
      acceptedAt,
      receiptDigest
    }, {
      workspaceId: context.workspaceId || source.expectedWorkspaceId || receipt.expectedWorkspaceId
    });
    if (!packageId && !sourcePackageId && !packageDigest && !repositoryDigest && !acceptedAt && !pushedAt && !receivedAt && !message) {
      return null;
    }

    return {
      id: String(source.id || receipt.id || `project-repository-${packageId || sourcePackageId || repositoryDigest || Date.parse(acceptedAt || pushedAt) || "receipt"}`).slice(0, 180),
      packageId,
      sourcePackageId,
      packageDigest,
      repositoryDigest,
      receiptDigest,
      workspaceId,
      remoteVersion: String(source.remoteVersion || receipt.remoteVersion || "").slice(0, 120),
      acceptedAt,
      pushedAt,
      receivedAt,
      endpoint: String(source.endpoint || receipt.endpoint || "").trim().slice(0, 240),
      direction: ["check", "push", "pull"].includes(source.direction || receipt.direction) ? (source.direction || receipt.direction) : "",
      message,
      verificationStatus: verification.status,
      verificationMessage: verification.message,
      verificationDigest: verification.digest,
      verificationExpectedDigest: verification.expectedDigest,
      verificationWorkspaceStatus: verification.workspaceStatus,
      sceneCount: Math.max(0, Math.round(Number(source.sceneCount ?? receipt.sceneCount ?? 0))),
      modelCount: Math.max(0, Math.round(Number(source.modelCount ?? receipt.modelCount ?? 0))),
      receiptKind: String(source.receiptKind || receipt.receiptKind || PROJECT_REPOSITORY_RECEIPT_KIND).slice(0, 120),
      receipt: cloneJsonValue(receipt)
    };
  }

  function verifyProjectRepositoryReceipt(receipt = {}, context = {}) {
    const sourcePackageId = String(receipt.sourcePackageId || "").slice(0, 160);
    const workspaceId = normalizeProjectRepositoryWorkspaceId(receipt.workspaceId);
    const expectedWorkspaceId = normalizeProjectRepositoryWorkspaceId(context.workspaceId || workspaceId);
    const repositoryDigest = normalizeSha256(receipt.repositoryDigest);
    const acceptedAt = normalizeIsoDate(receipt.acceptedAt);
    const receiptDigest = normalizeSha256(receipt.receiptDigest);
    const expectedDigest = sourcePackageId && workspaceId && repositoryDigest && acceptedAt
      ? sha256StableJson({
        sourcePackageId,
        workspaceId,
        repositoryDigest,
        acceptedAt
      })
      : "";
    const digestMatches = Boolean(expectedDigest && receiptDigest && expectedDigest === receiptDigest);
    const workspaceMatches = workspaceId === expectedWorkspaceId;
    const status = digestMatches && workspaceMatches
      ? "verified"
      : digestMatches
        ? "workspace-mismatch"
        : "digest-mismatch";
    const messages = {
      verified: "本机一致性校验通过：receiptDigest 可按 sourcePackageId、workspaceId、repositoryDigest 和 acceptedAt 重算匹配。",
      "workspace-mismatch": `本机一致性校验警告：receiptDigest 一致，但回执空间 ${workspaceId} 与当前空间 ${expectedWorkspaceId} 不一致。`,
      "digest-mismatch": "本机一致性校验失败：receiptDigest 无法按项目仓库回执声明字段重算匹配。"
    };
    return {
      status,
      message: messages[status],
      digest: receiptDigest,
      expectedDigest,
      workspaceStatus: workspaceMatches ? "matched" : "mismatched"
    };
  }

  function mergeProjectRepositoryReceipts(primary = [], secondary = [], context = {}) {
    const merged = [];
    const seen = new Set();
    [...(Array.isArray(primary) ? primary : []), ...(Array.isArray(secondary) ? secondary : [])].forEach((item) => {
      const receipt = normalizeProjectRepositoryReceipt(item, context);
      if (!receipt) {
        return;
      }
      const key = getProjectRepositoryReceiptKey(receipt);
      if (!key || seen.has(key)) {
        return;
      }
      seen.add(key);
      merged.push(receipt);
    });
    return merged.slice(0, PROJECT_REPOSITORY_MAX_RECEIPTS);
  }

  function appendProjectRepositoryReceipt(receipts, receipt, context = {}) {
    return mergeProjectRepositoryReceipts(receipt ? [receipt] : [], receipts, context);
  }

  function getProjectRepositoryReceiptKey(receipt) {
    if (!receipt) return "";
    const scopedKey = receipt.receiptDigest ||
      receipt.id ||
      [receipt.packageId, receipt.sourcePackageId, receipt.repositoryDigest, receipt.packageDigest, receipt.acceptedAt, receipt.pushedAt].filter(Boolean).join(":");
    return scopedKey ? `${normalizeProjectRepositoryWorkspaceId(receipt.workspaceId)}:${scopedKey}` : "";
  }

  function normalizeProjectRepositoryVersion(record = {}) {
    const source = record && typeof record === "object" ? record : {};
    const receipt = source.receipt && typeof source.receipt === "object" ? source.receipt : {};
    const packageId = String(source.packageId || receipt.packageId || "").slice(0, 160);
    const sourcePackageId = String(source.sourcePackageId || receipt.sourcePackageId || "").slice(0, 160);
    const packageDigest = normalizeSha256(source.packageDigest || receipt.packageDigest);
    const repositoryDigest = normalizeSha256(source.repositoryDigest || receipt.repositoryDigest);
    const acceptedAt = normalizeIsoDate(source.acceptedAt || receipt.acceptedAt);
    const id = String(source.id || packageId || sourcePackageId || packageDigest || repositoryDigest || acceptedAt || "").slice(0, 180);
    const workspaceId = normalizeProjectRepositoryWorkspaceId(source.workspaceId || receipt.workspaceId || source.remoteWorkspaceId || receipt.remoteWorkspaceId || source.accountId || receipt.accountId);
    if (!id && !packageId && !sourcePackageId && !packageDigest && !repositoryDigest) {
      return null;
    }

    return {
      id,
      packageId,
      sourcePackageId,
      packageDigest,
      repositoryDigest,
      workspaceId,
      remoteVersion: String(source.remoteVersion || receipt.remoteVersion || "").slice(0, 120),
      acceptedAt,
      message: String(source.message || receipt.message || "").slice(0, 220),
      sceneCount: Math.max(0, Math.round(Number(source.sceneCount ?? source.summary?.sceneCount ?? receipt.sceneCount ?? 0))),
      modelCount: Math.max(0, Math.round(Number(source.modelCount ?? source.summary?.importedModels ?? receipt.modelCount ?? 0))),
      summary: source.summary && typeof source.summary === "object" ? cloneJsonValue(source.summary) : null
    };
  }

  function createProjectRepositoryVersionFromPackage(repositoryPackage, payload = {}) {
    if (!repositoryPackage || typeof repositoryPackage !== "object") {
      return null;
    }
    return normalizeProjectRepositoryVersion({
      id: payload.selectedVersion?.id || payload.packageId || repositoryPackage.remotePackageId || repositoryPackage.packageId || repositoryPackage.packageDigest,
      packageId: payload.selectedVersion?.packageId || payload.packageId || repositoryPackage.remotePackageId || "",
      sourcePackageId: payload.selectedVersion?.sourcePackageId || repositoryPackage.packageId || "",
      packageDigest: payload.packageDigest || repositoryPackage.packageDigest,
      repositoryDigest: payload.repositoryDigest || repositoryPackage.repositoryDigest,
      workspaceId: payload.workspaceId || payload.selectedVersion?.workspaceId || repositoryPackage.workspaceId,
      remoteVersion: payload.remoteVersion || repositoryPackage.remoteVersion || "",
      acceptedAt: payload.acceptedAt || payload.selectedVersion?.acceptedAt || repositoryPackage.exportedAt || "",
      sceneCount: repositoryPackage.summary?.sceneCount,
      modelCount: repositoryPackage.summary?.importedModels,
      summary: repositoryPackage.summary || {}
    });
  }

  function getProjectRepositoryVersionsFromPayload(payload, fallbackVersion = null, context = {}) {
    const versions = [];
    const workspaceId = normalizeProjectRepositoryWorkspaceId(context.workspaceId || payload?.workspaceId || payload?.package?.workspaceId);
    if (Array.isArray(payload?.versions)) {
      versions.push(...payload.versions.map((version) => ({ workspaceId, ...version })));
    }
    if (payload?.selectedVersion) {
      versions.unshift({ workspaceId, ...payload.selectedVersion });
    }
    if (payload?.latestVersion) {
      versions.unshift({ workspaceId, ...payload.latestVersion });
    }
    if (fallbackVersion) {
      versions.unshift({ workspaceId, ...fallbackVersion });
    }
    if (payload?.package) {
      versions.unshift(createProjectRepositoryVersionFromPackage(payload.package, { ...payload, workspaceId }));
    }
    return mergeProjectRepositoryVersions(versions);
  }

  function mergeProjectRepositoryVersions(primary = [], secondary = []) {
    const merged = [];
    const seen = new Set();
    [...(Array.isArray(primary) ? primary : []), ...(Array.isArray(secondary) ? secondary : [])].forEach((item) => {
      const version = normalizeProjectRepositoryVersion(item);
      if (!version) {
        return;
      }
      const scopedKey = version.packageId || version.sourcePackageId || version.packageDigest || version.repositoryDigest || version.id;
      const key = scopedKey ? `${version.workspaceId}:${scopedKey}` : "";
      if (!key || seen.has(key)) {
        return;
      }
      seen.add(key);
      merged.push(version);
    });
    return merged.slice(0, PROJECT_REPOSITORY_MAX_VERSIONS);
  }

  function getProjectRepositoryRemoteConfig() {
    const state = readProjectRepositoryRemoteState();
    return {
      ok: true,
      endpoint: state.endpoint,
      token: state.token,
      hasToken: Boolean(state.token),
      workspaceId: state.workspaceId,
      boundary: PROJECT_REPOSITORY_REMOTE_BOUNDARY
    };
  }

  function getProjectRepositoryRemoteStatus() {
    const state = readProjectRepositoryRemoteState();
    const remoteConfigured = Boolean(state.endpoint);
    let tone = "idle";
    let message = remoteConfigured
      ? `远端项目仓库 API 已配置：${state.endpoint}，空间 ${state.workspaceId}。`
      : `尚未配置远端项目仓库 API，当前只保留本机项目档案，空间 ${state.workspaceId}。`;

    if (state.lastPushedAt) {
      tone = "ready";
      message = state.lastRemoteStatus || `最近推送项目仓库：${formatArchiveDate(state.lastPushedAt)}。`;
    } else if (state.lastRemoteStatus) {
      tone = remoteConfigured ? "ready" : "idle";
      message = state.lastRemoteStatus;
    }
    if (state.lastError) {
      tone = "warning";
      message = [state.lastError, getProjectRepositoryRemoteRetrySummary(state)].filter(Boolean).join(" ");
    }
    if (typeof fetch !== "function") {
      tone = "warning";
      message = "当前浏览器不支持 fetch，无法连接远端项目仓库 API。";
    }

    return {
      ok: true,
      remoteConfigured,
      endpoint: remoteConfigured ? state.endpoint : "",
      hasToken: Boolean(state.token),
      workspaceId: state.workspaceId,
      fetchSupported: typeof fetch === "function",
      tone,
      message,
      boundary: PROJECT_REPOSITORY_REMOTE_BOUNDARY,
      lastCheckedAt: state.lastCheckedAt,
      lastPushedAt: state.lastPushedAt,
      lastPackageId: state.lastPackageId,
      lastRemoteVersion: state.lastRemoteVersion,
      lastRemoteStatus: state.lastRemoteStatus,
      lastPackageDigest: state.lastPackageDigest,
      lastRepositoryDigest: state.lastRepositoryDigest,
      lastError: state.lastError,
      lastRemoteFailureAt: state.lastRemoteFailureAt,
      lastFailureAction: state.lastFailureAction,
      remoteRetryAfter: state.remoteRetryAfter,
      remoteFailureCount: state.remoteFailureHistory.length,
      remoteFailureHistory: state.remoteFailureHistory,
      remoteRetrySummary: getProjectRepositoryRemoteRetrySummary(state),
      pushRetryPending: hasProjectRepositoryPushRetryPending(state),
      latestReceipt: state.receipts[0] || null,
      receiptCount: state.receipts.length,
      receipts: state.receipts,
      versionCount: state.versions.length,
      versions: state.versions
    };
  }

  function getProjectRepositoryReceiptFromPayload(payload, context = {}) {
    const candidate = payload?.receipt || payload?.latestReceipt || payload?.lastReceipt || null;
    if (!candidate || typeof candidate !== "object") {
      return null;
    }
    return normalizeProjectRepositoryReceipt({
      ...candidate,
      receipt: candidate,
      direction: context.direction || candidate.direction || "",
      endpoint: context.endpoint || candidate.endpoint || "",
      workspaceId: context.workspaceId || payload?.workspaceId || candidate.workspaceId || "",
      receivedAt: context.receivedAt || candidate.receivedAt || "",
      message: context.message || candidate.message || payload?.message || "",
      packageId: context.packageId || payload?.packageId || candidate.packageId || "",
      sourcePackageId: context.sourcePackageId || candidate.sourcePackageId || "",
      packageDigest: context.packageDigest || payload?.packageDigest || candidate.packageDigest || "",
      repositoryDigest: context.repositoryDigest || payload?.repositoryDigest || candidate.repositoryDigest || "",
      remoteVersion: context.remoteVersion || payload?.remoteVersion || candidate.remoteVersion || ""
    }, { workspaceId: context.workspaceId || payload?.workspaceId || candidate.workspaceId || "" });
  }

  function getProjectRepositoryReceiptAudit() {
    const state = readProjectRepositoryRemoteState();
    const receipts = state.receipts;
    const latestReceipt = receipts[0] || null;
    const verifiedCount = receipts.filter((receipt) => receipt.verificationStatus === "verified").length;
    return {
      ok: true,
      kind: "mr-calligraphy-project-repository-receipt-audit-v1",
      version: PROJECT_REPOSITORY_REMOTE_VERSION,
      endpoint: state.endpoint,
      hasToken: Boolean(state.token),
      workspaceId: state.workspaceId,
      total: receipts.length,
      verifiedCount,
      latestReceipt: latestReceipt ? cloneJsonValue(latestReceipt) : null,
      receipts: cloneJsonValue(receipts),
      boundary: PROJECT_REPOSITORY_REMOTE_BOUNDARY,
      message: receipts.length
        ? `已保存 ${receipts.length} 条项目仓库回执，本机校验通过 ${verifiedCount} 条，当前空间 ${state.workspaceId}，最近一次：${formatArchiveDate(latestReceipt.receivedAt || latestReceipt.acceptedAt || latestReceipt.pushedAt)}。`
        : "暂无远端项目仓库回执。"
    };
  }

  function getProjectRepositoryReceiptAuditExport(options = {}) {
    const audit = getProjectRepositoryReceiptAudit();
    if (!audit.total) {
      return {
        ok: false,
        message: "暂无可导出的项目仓库回执。"
      };
    }
    const exportedAt = options.exportedAt || new Date().toISOString();
    const filename = options.filename || `mr-calligraphy-project-repository-receipts-${formatTimestamp(new Date(exportedAt))}.html`;
    const html = createProjectRepositoryReceiptAuditHtml(audit, exportedAt);
    return {
      ok: true,
      filename,
      mimeType: "text/html;charset=utf-8",
      html,
      byteLength: html.length,
      receiptCount: audit.total,
      message: `已生成 ${audit.total} 条项目仓库回执审计报告：${filename}。`
    };
  }

  function downloadProjectRepositoryReceiptAudit(options = {}) {
    const result = getProjectRepositoryReceiptAuditExport(options);
    if (!result.ok) {
      return result;
    }
    downloadHtml(result.html, result.filename);
    return {
      ok: true,
      filename: result.filename,
      byteLength: result.byteLength,
      receiptCount: result.receiptCount,
      message: `已下载项目仓库回执审计报告：${result.filename}。`
    };
  }

  function createProjectRepositoryReceiptAuditHtml(audit, exportedAt) {
    const rows = audit.receipts.map((receipt) => {
      const digest = receipt.repositoryDigest || receipt.packageDigest || "";
      const raw = JSON.stringify(receipt, null, 2);
      return `<article class="card">
        <div class="item-head">
          <h2>${escapeHtml(receipt.packageId || receipt.sourcePackageId || "项目仓库回执")}</h2>
          <span>${escapeHtml(formatProjectRepositoryReceiptDirection(receipt.direction))}</span>
        </div>
        <p>${escapeHtml(receipt.message || "远端已接收项目仓库包。")}</p>
        <ul>
          <li>本机包：${escapeHtml(receipt.sourcePackageId || "未知")}</li>
          <li>远端版本：${escapeHtml(receipt.remoteVersion || "未知")}</li>
          <li>Workspace：${escapeHtml(receipt.workspaceId || audit.workspaceId || PROJECT_REPOSITORY_DEFAULT_WORKSPACE)}</li>
          <li>场景 / 模型：${escapeHtml(receipt.sceneCount || 0)} / ${escapeHtml(receipt.modelCount || 0)}</li>
          <li>服务端接收：${escapeHtml(formatArchiveDate(receipt.acceptedAt || receipt.pushedAt || receipt.receivedAt))}</li>
          <li>本机记录：${escapeHtml(formatArchiveDate(receipt.receivedAt || receipt.pushedAt || receipt.acceptedAt))}</li>
          <li>Endpoint：${escapeHtml(receipt.endpoint || audit.endpoint || "未知")}</li>
          <li>Package Digest：${escapeHtml(receipt.packageDigest || "未知")}</li>
          <li>Repository Digest：${escapeHtml(digest || "未知")}</li>
          <li>Receipt Digest：${escapeHtml(receipt.receiptDigest || "未返回")}</li>
          <li>本机校验：${escapeHtml(formatProjectRepositoryReceiptVerificationStatus(receipt.verificationStatus))}</li>
          <li>校验说明：${escapeHtml(receipt.verificationMessage || "未生成校验说明")}</li>
          <li>重算摘要：${escapeHtml(receipt.verificationExpectedDigest || "无法重算")}</li>
        </ul>
        <details>
          <summary>查看原始回执 JSON</summary>
          <pre>${escapeHtml(raw)}</pre>
        </details>
      </article>`;
    }).join("");

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MR 书法项目仓库回执审计</title>
  <style>
    :root { color-scheme: light; --ink:#17221f; --muted:#61706a; --line:#dbe8e2; --jade:#247a67; --paper:#fbf7ee; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--paper); font: 14px/1.62 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; }
    main { width: min(980px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 44px; }
    header { display: grid; gap: 10px; padding-bottom: 18px; border-bottom: 2px solid var(--ink); }
    h1, h2, p { margin: 0; }
    h1 { font-size: clamp(28px, 5vw, 46px); line-height: 1.08; }
    h2 { font-size: 16px; overflow-wrap: anywhere; }
    .muted { color: var(--muted); }
    .stack { display: grid; gap: 12px; margin-top: 22px; }
    .card { display: grid; gap: 8px; padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    .item-head { display: flex; gap: 10px; justify-content: space-between; align-items: baseline; }
    .item-head span { color: var(--jade); font-weight: 800; white-space: nowrap; }
    ul { display: grid; gap: 4px; margin: 0; padding-left: 18px; color: var(--muted); overflow-wrap: anywhere; }
    summary { color: var(--jade); cursor: pointer; font-weight: 800; }
    pre { max-height: 260px; margin: 8px 0 0; padding: 10px; overflow: auto; border: 1px solid var(--line); border-radius: 6px; background: #f7faf8; color: #24332f; white-space: pre-wrap; word-break: break-word; }
    footer { margin-top: 24px; padding-top: 14px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    @media (max-width: 720px) { .item-head { display: grid; } .item-head span { white-space: normal; } }
    @media print { body { background: #ffffff; } main { width: 100%; padding: 0; } .card { break-inside: avoid; } }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="muted">MR Calligraphy Project Repository Receipt Audit · ${escapeHtml(formatArchiveDate(exportedAt))}</p>
      <h1>项目仓库回执审计</h1>
      <p class="muted">本报告来自当前浏览器保存的远端项目仓库回执；它证明前端 adapter 曾向配置 endpoint 发送或读取项目仓库包，但不替代生产账号、权限和不可篡改审计。</p>
    </header>
    <section class="stack">${rows}</section>
    <footer>Endpoint：${escapeHtml(audit.endpoint || "未配置")}。Workspace：${escapeHtml(audit.workspaceId || PROJECT_REPOSITORY_DEFAULT_WORKSPACE)}。回执数量：${escapeHtml(audit.total)}。本机校验通过：${escapeHtml(audit.verifiedCount || 0)}。导出时间：${escapeHtml(formatArchiveDate(exportedAt))}。边界：${escapeHtml(audit.boundary)}</footer>
  </main>
</body>
</html>`;
  }

  function formatProjectRepositoryReceiptDirection(direction) {
    return {
      check: "远端检查",
      push: "仓库推送",
      pull: "仓库拉取"
    }[direction] || "远端回执";
  }

  function formatProjectRepositoryReceiptVerificationStatus(status) {
    return {
      verified: "本机校验通过",
      "workspace-mismatch": "空间不匹配",
      "digest-mismatch": "摘要不匹配"
    }[status] || "未校验";
  }

  function validateProjectRepositoryEndpoint(endpoint) {
    try {
      const base = typeof location !== "undefined" && location.href ? location.href : "http://localhost/";
      const url = new URL(endpoint, base);
      if (!["http:", "https:"].includes(url.protocol)) {
        return { ok: false, message: "远端项目仓库 API 只支持 http 或 https 地址。" };
      }
      return { ok: true, endpoint: url.href };
    } catch (error) {
      return { ok: false, message: "远端项目仓库 API 地址无效。" };
    }
  }

  function configureProjectRepositoryRemote(config = {}) {
    const state = readProjectRepositoryRemoteState();
    const endpointInput = String(config.endpoint ?? config.remoteEndpoint ?? "").trim();
    const tokenInput = config.token ?? config.remoteToken;
    const token = tokenInput === undefined ? state.token : String(tokenInput || "").trim();
    const workspaceId = normalizeProjectRepositoryWorkspaceId(config.workspaceId ?? config.remoteWorkspaceId ?? config.accountId ?? state.workspaceId);

    if (!endpointInput) {
      writeProjectRepositoryRemoteState({
        ...state,
        endpoint: "",
        token: "",
        workspaceId,
        lastPackageId: "",
        lastRemoteVersion: "",
        lastPushedAt: "",
        lastPackageDigest: "",
        lastRepositoryDigest: "",
        versions: [],
        receipts: [],
        lastCheckedAt: new Date().toISOString(),
        lastRemoteStatus: `已清除远端项目仓库 API 配置，空间 ${workspaceId} 回到本机项目档案。`,
        lastError: "",
        remoteRetryAfter: ""
      });
      return {
        ok: true,
        status: getProjectRepositoryRemoteStatus(),
        message: `已清除远端项目仓库 API 配置，当前只保留本机项目档案，空间 ${workspaceId}。`
      };
    }

    const validation = validateProjectRepositoryEndpoint(endpointInput);
    if (!validation.ok) {
      writeProjectRepositoryRemoteState({
        ...state,
        workspaceId,
        lastCheckedAt: new Date().toISOString(),
        lastError: validation.message,
        remoteRetryAfter: ""
      });
      return { ok: false, status: getProjectRepositoryRemoteStatus(), message: validation.message };
    }

    const sameRemoteSpace = validation.endpoint === state.endpoint && workspaceId === state.workspaceId;
    writeProjectRepositoryRemoteState({
      ...state,
      endpoint: validation.endpoint,
      token,
      workspaceId,
      lastPackageId: sameRemoteSpace ? state.lastPackageId : "",
      lastRemoteVersion: sameRemoteSpace ? state.lastRemoteVersion : "",
      lastPushedAt: sameRemoteSpace ? state.lastPushedAt : "",
      lastPackageDigest: sameRemoteSpace ? state.lastPackageDigest : "",
      lastRepositoryDigest: sameRemoteSpace ? state.lastRepositoryDigest : "",
      versions: sameRemoteSpace ? state.versions : [],
      receipts: sameRemoteSpace ? state.receipts : [],
      lastCheckedAt: new Date().toISOString(),
      lastRemoteStatus: `远端项目仓库 API 配置已保存，空间 ${workspaceId} 尚未检查服务可用性。`,
      lastError: "",
      remoteRetryAfter: ""
    });
    return {
      ok: true,
      status: getProjectRepositoryRemoteStatus(),
      message: `已保存远端项目仓库 API 配置，空间 ${workspaceId}。`
    };
  }

  async function checkProjectRepositoryRemote(options = {}) {
    const state = readProjectRepositoryRemoteState();
    if (!state.endpoint) {
      return persistProjectRepositoryRemoteError("尚未配置远端项目仓库 API。");
    }
    if (typeof fetch !== "function") {
      return persistProjectRepositoryRemoteError("当前浏览器不支持 fetch，无法连接远端项目仓库 API。");
    }

    try {
      const response = await requestProjectRepositoryRemote(state.endpoint, {
        method: "GET",
        headers: createProjectRepositoryRemoteHeaders(state)
      }, options);
      const payload = await parseProjectRepositoryResponse(response, "远端项目仓库 API 检查失败。");
      const checkedAt = new Date().toISOString();
      const message = String(payload.message || "远端项目仓库 API 可访问。").slice(0, 220);
      const remoteVersions = mergeProjectRepositoryVersions(getProjectRepositoryVersionsFromPayload(payload, null, { workspaceId: state.workspaceId }), state.versions);
      const receipt = getProjectRepositoryReceiptFromPayload(payload, {
        direction: "check",
        endpoint: state.endpoint,
        workspaceId: state.workspaceId,
        receivedAt: checkedAt,
        message
      });
      writeProjectRepositoryRemoteState({
        ...state,
        workspaceId: state.workspaceId,
        lastCheckedAt: checkedAt,
        lastRemoteVersion: String(payload.remoteVersion || payload.contract?.kind || "").slice(0, 120),
        lastRemoteStatus: `${message} 空间：${state.workspaceId}。`,
        lastError: "",
        remoteRetryAfter: "",
        versions: remoteVersions,
        receipts: appendProjectRepositoryReceipt(state.receipts, receipt, { workspaceId: state.workspaceId })
      });
      return {
        ok: true,
        message: `${message} 空间 ${state.workspaceId}。`,
        remote: payload,
        receipt,
        status: getProjectRepositoryRemoteStatus()
      };
    } catch (error) {
      return persistProjectRepositoryRemoteError(formatProjectRepositoryRemoteError("检查", error), {
        action: "check",
        error,
        retryDelayMs: options.retryDelayMs
      });
    }
  }

  async function pushProjectRepositoryToRemote(options = {}) {
    const state = readProjectRepositoryRemoteState();
    if (!state.endpoint) {
      return persistProjectRepositoryRemoteError("尚未配置远端项目仓库 API。");
    }
    if (typeof fetch !== "function") {
      return persistProjectRepositoryRemoteError("当前浏览器不支持 fetch，无法推送项目仓库。");
    }

    let repositoryPackage;
    try {
      repositoryPackage = await createProjectRepositoryPackage();
      const response = await requestProjectRepositoryRemote(state.endpoint, {
        method: "PUT",
        headers: createProjectRepositoryRemoteHeaders(state, true),
        body: JSON.stringify(repositoryPackage)
      }, options);
      const payload = await parseProjectRepositoryResponse(response, "远端项目仓库推送失败。");
      const pushedAt = new Date().toISOString();
      const message = String(payload.message || "远端项目仓库已接收当前项目档案包。").slice(0, 220);
      const receipt = normalizeProjectRepositoryReceipt({
        ...(payload.receipt && typeof payload.receipt === "object" ? payload.receipt : {}),
        receipt: payload.receipt,
        message,
        packageId: payload.packageId || payload.receipt?.packageId || repositoryPackage.packageId,
        sourcePackageId: repositoryPackage.packageId,
        packageDigest: payload.packageDigest || payload.receipt?.packageDigest || repositoryPackage.packageDigest,
        repositoryDigest: payload.repositoryDigest || payload.receipt?.repositoryDigest || repositoryPackage.packageDigest,
        workspaceId: state.workspaceId,
        remoteVersion: payload.remoteVersion || payload.receipt?.remoteVersion || "",
        acceptedAt: payload.acceptedAt || payload.receipt?.acceptedAt || pushedAt,
        pushedAt,
        receivedAt: pushedAt,
        endpoint: state.endpoint,
        direction: "push",
        sceneCount: repositoryPackage.summary.sceneCount,
        modelCount: repositoryPackage.summary.importedModels
      }, { workspaceId: state.workspaceId });
      const pushedVersion = normalizeProjectRepositoryVersion({
        ...(payload.selectedVersion && typeof payload.selectedVersion === "object" ? payload.selectedVersion : {}),
        packageId: payload.packageId || receipt?.packageId || "",
        sourcePackageId: repositoryPackage.packageId,
        packageDigest: repositoryPackage.packageDigest,
        repositoryDigest: payload.repositoryDigest || receipt?.repositoryDigest || repositoryPackage.packageDigest,
        workspaceId: state.workspaceId,
        remoteVersion: payload.remoteVersion || receipt?.remoteVersion || "",
        acceptedAt: payload.acceptedAt || receipt?.acceptedAt || pushedAt,
        message,
        sceneCount: repositoryPackage.summary.sceneCount,
        modelCount: repositoryPackage.summary.importedModels,
        summary: repositoryPackage.summary
      });
      const remoteVersions = mergeProjectRepositoryVersions(getProjectRepositoryVersionsFromPayload(payload, pushedVersion, { workspaceId: state.workspaceId }), state.versions);
      writeProjectRepositoryRemoteState({
        ...state,
        workspaceId: state.workspaceId,
        lastCheckedAt: pushedAt,
        lastPushedAt: pushedAt,
        lastPackageId: receipt?.packageId || repositoryPackage.packageId,
        lastRemoteVersion: String(payload.remoteVersion || receipt?.remoteVersion || "").slice(0, 120),
        lastRemoteStatus: `${message} 空间：${state.workspaceId}。`,
        lastPackageDigest: repositoryPackage.packageDigest,
        lastRepositoryDigest: receipt?.repositoryDigest || repositoryPackage.packageDigest,
        lastError: "",
        remoteRetryAfter: "",
        versions: remoteVersions,
        receipts: appendProjectRepositoryReceipt(state.receipts, receipt, { workspaceId: state.workspaceId })
      });
      return {
        ok: true,
        message: `${message} 空间 ${state.workspaceId}。`,
        package: repositoryPackage,
        remote: payload,
        receipt,
        status: getProjectRepositoryRemoteStatus()
      };
    } catch (error) {
      return persistProjectRepositoryRemoteError(formatProjectRepositoryRemoteError("推送", error), {
        action: "push",
        error,
        retryDelayMs: options.retryDelayMs,
        packageId: repositoryPackage?.packageId || "",
        packageDigest: repositoryPackage?.packageDigest || "",
        sceneCount: repositoryPackage?.summary?.sceneCount || 0,
        modelCount: repositoryPackage?.summary?.importedModels || 0
      });
    }
  }

  async function pullProjectRepositoryFromRemote(options = {}) {
    const state = readProjectRepositoryRemoteState();
    if (!state.endpoint) {
      return persistProjectRepositoryRemoteError("尚未配置远端项目仓库 API。");
    }
    if (typeof fetch !== "function") {
      return persistProjectRepositoryRemoteError("当前浏览器不支持 fetch，无法拉取项目仓库。");
    }

    try {
      const requestedPackageId = String(options.packageId || options.versionPackageId || "").trim();
      const response = await requestProjectRepositoryRemote(createProjectRepositoryRemoteRequestUrl(state.endpoint, requestedPackageId ? { packageId: requestedPackageId } : {}), {
        method: "GET",
        headers: createProjectRepositoryRemoteHeaders(state)
      }, options);
      const payload = await parseProjectRepositoryResponse(response, "远端项目仓库拉取失败。");
      const repositoryPackage = extractProjectRepositoryPackage(payload);
      await assertProjectRepositoryPackageDigest(repositoryPackage);
      const archive = migrateProjectArchive(repositoryPackage.archive);
      validateArchive(archive);
      const preview = await createArchivePreview(archive);
      const checkedAt = new Date().toISOString();
      const message = String(payload.message || `远端项目仓库包已拉取：${repositoryPackage.packageId || "未命名包"}。`).slice(0, 220);
      const pulledVersion = createProjectRepositoryVersionFromPackage(repositoryPackage, payload);
      const remoteVersions = mergeProjectRepositoryVersions(getProjectRepositoryVersionsFromPayload(payload, pulledVersion, { workspaceId: state.workspaceId }), state.versions);
      preview.remoteRepository = createProjectRepositoryPreviewSource({
        state,
        payload,
        repositoryPackage,
        pulledVersion,
        remoteVersions,
        requestedPackageId,
        preview
      });
      const receipt = getProjectRepositoryReceiptFromPayload(payload, {
        direction: "pull",
        endpoint: state.endpoint,
        workspaceId: state.workspaceId,
        receivedAt: checkedAt,
        message,
        packageId: payload.packageId || pulledVersion?.packageId || repositoryPackage.packageId,
        sourcePackageId: pulledVersion?.sourcePackageId || repositoryPackage.packageId,
        packageDigest: payload.packageDigest || repositoryPackage.packageDigest,
        repositoryDigest: payload.repositoryDigest || pulledVersion?.repositoryDigest || repositoryPackage.repositoryDigest,
        remoteVersion: payload.remoteVersion || pulledVersion?.remoteVersion || repositoryPackage.remoteVersion || ""
      });
      writeProjectRepositoryRemoteState({
        ...state,
        workspaceId: state.workspaceId,
        lastCheckedAt: checkedAt,
        lastPackageId: String(payload.packageId || repositoryPackage.packageId || state.lastPackageId || "").slice(0, 160),
        lastRemoteVersion: String(payload.remoteVersion || repositoryPackage.remoteVersion || "").slice(0, 120),
        lastRemoteStatus: `${message} 空间：${state.workspaceId}。`,
        lastPackageDigest: normalizeSha256(repositoryPackage.packageDigest) || state.lastPackageDigest,
        lastRepositoryDigest: normalizeSha256(payload.repositoryDigest || repositoryPackage.repositoryDigest) || state.lastRepositoryDigest,
        lastError: "",
        remoteRetryAfter: "",
        versions: remoteVersions,
        receipts: appendProjectRepositoryReceipt(state.receipts, receipt, { workspaceId: state.workspaceId })
      });
      return {
        ok: true,
        message: `${message} 空间 ${state.workspaceId}。`,
        remote: payload,
        package: repositoryPackage,
        archive,
        preview,
        receipt,
        status: getProjectRepositoryRemoteStatus()
      };
    } catch (error) {
      return persistProjectRepositoryRemoteError(formatProjectRepositoryRemoteError("拉取", error), {
        action: "pull",
        error,
        retryDelayMs: options.retryDelayMs
      });
    }
  }

  function extractProjectRepositoryPackage(payload) {
    const candidate = payload?.kind === PROJECT_REPOSITORY_PACKAGE_KIND ? payload : payload?.package;
    if (!candidate || typeof candidate !== "object") {
      throw new Error("远端响应中没有项目仓库包。");
    }
    if (candidate.kind !== PROJECT_REPOSITORY_PACKAGE_KIND) {
      throw new Error("远端项目仓库包 kind 不匹配。");
    }
    if (Number(candidate.version) !== PROJECT_REPOSITORY_REMOTE_VERSION) {
      throw new Error("远端项目仓库包版本不匹配。");
    }
    if (!candidate.archive || typeof candidate.archive !== "object") {
      throw new Error("远端项目仓库包缺少 archive。");
    }
    return candidate;
  }

  async function assertProjectRepositoryPackageDigest(repositoryPackage) {
    const expectedDigest = normalizeSha256(repositoryPackage.packageDigest);
    if (!expectedDigest) {
      throw new Error("远端项目仓库包缺少 packageDigest。");
    }
    const comparable = cloneJsonValue(repositoryPackage);
    delete comparable.packageDigest;
    const actualDigest = await createStableJsonSha256(comparable);
    if (actualDigest !== expectedDigest) {
      throw new Error("远端项目仓库包摘要不匹配，已拒绝进入恢复预览。");
    }
  }

  function createProjectRepositoryRemoteHeaders(state, includeJson = false) {
    const headers = { Accept: "application/json" };
    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }
    if (state.token) {
      headers.Authorization = `Bearer ${state.token}`;
    }
    headers["X-MR-Workspace-Id"] = normalizeProjectRepositoryWorkspaceId(state.workspaceId);
    return headers;
  }

  function createProjectRepositoryRemoteRequestUrl(endpoint, params = {}) {
    const base = typeof location !== "undefined" && location.href ? location.href : "http://localhost/";
    const url = new URL(endpoint, base);
    Object.entries(params || {}).forEach(([key, value]) => {
      const text = String(value || "").trim();
      if (text) {
        url.searchParams.set(key, text);
      }
    });
    return url.href;
  }

  function createProjectRepositoryTimeoutError(timeoutMs) {
    const seconds = Math.max(1, Math.ceil(Number(timeoutMs || PROJECT_REPOSITORY_REQUEST_TIMEOUT_MS) / 1000));
    const error = new Error(`请求超时，远端项目仓库 API 在 ${seconds} 秒内未响应`);
    error.name = "ProjectRepositoryTimeoutError";
    error.failureKind = "timeout";
    error.timeoutMs = timeoutMs;
    return error;
  }

  async function requestProjectRepositoryRemote(url, requestOptions = {}, options = {}) {
    const timeoutMs = Math.max(0, Math.round(Number(options.timeoutMs ?? PROJECT_REPOSITORY_REQUEST_TIMEOUT_MS)));
    const request = fetch(url, requestOptions);
    if (!timeoutMs) {
      return request;
    }
    let timer = null;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(createProjectRepositoryTimeoutError(timeoutMs)), timeoutMs);
    });
    try {
      return await Promise.race([request, timeout]);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  async function parseProjectRepositoryResponse(response, fallbackMessage) {
    let payload = null;
    let text = "";
    try {
      text = await response.text();
    } catch (textError) {
      text = "";
    }
    if (text.trim()) {
      try {
        payload = JSON.parse(text);
      } catch (jsonError) {
        throw new Error(`${fallbackMessage || "远端项目仓库 API 返回失败。"} 远端返回的不是 JSON。`);
      }
    } else {
      throw new Error(`${fallbackMessage || "远端项目仓库 API 返回失败。"} 远端没有返回 JSON。`);
    }
    const statusText = response.status ? `HTTP ${response.status}` : "";
    const remoteMessage = String(payload?.message || payload?.error || fallbackMessage || "").slice(0, 220);
    const message = [statusText, remoteMessage].filter(Boolean).join("：");
    if (!response.ok || payload?.ok === false) {
      throw new Error(message || fallbackMessage || "远端项目仓库 API 返回失败。");
    }
    return payload;
  }

  function formatProjectRepositoryRemoteError(action, error) {
    const raw = String(error?.message || "未知错误").trim();
    const normalized = raw.toLowerCase();
    const isTimeout = error?.failureKind === "timeout" || error?.name === "ProjectRepositoryTimeoutError" || normalized.includes("timeout") || raw.includes("超时");
    const isNetworkError = error instanceof TypeError ||
      normalized.includes("failed to fetch") ||
      normalized.includes("networkerror") ||
      normalized.includes("load failed") ||
      normalized.includes("network request failed");
    const reason = isTimeout ? raw : isNetworkError ? "网络请求异常" : raw;
    return `远端项目仓库${action}失败：${reason}。`;
  }

  function persistProjectRepositoryRemoteError(message, context = {}) {
    const state = readProjectRepositoryRemoteState();
    const failedAt = new Date().toISOString();
    const action = normalizeProjectRepositoryFailureAction(context.action);
    const shouldRecordFailure = Boolean(state.endpoint && action);
    const attemptCount = shouldRecordFailure ? state.remoteFailureHistory.length + 1 : 0;
    const retryAfter = shouldRecordFailure
      ? new Date(Date.parse(failedAt) + getProjectRepositoryRetryDelayMs(attemptCount, context)).toISOString()
      : "";
    const failure = shouldRecordFailure
      ? normalizeProjectRepositoryRemoteFailure({
        action,
        failureKind: classifyProjectRepositoryFailure(message, context.error),
        message,
        endpoint: state.endpoint,
        workspaceId: state.workspaceId,
        failedAt,
        retryAfter,
        attemptCount,
        packageId: context.packageId,
        packageDigest: context.packageDigest,
        sceneCount: context.sceneCount,
        modelCount: context.modelCount
      })
      : null;
    writeProjectRepositoryRemoteState({
      ...state,
      lastCheckedAt: failedAt,
      lastError: message,
      lastRemoteFailureAt: failure ? failedAt : state.lastRemoteFailureAt,
      lastFailureAction: failure ? action : state.lastFailureAction,
      remoteRetryAfter: failure ? retryAfter : state.remoteRetryAfter,
      remoteFailureHistory: failure
        ? [failure, ...state.remoteFailureHistory].slice(0, PROJECT_REPOSITORY_MAX_FAILURES)
        : state.remoteFailureHistory
    });
    return {
      ok: false,
      message,
      failure,
      status: getProjectRepositoryRemoteStatus()
    };
  }

  async function importProject(fileOrArchive) {
    const archive = await resolveArchive(fileOrArchive);
    const restoredArchive = await restoreProjectArchive(archive);
    return summarizeArchive(restoredArchive, "已恢复项目档案，刷新页面后生效。");
  }

  async function prepareImportProject(file) {
    const archive = await readArchiveFile(file);
    return {
      ok: true,
      archive,
      preview: await createArchivePreview(archive),
      message: "项目档案已校验，请确认差异后恢复。"
    };
  }

  async function restoreProjectArchive(archive, options = null) {
    const migratedArchive = migrateProjectArchive(archive);
    validateArchive(migratedArchive);
    const restoreOptions = normalizeRestoreOptions(options, migratedArchive);

    if (!restoreOptions.storageKeys.length && !restoreOptions.dbIds.length) {
      throw new Error("请至少选择一项要恢复的项目档案内容。");
    }

    const hashValidation = await validateArchiveAssetHashes(migratedArchive, restoreOptions.dbIds, restoreOptions.dbRecords);
    importLocalStorage(migratedArchive.storage || {}, restoreOptions.storageKeys, restoreOptions.storageFields);

    for (const item of DB_ITEMS) {
      if (restoreOptions.dbIds.includes(item.id)) {
        await importDbStore(item, migratedArchive.indexedDb?.[item.id], restoreOptions.dbRecords[item.id]);
      }
    }

    const auditRecord = await appendRestoreAuditRecord(migratedArchive, restoreOptions, hashValidation);
    if (auditRecord) {
      migratedArchive.restoreAuditRecord = auditRecord;
    }
    return migratedArchive;
  }

  async function resolveArchive(fileOrArchive) {
    if (fileOrArchive && typeof fileOrArchive.text === "function") {
      const result = await prepareImportProject(fileOrArchive);
      return result.archive;
    }

    return migrateProjectArchive(fileOrArchive);
  }

  async function readArchiveFile(file) {
    if (!file) {
      throw new Error("请选择项目档案 JSON 文件。");
    }

    let archive;
    try {
      archive = JSON.parse(await file.text());
    } catch (error) {
      throw new Error("项目档案 JSON 格式不正确，无法读取。");
    }

    return migrateProjectArchive(archive);
  }

  async function createArchivePreview(archive) {
    const migratedArchive = migrateProjectArchive(archive);
    validateArchive(migratedArchive);

    const storage = STORAGE_ITEMS.map((item) => compareStorageItem(item, migratedArchive.storage || {}));
    const indexedDb = [];

    for (const item of DB_ITEMS) {
      indexedDb.push(await compareDbItem(item, migratedArchive.indexedDb?.[item.id]));
    }

    const projectSchema = getArchiveProjectSchema(migratedArchive);

    const preview = {
      exportedAt: migratedArchive.exportedAt || "",
      source: migratedArchive.source || "",
      migrations: migratedArchive.migrations || [],
      projectSchema,
      schemaSummary: summarizeProjectSchema(projectSchema),
      storage,
      indexedDb,
      summary: summarizeImportPreview(storage, indexedDb)
    };
    preview.riskSummary = createArchivePreviewRiskSummary(preview);
    return preview;
  }

  function createProjectRepositoryPreviewSource(context = {}) {
    const state = context.state || {};
    const payload = context.payload || {};
    const repositoryPackage = context.repositoryPackage || {};
    const pulledVersion = context.pulledVersion || {};
    const preview = context.preview || {};
    const summary = repositoryPackage.summary || preview.summary || {};
    const schemaSummary = preview.schemaSummary || {};
    const packageDigest = normalizeSha256(repositoryPackage.packageDigest || payload.packageDigest || pulledVersion.packageDigest);
    const repositoryDigest = normalizeSha256(payload.repositoryDigest || pulledVersion.repositoryDigest || repositoryPackage.repositoryDigest);
    const riskSummary = preview.riskSummary || createArchivePreviewRiskSummary(preview);
    return {
      kind: "mr-calligraphy-project-repository-preview-source-v1",
      sourceType: "remote-project-repository",
      endpoint: String(state.endpoint || "").slice(0, 420),
      workspaceId: normalizeProjectRepositoryWorkspaceId(state.workspaceId || repositoryPackage.workspaceId || payload.workspaceId),
      packageId: String(payload.packageId || pulledVersion.packageId || repositoryPackage.packageId || "").slice(0, 160),
      sourcePackageId: String(pulledVersion.sourcePackageId || repositoryPackage.packageId || "").slice(0, 160),
      requestedPackageId: String(context.requestedPackageId || "").slice(0, 160),
      remoteVersion: String(payload.remoteVersion || pulledVersion.remoteVersion || repositoryPackage.remoteVersion || "").slice(0, 120),
      packageDigest,
      repositoryDigest,
      exportedAt: repositoryPackage.exportedAt || preview.exportedAt || "",
      acceptedAt: payload.acceptedAt || pulledVersion.acceptedAt || repositoryPackage.acceptedAt || "",
      versionCount: Array.isArray(context.remoteVersions) ? context.remoteVersions.length : 0,
      sceneCount: Number(summary.sceneCount || schemaSummary.repositoryReadyScenes || 0),
      publishedSceneCount: Number(summary.publishedSceneCount || schemaSummary.mainReleases || schemaSummary.realisticReleases || 0),
      importedModels: Number(summary.importedModels || schemaSummary.importedModels || 0),
      textureAssets: Number(summary.textureAssets || schemaSummary.textureAssets || 0),
      riskLevel: riskSummary.level,
      riskLabel: riskSummary.label,
      riskText: riskSummary.text,
      riskReasons: riskSummary.reasons,
      boundary: PROJECT_REPOSITORY_REMOTE_BOUNDARY
    };
  }

  function compareStorageItem(item, storage) {
    const record = storage[item.key];
    const incomingValue = record?.value == null ? null : record.value;
    const currentValue = window.localStorage.getItem(item.key);
    const migratedMissing = record?.migratedMissing === true;
    const fieldDiff = createStorageFieldDiff(currentValue, incomingValue);

    if (incomingValue !== null && typeof incomingValue !== "string") {
      throw new Error(`项目档案中的 ${item.label} 数据格式不正确。`);
    }

    return {
      id: item.key,
      label: item.label,
      change: getStorageChange(currentValue, incomingValue),
      currentBytes: currentValue ? new Blob([currentValue]).size : 0,
      incomingBytes: incomingValue ? new Blob([incomingValue]).size : 0,
      fieldDiffSummary: fieldDiff.summary,
      fieldImpactSummary: fieldDiff.impactSummary,
      fieldDiffs: fieldDiff.items,
      fieldSelections: fieldDiff.selections,
      defaultSelected: !migratedMissing,
      migrationNote: migratedMissing ? `旧档案不包含“${item.label}”，默认保留当前本机内容。` : ""
    };
  }

  function createStorageFieldDiff(currentValue, incomingValue) {
    const current = parseJsonForDiff(currentValue);
    const incoming = parseJsonForDiff(incomingValue);
    if (!current.ok || !incoming.ok) {
      return { summary: "", impactSummary: "", items: [], selections: [] };
    }

    const currentFields = current.value == null ? new Map() : flattenDiffFields(current.value);
    const incomingFields = incoming.value == null ? new Map() : flattenDiffFields(incoming.value);
    const added = [];
    const updated = [];
    const removed = [];

    incomingFields.forEach((incomingField, path) => {
      const currentField = currentFields.get(path);
      if (!currentField) {
        added.push(incomingField);
        return;
      }
      if (incomingField.signature !== currentField.signature) {
        updated.push(incomingField);
      }
    });

    currentFields.forEach((currentField, path) => {
      if (!incomingFields.has(path)) {
        removed.push(currentField);
      }
    });

    const total = added.length + updated.length + removed.length;
    if (!total) {
      return { summary: "字段无变化", impactSummary: "", items: [], selections: [] };
    }

    const selections = createDeepFieldSelections(current.value, incoming.value, { added, updated, removed });
    return finalizeStorageFieldDiffSummary(added, updated, removed, selections);
  }

  function createDeepFieldSelections(currentValue, incomingValue, diff) {
    if (incomingValue == null) {
      return [];
    }

    const currentTopFields = getTopLevelFieldMap(currentValue);
    const incomingTopFields = getTopLevelFieldMap(incomingValue);
    const currentFields = currentValue == null ? new Map() : flattenDiffFields(currentValue);
    const incomingFields = incomingValue == null ? new Map() : flattenDiffFields(incomingValue);
    const selections = [];
    const wholeFieldKeys = new Set();
    const pushed = new Set();

    const pushSelection = (action, path, currentField, incomingField) => {
      const key = `${action}:${path}`;
      if (pushed.has(key)) {
        return;
      }
      pushed.add(key);
      selections.push(createFieldSelection(action, getFieldActionLabel(action), path, currentField, incomingField));
    };

    const pushWholeFieldSelection = (action, path) => {
      const topPath = getDiffTopLevelPath(path);
      if (wholeFieldKeys.has(topPath)) {
        return;
      }
      wholeFieldKeys.add(topPath);
      pushSelection(action, topPath, currentTopFields.get(topPath), incomingTopFields.get(topPath));
    };

    diff.added.forEach((field) => {
      const topPath = getDiffTopLevelPath(field.path);
      if (!currentTopFields.has(topPath) || isStructuralDiffPath(field.path)) {
        pushWholeFieldSelection("add", field.path);
        return;
      }
      pushSelection("add", field.path, null, incomingFields.get(field.path));
    });

    diff.updated.forEach((field) => {
      if (isStructuralDiffPath(field.path)) {
        pushWholeFieldSelection("update", field.path);
        return;
      }
      pushSelection("update", field.path, currentFields.get(field.path), incomingFields.get(field.path));
    });

    diff.removed.forEach((field) => {
      const topPath = getDiffTopLevelPath(field.path);
      if (!incomingTopFields.has(topPath) || isStructuralDiffPath(field.path)) {
        pushWholeFieldSelection("remove", field.path);
        return;
      }
      pushSelection("remove", field.path, currentFields.get(field.path), null);
    });

    return selections.filter((field) => !wholeFieldKeys.has(getDiffTopLevelPath(field.path)) || field.path === getDiffTopLevelPath(field.path));
  }

  function getFieldActionLabel(action) {
    if (action === "add") return "新增字段";
    if (action === "remove") return "删除字段";
    return "修改字段";
  }

  function getDiffTopLevelPath(path) {
    if (path === "root") {
      return "root";
    }
    return path.match(/^[^.[\]]+/)?.[0] || path;
  }

  function isStructuralDiffPath(path) {
    return path.endsWith(".length") || path.includes("[...]");
  }

  function getTopLevelFieldMap(value) {
    const result = new Map();
    if (value == null) {
      return result;
    }
    if (!Array.isArray(value) && typeof value === "object") {
      Object.keys(value).sort().forEach((key) => {
        result.set(key, { path: key, signature: stableStringify(value[key]), value: value[key] });
      });
      return result;
    }
    result.set("root", { path: "root", signature: stableStringify(value), value });
    return result;
  }

  function createFieldSelection(action, prefix, path, currentField, incomingField) {
    return {
      action,
      path,
      label: `${prefix}：${path}`,
      detail: createFieldSelectionDetail(action, currentField, incomingField),
      impact: getFieldSelectionImpact(action),
      currentPreview: currentField ? createJsonPreview(currentField.value, "本机中无此字段") : "本机中无此字段",
      incomingPreview: incomingField ? createJsonPreview(incomingField.value, "档案中无此字段") : "档案中无此字段"
    };
  }

  function finalizeStorageFieldDiffSummary(added, updated, removed, selections) {
    return {
      summary: `${added.length} 新增字段 / ${updated.length} 修改字段 / ${removed.length} 删除字段`,
      impactSummary: summarizeFieldSelectionImpact(selections),
      items: [
        ...formatFieldDiffItems("新增", added),
        ...formatFieldDiffItems("修改", updated),
        ...formatFieldDiffItems("删除", removed)
      ].slice(0, 6),
      selections
    };
  }

  function createFieldSelectionDetail(action, currentField, incomingField) {
    const current = currentField ? summarizeJsonValue(currentField.value) : "本机无此字段";
    const incoming = incomingField ? summarizeJsonValue(incomingField.value) : "档案无此字段";
    if (action === "remove") {
      return `当前：${current} → 恢复后删除`;
    }
    if (action === "add") {
      return `当前：${current} → 档案：${incoming}`;
    }
    return `当前：${current} → 档案：${incoming}`;
  }

  function getFieldSelectionImpact(action) {
    if (action === "add") return "会新增到本机";
    if (action === "remove") return "会删除本机字段";
    return "会覆盖本机字段";
  }

  function summarizeFieldSelectionImpact(selections) {
    const counts = selections.reduce((result, field) => {
      result[field.action] = (result[field.action] || 0) + 1;
      return result;
    }, {});
    const parts = [];
    if (counts.update) parts.push(`${counts.update} 个覆盖本机字段`);
    if (counts.add) parts.push(`${counts.add} 个新增字段`);
    if (counts.remove) parts.push(`${counts.remove} 个删除字段`);
    return parts.length ? `恢复影响：${parts.join(" / ")}` : "";
  }

  function summarizeJsonValue(value) {
    if (Array.isArray(value)) {
      return `数组 ${value.length} 项`;
    }
    if (value && typeof value === "object") {
      const keys = Object.keys(value).sort();
      return keys.length ? `对象 ${keys.length} 键：${keys.slice(0, 3).join("、")}${keys.length > 3 ? "…" : ""}` : "空对象";
    }
    if (typeof value === "string") {
      return `文本：${value.length > 28 ? `${value.slice(0, 28)}…` : value}`;
    }
    if (typeof value === "number") {
      return `数字：${value}`;
    }
    if (typeof value === "boolean") {
      return value ? "布尔：true" : "布尔：false";
    }
    if (value == null) {
      return "空";
    }
    return String(value);
  }

  function createJsonPreview(value, missingLabel, maxLength = 720) {
    if (typeof value === "undefined") {
      return missingLabel;
    }
    const text = JSON.stringify(value, null, 2);
    if (typeof text !== "string") {
      return missingLabel;
    }
    return maxLength > 0 && text.length > maxLength ? `${text.slice(0, maxLength)}\n...` : text;
  }

  function parseJsonForDiff(value) {
    if (typeof value !== "string" || !value.trim()) {
      return { ok: true, value: null };
    }
    try {
      return { ok: true, value: JSON.parse(value) };
    } catch (error) {
      return { ok: false, value: null };
    }
  }

  function flattenDiffFields(value, path = "root", result = new Map(), depth = 0) {
    if (depth >= 4 || !value || typeof value !== "object") {
      result.set(path, { path, signature: stableStringify(value), value });
      return result;
    }

    if (Array.isArray(value)) {
      result.set(`${path}.length`, { path: `${path}.length`, signature: stableStringify(value.length), value: value.length });
      value.slice(0, 8).forEach((item, index) => flattenDiffFields(item, `${path}[${index}]`, result, depth + 1));
      if (value.length > 8) {
        result.set(`${path}[...]`, { path: `${path}[...]`, signature: stableStringify(value.length), value: value.length });
      }
      return result;
    }

    const keys = Object.keys(value).sort();
    if (!keys.length) {
      result.set(path, { path, signature: "{}", value });
      return result;
    }

    keys.forEach((key) => {
      flattenDiffFields(value[key], path === "root" ? key : `${path}.${key}`, result, depth + 1);
    });
    return result;
  }

  function formatFieldDiffItems(action, fields) {
    return fields.map((field) => `${action}：${field.path}`);
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

  function sha256StableJson(value) {
    return sha256Hex(stableStringify(value));
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

  async function createStableJsonSha256(value) {
    if (typeof TextEncoder !== "function") {
      throw new Error("当前浏览器不支持 TextEncoder，无法生成项目仓库摘要。");
    }
    return createArrayBufferSha256(new TextEncoder().encode(stableStringify(value)));
  }

  async function compareDbItem(item, pack) {
    const records = Array.isArray(pack?.records) ? pack.records : [];
    const currentRecords = await readDbStoreRecords(item);
    const migratedMissing = pack?.migratedMissing === true;
    const hashSummary = await summarizeDbPackHashes(records, item.label);
    const modelDiff = createDbModelDiff(item, currentRecords, records);

    return {
      id: item.id,
      label: item.label,
      currentCount: currentRecords.length,
      incomingCount: records.length,
      incomingBinaryCount: hashSummary.binaryCount,
      incomingHashCount: hashSummary.hashCount,
      missingHashCount: hashSummary.missingHashCount,
      modelDiffSummary: modelDiff.summary,
      modelDiffs: modelDiff.items,
      modelSelections: modelDiff.selections,
      change: modelDiff.total ? "replace" : "same-count",
      defaultSelected: !migratedMissing,
      migrationNote: migratedMissing ? `旧档案不包含“${item.label}”，默认保留当前本机模型库。` : ""
    };
  }

  function createDbModelDiff(item, currentRecords, incomingRecords) {
    const currentMap = mapDbModelRecords(item, currentRecords, false);
    const incomingMap = mapDbModelRecords(item, incomingRecords, true);
    const added = [];
    const updated = [];
    const removed = [];

    incomingMap.forEach((incomingRecord, key) => {
      const currentRecord = currentMap.get(key);
      if (!currentRecord) {
        added.push(incomingRecord);
        return;
      }
      if (incomingRecord.signature !== currentRecord.signature) {
        updated.push(incomingRecord);
      }
    });

    currentMap.forEach((currentRecord, key) => {
      if (!incomingMap.has(key)) {
        removed.push(currentRecord);
      }
    });

    const total = added.length + updated.length + removed.length;
    return {
      total,
      summary: formatDbAssetDiffSummary(added, updated, removed),
      items: [
        ...formatDbModelDiffItems("新增模型", added),
        ...formatDbModelDiffItems("修改模型", updated),
        ...formatDbModelDiffItems("删除模型", removed)
      ].slice(0, 6),
      selections: [
        ...createDbModelSelections("add", added, currentMap, incomingMap),
        ...createDbModelSelections("update", updated, currentMap, incomingMap),
        ...createDbModelSelections("remove", removed, currentMap, incomingMap)
      ]
    };
  }

  function formatDbAssetDiffSummary(added, updated, removed) {
    const total = added.length + updated.length + removed.length;
    if (!total) {
      return "模型无变化";
    }
    const parts = [
      ...formatDbAssetDiffCount("新增", added),
      ...formatDbAssetDiffCount("修改", updated),
      ...formatDbAssetDiffCount("删除", removed)
    ];
    return parts.join(" / ");
  }

  function formatDbAssetDiffCount(action, records) {
    const modelCount = records.filter((record) => record.assetKind !== "texture").length;
    const textureCount = records.filter((record) => record.assetKind === "texture").length;
    return [
      modelCount ? `${modelCount} ${action}模型` : "",
      textureCount ? `${textureCount} ${action}贴图` : ""
    ].filter(Boolean);
  }

  function mapDbModelRecords(item, records, isArchiveRecord) {
    return records.reduce((result, record, index) => {
      const model = normalizeDbModelRecord(item, record, index, isArchiveRecord);
      result.set(model.key, model);
      return result;
    }, new Map());
  }

  function normalizeDbModelRecord(item, record, index, isArchiveRecord) {
    const data = isArchiveRecord && record?.data && typeof record.data === "object"
      ? record.data
      : record || {};
    const key = String(
      data[item.keyPath] ||
      data.key ||
      data.dbKey ||
      data.id ||
      data.fileName ||
      data.label ||
      `model-${index + 1}`
    ).trim();
    const label = String(data.label || data.fileName || key || `模型 ${index + 1}`).trim();
    const bytes = Number(record?.bytes || data.metrics?.fileBytes || data.fileBytes || record?.arrayBuffer?.byteLength || data.arrayBuffer?.byteLength || 0);
    const assetKind = getDbImportAssetKind(data, key);
    const texture = normalizeDbModelTextureRef(data.texture);
    const model = {
      key: key || `model-${index + 1}`,
      assetKind,
      label: label || `模型 ${index + 1}`,
      fileName: String(data.fileName || "").trim(),
      type: String(data.type || "").trim(),
      bytes: Number.isFinite(bytes) ? bytes : 0,
      sha256: normalizeSha256(record?.sha256 || data.sha256),
      metrics: normalizeModelMetricsForDiff(data.metrics),
      texture
    };
    model.signature = stableStringify({
      assetKind: model.assetKind,
      label: model.label,
      fileName: model.fileName,
      type: model.type,
      bytes: model.bytes,
      sha256: model.sha256,
      metrics: model.metrics,
      texture: model.texture
    });
    model.fullPreview = createDbModelRecordFullPreview(record);
    return model;
  }

  function getDbImportAssetKind(data, key = "") {
    const type = String(data?.type || data?.mimeType || "").toLowerCase();
    const fileName = String(data?.fileName || "").toLowerCase();
    const assetKey = String(key || data?.dbKey || data?.id || "").toLowerCase();
    if (["png", "jpg", "jpeg", "webp"].includes(type) ||
        ["image/png", "image/jpeg", "image/webp"].includes(type) ||
        /\.(png|jpe?g|webp)$/.test(fileName) ||
        assetKey.includes(":texture-")) {
      return "texture";
    }
    return "model";
  }

  function normalizeDbModelTextureRef(texture) {
    if (!texture || typeof texture !== "object") {
      return null;
    }
    const dbKey = String(texture.dbKey || "").trim();
    const fileName = String(texture.fileName || "").trim();
    if (!dbKey || !fileName) {
      return null;
    }
    return {
      dbKey,
      fileName,
      type: String(texture.type || "").trim(),
      sha256: normalizeSha256(texture.sha256),
      fileBytes: Number(texture.fileBytes || 0) || 0
    };
  }

  function normalizeModelMetricsForDiff(metrics) {
    if (!metrics || typeof metrics !== "object") {
      return {};
    }
    return {
      fileBytes: Number(metrics.fileBytes || 0),
      meshCount: Number(metrics.meshCount || 0),
      vertexCount: Number(metrics.vertexCount || 0),
      dimensions: metrics.dimensions && typeof metrics.dimensions === "object"
        ? {
            width: Number(metrics.dimensions.width || 0),
            height: Number(metrics.dimensions.height || 0),
            depth: Number(metrics.dimensions.depth || 0)
          }
        : {}
    };
  }

  function formatDbModelDiffItems(action, models) {
    return models.map((model) => {
      const actionLabel = model.assetKind === "texture" ? action.replace("模型", "贴图") : action;
      const details = [
        model.fileName || "",
        model.type ? model.type.toUpperCase() : "",
        model.bytes ? formatBytes(model.bytes) : "",
        model.sha256 ? "SHA-256" : "",
        model.texture ? `贴图 ${model.texture.fileName}` : ""
      ].filter(Boolean).join(" · ");
      return `${actionLabel}：${model.label}${details ? `（${details}）` : ""}`;
    });
  }

  function createDbModelSelections(action, models, currentMap, incomingMap) {
    return models.map((model) => {
      const currentModel = action === "add" ? null : currentMap.get(model.key);
      const incomingModel = action === "remove" ? null : incomingMap.get(model.key);
      const conflicts = action === "remove" || model.assetKind === "texture" ? [] : findDbModelNameConflicts(model, currentMap, new Set([model.key]));
      const conflictSummary = summarizeDbModelNameConflicts(conflicts);
      return {
        action,
        key: model.key,
        label: `${getDbModelActionLabel(action, model.assetKind)}：${model.label}`,
        detail: formatDbModelSelectionDetail(model),
        conflictSummary,
        conflictCount: conflicts.length,
        suggestedLabel: conflicts.length
          ? createConflictResolvedDbModelLabel(model.label, collectUsedDbModelLabels(currentMap, new Set(), model.key, new Map()))
          : "",
        currentPreview: createDbModelPreview(currentModel, "本机中无此模型"),
        incomingPreview: createDbModelPreview(incomingModel, "档案中无此模型"),
        currentFullPreview: createDbModelFullPreview(currentModel, "本机中无此模型"),
        incomingFullPreview: createDbModelFullPreview(incomingModel, "档案中无此模型")
      };
    });
  }

  function getDbModelActionLabel(action, assetKind = "model") {
    const noun = assetKind === "texture" ? "贴图" : "模型";
    if (action === "add") return `新增${noun}`;
    if (action === "remove") return `删除${noun}`;
    return `修改${noun}`;
  }

  function formatDbModelSelectionDetail(model) {
    return [
      model.fileName || "",
      model.type ? model.type.toUpperCase() : "",
      model.bytes ? formatBytes(model.bytes) : "",
      model.sha256 ? "SHA-256" : "",
      model.texture ? `关联贴图 ${model.texture.fileName}` : ""
    ].filter(Boolean).join(" · ") || model.key;
  }

  function createDbModelPreview(model, missingLabel) {
    if (!model) {
      return missingLabel;
    }

    const preview = {
      key: model.key,
      assetKind: model.assetKind,
      label: model.label
    };
    if (model.fileName) {
      preview.fileName = model.fileName;
    }
    if (model.type) {
      preview.type = model.type;
    }
    if (model.bytes) {
      preview.bytes = model.bytes;
      preview.size = formatBytes(model.bytes);
    }
    if (model.sha256) {
      preview.sha256 = model.sha256;
    }
    if (model.metrics && Object.keys(model.metrics).length) {
      preview.metrics = model.metrics;
    }
    if (model.texture) {
      preview.texture = model.texture;
    }
    return createJsonPreview(preview, missingLabel);
  }

  function createDbModelFullPreview(model, missingLabel) {
    return model?.fullPreview || missingLabel;
  }

  function createDbModelRecordFullPreview(record) {
    return createJsonPreview(
      sanitizeDbModelRecordForPreview(record),
      "无模型 JSON",
      MODEL_FULL_PREVIEW_MAX_LENGTH
    );
  }

  function sanitizeDbModelRecordForPreview(value, seen = new WeakSet()) {
    if (typeof value === "undefined") {
      return "[undefined]";
    }
    if (value === null || typeof value === "number" || typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      if (value.length > MODEL_PREVIEW_STRING_LIMIT) {
        return {
          kind: "string",
          characters: value.length,
          preview: `${value.slice(0, MODEL_PREVIEW_STRING_LIMIT)}...`
        };
      }
      return value;
    }
    if (typeof value === "function") {
      return `[Function ${value.name || "anonymous"}]`;
    }
    if (value instanceof ArrayBuffer) {
      return {
        kind: "ArrayBuffer",
        bytes: value.byteLength
      };
    }
    if (ArrayBuffer.isView(value)) {
      const view = value;
      const sampleSource = view instanceof DataView
        ? new Uint8Array(view.buffer, view.byteOffset, Math.min(view.byteLength, MODEL_PREVIEW_ARRAY_SAMPLE_LIMIT))
        : Array.prototype.slice.call(view, 0, MODEL_PREVIEW_ARRAY_SAMPLE_LIMIT);
      return {
        kind: view.constructor?.name || "TypedArray",
        length: typeof view.length === "number" ? view.length : view.byteLength,
        bytes: view.byteLength,
        sample: Array.from(sampleSource)
      };
    }
    if (typeof Blob !== "undefined" && value instanceof Blob) {
      return {
        kind: "Blob",
        type: value.type || "",
        bytes: value.size
      };
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value !== "object") {
      return String(value);
    }
    if (seen.has(value)) {
      return "[Circular]";
    }
    seen.add(value);
    if (Array.isArray(value)) {
      if (value.length > MODEL_PREVIEW_ARRAY_SAMPLE_LIMIT) {
        return {
          kind: "Array",
          length: value.length,
          sample: value.slice(0, MODEL_PREVIEW_ARRAY_SAMPLE_LIMIT).map((item) => sanitizeDbModelRecordForPreview(item, seen))
        };
      }
      return value.map((item) => sanitizeDbModelRecordForPreview(item, seen));
    }
    return Object.keys(value).reduce((result, key) => {
      const fieldValue = value[key];
      if (key === "arrayBufferBase64" && typeof fieldValue === "string") {
        result[key] = fieldValue
          ? {
              kind: "base64",
              characters: fieldValue.length,
              estimatedBytes: Math.floor((fieldValue.length * 3) / 4),
              omitted: true
            }
          : null;
        return result;
      }
      result[key] = sanitizeDbModelRecordForPreview(fieldValue, seen);
      return result;
    }, {});
  }

  function findDbModelNameConflicts(model, currentMap, ignoredKeys = new Set()) {
    const labelToken = normalizeDbModelCompareToken(model.label);
    const fileToken = normalizeDbModelCompareToken(model.fileName);
    const conflicts = [];
    currentMap.forEach((currentModel) => {
      if (ignoredKeys.has(currentModel.key)) {
        return;
      }
      const reasons = [];
      if (labelToken && labelToken === normalizeDbModelCompareToken(currentModel.label)) {
        reasons.push("名称");
      }
      if (fileToken && fileToken === normalizeDbModelCompareToken(currentModel.fileName)) {
        reasons.push("文件名");
      }
      if (reasons.length) {
        conflicts.push({
          key: currentModel.key,
          label: currentModel.label,
          fileName: currentModel.fileName,
          reasons
        });
      }
    });
    return conflicts;
  }

  function summarizeDbModelNameConflicts(conflicts) {
    if (!conflicts.length) {
      return "";
    }
    const first = conflicts[0];
    const reasonText = [...new Set(first.reasons)].join("和");
    const extra = conflicts.length > 1 ? `等 ${conflicts.length} 个模型` : "";
    return `命名冲突：与本机“${first.label || first.fileName || first.key}”${extra}${reasonText}相同，可选择改名、替换或自定义名称。`;
  }

  function normalizeDbModelCompareToken(value) {
    return String(value || "").trim().toLowerCase();
  }

  async function readDbStoreRecords(item) {
    const db = await openDb(item);
    const records = await readAllRecords(db, item.storeName);
    db.close();
    return records;
  }

  function getStorageChange(currentValue, incomingValue) {
    if (incomingValue === null && currentValue == null) return "empty";
    if (incomingValue === null) return "remove";
    if (currentValue == null) return "add";
    if (currentValue === incomingValue) return "same";
    return "update";
  }

  function summarizeImportPreview(storage, indexedDb) {
    const storageSummary = storage.reduce((result, item) => {
      result[item.change] = (result[item.change] || 0) + 1;
      return result;
    }, {});
    const dbReplaceCount = indexedDb.filter((item) => item.change === "replace").length;
    const incomingModelCount = indexedDb.reduce((sum, item) => sum + item.incomingCount, 0);
    const assetHashCount = indexedDb.reduce((sum, item) => sum + (item.incomingHashCount || 0), 0);
    const missingAssetHashCount = indexedDb.reduce((sum, item) => sum + (item.missingHashCount || 0), 0);

    return {
      storageAdded: storageSummary.add || 0,
      storageUpdated: storageSummary.update || 0,
      storageRemoved: storageSummary.remove || 0,
      storageSame: storageSummary.same || 0,
      storageEmpty: storageSummary.empty || 0,
      dbReplaceCount,
      incomingModelCount,
      assetHashCount,
      missingAssetHashCount
    };
  }

  function createArchivePreviewRiskSummary(preview = {}) {
    const summary = preview.summary || {};
    const schema = preview.schemaSummary || {};
    const reasons = [];
    let score = 0;

    if (summary.storageRemoved) {
      score += 3;
      reasons.push(`将清空 ${summary.storageRemoved} 组本机配置`);
    }
    if (summary.storageUpdated) {
      score += 2;
      reasons.push(`将覆盖 ${summary.storageUpdated} 组本机配置`);
    }
    if (summary.storageAdded) {
      score += 1;
      reasons.push(`将新增 ${summary.storageAdded} 组本机配置`);
    }
    if (summary.dbReplaceCount) {
      score += 2;
      reasons.push(`将替换 ${summary.dbReplaceCount} 个 IndexedDB 模型库`);
    }
    if (summary.missingAssetHashCount) {
      score += 3;
      reasons.push(`${summary.missingAssetHashCount} 个导入资产缺少 SHA-256`);
    }
    if (schema.missingModelBinaries || schema.missingTextureBinaries || schema.unknownModelBinaries) {
      score += 3;
      const missing = Number(schema.missingModelBinaries || 0) + Number(schema.missingTextureBinaries || 0);
      const unknown = Number(schema.unknownModelBinaries || 0);
      reasons.push(`资产完整性风险：缺文件 ${missing} 个，待校验 ${unknown} 个`);
    }
    if (schema.repositoryStatus && schema.repositoryStatus !== "ready") {
      score += 2;
      reasons.push(`远端档案仓库状态为 ${schema.repositoryStatus}`);
    }

    const level = score >= 6 ? "high" : score >= 3 ? "medium" : "low";
    const labels = {
      high: "高风险",
      medium: "中风险",
      low: "低风险"
    };
    return {
      level,
      label: labels[level],
      score,
      reasons,
      text: reasons.length
        ? reasons.join("；")
        : "未发现覆盖、清空或资产完整性风险。"
    };
  }

  function exportLocalStorage() {
    return STORAGE_ITEMS.reduce((result, item) => {
      const value = window.localStorage.getItem(item.key);
      result[item.key] = {
        label: item.label,
        value,
        bytes: value ? new Blob([value]).size : 0
      };
      return result;
    }, {});
  }

  function normalizeRestoreOptions(options, archive = null) {
    const allStorageKeys = STORAGE_ITEMS.map((item) => item.key);
    const allDbIds = DB_ITEMS.map((item) => item.id);
    const storageKeys = Array.isArray(options?.storageKeys)
      ? options.storageKeys.filter((key) => allStorageKeys.includes(key))
      : allStorageKeys.filter((key) => archive?.storage?.[key]?.defaultSelected !== false);
    const dbIds = Array.isArray(options?.dbIds)
      ? options.dbIds.filter((id) => allDbIds.includes(id))
      : allDbIds.filter((id) => archive?.indexedDb?.[id]?.defaultSelected !== false);
    const normalizedStorageKeys = [...new Set(storageKeys)];
    const normalizedDbIds = [...new Set(dbIds)];
    return {
      storageKeys: normalizedStorageKeys,
      dbIds: normalizedDbIds,
      storageFields: normalizeSelectedStorageFields(options?.storageFields, normalizedStorageKeys),
      dbRecords: normalizeSelectedDbRecords(options?.dbRecords, normalizedDbIds)
    };
  }

  function normalizeSelectedDbRecords(dbRecords, dbIds) {
    if (!dbRecords || typeof dbRecords !== "object") {
      return {};
    }

    const selected = new Set(dbIds);
    return Object.keys(dbRecords).reduce((result, id) => {
      if (!selected.has(id) || !Array.isArray(dbRecords[id])) {
        return result;
      }
      const seen = new Set();
      const records = dbRecords[id].filter((record) => {
        const action = record?.action;
        const key = String(record?.key || "").trim();
        const token = `${action}:${key}`;
        if (!["add", "update", "remove"].includes(action) || !key || seen.has(token)) {
          return false;
        }
        seen.add(token);
        return true;
      }).map((record) => ({
        action: record.action,
        key: String(record.key).trim(),
        conflictMode: normalizeDbModelConflictMode(record.conflictMode),
        customLabel: normalizeDbModelCustomLabel(record.customLabel)
      }));
      if (records.length) {
        result[id] = records;
      }
      return result;
    }, {});
  }

  function normalizeDbModelConflictMode(value) {
    if (value === "replace" || value === "custom") {
      return value;
    }
    return "rename";
  }

  function normalizeDbModelCustomLabel(value) {
    return String(value || "").trim().slice(0, 80);
  }

  function normalizeSelectedStorageFields(storageFields, storageKeys) {
    if (!storageFields || typeof storageFields !== "object") {
      return {};
    }

    const selected = new Set(storageKeys);
    return Object.keys(storageFields).reduce((result, key) => {
      if (!selected.has(key) || !Array.isArray(storageFields[key])) {
        return result;
      }
      const seen = new Set();
      const fields = storageFields[key].filter((field) => {
        const action = field?.action;
        const path = field?.path;
        const token = `${action}:${path}`;
        if (!["add", "update", "remove"].includes(action) || typeof path !== "string" || !path || seen.has(token)) {
          return false;
        }
        seen.add(token);
        return true;
      }).map((field) => ({
        action: field.action,
        path: field.path
      }));
      if (fields.length) {
        result[key] = fields;
      }
      return result;
    }, {});
  }

  function createProjectSchema(archive) {
    if (window.MRProjectSchema?.createProjectSchema) {
      return window.MRProjectSchema.createProjectSchema(archive);
    }
    return {
      kind: "mr-calligraphy-project-schema",
      version: 1,
      createdAt: archive.exportedAt || new Date().toISOString(),
      source: archive.source || "",
      sections: {},
      assetManifest: { importedModelCount: 0, missingBinaryCount: 0, assets: [] },
      summary: {},
      migrations: Array.isArray(archive.migrations) ? archive.migrations : []
    };
  }

  function getArchiveProjectSchema(archive) {
    return archive.projectSchema || createProjectSchema(archive);
  }

  function summarizeProjectSchema(schema) {
    const summary = schema?.summary || {};
    return {
      version: Number(schema?.version) || 0,
      learningRecords: Number(summary.learningRecords) || 0,
      mainDraftObjects: Number(summary.mainDraftObjects) || 0,
      mainSnapshots: Number(summary.mainSnapshots) || 0,
      mainReleases: Number(summary.mainReleases) || 0,
      realisticObjects: Number(summary.realisticObjects) || 0,
      realisticSnapshots: Number(summary.realisticSnapshots) || 0,
      realisticReleases: Number(summary.realisticReleases) || 0,
      importedModels: Number(summary.importedModels) || 0,
      textureAssets: Number(summary.textureAssets) || Number(schema?.assetManifest?.textureAssetCount) || 0,
      missingModelBinaries: Number(summary.missingModelBinaries) || 0,
      missingTextureBinaries: Number(summary.missingTextureBinaries) || Number(schema?.assetManifest?.missingTextureBinaryCount) || 0,
      unknownModelBinaries: Number(summary.unknownModelBinaries) || 0,
      missingModelHashes: Number(summary.missingModelHashes) || 0,
      repositoryStatus: String(summary.repositoryStatus || schema?.repository?.status || ""),
      repositoryReadyScenes: Number(summary.repositoryReadyScenes || schema?.repository?.summary?.readySceneCount) || 0,
      migrationCount: Array.isArray(schema?.migrations) ? schema.migrations.length : 0
    };
  }

  function importLocalStorage(storage, selectedKeys = STORAGE_ITEMS.map((item) => item.key), selectedFields = {}) {
    const selected = new Set(selectedKeys);
    STORAGE_ITEMS.forEach((item) => {
      if (!selected.has(item.key)) {
        return;
      }
      const record = storage[item.key];
      const fieldSelections = selectedFields[item.key];
      if (Array.isArray(fieldSelections) && fieldSelections.length) {
        const merged = mergeStorageJsonFields(item, record?.value ?? null, fieldSelections);
        if (merged.remove) {
          window.localStorage.removeItem(item.key);
        } else {
          window.localStorage.setItem(item.key, merged.value);
        }
        return;
      }
      if (!record || record.value == null) {
        window.localStorage.removeItem(item.key);
        return;
      }
      if (typeof record.value !== "string") {
        throw new Error(`项目档案中的 ${item.label} 数据格式不正确。`);
      }
      window.localStorage.setItem(item.key, record.value);
    });
  }

  function mergeStorageJsonFields(item, incomingValue, fieldSelections) {
    const current = parseJsonForDiff(window.localStorage.getItem(item.key));
    const incoming = parseJsonForDiff(incomingValue);
    if (!current.ok || !incoming.ok) {
      throw new Error(`${item.label} 不是可合并的 JSON 数据，请改用整项恢复。`);
    }

    let result = cloneJsonValue(current.value);
    if (result == null || typeof result !== "object") {
      result = Array.isArray(incoming.value) ? [] : {};
    }

    fieldSelections.forEach((field) => {
      if (field.path === "root") {
        result = field.action === "remove" ? null : cloneJsonValue(incoming.value);
        return;
      }

      const tokens = parseDiffPath(field.path);
      if (!tokens.length) {
        return;
      }
      if (field.action === "remove") {
        deleteJsonPath(result, tokens);
        return;
      }

      const incomingField = readJsonPath(incoming.value, tokens);
      if (incomingField.exists) {
        result = ensureMergeRoot(result, tokens);
        setJsonPath(result, tokens, cloneJsonValue(incomingField.value));
      }
    });

    return result == null
      ? { remove: true, value: "" }
      : { remove: false, value: JSON.stringify(result) };
  }

  function cloneJsonValue(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function ensureMergeRoot(value, tokens) {
    if (value && typeof value === "object") {
      return value;
    }
    return typeof tokens[0] === "number" || tokens[0] === "length" ? [] : {};
  }

  function parseDiffPath(path) {
    if (path === "root") {
      return [];
    }
    const tokens = [];
    path.split(".").forEach((segment) => {
      const name = segment.match(/^[^\[]+/)?.[0] || "";
      if (name) {
        tokens.push(name);
      }
      const indexMatches = segment.matchAll(/\[(\d+|\.\.\.)\]/g);
      for (const match of indexMatches) {
        if (match[1] !== "...") {
          tokens.push(Number(match[1]));
        }
      }
    });
    return tokens;
  }

  function readJsonPath(value, tokens) {
    let cursor = value;
    for (const token of tokens) {
      if (cursor == null || typeof cursor !== "object" || !(token in cursor)) {
        return { exists: false, value: undefined };
      }
      cursor = cursor[token];
    }
    return { exists: true, value: cursor };
  }

  function setJsonPath(target, tokens, value) {
    let cursor = target;
    tokens.forEach((token, index) => {
      const isLast = index === tokens.length - 1;
      if (isLast) {
        cursor[token] = value;
        return;
      }
      const nextToken = tokens[index + 1];
      if (cursor[token] == null || typeof cursor[token] !== "object") {
        cursor[token] = typeof nextToken === "number" || nextToken === "length" ? [] : {};
      }
      cursor = cursor[token];
    });
  }

  function deleteJsonPath(target, tokens) {
    if (!target || typeof target !== "object" || !tokens.length) {
      return;
    }
    let cursor = target;
    for (let index = 0; index < tokens.length - 1; index += 1) {
      const token = tokens[index];
      if (cursor == null || typeof cursor !== "object" || !(token in cursor)) {
        return;
      }
      cursor = cursor[token];
    }
    const lastToken = tokens[tokens.length - 1];
    if (lastToken === "length" && tokens.length > 1) {
      deleteJsonPath(target, tokens.slice(0, -1));
      return;
    }
    if (Array.isArray(cursor) && typeof lastToken === "number") {
      cursor.splice(lastToken, 1);
      return;
    }
    delete cursor[lastToken];
  }

  async function exportDbStore(item) {
    const db = await openDb(item);
    const records = await readAllRecords(db, item.storeName);
    db.close();
    return {
      label: item.label,
      dbName: item.dbName,
      storeName: item.storeName,
      keyPath: item.keyPath,
      records: await Promise.all(records.map(serializeDbRecord))
    };
  }

  async function importDbStore(item, pack, selectedModels = null) {
    const db = await openDb(item);
    const records = Array.isArray(pack?.records) ? pack.records : [];
    if (Array.isArray(selectedModels) && selectedModels.length) {
      await importSelectedDbModels(item, db, records, selectedModels);
      db.close();
      return;
    }
    const restoredRecords = await Promise.all(records.map((record) => deserializeDbRecord(record, item.label)));

    await new Promise((resolve, reject) => {
      const transaction = db.transaction(item.storeName, "readwrite");
      const store = transaction.objectStore(item.storeName);
      store.clear();
      restoredRecords.forEach((record) => {
        store.put(record);
      });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error(`无法恢复 ${item.label}。`));
    });
    db.close();
  }

  async function importSelectedDbModels(item, db, archiveRecords, selectedModels) {
    const archiveRecordMap = mapArchiveDbRecords(item, archiveRecords);
    const currentModelMap = mapDbModelRecords(item, await readAllRecords(db, item.storeName), false);
    const dependencyKeys = expandSelectedDbRecordKeys(item, archiveRecords, selectedModels);
    const explicitSelectionKeys = new Set(selectedModels
      .filter((selection) => selection.action !== "remove")
      .map((selection) => String(selection.key || "").trim())
      .filter(Boolean));
    const explicitRemoveKeys = new Set(selectedModels
      .filter((selection) => selection.action === "remove")
      .map((selection) => String(selection.key || "").trim())
      .filter((key) => key && !dependencyKeys.has(key)));
    const replacementRemoveKeys = new Set();
    const restoredEntries = [];
    const restoredRecords = new Map();

    for (const selection of selectedModels) {
      if (selection.action === "remove") {
        continue;
      }
      const archiveRecord = archiveRecordMap.get(selection.key);
      if (!archiveRecord) {
        throw new Error(`${item.label} 中缺少要恢复的模型：${selection.key}。`);
      }
      const restoredRecord = await deserializeDbRecord(archiveRecord, item.label);
      if (selection.conflictMode === "custom" && selection.customLabel) {
        restoredRecord.label = selection.customLabel;
      }
      const restoredModel = normalizeDbModelRecord(item, restoredRecord, 0, false);
      if (selection.conflictMode === "replace") {
        findDbModelNameConflicts(restoredModel, currentModelMap, new Set([restoredModel.key])).forEach((conflict) => {
          replacementRemoveKeys.add(conflict.key);
        });
      }
      restoredEntries.push({ selection, record: restoredRecord });
    }

    for (const dependencyKey of dependencyKeys) {
      if (explicitSelectionKeys.has(dependencyKey)) {
        continue;
      }
      const archiveRecord = archiveRecordMap.get(dependencyKey);
      if (!archiveRecord) {
        continue;
      }
      restoredEntries.push({
        selection: { action: "dependency", key: dependencyKey },
        record: await deserializeDbRecord(archiveRecord, item.label),
        dependency: true
      });
    }

    const selectedRemoveKeys = new Set([...explicitRemoveKeys, ...replacementRemoveKeys]);
    restoredEntries.forEach(({ selection, record, dependency }) => {
      if (!dependency && getDbImportAssetKind(record, selection.key) !== "texture") {
        resolveDbModelRestoreConflict(item, record, currentModelMap, selectedRemoveKeys, restoredRecords);
      }
      restoredRecords.set(selection.key, record);
    });

    await new Promise((resolve, reject) => {
      const transaction = db.transaction(item.storeName, "readwrite");
      const store = transaction.objectStore(item.storeName);
      replacementRemoveKeys.forEach((key) => {
        store.delete(key);
      });
      selectedModels.forEach((selection) => {
        if (selection.action === "remove") {
          if (!dependencyKeys.has(selection.key)) {
            store.delete(selection.key);
          }
          return;
        }
      });
      restoredRecords.forEach((record) => {
        store.put(record);
      });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error(`无法恢复 ${item.label}。`));
    });
  }

  function mapArchiveDbRecords(item, records) {
    return records.reduce((result, record, index) => {
      const model = normalizeDbModelRecord(item, record, index, true);
      result.set(model.key, record);
      return result;
    }, new Map());
  }

  function filterArchiveDbRecordsBySelection(item, records, selectedModels) {
    if (!Array.isArray(selectedModels) || !selectedModels.length) {
      return records;
    }

    const selectedKeys = expandSelectedDbRecordKeys(item, records, selectedModels);
    if (!selectedKeys.size) {
      return [];
    }
    return records.filter((record, index) => {
      const model = normalizeDbModelRecord(item, record, index, true);
      return selectedKeys.has(model.key);
    });
  }

  function expandSelectedDbRecordKeys(item, records, selectedModels) {
    const selectedKeys = new Set(selectedModels
      .filter((selection) => selection.action !== "remove")
      .map((selection) => String(selection.key || "").trim())
      .filter(Boolean));
    if (!selectedKeys.size) {
      return selectedKeys;
    }

    const archiveRecordMap = mapArchiveDbRecords(item, records);
    let changed = true;
    while (changed) {
      changed = false;
      Array.from(selectedKeys).forEach((key) => {
        const textureKey = getDbRecordTextureDependencyKey(archiveRecordMap.get(key));
        if (textureKey && archiveRecordMap.has(textureKey) && !selectedKeys.has(textureKey)) {
          selectedKeys.add(textureKey);
          changed = true;
        }
      });
    }
    return selectedKeys;
  }

  function getDbRecordTextureDependencyKey(record) {
    const data = record?.data && typeof record.data === "object" ? record.data : record || {};
    return String(data.texture?.dbKey || "").trim();
  }

  function resolveDbModelRestoreConflict(item, record, currentModelMap, selectedRemoveKeys, pendingRecords) {
    const model = normalizeDbModelRecord(item, record, 0, false);
    const ignoredKeys = new Set([...selectedRemoveKeys, model.key]);
    const conflicts = [
      ...findDbModelNameConflicts(model, currentModelMap, ignoredKeys),
      ...findPendingDbModelNameConflicts(model, pendingRecords)
    ];
    if (!conflicts.length) {
      return record;
    }

    const usedLabels = collectUsedDbModelLabels(currentModelMap, selectedRemoveKeys, model.key, pendingRecords);
    const originalLabel = String(record.label || model.label || record.fileName || model.key || "导入模型").trim();
    record.label = createConflictResolvedDbModelLabel(originalLabel, usedLabels);
    return record;
  }

  function findPendingDbModelNameConflicts(model, pendingRecords) {
    const pendingMap = mapDbModelRecords({ keyPath: "key" }, Array.from(pendingRecords.values()), false);
    return findDbModelNameConflicts(model, pendingMap, new Set([model.key]));
  }

  function collectUsedDbModelLabels(currentModelMap, selectedRemoveKeys, currentKey, pendingRecords) {
    const labels = new Set();
    currentModelMap.forEach((model) => {
      if (selectedRemoveKeys.has(model.key) || model.key === currentKey) {
        return;
      }
      const token = normalizeDbModelCompareToken(model.label);
      if (token) {
        labels.add(token);
      }
    });
    pendingRecords.forEach((record) => {
      const token = normalizeDbModelCompareToken(record.label);
      if (token) {
        labels.add(token);
      }
    });
    return labels;
  }

  function createConflictResolvedDbModelLabel(label, usedLabels) {
    const base = String(label || "导入模型").trim() || "导入模型";
    for (let index = 1; index < 1000; index += 1) {
      const suffix = index === 1 ? "（档案）" : `（档案 ${index}）`;
      const candidate = `${base.slice(0, Math.max(1, 60 - suffix.length))}${suffix}`;
      if (!usedLabels.has(normalizeDbModelCompareToken(candidate))) {
        return candidate;
      }
    }
    return `${base.slice(0, 48)}（档案）`;
  }

  function openDb(item) {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("当前浏览器不支持 IndexedDB，无法处理导入模型。"));
        return;
      }

      const request = window.indexedDB.open(item.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(item.storeName)) {
          db.createObjectStore(item.storeName, { keyPath: item.keyPath });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(item.storeName)) {
          db.close();
          reject(new Error(`${item.label} 数据库缺少 ${item.storeName}。`));
          return;
        }
        resolve(db);
      };
      request.onerror = () => reject(request.error || new Error(`无法打开 ${item.label} 数据库。`));
    });
  }

  function readAllRecords(db, storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const request = transaction.objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || new Error("无法读取 IndexedDB 记录。"));
    });
  }

  async function serializeDbRecord(record) {
    const copy = { ...record };
    const arrayBuffer = normalizeArrayBuffer(copy.arrayBuffer);
    delete copy.arrayBuffer;
    const sha256 = arrayBuffer ? await createArrayBufferSha256(arrayBuffer) : "";
    if (sha256) {
      copy.sha256 = sha256;
    }
    return {
      data: copy,
      arrayBufferBase64: arrayBuffer ? await arrayBufferToBase64(arrayBuffer) : null,
      bytes: arrayBuffer ? arrayBuffer.byteLength : 0,
      sha256: sha256 || null
    };
  }

  async function deserializeDbRecord(record, label = "导入模型") {
    const data = record && typeof record.data === "object" ? { ...record.data } : {};
    if (record?.arrayBufferBase64) {
      const arrayBuffer = base64ToArrayBuffer(record.arrayBufferBase64);
      const expectedHash = normalizeSha256(record.sha256 || data.sha256);
      if (expectedHash) {
        await assertArrayBufferSha256(arrayBuffer, expectedHash, data.label || data.fileName || label);
        data.sha256 = expectedHash;
      }
      data.arrayBuffer = arrayBuffer;
    }
    return data;
  }

  async function validateArchiveAssetHashes(archive, selectedDbIds = DB_ITEMS.map((item) => item.id), selectedDbRecords = {}) {
    const migratedArchive = migrateProjectArchive(archive);
    const selected = new Set(Array.isArray(selectedDbIds) ? selectedDbIds : []);
    const summaries = [];

    for (const item of DB_ITEMS) {
      if (!selected.has(item.id)) {
        continue;
      }
      const records = Array.isArray(migratedArchive.indexedDb?.[item.id]?.records)
        ? migratedArchive.indexedDb[item.id].records
        : [];
      const selectedRecords = filterArchiveDbRecordsBySelection(item, records, selectedDbRecords[item.id]);
      summaries.push({
        id: item.id,
        label: item.label,
        ...await summarizeDbPackHashes(selectedRecords, item.label)
      });
    }

    return {
      ok: true,
      checkedCount: summaries.reduce((sum, item) => sum + item.hashCount, 0),
      binaryCount: summaries.reduce((sum, item) => sum + item.binaryCount, 0),
      missingHashCount: summaries.reduce((sum, item) => sum + item.missingHashCount, 0),
      summaries
    };
  }

  async function summarizeDbPackHashes(records, label) {
    const summary = {
      binaryCount: 0,
      hashCount: 0,
      missingHashCount: 0
    };

    for (const record of records) {
      if (!record?.arrayBufferBase64) {
        continue;
      }
      summary.binaryCount += 1;
      const expectedHash = normalizeSha256(record.sha256 || record.data?.sha256);
      if (!expectedHash) {
        summary.missingHashCount += 1;
        continue;
      }

      let arrayBuffer;
      try {
        arrayBuffer = base64ToArrayBuffer(record.arrayBufferBase64);
      } catch (error) {
        throw new Error(`${label} 中有导入资产文件无法解码，已阻止恢复。`);
      }
      await assertArrayBufferSha256(arrayBuffer, expectedHash, record.data?.label || record.data?.fileName || label);
      summary.hashCount += 1;
    }

    return summary;
  }

  async function assertArrayBufferSha256(arrayBuffer, expectedHash, label) {
    const actualHash = await createArrayBufferSha256(arrayBuffer);
    if (actualHash !== expectedHash) {
      throw new Error(`导入资产文件哈希校验失败：${label}。`);
    }
  }

  async function createArrayBufferSha256(value) {
    const arrayBuffer = normalizeArrayBuffer(value);
    if (!arrayBuffer || !arrayBuffer.byteLength) {
      return "";
    }

    const cryptoApi = window.crypto || globalThis.crypto;
    if (!cryptoApi?.subtle?.digest) {
      const nodeDigest = createNodeSha256(arrayBuffer);
      if (nodeDigest) {
        return nodeDigest;
      }
      throw new Error("当前浏览器不支持 SHA-256 哈希校验，无法安全处理项目档案导入资产文件。");
    }

    const digest = await cryptoApi.subtle.digest("SHA-256", arrayBuffer);
    return arrayBufferToHex(digest);
  }

  function createNodeSha256(arrayBuffer) {
    try {
      if (typeof require !== "function" || typeof Buffer === "undefined") {
        return "";
      }
      const nodeCrypto = require("node:crypto");
      return nodeCrypto.createHash("sha256").update(Buffer.from(arrayBuffer)).digest("hex");
    } catch (error) {
      return "";
    }
  }

  function normalizeArrayBuffer(value) {
    if (!value) {
      return null;
    }
    if (value instanceof ArrayBuffer) {
      return value;
    }
    if (ArrayBuffer.isView(value)) {
      return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
    }
    return null;
  }

  function arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
  }

  function normalizeSha256(value) {
    const hash = String(value || "").trim().toLowerCase();
    return /^[a-f0-9]{64}$/.test(hash) ? hash : "";
  }

  function normalizeIsoDate(value) {
    const time = Date.parse(value);
    return Number.isFinite(time) ? new Date(time).toISOString() : "";
  }

  function arrayBufferToBase64(buffer) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([buffer]);
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        resolve(result.split(",")[1] || "");
      };
      reader.onerror = () => reject(reader.error || new Error("模型文件编码失败。"));
      reader.readAsDataURL(blob);
    });
  }

  function base64ToArrayBuffer(base64) {
    const binary = getBase64Binary(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes.buffer;
  }

  function getBase64Binary(base64) {
    if (typeof window.atob === "function") {
      return window.atob(base64);
    }
    if (typeof Buffer !== "undefined") {
      return Buffer.from(base64, "base64").toString("binary");
    }
    throw new Error("当前环境无法解码模型文件。");
  }

  function migrateProjectArchive(archive) {
    if (!archive || archive.kind !== ARCHIVE_KIND) {
      throw new Error("这不是 MR 书法项目档案。");
    }

    const migrated = cloneArchive(archive);
    const migrations = normalizeMigrationRecords([
      ...(Array.isArray(migrated.migrations) ? migrated.migrations : []),
      ...(Array.isArray(migrated.projectSchema?.migrations) ? migrated.projectSchema.migrations : [])
    ]);

    if (migrated.version == null || migrated.version === "") {
      migrated.version = ARCHIVE_VERSION;
      migrations.push(createMigrationRecord(
        "archive-version-defaulted",
        "archive-version",
        "archive.version",
        "旧档案缺少版本号，已按当前 v1 档案结构读取。"
      ));
    }

    if (Number(migrated.version) !== ARCHIVE_VERSION) {
      throw new Error(`不支持的项目档案版本：${migrated.version}`);
    }

    if (migrated.projectSchema && window.MRProjectSchema?.validateProjectSchema) {
      window.MRProjectSchema.validateProjectSchema(migrated.projectSchema);
    }

    if (!migrated.storage || typeof migrated.storage !== "object") {
      migrated.storage = {};
      migrations.push(createMigrationRecord(
        "storage-container-created",
        "storage-container",
        "archive.storage",
        "旧档案缺少 storage 容器，已创建空容器并默认保留当前本机配置。"
      ));
    }

    if (!migrated.indexedDb || typeof migrated.indexedDb !== "object") {
      migrated.indexedDb = {};
      migrations.push(createMigrationRecord(
        "indexeddb-container-created",
        "indexeddb-container",
        "archive.indexedDb",
        "旧档案缺少 IndexedDB 容器，已创建空容器并默认保留当前本机模型库。"
      ));
    }

    STORAGE_ITEMS.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(migrated.storage, item.key)) {
        return;
      }
      migrated.storage[item.key] = {
        label: item.label,
        value: null,
        bytes: 0,
        migratedMissing: true,
        defaultSelected: false
      };
      migrations.push(createMigrationRecord(
        `storage-default:${item.key}`,
        "storage-default",
        item.key,
        `旧档案不包含“${item.label}”，导入预览默认保留当前本机内容。`
      ));
    });

    DB_ITEMS.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(migrated.indexedDb, item.id)) {
        return;
      }
      migrated.indexedDb[item.id] = {
        label: item.label,
        dbName: item.dbName,
        storeName: item.storeName,
        keyPath: item.keyPath,
        records: [],
        migratedMissing: true,
        defaultSelected: false
      };
      migrations.push(createMigrationRecord(
        `indexeddb-default:${item.id}`,
        "indexeddb-default",
        item.id,
        `旧档案不包含“${item.label}”，导入预览默认保留当前本机模型库。`
      ));
    });

    if (!migrated.projectSchema) {
      migrations.push(createMigrationRecord(
        "project-schema-synthesized",
        "project-schema",
        "archive.projectSchema",
        "旧档案缺少统一 projectSchema，已按当前项目结构重新生成摘要。"
      ));
    }

    migrated.migrations = dedupeMigrationRecords(migrations);
    migrated.projectSchema = createProjectSchema(migrated);
    validateArchive(migrated);
    return migrated;
  }

  function cloneArchive(archive) {
    try {
      return JSON.parse(JSON.stringify(archive));
    } catch (error) {
      throw new Error("项目档案包含无法迁移的数据。");
    }
  }

  function createMigrationRecord(id, type, target, message) {
    return {
      id,
      type,
      target,
      message,
      createdAt: new Date().toISOString()
    };
  }

  function normalizeMigrationRecords(records) {
    if (!Array.isArray(records)) {
      return [];
    }
    return dedupeMigrationRecords(records.map((record, index) => normalizeMigrationRecord(record, index)).filter(Boolean));
  }

  function normalizeMigrationRecord(record, index = 0) {
    if (!record || typeof record !== "object") {
      return null;
    }

    const id = String(record.id || `migration-${index + 1}`).slice(0, 96);
    const message = String(record.message || "").trim();
    if (!message) {
      return null;
    }

    return {
      id,
      type: String(record.type || "archive-migration").slice(0, 48),
      target: String(record.target || "").slice(0, 128),
      message: message.slice(0, 180),
      createdAt: record.createdAt || null
    };
  }

  function dedupeMigrationRecords(records) {
    const seen = new Set();
    return records.filter((record) => {
      if (seen.has(record.id)) {
        return false;
      }
      seen.add(record.id);
      return true;
    });
  }

  function validateArchive(archive) {
    if (!archive || archive.kind !== ARCHIVE_KIND) {
      throw new Error("这不是 MR 书法项目档案。");
    }
    if (Number(archive.version) !== ARCHIVE_VERSION) {
      throw new Error(`不支持的项目档案版本：${archive.version}`);
    }
    if (archive.projectSchema && window.MRProjectSchema?.validateProjectSchema) {
      window.MRProjectSchema.validateProjectSchema(archive.projectSchema);
    }
  }

  function summarizeArchive(archive, prefix, options = null) {
    const restoreOptions = normalizeRestoreOptions(options, archive);
    const selectedStorageKeys = new Set(restoreOptions.storageKeys);
    const selectedDbIds = new Set(restoreOptions.dbIds);
    const storageCount = STORAGE_ITEMS
      .filter((item) => selectedStorageKeys.has(item.key))
      .filter((item) => archive.storage?.[item.key]?.value)
      .length;
    const modelCount = DB_ITEMS.filter((item) => selectedDbIds.has(item.id)).reduce((sum, item) => {
      const pack = archive.indexedDb?.[item.id];
      const selectedModels = restoreOptions.dbRecords[item.id];
      if (Array.isArray(selectedModels) && selectedModels.length) {
        const selectedRecords = Array.isArray(pack?.records)
          ? filterArchiveDbRecordsBySelection(item, pack.records, selectedModels)
          : [];
        return sum + selectedRecords.length;
      }
      return sum + (Array.isArray(pack?.records) ? pack.records.length : 0);
    }, 0);
    const modelHashCount = DB_ITEMS.filter((item) => selectedDbIds.has(item.id)).reduce((sum, item) => {
      const records = archive.indexedDb?.[item.id]?.records;
      const selectedRecords = Array.isArray(records)
        ? filterArchiveDbRecordsBySelection(item, records, restoreOptions.dbRecords[item.id])
        : [];
      return sum + selectedRecords.filter((record) => normalizeSha256(record?.sha256 || record?.data?.sha256)).length;
    }, 0);
    const migrationCount = Array.isArray(archive.migrations) ? archive.migrations.length : 0;
    const migrationText = migrationCount ? `，${migrationCount} 条迁移记录` : "";
    const hashText = modelHashCount ? `、${modelHashCount} 个资产哈希` : "";
    return {
      ok: true,
      message: `${prefix} 已包含 ${storageCount} 组本机配置、${modelCount} 个导入资产${hashText}${migrationText}，并写入统一项目 schema。`,
      storageCount,
      modelCount,
      modelHashCount,
      migrationCount
    };
  }

  async function recordProjectArchiveExportReceipt(payload = {}) {
    try {
      const archive = payload.archive && typeof payload.archive === "object" ? payload.archive : null;
      const filename = String(payload.filename || "").trim();
      const content = String(payload.payload ?? payload.content ?? (archive ? JSON.stringify(archive, null, 2) : ""));
      if (!archive || !filename || !content) {
        return {
          ok: false,
          message: "项目档案导出回执缺少有效档案内容。"
        };
      }

      const receipt = await createProjectArchiveExportReceipt(archive, {
        filename,
        content,
        exportedAt: payload.exportedAt
      });
      const audit = readProjectArchiveExportAuditState();
      const records = [
        receipt,
        ...audit.records.filter((record) => record.id !== receipt.id && record.receiptDigest !== receipt.receiptDigest)
      ].slice(0, PROJECT_ARCHIVE_EXPORT_MAX_RECEIPTS);
      writeProjectArchiveExportAuditState({
        version: 1,
        updatedAt: receipt.createdAt,
        records
      });
      return {
        ok: true,
        receipt: cloneJsonValue(receipt),
        audit: getProjectArchiveExportAudit(),
        message: `已记录项目档案导出回执：${receipt.filename}。`
      };
    } catch (error) {
      return {
        ok: false,
        message: error?.message ? `项目档案已下载，但导出回执记录失败：${error.message}` : "项目档案已下载，但导出回执记录失败。"
      };
    }
  }

  async function createProjectArchiveExportReceipt(archive, options = {}) {
    const createdAt = new Date().toISOString();
    const exportedAt = normalizeIsoDate(options.exportedAt || archive.exportedAt) || createdAt;
    const filename = String(options.filename || `mr-calligraphy-project-${formatTimestamp(new Date(exportedAt))}.json`).trim();
    const content = String(options.content || JSON.stringify(archive, null, 2));
    const summary = summarizeArchive(archive, "项目档案导出回执");
    const projectSchema = getArchiveProjectSchema(archive);
    const schemaSummary = summarizeProjectSchema(projectSchema);
    const repository = projectSchema.repository || {};
    const repositorySummary = repository.summary || {};
    const base = {
      id: `project-archive-export-${createdAt.replace(/[^0-9]/g, "").slice(0, 14)}`,
      kind: PROJECT_ARCHIVE_EXPORT_AUDIT_KIND,
      type: "project-archive-export",
      version: 1,
      createdAt,
      exportedAt,
      filename,
      mimeType: "application/json;charset=utf-8",
      byteLength: utf8Bytes(content).length,
      fileDigest: sha256Hex(content),
      archiveDigest: await createStableJsonSha256(archive),
      archiveKind: String(archive.kind || "").slice(0, 120),
      archiveVersion: Number(archive.version || 0),
      archiveSource: String(archive.source || "").slice(0, 420),
      storageCount: summary.storageCount,
      modelCount: summary.modelCount,
      modelHashCount: summary.modelHashCount,
      migrationCount: summary.migrationCount,
      schemaKind: String(projectSchema.kind || "").slice(0, 120),
      schemaVersion: Number(projectSchema.version || 0),
      repositoryKind: String(repository.kind || "").slice(0, 120),
      repositoryStatus: String(repository.status || "").slice(0, 80),
      sceneCount: Number(repositorySummary.sceneCount || schemaSummary.repositorySceneCount || 0),
      draftSceneCount: Number(repositorySummary.draftSceneCount || 0),
      publishedSceneCount: Number(repositorySummary.publishedSceneCount || 0),
      importedModelCount: Number(schemaSummary.importedModels || repositorySummary.importedModelCount || 0),
      textureAssetCount: Number(schemaSummary.textureAssets || repositorySummary.textureAssetCount || 0),
      boundary: PROJECT_ARCHIVE_EXPORT_BOUNDARY,
      message: `已记录 ${summary.storageCount} 组配置、${summary.modelCount} 个导入资产的项目档案 JSON 导出。`
    };
    const receiptDigest = await createStableJsonSha256(base);
    return {
      ...base,
      id: `${base.id}-${receiptDigest.slice(0, 8)}`,
      receiptDigest
    };
  }

  function readProjectArchiveExportAuditState() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(PROJECT_ARCHIVE_EXPORT_AUDIT_KEY) || "{}");
      const records = Array.isArray(parsed.records)
        ? parsed.records.map(normalizeProjectArchiveExportReceipt).filter(Boolean)
        : [];
      return {
        version: 1,
        updatedAt: normalizeIsoDate(parsed.updatedAt),
        records
      };
    } catch (error) {
      return { version: 1, updatedAt: "", records: [] };
    }
  }

  function writeProjectArchiveExportAuditState(state = {}) {
    const records = Array.isArray(state.records)
      ? state.records.map(normalizeProjectArchiveExportReceipt).filter(Boolean).slice(0, PROJECT_ARCHIVE_EXPORT_MAX_RECEIPTS)
      : [];
    const normalized = {
      version: 1,
      updatedAt: normalizeIsoDate(state.updatedAt) || records[0]?.createdAt || "",
      records
    };
    window.localStorage.setItem(PROJECT_ARCHIVE_EXPORT_AUDIT_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function normalizeProjectArchiveExportReceipt(record) {
    if (!record || typeof record !== "object") {
      return null;
    }
    const createdAt = normalizeIsoDate(record.createdAt || record.exportedAt) || "";
    const exportedAt = normalizeIsoDate(record.exportedAt || record.createdAt) || createdAt;
    const filename = String(record.filename || "").trim().slice(0, 180);
    const fileDigest = normalizeSha256(record.fileDigest);
    const archiveDigest = normalizeSha256(record.archiveDigest);
    const receiptDigest = normalizeSha256(record.receiptDigest || record.recordDigest);
    if (!filename && !fileDigest && !archiveDigest && !createdAt) {
      return null;
    }
    return {
      id: String(record.id || `project-archive-export-${createdAt || filename || "record"}`).slice(0, 180),
      kind: PROJECT_ARCHIVE_EXPORT_AUDIT_KIND,
      type: "project-archive-export",
      version: 1,
      createdAt,
      exportedAt,
      filename,
      mimeType: String(record.mimeType || "application/json;charset=utf-8").slice(0, 120),
      byteLength: Math.max(0, Math.round(Number(record.byteLength || 0))),
      fileDigest,
      archiveDigest,
      archiveKind: String(record.archiveKind || ARCHIVE_KIND).slice(0, 120),
      archiveVersion: Number(record.archiveVersion || ARCHIVE_VERSION),
      archiveSource: String(record.archiveSource || "").slice(0, 420),
      storageCount: Math.max(0, Math.round(Number(record.storageCount || 0))),
      modelCount: Math.max(0, Math.round(Number(record.modelCount || 0))),
      modelHashCount: Math.max(0, Math.round(Number(record.modelHashCount || 0))),
      migrationCount: Math.max(0, Math.round(Number(record.migrationCount || 0))),
      schemaKind: String(record.schemaKind || "").slice(0, 120),
      schemaVersion: Number(record.schemaVersion || 0),
      repositoryKind: String(record.repositoryKind || "").slice(0, 120),
      repositoryStatus: String(record.repositoryStatus || "").slice(0, 80),
      sceneCount: Math.max(0, Math.round(Number(record.sceneCount || 0))),
      draftSceneCount: Math.max(0, Math.round(Number(record.draftSceneCount || 0))),
      publishedSceneCount: Math.max(0, Math.round(Number(record.publishedSceneCount || 0))),
      importedModelCount: Math.max(0, Math.round(Number(record.importedModelCount || 0))),
      textureAssetCount: Math.max(0, Math.round(Number(record.textureAssetCount || 0))),
      boundary: String(record.boundary || PROJECT_ARCHIVE_EXPORT_BOUNDARY).slice(0, 360),
      message: String(record.message || "").slice(0, 240),
      receiptDigest
    };
  }

  function getProjectArchiveExportAudit(options = {}) {
    const limit = Math.max(1, Math.min(PROJECT_ARCHIVE_EXPORT_MAX_RECEIPTS, Number(options.limit) || PROJECT_ARCHIVE_EXPORT_MAX_RECEIPTS));
    const auditState = readProjectArchiveExportAuditState();
    const records = auditState.records.slice(0, limit).map(cloneJsonValue);
    const audit = {
      ok: true,
      kind: PROJECT_ARCHIVE_EXPORT_AUDIT_KIND,
      generatedAt: new Date().toISOString(),
      storageKey: PROJECT_ARCHIVE_EXPORT_AUDIT_KEY,
      total: auditState.records.length,
      exportedCount: records.length,
      limit,
      latestReceipt: records[0] || null,
      records,
      boundary: PROJECT_ARCHIVE_EXPORT_BOUNDARY,
      message: auditState.records.length
        ? `已记录 ${auditState.records.length} 条项目档案导出回执，最近一次：${formatArchiveDate(auditState.records[0].exportedAt || auditState.records[0].createdAt)}。`
        : "暂无项目档案导出回执。"
    };
    audit.auditDigest = sha256StableJson({
      ...audit,
      auditDigest: ""
    });
    return audit;
  }

  function getProjectArchiveExportAuditExport(options = {}) {
    const audit = getProjectArchiveExportAudit(options);
    if (!audit.total) {
      return {
        ok: false,
        audit,
        message: audit.message || "暂无可导出的项目档案导出回执。"
      };
    }
    const exportedAt = options.exportedAt || new Date().toISOString();
    const filename = options.filename || `mr-calligraphy-project-archive-export-audit-${formatTimestamp(new Date(exportedAt))}.html`;
    const html = createProjectArchiveExportAuditHtml(audit, exportedAt);
    return {
      ok: true,
      filename,
      mimeType: "text/html;charset=utf-8",
      html,
      byteLength: html.length,
      audit,
      recordCount: audit.exportedCount,
      message: `已生成 ${audit.exportedCount} 条项目档案导出回执审计报告：${filename}。`
    };
  }

  function downloadProjectArchiveExportAudit(options = {}) {
    const result = getProjectArchiveExportAuditExport(options);
    if (!result.ok) {
      return result;
    }
    downloadHtml(result.html, result.filename);
    return {
      ok: true,
      filename: result.filename,
      byteLength: result.byteLength,
      recordCount: result.recordCount,
      message: `已下载项目档案导出回执审计报告：${result.filename}。`
    };
  }

  function createProjectArchiveExportAuditHtml(audit, exportedAt) {
    const rows = audit.records.map((record) => `<article class="card">
      <div class="item-head">
        <h2>${escapeHtml(record.filename || "项目档案导出")}</h2>
        <span>${escapeHtml(formatBytes(record.byteLength))}</span>
      </div>
      <p>${escapeHtml(record.message || "已生成项目档案 JSON 备份。")}</p>
      <ul>
        <li>导出时间：${escapeHtml(formatArchiveDate(record.exportedAt || record.createdAt))}</li>
        <li>档案来源：${escapeHtml(record.archiveSource || "当前浏览器")}</li>
        <li>配置 / 资产 / 哈希：${escapeHtml(record.storageCount)} / ${escapeHtml(record.modelCount)} / ${escapeHtml(record.modelHashCount)}</li>
        <li>场景：${escapeHtml(record.draftSceneCount)} 草稿 / ${escapeHtml(record.publishedSceneCount)} 发布 / ${escapeHtml(record.sceneCount)} 总计</li>
        <li>导入模型 / 贴图：${escapeHtml(record.importedModelCount)} / ${escapeHtml(record.textureAssetCount)}</li>
        <li>Project Schema：${escapeHtml(record.schemaKind || "未知")} v${escapeHtml(record.schemaVersion || 0)}</li>
        <li>项目仓库状态：${escapeHtml(record.repositoryStatus || "未知")}</li>
        <li>文件摘要：${escapeHtml(record.fileDigest || "未生成")}</li>
        <li>档案摘要：${escapeHtml(record.archiveDigest || "未生成")}</li>
        <li>回执摘要：${escapeHtml(record.receiptDigest || "未生成")}</li>
      </ul>
      <pre>${escapeHtml(JSON.stringify(record, null, 2))}</pre>
    </article>`).join("");

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MR 书法项目档案导出回执审计</title>
  <style>
    :root { color-scheme: light; --ink:#17221f; --muted:#61706a; --line:#dbe8e2; --jade:#247a67; --paper:#fbf7ee; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--paper); font: 14px/1.62 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; }
    main { width: min(980px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 44px; }
    header { display: grid; gap: 10px; padding-bottom: 18px; border-bottom: 2px solid var(--ink); }
    h1, h2, p { margin: 0; }
    h1 { font-size: clamp(28px, 5vw, 46px); line-height: 1.08; }
    h2 { font-size: 16px; overflow-wrap: anywhere; }
    .muted { color: var(--muted); }
    .stack { display: grid; gap: 12px; margin-top: 22px; }
    .card { display: grid; gap: 8px; padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    .item-head { display: flex; gap: 10px; justify-content: space-between; align-items: baseline; }
    .item-head span { color: var(--jade); font-weight: 800; white-space: nowrap; }
    ul { display: grid; gap: 4px; margin: 0; padding-left: 18px; color: var(--muted); overflow-wrap: anywhere; }
    pre { max-height: 260px; margin: 6px 0 0; padding: 10px; overflow: auto; border: 1px solid var(--line); border-radius: 6px; background: #f7faf8; color: #24332f; white-space: pre-wrap; word-break: break-word; }
    footer { margin-top: 24px; padding-top: 14px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    @media (max-width: 720px) { .item-head { display: grid; } .item-head span { white-space: normal; } }
    @media print { body { background: #ffffff; } main { width: 100%; padding: 0; } .card { break-inside: avoid; } }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="muted">MR Calligraphy Project Archive Export Audit · ${escapeHtml(formatArchiveDate(exportedAt))}</p>
      <h1>项目档案导出回执审计</h1>
      <p class="muted">本报告来自当前浏览器保存的项目档案导出回执；它证明浏览器曾生成 JSON 备份文件及其摘要，但不代表云端备份或服务端审计已经完成。</p>
    </header>
    <section class="stack">${rows}</section>
    <footer>审计数据来源：${escapeHtml(audit.storageKey)}。回执数量：${escapeHtml(audit.total)}。审计摘要：${escapeHtml(audit.auditDigest || "未生成")}。导出时间：${escapeHtml(formatArchiveDate(exportedAt))}。边界：${escapeHtml(audit.boundary)}</footer>
  </main>
</body>
</html>`;
  }

  async function recordProjectRepositoryExportReceipt(payload = {}) {
    try {
      const packageRecord = payload.package && typeof payload.package === "object" ? payload.package : null;
      const filename = String(payload.filename || "").trim();
      const content = String(payload.payload ?? payload.content ?? (packageRecord ? JSON.stringify(packageRecord, null, 2) : ""));
      if (!packageRecord || !filename || !content || packageRecord.kind !== PROJECT_REPOSITORY_PACKAGE_KIND) {
        return {
          ok: false,
          message: "项目仓库包导出回执缺少有效仓库包内容。"
        };
      }

      const receipt = await createProjectRepositoryExportReceipt(packageRecord, {
        filename,
        content,
        exportedAt: payload.exportedAt
      });
      const audit = readProjectRepositoryExportAuditState();
      const records = [
        receipt,
        ...audit.records.filter((record) => record.id !== receipt.id && record.receiptDigest !== receipt.receiptDigest)
      ].slice(0, PROJECT_REPOSITORY_EXPORT_MAX_RECEIPTS);
      writeProjectRepositoryExportAuditState({
        version: 1,
        updatedAt: receipt.createdAt,
        records
      });
      return {
        ok: true,
        receipt: cloneJsonValue(receipt),
        audit: getProjectRepositoryExportAudit(),
        message: `已记录项目仓库包导出回执：${receipt.filename}。`
      };
    } catch (error) {
      return {
        ok: false,
        message: error?.message ? `项目仓库包已下载，但导出回执记录失败：${error.message}` : "项目仓库包已下载，但导出回执记录失败。"
      };
    }
  }

  async function createProjectRepositoryExportReceipt(packageRecord, options = {}) {
    const createdAt = new Date().toISOString();
    const exportedAt = normalizeIsoDate(options.exportedAt || packageRecord.exportedAt) || createdAt;
    const filename = String(options.filename || `mr-calligraphy-project-repository-package-${formatTimestamp(new Date(exportedAt))}.json`).trim();
    const content = String(options.content || JSON.stringify(packageRecord, null, 2));
    const summary = packageRecord.summary || {};
    const repositoryDigest = await createStableJsonSha256(packageRecord.repository || {});
    const base = {
      id: `project-repository-export-${createdAt.replace(/[^0-9]/g, "").slice(0, 14)}`,
      kind: PROJECT_REPOSITORY_EXPORT_AUDIT_KIND,
      type: "project-repository-package-export",
      version: PROJECT_REPOSITORY_REMOTE_VERSION,
      createdAt,
      exportedAt,
      filename,
      mimeType: "application/json;charset=utf-8",
      byteLength: utf8Bytes(content).length,
      fileDigest: sha256Hex(content),
      packageId: String(packageRecord.packageId || "").slice(0, 160),
      workspaceId: normalizeProjectRepositoryWorkspaceId(packageRecord.workspaceId),
      packageDigest: normalizeSha256(packageRecord.packageDigest),
      repositoryDigest,
      repositoryKind: String(packageRecord.repository?.kind || "").slice(0, 120),
      repositoryStatus: String(packageRecord.repository?.status || "").slice(0, 80),
      schemaKind: String(packageRecord.projectSchema?.kind || "").slice(0, 120),
      sceneCount: Math.max(0, Math.round(Number(summary.sceneCount || 0))),
      draftSceneCount: Math.max(0, Math.round(Number(summary.draftSceneCount || 0))),
      publishedSceneCount: Math.max(0, Math.round(Number(summary.publishedSceneCount || 0))),
      readySceneCount: Math.max(0, Math.round(Number(summary.readySceneCount || 0))),
      importedModelCount: Math.max(0, Math.round(Number(summary.importedModels || 0))),
      textureAssetCount: Math.max(0, Math.round(Number(summary.textureAssets || 0))),
      missingModelBinaries: Math.max(0, Math.round(Number(summary.missingModelBinaries || 0))),
      missingTextureBinaries: Math.max(0, Math.round(Number(summary.missingTextureBinaries || 0))),
      source: String(packageRecord.source || "").slice(0, 420),
      boundary: PROJECT_REPOSITORY_EXPORT_BOUNDARY,
      message: `已记录项目仓库包 ${packageRecord.packageId || "未命名包"} 的本机 JSON 导出回执。`
    };
    const receiptDigest = await createStableJsonSha256(base);
    return {
      ...base,
      id: `${base.id}-${receiptDigest.slice(0, 8)}`,
      receiptDigest
    };
  }

  function readProjectRepositoryExportAuditState() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(PROJECT_REPOSITORY_EXPORT_AUDIT_KEY) || "{}");
      const records = Array.isArray(parsed.records)
        ? parsed.records.map(normalizeProjectRepositoryExportReceipt).filter(Boolean)
        : [];
      return {
        version: 1,
        updatedAt: normalizeIsoDate(parsed.updatedAt),
        records
      };
    } catch (error) {
      return { version: 1, updatedAt: "", records: [] };
    }
  }

  function writeProjectRepositoryExportAuditState(state = {}) {
    const records = Array.isArray(state.records)
      ? state.records.map(normalizeProjectRepositoryExportReceipt).filter(Boolean).slice(0, PROJECT_REPOSITORY_EXPORT_MAX_RECEIPTS)
      : [];
    const normalized = {
      version: 1,
      updatedAt: normalizeIsoDate(state.updatedAt) || records[0]?.createdAt || "",
      records
    };
    window.localStorage.setItem(PROJECT_REPOSITORY_EXPORT_AUDIT_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function normalizeProjectRepositoryExportReceipt(record) {
    if (!record || typeof record !== "object") {
      return null;
    }
    const createdAt = normalizeIsoDate(record.createdAt || record.exportedAt) || "";
    const exportedAt = normalizeIsoDate(record.exportedAt || record.createdAt) || createdAt;
    const filename = String(record.filename || "").trim().slice(0, 180);
    const packageId = String(record.packageId || "").slice(0, 160);
    const packageDigest = normalizeSha256(record.packageDigest);
    const receiptDigest = normalizeSha256(record.receiptDigest || record.recordDigest);
    if (!filename && !packageId && !packageDigest && !createdAt) {
      return null;
    }
    return {
      id: String(record.id || `project-repository-export-${createdAt || packageId || filename || "record"}`).slice(0, 180),
      kind: PROJECT_REPOSITORY_EXPORT_AUDIT_KIND,
      type: "project-repository-package-export",
      version: PROJECT_REPOSITORY_REMOTE_VERSION,
      createdAt,
      exportedAt,
      filename,
      mimeType: String(record.mimeType || "application/json;charset=utf-8").slice(0, 120),
      byteLength: Math.max(0, Math.round(Number(record.byteLength || 0))),
      fileDigest: normalizeSha256(record.fileDigest),
      packageId,
      workspaceId: normalizeProjectRepositoryWorkspaceId(record.workspaceId),
      packageDigest,
      repositoryDigest: normalizeSha256(record.repositoryDigest),
      repositoryKind: String(record.repositoryKind || "").slice(0, 120),
      repositoryStatus: String(record.repositoryStatus || "").slice(0, 80),
      schemaKind: String(record.schemaKind || "").slice(0, 120),
      sceneCount: Math.max(0, Math.round(Number(record.sceneCount || 0))),
      draftSceneCount: Math.max(0, Math.round(Number(record.draftSceneCount || 0))),
      publishedSceneCount: Math.max(0, Math.round(Number(record.publishedSceneCount || 0))),
      readySceneCount: Math.max(0, Math.round(Number(record.readySceneCount || 0))),
      importedModelCount: Math.max(0, Math.round(Number(record.importedModelCount || 0))),
      textureAssetCount: Math.max(0, Math.round(Number(record.textureAssetCount || 0))),
      missingModelBinaries: Math.max(0, Math.round(Number(record.missingModelBinaries || 0))),
      missingTextureBinaries: Math.max(0, Math.round(Number(record.missingTextureBinaries || 0))),
      source: String(record.source || "").slice(0, 420),
      boundary: String(record.boundary || PROJECT_REPOSITORY_EXPORT_BOUNDARY).slice(0, 420),
      message: String(record.message || "").slice(0, 260),
      receiptDigest
    };
  }

  function getProjectRepositoryExportAudit(options = {}) {
    const limit = Math.max(1, Math.min(PROJECT_REPOSITORY_EXPORT_MAX_RECEIPTS, Number(options.limit) || PROJECT_REPOSITORY_EXPORT_MAX_RECEIPTS));
    const auditState = readProjectRepositoryExportAuditState();
    const records = auditState.records.slice(0, limit).map(cloneJsonValue);
    const workspaceCounts = auditState.records.reduce((counts, record) => {
      const workspaceId = record.workspaceId || PROJECT_REPOSITORY_DEFAULT_WORKSPACE;
      counts[workspaceId] = (counts[workspaceId] || 0) + 1;
      return counts;
    }, {});
    const audit = {
      ok: true,
      kind: PROJECT_REPOSITORY_EXPORT_AUDIT_KIND,
      generatedAt: new Date().toISOString(),
      storageKey: PROJECT_REPOSITORY_EXPORT_AUDIT_KEY,
      total: auditState.records.length,
      exportedCount: records.length,
      limit,
      workspaceCounts,
      latestReceipt: records[0] || null,
      records,
      boundary: PROJECT_REPOSITORY_EXPORT_BOUNDARY,
      message: auditState.records.length
        ? `已记录 ${auditState.records.length} 条项目仓库包导出回执，最近一次：${formatArchiveDate(auditState.records[0].exportedAt || auditState.records[0].createdAt)}。`
        : "暂无项目仓库包导出回执。"
    };
    audit.auditDigest = sha256StableJson({
      ...audit,
      auditDigest: ""
    });
    return audit;
  }

  function getProjectRepositoryExportAuditExport(options = {}) {
    const audit = getProjectRepositoryExportAudit(options);
    if (!audit.total) {
      return {
        ok: false,
        audit,
        message: audit.message || "暂无可导出的项目仓库包导出回执。"
      };
    }
    const exportedAt = options.exportedAt || new Date().toISOString();
    const filename = options.filename || `mr-calligraphy-project-repository-export-audit-${formatTimestamp(new Date(exportedAt))}.html`;
    const html = createProjectRepositoryExportAuditHtml(audit, exportedAt);
    return {
      ok: true,
      filename,
      mimeType: "text/html;charset=utf-8",
      html,
      byteLength: html.length,
      audit,
      recordCount: audit.exportedCount,
      message: `已生成 ${audit.exportedCount} 条项目仓库包导出回执审计报告：${filename}。`
    };
  }

  function downloadProjectRepositoryExportAudit(options = {}) {
    const result = getProjectRepositoryExportAuditExport(options);
    if (!result.ok) {
      return result;
    }
    downloadHtml(result.html, result.filename);
    return {
      ok: true,
      filename: result.filename,
      byteLength: result.byteLength,
      recordCount: result.recordCount,
      message: `已下载项目仓库包导出回执审计报告：${result.filename}。`
    };
  }

  function createProjectRepositoryExportAuditHtml(audit, exportedAt) {
    const rows = audit.records.map((record) => `<article class="card">
      <div class="item-head">
        <h2>${escapeHtml(record.filename || record.packageId || "项目仓库包导出")}</h2>
        <span>${escapeHtml(record.workspaceId || PROJECT_REPOSITORY_DEFAULT_WORKSPACE)}</span>
      </div>
      <p>${escapeHtml(record.message || "已生成项目仓库 JSON 同步包。")}</p>
      <ul>
        <li>导出时间：${escapeHtml(formatArchiveDate(record.exportedAt || record.createdAt))}</li>
        <li>Package ID：${escapeHtml(record.packageId || "未知")}</li>
        <li>Workspace：${escapeHtml(record.workspaceId || PROJECT_REPOSITORY_DEFAULT_WORKSPACE)}</li>
        <li>场景：${escapeHtml(record.draftSceneCount)} 草稿 / ${escapeHtml(record.publishedSceneCount)} 发布 / ${escapeHtml(record.sceneCount)} 总计</li>
        <li>导入模型 / 贴图：${escapeHtml(record.importedModelCount)} / ${escapeHtml(record.textureAssetCount)}</li>
        <li>缺失模型文件 / 缺失贴图文件：${escapeHtml(record.missingModelBinaries)} / ${escapeHtml(record.missingTextureBinaries)}</li>
        <li>文件大小：${escapeHtml(formatBytes(record.byteLength))}</li>
        <li>文件摘要：${escapeHtml(record.fileDigest || "未生成")}</li>
        <li>包摘要：${escapeHtml(record.packageDigest || "未生成")}</li>
        <li>仓库摘要：${escapeHtml(record.repositoryDigest || "未生成")}</li>
        <li>回执摘要：${escapeHtml(record.receiptDigest || "未生成")}</li>
      </ul>
      <pre>${escapeHtml(JSON.stringify(record, null, 2))}</pre>
    </article>`).join("");

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MR 书法项目仓库包导出回执审计</title>
  <style>
    :root { color-scheme: light; --ink:#17221f; --muted:#61706a; --line:#dbe8e2; --jade:#247a67; --paper:#fbf7ee; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--paper); font: 14px/1.62 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; }
    main { width: min(980px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 44px; }
    header { display: grid; gap: 10px; padding-bottom: 18px; border-bottom: 2px solid var(--ink); }
    h1, h2, p { margin: 0; }
    h1 { font-size: clamp(28px, 5vw, 46px); line-height: 1.08; }
    h2 { font-size: 16px; overflow-wrap: anywhere; }
    .muted { color: var(--muted); }
    .stack { display: grid; gap: 12px; margin-top: 22px; }
    .card { display: grid; gap: 8px; padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    .item-head { display: flex; gap: 10px; justify-content: space-between; align-items: baseline; }
    .item-head span { color: var(--jade); font-weight: 800; white-space: nowrap; }
    ul { display: grid; gap: 4px; margin: 0; padding-left: 18px; color: var(--muted); overflow-wrap: anywhere; }
    pre { max-height: 260px; margin: 6px 0 0; padding: 10px; overflow: auto; border: 1px solid var(--line); border-radius: 6px; background: #f7faf8; color: #24332f; white-space: pre-wrap; word-break: break-word; }
    footer { margin-top: 24px; padding-top: 14px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    @media (max-width: 720px) { .item-head { display: grid; } .item-head span { white-space: normal; } }
    @media print { body { background: #ffffff; } main { width: 100%; padding: 0; } .card { break-inside: avoid; } }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="muted">MR Calligraphy Project Repository Package Export Audit · ${escapeHtml(formatArchiveDate(exportedAt))}</p>
      <h1>项目仓库包导出回执审计</h1>
      <p class="muted">本报告来自当前浏览器保存的项目仓库包导出回执；它证明浏览器曾生成与远端推送同结构的 JSON 同步包及摘要，但不代表云端同步已经完成。</p>
    </header>
    <section class="stack">${rows}</section>
    <footer>审计数据来源：${escapeHtml(audit.storageKey)}。回执数量：${escapeHtml(audit.total)}。审计摘要：${escapeHtml(audit.auditDigest || "未生成")}。导出时间：${escapeHtml(formatArchiveDate(exportedAt))}。边界：${escapeHtml(audit.boundary)}</footer>
  </main>
</body>
</html>`;
  }

  function recordProjectImpactExportReceipt(payload = {}) {
    try {
      const preview = payload.preview && typeof payload.preview === "object" ? payload.preview : null;
      const filename = String(payload.filename || "").trim();
      const html = String(payload.html || payload.content || "");
      if (!preview || !filename || !html) {
        return {
          ok: false,
          message: "项目档案差异报告导出回执缺少有效报告内容。"
        };
      }
      const receipt = createProjectImpactExportReceipt(preview, {
        filename,
        html,
        restoreOptions: payload.restoreOptions || null,
        exportedAt: payload.exportedAt
      });
      const audit = readProjectImpactExportAuditState();
      const records = [
        receipt,
        ...audit.records.filter((record) => record.id !== receipt.id && record.receiptDigest !== receipt.receiptDigest)
      ].slice(0, PROJECT_IMPACT_EXPORT_MAX_RECEIPTS);
      writeProjectImpactExportAuditState({
        version: 1,
        updatedAt: receipt.createdAt,
        records
      });
      return {
        ok: true,
        receipt: cloneJsonValue(receipt),
        audit: getProjectImpactExportAudit(),
        message: `已记录项目档案差异报告导出回执：${receipt.filename}。`
      };
    } catch (error) {
      return {
        ok: false,
        message: error?.message ? `差异报告已下载，但导出回执记录失败：${error.message}` : "差异报告已下载，但导出回执记录失败。"
      };
    }
  }

  function createProjectImpactExportReceipt(preview, options = {}) {
    const createdAt = new Date().toISOString();
    const exportedAt = normalizeIsoDate(options.exportedAt) || createdAt;
    const filename = String(options.filename || `mr-calligraphy-archive-impact-${formatTimestamp(new Date(exportedAt))}.html`).trim();
    const html = String(options.html || "");
    const summary = preview.summary || {};
    const schema = preview.schemaSummary || {};
    const risk = preview.riskSummary || {};
    const remote = preview.remoteRepository || null;
    const restorePlan = createImpactRestorePlan(preview, options.restoreOptions || null);
    const selectedPayload = createImpactRestorePlanDigestPayload(restorePlan);
    const base = {
      id: `project-impact-export-${createdAt.replace(/[^0-9]/g, "").slice(0, 14)}`,
      kind: PROJECT_IMPACT_EXPORT_AUDIT_KIND,
      type: "project-archive-impact-export",
      version: 1,
      createdAt,
      exportedAt,
      filename,
      mimeType: "text/html;charset=utf-8",
      byteLength: utf8Bytes(html).length,
      fileDigest: sha256Hex(html),
      previewDigest: sha256StableJson(createImpactPreviewDigestPayload(preview, selectedPayload)),
      archiveExportedAt: normalizeIsoDate(preview.exportedAt),
      archiveSource: String(preview.source || "").slice(0, 420),
      sourceType: remote ? "remote-project-repository" : "project-archive-file",
      remotePackageId: String(remote?.packageId || remote?.sourcePackageId || "").slice(0, 160),
      remoteWorkspaceId: remote ? normalizeProjectRepositoryWorkspaceId(remote.workspaceId) : "",
      remotePackageDigest: normalizeSha256(remote?.packageDigest),
      remoteRepositoryDigest: normalizeSha256(remote?.repositoryDigest),
      riskLevel: String(remote?.riskLevel || risk.level || "unknown").slice(0, 40),
      riskLabel: String(remote?.riskLabel || risk.label || "风险未知").slice(0, 80),
      riskText: String(remote?.riskText || risk.text || "").slice(0, 260),
      migrationCount: Array.isArray(preview.migrations) ? preview.migrations.length : 0,
      storageTotal: Array.isArray(preview.storage) ? preview.storage.length : 0,
      dbTotal: Array.isArray(preview.indexedDb) ? preview.indexedDb.length : 0,
      storageAdded: Math.max(0, Math.round(Number(summary.storageAdded || 0))),
      storageUpdated: Math.max(0, Math.round(Number(summary.storageUpdated || 0))),
      storageRemoved: Math.max(0, Math.round(Number(summary.storageRemoved || 0))),
      incomingModelCount: Math.max(0, Math.round(Number(summary.incomingModelCount || 0))),
      assetHashCount: Math.max(0, Math.round(Number(summary.assetHashCount || 0))),
      missingAssetHashCount: Math.max(0, Math.round(Number(summary.missingAssetHashCount || 0))),
      importedModelCount: Math.max(0, Math.round(Number(schema.importedModels || 0))),
      textureAssetCount: Math.max(0, Math.round(Number(schema.textureAssets || 0))),
      selectedStorageCount: restorePlan.selectedStorageCount,
      selectedDbCount: restorePlan.selectedDbCount,
      selectedFieldCount: restorePlan.selectedFieldCount,
      selectedModelCount: restorePlan.selectedModelCount,
      selectedCount: restorePlan.selectedCount,
      selectionDigest: sha256StableJson(selectedPayload),
      boundary: PROJECT_IMPACT_EXPORT_BOUNDARY,
      message: `已记录项目档案差异报告导出回执：${filename}。`
    };
    const receiptDigest = sha256StableJson(base);
    return {
      ...base,
      id: `${base.id}-${receiptDigest.slice(0, 8)}`,
      receiptDigest
    };
  }

  function createImpactRestorePlanDigestPayload(restorePlan) {
    const storageFields = {};
    Object.entries(restorePlan.storageFields || {}).forEach(([key, fields]) => {
      storageFields[key] = Array.isArray(fields)
        ? fields.map((field) => ({
          action: String(field.action || ""),
          path: String(field.path || "")
        }))
        : [];
    });
    const dbRecords = {};
    Object.entries(restorePlan.dbRecords || {}).forEach(([key, records]) => {
      dbRecords[key] = Array.isArray(records)
        ? records.map((record) => ({
          key: String(record.key || ""),
          action: String(record.action || ""),
          conflictMode: String(record.conflictMode || ""),
          customLabel: String(record.customLabel || "")
        }))
        : [];
    });
    return {
      storageKeys: Array.from(restorePlan.storageKeys || []).sort(),
      dbIds: Array.from(restorePlan.dbIds || []).sort(),
      storageFields,
      dbRecords,
      selectedStorageCount: restorePlan.selectedStorageCount,
      selectedDbCount: restorePlan.selectedDbCount,
      selectedFieldCount: restorePlan.selectedFieldCount,
      selectedModelCount: restorePlan.selectedModelCount,
      selectedCount: restorePlan.selectedCount
    };
  }

  function createImpactPreviewDigestPayload(preview, selectionPayload) {
    return {
      exportedAt: preview.exportedAt || "",
      source: preview.source || "",
      migrations: normalizeMigrationRecords(preview.migrations || []),
      schemaSummary: preview.schemaSummary || {},
      summary: preview.summary || {},
      riskSummary: preview.riskSummary || {},
      remoteRepository: preview.remoteRepository || null,
      storage: (Array.isArray(preview.storage) ? preview.storage : []).map((item) => ({
        id: item.id,
        label: item.label,
        change: item.change,
        currentBytes: item.currentBytes,
        incomingBytes: item.incomingBytes,
        fieldDiffSummary: item.fieldDiffSummary,
        fieldImpactSummary: item.fieldImpactSummary,
        fieldDiffs: item.fieldDiffs,
        fieldSelections: item.fieldSelections
      })),
      indexedDb: (Array.isArray(preview.indexedDb) ? preview.indexedDb : []).map((item) => ({
        id: item.id,
        label: item.label,
        change: item.change,
        currentCount: item.currentCount,
        incomingCount: item.incomingCount,
        incomingBinaryCount: item.incomingBinaryCount,
        incomingHashCount: item.incomingHashCount,
        missingHashCount: item.missingHashCount,
        modelDiffSummary: item.modelDiffSummary,
        modelDiffs: item.modelDiffs,
        modelSelections: item.modelSelections
      })),
      selection: selectionPayload
    };
  }

  function readProjectImpactExportAuditState() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(PROJECT_IMPACT_EXPORT_AUDIT_KEY) || "{}");
      const records = Array.isArray(parsed.records)
        ? parsed.records.map(normalizeProjectImpactExportReceipt).filter(Boolean)
        : [];
      return {
        version: 1,
        updatedAt: normalizeIsoDate(parsed.updatedAt),
        records
      };
    } catch (error) {
      return { version: 1, updatedAt: "", records: [] };
    }
  }

  function writeProjectImpactExportAuditState(state = {}) {
    const records = Array.isArray(state.records)
      ? state.records.map(normalizeProjectImpactExportReceipt).filter(Boolean).slice(0, PROJECT_IMPACT_EXPORT_MAX_RECEIPTS)
      : [];
    const normalized = {
      version: 1,
      updatedAt: normalizeIsoDate(state.updatedAt) || records[0]?.createdAt || "",
      records
    };
    window.localStorage.setItem(PROJECT_IMPACT_EXPORT_AUDIT_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function normalizeProjectImpactExportReceipt(record) {
    if (!record || typeof record !== "object") {
      return null;
    }
    const createdAt = normalizeIsoDate(record.createdAt || record.exportedAt) || "";
    const exportedAt = normalizeIsoDate(record.exportedAt || record.createdAt) || createdAt;
    const filename = String(record.filename || "").trim().slice(0, 180);
    const fileDigest = normalizeSha256(record.fileDigest);
    const previewDigest = normalizeSha256(record.previewDigest);
    const receiptDigest = normalizeSha256(record.receiptDigest || record.recordDigest);
    if (!filename && !fileDigest && !previewDigest && !createdAt) {
      return null;
    }
    return {
      id: String(record.id || `project-impact-export-${createdAt || filename || "record"}`).slice(0, 180),
      kind: PROJECT_IMPACT_EXPORT_AUDIT_KIND,
      type: "project-archive-impact-export",
      version: 1,
      createdAt,
      exportedAt,
      filename,
      mimeType: String(record.mimeType || "text/html;charset=utf-8").slice(0, 120),
      byteLength: Math.max(0, Math.round(Number(record.byteLength || 0))),
      fileDigest,
      previewDigest,
      archiveExportedAt: normalizeIsoDate(record.archiveExportedAt),
      archiveSource: String(record.archiveSource || "").slice(0, 420),
      sourceType: ["remote-project-repository", "project-archive-file"].includes(record.sourceType) ? record.sourceType : "project-archive-file",
      remotePackageId: String(record.remotePackageId || "").slice(0, 160),
      remoteWorkspaceId: record.remoteWorkspaceId ? normalizeProjectRepositoryWorkspaceId(record.remoteWorkspaceId) : "",
      remotePackageDigest: normalizeSha256(record.remotePackageDigest),
      remoteRepositoryDigest: normalizeSha256(record.remoteRepositoryDigest),
      riskLevel: String(record.riskLevel || "unknown").slice(0, 40),
      riskLabel: String(record.riskLabel || "风险未知").slice(0, 80),
      riskText: String(record.riskText || "").slice(0, 260),
      migrationCount: Math.max(0, Math.round(Number(record.migrationCount || 0))),
      storageTotal: Math.max(0, Math.round(Number(record.storageTotal || 0))),
      dbTotal: Math.max(0, Math.round(Number(record.dbTotal || 0))),
      storageAdded: Math.max(0, Math.round(Number(record.storageAdded || 0))),
      storageUpdated: Math.max(0, Math.round(Number(record.storageUpdated || 0))),
      storageRemoved: Math.max(0, Math.round(Number(record.storageRemoved || 0))),
      incomingModelCount: Math.max(0, Math.round(Number(record.incomingModelCount || 0))),
      assetHashCount: Math.max(0, Math.round(Number(record.assetHashCount || 0))),
      missingAssetHashCount: Math.max(0, Math.round(Number(record.missingAssetHashCount || 0))),
      importedModelCount: Math.max(0, Math.round(Number(record.importedModelCount || 0))),
      textureAssetCount: Math.max(0, Math.round(Number(record.textureAssetCount || 0))),
      selectedStorageCount: Math.max(0, Math.round(Number(record.selectedStorageCount || 0))),
      selectedDbCount: Math.max(0, Math.round(Number(record.selectedDbCount || 0))),
      selectedFieldCount: Math.max(0, Math.round(Number(record.selectedFieldCount || 0))),
      selectedModelCount: Math.max(0, Math.round(Number(record.selectedModelCount || 0))),
      selectedCount: Math.max(0, Math.round(Number(record.selectedCount || 0))),
      selectionDigest: normalizeSha256(record.selectionDigest),
      boundary: String(record.boundary || PROJECT_IMPACT_EXPORT_BOUNDARY).slice(0, 420),
      message: String(record.message || "").slice(0, 260),
      receiptDigest
    };
  }

  function getProjectImpactExportAudit(options = {}) {
    const limit = Math.max(1, Math.min(PROJECT_IMPACT_EXPORT_MAX_RECEIPTS, Number(options.limit) || PROJECT_IMPACT_EXPORT_MAX_RECEIPTS));
    const auditState = readProjectImpactExportAuditState();
    const records = auditState.records.slice(0, limit).map(cloneJsonValue);
    const sourceCounts = auditState.records.reduce((counts, record) => {
      const sourceType = record.sourceType || "project-archive-file";
      counts[sourceType] = (counts[sourceType] || 0) + 1;
      return counts;
    }, {});
    const audit = {
      ok: true,
      kind: PROJECT_IMPACT_EXPORT_AUDIT_KIND,
      generatedAt: new Date().toISOString(),
      storageKey: PROJECT_IMPACT_EXPORT_AUDIT_KEY,
      total: auditState.records.length,
      exportedCount: records.length,
      limit,
      sourceCounts,
      latestReceipt: records[0] || null,
      records,
      boundary: PROJECT_IMPACT_EXPORT_BOUNDARY,
      message: auditState.records.length
        ? `已记录 ${auditState.records.length} 条项目档案差异报告导出回执，最近一次：${formatArchiveDate(auditState.records[0].exportedAt || auditState.records[0].createdAt)}。`
        : "暂无项目档案差异报告导出回执。"
    };
    audit.auditDigest = sha256StableJson({
      ...audit,
      auditDigest: ""
    });
    return audit;
  }

  function getProjectImpactExportAuditExport(options = {}) {
    const audit = getProjectImpactExportAudit(options);
    if (!audit.total) {
      return {
        ok: false,
        audit,
        message: audit.message || "暂无可导出的项目档案差异报告导出回执。"
      };
    }
    const exportedAt = options.exportedAt || new Date().toISOString();
    const filename = options.filename || `mr-calligraphy-project-impact-export-audit-${formatTimestamp(new Date(exportedAt))}.html`;
    const html = createProjectImpactExportAuditHtml(audit, exportedAt);
    return {
      ok: true,
      filename,
      mimeType: "text/html;charset=utf-8",
      html,
      byteLength: html.length,
      audit,
      recordCount: audit.exportedCount,
      message: `已生成 ${audit.exportedCount} 条项目档案差异报告导出回执审计报告：${filename}。`
    };
  }

  function downloadProjectImpactExportAudit(options = {}) {
    const result = getProjectImpactExportAuditExport(options);
    if (!result.ok) {
      return result;
    }
    downloadHtml(result.html, result.filename);
    return {
      ok: true,
      filename: result.filename,
      byteLength: result.byteLength,
      recordCount: result.recordCount,
      message: `已下载项目档案差异报告导出回执审计报告：${result.filename}。`
    };
  }

  function createProjectImpactExportAuditHtml(audit, exportedAt) {
    const rows = audit.records.map((record) => `<article class="card">
      <div class="item-head">
        <h2>${escapeHtml(record.filename || "项目档案差异报告")}</h2>
        <span>${escapeHtml(formatProjectImpactSourceType(record.sourceType))}</span>
      </div>
      <p>${escapeHtml(record.message || "已生成恢复前差异审阅报告。")}</p>
      <ul>
        <li>导出时间：${escapeHtml(formatArchiveDate(record.exportedAt || record.createdAt))}</li>
        <li>档案时间：${escapeHtml(formatArchiveDate(record.archiveExportedAt))}</li>
        <li>来源：${escapeHtml(record.archiveSource || "未知")}</li>
        <li>远端包：${escapeHtml(record.remotePackageId || "无")}；Workspace：${escapeHtml(record.remoteWorkspaceId || "无")}</li>
        <li>风险：${escapeHtml(record.riskLabel)} · ${escapeHtml(record.riskText || "无")}</li>
        <li>配置差异：新增 ${escapeHtml(record.storageAdded)} / 覆盖 ${escapeHtml(record.storageUpdated)} / 清空 ${escapeHtml(record.storageRemoved)}</li>
        <li>模型 / 贴图：${escapeHtml(record.importedModelCount || record.incomingModelCount)} / ${escapeHtml(record.textureAssetCount)}</li>
        <li>恢复选择：${escapeHtml(record.selectedStorageCount)} 组配置 / ${escapeHtml(record.selectedDbCount)} 个模型库 / ${escapeHtml(record.selectedFieldCount)} 个字段 / ${escapeHtml(record.selectedModelCount)} 个模型</li>
        <li>文件摘要：${escapeHtml(record.fileDigest || "未生成")}</li>
        <li>预览摘要：${escapeHtml(record.previewDigest || "未生成")}</li>
        <li>选择摘要：${escapeHtml(record.selectionDigest || "未生成")}</li>
        <li>回执摘要：${escapeHtml(record.receiptDigest || "未生成")}</li>
      </ul>
      <pre>${escapeHtml(JSON.stringify(record, null, 2))}</pre>
    </article>`).join("");

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MR 书法项目档案差异报告导出回执审计</title>
  <style>
    :root { color-scheme: light; --ink:#17221f; --muted:#61706a; --line:#dbe8e2; --jade:#247a67; --paper:#fbf7ee; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--paper); font: 14px/1.62 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; }
    main { width: min(980px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 44px; }
    header { display: grid; gap: 10px; padding-bottom: 18px; border-bottom: 2px solid var(--ink); }
    h1, h2, p { margin: 0; }
    h1 { font-size: clamp(28px, 5vw, 46px); line-height: 1.08; }
    h2 { font-size: 16px; overflow-wrap: anywhere; }
    .muted { color: var(--muted); }
    .stack { display: grid; gap: 12px; margin-top: 22px; }
    .card { display: grid; gap: 8px; padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    .item-head { display: flex; gap: 10px; justify-content: space-between; align-items: baseline; }
    .item-head span { color: var(--jade); font-weight: 800; white-space: nowrap; }
    ul { display: grid; gap: 4px; margin: 0; padding-left: 18px; color: var(--muted); overflow-wrap: anywhere; }
    pre { max-height: 260px; margin: 6px 0 0; padding: 10px; overflow: auto; border: 1px solid var(--line); border-radius: 6px; background: #f7faf8; color: #24332f; white-space: pre-wrap; word-break: break-word; }
    footer { margin-top: 24px; padding-top: 14px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    @media (max-width: 720px) { .item-head { display: grid; } .item-head span { white-space: normal; } }
    @media print { body { background: #ffffff; } main { width: 100%; padding: 0; } .card { break-inside: avoid; } }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="muted">MR Calligraphy Project Impact Export Audit · ${escapeHtml(formatArchiveDate(exportedAt))}</p>
      <h1>项目档案差异报告导出回执审计</h1>
      <p class="muted">本报告来自当前浏览器保存的差异报告导出回执；它证明浏览器曾生成恢复前审阅 HTML 及摘要，但不代表已经执行恢复。</p>
    </header>
    <section class="stack">${rows}</section>
    <footer>审计数据来源：${escapeHtml(audit.storageKey)}。回执数量：${escapeHtml(audit.total)}。审计摘要：${escapeHtml(audit.auditDigest || "未生成")}。导出时间：${escapeHtml(formatArchiveDate(exportedAt))}。边界：${escapeHtml(audit.boundary)}</footer>
  </main>
</body>
</html>`;
  }

  function formatProjectImpactSourceType(sourceType) {
    return sourceType === "remote-project-repository" ? "远端项目仓库预览" : "本机项目档案预览";
  }

  async function appendRestoreAuditRecord(archive, restoreOptions, hashValidation = {}) {
    try {
      const audit = readRestoreAuditState();
      const record = await createRestoreAuditRecord(archive, restoreOptions, hashValidation);
      audit.records = [record, ...audit.records]
        .slice(0, MAX_RESTORE_AUDIT_RECORDS);
      window.localStorage.setItem(RESTORE_AUDIT_KEY, JSON.stringify({
        version: 1,
        updatedAt: record.createdAt,
        records: audit.records
      }));
      return record;
    } catch (error) {
      return null;
    }
  }

  async function createRestoreAuditRecord(archive, restoreOptions, hashValidation = {}) {
    const createdAt = new Date().toISOString();
    const normalizedOptions = normalizeRestoreOptions(restoreOptions, archive);
    const storageFieldCount = Object.values(normalizedOptions.storageFields)
      .reduce((sum, fields) => sum + fields.length, 0);
    const dbModelCount = Object.values(normalizedOptions.dbRecords)
      .reduce((sum, models) => sum + models.length, 0);
    const summary = summarizeArchive(archive, "项目档案恢复审计", normalizedOptions);
    const record = {
      id: `archive-restore-${createdAt.replace(/[^0-9]/g, "").slice(0, 14)}`,
      type: "project-archive-restore",
      createdAt,
      archiveExportedAt: archive.exportedAt || "",
      archiveSource: archive.source || "",
      storageKeys: normalizedOptions.storageKeys,
      dbIds: normalizedOptions.dbIds,
      storageFields: normalizedOptions.storageFields,
      dbRecords: normalizedOptions.dbRecords,
      storageCount: summary.storageCount,
      modelCount: summary.modelCount,
      modelHashCount: Number(hashValidation.checkedCount || summary.modelHashCount || 0),
      missingHashCount: Number(hashValidation.missingHashCount || 0),
      migrationCount: Array.isArray(archive.migrations) ? archive.migrations.length : 0,
      storageFieldCount,
      dbModelCount,
      digestAlgorithm: RESTORE_AUDIT_DIGEST_ALGORITHM,
      archiveDigest: await createStableJsonSha256(createRestoreAuditArchiveDigestPayload(archive, normalizedOptions)),
      selectionDigest: await createStableJsonSha256({
        storageKeys: normalizedOptions.storageKeys,
        dbIds: normalizedOptions.dbIds,
        storageFields: normalizedOptions.storageFields,
        dbRecords: normalizedOptions.dbRecords
      }),
      message: summary.message
    };
    record.recordDigest = await createStableJsonSha256(record);
    record.id = `archive-restore-${createdAt.replace(/[^0-9]/g, "").slice(0, 14)}-${record.recordDigest.slice(0, 8)}`;
    return record;
  }

  function createRestoreAuditArchiveDigestPayload(archive, normalizedOptions) {
    const selectedStorage = normalizedOptions.storageKeys.map((key) => {
      const item = archive.storage?.[key] || {};
      return {
        key,
        label: item.label || "",
        value: item.value ?? null,
        bytes: Number(item.bytes || 0),
        migratedMissing: item.migratedMissing === true,
        selectedFields: normalizedOptions.storageFields[key] || []
      };
    });
    const selectedDb = DB_ITEMS
      .filter((item) => normalizedOptions.dbIds.includes(item.id))
      .map((item) => {
        const records = Array.isArray(archive.indexedDb?.[item.id]?.records)
          ? filterArchiveDbRecordsBySelection(item, archive.indexedDb[item.id].records, normalizedOptions.dbRecords[item.id])
          : [];
        return {
          id: item.id,
          label: item.label,
          records: records.map((record, index) => summarizeRestoreAuditDbRecord(item, record, index))
        };
      });
    return {
      kind: archive.kind || "",
      version: Number(archive.version || 0),
      exportedAt: archive.exportedAt || "",
      source: archive.source || "",
      storage: selectedStorage,
      indexedDb: selectedDb,
      migrations: normalizeMigrationRecords(archive.migrations || [])
    };
  }

  function summarizeRestoreAuditDbRecord(item, record, index) {
    const model = normalizeDbModelRecord(item, record, index, true);
    return {
      key: model.key,
      label: model.label,
      fileName: model.fileName,
      type: model.type,
      bytes: model.bytes,
      sha256: model.sha256,
      metrics: model.metrics
    };
  }

  function getRestoreAuditLog(limit = MAX_RESTORE_AUDIT_RECORDS) {
    const audit = readRestoreAuditState();
    const safeLimit = Math.max(1, Math.min(MAX_RESTORE_AUDIT_RECORDS, Number(limit) || MAX_RESTORE_AUDIT_RECORDS));
    const verifiedRecords = audit.records.map(addRestoreAuditVerification).filter(Boolean);
    const verifiedCount = verifiedRecords.filter((record) => record.verificationStatus === "verified").length;
    const failedCount = verifiedRecords.filter((record) => record.verificationStatus === "digest-mismatch").length;
    const legacyCount = verifiedRecords.filter((record) => record.verificationStatus === "legacy").length;
    return {
      ok: true,
      storageKey: RESTORE_AUDIT_KEY,
      total: verifiedRecords.length,
      verifiedCount,
      failedCount,
      legacyCount,
      records: verifiedRecords.slice(0, safeLimit),
      message: verifiedRecords.length
        ? `已读取 ${verifiedRecords.length} 条项目档案恢复审计记录，本机校验通过 ${verifiedCount} 条${failedCount ? `，失败 ${failedCount} 条` : ""}${legacyCount ? `，旧记录 ${legacyCount} 条` : ""}。`
        : "还没有项目档案恢复审计记录。"
    };
  }

  function addRestoreAuditVerification(record) {
    const normalized = normalizeRestoreAuditRecord(record);
    if (!normalized) {
      return null;
    }
    const verification = verifyRestoreAuditRecordDigest(normalized);
    return {
      ...normalized,
      verificationStatus: verification.status,
      verificationMessage: verification.message,
      verificationExpectedDigest: verification.expectedDigest
    };
  }

  function verifyRestoreAuditRecordDigest(record = {}) {
    const recordDigest = normalizeSha256(record.recordDigest);
    if (!recordDigest) {
      return {
        status: "legacy",
        expectedDigest: "",
        message: "旧恢复审计记录未生成 recordDigest，无法执行本机一致性校验。"
      };
    }
    const expectedDigest = sha256StableJson(createRestoreAuditRecordVerificationPayload(record));
    const status = expectedDigest === recordDigest ? "verified" : "digest-mismatch";
    const messages = {
      verified: "本机一致性校验通过：recordDigest 与恢复审计声明字段一致。",
      "digest-mismatch": "本机一致性校验失败：recordDigest 无法按恢复审计声明字段重算匹配。"
    };
    return {
      status,
      expectedDigest,
      message: messages[status]
    };
  }

  function createRestoreAuditRecordVerificationPayload(record = {}) {
    const normalized = normalizeRestoreAuditRecord(record) || {};
    const createdAt = normalized.createdAt || "";
    const digestSuffix = normalized.recordDigest ? `-${normalized.recordDigest.slice(0, 8)}` : "";
    const baseId = digestSuffix && normalized.id.endsWith(digestSuffix)
      ? normalized.id.slice(0, -digestSuffix.length)
      : normalized.id || `archive-restore-${createdAt.replace(/[^0-9]/g, "").slice(0, 14)}`;
    return {
      id: baseId,
      type: "project-archive-restore",
      createdAt,
      archiveExportedAt: normalized.archiveExportedAt || "",
      archiveSource: normalized.archiveSource || "",
      storageKeys: normalized.storageKeys || [],
      dbIds: normalized.dbIds || [],
      storageFields: normalized.storageFields || {},
      dbRecords: normalized.dbRecords || {},
      storageCount: Number(normalized.storageCount || 0),
      modelCount: Number(normalized.modelCount || 0),
      modelHashCount: Number(normalized.modelHashCount || 0),
      missingHashCount: Number(normalized.missingHashCount || 0),
      migrationCount: Number(normalized.migrationCount || 0),
      storageFieldCount: Number(normalized.storageFieldCount || 0),
      dbModelCount: Number(normalized.dbModelCount || 0),
      digestAlgorithm: normalized.digestAlgorithm || "",
      archiveDigest: normalized.archiveDigest || "",
      selectionDigest: normalized.selectionDigest || "",
      message: normalized.message || ""
    };
  }

  function formatRestoreAuditVerificationStatus(status) {
    const labels = {
      verified: "本机校验通过",
      "digest-mismatch": "本机校验失败",
      legacy: "旧记录未校验"
    };
    return labels[status] || "本机校验未执行";
  }

  function readRestoreAuditState() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(RESTORE_AUDIT_KEY) || "{}");
      const records = Array.isArray(parsed.records)
        ? parsed.records.map(normalizeRestoreAuditRecord).filter(Boolean)
        : [];
      return {
        version: 1,
        updatedAt: parsed.updatedAt || "",
        records
      };
    } catch (error) {
      return { version: 1, updatedAt: "", records: [] };
    }
  }

  function normalizeRestoreAuditRecord(record) {
    if (!record || typeof record !== "object") {
      return null;
    }
    const createdAt = record.createdAt || "";
    return {
      id: String(record.id || `archive-restore-${createdAt || "unknown"}`),
      type: "project-archive-restore",
      createdAt,
      archiveExportedAt: record.archiveExportedAt || "",
      archiveSource: record.archiveSource || "",
      storageKeys: Array.isArray(record.storageKeys) ? record.storageKeys.map(String) : [],
      dbIds: Array.isArray(record.dbIds) ? record.dbIds.map(String) : [],
      storageFields: record.storageFields && typeof record.storageFields === "object" ? record.storageFields : {},
      dbRecords: record.dbRecords && typeof record.dbRecords === "object" ? record.dbRecords : {},
      storageCount: Number(record.storageCount || 0),
      modelCount: Number(record.modelCount || 0),
      modelHashCount: Number(record.modelHashCount || 0),
      missingHashCount: Number(record.missingHashCount || 0),
      migrationCount: Number(record.migrationCount || 0),
      storageFieldCount: Number(record.storageFieldCount || 0),
      dbModelCount: Number(record.dbModelCount || 0),
      digestAlgorithm: String(record.digestAlgorithm || "").slice(0, 40),
      archiveDigest: normalizeSha256(record.archiveDigest),
      selectionDigest: normalizeSha256(record.selectionDigest),
      recordDigest: normalizeSha256(record.recordDigest),
      message: String(record.message || "")
    };
  }

  function getRestoreAuditExport(options = {}) {
    const audit = getRestoreAuditLog();
    const exportedAt = options.exportedAt || new Date().toISOString();
    const filename = options.filename || `mr-calligraphy-archive-audit-${formatTimestamp(new Date(exportedAt))}.html`;
    const html = createRestoreAuditHtml(audit.records, exportedAt);
    const auditDigest = sha256StableJson({
      storageKey: RESTORE_AUDIT_KEY,
      exportedAt,
      total: audit.total,
      records: audit.records
    });
    return {
      ok: true,
      filename,
      mimeType: "text/html;charset=utf-8",
      html,
      byteLength: html.length,
      audit,
      auditDigest,
      recordCount: audit.records.length,
      message: audit.records.length
        ? `已生成 ${audit.records.length} 条项目档案恢复审计报告：${filename}。`
        : "已生成空的项目档案恢复审计报告。"
    };
  }

  function recordProjectRestoreAuditExportReceipt(payload = {}) {
    try {
      const receipt = createProjectRestoreAuditExportReceipt(payload);
      const state = readProjectRestoreAuditExportState();
      const records = [receipt, ...state.records]
        .filter(Boolean)
        .slice(0, PROJECT_RESTORE_AUDIT_EXPORT_MAX_RECEIPTS);
      writeProjectRestoreAuditExportState({
        version: 1,
        updatedAt: receipt.createdAt,
        records
      });
      return {
        ok: true,
        receipt,
        message: `已记录项目档案恢复审计导出回执：${receipt.filename || "未命名恢复审计报告"}。`
      };
    } catch (error) {
      return {
        ok: false,
        receipt: null,
        message: error?.message || "项目档案恢复审计导出回执记录失败。"
      };
    }
  }

  function createProjectRestoreAuditExportReceipt(payload = {}) {
    const auditExport = payload.auditExport && typeof payload.auditExport === "object"
      ? payload.auditExport
      : getRestoreAuditExport({
        filename: payload.filename,
        exportedAt: payload.exportedAt
      });
    const createdAt = normalizeIsoDate(payload.createdAt || auditExport.exportedAt || payload.exportedAt) || new Date().toISOString();
    const exportedAt = normalizeIsoDate(payload.exportedAt || createdAt) || createdAt;
    const html = String(payload.html || auditExport.html || "");
    const records = Array.isArray(payload.records)
      ? payload.records.map(normalizeRestoreAuditRecord).filter(Boolean)
      : Array.isArray(auditExport.audit?.records)
        ? auditExport.audit.records.map(normalizeRestoreAuditRecord).filter(Boolean)
        : getRestoreAuditLog().records;
    const latest = records[0] || null;
    const totals = records.reduce((summary, record) => {
      summary.storageKeyCount += Array.isArray(record.storageKeys) ? record.storageKeys.length : 0;
      summary.dbStoreCount += Array.isArray(record.dbIds) ? record.dbIds.length : 0;
      summary.fieldCount += Number(record.storageFieldCount || 0);
      summary.modelCount += Number(record.dbModelCount || 0);
      summary.hashCount += Number(record.modelHashCount || 0);
      summary.missingHashCount += Number(record.missingHashCount || 0);
      summary.migrationCount += Number(record.migrationCount || 0);
      return summary;
    }, {
      storageKeyCount: 0,
      dbStoreCount: 0,
      fieldCount: 0,
      modelCount: 0,
      hashCount: 0,
      missingHashCount: 0,
      migrationCount: 0
    });
    const filename = String(payload.filename || auditExport.filename || `mr-calligraphy-archive-audit-${formatTimestamp(new Date(exportedAt))}.html`).slice(0, 180);
    const base = {
      id: `project-restore-audit-export-${createdAt.replace(/[^0-9]/g, "").slice(0, 14)}`,
      kind: PROJECT_RESTORE_AUDIT_EXPORT_KIND,
      type: "project-archive-restore-audit-export",
      version: 1,
      createdAt,
      exportedAt,
      filename,
      mimeType: "text/html;charset=utf-8",
      byteLength: utf8Bytes(html).length,
      fileDigest: sha256Hex(html),
      auditDigest: normalizeSha256(auditExport.auditDigest) || sha256StableJson({
        storageKey: RESTORE_AUDIT_KEY,
        exportedAt,
        total: records.length,
        records
      }),
      restoreRecordCount: records.length,
      latestRestoreRecordId: String(latest?.id || "").slice(0, 180),
      latestRestoreRecordDigest: normalizeSha256(latest?.recordDigest),
      latestArchiveDigest: normalizeSha256(latest?.archiveDigest),
      latestSelectionDigest: normalizeSha256(latest?.selectionDigest),
      latestArchiveSource: String(latest?.archiveSource || "").slice(0, 420),
      latestArchiveExportedAt: normalizeIsoDate(latest?.archiveExportedAt),
      restoredStorageKeyCount: totals.storageKeyCount,
      restoredDbStoreCount: totals.dbStoreCount,
      restoredFieldCount: totals.fieldCount,
      restoredModelCount: totals.modelCount,
      modelHashCount: totals.hashCount,
      missingHashCount: totals.missingHashCount,
      migrationCount: totals.migrationCount,
      boundary: PROJECT_RESTORE_AUDIT_EXPORT_BOUNDARY,
      message: records.length
        ? `已记录 ${records.length} 条恢复记录的项目档案恢复审计 HTML 导出。`
        : "已记录空项目档案恢复审计 HTML 导出。"
    };
    const receiptDigest = sha256StableJson(base);
    return {
      ...base,
      id: `${base.id}-${receiptDigest.slice(0, 8)}`,
      receiptDigest
    };
  }

  function readProjectRestoreAuditExportState() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(PROJECT_RESTORE_AUDIT_EXPORT_KEY) || "{}");
      const records = Array.isArray(parsed.records)
        ? parsed.records.map(normalizeProjectRestoreAuditExportReceipt).filter(Boolean)
        : [];
      return {
        version: 1,
        updatedAt: normalizeIsoDate(parsed.updatedAt),
        records
      };
    } catch (error) {
      return { version: 1, updatedAt: "", records: [] };
    }
  }

  function writeProjectRestoreAuditExportState(state = {}) {
    const records = Array.isArray(state.records)
      ? state.records.map(normalizeProjectRestoreAuditExportReceipt).filter(Boolean).slice(0, PROJECT_RESTORE_AUDIT_EXPORT_MAX_RECEIPTS)
      : [];
    const normalized = {
      version: 1,
      updatedAt: normalizeIsoDate(state.updatedAt) || records[0]?.createdAt || "",
      records
    };
    window.localStorage.setItem(PROJECT_RESTORE_AUDIT_EXPORT_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function normalizeProjectRestoreAuditExportReceipt(record) {
    if (!record || typeof record !== "object") {
      return null;
    }
    const createdAt = normalizeIsoDate(record.createdAt || record.exportedAt) || "";
    const exportedAt = normalizeIsoDate(record.exportedAt || record.createdAt) || createdAt;
    const filename = String(record.filename || "").trim().slice(0, 180);
    const fileDigest = normalizeSha256(record.fileDigest);
    const auditDigest = normalizeSha256(record.auditDigest);
    const receiptDigest = normalizeSha256(record.receiptDigest || record.recordDigest);
    if (!filename && !fileDigest && !auditDigest && !createdAt) {
      return null;
    }
    return {
      id: String(record.id || `project-restore-audit-export-${createdAt || filename || "record"}`).slice(0, 180),
      kind: PROJECT_RESTORE_AUDIT_EXPORT_KIND,
      type: "project-archive-restore-audit-export",
      version: 1,
      createdAt,
      exportedAt,
      filename,
      mimeType: String(record.mimeType || "text/html;charset=utf-8").slice(0, 120),
      byteLength: Math.max(0, Math.round(Number(record.byteLength || 0))),
      fileDigest,
      auditDigest,
      restoreRecordCount: Math.max(0, Math.round(Number(record.restoreRecordCount || 0))),
      latestRestoreRecordId: String(record.latestRestoreRecordId || "").slice(0, 180),
      latestRestoreRecordDigest: normalizeSha256(record.latestRestoreRecordDigest),
      latestArchiveDigest: normalizeSha256(record.latestArchiveDigest),
      latestSelectionDigest: normalizeSha256(record.latestSelectionDigest),
      latestArchiveSource: String(record.latestArchiveSource || "").slice(0, 420),
      latestArchiveExportedAt: normalizeIsoDate(record.latestArchiveExportedAt),
      restoredStorageKeyCount: Math.max(0, Math.round(Number(record.restoredStorageKeyCount || 0))),
      restoredDbStoreCount: Math.max(0, Math.round(Number(record.restoredDbStoreCount || 0))),
      restoredFieldCount: Math.max(0, Math.round(Number(record.restoredFieldCount || 0))),
      restoredModelCount: Math.max(0, Math.round(Number(record.restoredModelCount || 0))),
      modelHashCount: Math.max(0, Math.round(Number(record.modelHashCount || 0))),
      missingHashCount: Math.max(0, Math.round(Number(record.missingHashCount || 0))),
      migrationCount: Math.max(0, Math.round(Number(record.migrationCount || 0))),
      boundary: String(record.boundary || PROJECT_RESTORE_AUDIT_EXPORT_BOUNDARY).slice(0, 420),
      message: String(record.message || "").slice(0, 260),
      receiptDigest
    };
  }

  function getProjectRestoreAuditExportAudit(options = {}) {
    const limit = Math.max(1, Math.min(PROJECT_RESTORE_AUDIT_EXPORT_MAX_RECEIPTS, Number(options.limit) || PROJECT_RESTORE_AUDIT_EXPORT_MAX_RECEIPTS));
    const auditState = readProjectRestoreAuditExportState();
    const records = auditState.records.slice(0, limit).map(cloneJsonValue);
    const audit = {
      ok: true,
      kind: PROJECT_RESTORE_AUDIT_EXPORT_KIND,
      generatedAt: new Date().toISOString(),
      storageKey: PROJECT_RESTORE_AUDIT_EXPORT_KEY,
      total: auditState.records.length,
      exportedCount: records.length,
      limit,
      latestReceipt: records[0] || null,
      records,
      boundary: PROJECT_RESTORE_AUDIT_EXPORT_BOUNDARY,
      message: auditState.records.length
        ? `已记录 ${auditState.records.length} 条项目档案恢复审计导出回执，最近一次：${formatArchiveDate(auditState.records[0].exportedAt || auditState.records[0].createdAt)}。`
        : "暂无项目档案恢复审计导出回执。"
    };
    audit.auditDigest = sha256StableJson({
      ...audit,
      auditDigest: ""
    });
    return audit;
  }

  function getProjectRestoreAuditExportAuditExport(options = {}) {
    const audit = getProjectRestoreAuditExportAudit(options);
    if (!audit.total) {
      return {
        ok: false,
        audit,
        message: audit.message || "暂无可导出的项目档案恢复审计导出回执。"
      };
    }
    const exportedAt = options.exportedAt || new Date().toISOString();
    const filename = options.filename || `mr-calligraphy-project-restore-audit-export-audit-${formatTimestamp(new Date(exportedAt))}.html`;
    const html = createProjectRestoreAuditExportAuditHtml(audit, exportedAt);
    return {
      ok: true,
      filename,
      mimeType: "text/html;charset=utf-8",
      html,
      byteLength: html.length,
      audit,
      recordCount: audit.exportedCount,
      message: `已生成 ${audit.exportedCount} 条项目档案恢复审计导出回执审计报告：${filename}。`
    };
  }

  function downloadProjectRestoreAuditExportAudit(options = {}) {
    const result = getProjectRestoreAuditExportAuditExport(options);
    if (!result.ok) {
      return result;
    }
    downloadHtml(result.html, result.filename);
    return {
      ok: true,
      filename: result.filename,
      byteLength: result.byteLength,
      recordCount: result.recordCount,
      message: `已下载项目档案恢复审计导出回执审计报告：${result.filename}。`
    };
  }

  function createProjectRestoreAuditExportAuditHtml(audit, exportedAt) {
    const rows = audit.records.map((record) => `<article class="card">
      <div class="item-head">
        <h2>${escapeHtml(record.filename || "项目档案恢复审计报告")}</h2>
        <span>${escapeHtml(formatBytes(record.byteLength))}</span>
      </div>
      <p>${escapeHtml(record.message || "已生成项目档案恢复审计 HTML。")}</p>
      <ul>
        <li>导出时间：${escapeHtml(formatArchiveDate(record.exportedAt || record.createdAt))}</li>
        <li>恢复记录数：${escapeHtml(record.restoreRecordCount)}</li>
        <li>最近恢复记录：${escapeHtml(record.latestRestoreRecordId || "无")}</li>
        <li>档案来源：${escapeHtml(record.latestArchiveSource || "未知")}</li>
        <li>恢复配置 / 模型库 / 字段 / 模型：${escapeHtml(record.restoredStorageKeyCount)} / ${escapeHtml(record.restoredDbStoreCount)} / ${escapeHtml(record.restoredFieldCount)} / ${escapeHtml(record.restoredModelCount)}</li>
        <li>资产哈希 / 缺哈希 / 迁移：${escapeHtml(record.modelHashCount)} / ${escapeHtml(record.missingHashCount)} / ${escapeHtml(record.migrationCount)}</li>
        <li>文件摘要：${escapeHtml(record.fileDigest || "未生成")}</li>
        <li>审计报告摘要：${escapeHtml(record.auditDigest || "未生成")}</li>
        <li>最近恢复摘要：${escapeHtml(record.latestRestoreRecordDigest || "未生成")}</li>
        <li>最近档案摘要：${escapeHtml(record.latestArchiveDigest || "未生成")}</li>
        <li>最近选择摘要：${escapeHtml(record.latestSelectionDigest || "未生成")}</li>
        <li>回执摘要：${escapeHtml(record.receiptDigest || "未生成")}</li>
      </ul>
      <pre>${escapeHtml(JSON.stringify(record, null, 2))}</pre>
    </article>`).join("");

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MR 书法项目档案恢复审计导出回执审计</title>
  <style>
    :root { color-scheme: light; --ink:#17221f; --muted:#61706a; --line:#dbe8e2; --jade:#247a67; --paper:#fbf7ee; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--paper); font: 14px/1.62 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; }
    main { width: min(980px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 44px; }
    header { display: grid; gap: 10px; padding-bottom: 18px; border-bottom: 2px solid var(--ink); }
    h1, h2, p { margin: 0; }
    h1 { font-size: clamp(28px, 5vw, 46px); line-height: 1.08; }
    h2 { font-size: 16px; overflow-wrap: anywhere; }
    .muted { color: var(--muted); }
    .stack { display: grid; gap: 12px; margin-top: 22px; }
    .card { display: grid; gap: 8px; padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    .item-head { display: flex; gap: 10px; justify-content: space-between; align-items: baseline; }
    .item-head span { color: var(--jade); font-weight: 800; white-space: nowrap; }
    ul { display: grid; gap: 4px; margin: 0; padding-left: 18px; color: var(--muted); overflow-wrap: anywhere; }
    pre { max-height: 260px; margin: 6px 0 0; padding: 10px; overflow: auto; border: 1px solid var(--line); border-radius: 6px; background: #f7faf8; color: #24332f; white-space: pre-wrap; word-break: break-word; }
    footer { margin-top: 24px; padding-top: 14px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    @media (max-width: 720px) { .item-head { display: grid; } .item-head span { white-space: normal; } }
    @media print { body { background: #ffffff; } main { width: 100%; padding: 0; } .card { break-inside: avoid; } }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="muted">MR Calligraphy Project Restore Audit Export Receipt · ${escapeHtml(formatArchiveDate(exportedAt))}</p>
      <h1>项目档案恢复审计导出回执审计</h1>
      <p class="muted">本报告来自当前浏览器保存的恢复审计导出回执；它证明浏览器曾生成恢复审计 HTML 及摘要，但不代表操作系统已经保存文件或服务端已归档。</p>
    </header>
    <section class="stack">${rows}</section>
    <footer>审计数据来源：${escapeHtml(audit.storageKey)}。回执数量：${escapeHtml(audit.total)}。审计摘要：${escapeHtml(audit.auditDigest || "未生成")}。导出时间：${escapeHtml(formatArchiveDate(exportedAt))}。边界：${escapeHtml(audit.boundary)}</footer>
  </main>
</body>
</html>`;
  }

  function downloadRestoreAuditLog(options = {}) {
    const result = getRestoreAuditExport(options);
    downloadHtml(result.html, result.filename);
    const receiptResult = recordProjectRestoreAuditExportReceipt({
      auditExport: result,
      html: result.html,
      filename: result.filename,
      exportedAt: options.exportedAt || new Date().toISOString()
    });
    return {
      ok: true,
      filename: result.filename,
      byteLength: result.byteLength,
      recordCount: result.recordCount,
      exportReceipt: receiptResult.receipt || null,
      message: receiptResult.ok
        ? `已下载项目档案恢复审计报告：${result.filename}，并写入导出回执。`
        : `已下载项目档案恢复审计报告：${result.filename}。${receiptResult.message || "导出回执记录失败。"}`
    };
  }

  function createRestoreAuditHtml(records, exportedAt) {
    const rows = records.length
      ? records.map((record) => `<article class="card">
        <div class="item-head"><h2>${escapeHtml(formatArchiveDate(record.createdAt))}</h2><span>${escapeHtml(record.storageCount)} 配置 / ${escapeHtml(record.modelCount)} 资产</span></div>
        <p>${escapeHtml(record.message || "项目档案恢复完成。")}</p>
        <ul>
          <li>档案时间：${escapeHtml(formatArchiveDate(record.archiveExportedAt))}</li>
          <li>档案来源：${escapeHtml(record.archiveSource || "未知")}</li>
          <li>恢复配置：${escapeHtml(record.storageKeys.join("、") || "无")}</li>
          <li>恢复模型库：${escapeHtml(record.dbIds.join("、") || "无")}</li>
          <li>字段级选择：${escapeHtml(record.storageFieldCount)}；资产级选择：${escapeHtml(record.dbModelCount)}</li>
          <li>资产哈希：${escapeHtml(record.modelHashCount)}；缺哈希：${escapeHtml(record.missingHashCount)}；迁移记录：${escapeHtml(record.migrationCount)}</li>
          <li>摘要算法：${escapeHtml(record.digestAlgorithm || "旧记录未生成")}</li>
          <li>档案摘要：${escapeHtml(record.archiveDigest || "旧记录未生成")}</li>
          <li>选择摘要：${escapeHtml(record.selectionDigest || "旧记录未生成")}</li>
          <li>审计摘要：${escapeHtml(record.recordDigest || "旧记录未生成")}</li>
          <li>本机校验：${escapeHtml(formatRestoreAuditVerificationStatus(record.verificationStatus))}</li>
          <li>重算摘要：${escapeHtml(record.verificationExpectedDigest || "旧记录未生成")}</li>
          <li>校验说明：${escapeHtml(record.verificationMessage || "本机校验未执行")}</li>
        </ul>
        <pre>${escapeHtml(JSON.stringify(record, null, 2))}</pre>
      </article>`).join("")
      : `<article class="card"><p class="muted">暂无项目档案恢复审计记录。</p></article>`;

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MR 书法项目档案恢复审计</title>
  <style>
    :root { color-scheme: light; --ink:#17221f; --muted:#61706a; --line:#dbe8e2; --jade:#247a67; --paper:#fbf7ee; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--paper); font: 14px/1.62 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; }
    main { width: min(960px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 44px; }
    header { display: grid; gap: 10px; padding-bottom: 18px; border-bottom: 2px solid var(--ink); }
    h1, h2, p { margin: 0; }
    h1 { font-size: clamp(28px, 5vw, 48px); line-height: 1.08; }
    h2 { font-size: 16px; }
    .muted { color: var(--muted); }
    .stack { display: grid; gap: 12px; margin-top: 22px; }
    .card { display: grid; gap: 8px; padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    .item-head { display: flex; gap: 10px; justify-content: space-between; align-items: baseline; }
    .item-head span { color: var(--jade); font-weight: 800; }
    ul { display: grid; gap: 4px; margin: 0; padding-left: 18px; color: var(--muted); }
    pre { margin: 4px 0 0; padding: 10px; overflow: auto; border-radius: 6px; background: #17221f; color: #f7fbf8; font-size: 11px; line-height: 1.45; }
    footer { margin-top: 24px; padding-top: 14px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    @media print { body { background: #ffffff; } main { width: 100%; padding: 0; } .card { break-inside: avoid; } }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="muted">MR Calligraphy Project Archive Audit · ${escapeHtml(formatArchiveDate(exportedAt))}</p>
      <h1>项目档案恢复审计</h1>
      <p class="muted">本报告来自当前浏览器本机审计记录，只记录恢复成功后的项目档案恢复范围，并按 recordDigest 重算本机一致性校验。</p>
    </header>
    <section class="stack">${rows}</section>
    <footer>审计数据来源：${escapeHtml(RESTORE_AUDIT_KEY)}。导出时间：${escapeHtml(formatArchiveDate(exportedAt))}。</footer>
  </main>
</body>
</html>`;
  }

  function getImportImpactReport(preview, options = {}) {
    if (!preview || typeof preview !== "object" || !preview.summary || !Array.isArray(preview.storage)) {
      return {
        ok: false,
        message: "还没有可导出的项目档案差异报告。请先选择并校验项目档案。"
      };
    }

    const exportedAt = options.exportedAt || new Date().toISOString();
    const filename = options.filename || `mr-calligraphy-archive-impact-${formatTimestamp(new Date(exportedAt))}.html`;
    const html = createImportImpactReportHtml(preview, {
      exportedAt,
      restoreOptions: options.restoreOptions || null
    });
    return {
      ok: true,
      filename,
      mimeType: "text/html;charset=utf-8",
      html,
      byteLength: html.length,
      message: `已生成项目档案导入差异报告：${filename}。`
    };
  }

  function downloadImportImpactReport(preview, options = {}) {
    const result = getImportImpactReport(preview, options);
    if (!result.ok) {
      return result;
    }
    downloadHtml(result.html, result.filename);
    const receiptResult = recordProjectImpactExportReceipt({
      preview,
      restoreOptions: options.restoreOptions || null,
      filename: result.filename,
      html: result.html,
      exportedAt: options.exportedAt || new Date().toISOString()
    });
    return {
      ok: true,
      filename: result.filename,
      byteLength: result.byteLength,
      exportReceipt: receiptResult.receipt || null,
      message: receiptResult.ok
        ? `已下载项目档案导入差异报告：${result.filename}，并写入导出回执。`
        : `已下载项目档案导入差异报告：${result.filename}。${receiptResult.message || "导出回执记录失败。"}`
    };
  }

  function createImportImpactReportHtml(preview, options = {}) {
    const exportedAt = options.exportedAt || new Date().toISOString();
    const summary = preview.summary || {};
    const schema = preview.schemaSummary || {};
    const restorePlan = createImpactRestorePlan(preview, options.restoreOptions);
    const storageRows = (preview.storage || []).map((item) => createImpactStorageSection(item, restorePlan)).join("");
    const dbRows = (preview.indexedDb || []).map((item) => createImpactDbSection(item, restorePlan)).join("");
    const remote = preview.remoteRepository || null;
    const migrationRows = (preview.migrations || []).length
      ? `<section><h2>迁移记录</h2><ul class="list">${preview.migrations.map((migration) => `<li><strong>${escapeHtml(migration.target || migration.type || "迁移")}</strong><span>${escapeHtml(migration.message || "")}</span></li>`).join("")}</ul></section>`
      : "";
    const remoteRows = remote
      ? `<section class="card plan">
          <h2>远端项目仓库版本</h2>
          <p>${escapeHtml(remote.packageId || remote.sourcePackageId || "未命名包")} · Workspace ${escapeHtml(remote.workspaceId || PROJECT_REPOSITORY_DEFAULT_WORKSPACE)} · ${escapeHtml(remote.remoteVersion || "远端版本未知")}</p>
          <p class="muted">包摘要：${escapeHtml(remote.packageDigest || "未知")}；仓库摘要：${escapeHtml(remote.repositoryDigest || "未知")}；历史版本：${escapeHtml(remote.versionCount || 0)}；模型：${escapeHtml(remote.importedModels || 0)}；贴图：${escapeHtml(remote.textureAssets || 0)}。</p>
          <p class="conflict">${escapeHtml(remote.riskLabel || "风险未知")}：${escapeHtml(remote.riskText || "暂无风险说明。")}</p>
          <p class="muted">${escapeHtml(remote.boundary || PROJECT_REPOSITORY_REMOTE_BOUNDARY)}</p>
        </section>`
      : "";
    const selectedText = restorePlan.selectedCount
      ? `${restorePlan.selectedStorageCount} 组本机配置 / ${restorePlan.selectedDbCount} 个模型库 / ${restorePlan.selectedFieldCount} 个字段 / ${restorePlan.selectedModelCount} 个模型`
      : "尚未选择恢复项，仅导出差异预览";

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MR 书法项目档案导入差异报告</title>
  <style>
    :root { color-scheme: light; --ink:#17221f; --muted:#61706a; --line:#dbe8e2; --jade:#247a67; --paper:#fbf7ee; --warn:#8a5b11; --danger:#9d3027; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--paper); font: 14px/1.62 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; }
    main { width: min(1040px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 44px; }
    header { display: grid; gap: 10px; padding-bottom: 18px; border-bottom: 2px solid var(--ink); }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: clamp(28px, 5vw, 48px); line-height: 1.08; }
    h2 { margin-bottom: 10px; font-size: 18px; }
    h3 { font-size: 14px; }
    section { margin-top: 22px; }
    .meta, .muted { color: var(--muted); }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 16px; }
    .stat, .card { border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    .stat { padding: 14px; }
    .stat span { display: block; color: var(--muted); font-size: 12px; }
    .stat strong { display: block; margin-top: 4px; font-size: 24px; line-height: 1.1; }
    .plan { padding: 14px; background: #fffdf8; }
    .stack { display: grid; gap: 10px; }
    .card { display: grid; gap: 8px; padding: 14px; }
    .card[data-change="remove"] { border-color: rgba(157, 48, 39, 0.35); }
    .card[data-change="add"], .card[data-change="update"], .card[data-change="replace"] { border-color: rgba(36, 122, 103, 0.35); }
    .item-head { display: flex; gap: 10px; justify-content: space-between; align-items: baseline; }
    .badge { display: inline-flex; align-items: center; min-height: 22px; padding: 0 8px; border-radius: 99px; color: #ffffff; background: var(--jade); font-size: 12px; font-weight: 700; }
    .badge.remove { background: var(--danger); }
    .badge.same, .badge.empty, .badge.same-count { color: var(--muted); background: #eef3f0; }
    .list { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
    .list li { display: grid; gap: 2px; padding: 10px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; }
    .fields, .models { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
    .fields li, .models li { padding: 8px; border: 1px solid var(--line); border-radius: 6px; background: #fbfdfb; }
    .fields li[data-selected="true"], .models li[data-selected="true"] { border-color: rgba(36, 122, 103, 0.4); background: #eef8f3; }
    .conflict { color: var(--warn); font-weight: 700; }
    pre { max-height: 220px; margin: 6px 0 0; padding: 8px; overflow: auto; border: 1px solid var(--line); border-radius: 6px; background: #f7faf8; color: #24332f; white-space: pre-wrap; word-break: break-word; }
    footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    @media (max-width: 760px) { main { width: min(100% - 20px, 1040px); padding-top: 22px; } .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .item-head { display: grid; } }
    @media print { body { background: #ffffff; } main { width: 100%; padding: 0; } .card, .stat, .list li { break-inside: avoid; } }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="meta">MR Calligraphy Project Archive Impact · ${escapeHtml(formatArchiveDate(exportedAt))}</p>
      <h1>项目档案导入差异报告</h1>
      <p class="muted">本报告只用于审阅导入影响，不会恢复或覆盖任何本机数据。恢复动作仍需在主后台手动确认。</p>
    </header>

    <div class="grid">
      <div class="stat"><span>新增配置</span><strong>${escapeHtml(summary.storageAdded || 0)}</strong></div>
      <div class="stat"><span>覆盖配置</span><strong>${escapeHtml(summary.storageUpdated || 0)}</strong></div>
      <div class="stat"><span>清空配置</span><strong>${escapeHtml(summary.storageRemoved || 0)}</strong></div>
      <div class="stat"><span>档案资产</span><strong>${escapeHtml(summary.incomingModelCount || 0)}</strong></div>
    </div>

    ${remoteRows}

    <section class="card plan">
      <h2>恢复选择</h2>
      <p>${escapeHtml(selectedText)}</p>
      <p class="muted">档案时间：${escapeHtml(formatArchiveDate(preview.exportedAt))}；来源：${escapeHtml(preview.source || "未知")}；schema v${escapeHtml(schema.version || "-")}；资产哈希 ${escapeHtml(summary.assetHashCount || 0)}，缺哈希 ${escapeHtml(summary.missingAssetHashCount || 0)}。</p>
    </section>

    ${migrationRows}

    <section>
      <h2>本机配置差异</h2>
      <div class="stack">${storageRows || `<article class="card"><p class="muted">没有可展示的本机配置差异。</p></article>`}</div>
    </section>

    <section>
      <h2>IndexedDB 模型差异</h2>
      <div class="stack">${dbRows || `<article class="card"><p class="muted">没有可展示的模型差异。</p></article>`}</div>
    </section>

    <footer>报告生成时间：${escapeHtml(formatArchiveDate(exportedAt))}。导入前请确认覆盖范围；含模型二进制的档案仍会在恢复前执行 SHA-256 校验。</footer>
  </main>
</body>
</html>`;
  }

  function createImpactRestorePlan(preview, restoreOptions) {
    const storageKeys = new Set(Array.isArray(restoreOptions?.storageKeys) ? restoreOptions.storageKeys : []);
    const dbIds = new Set(Array.isArray(restoreOptions?.dbIds) ? restoreOptions.dbIds : []);
    const storageFields = restoreOptions?.storageFields && typeof restoreOptions.storageFields === "object" ? restoreOptions.storageFields : {};
    const dbRecords = restoreOptions?.dbRecords && typeof restoreOptions.dbRecords === "object" ? restoreOptions.dbRecords : {};
    const selectedFieldCount = Object.values(storageFields).reduce((sum, fields) => sum + (Array.isArray(fields) ? fields.length : 0), 0);
    const selectedModelCount = Object.values(dbRecords).reduce((sum, models) => sum + (Array.isArray(models) ? models.length : 0), 0);
    return {
      storageKeys,
      dbIds,
      storageFields,
      dbRecords,
      selectedStorageCount: storageKeys.size,
      selectedDbCount: dbIds.size,
      selectedFieldCount,
      selectedModelCount,
      selectedCount: storageKeys.size + dbIds.size,
      storageTotal: Array.isArray(preview.storage) ? preview.storage.length : 0,
      dbTotal: Array.isArray(preview.indexedDb) ? preview.indexedDb.length : 0
    };
  }

  function createImpactStorageSection(item, restorePlan) {
    const selected = restorePlan.storageKeys.has(item.id);
    const selectedFields = new Set((restorePlan.storageFields[item.id] || []).map((field) => `${field.action}:${field.path}`));
    const fieldItems = Array.isArray(item.fieldSelections) && item.fieldSelections.length
      ? item.fieldSelections.map((field) => {
          const fieldSelected = selectedFields.size ? selectedFields.has(`${field.action}:${field.path}`) : selected;
          return `<li data-selected="${fieldSelected ? "true" : "false"}"><strong>${escapeHtml(field.label)}</strong><span>${escapeHtml(field.impact)} · ${escapeHtml(field.detail)}</span>${createImpactPreviewBlocks(field.currentPreview, field.incomingPreview)}</li>`;
        }).join("")
      : (item.fieldDiffs || []).map((fieldDiff) => `<li><span>${escapeHtml(fieldDiff)}</span></li>`).join("");
    const fieldList = fieldItems ? `<ul class="fields">${fieldItems}</ul>` : "";
    return `<article class="card" data-change="${escapeAttr(item.change || "normal")}">
      <div class="item-head"><h3>${escapeHtml(item.label)}</h3><span class="badge ${escapeAttr(item.change || "")}">${escapeHtml(getImpactChangeLabel(item.change))}${selected ? " · 已选择" : ""}</span></div>
      <p class="muted">${escapeHtml(describeStorageChange(item))}</p>
      ${item.fieldDiffSummary ? `<p>${escapeHtml(item.fieldDiffSummary)}</p>` : ""}
      ${item.fieldImpactSummary ? `<p class="conflict">${escapeHtml(item.fieldImpactSummary)}</p>` : ""}
      ${fieldList}
      ${item.migrationNote ? `<p class="muted">${escapeHtml(item.migrationNote)}</p>` : ""}
    </article>`;
  }

  function createImpactDbSection(item, restorePlan) {
    const selected = restorePlan.dbIds.has(item.id);
    const selectedModels = new Map((restorePlan.dbRecords[item.id] || []).map((model) => [`${model.action}:${model.key}`, model]));
    const modelItems = Array.isArray(item.modelSelections) && item.modelSelections.length
      ? item.modelSelections.map((model) => {
          const modelSelected = selectedModels.size ? selectedModels.has(`${model.action}:${model.key}`) : selected;
          const selection = selectedModels.get(`${model.action}:${model.key}`);
          const conflictText = model.conflictSummary
            ? `<span class="conflict">${escapeHtml(model.conflictSummary)}${selection?.conflictMode ? ` · 选择：${escapeHtml(formatConflictMode(selection.conflictMode, selection.customLabel))}` : ""}</span>`
            : "";
          return `<li data-selected="${modelSelected ? "true" : "false"}"><strong>${escapeHtml(model.label)}</strong><span>${escapeHtml(model.detail || model.key)}</span>${conflictText}${createImpactPreviewBlocks(model.currentPreview, model.incomingPreview)}</li>`;
        }).join("")
      : (item.modelDiffs || []).map((modelDiff) => `<li><span>${escapeHtml(modelDiff)}</span></li>`).join("");
    const modelList = modelItems ? `<ul class="models">${modelItems}</ul>` : "";
    return `<article class="card" data-change="${escapeAttr(item.change || "normal")}">
      <div class="item-head"><h3>${escapeHtml(item.label)}</h3><span class="badge ${escapeAttr(item.change || "")}">${escapeHtml(getImpactChangeLabel(item.change))}${selected ? " · 已选择" : ""}</span></div>
      <p class="muted">${escapeHtml(describeDbChange(item))}</p>
      ${item.modelDiffSummary ? `<p>${escapeHtml(item.modelDiffSummary)}</p>` : ""}
      ${modelList}
      ${item.migrationNote ? `<p class="muted">${escapeHtml(item.migrationNote)}</p>` : ""}
    </article>`;
  }

  function createImpactPreviewBlocks(currentPreview, incomingPreview) {
    if (!currentPreview && !incomingPreview) {
      return "";
    }
    return `<details><summary>查看片段</summary><pre>当前本机\n${escapeHtml(currentPreview || "无")}</pre><pre>导入档案\n${escapeHtml(incomingPreview || "无")}</pre></details>`;
  }

  function getImpactChangeLabel(change) {
    const labels = {
      add: "新增",
      update: "覆盖",
      replace: "替换",
      remove: "清空",
      same: "相同",
      empty: "空",
      "same-count": "数量相同"
    };
    return labels[change] || "变更";
  }

  function formatConflictMode(mode, customLabel = "") {
    if (mode === "replace") return "替换本机同名模型";
    if (mode === "custom") return `自定义名称${customLabel ? `：${customLabel}` : ""}`;
    return "自动改名";
  }

  function downloadJson(data, filename) {
    downloadJsonPayload(JSON.stringify(data, null, 2), filename);
  }

  function downloadJsonPayload(payload, filename) {
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

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function formatTimestamp(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join("") + "-" + [
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds())
    ].join("");
  }

  function formatArchiveDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "导出时间未知";
    }

    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatBytes(bytes) {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function describeStorageChange(item) {
    const labels = {
      add: "新增",
      update: "覆盖",
      remove: "清空",
      same: "不变",
      empty: "保持为空"
    };

    return `${labels[item.change] || "未知"} · 当前 ${formatBytes(item.currentBytes)} → 档案 ${formatBytes(item.incomingBytes)}`;
  }

  function describeDbChange(item) {
    const label = item.change === "replace" ? "替换" : "数量相同";
    const hashDetail = item.incomingBinaryCount
      ? ` · 哈希 ${item.incomingHashCount}/${item.incomingBinaryCount}${item.missingHashCount ? `，${item.missingHashCount} 个旧资产缺少哈希` : ""}`
      : "";
    return `${label} · 当前 ${item.currentCount} 个 → 档案 ${item.incomingCount} 个${hashDetail}`;
  }

  function bindProjectArchiveControls() {
    const exportButton = document.getElementById("projectExportButton");
    const importFile = document.getElementById("projectImportFile");
    const status = document.getElementById("projectArchiveStatus");
    const exportAuditStatus = document.getElementById("projectArchiveExportAuditStatus");
    const exportAuditList = document.getElementById("projectArchiveExportAuditList");
    const exportAuditButton = document.getElementById("projectArchiveExportAuditExport");
    const previewBox = document.getElementById("projectImportPreview");
    const previewTitle = document.getElementById("projectImportPreviewTitle");
    const previewMeta = document.getElementById("projectImportPreviewMeta");
    const previewSource = document.getElementById("projectImportPreviewSource");
    const previewList = document.getElementById("projectImportPreviewList");
    const selectAllInput = document.getElementById("projectImportSelectAll");
    const selectionStatus = document.getElementById("projectImportSelectionStatus");
    const confirmButton = document.getElementById("projectImportConfirm");
    const impactButton = document.getElementById("projectImportExportImpact");
    const cancelButton = document.getElementById("projectImportCancel");
    const auditStatus = document.getElementById("projectAuditStatus");
    const auditList = document.getElementById("projectAuditList");
    const auditExportButton = document.getElementById("projectAuditExport");
    const restoreAuditExportAuditStatus = document.getElementById("projectRestoreAuditExportAuditStatus");
    const restoreAuditExportAuditList = document.getElementById("projectRestoreAuditExportAuditList");
    const restoreAuditExportAuditButton = document.getElementById("projectRestoreAuditExportAuditExport");
    const impactExportAuditStatus = document.getElementById("projectImpactExportAuditStatus");
    const impactExportAuditList = document.getElementById("projectImpactExportAuditList");
    const impactExportAuditButton = document.getElementById("projectImpactExportAuditExport");
    const repositoryStatus = document.getElementById("projectRepositoryStatus");
    const repositoryList = document.getElementById("projectRepositoryList");
    const repositoryExportButton = document.getElementById("projectRepositoryExportButton");
    const repositoryExportAuditStatus = document.getElementById("projectRepositoryExportAuditStatus");
    const repositoryExportAuditList = document.getElementById("projectRepositoryExportAuditList");
    const repositoryExportAuditButton = document.getElementById("projectRepositoryExportAuditExport");
    const repositoryRefreshButton = document.getElementById("projectRepositoryRefresh");
    const repositoryRemoteStatus = document.getElementById("projectRepositoryRemoteStatus");
    const repositoryEndpointInput = document.getElementById("projectRepositoryEndpoint");
    const repositoryTokenInput = document.getElementById("projectRepositoryToken");
    const repositoryWorkspaceInput = document.getElementById("projectRepositoryWorkspace");
    const repositoryRemoteSaveButton = document.getElementById("projectRepositorySaveRemote");
    const repositoryRemoteCheckButton = document.getElementById("projectRepositoryCheckRemote");
    const repositoryRemotePushButton = document.getElementById("projectRepositoryPushRemote");
    const repositoryRemotePullButton = document.getElementById("projectRepositoryPullRemote");
    const repositoryVersionSelect = document.getElementById("projectRepositoryVersionSelect");
    const repositoryReceiptStatus = document.getElementById("projectRepositoryReceiptStatus");
    const repositoryReceiptList = document.getElementById("projectRepositoryReceiptList");
    const repositoryReceiptExportButton = document.getElementById("projectRepositoryReceiptExport");

    if (!exportButton && !importFile) return;

    let pendingArchive = null;
    let pendingPreview = null;
    let isBusy = false;

    const setStatus = (message, tone = "normal") => {
      if (!status) return;
      status.textContent = message;
      status.dataset.tone = tone;
    };

    const setBusy = (busy) => {
      isBusy = Boolean(busy);
      if (exportButton) exportButton.disabled = isBusy;
      if (importFile) importFile.disabled = isBusy;
      if (exportAuditButton) exportAuditButton.disabled = isBusy || !getProjectArchiveExportAudit({ limit: 1 }).total;
      if (impactButton) impactButton.disabled = isBusy || !pendingPreview;
      if (auditExportButton) auditExportButton.disabled = isBusy || !getRestoreAuditLog(1).records.length;
      if (restoreAuditExportAuditButton) restoreAuditExportAuditButton.disabled = isBusy || !getProjectRestoreAuditExportAudit({ limit: 1 }).total;
      if (impactExportAuditButton) impactExportAuditButton.disabled = isBusy || !getProjectImpactExportAudit({ limit: 1 }).total;
      if (repositoryExportButton) repositoryExportButton.disabled = isBusy;
      if (repositoryExportAuditButton) repositoryExportAuditButton.disabled = isBusy || !getProjectRepositoryExportAudit({ limit: 1 }).total;
      if (repositoryRefreshButton) repositoryRefreshButton.disabled = isBusy;
      if (repositoryRemoteSaveButton) repositoryRemoteSaveButton.disabled = isBusy;
      if (repositoryRemoteCheckButton) repositoryRemoteCheckButton.disabled = isBusy;
      if (repositoryRemotePushButton) repositoryRemotePushButton.disabled = isBusy;
      if (repositoryRemotePullButton) repositoryRemotePullButton.disabled = isBusy;
      if (repositoryWorkspaceInput) repositoryWorkspaceInput.disabled = isBusy;
      if (repositoryReceiptExportButton) repositoryReceiptExportButton.disabled = isBusy || !getProjectRepositoryReceiptAudit().total;
      if (repositoryVersionSelect) repositoryVersionSelect.disabled = isBusy || !repositoryVersionSelect.options.length || !repositoryVersionSelect.value;
      if (cancelButton) cancelButton.disabled = isBusy || !pendingArchive;
      updateRestoreSelectionState();
    };

    const getRestoreInputs = () => Array.from(previewList?.querySelectorAll("[data-archive-kind][data-archive-id]") || []);
    const getFieldInputs = () => Array.from(previewList?.querySelectorAll("[data-storage-field-key][data-storage-field-path]") || []);
    const getModelInputs = () => Array.from(previewList?.querySelectorAll("[data-db-model-id][data-db-model-key]") || []);
    const getModelConflictInputs = () => Array.from(previewList?.querySelectorAll("[data-db-model-id][data-db-model-conflict-for]") || []);
    const getModelCustomLabelInputs = () => Array.from(previewList?.querySelectorAll("[data-db-model-id][data-db-model-custom-label-for]") || []);

    const getSelectedRestoreOptions = () => {
      const selected = getRestoreInputs().filter((input) => input.checked);
      const fieldInputs = getFieldInputs();
      const modelInputs = getModelInputs();
      const modelConflictInputs = getModelConflictInputs();
      const modelCustomLabelInputs = getModelCustomLabelInputs();
      const storageFields = {};
      const storageKeys = [];
      const dbRecords = {};
      const selectedStorageKeys = new Set(selected
        .filter((input) => input.dataset.archiveKind === "storage")
        .map((input) => input.dataset.archiveId));
      const selectedDbIds = new Set(selected
        .filter((input) => input.dataset.archiveKind === "indexedDb")
        .map((input) => input.dataset.archiveId));

      selectedStorageKeys.forEach((key) => {
        const fieldsForKey = fieldInputs.filter((input) => input.dataset.storageFieldKey === key);
        if (!fieldsForKey.length) {
          storageKeys.push(key);
          return;
        }

        const selectedFields = fieldsForKey
          .filter((input) => input.checked)
          .map((input) => ({
            path: input.dataset.storageFieldPath,
            action: input.dataset.storageFieldAction
          }));
        if (selectedFields.length) {
          storageKeys.push(key);
          storageFields[key] = selectedFields;
        }
      });

      const dbIds = [];
      selectedDbIds.forEach((id) => {
        const modelsForDb = modelInputs.filter((input) => input.dataset.dbModelId === id);
        if (!modelsForDb.length) {
          dbIds.push(id);
          return;
        }

        const selectedModels = modelsForDb
          .filter((input) => input.checked)
          .map((input) => {
            const conflictModeInput = modelConflictInputs.find((candidate) => (
              candidate.dataset.dbModelId === id &&
              candidate.dataset.dbModelConflictFor === input.dataset.dbModelKey
            ));
            const customLabelInput = modelCustomLabelInputs.find((candidate) => (
              candidate.dataset.dbModelId === id &&
              candidate.dataset.dbModelCustomLabelFor === input.dataset.dbModelKey
            ));
            return {
              key: input.dataset.dbModelKey,
              action: input.dataset.dbModelAction,
              conflictMode: conflictModeInput?.value || "rename",
              customLabel: customLabelInput?.value || ""
            };
          });
        if (selectedModels.length) {
          dbIds.push(id);
          dbRecords[id] = selectedModels;
        }
      });

      return {
        storageKeys,
        dbIds,
        storageFields,
        dbRecords
      };
    };

    const updateRestoreSelectionState = () => {
      const inputs = getRestoreInputs();
      const fieldInputs = getFieldInputs();
      const modelInputs = getModelInputs();
      const modelConflictInputs = getModelConflictInputs();
      const modelCustomLabelInputs = getModelCustomLabelInputs();
      const restoreOptions = getSelectedRestoreOptions();
      const selectedCount = restoreOptions.storageKeys.length + restoreOptions.dbIds.length;
      const selectedControlCount = inputs.filter((input) => input.checked).length +
        fieldInputs.filter((input) => input.checked).length +
        modelInputs.filter((input) => input.checked).length;
      const totalControlCount = inputs.length + fieldInputs.length + modelInputs.length;
      const selectedFieldCount = Object.values(restoreOptions.storageFields).reduce((sum, fields) => sum + fields.length, 0);
      const selectedModelCount = Object.values(restoreOptions.dbRecords).reduce((sum, models) => sum + models.length, 0);
      inputs.forEach((input) => {
        input.disabled = isBusy;
      });
      const selectedStorageKeys = new Set(inputs
        .filter((input) => input.checked && input.dataset.archiveKind === "storage")
        .map((input) => input.dataset.archiveId));
      fieldInputs.forEach((input) => {
        input.disabled = isBusy || !selectedStorageKeys.has(input.dataset.storageFieldKey);
      });
      const checkedDbIds = new Set(inputs
        .filter((input) => input.checked && input.dataset.archiveKind === "indexedDb")
        .map((input) => input.dataset.archiveId));
      modelInputs.forEach((input) => {
        input.disabled = isBusy || !checkedDbIds.has(input.dataset.dbModelId);
      });
      modelConflictInputs.forEach((input) => {
        const modelInput = modelInputs.find((candidate) => (
          candidate.dataset.dbModelId === input.dataset.dbModelId &&
          candidate.dataset.dbModelKey === input.dataset.dbModelConflictFor
        ));
        input.disabled = isBusy || !checkedDbIds.has(input.dataset.dbModelId) || !modelInput?.checked;
      });
      modelCustomLabelInputs.forEach((input) => {
        const modelInput = modelInputs.find((candidate) => (
          candidate.dataset.dbModelId === input.dataset.dbModelId &&
          candidate.dataset.dbModelKey === input.dataset.dbModelCustomLabelFor
        ));
        const conflictModeInput = modelConflictInputs.find((candidate) => (
          candidate.dataset.dbModelId === input.dataset.dbModelId &&
          candidate.dataset.dbModelConflictFor === input.dataset.dbModelCustomLabelFor
        ));
        const isCustomMode = conflictModeInput?.value === "custom";
        input.hidden = !isCustomMode;
        input.disabled = isBusy || !checkedDbIds.has(input.dataset.dbModelId) || !modelInput?.checked || !isCustomMode;
      });

      if (selectAllInput) {
        selectAllInput.disabled = isBusy || !pendingArchive || inputs.length === 0;
        selectAllInput.checked = totalControlCount > 0 && selectedControlCount === totalControlCount;
        selectAllInput.indeterminate = selectedControlCount > 0 && selectedControlCount < totalControlCount;
      }
      if (selectionStatus) {
        const fieldText = fieldInputs.length ? `，字段 ${selectedFieldCount}/${fieldInputs.length}` : "";
        const modelText = modelInputs.length ? `，资产 ${selectedModelCount}/${modelInputs.length}` : "";
        selectionStatus.textContent = pendingArchive
          ? `将恢复 ${selectedCount}/${inputs.length} 项${fieldText}${modelText}。未勾选的本机内容会保持不变。`
          : "尚未选择恢复内容。";
      }
      if (confirmButton) {
        confirmButton.disabled = isBusy || !pendingArchive || selectedCount === 0;
      }
      if (impactButton) {
        impactButton.disabled = isBusy || !pendingPreview;
      }
    };

    const createPreviewGrid = (items, className) => {
      const previewGrid = document.createElement("div");
      previewGrid.className = className;
      items.forEach(([previewLabel, previewValue]) => {
        const previewBlock = document.createElement("span");
        const previewTitle = document.createElement("strong");
        previewTitle.textContent = previewLabel;
        const previewCode = document.createElement("pre");
        previewCode.textContent = previewValue || "无";
        previewBlock.append(previewTitle, previewCode);
        previewGrid.appendChild(previewBlock);
      });
      return previewGrid;
    };

    const renderRestoreAudit = () => {
      const audit = getRestoreAuditLog(5);
      if (auditStatus) {
        auditStatus.textContent = audit.records.length
          ? `最近 ${audit.records.length}/${audit.total} 条恢复记录保存在本机，本机校验通过 ${audit.verifiedCount} 条${audit.failedCount ? `，失败 ${audit.failedCount} 条` : ""}${audit.legacyCount ? `，旧记录 ${audit.legacyCount} 条` : ""}。`
          : "尚无项目档案恢复记录。";
      }
      if (auditExportButton) {
        auditExportButton.disabled = isBusy || audit.total === 0;
      }
      if (!auditList) {
        return;
      }
      auditList.innerHTML = "";
      audit.records.forEach((record) => {
        const item = document.createElement("li");
        const title = document.createElement("strong");
        title.textContent = formatArchiveDate(record.createdAt);
        const detail = document.createElement("span");
        detail.textContent = `${record.storageCount} 组配置 / ${record.modelCount} 个模型 / ${record.modelHashCount} 个哈希`;
        const source = document.createElement("span");
        const digestText = record.recordDigest ? ` / 审计 ${record.recordDigest.slice(0, 12)}` : " / 旧记录未生成摘要";
        source.textContent = `${record.archiveSource || "本机项目档案"}${digestText} / ${formatRestoreAuditVerificationStatus(record.verificationStatus)}`;
        item.append(title, detail, source);
        auditList.appendChild(item);
      });
    };

    const renderProjectRestoreAuditExportAudit = () => {
      const audit = getProjectRestoreAuditExportAudit({ limit: 5 });
      if (restoreAuditExportAuditStatus) {
        restoreAuditExportAuditStatus.textContent = audit.message;
        restoreAuditExportAuditStatus.dataset.receiptTone = audit.total ? "ready" : "idle";
      }
      if (restoreAuditExportAuditButton) {
        restoreAuditExportAuditButton.disabled = isBusy || audit.total === 0;
      }
      if (!restoreAuditExportAuditList) {
        return;
      }
      restoreAuditExportAuditList.innerHTML = "";
      if (!audit.records.length) {
        const empty = document.createElement("li");
        const title = document.createElement("strong");
        title.textContent = "尚无项目档案恢复审计导出回执";
        const detail = document.createElement("span");
        detail.textContent = "执行一次项目档案恢复并点击“导出审计”后，会记录恢复审计 HTML 的文件摘要和恢复记录范围。";
        empty.append(title, detail);
        restoreAuditExportAuditList.appendChild(empty);
        return;
      }
      audit.records.forEach((record) => {
        const item = document.createElement("li");
        const title = document.createElement("strong");
        title.textContent = record.filename || "项目档案恢复审计报告";
        const detail = document.createElement("span");
        detail.textContent = `${record.restoreRecordCount} 条恢复记录 / 配置 ${record.restoredStorageKeyCount} / 模型 ${record.restoredModelCount} · ${formatBytes(record.byteLength)}`;
        const digest = document.createElement("span");
        digest.textContent = `${formatArchiveDate(record.exportedAt || record.createdAt)} · 文件 ${record.fileDigest ? record.fileDigest.slice(0, 12) : "未生成"} · 回执 ${record.receiptDigest ? record.receiptDigest.slice(0, 12) : "未生成"}`;
        item.append(title, detail, digest);
        restoreAuditExportAuditList.appendChild(item);
      });
    };

    const renderProjectArchiveExportAudit = () => {
      const audit = getProjectArchiveExportAudit({ limit: 5 });
      if (exportAuditStatus) {
        exportAuditStatus.textContent = audit.message;
        exportAuditStatus.dataset.receiptTone = audit.total ? "ready" : "idle";
      }
      if (exportAuditButton) {
        exportAuditButton.disabled = isBusy || audit.total === 0;
      }
      if (!exportAuditList) {
        return;
      }
      exportAuditList.innerHTML = "";
      if (!audit.records.length) {
        const empty = document.createElement("li");
        const title = document.createElement("strong");
        title.textContent = "尚无项目档案导出回执";
        const detail = document.createElement("span");
        detail.textContent = "点击“导出项目档案”后会记录文件摘要、档案摘要和导出范围。";
        empty.append(title, detail);
        exportAuditList.appendChild(empty);
        return;
      }
      audit.records.forEach((record) => {
        const item = document.createElement("li");
        const title = document.createElement("strong");
        title.textContent = record.filename || "项目档案导出";
        const detail = document.createElement("span");
        detail.textContent = `${record.storageCount} 组配置 / ${record.modelCount} 个导入资产 / ${record.modelHashCount} 个哈希 · ${formatBytes(record.byteLength)}`;
        const digest = document.createElement("span");
        digest.textContent = `${formatArchiveDate(record.exportedAt || record.createdAt)} · 文件 ${record.fileDigest ? record.fileDigest.slice(0, 12) : "未生成"} · 回执 ${record.receiptDigest ? record.receiptDigest.slice(0, 12) : "未生成"}`;
        item.append(title, detail, digest);
        exportAuditList.appendChild(item);
      });
    };

    const renderProjectImpactExportAudit = () => {
      const audit = getProjectImpactExportAudit({ limit: 5 });
      if (impactExportAuditStatus) {
        impactExportAuditStatus.textContent = audit.message;
        impactExportAuditStatus.dataset.receiptTone = audit.total ? "ready" : "idle";
      }
      if (impactExportAuditButton) {
        impactExportAuditButton.disabled = isBusy || audit.total === 0;
      }
      if (!impactExportAuditList) {
        return;
      }
      impactExportAuditList.innerHTML = "";
      if (!audit.records.length) {
        const empty = document.createElement("li");
        const title = document.createElement("strong");
        title.textContent = "尚无项目档案差异报告导出回执";
        const detail = document.createElement("span");
        detail.textContent = "生成导入预览后点击“导出差异报告”，会记录来源、风险、恢复选择和文件摘要。";
        empty.append(title, detail);
        impactExportAuditList.appendChild(empty);
        return;
      }
      audit.records.forEach((record) => {
        const item = document.createElement("li");
        const title = document.createElement("strong");
        title.textContent = record.remotePackageId || record.filename || "项目档案差异报告";
        const detail = document.createElement("span");
        const sourceText = formatProjectImpactSourceType(record.sourceType);
        detail.textContent = `${sourceText} · ${record.riskLabel || "风险未知"} · 选择 ${record.selectedCount} 项 / 字段 ${record.selectedFieldCount} / 模型 ${record.selectedModelCount}`;
        const digest = document.createElement("span");
        digest.textContent = `${formatArchiveDate(record.exportedAt || record.createdAt)} · 文件 ${record.fileDigest ? record.fileDigest.slice(0, 12) : "未生成"} · 回执 ${record.receiptDigest ? record.receiptDigest.slice(0, 12) : "未生成"}`;
        item.append(title, detail, digest);
        impactExportAuditList.appendChild(item);
      });
    };

    const renderProjectRepositoryExportAudit = () => {
      const audit = getProjectRepositoryExportAudit({ limit: 5 });
      if (repositoryExportAuditStatus) {
        repositoryExportAuditStatus.textContent = audit.message;
        repositoryExportAuditStatus.dataset.receiptTone = audit.total ? "ready" : "idle";
      }
      if (repositoryExportAuditButton) {
        repositoryExportAuditButton.disabled = isBusy || audit.total === 0;
      }
      if (!repositoryExportAuditList) {
        return;
      }
      repositoryExportAuditList.innerHTML = "";
      if (!audit.records.length) {
        const empty = document.createElement("li");
        empty.dataset.repositoryStatus = "empty";
        const title = document.createElement("strong");
        title.textContent = "尚无项目仓库包导出回执";
        const detail = document.createElement("span");
        detail.textContent = "点击“导出仓库包”后会下载与远端推送同结构的 JSON，并记录包摘要、仓库摘要和文件摘要。";
        empty.append(title, detail);
        repositoryExportAuditList.appendChild(empty);
        return;
      }
      audit.records.forEach((record) => {
        const item = document.createElement("li");
        item.dataset.repositoryStatus = "ready";
        const title = document.createElement("strong");
        title.textContent = record.packageId || record.filename || "项目仓库包导出";
        const detail = document.createElement("span");
        detail.textContent = `${record.sceneCount} 个场景 / ${record.importedModelCount} 个模型 / ${record.textureAssetCount} 个贴图 · 空间 ${record.workspaceId || PROJECT_REPOSITORY_DEFAULT_WORKSPACE}`;
        const digest = document.createElement("span");
        digest.textContent = `${formatArchiveDate(record.exportedAt || record.createdAt)} · 包 ${record.packageDigest ? record.packageDigest.slice(0, 12) : "未生成"} · 回执 ${record.receiptDigest ? record.receiptDigest.slice(0, 12) : "未生成"}`;
        item.append(title, detail, digest);
        repositoryExportAuditList.appendChild(item);
      });
    };

    const renderProjectRepositoryStatus = async () => {
      if (!repositoryStatus && !repositoryList) {
        return;
      }
      if (repositoryStatus) {
        repositoryStatus.textContent = "正在读取本机项目仓库状态。";
        repositoryStatus.dataset.tone = "loading";
      }
      if (repositoryRefreshButton) {
        repositoryRefreshButton.disabled = true;
      }

      try {
        const repository = await getCurrentProjectRepositoryStatus();
        if (repositoryStatus) {
          const summary = repository.summary || {};
          const textureText = summary.textureAssetCount ? `，${summary.textureAssetCount} 个贴图` : "";
          repositoryStatus.textContent = `${repository.statusLabel}：${summary.draftSceneCount}/${summary.sceneCount} 个后台有草稿，${summary.publishedSceneCount}/${summary.sceneCount} 个后台已本机发布，${summary.importedModelCount} 个导入模型${textureText}。边界：本机项目仓库 adapter，尚未接账号后端。`;
          repositoryStatus.dataset.tone = repository.status === "blocked" ? "error" : repository.status === "ready" ? "success" : "normal";
        }
        if (repositoryList) {
          repositoryList.innerHTML = "";
          (repository.scenes || []).forEach((scene) => {
            const item = document.createElement("li");
            item.dataset.repositoryStatus = scene.status;
            const title = document.createElement("strong");
            title.textContent = `${scene.label} · ${scene.statusLabel}`;
            const detail = document.createElement("span");
            detail.textContent = `${scene.draft.objectCount} 个草稿对象 / ${scene.history.snapshotCount} 个快照 / ${scene.published.releaseCount} 个发布版本`;
            const assets = document.createElement("span");
            const assetWarnings = [];
            if (scene.assets.missingBinaryCount) assetWarnings.push(`${scene.assets.missingBinaryCount} 个缺文件`);
            if (scene.assets.unknownBinaryCount) assetWarnings.push(`${scene.assets.unknownBinaryCount} 个待校验`);
            if (scene.assets.missingHashCount) assetWarnings.push(`${scene.assets.missingHashCount} 个缺哈希`);
            const textureText = scene.assets.textureAssetCount ? `，贴图 ${scene.assets.textureAssetCount} 个` : "";
            assets.textContent = scene.assets.importedModelCount
              ? `导入模型 ${scene.assets.importedModelCount} 个${textureText}${assetWarnings.length ? `，${assetWarnings.join("，")}` : "，资产可校验"}`
              : "未使用导入模型";
            const next = document.createElement("span");
            next.textContent = `下一步：${scene.nextActionLabel}`;
            item.append(title, detail, assets, next);
            repositoryList.appendChild(item);
          });
        }
      } catch (error) {
        if (repositoryStatus) {
          repositoryStatus.textContent = error?.message || "项目仓库状态读取失败。";
          repositoryStatus.dataset.tone = "error";
        }
      } finally {
        if (repositoryRefreshButton) {
          repositoryRefreshButton.disabled = isBusy;
        }
      }
    };

    const syncProjectRepositoryRemoteInputs = () => {
      const config = getProjectRepositoryRemoteConfig();
      if (repositoryEndpointInput) {
        repositoryEndpointInput.value = config.endpoint || "";
      }
      if (repositoryTokenInput) {
        repositoryTokenInput.value = config.token || "";
      }
      if (repositoryWorkspaceInput && document.activeElement !== repositoryWorkspaceInput) {
        repositoryWorkspaceInput.value = config.workspaceId || PROJECT_REPOSITORY_DEFAULT_WORKSPACE;
      }
    };

    const renderProjectRepositoryRemoteStatus = () => {
      if (!repositoryRemoteStatus && !repositoryReceiptList && !repositoryReceiptStatus) {
        return;
      }
      const remote = getProjectRepositoryRemoteStatus();
      const receiptAudit = getProjectRepositoryReceiptAudit();
      if (repositoryRemoteStatus) {
        repositoryRemoteStatus.textContent = `${remote.message} 边界：${remote.boundary}`;
        repositoryRemoteStatus.dataset.remoteTone = remote.tone === "ready" ? "ready" : remote.tone === "warning" ? "warning" : "idle";
      }
      if (repositoryRemotePushButton) {
        repositoryRemotePushButton.textContent = remote.pushRetryPending ? "重试推送" : "推送仓库包";
      }
      if (repositoryReceiptStatus) {
        repositoryReceiptStatus.textContent = receiptAudit.message;
        repositoryReceiptStatus.dataset.receiptTone = receiptAudit.total ? "ready" : "idle";
      }
      if (repositoryReceiptExportButton) {
        repositoryReceiptExportButton.disabled = isBusy || receiptAudit.total === 0;
      }
      if (repositoryVersionSelect) {
        const currentValue = repositoryVersionSelect.value;
        const preferredValue = currentValue || remote.lastPackageId || remote.versions[0]?.packageId || "";
        repositoryVersionSelect.innerHTML = "";
        if (!remote.versions.length) {
          const option = document.createElement("option");
          option.value = "";
          option.textContent = remote.remoteConfigured ? "远端尚未返回版本历史" : "保存远端后读取版本历史";
          repositoryVersionSelect.appendChild(option);
          repositoryVersionSelect.disabled = true;
        } else {
          remote.versions.forEach((version, index) => {
            const option = document.createElement("option");
            const value = version.packageId || version.sourcePackageId || version.packageDigest || version.id;
            option.value = value;
            const digest = version.repositoryDigest || version.packageDigest;
            const countText = `${version.sceneCount || 0} 场景 / ${version.modelCount || 0} 模型`;
            option.textContent = `${index === 0 ? "最新 · " : ""}${version.packageId || version.sourcePackageId || "未命名版本"} · ${version.acceptedAt ? formatArchiveDate(version.acceptedAt) : "时间未知"} · ${countText} · 空间 ${version.workspaceId || remote.workspaceId}${digest ? ` · ${digest.slice(0, 10)}` : ""}`;
            repositoryVersionSelect.appendChild(option);
          });
          const hasPreferred = Array.from(repositoryVersionSelect.options).some((option) => option.value === preferredValue);
          repositoryVersionSelect.value = hasPreferred ? preferredValue : repositoryVersionSelect.options[0]?.value || "";
          repositoryVersionSelect.disabled = isBusy || !repositoryVersionSelect.value;
        }
      }
      window.MRMainAdminBoundary?.render?.();
      if (!repositoryReceiptList) {
        return;
      }
      repositoryReceiptList.innerHTML = "";
      if (!remote.receipts.length) {
        const empty = document.createElement("li");
        empty.dataset.repositoryStatus = "empty";
        const title = document.createElement("strong");
        title.textContent = "尚无远端项目仓库回执";
        const detail = document.createElement("span");
        detail.textContent = remote.remoteConfigured ? "检查远端可确认服务在线，推送仓库包后会记录服务端回执。" : "保存远端 endpoint 后可执行真实检查和推送。";
        empty.append(title, detail);
        repositoryReceiptList.appendChild(empty);
        return;
      }

      remote.receipts.slice(0, 5).forEach((receipt) => {
        const item = document.createElement("li");
        item.dataset.repositoryStatus = "ready";
        const title = document.createElement("strong");
        title.textContent = `${receipt.packageId || receipt.sourcePackageId || "项目仓库回执"} · ${receipt.remoteVersion || "远端版本未知"}`;
        const detail = document.createElement("span");
        detail.textContent = receipt.message || "远端已接收项目仓库包。";
        const meta = document.createElement("span");
        const digest = receipt.repositoryDigest || receipt.packageDigest;
        const verificationLabel = formatProjectRepositoryReceiptVerificationStatus(receipt.verificationStatus);
        meta.textContent = `${receipt.acceptedAt ? formatArchiveDate(receipt.acceptedAt) : "接收时间未知"} · 空间 ${receipt.workspaceId || remote.workspaceId}${digest ? ` · 摘要 ${digest.slice(0, 12)}` : ""}${receipt.modelCount ? ` · 模型 ${receipt.modelCount}` : ""} · ${verificationLabel}`;
        item.append(title, detail, meta);
        repositoryReceiptList.appendChild(item);
      });
    };

    const clearPendingImport = () => {
      pendingArchive = null;
      pendingPreview = null;
      if (previewBox) previewBox.hidden = true;
      if (previewSource) {
        previewSource.hidden = true;
        previewSource.innerHTML = "";
        delete previewSource.dataset.riskLevel;
      }
      if (previewList) previewList.innerHTML = "";
      if (previewTitle) previewTitle.textContent = "待导入档案";
      if (previewMeta) previewMeta.textContent = "尚未选择文件";
      if (selectionStatus) selectionStatus.textContent = "尚未选择恢复内容。";
      if (selectAllInput) {
        selectAllInput.checked = false;
        selectAllInput.indeterminate = false;
        selectAllInput.disabled = true;
      }
      if (confirmButton) confirmButton.disabled = true;
      if (impactButton) impactButton.disabled = true;
      if (cancelButton) cancelButton.disabled = true;
    };

    const appendPreviewLine = (fragment, itemKind, id, label, detail, change, options = {}) => {
      const item = document.createElement("li");
      item.dataset.change = change || "normal";
      if (options.defaultSelected === false) {
        item.dataset.defaultSelected = "false";
      }

      const choice = document.createElement("label");
      choice.className = "main-project-preview-choice";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = options.defaultSelected !== false;
      input.dataset.archiveKind = itemKind;
      input.dataset.archiveId = id;
      input.setAttribute("aria-label", `恢复${label}`);

      const body = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = label;

      const text = document.createElement("span");
      text.textContent = detail;

      body.append(title, text);
      if (options.fieldDiffSummary) {
        const fieldSummary = document.createElement("span");
        fieldSummary.className = "main-project-field-summary";
        fieldSummary.textContent = options.fieldDiffSummary;
        body.append(fieldSummary);
      }
      if (options.fieldImpactSummary) {
        const impactSummary = document.createElement("span");
        impactSummary.className = "main-project-field-impact-summary";
        impactSummary.textContent = options.fieldImpactSummary;
        body.append(impactSummary);
      }
      if (options.modelDiffSummary) {
        const modelSummary = document.createElement("span");
        modelSummary.className = "main-project-model-summary";
        modelSummary.textContent = options.modelDiffSummary;
        body.append(modelSummary);
      }
      if (Array.isArray(options.fieldSelections) && options.fieldSelections.length) {
        const fieldList = document.createElement("ul");
        fieldList.className = "main-project-field-diffs main-project-field-diffs--selectable";
        options.fieldSelections.forEach((field) => {
          const fieldItem = document.createElement("li");
          fieldItem.dataset.fieldAction = field.action;
          const fieldChoice = document.createElement("label");
          fieldChoice.className = "main-project-field-choice";
          const fieldInput = document.createElement("input");
          fieldInput.type = "checkbox";
          fieldInput.checked = options.defaultSelected !== false;
          fieldInput.dataset.storageFieldKey = id;
          fieldInput.dataset.storageFieldPath = field.path;
          fieldInput.dataset.storageFieldAction = field.action;
          fieldInput.setAttribute("aria-label", `恢复${label}${field.label}`);
          const fieldText = document.createElement("span");
          const fieldLabel = document.createElement("span");
          fieldLabel.textContent = field.label;
          const fieldImpact = document.createElement("span");
          fieldImpact.className = "main-project-field-impact";
          fieldImpact.textContent = `${field.impact} · ${field.detail}`;
          fieldText.append(fieldLabel, fieldImpact);
          fieldChoice.append(fieldInput, fieldText);
          fieldItem.appendChild(fieldChoice);
          if (field.currentPreview || field.incomingPreview) {
            const fieldDetails = document.createElement("details");
            fieldDetails.className = "main-project-field-details";
            const summary = document.createElement("summary");
            summary.textContent = "查看字段片段";
            const previewGrid = createPreviewGrid([
              ["当前本机", field.currentPreview],
              ["导入档案", field.incomingPreview]
            ], "main-project-field-preview-grid");
            fieldDetails.append(summary, previewGrid);
            fieldItem.appendChild(fieldDetails);
          }
          fieldList.appendChild(fieldItem);
        });
        body.append(fieldList);
      } else if (Array.isArray(options.fieldDiffs) && options.fieldDiffs.length) {
        const fieldList = document.createElement("ul");
        fieldList.className = "main-project-field-diffs";
        options.fieldDiffs.forEach((fieldDiff) => {
          const fieldItem = document.createElement("li");
          fieldItem.textContent = fieldDiff;
          fieldList.appendChild(fieldItem);
        });
        body.append(fieldList);
      }
      if (Array.isArray(options.modelSelections) && options.modelSelections.length) {
        const modelList = document.createElement("ul");
        modelList.className = "main-project-model-diffs main-project-model-diffs--selectable";
        options.modelSelections.forEach((model) => {
          const modelItem = document.createElement("li");
          modelItem.dataset.modelAction = model.action;
          const modelChoice = document.createElement("label");
          modelChoice.className = "main-project-model-choice";
          const modelInput = document.createElement("input");
          modelInput.type = "checkbox";
          modelInput.checked = options.defaultSelected !== false;
          modelInput.dataset.dbModelId = id;
          modelInput.dataset.dbModelKey = model.key;
          modelInput.dataset.dbModelAction = model.action;
          modelInput.setAttribute("aria-label", `恢复${label}${model.label}`);
          const modelText = document.createElement("span");
          const modelLabel = document.createElement("span");
          modelLabel.textContent = model.label;
          const modelImpact = document.createElement("span");
          modelImpact.className = "main-project-model-impact";
          modelImpact.textContent = model.detail;
          modelText.append(modelLabel, modelImpact);
          if (model.conflictSummary) {
            const modelConflict = document.createElement("span");
            modelConflict.className = "main-project-model-conflict";
            modelConflict.textContent = model.conflictSummary;
            modelText.appendChild(modelConflict);
          }
          modelChoice.append(modelInput, modelText);
          modelItem.appendChild(modelChoice);
          if (model.conflictCount) {
            const conflictControl = document.createElement("label");
            conflictControl.className = "main-project-model-conflict-control";
            const conflictLabel = document.createElement("span");
            conflictLabel.textContent = "冲突处理";
            const conflictSelect = document.createElement("select");
            conflictSelect.dataset.dbModelId = id;
            conflictSelect.dataset.dbModelConflictFor = model.key;
            [
              ["rename", "保留本机，档案模型自动改名"],
              ["replace", "替换本机同名模型"],
              ["custom", "自定义档案模型名称"]
            ].forEach(([value, textValue]) => {
              const option = document.createElement("option");
              option.value = value;
              option.textContent = textValue;
              conflictSelect.appendChild(option);
            });
            const customLabelInput = document.createElement("input");
            customLabelInput.type = "text";
            customLabelInput.maxLength = 80;
            customLabelInput.value = model.suggestedLabel || "";
            customLabelInput.placeholder = "输入恢复后的模型名称";
            customLabelInput.dataset.dbModelId = id;
            customLabelInput.dataset.dbModelCustomLabelFor = model.key;
            customLabelInput.setAttribute("aria-label", `自定义${model.label}恢复后的模型名称`);
            customLabelInput.hidden = true;
            conflictControl.append(conflictLabel, conflictSelect, customLabelInput);
            modelItem.appendChild(conflictControl);
          }
          if (model.currentPreview || model.incomingPreview) {
            const modelDetails = document.createElement("details");
            modelDetails.className = "main-project-model-details";
            const summary = document.createElement("summary");
            summary.textContent = "查看模型片段";
            const previewGrid = createPreviewGrid([
              ["当前本机", model.currentPreview],
              ["导入档案", model.incomingPreview]
            ], "main-project-model-preview-grid");
            modelDetails.append(summary, previewGrid);
            modelItem.appendChild(modelDetails);
          }
          if (model.currentFullPreview || model.incomingFullPreview) {
            const modelFullDetails = document.createElement("details");
            modelFullDetails.className = "main-project-model-full-details";
            const fullSummary = document.createElement("summary");
            fullSummary.textContent = "查看完整模型 JSON";
            const fullPreviewGrid = createPreviewGrid([
              ["当前本机", model.currentFullPreview],
              ["导入档案", model.incomingFullPreview]
            ], "main-project-model-full-grid");
            modelFullDetails.append(fullSummary, fullPreviewGrid);
            modelItem.appendChild(modelFullDetails);
          }
          modelList.appendChild(modelItem);
        });
        body.append(modelList);
      } else if (Array.isArray(options.modelDiffs) && options.modelDiffs.length) {
        const modelList = document.createElement("ul");
        modelList.className = "main-project-model-diffs";
        options.modelDiffs.forEach((modelDiff) => {
          const modelItem = document.createElement("li");
          modelItem.textContent = modelDiff;
          modelList.appendChild(modelItem);
        });
        body.append(modelList);
      }
      if (options.migrationNote) {
        const note = document.createElement("span");
        note.className = "main-project-preview-note";
        note.textContent = options.migrationNote;
        body.append(note);
      }
      choice.append(input, body);
      item.append(choice);
      fragment.appendChild(item);
    };

    const appendMigrationLine = (fragment, migration) => {
      const item = document.createElement("li");
      item.dataset.change = "migration";

      const body = document.createElement("span");
      body.className = "main-project-migration-line";
      const title = document.createElement("strong");
      title.textContent = "迁移说明";
      const text = document.createElement("span");
      text.textContent = migration.message;
      body.append(title, text);
      item.append(body);
      fragment.appendChild(item);
    };

    const renderImportPreviewSource = (preview) => {
      if (!previewSource) return;
      previewSource.innerHTML = "";
      const remote = preview?.remoteRepository || null;
      const risk = remote || preview?.riskSummary
        ? {
          level: remote?.riskLevel || preview?.riskSummary?.level || "low",
          label: remote?.riskLabel || preview?.riskSummary?.label || "低风险",
          text: remote?.riskText || preview?.riskSummary?.text || "未发现覆盖、清空或资产完整性风险。"
        }
        : null;

      if (!remote && !risk) {
        previewSource.hidden = true;
        delete previewSource.dataset.riskLevel;
        return;
      }

      previewSource.hidden = false;
      previewSource.dataset.riskLevel = risk?.level || "low";
      const title = document.createElement("strong");
      title.textContent = remote
        ? `远端项目仓库版本：${remote.packageId || remote.sourcePackageId || "未命名包"}`
        : "项目档案恢复风险";
      const detail = document.createElement("span");
      if (remote) {
        const digestText = remote.packageDigest ? ` · 包摘要 ${remote.packageDigest.slice(0, 12)}` : "";
        const repositoryText = remote.repositoryDigest ? ` · 仓库摘要 ${remote.repositoryDigest.slice(0, 12)}` : "";
        detail.textContent = `Workspace ${remote.workspaceId || PROJECT_REPOSITORY_DEFAULT_WORKSPACE} · ${remote.remoteVersion || "远端版本未知"} · 历史版本 ${remote.versionCount || 0}${digestText}${repositoryText}`;
      } else {
        detail.textContent = "本机项目档案导入前风险摘要。";
      }
      const riskText = document.createElement("span");
      riskText.className = "main-project-preview-risk";
      riskText.textContent = `${risk.label}：${risk.text}`;
      const boundary = document.createElement("span");
      boundary.className = "main-project-preview-boundary";
      boundary.textContent = remote
        ? "拉取只生成恢复预览，不会自动覆盖本机数据；恢复仍需手动勾选并确认。"
        : "恢复前请确认勾选范围，未勾选内容会保持当前本机状态。";
      previewSource.append(title, detail, riskText, boundary);
    };

    const renderImportPreview = (preview) => {
      if (!previewBox || !previewList) return;

      previewBox.hidden = false;
      if (previewTitle) previewTitle.textContent = preview.remoteRepository ? "远端项目仓库版本预览" : "待导入项目档案";
      if (previewMeta) {
        const summary = preview.summary;
        const schema = preview.schemaSummary;
        const migrationText = preview.migrations?.length ? ` · ${preview.migrations.length} 条迁移` : "";
        const hashText = summary.incomingModelCount
          ? ` / ${summary.assetHashCount} 哈希${summary.missingAssetHashCount ? ` / ${summary.missingAssetHashCount} 缺哈希` : ""}`
          : "";
        const textureText = schema.textureAssets ? ` / ${schema.textureAssets} 贴图` : "";
        const riskText = preview.riskSummary?.label ? ` · ${preview.riskSummary.label}` : "";
        previewMeta.textContent = `${formatArchiveDate(preview.exportedAt)} · schema v${schema.version || "-"}${migrationText} · ${summary.storageAdded} 新增 / ${summary.storageUpdated} 覆盖 / ${summary.storageRemoved} 清空 / ${schema.importedModels} 模型${textureText}${hashText}${riskText}`;
      }
      renderImportPreviewSource(preview);

      const fragment = document.createDocumentFragment();
      preview.migrations?.forEach((migration) => appendMigrationLine(fragment, migration));
      preview.storage.forEach((item) => appendPreviewLine(fragment, "storage", item.id, item.label, describeStorageChange(item), item.change, {
        defaultSelected: item.defaultSelected,
        fieldDiffSummary: item.fieldDiffSummary,
        fieldImpactSummary: item.fieldImpactSummary,
        fieldDiffs: item.fieldDiffs,
        fieldSelections: item.fieldSelections,
        migrationNote: item.migrationNote
      }));
      preview.indexedDb.forEach((item) => appendPreviewLine(fragment, "indexedDb", item.id, item.label, describeDbChange(item), item.change, {
        defaultSelected: item.defaultSelected,
        modelDiffSummary: item.modelDiffSummary,
        modelDiffs: item.modelDiffs,
        modelSelections: item.modelSelections,
        migrationNote: item.migrationNote
      }));

      previewList.innerHTML = "";
      previewList.appendChild(fragment);
      if (cancelButton) cancelButton.disabled = false;
      updateRestoreSelectionState();
    };

    clearPendingImport();

    if (exportButton) {
      exportButton.addEventListener("click", async () => {
        clearPendingImport();
        exportButton.disabled = true;
        setStatus("正在整理项目档案，请稍候。", "loading");
        try {
          const result = await exportProject();
          setStatus(result.message, "success");
          renderProjectArchiveExportAudit();
          renderProjectRepositoryStatus();
        } catch (error) {
          setStatus(error?.message || "项目档案导出失败。", "error");
        } finally {
          exportButton.disabled = false;
        }
      });
    }

    exportAuditButton?.addEventListener("click", () => {
      const result = downloadProjectArchiveExportAudit();
      setStatus(result.message || "项目档案导出回执审计导出失败。", result.ok ? "success" : "error");
      renderProjectArchiveExportAudit();
    });

    if (importFile) {
      importFile.addEventListener("change", async () => {
        const file = importFile.files?.[0];
        if (!file) return;

        clearPendingImport();
        setBusy(true);
        setStatus("正在校验项目档案并生成差异预览。", "loading");
        try {
          const result = await prepareImportProject(file);
          pendingArchive = result.archive;
          pendingPreview = result.preview;
          renderImportPreview(result.preview);
          const migrationText = result.preview.migrations?.length
            ? ` 已应用 ${result.preview.migrations.length} 条兼容迁移；旧档案缺失的新条目默认保留本机内容。`
            : "";
          setStatus(`${result.message}${migrationText} 可取消不想覆盖的条目，再点击“恢复所选”。`, "success");
        } catch (error) {
          setStatus(error?.message || "项目档案导入失败。", "error");
        } finally {
          setBusy(false);
          importFile.value = "";
        }
      });
    }

    impactButton?.addEventListener("click", () => {
      if (!pendingPreview) {
        setStatus("请先选择项目档案并生成差异预览。", "error");
        return;
      }

      const result = downloadImportImpactReport(pendingPreview, {
        restoreOptions: getSelectedRestoreOptions()
      });
      setStatus(result.message || "项目档案差异报告导出失败。", result.ok ? "success" : "error");
      renderProjectImpactExportAudit();
    });

    auditExportButton?.addEventListener("click", () => {
      const result = downloadRestoreAuditLog();
      setStatus(result.message || "项目档案恢复审计导出失败。", result.ok ? "success" : "error");
      renderRestoreAudit();
      renderProjectRestoreAuditExportAudit();
    });

    restoreAuditExportAuditButton?.addEventListener("click", () => {
      const result = downloadProjectRestoreAuditExportAudit();
      setStatus(result.message || "项目档案恢复审计导出回执审计导出失败。", result.ok ? "success" : "error");
      renderProjectRestoreAuditExportAudit();
    });

    impactExportAuditButton?.addEventListener("click", () => {
      const result = downloadProjectImpactExportAudit();
      setStatus(result.message || "项目档案差异报告导出回执审计导出失败。", result.ok ? "success" : "error");
      renderProjectImpactExportAudit();
    });

    repositoryRefreshButton?.addEventListener("click", () => {
      renderProjectRepositoryStatus();
    });

    repositoryExportButton?.addEventListener("click", async () => {
      clearPendingImport();
      setBusy(true);
      setStatus("正在生成本机项目仓库包，请稍候。", "loading");
      try {
        const result = await downloadProjectRepositoryPackage();
        const digestText = result.package?.packageDigest ? ` 包摘要 ${result.package.packageDigest.slice(0, 12)}。` : "";
        setStatus(`${result.message || "项目仓库包已导出。"}${digestText}`, result.ok ? "success" : "error");
        renderProjectRepositoryExportAudit();
      } catch (error) {
        setStatus(error?.message || "项目仓库包导出失败。", "error");
      } finally {
        setBusy(false);
        renderProjectRepositoryStatus();
      }
    });

    repositoryExportAuditButton?.addEventListener("click", () => {
      const result = downloadProjectRepositoryExportAudit();
      setStatus(result.message || "项目仓库包导出回执审计导出失败。", result.ok ? "success" : "error");
      renderProjectRepositoryExportAudit();
    });

    repositoryRemoteSaveButton?.addEventListener("click", () => {
      const result = configureProjectRepositoryRemote({
        endpoint: repositoryEndpointInput?.value || "",
        token: repositoryTokenInput?.value || "",
        workspaceId: repositoryWorkspaceInput?.value || ""
      });
      setStatus(result.message || "远端项目仓库 API 配置已更新。", result.ok ? "success" : "error");
      syncProjectRepositoryRemoteInputs();
      renderProjectRepositoryRemoteStatus();
    });

    repositoryRemoteCheckButton?.addEventListener("click", async () => {
      setBusy(true);
      setStatus("正在检查远端项目仓库 API。", "loading");
      try {
        const result = await checkProjectRepositoryRemote();
        setStatus(result.message || "远端项目仓库 API 检查完成。", result.ok ? "success" : "error");
      } catch (error) {
        setStatus(error?.message || "远端项目仓库 API 检查失败。", "error");
      } finally {
        setBusy(false);
        renderProjectRepositoryRemoteStatus();
      }
    });

    repositoryRemotePushButton?.addEventListener("click", async () => {
      setBusy(true);
      setStatus("正在生成项目仓库包并推送到远端。", "loading");
      try {
        const result = await pushProjectRepositoryToRemote();
        const digestText = result.package?.packageDigest ? ` 摘要 ${result.package.packageDigest.slice(0, 12)}。` : "";
        setStatus(`${result.message || "远端项目仓库推送完成。"}${digestText}`, result.ok ? "success" : "error");
      } catch (error) {
        setStatus(error?.message || "远端项目仓库推送失败。", "error");
      } finally {
        setBusy(false);
        renderProjectRepositoryRemoteStatus();
        renderProjectRepositoryStatus();
      }
    });

      repositoryRemotePullButton?.addEventListener("click", async () => {
      clearPendingImport();
      setBusy(true);
      setStatus("正在拉取远端项目仓库包并生成恢复预览。", "loading");
      try {
        const result = await pullProjectRepositoryFromRemote({
          packageId: repositoryVersionSelect?.value || ""
        });
        if (!result.ok) {
          setStatus(result.message || "远端项目仓库拉取失败。", "error");
          return;
        }
        pendingArchive = result.archive;
        pendingPreview = result.preview;
        renderImportPreview(result.preview);
        setStatus(`${result.message || "远端项目仓库包已拉取。"} 请确认差异和恢复范围后再点击“恢复所选”。`, "success");
      } catch (error) {
        setStatus(error?.message || "远端项目仓库拉取失败。", "error");
      } finally {
        setBusy(false);
        renderProjectRepositoryRemoteStatus();
      }
    });

    repositoryReceiptExportButton?.addEventListener("click", () => {
      const result = downloadProjectRepositoryReceiptAudit();
      setStatus(result.message || "项目仓库回执审计导出失败。", result.ok ? "success" : "error");
      renderProjectRepositoryRemoteStatus();
    });

    confirmButton?.addEventListener("click", async () => {
      if (!pendingArchive) {
        setStatus("请先选择项目档案。", "error");
        return;
      }
      const restoreOptions = getSelectedRestoreOptions();
      if (!restoreOptions.storageKeys.length && !restoreOptions.dbIds.length) {
        setStatus("请至少勾选一项要恢复的项目档案内容。", "error");
        updateRestoreSelectionState();
        return;
      }

      setBusy(true);
      setStatus("正在恢复所选项目档案，未勾选的本机内容会保持不变。", "loading");
      try {
        await restoreProjectArchive(pendingArchive, restoreOptions);
        renderRestoreAudit();
        const result = summarizeArchive(pendingArchive, "已恢复所选项目档案，刷新页面后生效。", restoreOptions);
        setStatus(`${result.message} 页面即将刷新。`, "success");
        window.setTimeout(() => window.location.reload(), 900);
      } catch (error) {
        setStatus(error?.message || "项目档案导入失败。", "error");
        setBusy(false);
      }
    });

    cancelButton?.addEventListener("click", () => {
      clearPendingImport();
      setStatus("已取消导入项目档案，当前本机项目未被修改。", "normal");
    });

    previewList?.addEventListener("change", (event) => {
      if (event.target.matches("[data-archive-kind][data-archive-id], [data-storage-field-key][data-storage-field-path], [data-db-model-id][data-db-model-key], [data-db-model-id][data-db-model-conflict-for], [data-db-model-id][data-db-model-custom-label-for]")) {
        updateRestoreSelectionState();
      }
    });

    selectAllInput?.addEventListener("change", () => {
      getRestoreInputs().forEach((input) => {
        input.checked = selectAllInput.checked;
      });
      getFieldInputs().forEach((input) => {
        input.checked = selectAllInput.checked;
      });
      getModelInputs().forEach((input) => {
        input.checked = selectAllInput.checked;
      });
      updateRestoreSelectionState();
    });

    renderRestoreAudit();
    renderProjectArchiveExportAudit();
    renderProjectRestoreAuditExportAudit();
    renderProjectImpactExportAudit();
    renderProjectRepositoryExportAudit();
    syncProjectRepositoryRemoteInputs();
    renderProjectRepositoryRemoteStatus();
    renderProjectRepositoryStatus();
  }

  window.MRProjectArchive = {
    kind: ARCHIVE_KIND,
    version: ARCHIVE_VERSION,
    exportProject,
    getProjectArchiveExportAudit,
    getProjectArchiveExportAuditExport,
    downloadProjectArchiveExportAudit,
    recordProjectArchiveExportReceipt,
    getProjectImpactExportAudit,
    getProjectImpactExportAuditExport,
    downloadProjectImpactExportAudit,
    recordProjectImpactExportReceipt,
    importProject,
    prepareImportProject,
    getCurrentProjectRepositoryStatus,
    createProjectRepositoryPackage,
    downloadProjectRepositoryPackage,
    getProjectRepositoryExportAudit,
    getProjectRepositoryExportAuditExport,
    downloadProjectRepositoryExportAudit,
    recordProjectRepositoryExportReceipt,
    configureProjectRepositoryRemote,
    getProjectRepositoryRemoteConfig,
    getProjectRepositoryRemoteStatus,
    getProjectRepositoryReceiptAudit,
    getProjectRepositoryReceiptAuditExport,
    downloadProjectRepositoryReceiptAudit,
    checkProjectRepositoryRemote,
    pushProjectRepositoryToRemote,
    pullProjectRepositoryFromRemote,
    getImportImpactReport,
    downloadImportImpactReport,
    getRestoreAuditLog,
    getRestoreAuditExport,
    downloadRestoreAuditLog,
    getProjectRestoreAuditExportAudit,
    getProjectRestoreAuditExportAuditExport,
    downloadProjectRestoreAuditExportAudit,
    recordProjectRestoreAuditExportReceipt,
    restoreProjectArchive,
    migrateProjectArchive,
    validateArchiveAssetHashes,
    createArrayBufferSha256,
    storageItems: STORAGE_ITEMS.map((item) => ({ ...item })),
    dbItems: DB_ITEMS.map((item) => ({ ...item }))
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindProjectArchiveControls, { once: true });
  } else {
    bindProjectArchiveControls();
  }
})();

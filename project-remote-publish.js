(function () {
  const STORAGE_KEY = "mr-calligraphy-remote-publish-v1";
  const PACKAGE_KIND = "mr-calligraphy-remote-publish-package-v1";
  const REVOKE_KIND = "mr-calligraphy-remote-publish-revoke-v1";
  const VERSION = 1;
  const MAX_RECEIPTS = 12;
  const BOUNDARY = "远端发布 API adapter 会真实发送当前本机发布包；它不是账号权限、审核流、CDN 部署或服务器托管本身。";

  function readState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return normalizeState(parsed);
    } catch (error) {
      return normalizeState({});
    }
  }

  function writeState(state) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
  }

  function normalizeState(state = {}) {
    const source = state && typeof state === "object" ? state : {};
    return {
      version: VERSION,
      scenes: {
        mainScene: normalizeSceneState(source.scenes?.mainScene),
        realisticScene: normalizeSceneState(source.scenes?.realisticScene)
      }
    };
  }

  function normalizeSceneState(scene = {}) {
    const source = scene && typeof scene === "object" ? scene : {};
    return {
      endpoint: typeof source.endpoint === "string" ? source.endpoint.trim() : "",
      token: typeof source.token === "string" ? source.token.trim() : "",
      lastCheckedAt: normalizeDate(source.lastCheckedAt),
      lastPushedAt: normalizeDate(source.lastPushedAt),
      lastRevokedAt: normalizeDate(source.lastRevokedAt),
      lastRemoteDirection: ["publish", "revoke", "check"].includes(source.lastRemoteDirection) ? source.lastRemoteDirection : "",
      lastPackageId: source.lastPackageId ? String(source.lastPackageId) : "",
      lastReleaseId: source.lastReleaseId ? String(source.lastReleaseId) : "",
      lastRemoteVersion: source.lastRemoteVersion ? String(source.lastRemoteVersion).slice(0, 120) : "",
      lastRemoteStatus: source.lastRemoteStatus ? String(source.lastRemoteStatus).slice(0, 180) : "",
      lastPackageDigest: normalizeSha256(source.lastPackageDigest),
      lastError: source.lastError ? String(source.lastError).slice(0, 180) : "",
      review: normalizeReviewState(source.review),
      lock: normalizeLockState(source.lock),
      receipts: Array.isArray(source.receipts)
        ? source.receipts.map((receipt) => normalizeRemoteReceipt(receipt)).filter(Boolean).slice(0, MAX_RECEIPTS)
        : []
    };
  }

  function normalizeRemoteReceipt(record = {}) {
    const source = record && typeof record === "object" ? record : {};
    const receipt = source.receipt && typeof source.receipt === "object" ? clone(source.receipt) : {};
    const sceneId = normalizeSceneId(source.sceneId || receipt.sceneId);
    const packageId = String(source.packageId || receipt.packageId || "").slice(0, 160);
    const releaseId = String(source.releaseId || receipt.releaseId || "").slice(0, 160);
    const packageDigest = normalizeSha256(source.packageDigest || receipt.packageDigest);
    const acceptedAt = normalizeDate(source.acceptedAt || receipt.acceptedAt);
    const pushedAt = normalizeDate(source.pushedAt);
    const revokedAt = normalizeDate(source.revokedAt || receipt.revokedAt);
    const direction = normalizeReceiptDirection(source.direction || receipt.direction || receipt.receiptKind);
    const sourcePackageId = String(source.sourcePackageId || receipt.sourcePackageId || "").slice(0, 160);
    const cdnUploadSummary = normalizeCdnUploadSummary(source.cdnUploadSummary || receipt.cdnUploadSummary || receipt.cdnUpload);
    const cdnPurgeSummary = normalizeCdnPurgeSummary(source.cdnPurgeSummary || receipt.cdnPurgeSummary || receipt.cdnPurge);
    const assetSignatures = normalizeAssetSignatures(source.assetSignatures || receipt.assetSignatures);
    const assetSignatureSummary = normalizeAssetSignatureSummary(source.assetSignatureSummary || receipt.assetSignatureSummary, assetSignatures);
    const receiptDigest = normalizeSha256(source.receiptDigest || receipt.receiptDigest)
      || sha256StableJson({ sceneId, packageId, releaseId, packageDigest, acceptedAt, pushedAt, revokedAt, direction, sourcePackageId, assetSignatureSummary, cdnUploadSummary, cdnPurgeSummary });
    const warnings = normalizeWarningList(source.warnings || receipt.warnings);
    return {
      id: String(source.id || `receipt-${sceneId}-${receiptDigest.slice(0, 16)}`).slice(0, 180),
      sceneId,
      sceneLabel: String(source.sceneLabel || receipt.sceneLabel || sceneLabelFromId(sceneId)).slice(0, 80),
      packageId,
      sourcePackageId,
      releaseId,
      packageDigest,
      receiptDigest,
      remoteVersion: String(source.remoteVersion || receipt.remoteVersion || "").slice(0, 120),
      endpoint: String(source.endpoint || "").slice(0, 240),
      acceptedAt,
      pushedAt,
      revokedAt,
      direction,
      message: String(source.message || "").slice(0, 180),
      warningCount: normalizeCount(source.warningCount ?? receipt.warningCount ?? warnings.length),
      warnings,
      cdnUploadSummary,
      cdnPurgeSummary,
      assetSignatureSummary,
      assetSignatures,
      receiptKind: String(source.receiptKind || receipt.receiptKind || "").slice(0, 120),
      receipt
    };
  }

  function normalizeReviewState(review = {}) {
    const source = review && typeof review === "object" ? review : {};
    const allowedStatus = new Set(["draft", "reviewing", "approved", "rejected"]);
    const status = allowedStatus.has(source.status) ? source.status : "draft";
    return {
      status,
      releaseId: source.releaseId ? String(source.releaseId).slice(0, 120) : "",
      packageDigest: normalizeSha256(source.packageDigest),
      requestedAt: normalizeDate(source.requestedAt),
      approvedAt: normalizeDate(source.approvedAt),
      rejectedAt: normalizeDate(source.rejectedAt),
      requestedBy: source.requestedBy ? String(source.requestedBy).slice(0, 80) : "",
      approvedBy: source.approvedBy ? String(source.approvedBy).slice(0, 80) : "",
      note: source.note ? String(source.note).slice(0, 160) : "",
      rejectionReason: source.rejectionReason ? String(source.rejectionReason).slice(0, 160) : ""
    };
  }

  function normalizeLockState(lock = {}) {
    const source = lock && typeof lock === "object" ? lock : {};
    const lockedAt = normalizeDate(source.lockedAt);
    const sourceType = ["local", "in-flight", "remote"].includes(source.source) ? source.source : "local";
    return {
      lockedAt,
      releaseId: lockedAt && source.releaseId ? String(source.releaseId).slice(0, 120) : "",
      packageDigest: lockedAt ? normalizeSha256(source.packageDigest) : "",
      reason: lockedAt && source.reason ? String(source.reason).slice(0, 160) : "",
      source: lockedAt ? sourceType : ""
    };
  }

  function normalizeDate(value) {
    const time = Date.parse(value);
    return Number.isFinite(time) ? new Date(time).toISOString() : "";
  }

  function validateEndpoint(endpoint) {
    try {
      const base = typeof location !== "undefined" && location.href ? location.href : "http://localhost/";
      const url = new URL(endpoint, base);
      if (!["http:", "https:"].includes(url.protocol)) {
        return { ok: false, message: "远端发布 API 只支持 http 或 https 地址。" };
      }
      return { ok: true, endpoint: url.href };
    } catch (error) {
      return { ok: false, message: "远端发布 API 地址无效。" };
    }
  }

  function configure(sceneId, config = {}) {
    const normalizedId = normalizeSceneId(sceneId);
    const state = readState();
    const current = state.scenes[normalizedId];
    const endpointInput = String(config.endpoint ?? config.remoteEndpoint ?? "").trim();
    const tokenInput = config.token ?? config.remoteToken;
    const token = tokenInput === undefined ? current.token : String(tokenInput || "").trim();

    if (!endpointInput) {
      state.scenes[normalizedId] = normalizeSceneState({
        lastCheckedAt: new Date().toISOString(),
        lastRemoteStatus: "已清除远端发布 API 配置。"
      });
      writeState(state);
      return {
        ok: true,
        status: getStatus(normalizedId),
        message: "已清除远端发布 API 配置，当前只保留本机发布。"
      };
    }

    const validation = validateEndpoint(endpointInput);
    if (!validation.ok) {
      state.scenes[normalizedId] = normalizeSceneState({
        ...current,
        lastCheckedAt: new Date().toISOString(),
        lastError: validation.message
      });
      writeState(state);
      return { ok: false, status: getStatus(normalizedId), message: validation.message };
    }

    state.scenes[normalizedId] = normalizeSceneState({
      ...current,
      endpoint: validation.endpoint,
      token,
      lastCheckedAt: new Date().toISOString(),
      lastRemoteStatus: "远端发布 API 配置已保存，尚未检查服务可用性。",
      lastError: ""
    });
    writeState(state);
    return {
      ok: true,
      status: getStatus(normalizedId),
      message: "已保存远端发布 API 配置。"
    };
  }

  function getStatus(sceneId, options = {}) {
    const normalizedId = normalizeSceneId(sceneId);
    const scene = readState().scenes[normalizedId];
    const workflow = getWorkflow(normalizedId, options);
    const remoteConfigured = Boolean(scene.endpoint);
    const latestRevocableReceipt = getLatestRevocableReceipt(scene);
    let tone = "idle";
    let message = remoteConfigured
      ? `远端发布 API 已配置：${scene.endpoint}。`
      : "尚未配置远端发布 API，当前只是本机发布快照。";

    if (scene.lastPushedAt) {
      tone = "ready";
      message = scene.lastRemoteStatus || `最近远端发布：${formatDateTime(scene.lastPushedAt)}。`;
    } else if (scene.lastRemoteStatus) {
      tone = remoteConfigured ? "ready" : "idle";
      message = scene.lastRemoteStatus;
    }
    if (scene.lastError) {
      tone = "warning";
      message = scene.lastError;
    }
    if (options.hasLocalRelease === false && !scene.lastError) {
      tone = remoteConfigured ? "warning" : tone;
      message = remoteConfigured
        ? "请先完成一次本机发布，再推送到远端发布 API。"
        : message;
    }

    return {
      ok: true,
      sceneId: normalizedId,
      remoteConfigured,
      endpoint: remoteConfigured ? scene.endpoint : "",
      hasToken: Boolean(scene.token),
      fetchSupported: typeof fetch === "function",
      tone,
      message,
      boundary: BOUNDARY,
      lastCheckedAt: scene.lastCheckedAt,
      lastPushedAt: scene.lastPushedAt,
      lastRevokedAt: scene.lastRevokedAt,
      lastRemoteDirection: scene.lastRemoteDirection,
      lastPackageId: scene.lastPackageId,
      lastReleaseId: scene.lastReleaseId,
      lastRemoteVersion: scene.lastRemoteVersion,
      lastRemoteStatus: scene.lastRemoteStatus,
      lastPackageDigest: scene.lastPackageDigest,
      lastError: scene.lastError,
      review: scene.review,
      lock: scene.lock,
      latestReceipt: scene.receipts[0] || null,
      latestRevocableReceipt,
      canRevoke: Boolean(remoteConfigured && latestRevocableReceipt),
      receiptCount: scene.receipts.length,
      receipts: scene.receipts,
      workflow
    };
  }

  function getConfig(sceneId) {
    const normalizedId = normalizeSceneId(sceneId);
    const scene = readState().scenes[normalizedId];
    return {
      ok: true,
      sceneId: normalizedId,
      endpoint: scene.endpoint,
      token: scene.token,
      hasToken: Boolean(scene.token),
      boundary: BOUNDARY
    };
  }

  function getReceiptAudit(sceneId) {
    const normalizedId = normalizeSceneId(sceneId);
    const scene = readState().scenes[normalizedId];
    const receipts = Array.isArray(scene.receipts) ? scene.receipts : [];
    return {
      ok: true,
      sceneId: normalizedId,
      sceneLabel: sceneLabelFromId(normalizedId),
      total: receipts.length,
      latestReceipt: receipts[0] || null,
      receipts,
      boundary: BOUNDARY,
      message: receipts.length
        ? `已保存 ${receipts.length} 条远端发布回执，最近一次：${formatDateTime(receipts[0].acceptedAt || receipts[0].pushedAt)}。`
        : "暂无远端发布回执。"
    };
  }

  function getReceiptAuditExport(sceneId) {
    const audit = getReceiptAudit(sceneId);
    if (!audit.receipts.length) {
      return {
        ok: false,
        sceneId: audit.sceneId,
        message: "暂无可导出的远端发布回执。"
      };
    }
    const generatedAt = new Date().toISOString();
    return {
      ok: true,
      sceneId: audit.sceneId,
      filename: `mr-calligraphy-${audit.sceneId}-remote-receipts-${generatedAt.slice(0, 10)}.html`,
      html: renderReceiptAuditHtml(audit, generatedAt),
      message: `已生成 ${audit.sceneLabel}远端发布回执审计导出。`
    };
  }

  function getWorkflow(sceneId, options = {}) {
    const normalizedId = normalizeSceneId(sceneId);
    const scene = readState().scenes[normalizedId];
    const packaged = createPackage(normalizedId, options);
    const current = packaged.ok ? createCurrentPackageSummary(packaged.package) : {
      releaseId: "",
      packageDigest: "",
      validation: packaged.validation || null
    };
    const review = normalizeReviewState(scene.review);
    const lock = normalizeLockState(scene.lock);
    const reviewMatches = Boolean(
      current.releaseId &&
      current.packageDigest &&
      review.releaseId === current.releaseId &&
      review.packageDigest === current.packageDigest
    );
    const lockMatches = Boolean(
      lock.lockedAt &&
      current.packageDigest &&
      (lock.packageDigest === current.packageDigest || lock.releaseId === current.releaseId)
    );
    const staleLock = Boolean(lock.lockedAt && !lockMatches);
    const approvedForCurrent = review.status === "approved" && reviewMatches;
    const validationWarnings = Array.isArray(current.validation?.warnings) ? current.validation.warnings : [];

    let tone = "idle";
    let message = packaged.ok ? "当前发布包尚未提交本机审核。" : packaged.message;
    if (packaged.ok && review.status === "reviewing" && reviewMatches) {
      tone = "review";
      message = `当前发布包待审核：${shortDigest(current.packageDigest)}。`;
    } else if (packaged.ok && review.status === "approved" && reviewMatches) {
      tone = "ready";
      message = `当前发布包已审核通过，可推送：${shortDigest(current.packageDigest)}。`;
    } else if (packaged.ok && review.status === "rejected" && reviewMatches) {
      tone = "warning";
      message = `当前发布包已退回：${review.rejectionReason || "未填写原因"}。`;
    } else if (packaged.ok && review.status !== "draft" && !reviewMatches) {
      tone = "warning";
      message = "当前发布包与最近审核记录不一致，请重新提交审核。";
    }
    if (lockMatches) {
      tone = "warning";
      message = `当前发布包已被发布锁保护：${lock.reason || "防止重复推送"}。`;
    } else if (staleLock && approvedForCurrent) {
      message += " 上一个发布包仍有锁定记录，可按需解除。";
    }
    if (validationWarnings.length && !lockMatches) {
      tone = "warning";
      message += ` 预检警告：${validationWarnings.join("；")}`;
    }

    return {
      ok: true,
      sceneId: normalizedId,
      canRequestReview: Boolean(packaged.ok && current.packageDigest),
      canApprove: Boolean(packaged.ok && review.status === "reviewing" && reviewMatches && !lockMatches),
      canReject: Boolean(review.status === "reviewing"),
      canUnlock: Boolean(lock.lockedAt),
      canPush: Boolean(packaged.ok && approvedForCurrent && !lockMatches),
      blockedReason: packaged.ok ? getWorkflowBlockedReason({ review, reviewMatches, lockMatches, approvedForCurrent }) : packaged.message,
      tone,
      message,
      current,
      warnings: validationWarnings,
      review,
      lock,
      reviewMatches,
      lockMatches,
      staleLock
    };
  }

  function getWorkflowBlockedReason({ review, reviewMatches, lockMatches, approvedForCurrent }) {
    if (lockMatches) return "当前发布包被发布锁保护，请确认后解除发布锁。";
    if (approvedForCurrent) return "";
    if (review.status === "reviewing" && reviewMatches) return "当前发布包正在本机审核中。";
    if (review.status === "approved" && !reviewMatches) return "当前发布包与已审核版本不一致，请重新提交审核。";
    if (review.status === "rejected" && reviewMatches) return "当前发布包已被退回，请修改或重新提交审核。";
    return "当前发布包尚未通过本机审核。";
  }

  function requestReview(sceneId, options = {}) {
    const normalizedId = normalizeSceneId(sceneId);
    const packaged = createPackage(normalizedId, options);
    if (!packaged.ok) {
      return saveRemoteError(normalizedId, packaged.message || "远端发布包无法提交审核。");
    }
    const summary = createCurrentPackageSummary(packaged.package);
    const state = readState();
    const now = new Date().toISOString();
    state.scenes[normalizedId] = normalizeSceneState({
      ...state.scenes[normalizedId],
      review: {
        status: "reviewing",
        releaseId: summary.releaseId,
        packageDigest: summary.packageDigest,
        requestedAt: now,
        requestedBy: normalizeActor(options.requestedBy || options.actor || "本机管理员"),
        note: normalizeNote(options.note || packaged.package.release.note || "")
      },
      lastRemoteStatus: `当前发布包已提交本机审核：${shortDigest(summary.packageDigest)}。`,
      lastError: ""
    });
    writeState(state);
    return {
      ok: true,
      status: getStatus(normalizedId, options),
      workflow: getWorkflow(normalizedId, options),
      message: `已提交远端发布本机审核：${shortDigest(summary.packageDigest)}。`
    };
  }

  function approveReview(sceneId, options = {}) {
    const normalizedId = normalizeSceneId(sceneId);
    const workflow = getWorkflow(normalizedId, options);
    if (!workflow.canApprove) {
      return saveRemoteError(normalizedId, workflow.blockedReason || "当前发布包不能通过审核。");
    }
    const state = readState();
    const now = new Date().toISOString();
    state.scenes[normalizedId] = normalizeSceneState({
      ...state.scenes[normalizedId],
      review: {
        ...state.scenes[normalizedId].review,
        status: "approved",
        approvedAt: now,
        approvedBy: normalizeActor(options.approvedBy || options.actor || "本机管理员"),
        note: normalizeNote(options.note || state.scenes[normalizedId].review.note || "")
      },
      lastRemoteStatus: `当前发布包已通过本机审核：${shortDigest(workflow.current.packageDigest)}。`,
      lastError: ""
    });
    writeState(state);
    return {
      ok: true,
      status: getStatus(normalizedId, options),
      workflow: getWorkflow(normalizedId, options),
      message: "远端发布包已通过本机审核，可以推送。"
    };
  }

  function rejectReview(sceneId, options = {}) {
    const normalizedId = normalizeSceneId(sceneId);
    const state = readState();
    const review = normalizeReviewState(state.scenes[normalizedId].review);
    if (review.status !== "reviewing") {
      return saveRemoteError(normalizedId, "当前没有待审核的远端发布包。");
    }
    const now = new Date().toISOString();
    const reason = normalizeNote(options.reason || options.note || "本机审核退回，需重新确认发布内容。");
    state.scenes[normalizedId] = normalizeSceneState({
      ...state.scenes[normalizedId],
      review: {
        ...review,
        status: "rejected",
        rejectedAt: now,
        rejectionReason: reason
      },
      lastRemoteStatus: `远端发布审核已退回：${reason}`,
      lastError: ""
    });
    writeState(state);
    return {
      ok: true,
      status: getStatus(normalizedId, options),
      workflow: getWorkflow(normalizedId, options),
      message: `已退回远端发布审核：${reason}`
    };
  }

  function unlock(sceneId, options = {}) {
    const normalizedId = normalizeSceneId(sceneId);
    const state = readState();
    const lock = normalizeLockState(state.scenes[normalizedId].lock);
    if (!lock.lockedAt) {
      return {
        ok: true,
        status: getStatus(normalizedId, options),
        workflow: getWorkflow(normalizedId, options),
        message: "当前没有远端发布锁。"
      };
    }
    state.scenes[normalizedId] = normalizeSceneState({
      ...state.scenes[normalizedId],
      lock: {},
      lastRemoteStatus: `已解除远端发布锁：${shortDigest(lock.packageDigest)}。`,
      lastError: ""
    });
    writeState(state);
    return {
      ok: true,
      status: getStatus(normalizedId, options),
      workflow: getWorkflow(normalizedId, options),
      message: "已解除远端发布锁，可以按审核状态继续推送。"
    };
  }

  function createPackage(sceneId, options = {}) {
    const normalizedId = normalizeSceneId(sceneId);
    const record = clone(options.record || {});
    const release = clone(options.release || getCurrentRelease(record));
    if (!record || typeof record !== "object" || !record.layout) {
      return { ok: false, message: "还没有可远端发布的本机发布版本。" };
    }
    if (!release || typeof release !== "object" || !release.layout) {
      return { ok: false, message: "发布记录缺少当前 release，无法生成远端发布包。" };
    }

    const createdAt = new Date().toISOString();
    const packageId = `remote-publish-${normalizedId}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const releaseLayout = clone(release.layout || record.layout || {});
    const assetManifest = createReleaseAssetManifest(releaseLayout, normalizedId);
    const payload = {
      kind: PACKAGE_KIND,
      version: VERSION,
      packageId,
      createdAt,
      sceneId: normalizedId,
      sceneLabel: String(options.sceneLabel || normalizedId),
      storageKey: String(options.storageKey || ""),
      boundary: BOUNDARY,
      release: {
        id: String(release.id || record.currentReleaseId || ""),
        releaseNumber: Number(release.releaseNumber || record.releaseNumber || 0),
        action: String(release.action || record.action || "publish"),
        note: String(release.note || record.note || ""),
        publishedAt: normalizeDate(release.publishedAt || record.publishedAt),
        stats: clone(release.stats || record.stats || {})
      },
      record,
      releaseLayout,
      assetManifest
    };
    payload.manifest = createPackageManifest(payload);
    const validation = validatePackage(payload);

    return {
      ok: validation.ok,
      package: payload,
      validation,
      message: validation.ok ? "远端发布包已生成并通过本机预检。" : `远端发布包预检失败：${validation.errors.join("；")}。`
    };
  }

  function createPackageManifest(payload = {}) {
    const releaseLayout = payload.releaseLayout || {};
    const objectSummary = summarizeReleaseLayout(releaseLayout);
    const assetManifest = normalizeAssetManifest(payload.assetManifest || createReleaseAssetManifest(releaseLayout, payload.sceneId));
    const assetSummary = summarizeAssetManifest(assetManifest);
    return {
      kind: "mr-calligraphy-remote-publish-manifest-v1",
      version: VERSION,
      sceneId: payload.sceneId || "",
      releaseId: payload.release?.id || "",
      releaseNumber: Number(payload.release?.releaseNumber || 0),
      storageKey: payload.storageKey || "",
      objectSummary,
      assetSummary,
      packageDigest: sha256StableJson({
        kind: payload.kind,
        version: payload.version,
        sceneId: payload.sceneId,
        sceneLabel: payload.sceneLabel,
        storageKey: payload.storageKey,
        release: payload.release,
        record: payload.record,
        releaseLayout: payload.releaseLayout,
        assetManifest
      }),
      recordDigest: sha256StableJson(payload.record || {}),
      releaseDigest: sha256StableJson(payload.release || {}),
      layoutDigest: sha256StableJson(releaseLayout),
      assetDigest: sha256StableJson(assetManifest)
    };
  }

  function summarizeReleaseLayout(layout = {}) {
    const objects = layout.objects && typeof layout.objects === "object" ? layout.objects : {};
    const customObjects = Array.isArray(layout.customObjects) ? layout.customObjects : [];
    const importedModels = Array.isArray(layout.importedModels) ? layout.importedModels : [];
    const visibleObjectCount = Object.values(objects).filter((object) => object?.visible !== false && object?.deleted !== true).length;
    return {
      objectCount: Object.keys(objects).length,
      visibleObjectCount,
      customObjectCount: customObjects.length,
      importedModelCount: importedModels.length,
      hasLighting: Boolean(layout.lighting && typeof layout.lighting === "object"),
      hasLayerOrder: Array.isArray(layout.layerOrder)
    };
  }

  function createReleaseAssetManifest(layout = {}, sceneId = "") {
    const importedModels = Array.isArray(layout.importedModels) ? layout.importedModels : [];
    const assets = [];
    importedModels.forEach((record, index) => {
      const id = String(record?.id || record?.dbKey || record?.key || `asset-${index + 1}`);
      const dbKey = String(record?.dbKey || record?.key || record?.id || id);
      const sha256 = normalizeSha256(record?.sha256);
      assets.push({
        id,
        dbKey,
        modelId: id,
        assetKind: "model",
        label: String(record?.label || record?.fileName || id).slice(0, 120),
        fileName: String(record?.fileName || "").slice(0, 160),
        type: String(record?.type || "").slice(0, 16),
        bytes: Math.max(0, Math.round(Number(record?.metrics?.fileBytes || record?.bytes || record?.size || 0))),
        sha256,
        hashStatus: sha256 ? "sha256" : "missing-hash"
      });
      const texture = record?.texture && typeof record.texture === "object" ? record.texture : null;
      if (texture) {
        const textureId = String(texture.id || texture.dbKey || texture.key || `${id}-texture-${index + 1}`);
        const textureDbKey = String(texture.dbKey || texture.key || texture.id || textureId);
        const textureSha256 = normalizeSha256(texture.sha256);
        assets.push({
          id: textureId,
          dbKey: textureDbKey,
          modelId: id,
          assetKind: "texture",
          label: String(texture.label || texture.fileName || `${record?.label || id} 贴图`).slice(0, 120),
          fileName: String(texture.fileName || "").slice(0, 160),
          type: String(texture.type || texture.mimeType || "texture").slice(0, 16),
          bytes: Math.max(0, Math.round(Number(texture.fileBytes || texture.bytes || texture.size || 0))),
          sha256: textureSha256,
          hashStatus: textureSha256 ? "sha256" : "missing-hash"
        });
      }
    });
    return normalizeAssetManifest({
      version: 1,
      sceneId: normalizeSceneId(sceneId),
      assets
    });
  }

  function normalizeAssetManifest(manifest = {}) {
    const source = manifest && typeof manifest === "object" ? manifest : {};
    const assets = Array.isArray(source.assets) ? source.assets : [];
    return {
      version: VERSION,
      sceneId: normalizeSceneId(source.sceneId),
      assets: assets.map((asset, index) => normalizeAssetRecord(asset, index))
    };
  }

  function normalizeAssetRecord(asset = {}, index = 0) {
    const id = String(asset?.id || asset?.dbKey || asset?.key || `asset-${index + 1}`);
    const dbKey = String(asset?.dbKey || asset?.key || asset?.id || id);
    const sha256 = normalizeSha256(asset?.sha256);
    const assetKind = asset?.assetKind === "texture" ? "texture" : "model";
    return {
      id,
      dbKey,
      modelId: String(asset?.modelId || (assetKind === "model" ? id : "")).slice(0, 160),
      assetKind,
      label: String(asset?.label || asset?.fileName || id).slice(0, 120),
      fileName: String(asset?.fileName || "").slice(0, 160),
      type: String(asset?.type || "").slice(0, 16),
      bytes: Math.max(0, Math.round(Number(asset?.bytes || asset?.metrics?.fileBytes || 0))),
      sha256,
      hashStatus: sha256 ? "sha256" : "missing-hash"
    };
  }

  function summarizeAssetManifest(manifest = {}) {
    const normalized = normalizeAssetManifest(manifest);
    const assets = normalized.assets;
    const modelAssets = assets.filter((asset) => asset.assetKind !== "texture");
    const textureAssets = assets.filter((asset) => asset.assetKind === "texture");
    return {
      importedModelCount: modelAssets.length,
      assetCount: assets.length,
      modelAssetCount: modelAssets.length,
      textureAssetCount: textureAssets.length,
      hashedAssetCount: assets.filter((asset) => Boolean(asset.sha256)).length,
      missingHashCount: assets.filter((asset) => !asset.sha256).length,
      totalBytes: assets.reduce((sum, asset) => sum + Math.max(0, Number(asset.bytes || 0)), 0)
    };
  }

  function validatePackage(payload = {}) {
    const errors = [];
    const warnings = [];
    if (!payload || typeof payload !== "object") {
      return {
        ok: false,
        errors: ["发布包为空"],
        warnings,
        message: "远端发布包为空。"
      };
    }
    if (payload.kind !== PACKAGE_KIND) {
      errors.push("发布包 kind 不匹配");
    }
    if (Number(payload.version) !== VERSION) {
      errors.push("发布包版本不匹配");
    }
    if (!payload.sceneId) {
      errors.push("缺少 sceneId");
    }
    if (!payload.release?.id) {
      errors.push("缺少 release.id");
    }
    if (!payload.record || typeof payload.record !== "object" || !payload.record.layout) {
      errors.push("缺少本机发布记录 layout");
    }
    if (!payload.releaseLayout || typeof payload.releaseLayout !== "object") {
      errors.push("缺少 releaseLayout");
    }
    if (!payload.assetManifest || typeof payload.assetManifest !== "object") {
      errors.push("缺少 assetManifest");
    }
    if (!payload.manifest || typeof payload.manifest !== "object") {
      errors.push("缺少 manifest");
    }

    if (payload.manifest && typeof payload.manifest === "object") {
      const expectedManifest = createPackageManifest(payload);
      compareManifestField(errors, payload.manifest, expectedManifest, "packageDigest", "发布包摘要不匹配");
      compareManifestField(errors, payload.manifest, expectedManifest, "recordDigest", "发布记录摘要不匹配");
      compareManifestField(errors, payload.manifest, expectedManifest, "releaseDigest", "release 摘要不匹配");
      compareManifestField(errors, payload.manifest, expectedManifest, "layoutDigest", "布局摘要不匹配");
      compareManifestField(errors, payload.manifest, expectedManifest, "assetDigest", "资产摘要不匹配");
      if (stableStringify(payload.manifest.objectSummary || {}) !== stableStringify(expectedManifest.objectSummary)) {
        errors.push("布局对象摘要不匹配");
      }
      if (stableStringify(payload.manifest.assetSummary || {}) !== stableStringify(expectedManifest.assetSummary)) {
        errors.push("资产摘要统计不匹配");
      }
      if (payload.manifest.sceneId !== expectedManifest.sceneId) {
        errors.push("manifest sceneId 不匹配");
      }
      if (payload.manifest.releaseId !== expectedManifest.releaseId) {
        errors.push("manifest releaseId 不匹配");
      }
    }

    const objectSummary = payload.manifest?.objectSummary || {};
    if (
      Number(objectSummary.objectCount || 0) === 0 &&
      Number(objectSummary.customObjectCount || 0) === 0 &&
      Number(objectSummary.importedModelCount || 0) === 0
    ) {
      warnings.push("发布布局没有可统计对象，请确认是否为空场景。");
    }
    const assetSummary = payload.manifest?.assetSummary || {};
    if (Number(assetSummary.importedModelCount || 0) !== Number(objectSummary.importedModelCount || 0)) {
      errors.push("导入模型资产数量与布局不匹配");
    }
    if (!assetManifestMatchesLayout(payload.assetManifest, payload.releaseLayout)) {
      errors.push("导入模型资产清单与布局不匹配");
    }
    if (Number(assetSummary.missingHashCount || 0) > 0) {
      warnings.push(`远端发布包有 ${assetSummary.missingHashCount} 个导入模型缺少 SHA-256，请重新导入或用项目档案刷新资产哈希。`);
    }

    return {
      ok: errors.length === 0,
      errors,
      warnings,
      message: errors.length ? `远端发布包预检失败：${errors.join("；")}。` : "远端发布包预检通过。"
    };
  }

  function compareManifestField(errors, actual, expected, key, message) {
    if (actual?.[key] !== expected?.[key]) {
      errors.push(message);
    }
  }

  function assetManifestMatchesLayout(assetManifest = {}, layout = {}) {
    const importedModels = Array.isArray(layout?.importedModels) ? layout.importedModels : [];
    const layoutIds = new Set(importedModels.map((record, index) => {
      return String(record?.id || record?.dbKey || record?.key || `asset-${index + 1}`);
    }));
    const assets = normalizeAssetManifest(assetManifest).assets;
    const modelAssetIds = new Set(assets.filter((asset) => asset.assetKind !== "texture").map((asset) => asset.id));
    if (layoutIds.size !== modelAssetIds.size) {
      return false;
    }
    if (![...layoutIds].every((id) => modelAssetIds.has(id))) {
      return false;
    }
    const textureKeys = new Set(importedModels.map((record) => {
      const texture = record?.texture && typeof record.texture === "object" ? record.texture : null;
      return texture ? String(texture.dbKey || texture.key || texture.id || "") : "";
    }).filter(Boolean));
    const textureAssetKeys = new Set(assets.filter((asset) => asset.assetKind === "texture").map((asset) => asset.dbKey || asset.id).filter(Boolean));
    if (textureKeys.size !== textureAssetKeys.size) {
      return false;
    }
    return [...textureKeys].every((key) => textureAssetKeys.has(key));
  }

  function createCurrentPackageSummary(payload = {}) {
    return {
      releaseId: payload.release?.id ? String(payload.release.id) : "",
      packageDigest: normalizeSha256(payload.manifest?.packageDigest),
      validation: validatePackage(payload)
    };
  }

  function getCurrentRelease(record = {}) {
    const releases = Array.isArray(record.releases) ? record.releases : [];
    return releases.find((release) => release?.id === record.currentReleaseId)
      || releases[0]
      || (record.layout ? record : null);
  }

  async function check(sceneId) {
    const normalizedId = normalizeSceneId(sceneId);
    const state = readState();
    const scene = state.scenes[normalizedId];
    if (!scene.endpoint) {
      return saveRemoteError(normalizedId, "尚未配置远端发布 API。");
    }
    if (typeof fetch !== "function") {
      return saveRemoteError(normalizedId, "当前运行环境不支持 fetch，无法检查远端发布 API。");
    }

    try {
      const response = await fetch(scene.endpoint, createRequest(scene));
      const parsed = await parseResponse(response, "远端发布 API 检查通过。");
      if (!parsed.ok) {
        return saveRemoteError(normalizedId, parsed.message);
      }
      const nextState = readState();
      nextState.scenes[normalizedId] = normalizeSceneState({
        ...nextState.scenes[normalizedId],
        lastCheckedAt: new Date().toISOString(),
        lastRemoteVersion: parsed.remoteVersion,
        lastRemoteStatus: parsed.message,
        lastError: ""
      });
      writeState(nextState);
      return { ok: true, status: getStatus(normalizedId), message: `${parsed.message} ${BOUNDARY}` };
    } catch (error) {
      return saveRemoteError(normalizedId, `远端发布 API 检查失败：${error?.message || "网络请求异常"}。`);
    }
  }

  async function push(sceneId, options = {}) {
    const normalizedId = normalizeSceneId(sceneId);
    const state = readState();
    const scene = state.scenes[normalizedId];
    if (!scene.endpoint) {
      return saveRemoteError(normalizedId, "尚未配置远端发布 API。");
    }
    if (typeof fetch !== "function") {
      return saveRemoteError(normalizedId, "当前运行环境不支持 fetch，无法推送远端发布包。");
    }

    const packaged = createPackage(normalizedId, options);
    if (!packaged.ok) {
      return saveRemoteError(normalizedId, packaged.message || "远端发布包预检失败。");
    }
    const validation = validatePackage(packaged.package);
    if (!validation.ok) {
      return saveRemoteError(normalizedId, validation.message);
    }
    const workflow = getWorkflow(normalizedId, options);
    if (!workflow.canPush) {
      return saveRemoteError(normalizedId, workflow.blockedReason || "远端发布包尚未通过本机审核。");
    }

    const serverLockCheck = await checkRemotePublishServerLock(normalizedId, scene, packaged.package);
    if (!serverLockCheck.ok) {
      return serverLockCheck;
    }

    const lock = acquirePublishLock(normalizedId, packaged.package, "远端发布包正在推送，阻止重复提交。");
    if (!lock.ok) {
      return saveRemoteError(normalizedId, lock.message);
    }

    try {
      const response = await fetch(scene.endpoint, createRequest(scene, {
        method: "POST",
        body: packaged.package
      }));
      const parsed = await parseResponse(response, "远端发布 API 已接收发布包。");
      if (!parsed.ok) {
        const conflict = getRemotePublishLockConflict(normalizedId, packaged.package, parsed);
        if (conflict) {
          return persistRemotePublishServerLock(normalizedId, packaged.package, conflict);
        }
        releasePublishLock(normalizedId, packaged.package);
        return saveRemoteError(normalizedId, parsed.message);
      }

      const now = new Date().toISOString();
      const receipt = createRemoteReceiptRecord(normalizedId, packaged.package, parsed, scene.endpoint, now);
      const releaseId = receipt.releaseId || packaged.package.release.id;
      const nextState = readState();
      nextState.scenes[normalizedId] = normalizeSceneState({
        ...nextState.scenes[normalizedId],
        lastCheckedAt: now,
        lastPushedAt: now,
        lastPackageId: receipt.packageId || packaged.package.packageId,
        lastReleaseId: releaseId,
        lastRemoteVersion: receipt.remoteVersion || parsed.remoteVersion,
        lastRemoteStatus: parsed.message,
        lastRemoteDirection: "publish",
        lastPackageDigest: packaged.package.manifest?.packageDigest,
        lock: {
          lockedAt: lock.lockedAt,
          releaseId,
          packageDigest: packaged.package.manifest?.packageDigest,
          reason: "远端已接收该发布包，发布锁用于防止重复推送。",
          source: "remote"
        },
        receipts: [receipt, ...nextState.scenes[normalizedId].receipts].slice(0, MAX_RECEIPTS),
        lastError: ""
      });
      writeState(nextState);
      return {
        ok: true,
        status: getStatus(normalizedId),
        packageId: receipt.packageId || packaged.package.packageId,
        releaseId,
        packageDigest: packaged.package.manifest?.packageDigest || "",
        validation,
        remoteVersion: receipt.remoteVersion || parsed.remoteVersion,
        receipt,
        message: `${parsed.message} ${BOUNDARY}`
      };
    } catch (error) {
      releasePublishLock(normalizedId, packaged.package);
      return saveRemoteError(normalizedId, `远端发布 API 推送失败：${error?.message || "网络请求异常"}。`);
    }
  }

  async function revoke(sceneId, options = {}) {
    const normalizedId = normalizeSceneId(sceneId);
    const state = readState();
    const scene = state.scenes[normalizedId];
    if (!scene.endpoint) {
      return saveRemoteError(normalizedId, "尚未配置远端发布 API。");
    }
    if (typeof fetch !== "function") {
      return saveRemoteError(normalizedId, "当前运行环境不支持 fetch，无法撤销远端发布。");
    }
    const latestReceipt = getLatestRevocableReceipt(scene);
    if (!latestReceipt) {
      return saveRemoteError(normalizedId, "没有可撤销的最近远端发布回执。");
    }
    const revokePackage = createRemoteRevokePackage(normalizedId, latestReceipt, options);
    try {
      const response = await fetch(scene.endpoint, createRequest(scene, {
        method: "DELETE",
        body: revokePackage
      }));
      const parsed = await parseResponse(response, "远端发布 API 已接收撤销请求。");
      if (!parsed.ok) {
        return saveRemoteError(normalizedId, parsed.message);
      }
      const now = new Date().toISOString();
      const receipt = createRemoteRevokeReceiptRecord(normalizedId, revokePackage, parsed, scene.endpoint, now);
      const nextState = readState();
      nextState.scenes[normalizedId] = normalizeSceneState({
        ...nextState.scenes[normalizedId],
        lastCheckedAt: now,
        lastRevokedAt: now,
        lastRemoteDirection: "revoke",
        lastRemoteVersion: receipt.remoteVersion || parsed.remoteVersion,
        lastRemoteStatus: parsed.message,
        lock: {},
        receipts: [receipt, ...nextState.scenes[normalizedId].receipts].slice(0, MAX_RECEIPTS),
        lastError: ""
      });
      writeState(nextState);
      return {
        ok: true,
        status: getStatus(normalizedId),
        packageId: receipt.packageId || revokePackage.revokeId,
        sourcePackageId: receipt.sourcePackageId || revokePackage.sourcePackageId,
        releaseId: receipt.releaseId || revokePackage.releaseId,
        packageDigest: receipt.packageDigest || revokePackage.packageDigest,
        remoteVersion: receipt.remoteVersion || parsed.remoteVersion,
        receipt,
        message: `${parsed.message} ${BOUNDARY}`
      };
    } catch (error) {
      return saveRemoteError(normalizedId, `远端发布 API 撤销失败：${error?.message || "网络请求异常"}。`);
    }
  }

  function acquirePublishLock(sceneId, payload, reason) {
    const normalizedId = normalizeSceneId(sceneId);
    const state = readState();
    const scene = state.scenes[normalizedId];
    const summary = createCurrentPackageSummary(payload);
    const currentLock = normalizeLockState(scene.lock);
    if (
      currentLock.lockedAt &&
      summary.packageDigest &&
      (currentLock.packageDigest === summary.packageDigest || currentLock.releaseId === summary.releaseId)
    ) {
      return {
        ok: false,
        message: `当前发布包已有发布锁：${currentLock.reason || "防止重复推送"}。`
      };
    }
    const lockedAt = new Date().toISOString();
    state.scenes[normalizedId] = normalizeSceneState({
      ...scene,
      lock: {
        lockedAt,
        releaseId: summary.releaseId,
        packageDigest: summary.packageDigest,
        reason,
        source: "in-flight"
      },
      lastRemoteStatus: reason,
      lastError: ""
    });
    writeState(state);
    return { ok: true, lockedAt };
  }

  function releasePublishLock(sceneId, payload) {
    const normalizedId = normalizeSceneId(sceneId);
    const state = readState();
    const scene = state.scenes[normalizedId];
    const summary = createCurrentPackageSummary(payload);
    const currentLock = normalizeLockState(scene.lock);
    if (
      currentLock.lockedAt &&
      summary.packageDigest &&
      (currentLock.packageDigest === summary.packageDigest || currentLock.releaseId === summary.releaseId)
    ) {
      state.scenes[normalizedId] = normalizeSceneState({
        ...scene,
        lock: {}
      });
      writeState(state);
    }
  }

  function createRequest(scene, options = {}) {
    const headers = {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {})
    };
    if (scene.token) {
      headers.Authorization = `Bearer ${scene.token}`;
    }
    return {
      method: options.method || "GET",
      headers,
      ...(options.body ? { body: JSON.stringify(options.body) } : {})
    };
  }

  async function parseResponse(response, fallbackMessage) {
    if (!response) {
      return { ok: false, status: 0, message: "远端发布 API 请求失败：无响应。" };
    }
    let payload = {};
    try {
      const text = typeof response.text === "function"
        ? await response.text()
        : JSON.stringify(typeof response.json === "function" ? await response.json() : {});
      payload = text ? JSON.parse(text) : {};
    } catch (error) {
      return { ok: false, message: "远端发布 API 返回的不是可解析 JSON。" };
    }

    if (response.ok === false) {
      const status = response.status ? `HTTP ${response.status}` : "无响应";
      return normalizeParsedRemotePayload(payload, false, payload.message || `远端发布 API 请求失败：${status}。`, response.status || 0);
    }
    if (payload.ok === false) {
      return normalizeParsedRemotePayload(payload, false, payload.message || "远端发布 API 拒绝了本次请求。", response.status || 200);
    }
    return normalizeParsedRemotePayload(payload, true, payload.message || fallbackMessage, response.status || 200);
  }

  function normalizeParsedRemotePayload(payload = {}, ok, message, status = 0) {
    const source = payload && typeof payload === "object" ? payload : {};
    const receipt = source.receipt && typeof source.receipt === "object" ? clone(source.receipt) : null;
    const assetSignatures = normalizeAssetSignatures(source.assetSignatures || receipt?.assetSignatures);
    const assetSignatureSummary = normalizeAssetSignatureSummary(source.assetSignatureSummary || receipt?.assetSignatureSummary, assetSignatures);
    const cdnUploadSummary = normalizeCdnUploadSummary(source.cdnUploadSummary || receipt?.cdnUploadSummary || source.cdnUpload || receipt?.cdnUpload);
    const cdnPurgeSummary = normalizeCdnPurgeSummary(source.cdnPurgeSummary || receipt?.cdnPurgeSummary || source.cdnPurge || receipt?.cdnPurge);
    return {
      ok,
      status,
      message,
      packageId: source.packageId ? String(source.packageId) : "",
      sourcePackageId: source.sourcePackageId || receipt?.sourcePackageId ? String(source.sourcePackageId || receipt?.sourcePackageId).slice(0, 160) : "",
      releaseId: source.releaseId ? String(source.releaseId).slice(0, 160) : "",
      packageDigest: normalizeSha256(source.packageDigest || receipt?.packageDigest),
      receiptDigest: normalizeSha256(source.receiptDigest || receipt?.receiptDigest),
      remoteVersion: source.remoteVersion ? String(source.remoteVersion).slice(0, 120) : "",
      receipt,
      latestReceipt: normalizeRemoteStatusReceipt(source.latestReceipt),
      publishLock: normalizeRemotePublishLock(source.publishLock || source.lock),
      receiptCount: normalizeCount(source.receiptCount),
      warnings: normalizeWarningList(source.warnings || receipt?.warnings),
      assetSignatureSummary,
      assetSignatures,
      cdnUploadSummary,
      cdnPurgeSummary
    };
  }

  async function checkRemotePublishServerLock(sceneId, scene, payload) {
    try {
      const response = await fetch(scene.endpoint, createRequest(scene));
      const parsed = await parseResponse(response, "远端发布 API 检查通过。");
      if (!parsed.ok) {
        return saveRemoteError(sceneId, `远端发布锁校验失败：${parsed.message}`);
      }
      const conflict = getRemotePublishLockConflict(sceneId, payload, parsed);
      if (conflict) {
        return persistRemotePublishServerLock(sceneId, payload, conflict);
      }
      const state = readState();
      state.scenes[sceneId] = normalizeSceneState({
        ...state.scenes[sceneId],
        lastCheckedAt: new Date().toISOString(),
        lastRemoteVersion: parsed.remoteVersion || state.scenes[sceneId].lastRemoteVersion,
        lastRemoteStatus: `远端发布锁校验通过：${parsed.message}`,
        lastError: ""
      });
      writeState(state);
      return { ok: true, status: getStatus(sceneId), remote: parsed };
    } catch (error) {
      return saveRemoteError(sceneId, `远端发布锁校验失败：${error?.message || "网络请求异常"}。`);
    }
  }

  function getRemotePublishLockConflict(sceneId, payload, parsed = {}) {
    const summary = createCurrentPackageSummary(payload);
    const remoteLock = parsed.publishLock?.locked ? parsed.publishLock : null;
    if (remoteLock && remoteLockMatches(sceneId, summary, remoteLock, true)) {
      return {
        source: "publishLock",
        packageDigest: remoteLock.packageDigest || summary.packageDigest,
        releaseId: remoteLock.releaseId || summary.releaseId,
        lockedAt: remoteLock.lockedAt,
        remoteVersion: parsed.remoteVersion,
        reason: remoteLock.reason || "远端服务当前有发布锁。"
      };
    }

    const latestReceipt = parsed.latestReceipt;
    if (latestReceipt && latestReceipt.direction !== "revoke" && remoteLockMatches(sceneId, summary, latestReceipt, false)) {
      return {
        source: "latestReceipt",
        packageDigest: latestReceipt.packageDigest || summary.packageDigest,
        releaseId: latestReceipt.releaseId || summary.releaseId,
        packageId: latestReceipt.packageId,
        lockedAt: latestReceipt.acceptedAt || latestReceipt.pushedAt,
        remoteVersion: parsed.remoteVersion || latestReceipt.remoteVersion,
        reason: "远端服务已经接收过相同发布包。"
      };
    }

    if (parsed.status === 409 && remoteLockMatches(sceneId, summary, parsed, false)) {
      return {
        source: "http409",
        packageDigest: parsed.packageDigest || summary.packageDigest,
        releaseId: parsed.releaseId || summary.releaseId,
        packageId: parsed.packageId,
        remoteVersion: parsed.remoteVersion,
        reason: parsed.message || "远端服务拒绝重复发布包。"
      };
    }
    return null;
  }

  function remoteLockMatches(sceneId, summary, remote = {}, allowSceneWideLock = false) {
    const remoteSceneId = remote.sceneId ? normalizeSceneId(remote.sceneId) : sceneId;
    if (remoteSceneId !== sceneId) {
      return false;
    }
    const remoteDigest = normalizeSha256(remote.packageDigest);
    const remoteReleaseId = remote.releaseId ? String(remote.releaseId) : "";
    if (remoteDigest && summary.packageDigest && remoteDigest === summary.packageDigest) {
      return true;
    }
    if (remoteReleaseId && summary.releaseId && remoteReleaseId === summary.releaseId) {
      return true;
    }
    return Boolean(allowSceneWideLock && !remoteDigest && !remoteReleaseId);
  }

  function persistRemotePublishServerLock(sceneId, payload, conflict = {}) {
    const summary = createCurrentPackageSummary(payload);
    const lockedAt = normalizeDate(conflict.lockedAt) || new Date().toISOString();
    const packageDigest = normalizeSha256(conflict.packageDigest) || summary.packageDigest;
    const releaseId = conflict.releaseId ? String(conflict.releaseId).slice(0, 120) : summary.releaseId;
    const reason = conflict.reason || "远端服务发布锁阻止本次推送。";
    const message = `远端发布锁校验阻止推送：${reason}`;
    const state = readState();
    state.scenes[sceneId] = normalizeSceneState({
      ...state.scenes[sceneId],
      lastCheckedAt: new Date().toISOString(),
      lastRemoteVersion: conflict.remoteVersion || state.scenes[sceneId].lastRemoteVersion,
      lastRemoteStatus: message,
      lastError: message,
      lock: {
        lockedAt,
        releaseId,
        packageDigest,
        reason,
        source: "remote"
      }
    });
    writeState(state);
    return {
      ok: false,
      status: getStatus(sceneId),
      packageId: conflict.packageId || "",
      releaseId,
      packageDigest,
      message
    };
  }

  function normalizeRemoteStatusReceipt(receipt = {}) {
    const source = receipt && typeof receipt === "object" ? receipt : null;
    if (!source) {
      return null;
    }
    const packageDigest = normalizeSha256(source.packageDigest || source.manifest?.packageDigest);
    const releaseId = source.releaseId ? String(source.releaseId).slice(0, 160) : "";
    const packageId = source.packageId ? String(source.packageId).slice(0, 160) : "";
    if (!packageDigest && !releaseId && !packageId) {
      return null;
    }
    const assetSignatures = normalizeAssetSignatures(source.assetSignatures);
    const assetSignatureSummary = normalizeAssetSignatureSummary(source.assetSignatureSummary, assetSignatures);
    const direction = normalizeReceiptDirection(source.direction || source.receiptKind);
    const cdnUploadSummary = normalizeCdnUploadSummary(source.cdnUploadSummary || source.cdnUpload);
    const cdnPurgeSummary = normalizeCdnPurgeSummary(source.cdnPurgeSummary || source.cdnPurge);
    return {
      sceneId: source.sceneId ? normalizeSceneId(source.sceneId) : "",
      packageId,
      sourcePackageId: source.sourcePackageId ? String(source.sourcePackageId).slice(0, 160) : "",
      releaseId,
      packageDigest,
      acceptedAt: normalizeDate(source.acceptedAt),
      pushedAt: normalizeDate(source.pushedAt),
      revokedAt: normalizeDate(source.revokedAt),
      direction,
      remoteVersion: source.remoteVersion ? String(source.remoteVersion).slice(0, 120) : "",
      reason: source.reason ? String(source.reason).slice(0, 160) : "",
      cdnUploadSummary,
      cdnPurgeSummary,
      assetSignatureSummary,
      assetSignatures
    };
  }

  function normalizeRemotePublishLock(lock = {}) {
    const source = lock && typeof lock === "object" ? lock : null;
    if (!source) {
      return null;
    }
    const packageDigest = normalizeSha256(source.packageDigest);
    const releaseId = source.releaseId ? String(source.releaseId).slice(0, 160) : "";
    const lockedAt = normalizeDate(source.lockedAt || source.acceptedAt);
    const locked = source.locked === true || source.active === true || Boolean(lockedAt || packageDigest || releaseId);
    if (!locked) {
      return { locked: false };
    }
    return {
      locked: true,
      sceneId: source.sceneId ? normalizeSceneId(source.sceneId) : "",
      packageDigest,
      releaseId,
      lockedAt,
      reason: source.reason ? String(source.reason).slice(0, 160) : "远端服务当前有发布锁。"
    };
  }

  function createRemoteReceiptRecord(sceneId, packagePayload, parsed, endpoint, pushedAt) {
    const normalizedId = normalizeSceneId(sceneId);
    const receipt = parsed.receipt && typeof parsed.receipt === "object" ? clone(parsed.receipt) : {};
    const releaseId = String(parsed.releaseId || receipt.releaseId || packagePayload.release?.id || "").slice(0, 160);
    const packageId = String(parsed.packageId || receipt.packageId || packagePayload.packageId || "").slice(0, 160);
    const packageDigest = normalizeSha256(parsed.packageDigest || receipt.packageDigest || packagePayload.manifest?.packageDigest);
    const acceptedAt = normalizeDate(receipt.acceptedAt) || pushedAt;
    const assetSignatures = normalizeAssetSignatures(parsed.assetSignatures || receipt.assetSignatures);
    const assetSignatureSummary = normalizeAssetSignatureSummary(parsed.assetSignatureSummary || receipt.assetSignatureSummary, assetSignatures);
    const cdnUploadSummary = normalizeCdnUploadSummary(parsed.cdnUploadSummary || receipt.cdnUploadSummary || parsed.cdnUpload || receipt.cdnUpload);
    const receiptDigest = normalizeSha256(parsed.receiptDigest || receipt.receiptDigest)
      || sha256StableJson({
        sceneId: normalizedId,
        packageId,
        releaseId,
        packageDigest,
        remoteVersion: parsed.remoteVersion || receipt.remoteVersion || "",
        acceptedAt,
        pushedAt,
        assetSignatureSummary,
        cdnUploadSummary
      });
    const warnings = normalizeWarningList(parsed.warnings || receipt.warnings);
    return normalizeRemoteReceipt({
      id: `remote-receipt-${normalizedId}-${receiptDigest.slice(0, 16)}`,
      sceneId: normalizedId,
      sceneLabel: packagePayload.sceneLabel || sceneLabelFromId(normalizedId),
      packageId,
      releaseId,
      packageDigest,
      receiptDigest,
      remoteVersion: parsed.remoteVersion || receipt.remoteVersion || "",
      endpoint,
      acceptedAt,
      pushedAt,
      message: parsed.message || "",
      direction: "publish",
      warningCount: warnings.length,
      warnings,
      cdnUploadSummary,
      assetSignatureSummary,
      assetSignatures,
      receiptKind: receipt.receiptKind || "",
      receipt
    });
  }

  function createRemoteRevokePackage(sceneId, latestReceipt, options = {}) {
    const normalizedId = normalizeSceneId(sceneId);
    const requestedAt = new Date().toISOString();
    return {
      kind: REVOKE_KIND,
      version: VERSION,
      revokeId: `remote-revoke-${normalizedId}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      requestedAt,
      sceneId: normalizedId,
      sceneLabel: String(options.sceneLabel || sceneLabelFromId(normalizedId)).slice(0, 80),
      sourcePackageId: String(latestReceipt.packageId || "").slice(0, 160),
      releaseId: String(latestReceipt.releaseId || "").slice(0, 160),
      packageDigest: normalizeSha256(latestReceipt.packageDigest),
      receiptDigest: normalizeSha256(latestReceipt.receiptDigest),
      reason: String(options.reason || "local-user-revoked-remote-publish").slice(0, 160),
      boundary: BOUNDARY
    };
  }

  function createRemoteRevokeReceiptRecord(sceneId, revokePackage, parsed, endpoint, revokedAt) {
    const normalizedId = normalizeSceneId(sceneId);
    const receipt = parsed.receipt && typeof parsed.receipt === "object" ? clone(parsed.receipt) : {};
    const packageId = String(parsed.packageId || receipt.packageId || revokePackage.revokeId || "").slice(0, 160);
    const sourcePackageId = String(receipt.sourcePackageId || parsed.sourcePackageId || revokePackage.sourcePackageId || "").slice(0, 160);
    const releaseId = String(parsed.releaseId || receipt.releaseId || revokePackage.releaseId || "").slice(0, 160);
    const packageDigest = normalizeSha256(parsed.packageDigest || receipt.packageDigest || revokePackage.packageDigest);
    const acceptedAt = normalizeDate(receipt.acceptedAt) || revokedAt;
    const cdnPurgeSummary = normalizeCdnPurgeSummary(parsed.cdnPurgeSummary || receipt.cdnPurgeSummary || parsed.cdnPurge || receipt.cdnPurge);
    const receiptDigest = normalizeSha256(parsed.receiptDigest || receipt.receiptDigest)
      || sha256StableJson({
        sceneId: normalizedId,
        packageId,
        sourcePackageId,
        releaseId,
        packageDigest,
        acceptedAt,
        revokedAt,
        cdnPurgeSummary,
        direction: "revoke"
      });
    const warnings = normalizeWarningList(parsed.warnings || receipt.warnings);
    return normalizeRemoteReceipt({
      id: `remote-revoke-receipt-${normalizedId}-${receiptDigest.slice(0, 16)}`,
      sceneId: normalizedId,
      sceneLabel: revokePackage.sceneLabel || sceneLabelFromId(normalizedId),
      packageId,
      sourcePackageId,
      releaseId,
      packageDigest,
      receiptDigest,
      remoteVersion: parsed.remoteVersion || receipt.remoteVersion || "",
      endpoint,
      acceptedAt,
      pushedAt: "",
      revokedAt: normalizeDate(receipt.revokedAt) || revokedAt,
      direction: "revoke",
      message: parsed.message || "",
      warningCount: warnings.length,
      warnings,
      cdnPurgeSummary,
      receiptKind: receipt.receiptKind || "mr-calligraphy-remote-publish-revoke-receipt-v1",
      receipt
    });
  }

  function getLatestRevocableReceipt(scene = {}) {
    const receipts = Array.isArray(scene.receipts) ? scene.receipts : [];
    const latest = receipts[0] || null;
    if (!latest || latest.direction === "revoke") {
      return null;
    }
    return latest.packageDigest || latest.releaseId || latest.packageId ? latest : null;
  }

  function saveRemoteError(sceneId, message) {
    const normalizedId = normalizeSceneId(sceneId);
    const state = readState();
    state.scenes[normalizedId] = normalizeSceneState({
      ...state.scenes[normalizedId],
      lastCheckedAt: new Date().toISOString(),
      lastError: message
    });
    writeState(state);
    return { ok: false, status: getStatus(normalizedId), message };
  }

  function normalizeSceneId(sceneId) {
    return sceneId === "realisticScene" ? "realisticScene" : "mainScene";
  }

  function sceneLabelFromId(sceneId) {
    return normalizeSceneId(sceneId) === "realisticScene" ? "写实场景" : "主场景";
  }

  function sha256StableJson(value) {
    return sha256String(stableStringify(value));
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

  function sha256String(value) {
    const bytes = utf8Bytes(String(value || ""));
    const bitLength = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) {
      bytes.push(0);
    }
    const high = Math.floor(bitLength / 0x100000000);
    const low = bitLength >>> 0;
    bytes.push(
      (high >>> 24) & 0xff,
      (high >>> 16) & 0xff,
      (high >>> 8) & 0xff,
      high & 0xff,
      (low >>> 24) & 0xff,
      (low >>> 16) & 0xff,
      (low >>> 8) & 0xff,
      low & 0xff
    );

    const hash = [
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
    const words = new Array(64);
    for (let offset = 0; offset < bytes.length; offset += 64) {
      for (let index = 0; index < 16; index += 1) {
        const cursor = offset + index * 4;
        words[index] = ((bytes[cursor] << 24) | (bytes[cursor + 1] << 16) | (bytes[cursor + 2] << 8) | bytes[cursor + 3]) >>> 0;
      }
      for (let index = 16; index < 64; index += 1) {
        const s0 = rotateRight(words[index - 15], 7) ^ rotateRight(words[index - 15], 18) ^ (words[index - 15] >>> 3);
        const s1 = rotateRight(words[index - 2], 17) ^ rotateRight(words[index - 2], 19) ^ (words[index - 2] >>> 10);
        words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, h] = hash;
      for (let index = 0; index < 64; index += 1) {
        const s1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + s1 + ch + constants[index] + words[index]) >>> 0;
        const s0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (s0 + maj) >>> 0;
        h = g;
        g = f;
        f = e;
        e = (d + temp1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) >>> 0;
      }
      hash[0] = (hash[0] + a) >>> 0;
      hash[1] = (hash[1] + b) >>> 0;
      hash[2] = (hash[2] + c) >>> 0;
      hash[3] = (hash[3] + d) >>> 0;
      hash[4] = (hash[4] + e) >>> 0;
      hash[5] = (hash[5] + f) >>> 0;
      hash[6] = (hash[6] + g) >>> 0;
      hash[7] = (hash[7] + h) >>> 0;
    }
    return hash.map((word) => word.toString(16).padStart(8, "0")).join("");
  }

  function utf8Bytes(value) {
    const bytes = [];
    for (let index = 0; index < value.length; index += 1) {
      let code = value.charCodeAt(index);
      if (code >= 0xd800 && code <= 0xdbff && index + 1 < value.length) {
        const next = value.charCodeAt(index + 1);
        if (next >= 0xdc00 && next <= 0xdfff) {
          code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
          index += 1;
        }
      }
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      } else if (code < 0x10000) {
        bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      } else {
        bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      }
    }
    return bytes;
  }

  function rotateRight(value, bits) {
    return (value >>> bits) | (value << (32 - bits));
  }

  function normalizeSha256(value) {
    const hash = String(value || "").trim().toLowerCase();
    return /^[a-f0-9]{64}$/.test(hash) ? hash : "";
  }

  function normalizeActor(value) {
    return String(value || "本机管理员").trim().slice(0, 80) || "本机管理员";
  }

  function normalizeNote(value) {
    return String(value || "").trim().slice(0, 160);
  }

  function normalizeCount(value, max = 9999) {
    const count = Math.max(0, Math.round(Number(value || 0)));
    return Math.min(count, max);
  }

  function normalizeWarningList(value) {
    const warnings = Array.isArray(value) ? value : [];
    return warnings.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 8);
  }

  function normalizeReceiptDirection(value) {
    const direction = String(value || "").toLowerCase();
    return direction.includes("revoke") || direction === "delete" ? "revoke" : "publish";
  }

  function normalizeCdnPurgeSummary(value = {}) {
    const source = value && typeof value === "object" ? value : {};
    const purgedAssetCount = normalizeCount(source.purgedAssetCount ?? source.assetCount);
    const purgedUrlCount = normalizeCount(source.purgedUrlCount ?? source.urlCount);
    return {
      kind: String(source.kind || "mr-calligraphy-remote-publish-cdn-purge-summary-v1").slice(0, 120),
      status: String(source.status || source.purgeStatus || "").slice(0, 80),
      cdnProvider: String(source.cdnProvider || source.provider || "").slice(0, 120),
      purgeRequestId: String(source.purgeRequestId || source.requestId || "").slice(0, 160),
      purgedAssetCount,
      purgedUrlCount,
      requestedAt: normalizeDate(source.requestedAt),
      completedAt: normalizeDate(source.completedAt)
    };
  }

  function normalizeCdnUploadSummary(value = {}) {
    const source = value && typeof value === "object" ? value : {};
    const uploadedAssetCount = normalizeCount(source.uploadedAssetCount ?? source.assetCount);
    const uploadedUrlCount = normalizeCount(source.uploadedUrlCount ?? source.urlCount);
    return {
      kind: String(source.kind || "mr-calligraphy-remote-publish-cdn-upload-summary-v1").slice(0, 120),
      status: String(source.status || source.uploadStatus || "").slice(0, 80),
      cdnProvider: String(source.cdnProvider || source.provider || "").slice(0, 120),
      uploadRequestId: String(source.uploadRequestId || source.requestId || "").slice(0, 160),
      uploadedAssetCount,
      uploadedUrlCount,
      baseUrl: String(source.baseUrl || source.cdnBaseUrl || "").slice(0, 240),
      assetDigest: normalizeSha256(source.assetDigest),
      uploadedAt: normalizeDate(source.uploadedAt || source.completedAt),
      completedAt: normalizeDate(source.completedAt || source.uploadedAt)
    };
  }

  function normalizeAssetSignatures(value) {
    const signatures = Array.isArray(value) ? value : [];
    return signatures.map((record, index) => {
      const source = record && typeof record === "object" ? record : {};
      const assetId = String(source.assetId || source.id || source.dbKey || `asset-${index + 1}`).slice(0, 160);
      const signature = normalizeSha256(source.signature);
      const sha256 = normalizeSha256(source.sha256);
      if (!assetId || !signature) {
        return null;
      }
      return {
        assetId,
        dbKey: String(source.dbKey || source.key || source.assetId || assetId).slice(0, 180),
        modelId: String(source.modelId || "").slice(0, 160),
        assetKind: source.assetKind === "texture" ? "texture" : "model",
        fileName: String(source.fileName || "").slice(0, 160),
        bytes: Math.max(0, Math.round(Number(source.bytes || 0))),
        sha256,
        packageDigest: normalizeSha256(source.packageDigest),
        assetDigest: normalizeSha256(source.assetDigest),
        signatureAlgorithm: String(source.signatureAlgorithm || "HMAC-SHA256").slice(0, 80),
        signingKeyId: String(source.signingKeyId || "").slice(0, 120),
        signature,
        signedAt: normalizeDate(source.signedAt)
      };
    }).filter(Boolean).slice(0, 80);
  }

  function normalizeAssetSignatureSummary(value = {}, signatures = []) {
    const source = value && typeof value === "object" ? value : {};
    const signedAssetCount = normalizeCount(source.signedAssetCount ?? signatures.length);
    return {
      kind: String(source.kind || "mr-calligraphy-remote-publish-asset-signature-summary-v1").slice(0, 120),
      signedAssetCount,
      unsignedAssetCount: normalizeCount(source.unsignedAssetCount),
      missingHashCount: normalizeCount(source.missingHashCount),
      signatureAlgorithm: String(source.signatureAlgorithm || signatures[0]?.signatureAlgorithm || "").slice(0, 80),
      signingKeyId: String(source.signingKeyId || signatures[0]?.signingKeyId || "").slice(0, 120),
      assetDigest: normalizeSha256(source.assetDigest || signatures[0]?.assetDigest),
      signedAt: normalizeDate(source.signedAt || signatures[0]?.signedAt)
    };
  }

  function shortDigest(value) {
    const digest = normalizeSha256(value);
    return digest ? `${digest.slice(0, 10)}...` : "摘要未知";
  }

  function formatDateTime(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "时间未知";
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function renderReceiptAuditHtml(audit, generatedAt) {
    const rows = audit.receipts.map((receipt) => {
      const warnings = receipt.warnings.length ? receipt.warnings.join("；") : "无";
      const assetSignatureText = formatAssetSignatureSummary(receipt.assetSignatureSummary);
      const cdnUploadText = formatCdnUploadSummary(receipt.cdnUploadSummary);
      const cdnPurgeText = formatCdnPurgeSummary(receipt.cdnPurgeSummary);
      return `
        <section class="receipt">
          <h2>${escapeHtml(receipt.packageId || "packageId 未知")}</h2>
          <dl>
            <dt>Direction</dt><dd>${escapeHtml(formatReceiptDirection(receipt.direction))}</dd>
            <dt>Release</dt><dd>${escapeHtml(receipt.releaseId || "未知")}</dd>
            <dt>Source Package</dt><dd>${escapeHtml(receipt.sourcePackageId || "无")}</dd>
            <dt>Package Digest</dt><dd>${escapeHtml(receipt.packageDigest || "未知")}</dd>
            <dt>Receipt Digest</dt><dd>${escapeHtml(receipt.receiptDigest || "未知")}</dd>
            <dt>Remote Version</dt><dd>${escapeHtml(receipt.remoteVersion || "未知")}</dd>
            <dt>Endpoint</dt><dd>${escapeHtml(receipt.endpoint || "未知")}</dd>
            <dt>Accepted At</dt><dd>${escapeHtml(receipt.acceptedAt || "未知")}</dd>
            <dt>Pushed At</dt><dd>${escapeHtml(receipt.pushedAt || "未知")}</dd>
            <dt>Revoked At</dt><dd>${escapeHtml(receipt.revokedAt || "无")}</dd>
            <dt>Message</dt><dd>${escapeHtml(receipt.message || "无")}</dd>
            <dt>Warnings</dt><dd>${escapeHtml(warnings)}</dd>
            <dt>Asset Signatures</dt><dd>${escapeHtml(assetSignatureText)}</dd>
            <dt>CDN Upload</dt><dd>${escapeHtml(cdnUploadText)}</dd>
            <dt>CDN Purge</dt><dd>${escapeHtml(cdnPurgeText)}</dd>
          </dl>
          <pre>${escapeHtml(JSON.stringify(receipt.receipt || {}, null, 2))}</pre>
        </section>`;
    }).join("");
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>MR 书法远端发布回执审计</title>
  <style>
    body { margin: 0; padding: 32px; color: #1f2937; background: #f7f4ee; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { max-width: 960px; margin: 0 auto; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    .meta { margin: 0 0 18px; color: #5f6b7a; line-height: 1.6; }
    .receipt { margin: 18px 0; padding: 18px; border: 1px solid #ddd3c2; border-radius: 8px; background: #fffaf2; }
    h2 { margin: 0 0 12px; font-size: 17px; overflow-wrap: anywhere; }
    dl { display: grid; grid-template-columns: 160px minmax(0, 1fr); gap: 8px 12px; margin: 0; }
    dt { color: #5f6b7a; font-weight: 700; }
    dd { margin: 0; overflow-wrap: anywhere; }
    pre { margin: 14px 0 0; padding: 12px; overflow: auto; border-radius: 6px; background: #1f2937; color: #f8fafc; font-size: 12px; line-height: 1.5; }
  </style>
</head>
<body>
  <main>
    <h1>MR 书法远端发布回执审计</h1>
    <p class="meta">场景：${escapeHtml(audit.sceneLabel)} · 导出时间：${escapeHtml(generatedAt)} · 回执数量：${audit.total}<br>${escapeHtml(audit.boundary)}</p>
    ${rows}
  </main>
</body>
</html>`;
  }

  function formatAssetSignatureSummary(summary = {}) {
    const signedCount = normalizeCount(summary.signedAssetCount);
    const missingHashCount = normalizeCount(summary.missingHashCount);
    if (!signedCount && !missingHashCount) {
      return "无资产签名";
    }
    const algorithm = summary.signatureAlgorithm || "算法未知";
    const signingKeyId = summary.signingKeyId || "key 未知";
    const missing = missingHashCount ? `，${missingHashCount} 个资产缺哈希未签名` : "";
    return `${signedCount} 个资产签名 · ${algorithm} · ${signingKeyId}${missing}`;
  }

  function formatCdnPurgeSummary(summary = {}) {
    const purgedAssetCount = normalizeCount(summary.purgedAssetCount);
    const purgedUrlCount = normalizeCount(summary.purgedUrlCount);
    if (!purgedAssetCount && !purgedUrlCount && !summary.status) {
      return "无 CDN purge 回执";
    }
    const status = summary.status || "状态未知";
    const provider = summary.cdnProvider || "CDN 未知";
    const requestId = summary.purgeRequestId ? ` · ${summary.purgeRequestId}` : "";
    return `${status} · ${provider} · ${purgedAssetCount} 个资产 / ${purgedUrlCount} 个 URL${requestId}`;
  }

  function formatCdnUploadSummary(summary = {}) {
    const uploadedAssetCount = normalizeCount(summary.uploadedAssetCount);
    const uploadedUrlCount = normalizeCount(summary.uploadedUrlCount);
    if (!uploadedAssetCount && !uploadedUrlCount && !summary.status) {
      return "无 CDN upload 回执";
    }
    const status = summary.status || "状态未知";
    const provider = summary.cdnProvider || "CDN 未知";
    const requestId = summary.uploadRequestId ? ` · ${summary.uploadRequestId}` : "";
    const baseUrl = summary.baseUrl ? ` · ${summary.baseUrl}` : "";
    return `${status} · ${provider} · ${uploadedAssetCount} 个资产 / ${uploadedUrlCount} 个 URL${requestId}${baseUrl}`;
  }

  function formatReceiptDirection(direction) {
    return direction === "revoke" ? "撤销" : "发布";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value ?? null));
  }

  window.MRProjectRemotePublish = {
    storageKey: STORAGE_KEY,
    packageKind: PACKAGE_KIND,
    revokeKind: REVOKE_KIND,
    boundary: BOUNDARY,
    configure,
    getStatus,
    getConfig,
    getWorkflow,
    getReceiptAudit,
    getReceiptAuditExport,
    createPackage,
    createPackageManifest,
    createReleaseAssetManifest,
    validatePackage,
    requestReview,
    approveReview,
    rejectReview,
    unlock,
    check,
    push,
    revoke
  };
})();

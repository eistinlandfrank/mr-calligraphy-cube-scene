(function () {
  const STORAGE_KEY = "mr-calligraphy-remote-publish-v1";
  const PACKAGE_KIND = "mr-calligraphy-remote-publish-package-v1";
  const VERSION = 1;
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
      lastPackageId: source.lastPackageId ? String(source.lastPackageId) : "",
      lastReleaseId: source.lastReleaseId ? String(source.lastReleaseId) : "",
      lastRemoteVersion: source.lastRemoteVersion ? String(source.lastRemoteVersion).slice(0, 120) : "",
      lastRemoteStatus: source.lastRemoteStatus ? String(source.lastRemoteStatus).slice(0, 180) : "",
      lastError: source.lastError ? String(source.lastError).slice(0, 180) : ""
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
    const remoteConfigured = Boolean(scene.endpoint);
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
      lastPackageId: scene.lastPackageId,
      lastReleaseId: scene.lastReleaseId,
      lastRemoteVersion: scene.lastRemoteVersion,
      lastRemoteStatus: scene.lastRemoteStatus,
      lastError: scene.lastError
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
    return {
      ok: true,
      package: {
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
        releaseLayout: clone(release.layout || record.layout || {})
      }
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
      return packaged;
    }

    try {
      const response = await fetch(scene.endpoint, createRequest(scene, {
        method: "POST",
        body: packaged.package
      }));
      const parsed = await parseResponse(response, "远端发布 API 已接收发布包。");
      if (!parsed.ok) {
        return saveRemoteError(normalizedId, parsed.message);
      }

      const now = new Date().toISOString();
      const releaseId = packaged.package.release.id;
      const nextState = readState();
      nextState.scenes[normalizedId] = normalizeSceneState({
        ...nextState.scenes[normalizedId],
        lastCheckedAt: now,
        lastPushedAt: now,
        lastPackageId: parsed.packageId || packaged.package.packageId,
        lastReleaseId: releaseId,
        lastRemoteVersion: parsed.remoteVersion,
        lastRemoteStatus: parsed.message,
        lastError: ""
      });
      writeState(nextState);
      return {
        ok: true,
        status: getStatus(normalizedId),
        packageId: parsed.packageId || packaged.package.packageId,
        releaseId,
        remoteVersion: parsed.remoteVersion,
        message: `${parsed.message} ${BOUNDARY}`
      };
    } catch (error) {
      return saveRemoteError(normalizedId, `远端发布 API 推送失败：${error?.message || "网络请求异常"}。`);
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
    if (!response || response.ok === false) {
      const status = response?.status ? `HTTP ${response.status}` : "无响应";
      return { ok: false, message: `远端发布 API 请求失败：${status}。` };
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

    if (payload.ok === false) {
      return { ok: false, message: payload.message || "远端发布 API 拒绝了本次请求。" };
    }
    return {
      ok: true,
      message: payload.message || fallbackMessage,
      packageId: payload.packageId ? String(payload.packageId) : "",
      remoteVersion: payload.remoteVersion ? String(payload.remoteVersion).slice(0, 120) : ""
    };
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

  function formatDateTime(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "时间未知";
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value ?? null));
  }

  window.MRProjectRemotePublish = {
    storageKey: STORAGE_KEY,
    packageKind: PACKAGE_KIND,
    boundary: BOUNDARY,
    configure,
    getStatus,
    getConfig,
    createPackage,
    check,
    push
  };
})();

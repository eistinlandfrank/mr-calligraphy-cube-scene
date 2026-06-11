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
      lastPackageDigest: normalizeSha256(source.lastPackageDigest),
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
      lastPackageDigest: scene.lastPackageDigest,
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
      releaseLayout: clone(release.layout || record.layout || {})
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
    return {
      kind: "mr-calligraphy-remote-publish-manifest-v1",
      version: VERSION,
      sceneId: payload.sceneId || "",
      releaseId: payload.release?.id || "",
      releaseNumber: Number(payload.release?.releaseNumber || 0),
      storageKey: payload.storageKey || "",
      objectSummary,
      packageDigest: sha256StableJson({
        kind: payload.kind,
        version: payload.version,
        sceneId: payload.sceneId,
        sceneLabel: payload.sceneLabel,
        storageKey: payload.storageKey,
        release: payload.release,
        record: payload.record,
        releaseLayout: payload.releaseLayout
      }),
      recordDigest: sha256StableJson(payload.record || {}),
      releaseDigest: sha256StableJson(payload.release || {}),
      layoutDigest: sha256StableJson(releaseLayout)
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
    if (!payload.manifest || typeof payload.manifest !== "object") {
      errors.push("缺少 manifest");
    }

    if (payload.manifest && typeof payload.manifest === "object") {
      const expectedManifest = createPackageManifest(payload);
      compareManifestField(errors, payload.manifest, expectedManifest, "packageDigest", "发布包摘要不匹配");
      compareManifestField(errors, payload.manifest, expectedManifest, "recordDigest", "发布记录摘要不匹配");
      compareManifestField(errors, payload.manifest, expectedManifest, "releaseDigest", "release 摘要不匹配");
      compareManifestField(errors, payload.manifest, expectedManifest, "layoutDigest", "布局摘要不匹配");
      if (stableStringify(payload.manifest.objectSummary || {}) !== stableStringify(expectedManifest.objectSummary)) {
        errors.push("布局对象摘要不匹配");
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
        lastPackageDigest: packaged.package.manifest?.packageDigest,
        lastError: ""
      });
      writeState(nextState);
      return {
        ok: true,
        status: getStatus(normalizedId),
        packageId: parsed.packageId || packaged.package.packageId,
        releaseId,
        packageDigest: packaged.package.manifest?.packageDigest || "",
        validation,
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
    createPackageManifest,
    validatePackage,
    check,
    push
  };
})();

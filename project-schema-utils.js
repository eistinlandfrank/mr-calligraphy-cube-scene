(function () {
  const PROJECT_SCHEMA_KIND = "mr-calligraphy-project-schema";
  const PROJECT_SCHEMA_VERSION = 1;
  const PROJECT_REPOSITORY_KIND = "mr-calligraphy-project-repository-v1";
  const PROJECT_REPOSITORY_VERSION = 1;
  const STORAGE_KEYS = {
    learning: "mr-calligraphy-learning-state-v1",
    room: "mr-calligraphy-room-config-v3-wood",
    mainLayout: "mr-calligraphy-main-scene-layout-v1",
    mainHistory: "mr-calligraphy-main-scene-history-v1",
    mainPublished: "mr-calligraphy-main-scene-published-v1",
    realisticLayout: "mr-calligraphy-realistic-layout-v1",
    realisticHistory: "mr-calligraphy-realistic-history-v1",
    realisticPublished: "mr-calligraphy-realistic-published-v1"
  };

  function createProjectSchema(source = {}) {
    const storage = source.storage || {};
    const indexedDb = source.indexedDb || {};
    const learning = parseStorageJson(storage, STORAGE_KEYS.learning);
    const room = parseStorageJson(storage, STORAGE_KEYS.room);
    const mainLayout = parseStorageJson(storage, STORAGE_KEYS.mainLayout);
    const mainHistory = parseStorageJson(storage, STORAGE_KEYS.mainHistory);
    const mainPublished = parseStorageJson(storage, STORAGE_KEYS.mainPublished);
    const realisticLayout = parseStorageJson(storage, STORAGE_KEYS.realisticLayout);
    const realisticHistory = parseStorageJson(storage, STORAGE_KEYS.realisticHistory);
    const realisticPublished = parseStorageJson(storage, STORAGE_KEYS.realisticPublished);
    const mainScene = normalizeMainScene(mainLayout, mainHistory, mainPublished);
    const realisticScene = normalizeRealisticScene(realisticLayout, realisticHistory, realisticPublished);
    const assetManifest = createAssetManifest(mainScene, realisticScene, indexedDb);
    const sections = {
      learning: normalizeLearning(learning),
      room: normalizeRoom(room),
      mainScene,
      realisticScene
    };
    const repository = createProjectRepositoryStatusFromParts(sections, assetManifest, {
      createdAt: normalizeDate(source.exportedAt) || new Date().toISOString(),
      source: String(source.source || "")
    });

    return {
      kind: PROJECT_SCHEMA_KIND,
      version: PROJECT_SCHEMA_VERSION,
      createdAt: normalizeDate(source.exportedAt) || new Date().toISOString(),
      source: String(source.source || ""),
      sections,
      assetManifest,
      repository,
      summary: createSummary(sections, assetManifest, repository),
      migrations: normalizeMigrationRecords(source.migrations || source.projectSchema?.migrations)
    };
  }

  function createProjectRepositoryStatus(source = {}) {
    const schema = source?.kind === PROJECT_SCHEMA_KIND ? source : createProjectSchema(source);
    return createProjectRepositoryStatusFromSchema(schema);
  }

  function createProjectRepositoryStatusFromSchema(schema) {
    return createProjectRepositoryStatusFromParts(schema?.sections || {}, schema?.assetManifest || {}, {
      createdAt: normalizeDate(schema?.createdAt) || new Date().toISOString(),
      source: String(schema?.source || "")
    });
  }

  function createProjectRepositoryStatusFromBrowser() {
    return createProjectRepositoryStatus({
      exportedAt: new Date().toISOString(),
      source: typeof window !== "undefined" ? String(window.location?.href || "browser-local-storage") : "browser-local-storage",
      storage: readBrowserStorageSnapshot()
    });
  }

  function validateProjectSchema(schema) {
    if (!schema || schema.kind !== PROJECT_SCHEMA_KIND) {
      throw new Error("项目档案缺少统一项目 schema。");
    }
    if (Number(schema.version) !== PROJECT_SCHEMA_VERSION) {
      throw new Error(`不支持的项目 schema 版本：${schema.version}`);
    }
    return true;
  }

  function parseStorageJson(storage, key) {
    const raw = storage?.[key]?.value;
    if (!raw || typeof raw !== "string") {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function normalizeLearning(state) {
    const sessions = Array.isArray(state?.sessions) ? state.sessions : [];
    const artworks = Array.isArray(state?.artworks) ? state.artworks : [];
    const reports = Array.isArray(state?.reports) ? state.reports : [];
    const plans = Array.isArray(state?.plans) ? state.plans : [];
    const practicedSessions = sessions.filter((item) => (Number(item?.strokeCount) || 0) > 0 || item?.status === "saved");
    const latestRecordAt = [
      ...sessions.map((item) => item?.endedAt || item?.snapshotAt || item?.startedAt),
      ...artworks.map((item) => item?.createdAt),
      ...reports.map((item) => item?.createdAt)
    ].map(normalizeDate).filter(Boolean).sort().pop() || null;

    return {
      schema: "learning-state-v1",
      storageKey: STORAGE_KEYS.learning,
      available: Boolean(state),
      activeMode: String(state?.activeMode || "single"),
      selectedTaskId: String(state?.selectedTaskId || ""),
      selectedGlyph: String(state?.selectedGlyph || ""),
      sessionCount: sessions.length,
      practicedSessionCount: practicedSessions.length,
      artworkCount: artworks.length,
      reportCount: reports.length,
      planCount: plans.length,
      latestRecordAt
    };
  }

  function normalizeRoom(room) {
    const textures = room && typeof room.textures === "object" && room.textures ? room.textures : {};
    const roles = Array.isArray(room?.roles) ? room.roles : [];

    return {
      schema: "room-config-v3-wood",
      storageKey: STORAGE_KEYS.room,
      available: Boolean(room),
      textureCount: Object.values(textures).filter(Boolean).length,
      roleCount: roles.length,
      roleIds: roles.map((role, index) => String(role?.id || role?.name || `role-${index + 1}`))
    };
  }

  function normalizeMainScene(layout, history, published) {
    const draft = normalizeMainLayout(layout);
    const snapshots = Array.isArray(history?.snapshots) ? history.snapshots : Array.isArray(history) ? history : [];
    const latestSnapshotAt = snapshots.map((item) => normalizeDate(item?.createdAt)).filter(Boolean).sort().pop() || null;
    const publishedLayout = normalizeMainLayout(published?.layout);
    const publishedAt = normalizeDate(published?.publishedAt);
    const releases = normalizePublishReleases(published?.releases, published);

    return {
      schema: "main-scene-layout-v1",
      storageKeys: {
        draft: STORAGE_KEYS.mainLayout,
        history: STORAGE_KEYS.mainHistory,
        published: STORAGE_KEYS.mainPublished
      },
      available: Boolean(layout),
      draft,
      history: {
        snapshotCount: snapshots.length,
        latestSnapshotAt
      },
      published: {
        status: published?.layout ? "published-local" : "not-published",
        currentReleaseId: String(published?.currentReleaseId || releases[0]?.id || ""),
        releaseNumber: normalizeCount(published?.releaseNumber || releases[0]?.releaseNumber || 0),
        releaseCount: releases.length,
        latestNote: String(published?.note || releases[0]?.note || "").slice(0, 80),
        latestAction: String(published?.action || releases[0]?.action || ""),
        publishedAt,
        stats: normalizeStats(published?.stats),
        layout: publishedLayout,
        releases: releases.map((release) => ({
          id: release.id,
          releaseNumber: release.releaseNumber,
          action: release.action,
          note: release.note,
          publishedAt: release.publishedAt,
          importedIds: release.importedIds
        }))
      }
    };
  }

  function normalizePublishReleases(records, currentRecord) {
    const list = Array.isArray(records) ? records.slice() : [];
    if (currentRecord?.layout && !list.some((item) => item?.id === currentRecord.currentReleaseId)) {
      list.unshift(currentRecord);
    }

    const seen = new Set();
    return list.map((record, index) => normalizePublishRelease(record, index))
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
      .filter((release) => {
        if (seen.has(release.id)) {
          return false;
        }
        seen.add(release.id);
        return true;
      });
  }

  function normalizePublishRelease(record, index = 0) {
    if (!record || typeof record !== "object" || !record.layout) {
      return null;
    }

    const publishedAt = normalizeDate(record.publishedAt);
    const layout = normalizeMainLayout(record.layout);
    return {
      id: String(record.id || record.releaseId || record.currentReleaseId || `main-release-${index + 1}`),
      releaseNumber: normalizeCount(record.releaseNumber || index + 1),
      action: record.action === "rollback" ? "rollback" : "publish",
      note: String(record.note || "").slice(0, 80),
      publishedAt,
      importedIds: layout.importedIds
    };
  }

  function normalizeMainLayout(layout) {
    const objects = layout && typeof layout.objects === "object" && layout.objects ? layout.objects : {};
    const customObjects = Array.isArray(layout?.customObjects) ? layout.customObjects : [];
    const importedModels = Array.isArray(layout?.importedModels) ? layout.importedModels : [];
    const states = Object.values(objects);

    return {
      objectStateCount: Object.keys(objects).length,
      layerOrderCount: Array.isArray(layout?.layerOrder) ? layout.layerOrder.length : 0,
      customCount: customObjects.length,
      importedCount: importedModels.length,
      hiddenCount: states.filter((item) => item?.hidden === true || item?.deleted === true).length,
      lockedCount: states.filter((item) => item?.locked === true).length,
      hasLighting: Boolean(layout?.lighting && typeof layout.lighting === "object"),
      customIds: customObjects.map((item, index) => String(item?.id || `custom-${index + 1}`)),
      importedIds: importedModels.map((item, index) => String(item?.id || `imported-${index + 1}`))
    };
  }

  function normalizeStats(stats) {
    return {
      objectCount: normalizeCount(stats?.objectCount),
      customCount: normalizeCount(stats?.customCount),
      importedCount: normalizeCount(stats?.importedCount),
      hiddenCount: normalizeCount(stats?.hiddenCount),
      lockedCount: normalizeCount(stats?.lockedCount)
    };
  }

  function normalizeRealisticScene(layout, history, published) {
    const draft = normalizeRealisticLayout(layout);
    const snapshots = Array.isArray(history?.snapshots) ? history.snapshots : Array.isArray(history) ? history : [];
    const latestSnapshotAt = snapshots.map((item) => normalizeDate(item?.createdAt)).filter(Boolean).sort().pop() || null;
    const publishedLayout = normalizeRealisticLayout(published?.layout);
    const publishedAt = normalizeDate(published?.publishedAt);
    const releases = normalizeRealisticPublishReleases(published?.releases, published);

    return {
      schema: "realistic-layout-v1",
      storageKeys: {
        draft: STORAGE_KEYS.realisticLayout,
        history: STORAGE_KEYS.realisticHistory,
        published: STORAGE_KEYS.realisticPublished
      },
      available: Boolean(layout),
      draft,
      history: {
        supported: true,
        snapshotCount: snapshots.length,
        latestSnapshotAt
      },
      published: {
        supported: true,
        status: published?.layout ? "published-local" : "not-published",
        currentReleaseId: String(published?.currentReleaseId || releases[0]?.id || ""),
        releaseNumber: normalizeCount(published?.releaseNumber || releases[0]?.releaseNumber || 0),
        releaseCount: releases.length,
        latestNote: String(published?.note || releases[0]?.note || "").slice(0, 80),
        latestAction: String(published?.action || releases[0]?.action || ""),
        publishedAt,
        stats: normalizeRealisticStats(published?.stats),
        layout: publishedLayout,
        releases: releases.map((release) => ({
          id: release.id,
          releaseNumber: release.releaseNumber,
          action: release.action,
          note: release.note,
          publishedAt: release.publishedAt,
          importedIds: release.importedIds
        }))
      }
    };
  }

  function normalizeRealisticPublishReleases(records, currentRecord) {
    const list = Array.isArray(records) ? records.slice() : [];
    if (currentRecord?.layout && !list.some((item) => item?.id === currentRecord.currentReleaseId)) {
      list.unshift(currentRecord);
    }

    const seen = new Set();
    return list.map((record, index) => normalizeRealisticPublishRelease(record, index))
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
      .filter((release) => {
        if (seen.has(release.id)) {
          return false;
        }
        seen.add(release.id);
        return true;
      });
  }

  function normalizeRealisticPublishRelease(record, index = 0) {
    if (!record || typeof record !== "object" || !record.layout) {
      return null;
    }

    const publishedAt = normalizeDate(record.publishedAt);
    const layout = normalizeRealisticLayout(record.layout);
    return {
      id: String(record.id || record.releaseId || record.currentReleaseId || `realistic-release-${index + 1}`),
      releaseNumber: normalizeCount(record.releaseNumber || index + 1),
      action: record.action === "rollback" ? "rollback" : "publish",
      note: String(record.note || "").slice(0, 80),
      publishedAt,
      importedIds: layout.importedIds
    };
  }

  function normalizeRealisticLayout(layout) {
    const importedModels = Array.isArray(layout?.importedModels) ? layout.importedModels : [];
    const objectEntries = Object.entries(layout && typeof layout === "object" ? layout : {})
      .filter(([key, value]) => key !== "importedModels" && value && typeof value === "object");
    const deletedCount = objectEntries.filter(([, value]) => value?.deleted === true).length;

    return {
      objectStateCount: objectEntries.length,
      importedCount: importedModels.length,
      deletedCount,
      objectIds: objectEntries.map(([key]) => key),
      importedIds: importedModels.map((item, index) => String(item?.id || `realistic-imported-${index + 1}`))
    };
  }

  function normalizeRealisticStats(stats) {
    return {
      objectStateCount: normalizeCount(stats?.objectStateCount),
      importedCount: normalizeCount(stats?.importedCount),
      deletedCount: normalizeCount(stats?.deletedCount)
    };
  }

  function createAssetManifest(mainScene, realisticScene, indexedDb) {
    const hasIndexedDbSnapshot = Boolean(indexedDb?.mainModels || indexedDb?.realisticModels);
    const mainDbKeys = createDbRecordKeySet(getDbRecords(indexedDb?.mainModels));
    const realisticDbKeys = createDbRecordKeySet(getDbRecords(indexedDb?.realisticModels));
    const mainLayoutIds = uniqueStrings([
      ...(mainScene?.draft?.importedIds || []),
      ...(mainScene?.published?.layout?.importedIds || []),
      ...flattenImportedIds(mainScene?.published?.releases)
    ]);
    const realisticLayoutIds = uniqueStrings([
      ...(realisticScene?.draft?.importedIds || []),
      ...(realisticScene?.published?.layout?.importedIds || []),
      ...flattenImportedIds(realisticScene?.published?.releases)
    ]);
    const mainAssets = collectImportedAssets("main", mainLayoutIds, getStorageImportedRecords(indexedDb, "mainModels"), mainDbKeys);
    const realisticAssets = collectImportedAssets("realistic", realisticLayoutIds, getStorageImportedRecords(indexedDb, "realisticModels"), realisticDbKeys);
    const assets = hasIndexedDbSnapshot
      ? [...mainAssets, ...realisticAssets]
      : [...mainAssets, ...realisticAssets].map((asset) => ({
        ...asset,
        stored: null,
        hashStatus: "unknown"
      }));
    const modelAssets = assets.filter((asset) => asset.assetKind !== "texture");
    const textureAssets = assets.filter((asset) => asset.assetKind === "texture");

    return {
      version: 1,
      assetCoverage: hasIndexedDbSnapshot ? "indexed-db-snapshot" : "storage-only",
      assetCount: assets.length,
      importedModelCount: modelAssets.length,
      textureAssetCount: textureAssets.length,
      missingBinaryCount: hasIndexedDbSnapshot ? assets.filter((asset) => !asset.stored).length : 0,
      missingTextureBinaryCount: hasIndexedDbSnapshot ? textureAssets.filter((asset) => !asset.stored).length : 0,
      unknownBinaryCount: hasIndexedDbSnapshot ? 0 : assets.length,
      missingHashCount: hasIndexedDbSnapshot ? assets.filter((asset) => asset.stored && !asset.sha256).length : 0,
      assets
    };
  }

  function getStorageImportedRecords(indexedDb, dbId) {
    return getDbRecords(indexedDb?.[dbId]).map((record) => {
      const data = record?.data || {};
      return {
        ...data,
        sha256: normalizeSha256(record?.sha256 || data.sha256),
        archiveBytes: normalizeCount(record?.bytes || 0),
        hasArchiveBinary: Boolean(record?.arrayBufferBase64)
      };
    });
  }

  function getDbRecords(pack) {
    return Array.isArray(pack?.records) ? pack.records : [];
  }

  function createDbRecordKeySet(records) {
    return new Set(records.flatMap((record) => {
      const data = record?.data || {};
      return [data.key, data.id, data.dbKey, record.key, record.id, record.dbKey]
        .map((value) => String(value || "").trim())
        .filter(Boolean);
    }));
  }

  function collectImportedAssets(scene, layoutIds, records, dbKeys) {
    const byId = createImportedAssetRecordMap(records);
    return layoutIds.flatMap((id) => {
      const record = byId.get(id) || byId.get(String(id).replace(/^imported-/, "import-")) || {};
      const dbKey = String(record.dbKey || record.key || record.id || id);
      const assets = [createImportedAssetRecord({
        scene,
        assetKind: "model",
        id: String(id),
        dbKey,
        record,
        stored: dbKeys.has(dbKey) || dbKeys.has(String(id))
      })];
      const texture = normalizeImportTextureRef(record.texture);
      if (texture) {
        const textureRecord = byId.get(texture.dbKey) || {};
        assets.push(createImportedAssetRecord({
          scene,
          assetKind: "texture",
          id: texture.dbKey,
          modelId: String(id),
          dbKey: texture.dbKey,
          record: {
            ...texture,
            ...textureRecord,
            fileName: texture.fileName || textureRecord.fileName,
            type: texture.type || textureRecord.type,
            sha256: texture.sha256 || textureRecord.sha256,
            archiveBytes: textureRecord.archiveBytes || texture.fileBytes,
            metrics: textureRecord.metrics || { fileBytes: texture.fileBytes }
          },
          stored: dbKeys.has(texture.dbKey)
        }));
      }
      return assets;
    });
  }

  function createImportedAssetRecordMap(records) {
    const byId = new Map();
    records.forEach((record) => {
      [record.id, record.dbKey, record.key]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .forEach((key) => {
          if (!byId.has(key)) {
            byId.set(key, record);
          }
        });
    });
    return byId;
  }

  function createImportedAssetRecord({ scene, assetKind, id, modelId = "", dbKey, record, stored }) {
    const sha256 = normalizeSha256(record.sha256);
    return {
      scene,
      assetKind,
      id: String(id),
      modelId: String(modelId || id),
      dbKey,
      label: String(record.label || record.fileName || id),
      fileName: String(record.fileName || ""),
      type: String(record.type || ""),
      stored,
      sha256,
      hashStatus: !stored ? "missing-binary" : sha256 ? "sha256" : "missing-hash",
      bytes: normalizeCount(record.metrics?.fileBytes || record.metrics?.fileSize || record.size || record.archiveBytes || 0)
    };
  }

  function normalizeImportTextureRef(texture) {
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
      fileBytes: normalizeCount(texture.fileBytes || texture.metrics?.fileBytes)
    };
  }

  function flattenImportedIds(records) {
    return Array.isArray(records)
      ? records.flatMap((record) => Array.isArray(record?.importedIds) ? record.importedIds : [])
      : [];
  }

  function uniqueStrings(values) {
    return [...new Set(values.map((value) => String(value || "")).filter(Boolean))];
  }

  function createProjectRepositoryStatusFromParts(sections, assetManifest, meta = {}) {
    const scenes = [
      createSceneRepositoryEntry("main", "主场景", sections.mainScene, assetManifest),
      createSceneRepositoryEntry("realistic", "写实样张", sections.realisticScene, assetManifest)
    ];
    const risks = scenes.flatMap((scene) => scene.risks.map((risk) => ({
      ...risk,
      sceneId: scene.sceneId,
      sceneLabel: scene.label
    })));
    const blockingRisks = risks.filter((risk) => risk.level === "error");
    const warnings = risks.filter((risk) => risk.level === "warning");
    const draftSceneCount = scenes.filter((scene) => scene.draft.available).length;
    const publishedSceneCount = scenes.filter((scene) => scene.published.available).length;
    const readySceneCount = scenes.filter((scene) => scene.status === "ready").length;
    const status = blockingRisks.length ? "blocked" : warnings.length ? "warning" : readySceneCount === scenes.length ? "ready" : "empty";

    return {
      kind: PROJECT_REPOSITORY_KIND,
      version: PROJECT_REPOSITORY_VERSION,
      createdAt: normalizeDate(meta.createdAt) || new Date().toISOString(),
      source: String(meta.source || ""),
      boundary: "local-browser-project-repository",
      backendStatus: "not-configured",
      status,
      statusLabel: getRepositoryStatusLabel(status),
      summary: {
        sceneCount: scenes.length,
        draftSceneCount,
        publishedSceneCount,
        readySceneCount,
        draftObjectCount: scenes.reduce((sum, scene) => sum + scene.draft.objectCount, 0),
        publishedReleaseCount: scenes.reduce((sum, scene) => sum + scene.published.releaseCount, 0),
        snapshotCount: scenes.reduce((sum, scene) => sum + scene.history.snapshotCount, 0),
        importedModelCount: scenes.reduce((sum, scene) => sum + scene.assets.importedModelCount, 0),
        textureAssetCount: scenes.reduce((sum, scene) => sum + scene.assets.textureAssetCount, 0),
        missingBinaryCount: scenes.reduce((sum, scene) => sum + scene.assets.missingBinaryCount, 0),
        unknownBinaryCount: scenes.reduce((sum, scene) => sum + scene.assets.unknownBinaryCount, 0),
        missingHashCount: scenes.reduce((sum, scene) => sum + scene.assets.missingHashCount, 0)
      },
      parity: {
        unifiedSceneSchema: "project-scene-repository-v1",
        sharedFields: [
          "sceneId",
          "label",
          "draft.objectCount",
          "history.snapshotCount",
          "published.releaseCount",
          "assets.importedModelCount",
          "assets.missingBinaryCount",
          "status",
          "nextActionLabel"
        ],
        mainOnlyFields: ["draft.customCount", "draft.lockedCount", "draft.hasLighting"],
        realisticOnlyFields: ["draft.deletedCount"]
      },
      risks,
      scenes
    };
  }

  function createSceneRepositoryEntry(sceneId, label, scene, assetManifest) {
    const draft = scene?.draft || {};
    const history = scene?.history || {};
    const published = scene?.published || {};
    const publishedLayout = published.layout || {};
    const draftObjectCount = getSceneObjectCount(sceneId, draft);
    const publishedObjectCount = getSceneObjectCount(sceneId, publishedLayout);
    const releaseCount = normalizeCount(published.releaseCount);
    const importedIds = uniqueStrings([
      ...(draft.importedIds || []),
      ...(publishedLayout.importedIds || []),
      ...flattenImportedIds(published.releases)
    ]);
    const assets = (Array.isArray(assetManifest?.assets) ? assetManifest.assets : [])
      .filter((asset) => asset.scene === sceneId && (!importedIds.length || importedIds.includes(asset.id) || importedIds.includes(asset.modelId)));
    const modelAssetCount = assets.filter((asset) => asset.assetKind !== "texture").length;
    const textureAssetCount = assets.filter((asset) => asset.assetKind === "texture").length;
    const missingBinaryCount = assets.filter((asset) => asset.hashStatus === "missing-binary").length;
    const unknownBinaryCount = assets.filter((asset) => asset.hashStatus === "unknown").length;
    const missingHashCount = assets.filter((asset) => asset.hashStatus === "missing-hash").length;
    const risks = createSceneRepositoryRisks({
      draftAvailable: Boolean(scene?.available),
      releaseCount,
      missingBinaryCount,
      unknownBinaryCount,
      missingHashCount
    });
    const status = getSceneRepositoryStatus(risks, scene?.available, releaseCount);

    return {
      sceneId,
      label,
      schema: String(scene?.schema || ""),
      unifiedSchema: "project-scene-repository-v1",
      storageKeys: scene?.storageKeys || {},
      boundary: "local-browser-project-repository",
      draft: {
        available: Boolean(scene?.available),
        objectCount: draftObjectCount,
        objectStateCount: normalizeCount(draft.objectStateCount),
        customCount: normalizeCount(draft.customCount),
        importedCount: normalizeCount(draft.importedCount),
        hiddenCount: normalizeCount(draft.hiddenCount),
        lockedCount: normalizeCount(draft.lockedCount),
        deletedCount: normalizeCount(draft.deletedCount),
        hasLighting: Boolean(draft.hasLighting)
      },
      history: {
        snapshotCount: normalizeCount(history.snapshotCount),
        latestSnapshotAt: normalizeDate(history.latestSnapshotAt)
      },
      published: {
        available: releaseCount > 0 && published.status === "published-local",
        status: String(published.status || "not-published"),
        releaseCount,
        releaseNumber: normalizeCount(published.releaseNumber),
        currentReleaseId: String(published.currentReleaseId || ""),
        publishedAt: normalizeDate(published.publishedAt),
        latestNote: String(published.latestNote || ""),
        latestAction: String(published.latestAction || ""),
        objectCount: publishedObjectCount
      },
      assets: {
        importedIds,
        importedModelCount: modelAssetCount || importedIds.length,
        textureAssetCount,
        manifestCount: assets.length,
        missingBinaryCount,
        unknownBinaryCount,
        missingHashCount
      },
      risks,
      status,
      statusLabel: getSceneRepositoryStatusLabel(status),
      nextActionLabel: getSceneRepositoryNextAction(status, missingBinaryCount, unknownBinaryCount, missingHashCount)
    };
  }

  function getSceneObjectCount(sceneId, layout) {
    if (sceneId === "main") {
      return normalizeCount(layout.objectStateCount) + normalizeCount(layout.customCount) + normalizeCount(layout.importedCount);
    }
    return normalizeCount(layout.objectStateCount) + normalizeCount(layout.importedCount);
  }

  function createSceneRepositoryRisks({ draftAvailable, releaseCount, missingBinaryCount, unknownBinaryCount, missingHashCount }) {
    const risks = [];
    if (!draftAvailable) {
      risks.push({
        level: "warning",
        code: "draft-missing",
        message: "还没有本机场景草稿，仓库只能显示发布或空状态。"
      });
    }
    if (!releaseCount) {
      risks.push({
        level: "warning",
        code: "publish-missing",
        message: "还没有本机发布版本，前台或演示页不会读取最新草稿。"
      });
    }
    if (missingBinaryCount) {
      risks.push({
        level: "error",
        code: "asset-binary-missing",
        message: `${missingBinaryCount} 个导入资产缺少本机二进制，导出或远端发布前需要补齐。`
      });
    }
    if (unknownBinaryCount) {
      risks.push({
        level: "warning",
        code: "asset-binary-unknown",
        message: `${unknownBinaryCount} 个导入资产尚未随 IndexedDB 快照校验，导出项目档案后可确认文件完整性。`
      });
    }
    if (missingHashCount) {
      risks.push({
        level: "warning",
        code: "asset-hash-missing",
        message: `${missingHashCount} 个导入资产缺少 SHA-256 哈希，恢复和远端发布校验会变弱。`
      });
    }
    return risks;
  }

  function getSceneRepositoryStatus(risks, draftAvailable, releaseCount) {
    if (risks.some((risk) => risk.level === "error")) {
      return "blocked";
    }
    if (!draftAvailable) {
      return "empty";
    }
    if (!releaseCount) {
      return "draft-only";
    }
    if (risks.some((risk) => risk.level === "warning")) {
      return "warning";
    }
    return "ready";
  }

  function getSceneRepositoryStatusLabel(status) {
    const labels = {
      ready: "草稿、发布和资产已归档",
      warning: "可用但有仓库提醒",
      blocked: "资产不完整",
      empty: "缺少草稿",
      "draft-only": "只有草稿"
    };
    return labels[status] || "待检查";
  }

  function getSceneRepositoryNextAction(status, missingBinaryCount, unknownBinaryCount, missingHashCount) {
    if (missingBinaryCount) return "补齐导入资产文件";
    if (unknownBinaryCount) return "导出项目档案校验导入资产";
    if (missingHashCount) return "重新导入或校验资产哈希";
    if (status === "empty") return "先保存本机场景草稿";
    if (status === "draft-only") return "发布本机版本";
    if (status === "warning") return "查看仓库提醒后再导出";
    return "可导出项目档案";
  }

  function getRepositoryStatusLabel(status) {
    const labels = {
      ready: "两个后台已进入统一项目仓库视图",
      warning: "项目仓库可用，但仍有本机提醒",
      blocked: "项目仓库资产不完整",
      empty: "项目仓库缺少草稿"
    };
    return labels[status] || "项目仓库待检查";
  }

  function readBrowserStorageSnapshot() {
    const storage = {};
    if (typeof window === "undefined" || !window.localStorage) {
      return storage;
    }
    Object.values(STORAGE_KEYS).forEach((key) => {
      try {
        const value = window.localStorage.getItem(key);
        if (value != null) {
          storage[key] = { value };
        }
      } catch (error) {
        // 忽略单个 storage 读取失败，仓库状态仍会显示缺项提醒。
      }
    });
    return storage;
  }

  function createSummary(sections, assetManifest, repository) {
    return {
      learningRecords: (sections.learning.sessionCount || 0) + (sections.learning.artworkCount || 0) + (sections.learning.reportCount || 0),
      mainDraftObjects: (sections.mainScene.draft.objectStateCount || 0) + (sections.mainScene.draft.customCount || 0) + (sections.mainScene.draft.importedCount || 0),
      mainSnapshots: sections.mainScene.history.snapshotCount || 0,
      mainReleases: sections.mainScene.published.releaseCount || 0,
      realisticObjects: (sections.realisticScene.draft.objectStateCount || 0) + (sections.realisticScene.draft.importedCount || 0),
      realisticSnapshots: sections.realisticScene.history.snapshotCount || 0,
      realisticReleases: sections.realisticScene.published.releaseCount || 0,
      roomRoles: sections.room.roleCount || 0,
      importedModels: assetManifest.importedModelCount || 0,
      textureAssets: assetManifest.textureAssetCount || 0,
      missingModelBinaries: assetManifest.missingBinaryCount || 0,
      missingTextureBinaries: assetManifest.missingTextureBinaryCount || 0,
      unknownModelBinaries: assetManifest.unknownBinaryCount || 0,
      missingModelHashes: assetManifest.missingHashCount || 0,
      repositoryStatus: String(repository?.status || ""),
      repositoryReadyScenes: normalizeCount(repository?.summary?.readySceneCount)
    };
  }

  function normalizeDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  function normalizeCount(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.round(number) : 0;
  }

  function normalizeSha256(value) {
    const hash = String(value || "").trim().toLowerCase();
    return /^[a-f0-9]{64}$/.test(hash) ? hash : "";
  }

  function normalizeMigrationRecords(records) {
    if (!Array.isArray(records)) {
      return [];
    }

    const seen = new Set();
    return records.map((record, index) => normalizeMigrationRecord(record, index))
      .filter(Boolean)
      .filter((record) => {
        if (seen.has(record.id)) {
          return false;
        }
        seen.add(record.id);
        return true;
      });
  }

  function normalizeMigrationRecord(record, index = 0) {
    if (!record || typeof record !== "object") {
      return null;
    }

    const id = String(record.id || `migration-${index + 1}`).slice(0, 96);
    const message = String(record.message || record.label || "").trim();
    if (!id || !message) {
      return null;
    }

    return {
      id,
      type: String(record.type || "archive-migration").slice(0, 48),
      target: String(record.target || "").slice(0, 128),
      message: message.slice(0, 180),
      createdAt: normalizeDate(record.createdAt) || null
    };
  }

  window.MRProjectSchema = {
    kind: PROJECT_SCHEMA_KIND,
    version: PROJECT_SCHEMA_VERSION,
    repositoryKind: PROJECT_REPOSITORY_KIND,
    repositoryVersion: PROJECT_REPOSITORY_VERSION,
    createProjectSchema,
    createProjectRepositoryStatus,
    createProjectRepositoryStatusFromBrowser,
    validateProjectSchema
  };
})();

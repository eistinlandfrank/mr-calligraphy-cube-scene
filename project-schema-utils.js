(function () {
  const PROJECT_SCHEMA_KIND = "mr-calligraphy-project-schema";
  const PROJECT_SCHEMA_VERSION = 1;
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

    return {
      kind: PROJECT_SCHEMA_KIND,
      version: PROJECT_SCHEMA_VERSION,
      createdAt: normalizeDate(source.exportedAt) || new Date().toISOString(),
      source: String(source.source || ""),
      sections,
      assetManifest,
      summary: createSummary(sections, assetManifest),
      migrations: normalizeMigrationRecords(source.migrations || source.projectSchema?.migrations)
    };
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
        publishedAt,
        stats: normalizeStats(published?.stats),
        layout: publishedLayout
      }
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
        publishedAt,
        stats: normalizeRealisticStats(published?.stats),
        layout: publishedLayout
      }
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
    const mainDbKeys = new Set(getDbRecords(indexedDb?.mainModels).map((record) => String(record?.data?.key || record?.data?.id || "")));
    const realisticDbKeys = new Set(getDbRecords(indexedDb?.realisticModels).map((record) => String(record?.data?.id || record?.data?.dbKey || "")));
    const mainAssets = collectImportedAssets("main", mainScene?.draft?.importedIds || [], getStorageImportedRecords(indexedDb, "mainModels"), mainDbKeys);
    const realisticAssets = collectImportedAssets("realistic", realisticScene?.draft?.importedIds || [], getStorageImportedRecords(indexedDb, "realisticModels"), realisticDbKeys);
    const assets = [...mainAssets, ...realisticAssets];

    return {
      version: 1,
      importedModelCount: assets.length,
      missingBinaryCount: assets.filter((asset) => !asset.stored).length,
      assets
    };
  }

  function getStorageImportedRecords(indexedDb, dbId) {
    return getDbRecords(indexedDb?.[dbId]).map((record) => record?.data || {});
  }

  function getDbRecords(pack) {
    return Array.isArray(pack?.records) ? pack.records : [];
  }

  function collectImportedAssets(scene, layoutIds, records, dbKeys) {
    const byId = new Map(records.map((record) => [String(record.id || record.dbKey || record.key || ""), record]));
    return layoutIds.map((id) => {
      const record = byId.get(id) || byId.get(String(id).replace(/^imported-/, "import-")) || {};
      const dbKey = String(record.dbKey || record.key || record.id || id);
      return {
        scene,
        id: String(id),
        dbKey,
        label: String(record.label || record.fileName || id),
        fileName: String(record.fileName || ""),
        type: String(record.type || ""),
        stored: dbKeys.has(dbKey) || dbKeys.has(String(id)),
        bytes: normalizeCount(record.metrics?.fileSize || record.size || 0)
      };
    });
  }

  function createSummary(sections, assetManifest) {
    return {
      learningRecords: (sections.learning.sessionCount || 0) + (sections.learning.artworkCount || 0) + (sections.learning.reportCount || 0),
      mainDraftObjects: (sections.mainScene.draft.objectStateCount || 0) + (sections.mainScene.draft.customCount || 0) + (sections.mainScene.draft.importedCount || 0),
      mainSnapshots: sections.mainScene.history.snapshotCount || 0,
      realisticObjects: (sections.realisticScene.draft.objectStateCount || 0) + (sections.realisticScene.draft.importedCount || 0),
      realisticSnapshots: sections.realisticScene.history.snapshotCount || 0,
      roomRoles: sections.room.roleCount || 0,
      importedModels: assetManifest.importedModelCount || 0,
      missingModelBinaries: assetManifest.missingBinaryCount || 0
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
    createProjectSchema,
    validateProjectSchema
  };
})();

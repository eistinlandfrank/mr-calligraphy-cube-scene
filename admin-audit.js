(function initMRAdminAudit(global) {
  const STORAGE_KEY = "mr-calligraphy-admin-operator-audit-v1";
  const MAX_RECORDS_PER_SCOPE = 120;
  const DEFAULT_OPERATOR = {
    name: "本机操作者",
    role: "local-admin"
  };
  const ROLE_LABELS = {
    "local-admin": "本机管理员",
    owner: "负责人",
    editor: "编辑",
    reviewer: "复核"
  };
  const PERMISSION_LABELS = {
    view: "查看后台",
    operator: "切换本机操作者",
    export: "导出审计",
    edit: "编辑草稿",
    import: "导入资产",
    delete: "删除/恢复",
    publish: "本机发布",
    remote: "远端发布"
  };
  const ROLE_PERMISSIONS = {
    "local-admin": ["view", "operator", "export", "edit", "import", "delete", "publish", "remote"],
    owner: ["view", "operator", "export", "edit", "import", "delete", "publish", "remote"],
    editor: ["view", "operator", "export", "edit", "import", "delete", "publish", "remote"],
    reviewer: ["view", "operator", "export"]
  };
  const SCOPE_LABELS = {
    mainScene: "主场景后台",
    realisticScene: "写实后台"
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toPlainJson(value) {
    try {
      return JSON.parse(JSON.stringify(value ?? null));
    } catch (error) {
      return { value: String(value ?? "") };
    }
  }

  function normalizeRole(role) {
    const rawRole = String(role || DEFAULT_OPERATOR.role).trim();
    return ROLE_LABELS[rawRole] ? rawRole : DEFAULT_OPERATOR.role;
  }

  function normalizeOperator(operator = {}) {
    const name = String(operator.name || DEFAULT_OPERATOR.name).trim().slice(0, 40) || DEFAULT_OPERATOR.name;
    const role = normalizeRole(operator.role);
    return {
      name,
      role,
      roleLabel: ROLE_LABELS[role] || ROLE_LABELS[DEFAULT_OPERATOR.role],
      updatedAt: operator.updatedAt || ""
    };
  }

  function getRolePermissions(role) {
    const normalizedRole = normalizeRole(role);
    return ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS[DEFAULT_OPERATOR.role];
  }

  function createPermissionSummary(operator) {
    const permissions = getRolePermissions(operator.role);
    if (operator.role === "reviewer") {
      return "复核角色为只读：可查看与导出审计，不能编辑、导入、删除、发布或推送远端。";
    }
    return `当前角色可执行：${permissions.map((permission) => PERMISSION_LABELS[permission] || permission).join("、")}。`;
  }

  function normalizeRecord(record, scope) {
    if (!record || typeof record !== "object") {
      return null;
    }
    const createdAt = record.createdAt || nowIso();
    const operator = normalizeOperator(record.operator);
    return {
      id: String(record.id || createId("admin-audit")),
      scope,
      scopeLabel: SCOPE_LABELS[scope] || scope,
      action: String(record.action || "unknown").slice(0, 48),
      actionLabel: String(record.actionLabel || record.action || "未命名操作").slice(0, 80),
      target: String(record.target || "后台").slice(0, 120),
      detail: String(record.detail || "").slice(0, 240),
      result: String(record.result || "ok").slice(0, 24),
      createdAt,
      operator,
      metadata: toPlainJson(record.metadata || {})
    };
  }

  function normalizeScope(scopeValue, scope) {
    const operator = normalizeOperator(scopeValue?.operator);
    const records = Array.isArray(scopeValue?.records)
      ? scopeValue.records.map((record) => normalizeRecord(record, scope)).filter(Boolean).slice(0, MAX_RECORDS_PER_SCOPE)
      : [];
    return {
      operator,
      records
    };
  }

  function normalizeState(value) {
    const scopes = {};
    Object.keys(SCOPE_LABELS).forEach((scope) => {
      scopes[scope] = normalizeScope(value?.scopes?.[scope], scope);
    });
    return {
      version: 1,
      updatedAt: value?.updatedAt || "",
      scopes
    };
  }

  function readState() {
    try {
      const raw = global.localStorage?.getItem(STORAGE_KEY);
      return normalizeState(raw ? JSON.parse(raw) : null);
    } catch (error) {
      console.warn("Admin audit state could not be read.", error);
      return normalizeState(null);
    }
  }

  function writeState(state) {
    const nextState = normalizeState({
      ...state,
      updatedAt: nowIso()
    });
    try {
      global.localStorage?.setItem(STORAGE_KEY, JSON.stringify(nextState));
      return { ok: true, state: nextState };
    } catch (error) {
      console.warn("Admin audit state could not be saved.", error);
      return {
        ok: false,
        state: nextState,
        message: "保存后台审计失败，可能是浏览器本机存储空间不足。"
      };
    }
  }

  function getScopeState(state, scope) {
    const normalizedScope = SCOPE_LABELS[scope] ? scope : "mainScene";
    return {
      scope: normalizedScope,
      scopeLabel: SCOPE_LABELS[normalizedScope],
      bucket: state.scopes[normalizedScope] || normalizeScope(null, normalizedScope)
    };
  }

  function configureOperator(scope, operatorInput = {}) {
    const state = readState();
    const scopeState = getScopeState(state, scope);
    const operator = {
      ...normalizeOperator(operatorInput),
      updatedAt: nowIso()
    };
    scopeState.bucket.operator = operator;
    state.scopes[scopeState.scope] = scopeState.bucket;
    const saved = writeState(state);
    return {
      ...getStatus(scopeState.scope, saved.state),
      ok: saved.ok,
      message: saved.ok ? "已保存本机操作者。" : saved.message
    };
  }

  function getStatus(scope, suppliedState) {
    const state = suppliedState ? normalizeState(suppliedState) : readState();
    const scopeState = getScopeState(state, scope);
    const operator = normalizeOperator(scopeState.bucket.operator);
    const records = scopeState.bucket.records.slice(0, MAX_RECORDS_PER_SCOPE);
    return {
      ok: true,
      storageKey: STORAGE_KEY,
      scope: scopeState.scope,
      scopeLabel: scopeState.scopeLabel,
      operator,
      permissions: getRolePermissions(operator.role),
      permissionLabels: { ...PERMISSION_LABELS },
      permissionSummary: createPermissionSummary(operator),
      records,
      count: records.length,
      latest: records[0] || null,
      roleLabels: { ...ROLE_LABELS }
    };
  }

  function canPerform(scope, permission) {
    const status = getStatus(scope);
    const normalizedPermission = String(permission || "").trim();
    return status.permissions.includes(normalizedPermission);
  }

  function record(scope, recordInput = {}) {
    const state = readState();
    const scopeState = getScopeState(state, scope);
    const operator = normalizeOperator(scopeState.bucket.operator);
    const recordItem = normalizeRecord({
      ...recordInput,
      operator
    }, scopeState.scope);
    scopeState.bucket.records = [
      recordItem,
      ...scopeState.bucket.records.filter((item) => item.id !== recordItem.id)
    ].slice(0, MAX_RECORDS_PER_SCOPE);
    state.scopes[scopeState.scope] = scopeState.bucket;
    const saved = writeState(state);
    return {
      ...getStatus(scopeState.scope, saved.state),
      ok: saved.ok,
      message: saved.ok ? "已记录后台操作审计。" : saved.message,
      record: recordItem,
    };
  }

  function formatDateForFilename(value = nowIso()) {
    return String(value).replace(/[:.]/g, "-");
  }

  function buildExportHtml(status) {
    const rows = status.records.map((recordItem) => `
      <tr>
        <td>${escapeHtml(recordItem.createdAt)}</td>
        <td>${escapeHtml(recordItem.operator.name)} / ${escapeHtml(recordItem.operator.roleLabel)}</td>
        <td>${escapeHtml(recordItem.actionLabel)}</td>
        <td>${escapeHtml(recordItem.target)}</td>
        <td>${escapeHtml(recordItem.result)}</td>
        <td>${escapeHtml(recordItem.detail)}</td>
      </tr>`).join("");
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(status.scopeLabel)}操作审计</title>
  <style>
    body { margin: 32px; color: #1f2933; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f7f4ef; }
    h1 { margin: 0 0 8px; font-size: 24px; }
    p { margin: 0 0 18px; color: #5f6b76; }
    table { width: 100%; border-collapse: collapse; background: #fff; }
    th, td { padding: 10px 12px; border: 1px solid #e1d8c9; text-align: left; vertical-align: top; font-size: 13px; }
    th { background: #efe7da; }
    pre { padding: 14px; overflow: auto; background: #1f2933; color: #f8fafc; }
  </style>
</head>
<body>
  <h1>${escapeHtml(status.scopeLabel)}操作审计</h1>
  <p>导出时间：${escapeHtml(nowIso())}；操作者：${escapeHtml(status.operator.name)} / ${escapeHtml(status.operator.roleLabel)}；记录数：${status.count}。此审计仅来自本机浏览器 localStorage。</p>
  <table>
    <thead>
      <tr>
        <th>时间</th>
        <th>操作者</th>
        <th>动作</th>
        <th>对象</th>
        <th>结果</th>
        <th>说明</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <h2>原始 JSON</h2>
  <pre>${escapeHtml(JSON.stringify(status.records, null, 2))}</pre>
</body>
</html>`;
  }

  function getExport(scope) {
    const status = getStatus(scope);
    if (!status.count) {
      return {
        ...status,
        ok: false,
        message: "暂无后台操作审计记录可导出。"
      };
    }
    return {
      ...status,
      ok: true,
      message: `已生成 ${status.scopeLabel} 操作审计。`,
      filename: `mr-calligraphy-admin-audit-${status.scope}-${formatDateForFilename()}.html`,
      html: buildExportHtml(status)
    };
  }

  global.MRAdminAudit = {
    canPerform,
    configureOperator,
    getStatus,
    record,
    getExport
  };
})(window);

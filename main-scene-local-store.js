(function installMainSceneLocalStore(global) {
  const endpoints = {
    layout: "/api/main-scene/layout",
    published: "/api/main-scene/published"
  };

  async function read(kind) {
    const endpoint = endpoints[kind];
    if (!endpoint || !global.fetch || !/^https?:$/.test(global.location?.protocol || "")) {
      return { ok: false, source: "unavailable", data: null };
    }

    try {
      const response = await global.fetch(endpoint, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store"
      });
      if (!response.ok) {
        return { ok: false, source: "server-local", data: null, status: response.status };
      }
      const payload = await response.json();
      return {
        ok: payload?.ok === true,
        source: payload?.source || "server-local",
        updatedAt: payload?.updatedAt || "",
        data: payload?.data || null
      };
    } catch (error) {
      return { ok: false, source: "server-local", data: null, message: String(error?.message || error || "") };
    }
  }

  async function write(kind, data) {
    const endpoint = endpoints[kind];
    if (!endpoint || !global.fetch || !/^https?:$/.test(global.location?.protocol || "")) {
      return { ok: false, source: "unavailable" };
    }

    try {
      const response = await global.fetch(endpoint, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data || {})
      });
      const payload = await response.json().catch(() => ({}));
      return {
        ok: response.ok && payload?.ok === true,
        source: payload?.source || "server-local",
        updatedAt: payload?.updatedAt || "",
        data: payload?.data || data || null,
        status: response.status,
        message: payload?.message || ""
      };
    } catch (error) {
      return { ok: false, source: "server-local", message: String(error?.message || error || "") };
    }
  }

  global.MRMainSceneLocalStore = {
    readLayout: () => read("layout"),
    writeLayout: (layout) => write("layout", layout),
    readPublished: () => read("published"),
    writePublished: (record) => write("published", record)
  };
})(window);

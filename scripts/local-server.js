#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const path = require("path");
const { URL } = require("url");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.resolve(process.env.MR_SERVER_DATA_DIR || path.join(ROOT, "server-data"));
const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 41496);
const MAX_BODY_BYTES = 8 * 1024 * 1024;

const API_FILES = new Map([
  ["/api/main-scene/layout", path.join(DATA_DIR, "main-scene-layout.json")],
  ["/api/main-scene/published", path.join(DATA_DIR, "main-scene-published.json")]
]);

const MIME_TYPES = {
  ".css": "text/css;charset=utf-8",
  ".html": "text/html;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".mjs": "text/javascript;charset=utf-8",
  ".json": "application/json;charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml;charset=utf-8",
  ".glb": "model/gltf-binary",
  ".obj": "text/plain;charset=utf-8",
  ".wasm": "application/wasm"
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    if (API_FILES.has(url.pathname)) {
      await handleApi(request, response, url.pathname);
      return;
    }
    await serveStatic(request, response, url.pathname);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { ok: false, error: "server-error", message: "服务器处理失败。" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`MR 书法本地服务器：http://${HOST}:${PORT}/`);
  console.log(`主场景布局将保存到：${DATA_DIR}`);
});

async function handleApi(request, response, pathname) {
  const filePath = API_FILES.get(pathname);
  if (request.method === "GET") {
    const data = await readJsonFile(filePath);
    sendJson(response, 200, {
      ok: true,
      source: data.exists ? "server-local" : "empty",
      updatedAt: data.updatedAt,
      data: data.value
    });
    return;
  }

  if (request.method === "PUT") {
    const body = await readJsonBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      sendJson(response, 400, { ok: false, error: "invalid-json", message: "请求体必须是 JSON 对象。" });
      return;
    }
    await writeJsonFile(filePath, body);
    sendJson(response, 200, {
      ok: true,
      source: "server-local",
      updatedAt: new Date().toISOString(),
      data: body
    });
    return;
  }

  response.setHeader("Allow", "GET, PUT");
  sendJson(response, 405, { ok: false, error: "method-not-allowed", message: "只支持 GET / PUT。" });
}

async function serveStatic(request, response, pathname) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.statusCode = 405;
    response.end("Method Not Allowed");
    return;
  }

  const decoded = decodeURIComponent(pathname);
  const safePath = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(ROOT, safePath === "/" ? "index.html" : safePath);

  if (!isInsideRoot(filePath)) {
    response.statusCode = 403;
    response.end("Forbidden");
    return;
  }

  let stat = await statFile(filePath);
  if (stat?.isDirectory()) {
    filePath = path.join(filePath, "index.html");
    stat = await statFile(filePath);
  }
  if (!stat?.isFile()) {
    response.statusCode = 404;
    response.end("Not Found");
    return;
  }

  response.statusCode = 200;
  response.setHeader("Content-Length", stat.size);
  response.setHeader("Content-Type", MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream");
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  fs.createReadStream(filePath).pipe(response);
}

function isInsideRoot(filePath) {
  const relative = path.relative(ROOT, filePath);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function statFile(filePath) {
  return fs.promises.stat(filePath).catch(() => null);
}

async function readJsonFile(filePath) {
  try {
    const raw = await fs.promises.readFile(filePath, "utf8");
    const stat = await fs.promises.stat(filePath);
    return {
      exists: true,
      value: JSON.parse(raw),
      updatedAt: stat.mtime.toISOString()
    };
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`无法读取 ${filePath}:`, error.message || error);
    }
    return { exists: false, value: null, updatedAt: "" };
  }
}

async function writeJsonFile(filePath, value) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  const payload = `${JSON.stringify(value, null, 2)}\n`;
  await fs.promises.writeFile(tempPath, payload, "utf8");
  await fs.promises.rename(tempPath, filePath);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("请求体过大。"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json;charset=utf-8");
  response.end(JSON.stringify(payload));
}

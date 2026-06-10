export function getRoute(pathname) {
  const normalized = pathname.replace(/\/+$/, "") || "/";

  if (normalized === "/admin") {
    return { name: "admin" };
  }

  if (normalized === "/preview") {
    return { name: "preview", sceneId: "capsule-product-showcase" };
  }

  if (normalized.startsWith("/preview/")) {
    return {
      name: "preview",
      sceneId: decodeURIComponent(normalized.replace("/preview/", ""))
    };
  }

  return { name: "demo" };
}

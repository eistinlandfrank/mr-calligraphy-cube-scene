import { AdminPage } from "../admin/AdminPage.jsx";
import { DemoPage } from "../demo/DemoPage.jsx";
import { PreviewPage } from "../preview/PreviewPage.jsx";
import { getRoute } from "./routes.js";

export function App() {
  const route = getRoute(window.location.pathname);

  if (route.name === "admin") {
    return <AdminPage />;
  }

  if (route.name === "preview") {
    return <PreviewPage sceneId={route.sceneId} />;
  }

  return <DemoPage />;
}

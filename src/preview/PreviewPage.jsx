export function PreviewPage({ sceneId }) {
  return (
    <main className="app-page app-page-preview">
      <section className="page-hero">
        <p className="eyebrow">Preview</p>
        <h1>场景预览</h1>
        <p>当前预览场景：{sceneId}</p>
        <div className="route-actions">
          <a href="/demo">进入前台演示端</a>
          <a href="/admin">进入后台 3D 编辑端</a>
        </div>
      </section>
    </main>
  );
}

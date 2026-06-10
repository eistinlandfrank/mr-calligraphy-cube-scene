export function DemoPage() {
  return (
    <main className="app-page app-page-demo">
      <section className="page-hero">
        <p className="eyebrow">Demo / Experience</p>
        <h1>前台演示端</h1>
        <p>
          用于演示老人进入胶囊舱后的完整体验闭环：入舱、舱门关闭、
          沉浸启动、书法游戏、AI 反馈、作品生成和护工确认。
        </p>
        <div className="route-actions">
          <a href="/admin">进入后台 3D 编辑端</a>
          <a href="/preview/capsule-product-showcase">查看场景预览</a>
        </div>
      </section>
    </main>
  );
}

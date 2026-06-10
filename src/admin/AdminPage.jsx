export function AdminPage() {
  return (
    <main className="app-page app-page-admin">
      <section className="page-hero">
        <p className="eyebrow">Admin / 3D Scene Editor</p>
        <h1>后台 3D 编辑端</h1>
        <p>
          用于管理胶囊舱 3D 场景、对象、材质、灯光、热点、流程节点和导出配置。
        </p>
        <div className="route-actions">
          <a href="/demo">进入前台演示端</a>
          <a href="/preview/capsule-product-showcase">查看场景预览</a>
        </div>
      </section>
    </main>
  );
}

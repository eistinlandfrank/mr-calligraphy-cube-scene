const metricLabels = {
  pathAccuracy: "路径准确度",
  strokeOrder: "笔顺完成度",
  rhythm: "节奏稳定度",
  focus: "专注度"
};

export function ReportView({ phase, report }) {
  if (!report) {
    return (
      <section className="mode-panel report-panel" aria-label="体验报告">
        <div className="panel-heading">
          <span>Report</span>
          <strong>{phase.label}</strong>
        </div>
        <p className="report-empty">报告数据正在生成。</p>
      </section>
    );
  }

  return (
    <section className="mode-panel report-panel" aria-label="体验报告">
      <div className="panel-heading">
        <span>Report</span>
        <strong>{phase.label}</strong>
      </div>
      <div className="report-score-card">
        <span>综合分</span>
        <strong>{report.score}</strong>
        <small>{report.summary}</small>
      </div>
      <div className="report-metric-grid">
        {Object.entries(report.metrics).map(([key, value]) => (
          <article key={key}>
            <span>{metricLabels[key] ?? key}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="report-suggestions">
        <span>练习建议</span>
        {report.suggestions.map((suggestion) => (
          <p key={suggestion}>{suggestion}</p>
        ))}
      </div>
    </section>
  );
}

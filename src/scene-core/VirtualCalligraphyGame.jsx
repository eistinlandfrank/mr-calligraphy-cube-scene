import { Check, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import yongCharacter from "../data/calligraphy/yongCharacter.json" assert { type: "json" };

const metricLabels = {
  structure: "结构",
  stroke: "笔画",
  method: "笔法",
  rhythm: "节奏",
  focus: "专注"
};

export function VirtualCalligraphyGame({ compact = false, onComplete, onProgressChange }) {
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [completedStrokeIds, setCompletedStrokeIds] = useState([]);
  const [scorePanel, setScorePanel] = useState(null);
  const currentStroke = yongCharacter.strokes[currentStrokeIndex];

  useEffect(() => {
    setProgress(0);
    setIsPlaying(true);
  }, [currentStrokeIndex]);

  useEffect(() => {
    if (!isPlaying || scorePanel) {
      return undefined;
    }

    let frameId = 0;
    const startedAt = performance.now();
    const duration = (currentStroke?.duration ?? 1.2) * 1000;

    function step(now) {
      const nextProgress = Math.min(1, (now - startedAt) / duration);
      setProgress(nextProgress);

      if (nextProgress < 1) {
        frameId = requestAnimationFrame(step);
        return;
      }

      setIsPlaying(false);
      setCompletedStrokeIds((ids) => (ids.includes(currentStroke.id) ? ids : [...ids, currentStroke.id]));
    }

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [currentStroke, isPlaying, scorePanel]);

  useEffect(() => {
    const totalProgress = Math.round(((completedStrokeIds.length + progress) / yongCharacter.strokes.length) * 100);
    onProgressChange?.(totalProgress, currentStroke?.label);
  }, [completedStrokeIds, currentStroke, onProgressChange, progress]);

  const brushPosition = useMemo(() => getBrushPosition(currentStroke.points, progress), [currentStroke, progress]);
  const activeTip = scorePanel ? "作品已生成，可查看鼓励式评分。" : currentStroke.tip;

  function nextStroke() {
    setCompletedStrokeIds((ids) => (ids.includes(currentStroke.id) ? ids : [...ids, currentStroke.id]));

    if (currentStrokeIndex >= yongCharacter.strokes.length - 1) {
      completeWork();
      return;
    }

    setCurrentStrokeIndex((index) => index + 1);
  }

  function replayStroke() {
    setProgress(0);
    setIsPlaying(true);
  }

  function completeWork() {
    const score = buildScore(completedStrokeIds.length + 1);
    setScorePanel(score);
    setIsPlaying(false);
    onComplete?.(score);
  }

  return (
    <section className={`virtual-calligraphy-game ${compact ? "is-compact" : ""}`} aria-label="虚拟书法游戏">
      <div className="calligraphy-head">
        <div>
          <span>{yongCharacter.title}</span>
          <strong>虚拟毛笔路径练习</strong>
        </div>
        <div className="stroke-counter">
          {currentStrokeIndex + 1}/{yongCharacter.strokes.length}
        </div>
      </div>

      <div className="calligraphy-workspace">
        <svg className="yong-canvas" viewBox={yongCharacter.viewBox} role="img" aria-label="永字八法笔画路径">
          <rect x="28" y="28" width="244" height="244" rx="6" />
          <path className="grid-line" d="M150 28 V272 M28 150 H272 M64 64 L236 236 M236 64 L64 236" />
          <text x="150" y="214">永</text>
          {yongCharacter.strokes.map((stroke, index) => {
            const isDone = completedStrokeIds.includes(stroke.id);
            const isActive = index === currentStrokeIndex && !scorePanel;
            return (
              <path
                key={stroke.id}
                className={`standard-stroke ${isDone ? "is-done" : ""} ${isActive ? "is-active" : ""}`}
                d={stroke.path}
                pathLength="100"
                style={isActive ? { strokeDashoffset: 100 - progress * 100 } : undefined}
              />
            );
          })}
          {!scorePanel ? (
            <g className="virtual-brush" transform={`translate(${brushPosition.x} ${brushPosition.y}) rotate(-32)`}>
              <line x1="-28" y1="0" x2="18" y2="0" />
              <circle cx="-34" cy="0" r="7" />
              <path d="M18 -7 L38 0 L18 7 Z" />
            </g>
          ) : null}
        </svg>

        <aside className="stroke-side-panel">
          <div className="current-stroke-card">
            <span>当前笔画</span>
            <strong>{currentStroke.label}</strong>
            <p>{activeTip}</p>
          </div>
          <div className="stroke-pill-grid">
            {yongCharacter.strokes.map((stroke, index) => (
              <span
                key={stroke.id}
                className={`${index === currentStrokeIndex ? "is-active" : ""} ${
                  completedStrokeIds.includes(stroke.id) ? "is-done" : ""
                }`}
              >
                {stroke.label}
              </span>
            ))}
          </div>
        </aside>
      </div>

      <div className="calligraphy-actions">
        <button type="button" onClick={nextStroke}>
          <SkipForward size={16} strokeWidth={2.2} />
          <span>下一笔</span>
        </button>
        <button type="button" onClick={replayStroke}>
          <RotateCcw size={16} strokeWidth={2.2} />
          <span>重播</span>
        </button>
        <button type="button" onClick={completeWork}>
          <Check size={16} strokeWidth={2.2} />
          <span>完成作品</span>
        </button>
      </div>

      {scorePanel ? <ScorePanel score={scorePanel} /> : null}
    </section>
  );
}

function ScorePanel({ score }) {
  return (
    <section className="calligraphy-score-panel" aria-label="作品评分面板">
      <div>
        <span>综合评分</span>
        <strong>{score.total}</strong>
      </div>
      <div className="score-metric-grid">
        {Object.entries(score.metrics).map(([key, value]) => (
          <article key={key}>
            <span>{metricLabels[key]}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <p>{score.suggestion}</p>
    </section>
  );
}

function getBrushPosition(points, progress) {
  if (!points?.length) {
    return { x: 150, y: 150 };
  }

  const segmentCount = points.length - 1;
  const rawIndex = Math.min(segmentCount - 1, Math.floor(progress * segmentCount));
  const localProgress = progress * segmentCount - rawIndex;
  const start = points[rawIndex];
  const end = points[rawIndex + 1] ?? start;

  return {
    x: interpolate(start[0], end[0], localProgress),
    y: interpolate(start[1], end[1], localProgress)
  };
}

function buildScore(completedCount) {
  const completionBoost = Math.min(8, completedCount);
  const metrics = Object.fromEntries(
    Object.entries(yongCharacter.scoreTemplate).map(([key, value], index) => [
      key,
      clamp(value + completionBoost - index, 0, 100)
    ])
  );
  const total = Math.round(Object.values(metrics).reduce((sum, value) => sum + value, 0) / Object.values(metrics).length);
  const lowestMetric = Object.entries(metrics).sort((a, b) => a[1] - b[1])[0][0];

  return {
    total,
    metrics,
    suggestion: `整体完成稳定，下一轮可继续关注“${metricLabels[lowestMetric]}”，保持呼吸节奏后再写一遍。`
  };
}

function interpolate(start, end, progress) {
  return start + (end - start) * progress;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

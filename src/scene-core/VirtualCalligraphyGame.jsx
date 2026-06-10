import { Check, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import yongCharacter from "../data/calligraphy/yongCharacter.json" assert { type: "json" };

const metricLabels = {
  structure: "结构",
  stroke: "笔画",
  method: "笔法",
  rhythm: "节奏",
  focus: "专注"
};

export function VirtualCalligraphyGame({ compact = false, paused = false, onComplete, onProgressChange }) {
  const svgRef = useRef(null);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userStrokePoints, setUserStrokePoints] = useState([]);
  const [strokeFeedback, setStrokeFeedback] = useState("");
  const [strokeOrderWarnings, setStrokeOrderWarnings] = useState(0);
  const [completedStrokeIds, setCompletedStrokeIds] = useState([]);
  const [completedStrokeRecords, setCompletedStrokeRecords] = useState([]);
  const [scorePanel, setScorePanel] = useState(null);
  const currentStroke = yongCharacter.strokes[currentStrokeIndex];

  useEffect(() => {
    setProgress(0);
    setIsPlaying(true);
    setIsDrawing(false);
    setUserStrokePoints([]);
    setStrokeFeedback("");
  }, [currentStrokeIndex]);

  useEffect(() => {
    if (!isPlaying || scorePanel || paused) {
      return undefined;
    }

    let frameId = 0;
    const startedAt = performance.now();
    const startProgress = progress;
    const duration = Math.max(120, (1 - startProgress) * (currentStroke?.duration ?? 1.2) * 1000);

    function step(now) {
      const nextProgress = Math.min(1, startProgress + (1 - startProgress) * ((now - startedAt) / duration));
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
  }, [currentStroke, isPlaying, paused, scorePanel]);

  useEffect(() => {
    const totalProgress = Math.round(((completedStrokeIds.length + progress) / yongCharacter.strokes.length) * 100);
    onProgressChange?.(totalProgress, currentStroke?.label);
  }, [completedStrokeIds, currentStroke, onProgressChange, progress]);

  const brushPosition = useMemo(() => getBrushPosition(currentStroke.points, progress), [currentStroke, progress]);
  const activeTip = scorePanel ? "作品已生成，可查看鼓励式评分。" : currentStroke.tip;
  const latestStrokeRecord = completedStrokeRecords[completedStrokeRecords.length - 1];

  function nextStroke() {
    const nextCompletedIds = addUniqueId(completedStrokeIds, currentStroke.id);
    setCompletedStrokeIds(nextCompletedIds);

    if (currentStrokeIndex >= yongCharacter.strokes.length - 1) {
      completeWork(completedStrokeRecords, nextCompletedIds.length);
      return;
    }

    setCurrentStrokeIndex((index) => index + 1);
  }

  function replayStroke() {
    setProgress(0);
    setIsPlaying(true);
    setIsDrawing(false);
    setUserStrokePoints([]);
  }

  function completeWork(strokeRecords = completedStrokeRecords, completedCount = completedStrokeIds.length) {
    if (scorePanel) {
      return;
    }

    const normalizedCompletedCount = Math.min(
      yongCharacter.strokes.length,
      Math.max(completedCount, strokeRecords.length)
    );
    const score = buildScore(normalizedCompletedCount);
    const completedAt = new Date().toISOString();
    const result = {
      ...score,
      practiceState: "completed",
      completedAt,
      completedStrokeCount: normalizedCompletedCount,
      totalStrokeCount: yongCharacter.strokes.length,
      strokeRecords
    };

    setProgress(1);
    setScorePanel(result);
    setIsPlaying(false);
    onProgressChange?.(100, currentStroke?.label);
    onComplete?.(result);
  }

  function startInput(event) {
    if (scorePanel || paused) {
      return;
    }

    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = getSvgPoint(event, svgRef.current);
    const expectedStart = getExpectedStartPoint(currentStroke);

    if (getPointDistance(point, expectedStart) > 58) {
      setStrokeOrderWarnings((count) => count + 1);
      setStrokeFeedback(`请按顺序从「${currentStroke.label}」起笔位置开始。`);
      return;
    }

    setIsPlaying(false);
    setIsDrawing(true);
    setUserStrokePoints([point]);
    setStrokeFeedback("正在记录当前笔画轨迹。");
    setProgress(0);
  }

  function moveInput(event) {
    if (!isDrawing || scorePanel || paused) {
      return;
    }

    const point = getSvgPoint(event, svgRef.current);

    setUserStrokePoints((points) => {
      const lastPoint = points[points.length - 1];

      if (lastPoint && getPointDistance(lastPoint, point) < 1.8) {
        return points;
      }

      const nextPoints = [...points, point];
      setProgress(Math.min(1, nextPoints.length / 42));
      return nextPoints;
    });
  }

  function endInput(event) {
    if (!isDrawing) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setIsDrawing(false);
    evaluateStrokeCompletion(userStrokePoints);
  }

  function evaluateStrokeCompletion(points) {
    if (points.length < 8 || progress < 0.3) {
      setStrokeFeedback("轨迹太短，请重写当前笔画。");
      setProgress(0);
      return;
    }

    const deviation = calculatePathDeviation(points, currentStroke.points);
    const rhythm = calculateRhythmStability(points, currentStroke.duration);
    const strokeRecord = {
      strokeId: currentStroke.id,
      label: currentStroke.label,
      pointCount: points.length,
      averageDeviation: deviation.averageDeviation,
      maxDeviation: deviation.maxDeviation,
      pathAccuracy: deviation.pathAccuracy,
      actualDurationMs: rhythm.actualDurationMs,
      expectedDurationMs: rhythm.expectedDurationMs,
      durationRatio: rhythm.durationRatio,
      rhythmStability: rhythm.rhythmStability,
      completedAt: new Date().toISOString()
    };
    const nextStrokeRecords = mergeStrokeRecord(completedStrokeRecords, strokeRecord);
    const nextCompletedIds = addUniqueId(completedStrokeIds, currentStroke.id);

    setCompletedStrokeRecords(nextStrokeRecords);
    setCompletedStrokeIds(nextCompletedIds);
    setStrokeFeedback(`「${currentStroke.label}」已完成，平均偏差 ${deviation.averageDeviation} 点。`);

    if (currentStrokeIndex >= yongCharacter.strokes.length - 1) {
      completeWork(nextStrokeRecords, nextCompletedIds.length);
      return;
    }

    window.setTimeout(() => {
      setCurrentStrokeIndex((index) => Math.min(index + 1, yongCharacter.strokes.length - 1));
    }, 420);
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
        <svg
          ref={svgRef}
          className="yong-canvas"
          viewBox={yongCharacter.viewBox}
          role="img"
          aria-label="永字八法笔画路径"
          onPointerDown={startInput}
          onPointerMove={moveInput}
          onPointerUp={endInput}
          onPointerCancel={endInput}
          onPointerLeave={endInput}
        >
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
          {userStrokePoints.length > 1 ? (
            <polyline className="user-stroke" points={userStrokePoints.map((point) => `${point.x},${point.y}`).join(" ")} />
          ) : null}
        </svg>

        <aside className="stroke-side-panel">
          <div className="current-stroke-card">
            <span>当前笔画</span>
            <strong>{currentStroke.label}</strong>
            <p>{strokeFeedback || activeTip}</p>
            <small>已记录 {userStrokePoints.length} 个轨迹点</small>
            {latestStrokeRecord ? (
              <small className="stroke-metric-line">
                最近一笔偏差 {latestStrokeRecord.averageDeviation} 点 · 节奏稳定 {latestStrokeRecord.rhythmStability}
              </small>
            ) : null}
            {strokeOrderWarnings ? <small>笔顺提醒 {strokeOrderWarnings} 次</small> : null}
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

function getSvgPoint(event, svgElement) {
  if (!svgElement) {
    return { x: 150, y: 150, t: performance.now() };
  }

  const point = svgElement.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = svgElement.getScreenCTM();
  const svgPoint = matrix ? point.matrixTransform(matrix.inverse()) : point;

  return {
    x: roundPoint(svgPoint.x),
    y: roundPoint(svgPoint.y),
    t: Math.round(performance.now())
  };
}

function getExpectedStartPoint(stroke) {
  const [x = 150, y = 150] = stroke.points[0] ?? [];
  return { x, y };
}

function addUniqueId(ids, id) {
  return ids.includes(id) ? ids : [...ids, id];
}

function mergeStrokeRecord(records, strokeRecord) {
  return [...records.filter((record) => record.strokeId !== strokeRecord.strokeId), strokeRecord];
}

function calculatePathDeviation(userPoints, standardPoints) {
  const standardPath = standardPoints.map(([x, y]) => ({ x, y }));

  if (!userPoints.length || standardPath.length < 2) {
    return {
      averageDeviation: 0,
      maxDeviation: 0,
      pathAccuracy: 100
    };
  }

  const distances = userPoints.map((point) => getDistanceToPolyline(point, standardPath));
  const totalDistance = distances.reduce((sum, distance) => sum + distance, 0);
  const averageDeviation = totalDistance / distances.length;
  const maxDeviation = Math.max(...distances);

  return {
    averageDeviation: roundMetric(averageDeviation),
    maxDeviation: roundMetric(maxDeviation),
    pathAccuracy: clamp(Math.round(100 - averageDeviation * 2.4), 0, 100)
  };
}

function calculateRhythmStability(userPoints, expectedDurationSeconds) {
  const expectedDurationMs = Math.round((expectedDurationSeconds ?? 1.2) * 1000);
  const firstPoint = userPoints[0];
  const lastPoint = userPoints[userPoints.length - 1] ?? firstPoint;
  const actualDurationMs = Math.max(120, Math.round((lastPoint?.t ?? 0) - (firstPoint?.t ?? 0)));
  const durationRatio = expectedDurationMs ? actualDurationMs / expectedDurationMs : 1;
  const deviationRatio = expectedDurationMs ? Math.abs(actualDurationMs - expectedDurationMs) / expectedDurationMs : 0;

  return {
    actualDurationMs,
    expectedDurationMs,
    durationRatio: roundMetric(durationRatio),
    rhythmStability: clamp(Math.round(100 - deviationRatio * 70), 0, 100)
  };
}

function getDistanceToPolyline(point, polyline) {
  let shortestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < polyline.length - 1; index += 1) {
    const distance = getDistanceToSegment(point, polyline[index], polyline[index + 1]);
    shortestDistance = Math.min(shortestDistance, distance);
  }

  return shortestDistance;
}

function getDistanceToSegment(point, start, end) {
  const segmentX = end.x - start.x;
  const segmentY = end.y - start.y;
  const segmentLengthSquared = segmentX * segmentX + segmentY * segmentY;

  if (!segmentLengthSquared) {
    return getPointDistance(point, start);
  }

  const projection = ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) / segmentLengthSquared;
  const clampedProjection = clamp(projection, 0, 1);
  const projectedPoint = {
    x: start.x + segmentX * clampedProjection,
    y: start.y + segmentY * clampedProjection
  };

  return getPointDistance(point, projectedPoint);
}

function getPointDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function roundPoint(value) {
  return Math.round(value * 10) / 10;
}

function roundMetric(value) {
  return Math.round(value * 10) / 10;
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

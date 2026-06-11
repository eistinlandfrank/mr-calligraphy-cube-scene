(function () {
  const TARGET_STROKE_COUNTS = {
    "永": 8,
    "和": 8,
    "雅": 12
  };
  const SCORE_WEIGHTS = {
    structure: 0.26,
    stroke: 0.24,
    technique: 0.2,
    fluency: 0.18,
    force: 0.12
  };

  const state = {
    canvas: null,
    ctx: null,
    statusEl: null,
    undoButton: null,
    clearButton: null,
    replayButton: null,
    glyph: "永",
    strokes: [],
    currentStroke: null,
    isDrawing: false,
    replayTimer: null,
    width: 0,
    height: 0,
    dpr: 1
  };

  function init(options = {}) {
    state.canvas = options.canvas || null;
    state.statusEl = options.statusEl || null;
    state.undoButton = options.undoButton || null;
    state.clearButton = options.clearButton || null;
    state.replayButton = options.replayButton || null;
    state.glyph = String(options.glyph || state.glyph || "永");

    if (!state.canvas) {
      return;
    }

    state.ctx = state.canvas.getContext("2d");
    bindCanvas();
    bindToolbar();
    resize();
    render();
    setStatus("在米字格中书写，保存作品时会记录笔迹和截图。");
    window.addEventListener("resize", resize);
  }

  function bindCanvas() {
    state.canvas.addEventListener("pointerdown", beginStroke);
    state.canvas.addEventListener("pointermove", extendStroke);
    state.canvas.addEventListener("pointerup", endStroke);
    state.canvas.addEventListener("pointercancel", cancelStroke);
    state.canvas.addEventListener("pointerleave", endStroke);
  }

  function bindToolbar() {
    state.undoButton?.addEventListener("click", undo);
    state.clearButton?.addEventListener("click", clear);
    state.replayButton?.addEventListener("click", replay);
  }

  function resize() {
    if (!state.canvas || !state.ctx) return;

    const rect = state.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = width;
    state.height = height;
    state.dpr = dpr;
    state.canvas.width = Math.round(width * dpr);
    state.canvas.height = Math.round(height * dpr);
    state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  }

  function setGlyph(glyph, options = {}) {
    const nextGlyph = String(glyph || "永");
    if (state.glyph === nextGlyph) {
      return;
    }
    state.glyph = nextGlyph;
    if (options.clear !== false) {
      state.strokes = [];
      state.currentStroke = null;
    }
    render();
    setStatus(`当前练习字：${state.glyph}。`);
  }

  function beginStroke(event) {
    if (!state.canvas || !state.ctx || event.button !== 0) return;
    stopReplay();
    state.isDrawing = true;
    state.currentStroke = [pointFromEvent(event)];
    state.canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function extendStroke(event) {
    if (!state.isDrawing || !state.currentStroke) return;

    const point = pointFromEvent(event);
    const previous = state.currentStroke[state.currentStroke.length - 1];
    if (!previous || distance(previous, point) >= 0.004 || point.t - previous.t > 45) {
      state.currentStroke.push(point);
      render();
    }
    event.preventDefault();
  }

  function endStroke(event) {
    if (!state.isDrawing) return;

    if (state.currentStroke && state.currentStroke.length > 1) {
      state.strokes.push(simplifyStroke(state.currentStroke));
      const result = getResult({ includeImage: false });
      setStatus(`${state.strokes.length} 笔，当前评分 ${result.score}。${result.feedback[0] || "继续完成作品。"}`);
    }

    state.currentStroke = null;
    state.isDrawing = false;
    if (event?.pointerId != null && state.canvas?.hasPointerCapture?.(event.pointerId)) {
      state.canvas.releasePointerCapture(event.pointerId);
    }
    render();
  }

  function cancelStroke(event) {
    state.currentStroke = null;
    state.isDrawing = false;
    if (event?.pointerId != null && state.canvas?.hasPointerCapture?.(event.pointerId)) {
      state.canvas.releasePointerCapture(event.pointerId);
    }
    render();
  }

  function pointFromEvent(event) {
    const rect = state.canvas.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
    const y = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1);
    return {
      x: Number(x.toFixed(4)),
      y: Number(y.toFixed(4)),
      t: Math.round(performance.now()),
      p: Number((event.pressure && event.pressure > 0 ? event.pressure : 0.5).toFixed(3))
    };
  }

  function simplifyStroke(stroke) {
    if (stroke.length <= 160) {
      return stroke.map(normalizePoint);
    }

    const step = Math.ceil(stroke.length / 160);
    const simplified = stroke.filter((_, index) => index % step === 0);
    const last = stroke[stroke.length - 1];
    if (simplified[simplified.length - 1] !== last) {
      simplified.push(last);
    }
    return simplified.map(normalizePoint);
  }

  function normalizePoint(point) {
    return {
      x: Number(point.x),
      y: Number(point.y),
      t: Number(point.t || 0),
      p: Number(point.p || 0.5)
    };
  }

  function render(strokes = state.strokes, currentStroke = state.currentStroke) {
    if (!state.ctx) return;

    const ctx = state.ctx;
    ctx.clearRect(0, 0, state.width, state.height);
    drawGuides(ctx, state.width, state.height);
    drawStrokes(ctx, strokes, "rgba(9, 8, 7, 0.88)", 5.2);

    if (currentStroke && currentStroke.length > 1) {
      drawStrokes(ctx, [currentStroke], "rgba(9, 8, 7, 0.76)", 5.2);
    }
  }

  function drawGuides(ctx, width, height) {
    ctx.save();
    ctx.strokeStyle = "rgba(125, 42, 32, 0.22)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 6]);
    drawLine(ctx, width * 0.5, 0, width * 0.5, height);
    drawLine(ctx, 0, height * 0.5, width, height * 0.5);
    drawLine(ctx, 0, 0, width, height);
    drawLine(ctx, width, 0, 0, height);
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(125, 42, 32, 0.32)";
    ctx.strokeRect(width * 0.08, height * 0.08, width * 0.84, height * 0.84);
    ctx.restore();
  }

  function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function drawStrokes(ctx, strokes, color, width) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = width;

    strokes.forEach((stroke) => {
      if (!stroke || stroke.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(stroke[0].x * state.width, stroke[0].y * state.height);
      for (let index = 1; index < stroke.length; index += 1) {
        const previous = stroke[index - 1];
        const point = stroke[index];
        const midX = ((previous.x + point.x) / 2) * state.width;
        const midY = ((previous.y + point.y) / 2) * state.height;
        ctx.quadraticCurveTo(previous.x * state.width, previous.y * state.height, midX, midY);
      }
      const last = stroke[stroke.length - 1];
      ctx.lineTo(last.x * state.width, last.y * state.height);
      ctx.stroke();
    });

    ctx.restore();
  }

  function undo() {
    stopReplay();
    if (!state.strokes.length) {
      setStatus("当前没有可撤销的笔画。");
      return;
    }
    state.strokes.pop();
    render();
    setStatus(`已撤销上一笔，剩余 ${state.strokes.length} 笔。`);
  }

  function clear() {
    stopReplay();
    state.strokes = [];
    state.currentStroke = null;
    render();
    setStatus("已清空练习格，可以重新书写。");
  }

  function replay() {
    if (!state.strokes.length) {
      setStatus("还没有笔迹可回放。");
      return;
    }

    stopReplay();
    const replayStrokes = state.strokes.map((stroke) => []);
    let strokeIndex = 0;
    let pointIndex = 0;
    setStatus("正在回放笔迹...");

    state.replayTimer = window.setInterval(() => {
      const stroke = state.strokes[strokeIndex];
      if (!stroke) {
        stopReplay();
        render();
        setStatus("回放完成。");
        return;
      }

      replayStrokes[strokeIndex].push(stroke[pointIndex]);
      pointIndex += 1;
      if (pointIndex >= stroke.length) {
        strokeIndex += 1;
        pointIndex = 0;
      }
      render(replayStrokes);
    }, 24);
  }

  function exportReplayVideo(options = {}) {
    const strokes = normalizeVideoStrokes(options.strokes || state.strokes);
    const glyph = String(options.glyph || state.glyph || "永");
    const width = Number(options.width || 720);
    const height = Number(options.height || 720);
    const fps = Number(options.fps || 30);
    const durationMs = clamp(Number(options.durationMs || 0) || getReplayVideoDuration(strokes), 2400, 12000);

    if (!strokes.length) {
      return Promise.resolve({ ok: false, message: "还没有可导出的视频笔迹，请先书写或选择一条练习记录。" });
    }
    const canCaptureStream = typeof HTMLCanvasElement !== "undefined" && HTMLCanvasElement.prototype.captureStream;
    if (!window.MediaRecorder || !canCaptureStream) {
      return Promise.resolve({ ok: false, message: "当前浏览器不支持 Canvas 视频录制，请使用新版 Chrome / Edge / Firefox。" });
    }

    return new Promise((resolve) => {
      const output = document.createElement("canvas");
      output.width = width;
      output.height = height;
      const ctx = output.getContext("2d");
      const stream = output.captureStream(fps);
      const chunks = [];
      const mimeType = getSupportedVideoMimeType();
      let recorder;

      try {
        recorder = new window.MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      } catch (error) {
        stream.getTracks().forEach((track) => track.stop());
        resolve({ ok: false, message: "无法启动视频录制，浏览器不支持当前视频格式。" });
        return;
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        resolve({ ok: false, message: "视频录制失败，请稍后重试。" });
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (!chunks.length) {
          resolve({ ok: false, message: "视频导出失败，没有生成有效视频数据。" });
          return;
        }
        const blob = new Blob(chunks, { type: mimeType || "video/webm" });
        resolve({
          ok: true,
          blob,
          mimeType: blob.type,
          durationMs,
          message: `已生成 ${Math.round(durationMs / 1000)} 秒书写回放视频。`
        });
      };

      const start = performance.now();
      drawReplayVideoFrame(ctx, { strokes, glyph, width, height, progress: 0 });
      recorder.start(120);

      function step(now) {
        const progress = clamp((now - start) / durationMs, 0, 1);
        drawReplayVideoFrame(ctx, { strokes, glyph, width, height, progress });
        if (progress < 1 && recorder.state === "recording") {
          window.requestAnimationFrame(step);
          return;
        }
        drawReplayVideoFrame(ctx, { strokes, glyph, width, height, progress: 1 });
        window.setTimeout(() => {
          if (recorder.state === "recording") {
            recorder.stop();
          }
        }, 180);
      }

      window.requestAnimationFrame(step);
    });
  }

  function normalizeVideoStrokes(strokes) {
    return Array.isArray(strokes)
      ? strokes.map((stroke) => Array.isArray(stroke) ? stroke.map(normalizePoint).filter(isValidPoint) : []).filter((stroke) => stroke.length > 1)
      : [];
  }

  function isValidPoint(point) {
    return Number.isFinite(point.x) && Number.isFinite(point.y);
  }

  function getReplayVideoDuration(strokes) {
    const pointCount = strokes.reduce((sum, stroke) => sum + stroke.length, 0);
    return Math.min(9000, Math.max(2800, pointCount * 28 + strokes.length * 220));
  }

  function getSupportedVideoMimeType() {
    const types = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ];
    return types.find((type) => window.MediaRecorder?.isTypeSupported?.(type)) || "";
  }

  function drawReplayVideoFrame(ctx, { strokes, glyph, width, height, progress }) {
    const visibleStrokes = getVisibleReplayStrokes(strokes, progress);
    ctx.fillStyle = "#f2e5cb";
    ctx.fillRect(0, 0, width, height);
    drawSnapshotGuides(ctx, width, height);
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#1a130f";
    ctx.font = "500 410px KaiTi, STKaiti, SimSun, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(glyph, width / 2, height / 2 + 18);
    ctx.restore();
    drawSnapshotStrokes(ctx, visibleStrokes, width, height);
    drawReplayVideoMeta(ctx, { glyph, strokes, width, height, progress });
  }

  function getVisibleReplayStrokes(strokes, progress) {
    const totalPoints = strokes.reduce((sum, stroke) => sum + stroke.length, 0);
    let remaining = Math.max(0, Math.ceil(totalPoints * progress));
    const visible = [];

    for (const stroke of strokes) {
      if (remaining <= 0) break;
      if (remaining >= stroke.length) {
        visible.push(stroke);
        remaining -= stroke.length;
        continue;
      }
      if (remaining > 1) {
        visible.push(stroke.slice(0, remaining));
      }
      break;
    }

    return visible;
  }

  function drawReplayVideoMeta(ctx, { glyph, strokes, width, height, progress }) {
    ctx.save();
    ctx.fillStyle = "rgba(29, 18, 9, 0.74)";
    ctx.font = "700 24px Microsoft YaHei, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`MR 书法 · ${glyph}字回放`, 34, 46);
    ctx.font = "500 17px Microsoft YaHei, sans-serif";
    ctx.fillText(`${strokes.length} 笔 · ${Math.round(progress * 100)}%`, 34, height - 34);
    ctx.restore();
  }

  function stopReplay() {
    if (state.replayTimer) {
      window.clearInterval(state.replayTimer);
      state.replayTimer = null;
    }
  }

  function getResult(options = {}) {
    const analysis = analyzeStrokes(state.strokes, {
      glyph: state.glyph,
      width: state.width,
      height: state.height
    });
    return {
      ...analysis,
      strokes: cloneStrokes(state.strokes),
      imageData: options.includeImage === false ? null : getSnapshot()
    };
  }

  function analyzeStrokes(strokes, options = {}) {
    const glyph = String(options.glyph || "永");
    const allPoints = strokes.flat();
    const targetCount = TARGET_STROKE_COUNTS[glyph] || 8;

    if (!allPoints.length) {
      return {
        glyph,
        strokeCount: 0,
        pointCount: 0,
        bounds: null,
        metrics: { structure: 0, stroke: 0, technique: 0, fluency: 0, force: 0 },
        score: 0,
        feedback: ["请先在练习格中书写。"],
        scoreEvidence: buildScoreEvidence({
          glyph,
          targetCount,
          strokeCount: 0,
          pointCount: 0,
          metrics: { structure: 0, stroke: 0, technique: 0, fluency: 0, force: 0 },
          coverage: 0,
          centerOffset: 0,
          totalLength: 0,
          segmentStats: { variation: 0, pressureSpread: 0, longBreaks: 0 },
          bounds: null
        })
      };
    }

    const bounds = getBounds(allPoints);
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const centerOffset = Math.hypot(centerX - 0.5, centerY - 0.5);
    const coverage = Math.sqrt(Math.max(0.001, width * height));
    const totalLength = getTotalLength(strokes);
    const segmentStats = getSegmentStats(strokes);
    const strokeCompleteness = clamp(100 - Math.abs(strokes.length - targetCount) * 8, 45, 100);
    const structure = clamp(100 - centerOffset * 150 - Math.abs(coverage - 0.58) * 58, 35, 100);
    const stroke = clamp(strokeCompleteness - Math.max(0, 0.36 - coverage) * 45, 35, 100);
    const technique = clamp(58 + Math.min(28, totalLength * 10) + Math.min(12, strokes.length * 1.5), 35, 100);
    const fluency = clamp(100 - segmentStats.variation * 34 - Math.max(0, segmentStats.longBreaks - 2) * 5, 35, 100);
    const force = clamp(86 - segmentStats.pressureSpread * 48 - Math.abs(strokes.length - targetCount) * 2, 35, 100);
    const metrics = {
      structure: Math.round(structure),
      stroke: Math.round(stroke),
      technique: Math.round(technique),
      fluency: Math.round(fluency),
      force: Math.round(force)
    };
    const score = Math.round(
      metrics.structure * 0.26 +
      metrics.stroke * 0.24 +
      metrics.technique * 0.2 +
      metrics.fluency * 0.18 +
      metrics.force * 0.12
    );

    return {
      glyph,
      strokeCount: strokes.length,
      pointCount: allPoints.length,
      bounds: {
        minX: Number(bounds.minX.toFixed(4)),
        minY: Number(bounds.minY.toFixed(4)),
        maxX: Number(bounds.maxX.toFixed(4)),
        maxY: Number(bounds.maxY.toFixed(4))
      },
      metrics,
      score,
      scoreEvidence: buildScoreEvidence({
        glyph,
        targetCount,
        strokeCount: strokes.length,
        pointCount: allPoints.length,
        metrics,
        coverage,
        centerOffset,
        totalLength,
        segmentStats,
        bounds
      }),
      feedback: buildFeedback({ metrics, strokes, targetCount, coverage, centerOffset })
    };
  }

  function buildScoreEvidence({ glyph, targetCount, strokeCount, pointCount, metrics, coverage, centerOffset, totalLength, segmentStats, bounds }) {
    const coveragePercent = Math.round(clamp(coverage, 0, 1) * 100);
    const centerOffsetPercent = Math.round(clamp(centerOffset, 0, 1) * 100);
    const variationPercent = Math.round(clamp(segmentStats.variation || 0, 0, 3) * 100);
    const pressureSpreadPercent = Math.round(clamp(segmentStats.pressureSpread || 0, 0, 1) * 100);
    const widthPercent = bounds ? Math.round(clamp(bounds.maxX - bounds.minX, 0, 1) * 100) : 0;
    const heightPercent = bounds ? Math.round(clamp(bounds.maxY - bounds.minY, 0, 1) * 100) : 0;
    return {
      kind: "local-heuristic-v1",
      label: "基础练习评分",
      disclaimer: "该分数来自浏览器本机启发式算法，用于练习复盘，不等同于专业书法评级。",
      glyph,
      weights: {
        structure: SCORE_WEIGHTS.structure,
        stroke: SCORE_WEIGHTS.stroke,
        technique: SCORE_WEIGHTS.technique,
        fluency: SCORE_WEIGHTS.fluency,
        force: SCORE_WEIGHTS.force
      },
      evidence: {
        targetStrokeCount: targetCount,
        strokeCount,
        pointCount,
        coveragePercent,
        centerOffsetPercent,
        totalLength: Number((totalLength || 0).toFixed(3)),
        segmentVariationPercent: variationPercent,
        longBreaks: segmentStats.longBreaks || 0,
        pressureSpreadPercent,
        boundsWidthPercent: widthPercent,
        boundsHeightPercent: heightPercent
      },
      reasons: [
        {
          key: "structure",
          label: "结构",
          score: metrics.structure || 0,
          evidence: `重心偏移约 ${centerOffsetPercent}%，书写覆盖约 ${coveragePercent}%。`
        },
        {
          key: "stroke",
          label: "笔画",
          score: metrics.stroke || 0,
          evidence: `当前 ${strokeCount} 笔，目标约 ${targetCount} 笔。`
        },
        {
          key: "technique",
          label: "笔法",
          score: metrics.technique || 0,
          evidence: `笔迹总长度 ${Number((totalLength || 0).toFixed(2))}，采样点 ${pointCount} 个。`
        },
        {
          key: "fluency",
          label: "流畅",
          score: metrics.fluency || 0,
          evidence: `线段变化 ${variationPercent}%，长停顿 ${segmentStats.longBreaks || 0} 次。`
        },
        {
          key: "force",
          label: "力度",
          score: metrics.force || 0,
          evidence: `压感跨度约 ${pressureSpreadPercent}%，笔画差 ${Math.abs(strokeCount - targetCount)}。`
        }
      ]
    };
  }

  function getBounds(points) {
    return points.reduce((bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxX: Math.max(bounds.maxX, point.x),
      maxY: Math.max(bounds.maxY, point.y)
    }), { minX: 1, minY: 1, maxX: 0, maxY: 0 });
  }

  function getTotalLength(strokes) {
    return strokes.reduce((total, stroke) => {
      for (let index = 1; index < stroke.length; index += 1) {
        total += distance(stroke[index - 1], stroke[index]);
      }
      return total;
    }, 0);
  }

  function getSegmentStats(strokes) {
    const lengths = [];
    const pressures = [];
    let longBreaks = 0;

    strokes.forEach((stroke) => {
      for (let index = 1; index < stroke.length; index += 1) {
        const previous = stroke[index - 1];
        const point = stroke[index];
        lengths.push(distance(previous, point));
        pressures.push(point.p || 0.5);
        if (point.t - previous.t > 220) {
          longBreaks += 1;
        }
      }
    });

    if (!lengths.length) {
      return { variation: 1, pressureSpread: 0, longBreaks };
    }

    const averageLength = lengths.reduce((sum, value) => sum + value, 0) / lengths.length;
    const variance = lengths.reduce((sum, value) => sum + Math.abs(value - averageLength), 0) / lengths.length;
    const minPressure = Math.min(...pressures);
    const maxPressure = Math.max(...pressures);
    return {
      variation: averageLength ? variance / averageLength : 1,
      pressureSpread: maxPressure - minPressure,
      longBreaks
    };
  }

  function buildFeedback({ metrics, strokes, targetCount, coverage, centerOffset }) {
    const feedback = [];

    if (strokes.length < targetCount) {
      feedback.push(`当前 ${strokes.length} 笔，目标约 ${targetCount} 笔，可继续补全笔画。`);
    } else if (strokes.length > targetCount + 2) {
      feedback.push(`当前 ${strokes.length} 笔，笔画拆分偏多，可尝试减少断笔。`);
    } else {
      feedback.push("笔画数量接近目标，适合进入复盘。");
    }

    if (centerOffset > 0.16) {
      feedback.push("整体重心偏离格心，下一次注意居中。");
    }

    if (coverage < 0.38) {
      feedback.push("书写范围偏小，可以放开字形。");
    } else if (coverage > 0.82) {
      feedback.push("书写范围偏满，注意留出边界。");
    }

    const weakest = Object.entries(metrics).sort((a, b) => a[1] - b[1])[0];
    if (weakest) {
      feedback.push(`当前最需要加强：${metricLabel(weakest[0])}。`);
    }

    return feedback.slice(0, 4);
  }

  function metricLabel(key) {
    return {
      structure: "结构",
      stroke: "笔画",
      technique: "笔法",
      fluency: "流畅度",
      force: "力度"
    }[key] || key;
  }

  function getSnapshot() {
    if (!state.canvas || !state.ctx) return null;

    const output = document.createElement("canvas");
    output.width = 720;
    output.height = 720;
    const ctx = output.getContext("2d");
    ctx.fillStyle = "#f2e5cb";
    ctx.fillRect(0, 0, output.width, output.height);
    drawSnapshotGuides(ctx, output.width, output.height);
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = "#1a130f";
    ctx.font = "500 410px KaiTi, STKaiti, SimSun, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(state.glyph, output.width / 2, output.height / 2 + 18);
    ctx.restore();
    drawSnapshotStrokes(ctx, state.strokes, output.width, output.height);
    return output.toDataURL("image/jpeg", 0.82);
  }

  function drawSnapshotGuides(ctx, width, height) {
    ctx.save();
    ctx.strokeStyle = "rgba(125, 42, 32, 0.22)";
    ctx.lineWidth = 2;
    ctx.setLineDash([9, 10]);
    drawLine(ctx, width * 0.5, 0, width * 0.5, height);
    drawLine(ctx, 0, height * 0.5, width, height * 0.5);
    drawLine(ctx, 0, 0, width, height);
    drawLine(ctx, width, 0, 0, height);
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(125, 42, 32, 0.32)";
    ctx.strokeRect(width * 0.08, height * 0.08, width * 0.84, height * 0.84);
    ctx.restore();
  }

  function drawSnapshotStrokes(ctx, strokes, width, height) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(9, 8, 7, 0.92)";
    ctx.lineWidth = 18;
    strokes.forEach((stroke) => {
      if (!stroke || stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x * width, stroke[0].y * height);
      for (let index = 1; index < stroke.length; index += 1) {
        const previous = stroke[index - 1];
        const point = stroke[index];
        const midX = ((previous.x + point.x) / 2) * width;
        const midY = ((previous.y + point.y) / 2) * height;
        ctx.quadraticCurveTo(previous.x * width, previous.y * height, midX, midY);
      }
      const last = stroke[stroke.length - 1];
      ctx.lineTo(last.x * width, last.y * height);
      ctx.stroke();
    });
    ctx.restore();
  }

  function cloneStrokes(strokes) {
    return strokes.map((stroke) => stroke.map(normalizePoint));
  }

  function loadStrokes(strokes = []) {
    state.strokes = Array.isArray(strokes)
      ? strokes.map((stroke) => Array.isArray(stroke) ? stroke.map(normalizePoint) : []).filter((stroke) => stroke.length > 1)
      : [];
    state.currentStroke = null;
    render();
  }

  function setStatus(message) {
    if (state.statusEl) {
      state.statusEl.textContent = message;
    }
  }

  function distance(a, b) {
    return Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  window.MRPracticeCanvas = {
    init,
    setGlyph,
    clear,
    undo,
    replay,
    exportReplayVideo,
    getResult,
    analyzeStrokes,
    loadStrokes,
    hasStrokes: () => state.strokes.length > 0,
    getStrokes: () => cloneStrokes(state.strokes)
  };
})();

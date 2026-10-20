import { createFrameChunkLoader } from './treatment-frame-chunks.e9f45df59385.js';
/*
 * A bounded, scroll-driven frame renderer. It never plays video or intercepts scroll.
 *
 * createSequence({ container, config, onReady?, onError? })
 *   -> { update(progress), setPaused(paused), resize(), dispose() }
 *
 * config = {
 *   poster: '/static/treatment-motion/example/poster.webp', // SSR <img> already present
 *   desktop: { pattern: '/static/.../frame_{index}.webp', count: 67,
 *              width: 1280, height: 720, start: 1, pad: 4 },
 *   mobile: { pattern: '/static/.../small/frame_{index}.webp', count: 40,
 *             width: 768, height: 432, start: 1, pad: 4 }, // optional
 *   anchors: [0, .28, .65, 1], // frame positions at the four text-step centers, 0..1
 *   background: '#f7f7f0', cacheSize: 10, mobileBreakpoint: 760
 * };
 *
 * The SSR poster stays in the DOM. The absolutely positioned canvas is revealed only
 * after drawing a decoded image. Reduced motion, loading failures and disposal leave
 * the poster available. Generated media requires separate visual/clinical validation;
 * successful decoding does not establish that a scene is correct.
 */

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const positiveInt = (value, fallback) => Math.max(1, Math.round(finite(value, fallback)));
const abortError = () => new DOMException('Sequence request cancelled', 'AbortError');

// BEGIN CLINICAL TIMELINE
function clinicalTimelineErrors(t, count) {
  const errors = [], add = (ok, message) => { if (!ok) errors.push(message); };
  const close = (a, b) => typeof a === 'number' && Number.isFinite(a) && Math.abs(a - b) <= 1e-6;
  add(t && t.version === 1 && t.fps === 24 && t.frameCount === count, 'Clinical timeline version/fps/count mismatch');
  add(Number.isSafeInteger(count) && count >= 288 && count <= 576 && count % 8 === 0, 'Clinical timeline needs 288..576 whole frames, in eight-frame chunks');
  add(t?.playbackRate === 1 && ['interpolation','padding','loop','syntheticReverse'].every(key => t?.[key] === false), 'Clinical timeline must preserve source order without fabricated movement');
  const chapters = t?.states, transitions = t?.transitions;
  if (!Array.isArray(chapters) || chapters.length !== 4 || !Array.isArray(transitions) || transitions.length !== 3) return [...errors, 'Clinical timeline needs four states and three transitions'];
  let cursor = 0;
  transitions.forEach((clip, i) => {
    add(clip && clip.from === chapters[i]?.id && clip.to === chapters[i + 1]?.id, 'Transition state order mismatch ' + i);
    add(Number.isSafeInteger(clip?.startFrame) && clip.startFrame === cursor && Number.isSafeInteger(clip?.frameCount) && [96,144,192,288].includes(clip.frameCount) && clip.endFrameExclusive === clip.startFrame + clip.frameCount, 'Transition frame range mismatch ' + i);
    add(close(clip?.durationSeconds, clip?.frameCount / 24), 'Transition duration mismatch ' + i);
    cursor = clip?.endFrameExclusive;
  });
  add(cursor === count, 'Transitions must cover every delivered frame once');
  add(new Set(chapters.map(c => c?.id)).size === 4, 'Clinical state IDs must be unique');
  chapters.forEach((chapter, i) => {
    const expected = i === 0 ? 0 : transitions[i - 1]?.endFrameExclusive - 1;
    add(typeof chapter?.id === 'string' && chapter.id === 'state-' + (i + 1), 'Invalid clinical state ID ' + i);
    add(Number.isSafeInteger(chapter?.atFrame) && chapter.atFrame === expected, 'Clinical state must bind to the actual transition endpoint ' + i);
    add(close(chapter?.atSeconds, expected / 24), 'Clinical state timestamp mismatch ' + i);
  });
  const narrative=t?.clinicalNarrativeAnchors;
  if(!Array.isArray(narrative) || narrative.length!==4) errors.push('Four actual clinical action anchors are required');
  else narrative.forEach((anchor,i)=>{
    add(anchor?.id==='step-'+(i+1) && Number.isSafeInteger(anchor?.atFrame) && anchor.atFrame>0 && anchor.atFrame<count-1 && (!i || anchor.atFrame>narrative[i-1].atFrame), 'Clinical action anchors must be actual ordered interior frames '+i);
    add(close(anchor?.atSeconds,anchor?.atFrame/24), 'Clinical action timestamp mismatch '+i);
    add(Number.isSafeInteger(anchor?.startFrame) && Number.isSafeInteger(anchor?.endFrameExclusive) && anchor.startFrame>=0 && anchor.endFrameExclusive<=count && anchor.startFrame<=anchor.atFrame && anchor.atFrame<anchor.endFrameExclusive, 'Action must be visible within its reviewed interval '+i);
  });
  return errors;
}
function clinicalPositions(value=[.125,.375,.625,.875]) {
  if(!Array.isArray(value) || value.length!==4 || value.some((p,i)=>typeof p!=='number' || !Number.isFinite(p) || p<=0 || p>=1 || (i && p<=value[i-1]))) throw new TypeError('Clinical narrative screen positions must be four ordered interior points');
  return [...value];
}
function clinicalPhaseAt(progress,positions) {
  const points=clinicalPositions(positions);
  let phase=0;for(let i=1;i<points.length;i++) if(progress>=(points[i-1]+points[i])/2)phase=i;
  return phase;
}
function clinicalFrameAt(progress, timeline, positions) {
  const p=Math.max(0,Math.min(1,progress)), screen=[0,...clinicalPositions(positions),1];
  const frames=[0,...timeline.clinicalNarrativeAnchors.map(anchor=>anchor.atFrame),timeline.frameCount-1];
  let segment=0;while(segment<screen.length-2 && p>screen[segment+1])segment++;
  const fraction=(p-screen[segment])/(screen[segment+1]-screen[segment]);
  return Math.round(frames[segment]+(frames[segment+1]-frames[segment])*fraction);
}
function clinicalChapterBounds(timeline, chapterIndex) {
  const points = timeline.clinicalNarrativeAnchors.map(anchor => anchor.atFrame);
  return {
    start: chapterIndex === 0 ? 0 : Math.ceil((points[chapterIndex - 1] + points[chapterIndex]) / 2),
    end: chapterIndex === 3 ? timeline.frameCount - 1 : Math.ceil((points[chapterIndex] + points[chapterIndex + 1]) / 2) - 1
  };
}
// END CLINICAL TIMELINE
export { clinicalTimelineErrors, clinicalFrameAt, clinicalChapterBounds, clinicalPositions, clinicalPhaseAt };

function validateSource(source, label, maximum = 360, chunkSize = 8) {
  if (!source || typeof source.pattern !== 'string' || !source.pattern.includes('{index}')) {
    throw new TypeError(label + ' requires a frame pattern containing {index}');
  }
  if (!/^\/(?!\/)/.test(source.pattern) || /[\\\u0000-\u001f]/.test(source.pattern)) {
    throw new TypeError(label + ' frame pattern must be an absolute same-origin path');
  }
  const count = positiveInt(source.count, 1);
  const width = positiveInt(source.width, 0), height = positiveInt(source.height, 0);
  if (!Number.isInteger(Number(source.count)) || Number(source.count) < 1 || count > maximum ||
      !Number.isInteger(Number(source.width)) || !Number.isInteger(Number(source.height)) ||
      Number(source.width) < 1 || Number(source.height) < 1 || width > 4096 || height > 4096) {
    throw new TypeError(label + ' needs valid frame count and dimensions');
  }
  if (source.format !== undefined && (source.format !== 'webp-chunks-v1' || source.framesPerChunk !== chunkSize || source.chunkCount !== Math.ceil(count / chunkSize))) throw new TypeError(label + ' has invalid chunk metadata');
  return {
    ...(source.format ? { format: source.format, framesPerChunk: chunkSize, chunkCount: source.chunkCount } : {}),
    pattern: source.pattern,
    count, width, height,
    start: Math.max(0, Math.round(finite(source.start, 1))),
    pad: clamp(Math.round(finite(source.pad, 4)), 1, 8)
  };
}

function validateAnchors(value) {
  const anchors = value === undefined ? [0, 1 / 3, 2 / 3, 1] : value;
  if (!Array.isArray(anchors) || anchors.length < 2 || anchors.length > 12 ||
      anchors.some((n, i) => !Number.isFinite(n) || n < 0 || n > 1 || (i && n < anchors[i - 1]))) {
    throw new TypeError('Sequence anchors must be ordered normalized frame positions');
  }
  return [...anchors];
}

function frameURL(source, index) {
  return source.pattern.replaceAll('{index}', String(source.start + index).padStart(source.pad, '0'));
}

function releaseFrame(frame) {
  if (frame?.close) frame.close();
  else if (frame?.getContext) { frame.width = 0; frame.height = 0; }
  else if (frame?.removeAttribute) frame.removeAttribute('src');
}

export function createSequence({ container, config, renderFrame, onReady = () => {}, onError = () => {} }) {
  if (!container || typeof container.appendChild !== 'function' || !config) {
    throw new TypeError('createSequence requires a container and frame configuration');
  }
  const clinical = config.kind === 'clinical-process-sequence';
  const desktop = validateSource(config.desktop, 'desktop', clinical ? 576 : 360, clinical ? 16 : 8);
  const mobile = config.mobile ? validateSource(config.mobile, 'mobile', clinical ? 576 : 360, clinical ? 16 : 8) : desktop;
  const timeline = clinical ? config.timeline : null;
  if (clinical) {
    const errors = clinicalTimelineErrors(timeline, desktop.count);
    if (mobile.count !== desktop.count) errors.push('Clinical mobile frame count differs');
    if (config.processStages || config.motion || config.component || config.cameraPan) errors.push('Clinical timeline cannot use synthetic movement or chapter remapping');
    if (errors.length) throw new TypeError(errors.join('; '));
  }
  const anchors = validateAnchors(clinical ? timeline.states.map(chapter => chapter.atFrame / (desktop.count - 1)) : config.anchors);
  // Each chapter uses its own treatment clip. Chapter boundaries match the
  // four text steps, so brushing frames cannot appear under fixation text.
  const processStages = config.processStages;
  if (processStages !== undefined && (!Array.isArray(processStages) || processStages.length !== 4 ||
      processStages.some((stage, i) => !stage || !Number.isInteger(stage.start) || !Number.isInteger(stage.end) ||
        stage.start < 0 || stage.end < stage.start || stage.end >= Math.min(desktop.count, mobile.count) ||
        (i > 0 && stage.start <= processStages[i - 1].end)))) {
    throw new TypeError('Process stages need four ordered, non-overlapping frame ranges');
  }
  let narrativePositions=clinicalPositions();
  const clinicalPhase=()=>clinicalPhaseAt(progress,narrativePositions);
  const cameraPan = config.cameraPan === true;
  const motion = config.motion || (cameraPan ? { scales: [.78, .88, .94, 1], x: [-.6, -.2, .3, 0], y: [.15, 0, -.15, 0] } : null);
  if (motion) {
    for (const [key, min, max] of [['scales', .65, 1], ['x', -1, 1], ['y', -1, 1]]) {
      if (!Array.isArray(motion[key]) || motion[key].length !== 4 || motion[key].some(value => !Number.isFinite(value) || value < min || value > max)) {
        throw new TypeError('Sequence motion requires four bounded scales, x and y values');
      }
    }
  }
  const component = Boolean(config.component);
  if (processStages && (component || motion)) throw new TypeError('Process clips must not use synthetic component or camera movement');
  const cacheLimit = clamp(positiveInt(config.cacheSize, processStages ? 16 : 10), 4, 16);
  const breakpoint = clamp(positiveInt(config.mobileBreakpoint, 760), 320, 1200);
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: ' + breakpoint + 'px)');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Canvas rendering is unavailable');
  canvas.className = 'bd-scroll-sequence';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;pointer-events:none;opacity:0;';
  container.appendChild(canvas);

  const chunks = createFrameChunkLoader();
  const cache = new Map(); // insertion order is the decoded-frame LRU
  const requests = new Map();
  const failed = new Set();
  const failureCounts = new Map();
  let source = mobileQuery.matches ? mobile : desktop;
  let reduced = motionQuery.matches;
  let near = !('IntersectionObserver' in window), visible = near, paused = false;
  let disposed = false, epoch = 0, ready = false;
  let progress = 0, targetProgress = 0, target = 0, drawn = -1, drawnProgress = -1;
  let direction = 1, tweenFrom = 0, tweenStarted = 0, animationRAF = 0, snapshotPending = false;
  const tweenDuration = 760;
  let queue = [], resizeRAF = 0, inFlight = 0;
  let observer = null, visibilityObserver = null, resizeObserver = null;
  // One pixel snapshot bridges a filmed chapter cut; it never synthesizes anatomy.
  let transition = null, transitionRAF = 0;
  const transitionDuration = 220;

  function report(error, index) {
    try { onError(error, { index, source: source.pattern }); } catch (_) { /* The caller must not break fallback rendering. */ }
  }
  function stopTransition(release = false) {
    if (transitionRAF) cancelAnimationFrame(transitionRAF);
    transitionRAF = 0;
    if (release && transition) {
      releaseFrame(transition.image);
      transition = null;
      delete canvas.dataset.transition;
      delete canvas.dataset.transitionFromStage;
    }
  }
  function stageOf(index) {
    return processStages ? processStages.findIndex(stage => index >= stage.start && index <= stage.end) : -1;
  }
  function hideCanvas() {
    stopTransition(true);
    canvas.style.opacity = '0';
    container.classList.remove('has-sequence');
    ready = false;
    drawn = -1;
    canvas.dataset.frame = '';
    canvas.dataset.settled = 'false';
    delete canvas.dataset.processStage;
  }
  function active() { return !disposed && near && !reduced && !document.hidden; }
  function mappedFrame(p) {
    if (timeline) return clinicalFrameAt(p, timeline, narrativePositions);
    if (processStages) {
      const phase = Math.round(clamp(p) * 3);
      const lower = phase === 0 ? 0 : (phase - .5) / 3;
      const upper = phase === 3 ? 1 : (phase + .5) / 3;
      const fraction = clamp((p - lower) / (upper - lower));
      const stage = processStages[phase];
      return Math.round(stage.start + fraction * (stage.end - stage.start));
    }
    if (component) return 0;
    const segment = clamp(p) * (anchors.length - 1);
    const i = Math.min(anchors.length - 2, Math.floor(segment));
    const framePosition = anchors[i] + (anchors[i + 1] - anchors[i]) * (segment - i);
    return clamp(Math.round(framePosition * (source.count - 1)), 0, source.count - 1);
  }
  function touch(index) {
    const frame = cache.get(index);
    if (frame) { cache.delete(index); cache.set(index, frame); }
    return frame;
  }
  function remember(index, frame) {
    if (cache.has(index)) releaseFrame(cache.get(index));
    cache.delete(index);
    cache.set(index, frame);
    const preferred = new Set(preferredIndices());
    while (cache.size > cacheLimit) {
      // Keep visible/target images; evict stale positions before upcoming cuts.
      const candidates = [...cache.keys()].filter(key => key !== drawn && key !== target);
      const oldest = candidates.find(key => !preferred.has(key)) ?? candidates[0] ?? cache.keys().next().value;
      releaseFrame(cache.get(oldest));
      cache.delete(oldest);
    }
  }
  function cancelRequests() {
    epoch++;
    for (const request of requests.values()) { clearTimeout(request.timer); request.controller.abort(); }
    requests.clear();
    queue = [];
  }
  function clearCache() {
    chunks.clear();
    cache.forEach(releaseFrame);
    cache.clear();
    failed.clear();
    failureCounts.clear();
  }
  function availableFrame() {
    if (cache.has(target)) return target;
    // Show the nearest decoded position immediately. Retaining the last painted
    // frame until the exact target arrives can make a working sequence look frozen.
    let closest = -1, distance = Infinity;
    const chapter = timeline ? clinicalChapterBounds(timeline, clinicalPhase()) : processStages?.[Math.round(clamp(progress) * 3)];
    for (const index of cache.keys()) {
      if (chapter && (index < chapter.start || index > chapter.end)) continue;
      const gap = Math.abs(index - target);
      if (gap < distance) { distance = gap; closest = index; }
    }
    return closest;
  }
  function motionValue(key, fallback) {
    if (!motion) return fallback;
    const position = clamp(progress) * 3;
    const segment = Math.min(2, Math.floor(position));
    const fraction = position - segment;
    const eased = fraction * fraction * (3 - 2 * fraction);
    return motion[key][segment] + (motion[key][segment + 1] - motion[key][segment]) * eased;
  }
  function startTransition(nextStage) {
    // Capture the composited pixels too, so quick reversals never flash a stale cut.
    const image = document.createElement('canvas');
    image.width = canvas.width; image.height = canvas.height;
    const snapshot = image.getContext('2d', { alpha: false });
    if (!snapshot) { releaseFrame(image); return; }
    snapshot.drawImage(canvas, 0, 0);
    stopTransition(true);
    transition = { image, fromStage: stageOf(drawn), toStage: nextStage, started: performance.now(), elapsed: 0 };
  }
  function queueTransition() {
    if (!transition || transitionRAF || !canAnimate()) return;
    transitionRAF = requestAnimationFrame(() => {
      transitionRAF = 0;
      if (canAnimate()) draw(true);
    });
  }
  function draw(force = false) {
    if (disposed || reduced || (paused && !snapshotPending && !force) || document.hidden || !canvas.width || !canvas.height) return;
    let index = availableFrame();
    let waiting = false;
    if (index < 0 && (processStages || timeline)) {
      const stage = timeline ? clinicalChapterBounds(timeline, clinicalPhase()) : processStages[Math.round(clamp(progress) * 3)];
      const candidates = queue.filter(candidate => candidate >= stage.start && candidate <= stage.end);
      if (candidates.length && candidates.every(candidate => failed.has(candidate))) { hideCanvas(); return; }
      // Retain the last real pixels (or SSR poster on first load). A slow decode
      // must not erase the image or mark a previous chapter as the new procedure.
      stopTransition();
      canvas.dataset.waiting = 'true';
      canvas.dataset.settled = 'false';
      canvas.dataset.targetStage = String(Math.round(clamp(progress) * 3));
      waiting = true;
      // Resizing clears a canvas: repaint the retained frame at the new size.
      if (force && cache.has(drawn)) index = drawn;
      else return;
    }
    if (index < 0) return;
    canvas.dataset.waiting = String(waiting);
    if (!force && !transition && drawn === index && ready && Math.abs(drawnProgress - progress) < .0001) return;
    const frame = touch(index);
    if (!frame) return;
    const width = frame.width || frame.naturalWidth;
    const height = frame.height || frame.naturalHeight;
    if (!width || !height) return;
    const nextStage = stageOf(index);
    if (processStages && ready && drawn >= 0 && stageOf(drawn) !== nextStage && !snapshotPending && !paused && visible) {
      startTransition(nextStage);
    }
    if (snapshotPending) stopTransition(true);
    // Camera movement never crops the reviewed image or invents new anatomy.
    // Translation is expressed only within the unused contain margins.
    const cameraScale = motionValue('scales', 1);
    const scale = Math.min(canvas.width / width, canvas.height / height) * cameraScale;
    const w = width * scale, h = height * scale;
    const x = (canvas.width - w) / 2 * (1 + motionValue('x', 0));
    const y = (canvas.height - h) / 2 * (1 + motionValue('y', 0));
    context.fillStyle = config.background || '#f7f7f0';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    try {
      let rendered = false;
      if (typeof renderFrame === 'function') {
        rendered = renderFrame({ context, frame, index, progress, rect: { x, y, width: w, height: h }, canvas, source, config }) === true;
      }
      if (!rendered) context.drawImage(frame, x, y, w, h);
      if (transition) {
        if (!waiting && !paused && active() && visible) transition.elapsed = clamp((performance.now() - transition.started) / transitionDuration);
        const mix = transition.elapsed * transition.elapsed * (3 - 2 * transition.elapsed);
        if (mix < 1) {
          context.globalAlpha = 1 - mix;
          context.drawImage(transition.image, 0, 0, canvas.width, canvas.height);
          context.globalAlpha = 1;
          canvas.dataset.transition = mix.toFixed(5);
          canvas.dataset.transitionFromStage = String(transition.fromStage);
          if (!waiting) queueTransition();
        } else stopTransition(true);
      }
    } catch (error) {
      context.globalAlpha = 1;
      cache.delete(index);
      releaseFrame(frame);
      failed.add(index);
      report(error, index);
      hideCanvas();
      return;
    }
    drawn = index;
    drawnProgress = progress;
    if (index === target) snapshotPending = false;
    canvas.dataset.frame = String(index + source.start);
    if (timeline) {
      const actualChapter=timeline.clinicalNarrativeAnchors.findIndex((_,i)=>{const bounds=clinicalChapterBounds(timeline,i);return index>=bounds.start && index<=bounds.end;});
      canvas.dataset.processState = timeline.clinicalNarrativeAnchors[actualChapter].id;
      canvas.dataset.targetProcessState = timeline.clinicalNarrativeAnchors[clinicalPhase()].id;
      canvas.dataset.sourceTimestamp = (index / timeline.fps).toFixed(6);
    }
    if (processStages) {
      canvas.dataset.processStage = String(nextStage);
      canvas.dataset.targetStage = String(Math.round(clamp(progress) * 3));
    }
    canvas.dataset.progress = progress.toFixed(5);
    canvas.dataset.targetProgress = targetProgress.toFixed(5);
    canvas.dataset.scale = cameraScale.toFixed(5);
    canvas.dataset.x = x.toFixed(2);
    canvas.dataset.y = y.toFixed(2);
    canvas.dataset.settled = String(!waiting && !transition && index === target && Math.abs(progress - targetProgress) < .0001);
    if (!ready) {
      ready = true;
      container.classList.add('has-sequence');
      canvas.style.opacity = '1';
      try { onReady({ frame: index, width, height }); } catch (_) { /* Keep the visual usable. */ }
    }
  }
  function resize() {
    if (disposed) return;
    const rect = container.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const dpr = Math.min(window.devicePixelRatio || 1, mobileQuery.matches ? 1.5 : 2);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    if (cache.size && !reduced && !document.hidden) draw(true);
    else hideCanvas();
  }
  function preferredIndices() {
    if (component) return [0];
    const wanted = [target];
    const add = index => {
      if (index >= 0 && index < source.count && !wanted.includes(index) && wanted.length < cacheLimit) wanted.push(index);
    };
    if (source.format === 'webp-chunks-v1') {
      for (let distance = 1; wanted.length < cacheLimit && distance < cacheLimit; distance++) { add(target + direction * distance); add(target - direction * distance); }
      return wanted;
    }
    if (processStages) {
      // Decode the first visible frame before speculative requests. Thereafter
      // reserve cache slots for both sides of a cut, even during reverse scroll.
      if (!ready) return wanted;
      const phase = Math.round(clamp(progress) * 3), stage = processStages[phase];
      const next = processStages[phase + direction], previous = processStages[phase - direction];
      if (next) add(direction > 0 ? next.start : next.end);
      if (previous) add(direction > 0 ? previous.end : previous.start);
      // After the two immediate neighboring cuts, spend bandwidth on local
      // movement. Far ends of other clips must not starve the frames being read.
      const addNearby = distance => {
        for (const index of [target + direction * distance, target - direction * distance]) {
          if (index >= stage.start && index <= stage.end) add(index);
        }
      };
      for (let distance = 1; distance <= 3; distance++) addNearby(distance);
      add(direction > 0 ? stage.end : stage.start);
      add(direction > 0 ? stage.start : stage.end);
      if (next) add(direction > 0 ? next.end : next.start);
      if (previous) add(direction > 0 ? previous.start : previous.end);
      for (let distance = 4; wanted.length < cacheLimit && distance < cacheLimit; distance++) addNearby(distance);
      return wanted;
    }
    for (let distance = 1; distance <= 4; distance++) add(target + direction * distance);
    for (let distance = 1; distance <= 2; distance++) add(target - direction * distance);
    anchors.map(value => Math.round(value * (source.count - 1))).sort((a, b) => Math.abs(a - target) - Math.abs(b - target)).forEach(add);
    for (let distance = 5; wanted.length < cacheLimit && distance < cacheLimit; distance++) { add(target + direction * distance); add(target - direction * distance); }
    return wanted;
  }
  function schedule() {
    if (!active()) return;
    target = mappedFrame(progress);
    queue = preferredIndices();
    // Keep the two bounded in-flight requests alive during scrolling. Repeatedly
    // aborting them on every new target prevents slow connections ever decoding.
    draw();
    pump();
  }
  function stopAnimation() {
    if (animationRAF) cancelAnimationFrame(animationRAF);
    animationRAF = 0;
  }
  function canAnimate() { return active() && visible && !paused; }
  function animate(now) {
    animationRAF = 0;
    if (!canAnimate()) return;
    const elapsed = clamp((now - tweenStarted) / tweenDuration);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    progress = tweenFrom + (targetProgress - tweenFrom) * eased;
    if (elapsed === 1 || Math.abs(progress - targetProgress) < .0001) progress = targetProgress;
    schedule();
    if (progress !== targetProgress) animationRAF = requestAnimationFrame(animate);
  }
  function resumeAnimation() {
    if (!canAnimate()) return;
    tweenFrom = progress;
    tweenStarted = performance.now();
    if (Math.abs(progress - targetProgress) < .0001) { progress = targetProgress; schedule(); }
    else if (!animationRAF) animationRAF = requestAnimationFrame(animate);
  }
  function setPaused(value) {
    paused = Boolean(value);
    snapshotPending = false;
    if (paused) { stopAnimation(); stopTransition(); }
    else {
      if (transition) transition.started = performance.now() - transition.elapsed * transitionDuration;
      resumeAnimation(); queueTransition();
    }
  }
  async function decode(blob, signal, requestSource, isMobile) {
    if (signal.aborted) throw abortError();
    const maxWidth = Math.min(requestSource.width, isMobile ? 768 : 1024);
    const maxHeight = Math.max(1, Math.round(maxWidth * requestSource.height / requestSource.width));
    if (typeof createImageBitmap === 'function') {
      const frame = await createImageBitmap(blob, { resizeWidth: maxWidth, resizeHeight: maxHeight, resizeQuality: 'high' });
      if (signal.aborted) { releaseFrame(frame); throw abortError(); }
      return frame;
    }
    // HTMLImageElement fallback is used only where bitmap decoding is unavailable.
    // Its intrinsic dimensions are checked before it enters the bounded cache.
    const objectURL = URL.createObjectURL(blob);
    try {
      const frame = await new Promise((resolve, reject) => {
        const img = new Image();
        let settled = false;
        const finish = (error) => {
          if (settled) return;
          settled = true;
          img.onload = img.onerror = null;
          signal.removeEventListener('abort', abort);
          if (error) { img.removeAttribute('src'); reject(error); }
          else resolve(img);
        };
        const abort = () => finish(abortError());
        img.decoding = 'async';
        img.onload = () => {
          if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth > requestSource.width || img.naturalHeight > requestSource.height) {
            finish(new Error('Frame dimensions exceed the declared sequence size'));
          } else finish();
        };
        img.onerror = () => finish(new Error('Frame image could not be decoded'));
        signal.addEventListener('abort', abort, { once: true });
        if (signal.aborted) { abort(); return; }
        img.src = objectURL;
      });
      if (signal.aborted) { releaseFrame(frame); throw abortError(); }
      const scaled = document.createElement('canvas');
      scaled.width = maxWidth; scaled.height = maxHeight;
      try {
        const ctx = scaled.getContext('2d');
        if (!ctx) throw new Error('Canvas decoding is unavailable');
        ctx.drawImage(frame, 0, 0, maxWidth, maxHeight);
      } catch (error) { releaseFrame(scaled); throw error; }
      finally { releaseFrame(frame); }
      return scaled;
    } finally { URL.revokeObjectURL(objectURL); }
  }
  function pump() {
    if (!active()) return;
    while (inFlight < 2) {
      const index = queue.find(value => !cache.has(value) && !requests.has(value) && !failed.has(value));
      if (index === undefined) return;
      const controller = new AbortController();
      const generation = epoch, requestSource = source, isMobile = mobileQuery.matches;
      const request = { controller, generation, timedOut: false, timer: 0 };
      request.timer = setTimeout(() => { request.timedOut = true; controller.abort(); }, 15000);
      requests.set(index, request);
      inFlight++;
      (async () => {
        try {
          let blob;
          if (requestSource.format === 'webp-chunks-v1') {
            blob = await chunks.getFrame(requestSource, index, { signal: controller.signal });
          } else {
            const response = await fetch(frameURL(requestSource, index), {
              signal: controller.signal, cache: 'force-cache', credentials: 'same-origin'
            });
            if (!response.ok) throw new Error('Frame request returned HTTP ' + response.status);
            blob = await response.blob();
          }
          if (!blob.size || blob.size > 2 * 1024 * 1024 || (blob.type && !blob.type.startsWith('image/'))) {
            throw new Error('Invalid or unexpectedly large frame response');
          }
          const frame = await decode(blob, controller.signal, requestSource, isMobile);
          if (disposed || generation !== epoch || controller.signal.aborted || !active()) { releaseFrame(frame); return; }
          remember(index, frame);
          draw();
        } catch (error) {
          if (!disposed && generation === epoch && (error?.name !== 'AbortError' || request.timedOut)) {
            const attempts = (failureCounts.get(index) || 0) + 1;
            failureCounts.set(index, attempts);
            // Retry transient process-frame failures once, then show the poster
            // instead of permanently covering it with an empty canvas.
            if ((!processStages && requestSource.format !== 'webp-chunks-v1') || attempts >= 2) failed.add(index);
            report(request.timedOut ? new Error('Frame request timed out') : error, index);
          }
        } finally {
          clearTimeout(request.timer);
          inFlight--;
          if (requests.get(index) === request) requests.delete(index);
          if (!disposed) {
            if (processStages) { queue = preferredIndices(); draw(); }
            pump();
          }
        }
      })();
    }
  }
  function update(value, { instant = false, narrativePositions: nextPositions } = {}) {
    if (disposed) return;
    let layoutChanged=false;
    if(timeline && nextPositions!==undefined){const checked=clinicalPositions(nextPositions);layoutChanged=checked.some((p,i)=>Math.abs(p-narrativePositions[i])>.00001);narrativePositions=checked;}
    const next = clamp(finite(value, 0));
    if (!instant && !layoutChanged && Math.abs(next - targetProgress) < .0001) { if (!ready && !paused && !reduced) schedule(); return; }
    direction = next >= targetProgress ? 1 : -1;
    const chapterChanged = processStages && Math.round(next * 3) !== Math.round(progress * 3);
    targetProgress = next;
    canvas.dataset.targetProgress = targetProgress.toFixed(5);
    if (instant || layoutChanged || (chapterChanged && !paused)) {
      // A deliberate step selection remains usable while paused. This is one
      // static frame change, not a resumed animation or a new RAF loop.
      stopAnimation();
      progress = targetProgress;
      snapshotPending = paused;
      schedule();
    } else if (canAnimate()) resumeAnimation();
    else if (!paused && !reduced && !visible) {
      // No animation loop runs outside the viewport. Render that position when it
      // returns, instead of replaying a long journey made while off-screen.
      progress = targetProgress;
      schedule();
    }
  }
  function motionChanged() {
    if (disposed) return;
    reduced = motionQuery.matches;
    stopAnimation(); stopTransition(true); cancelRequests();
    if (reduced) { clearCache(); hideCanvas(); }
    else { resize(); schedule(); resumeAnimation(); }
  }
  function viewportChanged() {
    if (disposed) return;
    const next = mobileQuery.matches ? mobile : desktop;
    if (next !== source) {
      cancelRequests(); clearCache(); hideCanvas(); source = next;
    }
    resize(); schedule();
  }
  function visibilityChanged() {
    if (document.hidden) { stopAnimation(); stopTransition(); cancelRequests(); }
    else { resize(); schedule(); resumeAnimation(); }
  }
  function queueResize() {
    if (disposed || resizeRAF) return;
    resizeRAF = requestAnimationFrame(() => { resizeRAF = 0; resize(); });
  }
  function listen(query, callback, remove = false) {
    if (query.addEventListener) query[remove ? 'removeEventListener' : 'addEventListener']('change', callback);
    else query[remove ? 'removeListener' : 'addListener'](callback);
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    stopAnimation(); stopTransition(true); cancelRequests(); clearCache(); chunks.dispose();
    observer?.disconnect(); visibilityObserver?.disconnect(); resizeObserver?.disconnect();
    listen(motionQuery, motionChanged, true); listen(mobileQuery, viewportChanged, true);
    document.removeEventListener('visibilitychange', visibilityChanged);
    window.removeEventListener('resize', queueResize);
    if (resizeRAF) cancelAnimationFrame(resizeRAF);
    canvas.remove();
    container.classList.remove('has-sequence');
  }

  listen(motionQuery, motionChanged);
  listen(mobileQuery, viewportChanged);
  document.addEventListener('visibilitychange', visibilityChanged);
  window.addEventListener('resize', queueResize, { passive: true });
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      if (disposed) return;
      near = entries.some(entry => entry.target === container && entry.isIntersecting);
      if (near) { resize(); schedule(); resumeAnimation(); }
      else { stopAnimation(); stopTransition(); cancelRequests(); }
    }, { rootMargin: '300px 0px' });
    observer.observe(container);
    visibilityObserver = new IntersectionObserver(entries => {
      if (disposed) return;
      visible = entries.some(entry => entry.target === container && entry.isIntersecting);
      if (visible) resumeAnimation();
      else { stopAnimation(); stopTransition(); }
    }, { rootMargin: '0px' });
    visibilityObserver.observe(container);
  }
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(queueResize);
    resizeObserver.observe(container);
  }
  resize(); schedule();
  return { update, setPaused, resize, dispose };
}

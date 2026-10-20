'use strict';
// Keep the marked pure functions identical to the browser copy. Tests enforce parity.
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
module.exports = { clinicalTimelineErrors, clinicalFrameAt, clinicalChapterBounds, clinicalPositions, clinicalPhaseAt };

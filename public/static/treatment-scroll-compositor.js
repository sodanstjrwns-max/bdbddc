/* Animate a rigid part of an existing illustration without morphing its anatomy.
 * The original separation is the lowest position: this is an exploded view,
 * not a simulation of fitting a prosthesis or a clinical treatment result. */
const clamp = v => Math.max(0, Math.min(1, v));
const smooth = v => v * v * (3 - 2 * v);
function polygon(ctx, points, rect, dy = 0) {
  points.forEach(([x,y], i) => {
    const px = rect.x + x * rect.width, py = rect.y + (y + dy) * rect.height;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.closePath();
}
export function drawTreatmentFrame({context:ctx, frame, progress, rect, config, canvas}) {
  const part = config.component;
  if (!part || part.type !== 'rigid-lift') return false;
  const points = part.polygon, offsets = part.offsets;
  if (!Array.isArray(points) || points.length < 3 || points.some(p => !Array.isArray(p) || p.length !== 2 || p.some(n=>!Number.isFinite(n)||n<0||n>1)) ||
      !Array.isArray(offsets) || offsets.length !== 4 || offsets.some(n=>!Number.isFinite(n)||n < -.1||n>0)) return false;
  const q=clamp(progress)*3, i=Math.min(2,Math.floor(q));
  const dy=offsets[i]+(offsets[i+1]-offsets[i])*smooth(q-i);
  // Fill only the previously occupied area with the illustration's neutral
  // backdrop; the jaw and supports are painted once at their original positions.
  ctx.save();
  ctx.beginPath();polygon(ctx,points,rect);ctx.clip();
  const g=ctx.createLinearGradient(rect.x,rect.y,rect.x+rect.width,rect.y+rect.height);
  g.addColorStop(0,part.background?.[0] || '#f0ece1');g.addColorStop(1,part.background?.[1] || '#eee9dd');
  ctx.fillStyle=g;ctx.fillRect(rect.x,rect.y,rect.width,rect.height);ctx.restore();
  ctx.save();ctx.beginPath();ctx.rect(rect.x,rect.y,rect.width,rect.height);polygon(ctx,points,rect);ctx.clip('evenodd');
  ctx.drawImage(frame,rect.x,rect.y,rect.width,rect.height);ctx.restore();
  ctx.save();ctx.beginPath();polygon(ctx,points,rect,dy);ctx.clip();
  ctx.drawImage(frame,rect.x,rect.y+dy*rect.height,rect.width,rect.height);ctx.restore();
  canvas.dataset.componentOffset=dy.toFixed(5);
  return true;
}

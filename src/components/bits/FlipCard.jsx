import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import './FlipCard.css';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const snap = (degrees) => Math.round(degrees / 180) * 180;
const isBack = (degrees) => Math.abs(Math.round(degrees / 180)) % 2 === 1;

export default function FlipCard({
  front = null, back = null, flipped, defaultFlipped = false, onFlipChange,
  axis = 'y', flipOnClick = true, draggable = true, dragDistance = 0,
  tilt = true, tiltMax = 12, glare = true, glareOpacity = 0.22,
  hoverScale = 1.03, perspective = 1100, stiffness = 170, damping = 20,
  width = 300, height = 400, radius = 22, background = '#27272a',
  color = '#f5f5f5', shadow = true, shadowColor = '#000000',
  shadowOpacity = 0.45, disabled = false, ariaLabel = 'Flip card', className = ''
}) {
  const reduce = useReducedMotion();
  const controlled = flipped !== undefined;
  const [inner, setInner] = useState(defaultFlipped);
  const [dragging, setDragging] = useState(false);
  const shown = controlled ? flipped : inner;
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const rootRef = useRef(null);
  const grip = useRef(null);
  const spin = useRef(null);
  const target = useRef(shown ? 180 : 0);
  const turn = useMotionValue(shown ? 180 : 0);
  const tiltX = useSpring(0, { stiffness: 240, damping: 24, mass: 0.6 });
  const tiltY = useSpring(0, { stiffness: 240, damping: 24, mass: 0.6 });
  const lift = useSpring(1, { stiffness: 320, damping: 26 });
  const sheen = useSpring(0, { stiffness: 320, damping: 26 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const sumX = useTransform([turn, tiltX], ([t, x]) => t + x);
  const sumY = useTransform([turn, tiltY], ([t, y]) => t + y);
  const turnY = useMotionTemplate`perspective(${perspective}px) scale(${lift}) rotateX(${tiltX}deg) rotateY(${sumY}deg)`;
  const turnX = useMotionTemplate`perspective(${perspective}px) scale(${lift}) rotateY(${tiltY}deg) rotateX(${sumX}deg)`;
  const facing = useTransform(turn, (value) => Math.abs(Math.cos((value * Math.PI) / 180)));
  const spread = useTransform(facing, (value) => 0.08 + 0.92 * value);
  const shade = useTransform(facing, (value) => 0.1 + 0.9 * value * value);
  const gxPct = useMotionTemplate`${gx}%`;
  const gyPct = useMotionTemplate`${gy}%`;

  const settle = (to, velocity = 0, instant = false) => {
    spin.current?.stop();
    target.current = to;
    if (instant || reduce) turn.jump(to);
    else spin.current = animate(turn, to, { type: 'spring', stiffness, damping, velocity, restDelta: 0.05 });
    const next = isBack(to);
    if (next === shownRef.current) return;
    shownRef.current = next;
    if (!controlled) setInner(next);
    onFlipChange?.(next);
  };
  const flip = (instant = false) => {
    const base = snap(turn.get());
    settle(isBack(base) ? base - 180 : base + 180, 0, instant);
  };
  const rest = () => { tiltX.set(0); tiltY.set(0); sheen.set(0); lift.set(1); };

  useEffect(() => {
    if (!controlled || isBack(target.current) === flipped) return;
    const base = target.current;
    spin.current?.stop();
    target.current = isBack(base) ? base - 180 : base + 180;
    if (reduce) turn.jump(target.current);
    else spin.current = animate(turn, target.current, { type: 'spring', stiffness, damping, restDelta: 0.05 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);
  useEffect(() => () => spin.current?.stop(), []);
  useEffect(() => { if (disabled) rest(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [disabled]);

  const onPointerDown = (event) => {
    if (disabled || event.button !== 0 || grip.current) return;
    spin.current?.stop();
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* unsupported pointer capture */ }
    grip.current = { id: event.pointerId, x: event.clientX, y: event.clientY, base: turn.get(), moved: false, hist: [] };
    if (!reduce && draggable) {
      lift.set(hoverScale);
    }
  };
  const onPointerMove = (event) => {
    const current = grip.current;
    if (current && current.id === event.pointerId) {
      const delta = axis === 'x' ? event.clientY - current.y : event.clientX - current.x;
      if (!current.moved) {
        if (Math.abs(delta) < (event.pointerType === 'touch' ? 8 : 4) || !draggable || reduce) return;
        current.moved = true;
        setDragging(true);
        tiltX.set(0); tiltY.set(0); sheen.set(0);
      }
      const span = dragDistance > 0 ? dragDistance : axis === 'x' ? height : width;
      turn.set(current.base + (axis === 'x' ? -1 : 1) * (delta / span) * 180);
      current.hist.push({ t: performance.now(), v: turn.get() });
      while (current.hist.length > 2 && performance.now() - current.hist[0].t > 90) current.hist.shift();
      return;
    }
    if (!tilt || reduce || disabled || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const py = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    tiltX.set((0.5 - py) * 2 * tiltMax); tiltY.set((px - 0.5) * 2 * tiltMax);
    gx.set(px * 100); gy.set(py * 100); sheen.set(1);
  };
  const release = (event, cancelled = false) => {
    const current = grip.current;
    if (!current || current.id !== event.pointerId) return;
    grip.current = null;
    try { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* pointer capture already released */ }
    setDragging(false);
    if (event.pointerType === 'touch' || !rootRef.current?.matches(':hover')) rest();
    if (!current.moved) { if (!cancelled && flipOnClick) flip(); return; }
    const here = turn.get();
    const first = current.hist[0];
    const last = current.hist[current.hist.length - 1];
    const velocity = !cancelled && first && last && last.t > first.t && performance.now() - last.t < 60
      ? ((last.v - first.v) / (last.t - first.t)) * 1000 : 0;
    const to = cancelled ? snap(current.base) : clamp(snap(here + velocity * 0.16), snap(here) - 180, snap(here) + 180);
    settle(to, velocity);
  };
  const onKeyDown = (event) => {
    if (disabled || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    if (!event.repeat) flip(true);
  };

  return (
    <div
      ref={rootRef} role="button" tabIndex={disabled ? -1 : 0} aria-pressed={shown}
      aria-label={ariaLabel} aria-disabled={disabled || undefined}
      className={`flip-card${className ? ` ${className}` : ''}`} data-axis={axis}
      data-draggable={draggable && !disabled && !reduce ? '' : undefined}
      data-dragging={dragging ? '' : undefined} data-disabled={disabled ? '' : undefined}
      data-fade={reduce ? (shown ? 'back' : 'front') : undefined}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={(event) => release(event)} onPointerCancel={(event) => release(event, true)}
      onLostPointerCapture={(event) => release(event, true)}
      onPointerEnter={(event) => { if (!reduce && !disabled && event.pointerType !== 'touch') lift.set(hoverScale); }}
      onPointerLeave={() => { if (!grip.current) rest(); }} onKeyDown={onKeyDown}
      onClick={(event) => { if (!disabled && event.detail === 0) flip(true); }}
      onDragStart={(event) => event.preventDefault()}
      style={{ '--fc-w': `${width}px`, '--fc-h': `${height}px`, '--fc-radius': `${radius}px`, '--fc-bg': background, '--fc-ink': color, '--fc-shadow': shadowColor, '--fc-shadow-o': shadowOpacity, '--fc-glare': glareOpacity }}
    >
      {shadow && <motion.span className="flip-card__shadow" aria-hidden="true" style={axis === 'x' ? { scaleY: spread, opacity: shade } : { scaleX: spread, opacity: shade }} />}
      <motion.div className="flip-card__rotor" style={reduce ? undefined : { transform: axis === 'x' ? turnX : turnY, '--fc-gx': gxPct, '--fc-gy': gyPct, '--fc-sheen': sheen }}>
        <div className="flip-card__face flip-card__face--front" aria-hidden={shown} inert={shown}>{front}{glare && <span className="flip-card__glare" aria-hidden="true" />}</div>
        <div className="flip-card__face flip-card__face--back" aria-hidden={!shown} inert={!shown}>{back}{glare && <span className="flip-card__glare" aria-hidden="true" />}</div>
      </motion.div>
    </div>
  );
}

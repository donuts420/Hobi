import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import './DepthCarousel.css';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const normalizeItem = item => typeof item === 'string' ? { image: item, alt: '' } : item;

export default function DepthCarousel({
  items = [],
  cardWidth = 300,
  cardHeight = 380,
  radius = 18,
  tint = '#181210',
  depth = 220,
  spread = 90,
  tilt = 22,
  tiltDirection = 'right',
  perspective = 1400,
  visibleCards = 4,
  falloff = 0.2,
  blur = 6,
  duration = 700,
  ease = 'power3.out',
  autoplay = false,
  autoplayDelay = 3200,
  loop = true,
  showControls = true,
  showIndicators = true,
  onChange,
  className = '',
}) {
  const data = useMemo(() => (Array.isArray(items) ? items : []).map(normalizeItem), [items]);
  const count = data.length;
  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const overlayRefs = useRef([]);
  const posRef = useRef(0);
  const focusRef = useRef(0);
  const tweenRef = useRef(null);
  const scaleRef = useRef(1);
  const cfgRef = useRef({});
  const onChangeRef = useRef(onChange);
  const autoTimerRef = useRef(null);
  const reducedRef = useRef(false);
  const [active, setActive] = useState(0);

  onChangeRef.current = onChange;
  cfgRef.current = { count, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, duration, ease, loop, cardWidth, autoplayDelay };

  const layout = useCallback(position => {
    const cfg = cfgRef.current;
    const n = cfg.count;
    if (!n) return;
    const direction = cfg.tiltDirection === 'left' ? -1 : 1;
    for (let i = 0; i < n; i++) {
      const card = cardRefs.current[i];
      if (!card) continue;
      let distance = i - position;
      if (cfg.loop && n > 1) {
        distance = ((distance % n) + n) % n;
        if (distance > n / 2) distance -= n;
      }
      const back = Math.max(0, distance);
      const shown = Math.abs(distance) <= cfg.visibleCards + 0.5;
      const x = direction * cfg.spread * distance;
      const z = -cfg.depth * distance;
      const rotateY = direction * cfg.tilt * clamp(distance, 0, 1);
      const opacity = shown ? (distance < 0 ? Math.max(0, 1 + distance) : 1) : 0;
      const brightness = Math.max(0.15, 1 - back * cfg.falloff);
      const blurPx = cfg.blur > 0 ? Math.min(cfg.blur, (back / Math.max(1, cfg.visibleCards)) * cfg.blur) : 0;
      card.style.transform = `translate(-50%, -50%) scale(${scaleRef.current}) translateX(${x.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateY(${rotateY.toFixed(3)}deg)`;
      card.style.opacity = opacity.toFixed(3);
      card.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
      card.style.zIndex = String(Math.round(2000 - distance * 20));
      card.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';
      if (overlayRefs.current[i]) overlayRefs.current[i].style.opacity = clamp(back * cfg.falloff * 1.25, 0, 0.86).toFixed(3);
    }
  }, []);

  const notify = useCallback(index => {
    setActive(index);
    onChangeRef.current?.(index, data[index]);
  }, [data]);

  const tweenTo = useCallback((target, shouldAnimate) => {
    tweenRef.current?.kill();
    const cfg = cfgRef.current;
    const proxy = { position: posRef.current };
    tweenRef.current = gsap.to(proxy, {
      position: target,
      duration: shouldAnimate && !reducedRef.current ? cfg.duration / 1000 : 0,
      ease: cfg.ease,
      onUpdate: () => { posRef.current = proxy.position; layout(proxy.position); },
      onComplete: () => {
        if (cfg.count > 0) posRef.current = ((posRef.current % cfg.count) + cfg.count) % cfg.count;
        layout(posRef.current);
      },
    });
  }, [layout]);

  const setFocus = useCallback((rawIndex, shouldAnimate = true) => {
    const cfg = cfgRef.current;
    const n = cfg.count;
    if (!n) return;
    const index = cfg.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1);
    let delta = index - posRef.current;
    if (cfg.loop && n > 1) { delta = ((delta % n) + n) % n; if (delta > n / 2) delta -= n; }
    tweenTo(posRef.current + delta, shouldAnimate);
    if (index !== focusRef.current) { focusRef.current = index; notify(index); }
  }, [tweenTo, notify]);
  const navigateBy = useCallback(step => setFocus(focusRef.current + step), [setFocus]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(([entry]) => {
      const needed = cfgRef.current.cardWidth + Math.abs(cfgRef.current.spread) * 2 + 48;
      scaleRef.current = clamp(entry.contentRect.width / needed, 0.4, 1);
      layout(posRef.current);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [layout]);

  const onKeyDown = useCallback(event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); navigateBy(-1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); navigateBy(1); }
  }, [navigateBy]);
  const onCardClick = useCallback(index => setFocus(index), [setFocus]);

  useEffect(() => {
    reducedRef.current = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!autoplay || reducedRef.current || count < 2) return;
    const root = rootRef.current;
    let hovered = false;
    let focused = false;
    const stop = () => { clearInterval(autoTimerRef.current); autoTimerRef.current = null; };
    const start = () => { stop(); autoTimerRef.current = window.setInterval(() => { if (!hovered && !focused) navigateBy(1); }, Math.max(cfgRef.current.autoplayDelay, 600)); };
    const enter = () => { hovered = true; };
    const leave = () => { hovered = false; };
    const focusIn = () => { focused = true; };
    const focusOut = () => { focused = false; };
    root?.addEventListener('mouseenter', enter);
    root?.addEventListener('mouseleave', leave);
    root?.addEventListener('focusin', focusIn);
    root?.addEventListener('focusout', focusOut);
    start();
    return () => { stop(); root?.removeEventListener('mouseenter', enter); root?.removeEventListener('mouseleave', leave); root?.removeEventListener('focusin', focusIn); root?.removeEventListener('focusout', focusOut); };
  }, [autoplay, autoplayDelay, count, navigateBy]);

  useEffect(() => { layout(posRef.current); }, [layout, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, cardWidth, cardHeight, radius, count]);
  useEffect(() => () => { tweenRef.current?.kill(); clearInterval(autoTimerRef.current); }, []);

  return (
    <div
      ref={rootRef}
      className={`depth-carousel ${className}`.trim()}
      style={{ '--dc-perspective': `${perspective}px` }}
      role="group"
      aria-roledescription="carousel"
      aria-label="Events"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="depth-carousel__stage">
        {data.map((item, i) => (
          <div
            key={i}
            className="depth-carousel__card"
            ref={el => { cardRefs.current[i] = el; }}
            style={{ width: cardWidth, height: cardHeight, borderRadius: radius }}
            aria-roledescription="slide"
            aria-label={`${item.alt || `Event ${i + 1}`} (${i + 1} of ${count})`}
            aria-hidden={active !== i}
            onClick={() => onCardClick(i)}
          >
            <img className="depth-carousel__img" src={item.image} alt={item.alt || ''} draggable="false" />
            <span className="depth-carousel__tint" ref={el => { overlayRefs.current[i] = el; }} style={{ background: tint }} />
          </div>
        ))}
      </div>
      {showControls && count > 1 && (
        <>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--prev"
            aria-label="Previous event"
            onClick={() => navigateBy(-1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--next"
            aria-label="Next event"
            onClick={() => navigateBy(1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
      {showIndicators && count > 1 && (
        <div className="depth-carousel__dots" role="tablist" aria-label="Events">
          {data.map((item, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Show ${item.alt || `event ${i + 1}`}`}
              className={`depth-carousel__dot${active === i ? ' is-active' : ''}`}
              onClick={() => setFocus(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

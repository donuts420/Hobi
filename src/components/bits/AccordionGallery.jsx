import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './AccordionGallery.css';

const AccordionGallery = ({
  items = [], defaultIndex = 2, accentColor = '#FFF1A6', overlayColor = '#181210',
  textColor = '#FAF0D7', height = 460, gap = 10, radius = 16, expandRatio = 0.52,
  orientation = 'horizontal', duration = 0.6, ease = 'power3.out', parallax = 0.5,
  tilt = 8, stagger = 0.06, trigger = 'hover', showLabels = true, grayscale = true,
  className = '',
}) => {
  const rootRef = useRef(null);
  const panelRefs = useRef([]);
  const mediaRefs = useRef([]);
  const barRefs = useRef([]);
  const textRefs = useRef([]);
  const tlRef = useRef(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);
  const vertical = orientation === 'vertical';
  const count = items.length;
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), Math.max(count - 1, 0)));
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const applyLayout = useCallback(animateLayout => {
    const panels = panelRefs.current;
    if (!panels.length) return;
    const ratio = Math.min(Math.max(expandRatio, 0.2), 0.9);
    const grow = count > 1 ? (ratio * (count - 1)) / (1 - ratio) : 1;
    tlRef.current?.kill();
    const dur = animateLayout && !prefersReduced ? duration : 0;
    const tl = gsap.timeline();
    panels.forEach((panel, i) => {
      if (!panel) return;
      const isActive = i === active;
      const media = mediaRefs.current[i];
      const bar = barRefs.current[i];
      const text = textRefs.current[i];
      const rotation = isActive ? 0 : i < active ? tilt : -tilt;
      tl.to(panel, { flexGrow: isActive ? grow : 1, ...(vertical ? { rotateX: -rotation } : { rotateY: rotation }), duration: dur, ease }, 0);
      if (media) {
        const shift = Math.max(-1.5, Math.min(1.5, active - i)) * parallax * mediaSizeRef.current * 0.06;
        tl.to(media, {
          xPercent: -50, yPercent: -50, x: vertical || isActive ? 0 : shift,
          y: vertical && !isActive ? shift : 0, '--ag-gray': grayscale && !isActive ? 1 : 0,
          '--ag-dim': isActive ? 0 : 0.35, duration: dur, ease,
        }, 0);
      }
      if (showLabels && bar && text) {
        if (isActive) tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0);
        else tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
      }
    });
    tlRef.current = tl;
  }, [active, count, expandRatio, duration, ease, vertical, tilt, parallax, grayscale, showLabels, stagger, prefersReduced]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = vertical ? rect.height : rect.width;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
      mediaSizeRef.current = size;
      el.style.setProperty('--ag-media-size', `${size}px`);
      applyLayout(!firstRunRef.current);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [applyLayout, gap, count, expandRatio, vertical]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);
  useEffect(() => () => tlRef.current?.kill(), []);

  const handleKeyDown = (index, event) => {
    if (!count) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); setActive((index + 1) % count); }
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); setActive((index - 1 + count) % count); }
  };

  return <div ref={rootRef} className={`accordion-gallery${vertical ? ' accordion-gallery--vertical' : ''}${className ? ` ${className}` : ''}`} style={{
    '--ag-accent': accentColor, '--ag-overlay': overlayColor, '--ag-text': textColor,
    '--ag-gap': `${gap}px`, '--ag-radius': `${radius}px`,
    height: vertical ? `${Math.round(height * 1.6)}px` : `${height}px`,
  }} role="list" aria-label="Featured events">
    {items.map((item, i) => {
      const isActive = i === active;
      const Tag = item.link ? 'a' : 'div';
      return <Tag key={item.id || i} ref={el => { panelRefs.current[i] = el; }} className={`ag-panel${isActive ? ' ag-panel--active' : ''}`} style={{ borderRadius: `${radius}px` }} href={item.link || undefined} onClick={event => {
        if (i !== active) { event.preventDefault(); setActive(i); }
      }} onMouseEnter={() => { if (trigger === 'hover') setActive(i); }} onFocus={() => setActive(i)} onKeyDown={event => handleKeyDown(i, event)} role="listitem" tabIndex={0} aria-current={isActive ? 'true' : undefined} aria-label={item.label}>
        <span className="ag-panel__frame"><span className="ag-panel__media" ref={el => { mediaRefs.current[i] = el; }}><img src={item.image} alt={item.alt || item.label || ''} draggable="false" /></span><span className="ag-panel__overlay" aria-hidden="true" /></span>
        {showLabels && <span className="ag-panel__label" aria-hidden="true"><span className="ag-panel__bar" ref={el => { barRefs.current[i] = el; }} /><span className="ag-panel__text" ref={el => { textRefs.current[i] = el; }}>{item.label}</span></span>}
      </Tag>;
    })}
  </div>;
};

export default AccordionGallery;

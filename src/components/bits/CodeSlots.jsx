import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { animate, motion, motionValue, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon } from '@hugeicons/core-free-icons';
import { Check, Copy, Shield } from 'lucide-react';
import './CodeSlots.css';

const clamp01 = value => Math.min(1, Math.max(0, value));
const digitsOf = value => String(value ?? '').replace(/\D/g, '');
const toSlots = (value, length) => Array.from({ length }, (_, i) => digitsOf(value).slice(0, length)[i] ?? '');
const firstEmpty = slots => Math.max(0, slots.indexOf('') === -1 ? slots.length - 1 : slots.indexOf(''));
const isFull = slots => slots.every(Boolean);

export default function CodeSlots({
  code = 'HOPI-9481', copyable = true, label = 'TICKET VERIFICATION HASH', size = 'md',
  value, onChange, length = 6, onComplete, status = 'idle', mask = false, caret = true,
  disabled = false, autoFocus = false, accentColor = '#FFF1A6', inkColor = '#FAF0D7',
  slotColor = '#181210', digitColor = '#181210', dangerColor = '#D36135',
  slotSize, gap = 8, radius = 12, bounce = 0.2, settle = 0.3, rise = 8,
  cascade = 20, ariaLabel = label || 'One-time code', className = '',
}) {
  const [copied, setCopied] = useState(false);
  if (typeof onChange === 'function') return <OtpSlots {...{
    value, onChange, length, onComplete, status, mask, caret, disabled, autoFocus,
    accentColor, inkColor, slotColor, digitColor, dangerColor,
    slotSize: slotSize ?? ({ sm: 32, md: 40, lg: 48 }[size] || 40), gap, radius,
    bounce, settle, rise, cascade, ariaLabel, className,
  }} />;

  const chars = code.split('');
  return (
    <div className="flex flex-col items-center sm:items-start gap-2">
      {label && <div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase font-serif text-mutedClay"><Shield className="w-3 h-3 text-terracotta" /><span>{label}</span></div>}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {chars.map((char, index) => char === '-' ? <span key={index} className="font-mono text-mutedClay font-bold px-0.5 select-none">—</span> :
          <div key={index} className={`${({ sm: 'w-7 h-9 text-xs', md: 'w-9 h-11 text-sm', lg: 'w-11 h-14 text-base' }[size] || 'w-9 h-11 text-sm')} flex items-center justify-center font-mono font-bold text-softButter bg-darkRoast rounded border border-elevatedBorder shadow-inner`}>{char}</div>)}
        {copyable && <button type="button" onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }} title="Copy verification code" className="p-2 ml-1 rounded bg-elevated hover:bg-elevatedBorder border border-elevatedBorder text-mutedClay hover:text-warmCream transition-colors flex items-center justify-center">{copied ? <Check className="w-4 h-4 text-softButter" /> : <Copy className="w-4 h-4" />}</button>}
      </div>
      {copied && <span className="text-[11px] font-mono text-softButter tracking-wider animate-fadeIn">✓ Pass hash copied to clipboard</span>}
    </div>
  );
}

function OtpSlots({ length, value, onChange, onComplete, status, mask, caret, disabled, autoFocus, accentColor, inkColor, slotColor, digitColor, dangerColor, slotSize, gap, radius, bounce, settle, rise, cascade, ariaLabel, className }) {
  const uid = useId();
  const reduce = useReducedMotion();
  const inputRef = useRef(null);
  const rowRef = useRef(null);
  const [slots, setSlots] = useState(() => toSlots(value, length));
  const [active, setActive] = useState(() => firstEmpty(slots));
  const [focused, setFocused] = useState(false);
  const activeMv = useMotionValue(active);
  const openMv = useMotionValue(0);
  const checkMv = useMotionValue(0);
  const target = useRef([]);
  const draining = useRef(false);
  const drainTimer = useRef();
  const emitted = useRef(digitsOf(value).slice(0, length));
  const slotsRef = useRef(slots);
  slotsRef.current = slots;
  const live = useRef({ settle, bounce, cascade, reduce });
  live.current = { settle, bounce, cascade, reduce };
  const springs = useMemo(() => ({
    mvs: Array.from({ length }, (_, i) => motionValue(slotsRef.current[i] ? 1 : 0)),
    drops: Array.from({ length }, () => motionValue(0)),
  }), [length]);
  const { mvs, drops } = springs;
  const pitch = slotSize + gap;
  const height = Math.round(slotSize * 1.18);
  const washRadius = Math.min(radius, slotSize / 2);

  const drive = useCallback((i, to, delayMs = 0) => {
    const mv = mvs[i];
    if (!mv) return;
    target.current[i] = to;
    if (live.current.reduce) mv.jump(to);
    else animate(mv, to, { type: 'spring', duration: live.current.settle, bounce: live.current.bounce, delay: delayMs / 1000 });
  }, [mvs]);
  const land = useCallback((i, delayMs = 0) => { if (mvs[i]?.get() > 0) mvs[i].jump(0); drive(i, 1, delayMs); }, [mvs, drive]);
  const jumpActive = next => { activeMv.jump(next); setActive(next); };
  const commit = useCallback(next => {
    const prev = slotsRef.current;
    slotsRef.current = next;
    setSlots(next);
    const code = next.join('');
    emitted.current = code;
    onChange?.(code);
    if (!isFull(prev) && isFull(next)) onComplete?.(code);
  }, [onChange, onComplete]);
  const insert = (raw, from = active) => {
    const digits = digitsOf(raw);
    if (!digits) return;
    const next = [...slotsRef.current];
    let i = from;
    for (const digit of digits) {
      if (i >= length) break;
      next[i] = digit;
      land(i, reduce ? 0 : (i - from) * cascade);
      i++;
    }
    if (i === from) return;
    commit(next);
    jumpActive(Math.min(i, length - 1));
  };
  const clearSlot = i => {
    if (!slotsRef.current[i]) return;
    const next = [...slotsRef.current];
    next[i] = '';
    drive(i, 0);
    commit(next);
    jumpActive(i);
  };
  const busy = disabled || draining.current || status === 'success';

  useEffect(() => {
    if (value === undefined) return;
    const clean = digitsOf(value).slice(0, length);
    if (clean === emitted.current) return;
    emitted.current = clean;
    const prev = slotsRef.current;
    const next = toSlots(clean, length);
    const landing = [];
    const leaving = [];
    next.forEach((digit, i) => { if (digit !== prev[i]) (digit ? landing : leaving).push(i); });
    landing.forEach((i, k) => land(i, reduce ? 0 : k * cascade));
    leaving.reverse().forEach((i, k) => drive(i, 0, reduce ? 0 : k * cascade));
    slotsRef.current = next;
    setSlots(next);
    jumpActive(firstEmpty(next));
    if (!isFull(prev) && isFull(next)) onComplete?.(clean);
  }, [value, length]);

  useEffect(() => {
    if (status !== 'success') return;
    if (reduce) { openMv.jump(1); checkMv.jump(1); drops.forEach(d => d.jump(1)); return; }
    animate(openMv, 1, { duration: 0.3 });
    drops.forEach((d, i) => animate(d, 1, { type: 'spring', duration: 0.3, bounce: 0, delay: 0.06 + i * 0.03 }));
    animate(checkMv, 1, { type: 'spring', duration: 0.35, bounce, delay: 0.28 });
  }, [status]);

  useEffect(() => {
    if (status !== 'error') return;
    const filled = slotsRef.current.map((digit, i) => digit ? i : -1).filter(i => i >= 0).reverse();
    if (!filled.length) return;
    draining.current = true;
    filled.forEach((i, k) => drive(i, 0, reduce ? 0 : k * cascade));
    jumpActive(0);
    clearTimeout(drainTimer.current);
    drainTimer.current = setTimeout(() => {
      draining.current = false;
      commit(Array.from({ length }, () => ''));
    }, reduce ? 300 : (filled.length - 1) * cascade + settle * 1000);
    return () => clearTimeout(drainTimer.current);
  }, [status]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);
  useEffect(() => () => clearTimeout(drainTimer.current), []);

  const onKeyDown = e => {
    if (busy || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); insert(e.key); }
    else if (e.key === 'Backspace') { e.preventDefault(); if (slots[active]) clearSlot(active); else if (active > 0) { clearSlot(active - 1); jumpActive(active - 1); } }
    else if (e.key === 'Delete') { e.preventDefault(); clearSlot(active); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); jumpActive(Math.max(active - 1, 0)); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); jumpActive(Math.min(active + 1, length - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); jumpActive(0); }
    else if (e.key === 'End') { e.preventDefault(); jumpActive(length - 1); }
  };
  const onPaste = e => { if (!busy) { e.preventDefault(); insert(e.clipboardData.getData('text'), 0); } };
  const onInput = e => { if (!busy) { const digits = digitsOf(e.target.value); if (digits) insert(digits, digits.length === 1 ? active : 0); } };
  const onRowMouseDown = e => {
    if (disabled) return;
    e.preventDefault();
    const row = rowRef.current;
    if (row && !draining.current && status !== 'success') {
      const rect = row.getBoundingClientRect();
      const i = Math.floor((e.clientX - rect.left) / ((rect.width / (row.offsetWidth || rect.width)) || 1) / pitch);
      jumpActive(Math.max(0, Math.min(i, firstEmpty(slotsRef.current))));
    }
    inputRef.current?.focus();
  };
  const caretX = useTransform(() => activeMv.get() * pitch);
  const caretTransform = useTransform(caretX, x => `translateX(${x}px)`);
  const washClip = useTransform(openMv, o => `inset(0 ${(1 - clamp01(o)) * 50}% round ${washRadius}px)`);
  const checkTransform = useTransform(checkMv, c => `translateY(${(1 - c) * 8}px) scale(${0.85 + 0.15 * Math.max(c, 0)})`);
  const checkOpacity = useTransform(checkMv, clamp01);
  const showCaret = caret && focused && !disabled && status !== 'success' && (status === 'error' || !slots[active]);

  return <div className={`code-slots${className ? ` ${className}` : ''}`} style={{
    '--cs-accent': accentColor, '--cs-ink': inkColor, '--cs-slot': slotColor,
    '--cs-digit': digitColor, '--cs-danger': dangerColor, '--cs-size': `${slotSize}px`,
    '--cs-height': `${height}px`, '--cs-gap': `${gap}px`, '--cs-radius': `${washRadius}px`, '--cs-font': `${Math.round(slotSize * 0.5)}px`,
  }}>
    <div ref={rowRef} className="code-slots__row" data-status={status} data-focused={focused ? '' : undefined} data-disabled={disabled ? '' : undefined} onMouseDown={onRowMouseDown}>
      <input ref={inputRef} className="code-slots__input" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" value="" maxLength={length} aria-label={ariaLabel} aria-invalid={status === 'error'} aria-describedby={`${uid}-count`} disabled={disabled} readOnly={status === 'success'} onKeyDown={onKeyDown} onPaste={onPaste} onChange={onInput} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      {slots.map((digit, i) => <Slot key={i} mv={mvs[i]} drop={drops[i]} char={mask && digit ? '•' : digit} active={focused && i === active} rise={rise} sink={Math.round(height * 0.5)} />)}
      <motion.span className="code-slots__wash" aria-hidden="true" style={{ clipPath: washClip }}><motion.span className="code-slots__check" style={{ transform: checkTransform, opacity: checkOpacity }}><HugeiconsIcon icon={Tick02Icon} size={Math.round(slotSize * 0.6)} strokeWidth={2.2} /></motion.span></motion.span>
      <motion.span className="code-slots__caret" aria-hidden="true" data-show={showCaret ? '' : undefined} style={{ transform: caretTransform }}><span key={active} className="code-slots__caret-line" /></motion.span>
    </div>
    <span id={`${uid}-count`} className="code-slots__sr" aria-live="polite">{status === 'success' ? 'Code accepted' : `${slots.filter(Boolean).length} of ${length} digits entered`}</span>
  </div>;
}

function Slot({ mv, drop, char, active, rise, sink }) {
  const [shown, setShown] = useState(char);
  if (char && char !== shown) setShown(char);
  const fill = useTransform(mv, t => `scale(${Math.max(t, 0)})`);
  const lift = useTransform([mv, drop], ([t, d]) => `translateY(${(1 - t) * rise + Math.max(d, 0) * sink}px)`);
  const ink = useTransform([mv, drop], ([t, d]) => clamp01(t) * (1 - clamp01(d / 0.6)));
  return <span className="code-slots__slot" data-active={active ? '' : undefined} data-filled={char ? '' : undefined} aria-hidden="true"><motion.span className="code-slots__fill" style={{ transform: fill }} />{shown ? <motion.span className="code-slots__digit" style={{ transform: lift, opacity: ink }}>{shown}</motion.span> : null}</span>;
}

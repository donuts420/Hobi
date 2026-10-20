import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DepthCarousel({
  items = [],
  cardWidth = 340,
  cardHeight = 360,
  radius = 18,
  tint = '#181210',
  depth = 150,
  spread = 60,
  tilt = 16,
  visibleCards = 4,
  falloff = 0.18,
  blur = 4,
  autoplay = false,
  loop = true,
  onChange,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (onChange && items.length > 0) {
      onChange(activeIndex);
    }
  }, [activeIndex, items, onChange]);

  if (!items || items.length === 0) return null;

  const count = items.length;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : loop ? count - 1 : 0));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < count - 1 ? prev + 1 : loop ? 0 : count - 1));
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden select-none">
      {/* 3D Stack container */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: 1000 }}
      >
        {items.map((item, index) => {
          let diff = index - activeIndex;
          if (loop) {
            if (diff > count / 2) diff -= count;
            if (diff < -count / 2) diff += count;
          }

          const isVisible = Math.abs(diff) <= visibleCards;
          if (!isVisible) return null;

          const isCenter = diff === 0;
          const translateX = diff * spread;
          const translateZ = -Math.abs(diff) * depth;
          const rotateY = diff > 0 ? -tilt : diff < 0 ? tilt : 0;
          const opacity = Math.max(0, 1 - Math.abs(diff) * falloff);
          const filterBlur = isCenter ? 0 : Math.min(Math.abs(diff) * blur, 8);
          const zIndex = 50 - Math.abs(diff);

          return (
            <div
              key={index}
              onClick={() => setActiveIndex(index)}
              className="absolute transition-all duration-500 ease-out cursor-pointer shadow-dune-lg overflow-hidden border border-clayBrown/60"
              style={{
                width: `${cardWidth}px`,
                maxWidth: '85vw',
                height: `${cardHeight}px`,
                borderRadius: `${radius}px`,
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                opacity,
                filter: `blur(${filterBlur}px)`,
                zIndex,
              }}
            >
              <img
                src={item.image}
                alt={item.alt || ''}
                className="w-full h-full object-cover pointer-events-none"
              />
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  backgroundColor: tint,
                  opacity: isCenter ? 0.1 : 0.45,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {count > 1 && (
        <div className="absolute inset-x-2 sm:inset-x-4 flex justify-between items-center pointer-events-none z-50">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2 rounded-full bg-darkRoast/80 hover:bg-clayBrown text-softButter border border-clayBrown/60 pointer-events-auto transition-transform hover:scale-110 shadow-dune-sm"
            aria-label="Previous event"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-2 rounded-full bg-darkRoast/80 hover:bg-clayBrown text-softButter border border-clayBrown/60 pointer-events-auto transition-transform hover:scale-110 shadow-dune-sm"
            aria-label="Next event"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { CarouselItem } from '../types/dashboard';

type CarouselProps = {
  items: CarouselItem[];
  intervalMs?: number;
};

export const Carousel = ({ items, intervalMs = 4000 }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  const currentItem = useMemo(() => items[currentIndex], [currentIndex, items]);

  useEffect(() => {
    if (!items.length) return;

    const timer = window.setInterval(() => {
      setShowBack(false);
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, items.length]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowBack(true), intervalMs / 2);
    return () => window.clearTimeout(timeout);
  }, [currentIndex, intervalMs]);

  if (!items.length) {
    return <div className="carousel-empty">No items available</div>;
  }

  return (
    <div className="carousel">
      <div className={`carousel-card ${showBack ? 'is-flipped' : ''}`}>
        <div className="carousel-face carousel-front">
          <h3>{currentItem.title}</h3>
          <p>{currentItem.description}</p>
        </div>
        <div className="carousel-face carousel-back">
          <h3>Details</h3>
          <p>{currentItem.backside}</p>
        </div>
      </div>
      <div className="carousel-indicators">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={index === currentIndex ? 'active' : ''}
            onClick={() => {
              setCurrentIndex(index);
              setShowBack(false);
            }}
          />
        ))}
      </div>
    </div>
  );
};


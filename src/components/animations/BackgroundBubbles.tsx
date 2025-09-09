import React from 'react';

const BackgroundBubbles = () => {
  const bubbles = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble}
          className="absolute animate-bubble opacity-5"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        >
          <div
            className="rounded-full bg-gradient-accent"
            style={{
              width: `${50 + Math.random() * 100}px`,
              height: `${50 + Math.random() * 100}px`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default BackgroundBubbles;
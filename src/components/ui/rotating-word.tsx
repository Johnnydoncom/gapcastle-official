"use client";

import { useEffect, useState } from "react";

/**
 * Cycles a single word inside a headline. All words occupy the same grid cell
 * so the slot is as wide as the longest word and the headline never reflows.
 */
export function RotatingWord({
  words,
  interval = 3000,
  className,
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((v) => (v + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className={`word-slot ${className ?? ""}`}>
      <span className="sr-only">{words[0]}</span>
      {words.map((word, i) => (
        <span
          key={word}
          aria-hidden
          style={{
            transform: `translateY(${(i - index) * 105}%)`,
            opacity: i === index ? 1 : 0,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

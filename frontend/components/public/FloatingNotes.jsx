"use client";

import { useEffect, useState } from "react";

const NOTES = ["\u266A", "\u266B", "\u266C"];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function FloatingNotes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    setNotes(
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        char: NOTES[i % NOTES.length],
        left: rand(10, 90),
        delay: rand(0, 10),
        dur: rand(16, 26),
        size: rand(20, 32),
      }))
    );
  }, []);

  if (!notes.length) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {notes.map((n) => (
        <span
          key={n.id}
          className="absolute bottom-0"
          style={{
            left: `${n.left}%`,
            fontSize: `${n.size}px`,
            color: "#E91E63",
            opacity: 0.15,
            animation: `noteFloat ${n.dur}s linear ${n.delay}s infinite`,
          }}
        >
          {n.char}
        </span>
      ))}
    </div>
  );
}

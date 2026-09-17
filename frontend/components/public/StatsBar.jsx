"use client";

import { useState, useEffect } from "react";

const STATS = [
  { value: 10, label: "Years of Experience", icon: "🎵" },
  { value: 500, label: "Happy Students", icon: "🎶" },
  { value: 20, label: "Expert Teachers", icon: "🎼" },
  { value: 100, label: "Student Satisfaction", icon: "🏆" },
];

export default function StatsBar() {
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const increments = STATS.map((_, i) => {
      const target = STATS[i].value;
      let current = 0;
      const interval = setInterval(() => {
        current += Math.ceil(target / 50);
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setCounts((prev) => {
          const newCounts = [...prev];
          newCounts[i] = current;
          return newCounts;
        });
      }, 20);
      return () => clearInterval(interval);
    });
    return () => {
      increments.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <section className="bg-brand-50 py-12">
      <div className="grid grid-cols-2 gap-8 px-5 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <div key={stat.label} className="text-center">
            <span className="text-4xl font-serif font-bold text-dark counts">{counts[i]}</span>
            <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
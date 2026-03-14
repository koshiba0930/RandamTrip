"use client";

import { useEffect, useState, useRef } from "react";
import { PREFECTURE_TO_CLASS_ID } from "@/data/prefecture-map";

type Props = {
  highlightedPrefecture?: string;
  isAnimating?: boolean;
};

export function JapanMap({ highlightedPrefecture, isAnimating }: Props) {
  const [svgContent, setSvgContent] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousHighlightRef = useRef<SVGElement | null>(null);

  useEffect(() => {
    fetch("/japan-map.svg")
      .then((res) => res.text())
      .then((svg) => setSvgContent(svg));
  }, []);

  useEffect(() => {
    if (!svgContent || !containerRef.current) return;

    const prefectures = containerRef.current.querySelectorAll(".prefecture");
    prefectures.forEach((prefecture) => {
      const element = prefecture as SVGElement;
      element.style.fill = "#E5E7EB";
      element.style.transition = "fill 0.2s ease";
    });
  }, [svgContent]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isAnimating) {
      const prefectures = Object.keys(PREFECTURE_TO_CLASS_ID);

      const animate = () => {
        if (!containerRef.current) return;

        if (previousHighlightRef.current) {
          previousHighlightRef.current.style.fill = "#E5E7EB";
        }

        const randomIndex = Math.floor(Math.random() * prefectures.length);
        const randomPrefecture = prefectures[randomIndex];
        const classId = PREFECTURE_TO_CLASS_ID[randomPrefecture];

        if (classId) {
          const target = containerRef.current.querySelector(
            `.${classId}`
          ) as SVGElement;
          if (target) {
            target.style.fill = "#93C5FD";
            previousHighlightRef.current = target;
          }
        }
      };

      animate();
      intervalRef.current = setInterval(animate, 800);
    } else {
      if (previousHighlightRef.current) {
        previousHighlightRef.current.style.fill = "#E5E7EB";
        previousHighlightRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAnimating]);

  useEffect(() => {
    if (!containerRef.current || !highlightedPrefecture || isAnimating) return;

    const classId = PREFECTURE_TO_CLASS_ID[highlightedPrefecture];
    if (classId) {
      const target = containerRef.current.querySelector(
        `.${classId}`
      ) as SVGElement;
      if (target) {
        target.style.fill = "#3B82F6";
      }
    }
  }, [highlightedPrefecture, isAnimating]);

  if (!svgContent) {
    return (
      <div className="w-full max-w-4xl mx-auto h-[600px] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="japan-map-container"
      className="w-full max-w-4xl mx-auto opacity-100"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

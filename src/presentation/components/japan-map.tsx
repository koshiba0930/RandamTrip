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
      element.style.transition = "fill 0.25s ease-out";
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
      let currentIndex = 0;

      const animate = () => {
        if (!containerRef.current) return;

        let attempts = 0;
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * prefectures.length);
          attempts++;
        } while (randomIndex === currentIndex && attempts < 5);

        currentIndex = randomIndex;
        const randomPrefecture = prefectures[randomIndex];
        const classId = PREFECTURE_TO_CLASS_ID[randomPrefecture];

        if (classId) {
          const target = containerRef.current.querySelector(
            `.${classId}`
          ) as SVGElement;
          if (target) {
            if (previousHighlightRef.current) {
              previousHighlightRef.current.style.fill = "#E5E7EB";
            }
            target.style.fill = "#93C5FD";
            previousHighlightRef.current = target;
          }
        }
      };

      animate();
      intervalRef.current = setInterval(animate, 180);
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

  return (
    <div className="w-full max-w-4xl mx-auto aspect-square">
      {!svgContent ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse text-gray-400">読み込み中...</div>
        </div>
      ) : (
        <div
          ref={containerRef}
          id="japan-map-container"
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  );
}

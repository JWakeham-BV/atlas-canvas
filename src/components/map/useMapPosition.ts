import gsap from "gsap";
import { useCallback, useRef, useState } from "react";
import { motion } from "@/lib/motion";

export function useMapPosition(defaultPosition: {
  coordinates: [number, number];
  zoom: number;
}) {
  const positionRef = useRef({
    x: defaultPosition.coordinates[0],
    y: defaultPosition.coordinates[1],
    zoom: defaultPosition.zoom,
  });
  const lastUpdateRef = useRef(0);
  const lastValueRef = useRef({
    x: positionRef.current.x,
    y: positionRef.current.y,
    zoom: positionRef.current.zoom,
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [position, setPosition] = useState({
    coordinates: [positionRef.current.x, positionRef.current.y] as [
      number,
      number
    ],
    zoom: positionRef.current.zoom,
  });

  const animatePosition = useCallback(
    (
      next: {
        coordinates: [number, number];
        zoom: number;
      },
      options?: {
        onComplete?: () => void;
      }
    ) => {
    gsap.killTweensOf(positionRef.current);
    setIsAnimating(true);
    gsap.to(positionRef.current, {
      x: next.coordinates[0],
      y: next.coordinates[1],
      zoom: next.zoom,
      duration: motion.duration.zoom * 0.75,
      ease: motion.ease.inOut,
      onUpdate: () => {
        const now = performance.now();
        if (now - lastUpdateRef.current < 33) return;

        const next = {
          x: positionRef.current.x,
          y: positionRef.current.y,
          zoom: positionRef.current.zoom,
        };

        const dx = Math.abs(next.x - lastValueRef.current.x);
        const dy = Math.abs(next.y - lastValueRef.current.y);
        const dz = Math.abs(next.zoom - lastValueRef.current.zoom);

        if (dx < 0.02 && dy < 0.02 && dz < 0.005) return;

        lastUpdateRef.current = now;
        lastValueRef.current = next;

        setPosition({
          coordinates: [next.x, next.y],
          zoom: next.zoom,
        });
      },
      onComplete: () => {
        setIsAnimating(false);
        options?.onComplete?.();
      },
      onInterrupt: () => setIsAnimating(false),
    });
  },
  []
);

  const updatePosition = useCallback((next: {
    coordinates: [number, number];
    zoom: number;
  }) => {
    gsap.killTweensOf(positionRef.current);
    positionRef.current = {
      x: next.coordinates[0],
      y: next.coordinates[1],
      zoom: next.zoom,
    };
    lastUpdateRef.current = performance.now();
    lastValueRef.current = {
      x: next.coordinates[0],
      y: next.coordinates[1],
      zoom: next.zoom,
    };
    setIsAnimating(false);
    setPosition(next);
  }, []);

  const resetPosition = useCallback(() => {
    animatePosition({
      coordinates: defaultPosition.coordinates,
      zoom: defaultPosition.zoom,
    });
  }, [animatePosition, defaultPosition.coordinates, defaultPosition.zoom]);

  return {
    position,
    positionRef,
    animatePosition,
    updatePosition,
    resetPosition,
    isAnimating,
  };
}


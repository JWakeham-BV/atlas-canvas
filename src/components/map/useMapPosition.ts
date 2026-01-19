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
  const rafIdRef = useRef<number | null>(null);
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
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    setIsAnimating(true);
    
    const updatePositionOnFrame = () => {
      setPosition({
        coordinates: [positionRef.current.x, positionRef.current.y],
        zoom: positionRef.current.zoom,
      });
      rafIdRef.current = requestAnimationFrame(updatePositionOnFrame);
    };
    
    rafIdRef.current = requestAnimationFrame(updatePositionOnFrame);
    
    gsap.to(positionRef.current, {
      x: next.coordinates[0],
      y: next.coordinates[1],
      zoom: next.zoom,
      duration: motion.duration.zoom * 0.75,
      ease: motion.ease.inOut,
      onComplete: () => {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        // Final position sync
        setPosition({
          coordinates: [positionRef.current.x, positionRef.current.y],
          zoom: positionRef.current.zoom,
        });
        setIsAnimating(false);
        options?.onComplete?.();
      },
      onInterrupt: () => {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        setIsAnimating(false);
      },
    });
  },
  []
);

  const updatePosition = useCallback((next: {
    coordinates: [number, number];
    zoom: number;
  }) => {
    gsap.killTweensOf(positionRef.current);
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    positionRef.current = {
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


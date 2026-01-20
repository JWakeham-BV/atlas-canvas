import { useSpaceOperations } from "@/hooks/use-locations";
import { motion } from "@/lib/motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import type { SpaceOperation } from "@shared/data";

interface SpaceOverlayProps {
  isActive: boolean;
  selectedOperationId: number | null;
  onOperationSelect: (id: number) => void;
  onClose: () => void;
  mapWidth: number;
  mapHeight: number;
}

interface OrbitRingProps {
  operations: SpaceOperation[];
  radius: number;
  label: string;
  centerX: number;
  centerY: number;
  selectedId: number | null;
  onSelect: (id: number) => void;
  delay: number;
}

function OrbitRing({
  operations,
  radius,
  label,
  centerX,
  centerY,
  selectedId,
  onSelect,
  delay,
}: OrbitRingProps) {
  const ringRef = useRef<SVGGElement>(null);

  useGSAP(() => {
    if (!ringRef.current) return;
    
    // Animate ring expanding outward
    gsap.fromTo(
      ringRef.current,
      { opacity: 0, scale: 0.6 },
      {
        opacity: 1,
        scale: 1,
        duration: motion.duration.slow,
        ease: "power2.out",
        delay,
      }
    );
  }, [delay]);

  const angleStep = (2 * Math.PI) / Math.max(operations.length, 1);
  const startAngle = -Math.PI / 2; // Start from top

  return (
    <g ref={ringRef} opacity={0} style={{ transformOrigin: `${centerX}px ${centerY}px` }}>
      {/* Full circle orbit path */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke="rgba(91, 163, 220, 0.2)"
        strokeWidth={1}
        strokeDasharray="6 4"
      />
      
      {/* Orbit label */}
      <text
        x={centerX}
        y={centerY - radius - 8}
        fill="rgba(91, 163, 220, 0.6)"
        fontSize={9}
        fontFamily="var(--font-body)"
        textAnchor="middle"
        dominantBaseline="middle"
        className="uppercase tracking-widest"
      >
        {label}
      </text>

      {/* Operation pins */}
      {operations.map((op, index) => {
        const angle = startAngle + index * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const isSelected = selectedId === op.id;

        return (
          <SpacePin
            key={op.id}
            x={x}
            y={y}
            operation={op}
            isSelected={isSelected}
            onClick={() => onSelect(op.id)}
            delay={delay + 0.05 + index * 0.03}
          />
        );
      })}
    </g>
  );
}

interface SpacePinProps {
  x: number;
  y: number;
  operation: SpaceOperation;
  isSelected: boolean;
  onClick: () => void;
  delay: number;
}

function SpacePin({ x, y, operation, isSelected, onClick, delay }: SpacePinProps) {
  const pinRef = useRef<SVGGElement>(null);

  useGSAP(() => {
    if (!pinRef.current) return;
    
    gsap.fromTo(
      pinRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: motion.duration.base,
        ease: motion.ease.out,
        delay,
      }
    );
  }, [delay]);

  const size = 10;
  const categoryColors: Record<string, { fill: string; glow: string }> = {
    reconnaissance: { fill: "#5ba3dc", glow: "rgba(91, 163, 220, 0.6)" },
    communications: { fill: "#4ade80", glow: "rgba(74, 222, 128, 0.6)" },
    intelligence: { fill: "#f59e0b", glow: "rgba(245, 158, 11, 0.6)" },
    navigation: { fill: "#8b5cf6", glow: "rgba(139, 92, 246, 0.6)" },
    research: { fill: "#06b6d4", glow: "rgba(6, 182, 212, 0.6)" },
    defense: { fill: "#cc2b3c", glow: "rgba(204, 43, 60, 0.6)" },
  };

  const colors = categoryColors[operation.category] || categoryColors.reconnaissance;

  return (
    <g
      ref={pinRef}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={operation.name}
      className="cursor-pointer"
      style={{ pointerEvents: "all" }}
    >
      {/* Hit area */}
      <circle cx={x} cy={y} r={size * 2.5} fill="transparent" />
      
      {/* Glow */}
      <circle
        cx={x}
        cy={y}
        r={size * 1.2}
        fill={isSelected ? "rgba(255, 255, 255, 0.5)" : colors.glow}
        style={{ filter: "blur(6px)" }}
      />
      
      {/* Main pin */}
      <circle
        cx={x}
        cy={y}
        r={size}
        fill={isSelected ? "#ffffff" : colors.fill}
        stroke={isSelected ? "#ffffff" : "rgba(255,255,255,0.3)"}
        strokeWidth={2}
      />
      
      {/* Inner highlight */}
      <circle
        cx={x}
        cy={y}
        r={size * 0.35}
        fill={isSelected ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.5)"}
      />

      {/* Label - positioned above the pin */}
      {isSelected && (
        <g>
          <rect
            x={x - (operation.name.length * 6.5 + 16) / 2}
            y={y - size - 30}
            width={operation.name.length * 6.5 + 16}
            height={22}
            rx={4}
            fill="rgba(10, 18, 30, 0.95)"
            stroke="rgba(91, 163, 220, 0.5)"
            strokeWidth={1}
          />
          <text
            x={x}
            y={y - size - 18}
            fill="#ffffff"
            fontSize={11}
            fontFamily="var(--font-body)"
            fontWeight={500}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {operation.name}
          </text>
        </g>
      )}
    </g>
  );
}

export function SpaceOverlay({
  isActive,
  selectedOperationId,
  onOperationSelect,
  onClose,
  mapWidth,
  mapHeight,
}: SpaceOverlayProps) {
  const containerRef = useRef<SVGSVGElement>(null);
  const ringsRef = useRef<SVGGElement>(null);
  const backdropRef = useRef<SVGRectElement>(null);
  const spaceOperations = useSpaceOperations();
  
  // Track if we should render (stays true during exit animation)
  const [shouldRender, setShouldRender] = useState(false);
  const isAnimatingRef = useRef(false);
  const hasAnimatedIn = useRef(false);

  const centerX = mapWidth / 2;
  const centerY = mapHeight / 2;
  
  // Calculate ring sizes based on viewport - leave room for padding
  const padding = 80;
  const maxRadius = Math.min(mapWidth, mapHeight) / 2 - padding;
  const minRadius = 60;
  
  // Group operations by orbit type
  const operationsByOrbit = useMemo(() => {
    const groups: Record<string, SpaceOperation[]> = {
      LEO: [],
      MEO: [],
      GEO: [],
      HEO: [],
      Lunar: [],
      "Deep Space": [],
    };
    
    spaceOperations.forEach((op) => {
      if (groups[op.orbitType]) {
        groups[op.orbitType].push(op);
      }
    });
    
    return groups;
  }, [spaceOperations]);

  // Define orbit rings - evenly spaced from center to edge
  const activeOrbitTypes = ["LEO", "MEO", "GEO", "HEO", "Lunar"].filter(
    type => operationsByOrbit[type].length > 0
  );
  
  const ringSpacing = activeOrbitTypes.length > 1 
    ? (maxRadius - minRadius) / (activeOrbitTypes.length - 1)
    : 0;

  const orbitRings = useMemo(() => {
    return activeOrbitTypes.map((type, index) => ({
      type,
      label: type === "Lunar" ? "LUNAR" : type,
      radius: minRadius + ringSpacing * index,
      operations: operationsByOrbit[type],
    }));
  }, [activeOrbitTypes, minRadius, ringSpacing, operationsByOrbit]);

  // Generate stable stars
  const stars = useMemo(() => {
    const seed = 12345;
    const seededRandom = (i: number) => {
      const x = Math.sin(seed + i * 9999) * 10000;
      return x - Math.floor(x);
    };
    
    return Array.from({ length: 60 }).map((_, i) => ({
      x: seededRandom(i * 3) * mapWidth,
      y: seededRandom(i * 3 + 1) * mapHeight,
      size: seededRandom(i * 3 + 2) * 1.2 + 0.3,
      opacity: seededRandom(i * 3 + 3) * 0.3 + 0.05,
    }));
  }, [mapWidth, mapHeight]);

  // Handle enter animation
  const animateIn = useCallback(() => {
    if (!containerRef.current || !ringsRef.current || isAnimatingRef.current || hasAnimatedIn.current) return;
    
    isAnimatingRef.current = true;
    hasAnimatedIn.current = true;
    
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });
    
    // Fade in container
    tl.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: motion.duration.base, ease: motion.ease.out },
      0
    );
    
    // Animate rings expanding from center
    tl.fromTo(
      ringsRef.current,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: motion.duration.slow, ease: "power2.out" },
      0.1
    );
  }, []);

  // Handle exit animation
  const animateOut = useCallback(() => {
    if (!containerRef.current || !ringsRef.current || isAnimatingRef.current) return;
    
    isAnimatingRef.current = true;
    
    const tl = gsap.timeline({
      onComplete: () => {
        setShouldRender(false);
        isAnimatingRef.current = false;
        hasAnimatedIn.current = false;
      },
    });
    
    // Animate rings collapsing to center
    tl.to(
      ringsRef.current,
      { opacity: 0, scale: 0.6, duration: motion.duration.base, ease: "power2.in" },
      0
    );
    
    // Fade out container
    tl.to(
      containerRef.current,
      { opacity: 0, duration: motion.duration.base, ease: motion.ease.in },
      0.05
    );
  }, []);

  // Handle isActive changes
  useEffect(() => {
    if (isActive && !shouldRender) {
      // Opening - mount first, then animate
      setShouldRender(true);
    } else if (!isActive && shouldRender && !isAnimatingRef.current) {
      // Closing - animate out, then unmount
      animateOut();
    }
  }, [isActive, shouldRender, animateOut]);

  // Trigger enter animation after mount
  useEffect(() => {
    if (shouldRender && isActive && !hasAnimatedIn.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(animateIn, 10);
      return () => clearTimeout(timer);
    }
  }, [shouldRender, isActive, animateIn]);

  if (!shouldRender) return null;

  return (
    <svg 
      ref={containerRef}
      width={mapWidth} 
      height={mapHeight} 
      className="absolute inset-0 z-20"
      style={{ pointerEvents: "none" }}
    >
      {/* Dark overlay to dim the map */}
      <rect
        ref={backdropRef}
        x={0}
        y={0}
        width={mapWidth}
        height={mapHeight}
        fill="rgba(5, 10, 18, 0.75)"
        style={{ pointerEvents: "all" }}
        onClick={onClose}
      />

      {/* Subtle stars */}
      {stars.map((star, i) => (
        <circle
          key={i}
          cx={star.x}
          cy={star.y}
          r={star.size}
          fill={`rgba(255, 255, 255, ${star.opacity})`}
        />
      ))}

      {/* Scan line effect */}
      <defs>
        <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(91, 163, 220, 0)" />
          <stop offset="50%" stopColor="rgba(91, 163, 220, 0.08)" />
          <stop offset="100%" stopColor="rgba(91, 163, 220, 0)" />
        </linearGradient>
      </defs>
      <rect
        x={0}
        y={0}
        width={mapWidth}
        height={mapHeight}
        fill="url(#scanGradient)"
        className="animate-scan"
        style={{ pointerEvents: "none" }}
      />

      {/* Center crosshair / reference point */}
      <g opacity={0.3}>
        <line
          x1={centerX - 20}
          y1={centerY}
          x2={centerX + 20}
          y2={centerY}
          stroke="rgba(91, 163, 220, 0.5)"
          strokeWidth={1}
        />
        <line
          x1={centerX}
          y1={centerY - 20}
          x2={centerX}
          y2={centerY + 20}
          stroke="rgba(91, 163, 220, 0.5)"
          strokeWidth={1}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={8}
          fill="none"
          stroke="rgba(91, 163, 220, 0.4)"
          strokeWidth={1}
        />
      </g>

      {/* Orbit rings with operations */}
      <g ref={ringsRef} style={{ transformOrigin: `${centerX}px ${centerY}px` }}>
        {orbitRings.map((ring, index) => (
          <OrbitRing
            key={ring.type}
            operations={ring.operations}
            radius={ring.radius}
            label={ring.label}
            centerX={centerX}
            centerY={centerY}
            selectedId={selectedOperationId}
            onSelect={onOperationSelect}
            delay={0.15 + index * 0.08}
          />
        ))}
      </g>
    </svg>
  );
}

// Trigger component - the pull-down strip at the top
interface SpaceTriggerProps {
  isActive: boolean;
  onToggle: () => void;
  operationCount: number;
}

export function SpaceTrigger({ isActive, onToggle, operationCount }: SpaceTriggerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={triggerRef}
      onClick={onToggle}
      className={`
        absolute top-0 left-1/2 -translate-x-1/2 z-40
        flex items-center gap-2 px-4 py-2 pt-3
        rounded-b-xl border border-t-0
        transition-all duration-300 ease-out
        ${isActive 
          ? 'bg-primary/30 border-primary/50 text-white' 
          : 'bg-[#141e2d]/80 border-primary/30 text-white/80 hover:bg-[#1c2a3d]/90 hover:border-primary/50 hover:text-white'
        }
      `}
      aria-label={isActive ? "Close space operations" : "Open space operations"}
      aria-expanded={isActive}
    >
      {/* Satellite icon */}
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={`transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}
      >
        <path d="M13 7L9 3L5 7l4 4" />
        <path d="m17 11 4 4-4 4-4-4" />
        <path d="m8 12 4 4 6-6-4-4-6 6" />
        <path d="m16 8 3-3" />
        <path d="M9 21a6 6 0 0 0-6-6" />
      </svg>
      
      <span className="text-xs uppercase tracking-[0.15em] font-medium">
        Space Ops
      </span>
      
      {/* Count badge */}
      <span className={`
        min-w-[18px] h-[18px] px-1 
        flex items-center justify-center 
        rounded-full text-[10px] font-semibold
        ${isActive 
          ? 'bg-white/20 text-white' 
          : 'bg-primary/40 text-white/90'
        }
      `}>
        {operationCount}
      </span>
      
      {/* Pull indicator arrow */}
      <svg 
        width="10" 
        height="10" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={`transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

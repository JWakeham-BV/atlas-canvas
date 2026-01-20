interface PinProps {
  category: string;
  isSelected: boolean;
  onClick: () => void;
  title: string;
}

export function Pin({ isSelected, onClick, title }: PinProps) {
  const size = 10;
  
  return (
    <g
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={title}
      className="cursor-pointer"
      style={{ pointerEvents: "all" }}
    >
      {/* Larger invisible hit area for touch devices */}
      <circle r={size * 2.5} fill="transparent" />
      {/* Glow effect */}
      <circle
        r={size}
        fill={isSelected ? "rgba(255, 255, 255, 0.3)" : "rgba(204, 43, 60, 0.4)"}
        style={{
          filter: isSelected
            ? "blur(6px)"
            : "blur(4px)",
        }}
      />
      {/* Main pin circle */}
      <circle
        r={size}
        fill={isSelected ? "#ffffff" : "#cc2b3c"}
        stroke={isSelected ? "#ffffff" : "#e05a68"}
        strokeWidth={2}
      />
      {/* Inner highlight */}
      <circle
        r={size * 0.4}
        fill={isSelected ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.3)"}
      />
    </g>
  );
}

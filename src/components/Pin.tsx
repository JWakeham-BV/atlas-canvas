interface PinProps {
  category: string;
  isSelected: boolean;
  onClick: () => void;
  onFocus?: () => void;
  title: string;
}

export function Pin({ isSelected, onClick, onFocus, title, category }: PinProps) {
  const size = 10;
  const selectedText = isSelected ? ", currently selected" : "";
  const ariaLabel = `${title}${selectedText}. Press Enter to view details.`;
  
  return (
    <g
      onClick={onClick}
      onFocus={onFocus}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      className="cursor-pointer focus:outline-none pin-focusable"
      style={{ pointerEvents: "all" }}
    >
      {/* SVG title element for native tooltip on hover */}
      <title>{title} ({category})</title>
      {/* Larger invisible hit area for touch devices */}
      <circle r={size * 2.5} fill="transparent" />
      {/* Focus ring - visible only when focused via keyboard */}
      <circle
        r={size + 6}
        fill="none"
        stroke="rgba(91, 163, 220, 0.9)"
        strokeWidth={2}
        strokeDasharray="4 2"
        className="pin-focus-ring"
      />
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

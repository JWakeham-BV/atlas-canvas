import { useMemo } from "react";

interface PinProps {
  category: string;
  isSelected: boolean;
  onClick: () => void;
  title: string;
}

export function Pin({ isSelected, onClick, title }: PinProps) {  
  const baseStyles = "bg-[#cc2b3c] border-[#e05a68] shadow-[0_0_12px_rgba(204,43,60,0.6)]"
  const selectedStyles = "bg-white border-white shadow-[0_0_16px_rgba(255,255,255,0.8)]";
  
  const pinClass = useMemo(
    () =>
      `size-5 rounded-full border-2 transition-all duration-200 ${
        isSelected ? selectedStyles : baseStyles
      }`,
    [baseStyles, isSelected]
  );

  return (
    <foreignObject x={-28} y={-28} width={56} height={56} overflow="visible">
      <button
        onClick={onClick}
        tabIndex={0}
        aria-label={title}
        className="group relative flex items-center justify-center w-full h-full cursor-pointer bg-transparent border-none"
      >
        <div className={`${pinClass} hover:scale-110`} />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md border shadow-md opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 font-mono">
          {title}
        </div>
      </button>
    </foreignObject>
  );
}

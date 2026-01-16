import { useMemo } from "react";

interface PinProps {
  category: string;
  isSelected: boolean;
  onClick: () => void;
}

export function Pin({ category, isSelected, onClick }: PinProps) {
  const isNature = category === "nature";
  const baseColor = isNature
    ? "bg-[hsl(var(--accent))]"
    : "bg-[hsl(var(--primary))]";
  const selectedColor = "bg-[hsl(var(--accent))]";
  const pinClass = useMemo(
    () =>
      `w-2.5 h-2.5 rounded-full border border-white/60 ${
        isSelected ? selectedColor : baseColor
      }`,
    [baseColor, isSelected]
  );

  return (
    <foreignObject x={-6} y={-6} width={12} height={12}>
      <div
        onClick={onClick}
        className={`flex items-center justify-center ${pinClass} cursor-pointer`}
      />
    </foreignObject>
  );
}

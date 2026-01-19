import { Minus, Plus } from "lucide-react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="bg-[#141e2d]/95 backdrop-blur-md border border-primary/30 rounded-full p-2 flex flex-col gap-2 shadow-2xl shadow-black/50">
      <button
        onClick={onZoomIn}
        aria-label="Zoom in"
        className="p-3 hover:bg-primary/20 rounded-full text-white/80 hover:text-white transition-colors"
      >
        <Plus size={20} />
      </button>
      <div className="h-px w-full bg-primary/30" />
      <button
        onClick={onZoomOut}
        aria-label="Zoom out"
        className="p-3 hover:bg-primary/20 rounded-full text-white/80 hover:text-white transition-colors"
      >
        <Minus size={20} />
      </button>
    </div>
  );
}

import { Minus, Plus } from "lucide-react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="bg-card/80 backdrop-blur-md border border-white/5 rounded-full p-2 flex flex-col gap-2 shadow-2xl shadow-black/50">
      <button
        onClick={onZoomIn}
        aria-label="Zoom in"
        className="p-3 hover:bg-white/5 rounded-full text-foreground/80 hover:text-primary transition-colors"
      >
        <Plus size={20} />
      </button>
      <div className="h-px w-full bg-white/5" />
      <button
        onClick={onZoomOut}
        aria-label="Zoom out"
        className="p-3 hover:bg-white/5 rounded-full text-foreground/80 hover:text-primary transition-colors"
      >
        <Minus size={20} />
      </button>
    </div>
  );
}

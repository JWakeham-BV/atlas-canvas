import { ChevronDown, ChevronUp } from "lucide-react";

type Region = {
  id: string;
  label: string;
  coordinates: [number, number];
  zoom: number;
};

interface RegionMenuProps {
  regions: Region[];
  activeRegionId: string;
  isOpen: boolean;
  isMobile: boolean;
  onToggle: () => void;
  onSelect: (region: Region) => void;
}

export function RegionMenu({
  regions,
  activeRegionId,
  isOpen,
  isMobile,
  onToggle,
  onSelect,
}: RegionMenuProps) {
  return (
    <div className="bg-card/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/40 w-full sm:w-auto">
      <div className={isMobile ? "flex flex-col-reverse" : "flex flex-col"}>
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/40 px-2 ${
            isMobile ? "pt-2" : "pb-2"
          }`}
          aria-expanded={isOpen}
          aria-label="Toggle regions menu"
        >
          Regions
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <div
          className={`flex flex-col gap-2 overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => onSelect(region)}
              className={`px-3 py-2 rounded-xl text-xs uppercase tracking-[0.25em] transition-colors border ${
                activeRegionId === region.id
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {region.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { useState } from "react";
import { useLocations } from "@/hooks/use-locations";
import { Pin } from "./Pin";
import { motion } from "framer-motion";
import { Minus, Plus, Compass } from "lucide-react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface MapControlProps {
  onLocationSelect: (locationId: number) => void;
  selectedLocationId: number | null;
}

export function MapControl({ onLocationSelect, selectedLocationId }: MapControlProps) {
  const { data: locations = [] } = useLocations();
  const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1.2 });

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  };

  const handleMarkerClick = (id: number, coordinates: [number, number]) => {
    onLocationSelect(id);
    setPosition({
      coordinates,
      zoom: 3, 
    });
  };

  return (
    <div className="relative w-full h-full bg-[#050508] overflow-hidden">
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05]">
        <defs>
          <pattern id="dotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
      </svg>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="w-full h-full"
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 140 }}
          className="w-full h-full"
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            maxZoom={5}
            minZoom={1}
            translateExtent={[[0, 0], [800, 600]]} 
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="url(#dotGrid)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none", opacity: 0.5 },
                      hover: { fill: "rgba(255,255,255,0.1)", outline: "none", opacity: 0.8 },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {locations.map((loc) => (
              <Marker 
                key={loc.id} 
                coordinates={[loc.longitude, loc.latitude]}
              >
                <Pin 
                  category={loc.category}
                  isSelected={selectedLocationId === loc.id}
                  onClick={() => handleMarkerClick(loc.id, [loc.longitude, loc.latitude])}
                />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </motion.div>

      <div className="absolute bottom-8 right-8 flex flex-col gap-4">
        <div className="bg-card/80 backdrop-blur-md border border-white/5 rounded-full p-2 flex flex-col gap-2 shadow-2xl shadow-black/50">
          <button 
            onClick={handleZoomIn}
            className="p-3 hover:bg-white/5 rounded-full text-foreground/80 hover:text-primary transition-colors"
          >
            <Plus size={20} />
          </button>
          <div className="h-px w-full bg-white/5" />
          <button 
            onClick={handleZoomOut}
            className="p-3 hover:bg-white/5 rounded-full text-foreground/80 hover:text-primary transition-colors"
          >
            <Minus size={20} />
          </button>
        </div>
      </div>

      <div className="absolute top-8 right-8 text-white/10 pointer-events-none">
        <Compass size={64} strokeWidth={1} />
      </div>
      
      <div className="absolute bottom-8 left-8 pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-display text-white/5 font-bold tracking-tighter">
          ATLAS
        </h1>
      </div>
    </div>
  );
}

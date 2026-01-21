import { InfoDrawer, type InfoDrawerHandle } from "@/components/InfoDrawer";
import { SpaceInfoDrawer, type SpaceInfoDrawerHandle } from "@/components/SpaceInfoDrawer";
import { MapControl } from "@/components/MapControl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

export default function Home() {
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null
  );
  const [selectedSpaceOperationId, setSelectedSpaceOperationId] = useState<number | null>(
    null
  );
  const [resetViewToken, setResetViewToken] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const infoDrawerRef = useRef<InfoDrawerHandle>(null);
  const spaceInfoDrawerRef = useRef<SpaceInfoDrawerHandle>(null);

  // Focus the appropriate drawer when a selection is made
  const handleLocationSelect = useCallback((id: number | null) => {
    setSelectedLocationId(id);
    if (id !== null) {
      // Small delay to allow drawer to animate in
      setTimeout(() => {
        infoDrawerRef.current?.focus();
      }, 400);
    }
  }, []);

  const handleSpaceOperationSelect = useCallback((id: number | null) => {
    setSelectedSpaceOperationId(id);
    if (id !== null) {
      setTimeout(() => {
        spaceInfoDrawerRef.current?.focus();
      }, 400);
    }
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.from(
        ".header-overlay",
        {
          y: -100,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        0.5
      );

      tl.from(
        ".footer-overlay",
        {
          y: 100,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        0.8
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen bg-background overflow-hidden flex"
    >
      {/* Map Area */}
      <div className="flex-1 relative z-0">
        <MapControl
          onLocationSelect={handleLocationSelect}
          selectedLocationId={selectedLocationId}
          onSpaceOperationSelect={handleSpaceOperationSelect}
          selectedSpaceOperationId={selectedSpaceOperationId}
          resetViewToken={resetViewToken}
        />
      </div>

      {/* Info Drawer - For ground operations */}
      <InfoDrawer
        ref={infoDrawerRef}
        locationId={selectedLocationId}
        onClose={() => {
          setSelectedLocationId(null);
        }}
      />

      {/* Space Info Drawer - For space operations */}
      <SpaceInfoDrawer
        ref={spaceInfoDrawerRef}
        operationId={selectedSpaceOperationId}
        onClose={() => {
          setSelectedSpaceOperationId(null);
        }}
      />

    </div>
  );
}

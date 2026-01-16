import type { Location } from "@shared/data";
import { useMemo } from "react";
import Supercluster from "supercluster";

type ClusterProps = {
  locationId: number;
  category: string;
};

export type ClusterItem = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: ClusterProps & {
    cluster?: boolean;
    cluster_id?: number;
    point_count?: number;
    point_count_abbreviated?: number | string;
  };
};

export function useClusters(
  locations: Location[],
  zoom: number,
  bounds: [number, number, number, number]
) {
  const clusterIndex = useMemo(() => {
    const index = new Supercluster<ClusterProps>({
      radius: 60,
      maxZoom: 6,
    });
    index.load(
      locations.map((loc) => ({
        type: "Feature",
        properties: {
          locationId: loc.id,
          category: loc.category,
        },
        geometry: {
          type: "Point",
          coordinates: [loc.longitude, loc.latitude],
        },
      }))
    );
    return index;
  }, [locations]);

  const clusters = useMemo(
    () => clusterIndex.getClusters(bounds, Math.round(zoom)) as ClusterItem[],
    [bounds, clusterIndex, zoom]
  );

  return { clusterIndex, clusters };
}

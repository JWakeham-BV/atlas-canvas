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

/**
 * Sort items by reading order (top-to-bottom, left-to-right).
 * Groups items into latitude bands (~10 degrees) so nearby items
 * on the same "row" are navigated left-to-right before moving down.
 */
function sortByReadingOrder<T extends { lat: number; lng: number }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    // Group by latitude bands (higher lat = north = top of screen in Mercator)
    const latBandA = Math.floor(a.lat / 10);
    const latBandB = Math.floor(b.lat / 10);
    if (latBandB !== latBandA) return latBandB - latBandA; // Top to bottom
    return a.lng - b.lng; // Left to right within band
  });
}

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

  const clusters = useMemo(() => {
    const rawClusters = clusterIndex.getClusters(
      bounds,
      Math.round(zoom)
    ) as ClusterItem[];

    // Sort clusters by reading order for keyboard navigation
    const withCoords = rawClusters.map((cluster) => ({
      cluster,
      lat: cluster.geometry.coordinates[1],
      lng: cluster.geometry.coordinates[0],
    }));

    return sortByReadingOrder(withCoords).map((item) => item.cluster);
  }, [bounds, clusterIndex, zoom]);

  return { clusterIndex, clusters };
}

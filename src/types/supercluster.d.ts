declare module "supercluster" {
  type PointFeature<P> = {
    type: "Feature";
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
    properties: P & {
      cluster?: boolean;
      cluster_id?: number;
      point_count?: number;
      point_count_abbreviated?: number | string;
    };
  };

  interface SuperclusterOptions {
    radius?: number;
    maxZoom?: number;
  }

  export default class Supercluster<P = Record<string, unknown>> {
    constructor(options?: SuperclusterOptions);
    load(points: Array<PointFeature<P>>): this;
    getClusters(
      bounds: [number, number, number, number],
      zoom: number
    ): Array<PointFeature<P>>;
    getClusterExpansionZoom(clusterId: number): number;
  }
}


const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const MAX_LAT = 85;

const clampLatitude = (lat: number) =>
  Math.max(-MAX_LAT, Math.min(MAX_LAT, lat));

const mercatorY = (latRad: number) =>
  Math.log(Math.tan(Math.PI / 4 + latRad / 2));

const inverseMercator = (y: number) =>
  (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * RAD_TO_DEG;

export function getMercatorBounds(params: {
  width: number;
  height: number;
  center: [number, number];
  scale: number;
}) {
  const { width, height, center, scale } = params;

  if (width <= 0 || height <= 0 || scale <= 0) {
    return [-180, -85, 180, 85] as [number, number, number, number];
  }

  const [centerLng, centerLat] = center;
  const clampedLat = clampLatitude(centerLat);
  const centerX = scale * (centerLng * DEG_TO_RAD);
  const centerY = scale * mercatorY(clampedLat * DEG_TO_RAD);

  const translateX = width / 2 - centerX;
  const translateY = height / 2 - centerY;

  const toLng = (x: number) => ((x - translateX) / scale) * RAD_TO_DEG;
  const toLat = (y: number) =>
    clampLatitude(inverseMercator((y - translateY) / scale));

  const minLng = toLng(0);
  const maxLng = toLng(width);
  const minLat = toLat(height);
  const maxLat = toLat(0);

  return [minLng, minLat, maxLng, maxLat] as [
    number,
    number,
    number,
    number
  ];
}


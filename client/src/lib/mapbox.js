export function buildMapUrl(load) {
  const loadedPolyline = load.loadedMilesGeometry;
  const deadheadPolyline = load.deadheadMilesGeometry;
  const overlay1 = load.loadedMilesGeometry
    ? `path-5+f44(${encodeURIComponent(load.loadedMilesGeometry)})`
    : null;
  const overlay2 = load.deadheadMilesGeometry
    ? `path-5+44f(${encodeURIComponent(load.deadheadMilesGeometry)})`
    : null;
  const deadheadPin = load.driverCurrentLocation
    ? `pin-s+f44(${load.driverCurrentLocation.lng},${load.driverCurrentLocation.lat})`
    : null;
  const pickUpPin = `pin-s+44f(${load.stops[0].lng},${load.stops[0].lat})`;
  const stopsPin = load.stops
    .slice(1)
    .map((s) => `pin-s+4a4(${s.lng},${s.lat})`);
  const overlays = [overlay1, overlay2, deadheadPin, pickUpPin, ...stopsPin];
  const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${overlays.filter(Boolean).join(",")}/auto/650x300@2x?access_token=${import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN}`;
  return url;
}

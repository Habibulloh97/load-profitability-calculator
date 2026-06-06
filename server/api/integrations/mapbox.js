import dotenv from "dotenv";
dotenv.config({ path: "server/.env" });

export async function fetchAddress(location) {
  try {
    const res = await fetch(
      `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(location)}&access_token=${process.env.MAPBOX_TOKEN}&limit=1`,
    );
    const data = await res.json();
    if (!data.features || data.features.length === 0) {
      throw new Error("Address not found");
    }
    const lat = data.features[0].properties.coordinates.latitude;
    const lng = data.features[0].properties.coordinates.longitude;
    const address = data.features[0].properties.full_address;
    // console.log(data);
    return { address, lat, lng };
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function calculateRouteMiles(stops) {
  try {
    const coordinates = stops.map((s) => `${s.lng},${s.lat}`).join(";");
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?access_token=${process.env.MAPBOX_TOKEN}&geometries=polyline`,
    );
    const data = await res.json();
    const miles = Math.round(data.routes[0].distance / 1609.34);
    const geometry = data.routes[0].geometry;
    return { miles, geometry };
  } catch (err) {
    throw new Error(err.message);
  }
}

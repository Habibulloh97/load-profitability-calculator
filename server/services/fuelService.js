import Fuel from "../models/Fuel.js";
import fetchFuel from "../api/integrations/eia.js";

export default async function getFuelPrice() {
  const boundary = new Date();
  const offset = (boundary.getDay() - 2 + 7) % 7;
  boundary.setDate(boundary.getDate() - offset);
  boundary.setHours(0, 0, 0, 0);
  const fuel = await Fuel.findOne();

  if (fuel && fuel.fetchedAt >= offset) {
    return fuel.pricePerGallon;
  }

  const price = await fetchFuel();
  await Fuel.findOneAndUpdate(
    {},
    { pricePerGallon: price, fetchedAt: new Date() },
    { upsert: true, new: true },
  );
  return price;
}

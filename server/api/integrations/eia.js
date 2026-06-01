export default async function fetchFuel() {
  try {
    const res = await fetch(
      `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${process.env.EIA_API_KEY}&frequency=weekly&data[0]=value&facets[product][]=EPD2D&sort[0][column]=period&sort[0][direction]=desc&length=1`,
    );
    const data = await res.json();
    const fuelPrice = Number(data.response.data[0].value);
    return fuelPrice;
  } catch (err) {
    throw new Error(err.message);
  }
}

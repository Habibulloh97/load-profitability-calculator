export default function claculateBreakDown({
  rate,
  loadedMiles,
  deadheadMiles = 0,
  dispatchRates,
  companyDriverPay,
  driverType,
  mpg,
  averageFuel,
  maintenanceRate,
  tolls = 0,
}) {
  if (loadedMiles <= 0) {
    throw new Error("Loaded miles must be greater than 0");
  }
  const round2 = (n) => Math.round(n * 100) / 100;
  const totalMiles = deadheadMiles + loadedMiles;
  const ratePerMile = rate / totalMiles;
  const fuel = (totalMiles / mpg) * averageFuel;
  let maintenance = 0;
  let driverPay = 0;
  let dispatchFee = 0;
  if (driverType === "ownerOp") {
    dispatchFee = rate * dispatchRates.ownerOp;
  } else if (driverType === "lease") {
    dispatchFee = rate * dispatchRates.lease;
    maintenance = totalMiles * maintenanceRate;
  } else if (driverType === "company") {
    driverPay =
      companyDriverPay.payType === "cpm"
        ? totalMiles * companyDriverPay.cpm
        : rate * companyDriverPay.percentage;
  }
  const totalCost = fuel + maintenance + driverPay + dispatchFee + tolls;
  const netProfit = rate - totalCost;
  const profitPercent = netProfit / (rate / 100);
  return {
    fuel: round2(fuel),
    maintenance: round2(maintenance),
    driverPay: round2(driverPay),
    dispatchFee: round2(dispatchFee),
    tolls: round2(tolls),
    totalCost: round2(totalCost),
    netProfit: round2(netProfit),
    ratePerMile: round2(ratePerMile),
    profitPercent: round2(profitPercent),
    loadedMiles,
    deadheadMiles,
    totalMiles,
  };
}

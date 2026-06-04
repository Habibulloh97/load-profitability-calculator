import User from "../models/User.js";
import Load from "../models/Load.js";
import getFuelPrice from "./fuelService.js";
import claculateBreakDown from "../calc/calculateBreakdown.js";

export async function createLoad(
  accountId,
  rate,
  loadedMiles,
  deadheadMiles,
  tolls,
  driverType,
  mpg,
) {
  const user = await User.findOne({ _id: accountId });
  const { dispatchRates, maintenanceRates, companyDriverPay } = user;
  const averageFuel = await getFuelPrice();
  const finalMpg = mpg || 6.5;
  const breakdown = claculateBreakDown({
    rate,
    loadedMiles,
    deadheadMiles,
    dispatchRates,
    companyDriverPay,
    driverType,
    averageFuel,
    maintenanceRate: maintenanceRates.lease,
    tolls,
    mpg: finalMpg,
  });
  return await Load.create({
    accountId,
    driverType,
    loadedMiles,
    deadheadMiles,
    rate,
    fuelPricePerGallon: averageFuel,
    tollsEstimate: tolls,
    status: "draft",
    breakdown,
  });
}

export async function loadList(accountId) {
  return await Load.find({ accountId });
}

export async function getLoad(id, accountId) {
  return await Load.findOne({ _id: id, accountId });
}

export async function deleteLoad(id, accountId) {
  return await Load.findOneAndDelete({ _id: id, accountId });
}

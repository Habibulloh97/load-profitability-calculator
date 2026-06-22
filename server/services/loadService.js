import User from "../models/User.js";
import Load from "../models/Load.js";
import getFuelPrice from "./fuelService.js";
import claculateBreakDown from "../calc/calculateBreakdown.js";

export async function createLoad({
  accountId,
  rate,
  loadedMiles,
  deadheadMiles,
  tolls,
  driverType,
  mpg,
  stops,
  driverCurrentLocation,
  deadheadMilesGeometry,
  loadedMilesGeometry,
}) {
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
    stops,
    driverCurrentLocation,
    loadedMiles,
    deadheadMiles,
    deadheadMilesGeometry,
    loadedMilesGeometry,
    rate,
    fuelPricePerGallon: averageFuel,
    tollsEstimate: tolls,
    status: "draft",
    breakdown,
  });
}

export async function loadList(
  accountId,
  page = 1,
  limit = 25,
  driverId = null,
) {
  const filter = { accountId };
  if (driverId) filter.driverId = driverId;
  const skip = (page - 1) * limit;
  const [loads, total] = await Promise.all([
    Load.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Load.countDocuments(filter),
  ]);
  return { loads, total };
}

export async function getLoad(id, accountId) {
  return await Load.findOne({ _id: id, accountId });
}

export async function updateLoad(id, accountId, updates) {
  return await Load.findOneAndUpdate(
    { _id: id, accountId },
    { $set: updates },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );
}

export async function deleteLoad(id, accountId) {
  return await Load.findOneAndDelete({ _id: id, accountId });
}

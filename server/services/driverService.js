import Driver from "../models/Driver.js";

export async function createDriver({ name, type, accountId, truckId }) {
  return await Driver.create({ name, type, accountId, truckId });
}

export async function listDrivers(accountId) {
  return await Driver.find({ accountId }).populate("truckId");
}

export async function getDriver(id, accountId) {
  return await Driver.findOne({ _id: id, accountId });
}

export async function updateDriver(id, accountId, updates) {
  return await Driver.findOneAndUpdate(
    { _id: id, accountId },
    { $set: updates },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );
}

export async function deleteDriver(id, accountId) {
  return await Driver.findOneAndDelete({ _id: id, accountId });
}

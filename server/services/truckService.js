import Truck from "../models/Truck.js";

export async function createTruck({ number, mpg, accountId }) {
  return await Truck.create({ number, mpg, accountId });
}

export async function listTrucks(accountId) {
  return await Truck.find({ accountId });
}

export async function getTruck(id, accountId) {
  return await Truck.findOne({ _id: id, accountId });
}

export async function updateTruck(id, accountId, updates) {
  return await Truck.findOneAndUpdate({ _id: id, accountId }, updates, {
    new: true,
    runValidators: true,
  });
}

export async function deleteTruck(id, accountId) {
  return await Truck.findOneAndDelete({ _id: id, accountId });
}

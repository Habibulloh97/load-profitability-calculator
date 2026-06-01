import mongoose from "mongoose";

const fuelSchema = new mongoose.Schema({
  pricePerGallon: { type: Number, required: true },
  fetchedAt: { type: Date, default: Date.now },
});

const Fuel = mongoose.model("Fuel", fuelSchema);

export default Fuel;

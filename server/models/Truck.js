import mongoose from "mongoose";

const TruckSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    mpg: { type: Number, required: true },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
TruckSchema.index({ accountId: 1, number: 1 }, { unique: true });
const Truck = mongoose.model("Truck", TruckSchema);
export default Truck;

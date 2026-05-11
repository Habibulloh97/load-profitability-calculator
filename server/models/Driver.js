import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["company", "lease", "ownerOp"],
      required: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    truckId: { type: mongoose.Schema.Types.ObjectId, ref: "Truck" },
  },
  { timestamps: true },
);
DriverSchema.index({ accountId: 1 });
const Driver = mongoose.model("Driver", DriverSchema);

export default Driver;

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    dispatchRates: {
      lease: { type: Number, default: 0.15 },
      ownerOp: { type: Number, default: 0.12 },
    },
    maintenanceRates: {
      // Maintenance fee is only charged from lease drivers
      lease: { type: Number, default: 0.15 },
    },
    companyDriverPay: {
      payType: {
        type: String,
        enum: ["cpm", "percentage"],
        default: "cpm",
      },
      cpm: { type: Number, default: 0.55 },
      percentage: { type: Number, default: 0.3 },
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;

import mongoose from "mongoose";
const LocationSchema = new mongoose.Schema({
  address: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
});

const LoadSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: function () {
        return this.status !== "draft";
      },
    },
    driverType: {
      type: String,
      enum: ["company", "lease", "ownerOp"],
      required: true,
    },
    driverCurrentLocation: { type: LocationSchema },
    stops: {
      type: [LocationSchema],
      validate: {
        validator: function (arr) {
          return arr.length >= 2;
        },
        message: "A load must have at least one pickup and delivery address",
      },
    },
    bolNumber: {
      type: String,
      required: function () {
        return this.status === "accepted";
      },
    },
    loadedMiles: {
      type: Number,
      required: true,
    },
    loadedMilesGeometry: { type: String, required: true },
    deadheadMiles: {
      type: Number,
      default: 0,
    },
    deadheadMilesGeometry: { type: String, required: true },
    rate: { type: Number, required: true },
    fuelPricePerGallon: { type: Number, required: true },
    tollsEstimate: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "accepted"],
      default: "draft",
    },
    breakdown: {
      fuel: { type: Number },
      maintenance: { type: Number },
      driverPay: { type: Number },
      dispatchFee: { type: Number },
      tolls: { type: Number },
      totalCost: { type: Number },
      netProfit: { type: Number },
      ratePerMile: { type: Number },
      profitPercent: { type: Number },
      loadedMiles: { type: Number },
      deadheadMiles: { type: Number },
      totalMiles: { type: Number },
    },
  },
  { timestamps: true },
);
LoadSchema.index({ accountId: 1, createdAt: -1 });

const Load = mongoose.model("Load", LoadSchema);

export default Load;

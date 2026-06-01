import claculateBreakDown from "./calculateBreakdown.js";
import { test, expect } from "vitest";

test("ownerOp test", () => {
  const result = claculateBreakDown({
    rate: 2000, // rate
    loadedMiles: 900, // loadedMiles
    deadheadMiles: 100, // deadHeadMiles
    dispatchRates: { ownerOp: 0.1, lease: 0.15 }, // dispatchRates
    companyDriverPay: { payType: "cpm", cpm: 0.5, percentage: 0.3 }, // companyDriverPay
    driverType: "ownerOp", // driverType
    mpg: 7, // mpg
    averageFuel: 4.3, // averageFuel
    maintenanceRate: 0.15, // maintenanceRate
    tolls: 50,
  });
  expect(result.maintenance).toBe(0);
  expect(result.driverPay).toBe(0);
  expect(result.netProfit).toBeCloseTo(1135.71);
});

test("lease test", () => {
  const result = claculateBreakDown({
    rate: 2000, // rate
    loadedMiles: 900, // loadedMiles
    deadheadMiles: 100, // deadHeadMiles
    dispatchRates: { ownerOp: 0.1, lease: 0.15 }, // dispatchRates
    companyDriverPay: { payType: "cpm", cpm: 0.5, percentage: 0.3 }, // companyDriverPay
    driverType: "lease", // driverType
    mpg: 7, // mpg
    averageFuel: 4.3, // averageFuel
    maintenanceRate: 0.15, // maintenanceRate
    tolls: 50,
  });
  expect(result.maintenance).toBe(150);
});

test("company driver cpm", () => {
  const result = claculateBreakDown({
    rate: 2000, // rate
    loadedMiles: 900, // loadedMiles
    deadheadMiles: 100, // deadHeadMiles
    dispatchRates: { ownerOp: 0.1, lease: 0.15 }, // dispatchRates
    companyDriverPay: { payType: "cpm", cpm: 0.5, percentage: 0.3 }, // companyDriverPay
    driverType: "company", // driverType
    mpg: 7, // mpg
    averageFuel: 4.3, // averageFuel
    maintenanceRate: 0.15, // maintenanceRate
    tolls: 50,
  });
  expect(result.driverPay).toBe(500);
  expect(result.dispatchFee).toBe(0);
});

test("company driver percentage", () => {
  const result = claculateBreakDown({
    rate: 2000, // rate
    loadedMiles: 900, // loadedMiles
    deadheadMiles: 100, // deadHeadMiles
    dispatchRates: { ownerOp: 0.1, lease: 0.15 }, // dispatchRates
    companyDriverPay: { payType: "percentage", cpm: 0.5, percentage: 0.3 }, // companyDriverPay
    driverType: "company", // driverType
    mpg: 7, // mpg
    averageFuel: 4.3, // averageFuel
    maintenanceRate: 0.15, // maintenanceRate
    tolls: 50,
  });
  expect(result.driverPay).toBe(600);
  expect(result.dispatchFee).toBe(0);
});

test("negative profit on bad load", () => {
  const result = claculateBreakDown({
    rate: 500, // rate
    loadedMiles: 1900, // loadedMiles
    deadheadMiles: 100, // deadHeadMiles
    dispatchRates: { ownerOp: 0.1, lease: 0.15 }, // dispatchRates
    companyDriverPay: { payType: "percentage", cpm: 0.5, percentage: 0.3 }, // companyDriverPay
    driverType: "ownerOp", // driverType
    mpg: 7, // mpg
    averageFuel: 4.3, // averageFuel
    maintenanceRate: 0.15, // maintenanceRate
    tolls: 50,
  });
  expect(result.netProfit).toBeLessThan(0);
});

test("zero miles throws", () => {
  expect(() =>
    claculateBreakDown({
      rate: 2000, // rate
      loadedMiles: 0, // loadedMiles
      deadheadMiles: 0, // deadHeadMiles
      dispatchRates: { ownerOp: 0.1, lease: 0.15 }, // dispatchRates
      companyDriverPay: { payType: "cpm", cpm: 0.5, percentage: 0.3 }, // companyDriverPay
      driverType: "ownerOp", // driverType
      mpg: 7, // mpg
      averageFuel: 4.3, // averageFuel
      maintenanceRate: 0.15, // maintenanceRate
      tolls: 50,
    }),
  ).toThrow();
});

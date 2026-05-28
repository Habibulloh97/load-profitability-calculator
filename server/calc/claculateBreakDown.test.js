import claculateBreakDown from "./calculateBreakdown.js";
import { test, expect } from "vitest";

test("ownerOp test", () => {
  const result = claculateBreakDown(
    2000, // rate
    1000, // totalMiles
    { ownerOp: 0.1, lease: 0.15 }, // dispatchRates
    { payType: "cpm", cpm: 0.5, percentage: 0.3 }, // companyDriverPay
    "ownerOp", // driverType
    7, // mpg
    4.3, // averageFuel
    0.15, // maintenanceRate
    50,
  );
  expect(result.maintenance).toBe(0);
  expect(result.driverPay).toBe(0);
  expect(result.netProfit).toBeCloseTo(1135.71);
});

test("lease test", () => {
  const result = claculateBreakDown(
    2000, // rate
    1000, // totalMiles
    { ownerOp: 0.1, lease: 0.15 }, // dispatchRates
    { payType: "cpm", cpm: 0.5, percentage: 0.3 }, // companyDriverPay
    "lease", // driverType
    7, // mpg
    4.3, // averageFuel
    0.15, // maintenanceRate
    50,
  );
  expect(result.maintenance).toBe(150);
});

test("company driver cpm", () => {
  const result = claculateBreakDown(
    2000, // rate
    1000, // totalMiles
    { ownerOp: 0.1, lease: 0.15 }, // dispatchRates
    { payType: "cpm", cpm: 0.5, percentage: 0.3 }, // companyDriverPay
    "company", // driverType
    7, // mpg
    4.3, // averageFuel
    0.15, // maintenanceRate
    50,
  );
  expect(result.driverPay).toBe(500);
  expect(result.dispatchFee).toBe(0);
});

test("company driver percentage", () => {
  const result = claculateBreakDown(
    2000, // rate
    1000, // totalMiles
    { ownerOp: 0.1, lease: 0.15 }, // dispatchRates
    { payType: "percentage", cpm: 0.5, percentage: 0.3 }, // companyDriverPay
    "company", // driverType
    7, // mpg
    4.3, // averageFuel
    0.15, // maintenanceRate
    50,
  );
  expect(result.driverPay).toBe(600);
  expect(result.dispatchFee).toBe(0);
});

test("negative profit on bad load", () => {
  const result = claculateBreakDown(
    500, // rate
    2000, // totalMiles
    { ownerOp: 0.1, lease: 0.15 },
    { payType: "cpm", cpm: 0.5, percentage: 0.3 },
    "ownerOp",
    7,
    4.3,
    0.15,
    50,
  );
  expect(result.netProfit).toBeLessThan(0);
});

test("zero miles throws", () => {
  expect(() =>
    claculateBreakDown(
      2000,
      0,
      { ownerOp: 0.1, lease: 0.15 },
      { payType: "cpm", cpm: 0.5, percentage: 0.3 },
      "ownerOp",
      7,
      4.3,
      0.15,
      0,
    ),
  ).toThrow();
});

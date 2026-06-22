import Load from "../models/Load.js";

export async function getWeeklyProfit(accountId, weekOffset = 0) {
  const boundary = new Date();
  const offset = (boundary.getDay() - 1 + 7) % 7;
  boundary.setDate(boundary.getDate() - offset - weekOffset * 7);
  boundary.setHours(0, 0, 0, 0);
  const endWeekBoundary = new Date(boundary);
  endWeekBoundary.setDate(endWeekBoundary.getDate() + 7);

  const result = await Load.aggregate([
    {
      $match: {
        accountId,
        createdAt: { $gte: boundary, $lt: endWeekBoundary },
        status: { $ne: "draft" },
      },
    },
    {
      $group: {
        _id: {
          $cond: {
            if: { $eq: ["$driverType", "company"] },
            then: "company",
            else: "other",
          },
        },
        companyProfit: {
          $sum: {
            $cond: {
              if: { $eq: ["$driverType", "company"] },
              then: "$breakdown.netProfit",
              else: "$breakdown.dispatchFee",
            },
          },
        },
      },
    },
  ]);
  return result;
}

export async function getLoadCount(accountId, weekOffset = 0) {
  const boundary = new Date();
  const offset = (boundary.getDay() - 1 + 7) % 7;
  boundary.setDate(boundary.getDate() - offset - weekOffset * 7);
  boundary.setHours(0, 0, 0, 0);
  const endWeekBoundary = new Date(boundary);
  endWeekBoundary.setDate(endWeekBoundary.getDate() + 7);

  const total = await Load.countDocuments({
    accountId,
    createdAt: { $gte: boundary, $lt: endWeekBoundary },
    status: { $ne: "draft" },
  });
  return total;
}

export async function getAverageRpm(accountId, weekOffset = 0) {
  const boundary = new Date();
  const offset = (boundary.getDay() - 1 + 7) % 7;
  boundary.setDate(boundary.getDate() - offset - weekOffset * 7);
  boundary.setHours(0, 0, 0, 0);
  const endWeekBoundary = new Date(boundary);
  endWeekBoundary.setDate(endWeekBoundary.getDate() + 7);
  const result = await Load.aggregate([
    {
      $match: {
        accountId,
        createdAt: { $gte: boundary, $lt: endWeekBoundary },
        status: { $ne: "draft" },
      },
    },
    {
      $group: {
        _id: null,
        avgRpm: { $avg: { $divide: ["$rate", "$loadedMiles"] } },
      },
    },
    { $addFields: { avgRpm: { $round: ["$avgRpm", 2] } } },
  ]);
  return result;
}

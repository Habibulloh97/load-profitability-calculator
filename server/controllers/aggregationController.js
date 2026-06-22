import {
  getWeeklyProfit,
  getLoadCount,
  getAverageRpm,
} from "../services/aggregationService.js";

export async function getCompanyProfit(req, res) {
  try {
    const weeklyOffset = Number(req.query.weekOffset) || 0;
    const profit = await getWeeklyProfit(req.user._id, weeklyOffset);
    if (profit.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(profit);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
  }
}

export async function loadCount(req, res) {
  try {
    const weeklyOffset = Number(req.query.weekOffset) || 0;
    const count = await getLoadCount(req.user._id, weeklyOffset);

    return res.status(200).json(count);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
  }
}

export async function averageRpm(req, res) {
  try {
    const weeklyOffset = Number(req.query.weekOffset) || 0;
    const rpm = await getAverageRpm(req.user._id, weeklyOffset);
    if (rpm.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(rpm);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
  }
}

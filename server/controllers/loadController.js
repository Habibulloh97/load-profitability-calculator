import { createLoad } from "../services/loadService.js";

import User from "../models/User.js";

export async function create(req, res) {
  try {
    const accountId = req.user._id;
    const { driverType } = req.body;
    const rate = Number(req.body.rate);
    const loadedMiles = Number(req.body.loadedMiles);
    const deadheadMiles = Number(req.body.deadheadMiles);
    const tolls = Number(req.body.tolls);
    const mpg = Number(req.body.mpg);
    if (!rate || !loadedMiles || !driverType) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const load = await createLoad(
      accountId,
      rate,
      loadedMiles,
      deadheadMiles,
      tolls,
      driverType,
      mpg,
    );
    return res.status(201).json(load);
  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Server Error" });
  }
}

import {
  createLoad,
  loadList,
  getLoad,
  deleteLoad,
} from "../services/loadService.js";
import {
  fetchAddress,
  calculateRouteMiles,
} from "../api/integrations/mapbox.js";

import User from "../models/User.js";
import { listDrivers } from "../services/driverService.js";

export async function create(req, res) {
  try {
    const accountId = req.user._id;
    const { driverType } = req.body;
    const stops = req.body.stops;
    const rate = Number(req.body.rate);
    const driverCurrentLocation = req.body.driverCurrentLocation;
    const tolls = Number(req.body.tolls);
    const mpg = Number(req.body.mpg);
    if (!rate || !driverType || !stops) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const geocoded = await Promise.all(stops.map((s) => fetchAddress(s)));
    const driverLocationGeocoded = await fetchAddress(driverCurrentLocation);
    const { miles: loadedMiles, geometry: loadedMilesGeometry } =
      await calculateRouteMiles(geocoded);
    const { miles: deadheadMiles, geometry: deadheadMilesGeometry } =
      await calculateRouteMiles([driverLocationGeocoded, geocoded[0]]);
    const load = await createLoad({
      accountId,
      rate,
      loadedMiles,
      deadheadMiles,
      tolls,
      driverType,
      mpg,
      stops: geocoded,
      driverCurrentLocation: driverLocationGeocoded,
      deadheadMilesGeometry,
      loadedMilesGeometry,
    });
    return res.status(201).json(load);
  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Server Error" });
  }
}

export async function list(req, res) {
  try {
    const loads = await loadList(req.user.id);
    return res.status(200).json(loads);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server Error" });
  }
}

export async function get(req, res) {
  try {
    const id = req.params.id;
    const accountId = req.user.id;
    const load = await getLoad(id, accountId);
    if (!load) return res.status(404).json({ error: "Not found!" });
    return res.status(200).json(load);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

export async function remove(req, res) {
  try {
    const id = req.params.id;
    const accountId = req.user.id;
    const removed = await deleteLoad(id, accountId);
    if (!removed) {
      return res.status(404).json({ error: "Not found" });
    }
    return res.status(204).end();
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid id format" });
    }
    return res.status(500).json({ error: "Server error" });
  }
}

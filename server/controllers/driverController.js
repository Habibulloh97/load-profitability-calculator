import {
  createDriver,
  listDrivers,
  getDriver,
  updateDriver,
  deleteDriver,
} from "../services/driverService.js";

export async function create(req, res) {
  try {
    const { name, type } = req.body;
    const truckId = req.body.truckId || undefined;
    if (!name || !type) {
      return res.status(400).json({ error: "Name and type required" });
    }
    const driver = await createDriver({
      name,
      type,
      truckId,
      accountId: req.user.id,
    });
    return res.status(201).json(driver);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function list(req, res) {
  try {
    const driversList = await listDrivers(req.user.id);
    return res.status(200).json(driversList);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function get(req, res) {
  try {
    const id = req.params.id;
    const accountId = req.user.id;
    const driver = await getDriver(id, accountId);
    if (!driver) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(driver);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function update(req, res) {
  try {
    const id = req.params.id;
    const accountId = req.user.id;
    const updates = req.body;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "Update field can't be empty" });
    }
    const updated = await updateDriver(id, accountId, updates);
    return res.status(200).json(updated);
  } catch (err) {
    if (err.name == "CastError") {
      return res.status(400).json({ error: "Invalid id format" });
    }
    console.error(err);
    return res.status(500).json("Server error");
  }
}
export async function remove(req, res) {
  try {
    const id = req.params.id;
    const accountId = req.user.id;
    const deleted = await deleteDriver(id, accountId);
    if (!deleted) {
      return res.status(404).json({ error: "Not found" });
    }
    return res.status(204).end();
  } catch (err) {
    if (err.name == "CastError") {
      return res.status(400).json({ error: "Invalid id format" });
    }
    return res.status(500).json({ error: "Server error" });
  }
}

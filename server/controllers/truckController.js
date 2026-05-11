import {
  createTruck,
  listTrucks,
  getTruck,
  updateTruck,
  deleteTruck,
} from "../services/truckService.js";

export async function create(req, res) {
  try {
    const { number, mpg } = req.body;
    if (!number || !mpg) {
      return res.status(400).json({ error: "Truck number and mpg required" });
    }
    const truck = await createTruck({
      number,
      mpg,
      accountId: req.user.id,
    });
    return res.status(201).json(truck);
  } catch (err) {
    const DUPLICATE_KEY_ERROR = 11000;
    if (err.code === DUPLICATE_KEY_ERROR) {
      return res.status(409).json({ error: "Truck already exists" });
    }
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function list(req, res) {
  try {
    const truckList = await listTrucks(req.user.id);
    return res.status(200).json(truckList);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function get(req, res) {
  try {
    const id = req.params.id;
    const accountId = req.user.id;
    const found = await getTruck(id, accountId);
    if (!found) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(found);
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
    if (updates.length < 1) {
      return res.status(400).json({ error: "Update field can't be empty" });
    }
    const updated = await updateTruck(id, accountId, updates);
    return res.status(200).json(updated);
  } catch (err) {
    if (err.name == "CastError") {
      return res.status(400).json({ error: "Invalid id format" });
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: "Truck already exists" });
    }
    console.error(err);
    return res.status(500).json("Server error");
  }
}

export async function remove(req, res) {
  try {
    const id = req.params.id;
    const accountId = req.user.id;
    const removed = await deleteTruck(id, accountId);
    if (!removed) {
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

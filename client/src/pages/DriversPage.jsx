import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api.js";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export default function DriversPage() {
  const [data, setData] = useState([]);
  const [listError, setListError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "", truckId: "" });
  const [formError, setFormError] = useState("");
  const [open, setOpen] = useState(false);
  const [trucks, setTrucks] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);

  async function fetchDrivers() {
    setLoading(true);
    try {
      const res = await api.get("/api/drivers");
      setData(res.data);
    } catch (err) {
      setListError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrucks() {
    try {
      const res = await api.get("/api/trucks");
      setTrucks(res.data);
    } catch (err) {
      setListError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function addDriver(e) {
    e.preventDefault();
    setFormError("");
    if (!formData.name || !formData.type) {
      setFormError("Driver's Name and type is required");
      return;
    }
    try {
      await api.post("/api/drivers", {
        name: formData.name,
        type: formData.type,
        truckId: formData.truckId,
      });
      setOpen(false);
      fetchDrivers();
      setFormData({ name: "", type: "", truckId: "" });
    } catch (err) {
      setFormError(err.response?.data?.error || "Something went wrong");
    }
  }

  async function edit(e) {
    e.preventDefault();
    setFormError("");
    if (!formData.name && !formData.type) {
      setFormError("Driver's Name or Driver's Type is required");
      return;
    }
    try {
      await api.patch(`/api/drivers/${selectedDriver._id}`, {
        name: formData.name,
        type: formData.type,
        truckId:
          formData.truckId === "none" ? null : formData.truckId || undefined,
      });
      setOpen(false);
      fetchDrivers();
      setFormData({ name: "", type: "", truckId: "" });
      setSelectedDriver(null);
    } catch (err) {
      setFormError(err.response?.data?.error || "Something went wrong");
    }
  }
  async function remove(id) {
    try {
      await api.delete(`/api/drivers/${id}`);
      fetchDrivers();
    } catch (err) {
      setListError("Something Went Wrong");
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchDrivers();
    fetchTrucks();
  }, []);

  const navigate = useNavigate();
  const availableTrucks = trucks.filter(
    (t) =>
      !data.some(
        (d) => d.truckId?._id === t._id && d._id !== selectedDriver?._id,
      ),
  );
  return (
    <div>
      <h1 className="text-center text-2xl font-bold py-4">Drivers</h1>
      <div className="flex justify-end mb-4">
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val);
            setFormError("");
            setFormData({ name: "", type: "", truckId: "" });
          }}
        >
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>
              {selectedDriver ? "Edit Driver" : "Add Driver"}
            </DialogTitle>
            {selectedDriver ? (
              <form onSubmit={edit}>
                {formError && <p style={{ color: "red" }}>{formError}</p>}
                <div className="flex flex-col gap-3">
                  <Input
                    type="text"
                    value={formData.name}
                    placeholder="Enter Driver's Name"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  ></Input>

                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select Type"
                        value={formData.type}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="lease">Lease Driver</SelectItem>
                      <SelectItem value="ownerOp">Owner Operator</SelectItem>
                    </SelectContent>
                  </Select>
                  {trucks.length > 0 && (
                    <Select
                      value={formData.truckId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, truckId: value })
                      }
                      disabled={availableTrucks.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            availableTrucks.length === 0
                              ? "No trucks available"
                              : "Select Truck"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDriver?.truckId?._id && (
                          <SelectItem value="none">Unassign</SelectItem>
                        )}
                        {availableTrucks.map((t) => (
                          <SelectItem value={t._id} key={t._id}>
                            {t.number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button type="submit">Edit Driver</Button>
                </div>
              </form>
            ) : (
              <form onSubmit={addDriver}>
                {formError && <p style={{ color: "red" }}>{formError}</p>}
                <div className="flex flex-col gap-3">
                  <Input
                    placeholder="Enter Driver's Name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />

                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="lease">Lease Driver</SelectItem>
                      <SelectItem value="ownerOp">Owner Operator</SelectItem>
                    </SelectContent>
                  </Select>
                  {trucks.length > 0 && (
                    <Select
                      value={formData.truckId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, truckId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Truck" />
                      </SelectTrigger>
                      <SelectContent>
                        {trucks
                          .filter(
                            (t) => !data.some((d) => d.truckId?._id === t._id),
                          )
                          .map((t) => (
                            <SelectItem value={t._id} key={t._id}>
                              {t.number}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button type="submit">Add Driver</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Driver Name</TableHead>
            <TableHead>Driver Type</TableHead>
            <TableHead>Assigned Truck</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Detailed Info</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data &&
            data.map((d) => (
              <TableRow key={d._id}>
                <TableCell>{d.name}</TableCell>
                <TableCell>
                  {d.type === "company"
                    ? "Company"
                    : d.type === "ownerOp"
                      ? "Owner Operator"
                      : "Lease"}
                </TableCell>
                <TableCell>{d.truckId?.number ?? "Unassigned"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Pencil
                      onClick={() => {
                        setSelectedDriver(d);
                        setFormData({
                          name: d.name,
                          type: d.type,
                          truckId: d.truckId?._id,
                        });
                        setOpen(true);
                      }}
                      size={16}
                    />
                    <Trash2 size={16} onClick={() => remove(d._id)} />
                  </div>
                </TableCell>
                <TableCell>
                  <ChevronRight
                    className="cursor-pointer"
                    onClick={() => navigate(`/drivers/${d._id}`)}
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {loading && <p>Loading...</p>}
      {listError && <p>{listError}</p>}
    </div>
  );
}

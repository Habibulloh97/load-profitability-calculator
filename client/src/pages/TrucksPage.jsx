import { useState, useEffect } from "react";
import api from "@/lib/api.js";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table";

export default function TrucksPage() {
  const [data, setData] = useState([]);
  const [listError, setListError] = useState("");
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ number: "", mpg: "" });
  const [selectedTruck, setSelectedTruck] = useState(null);

  async function fetchTrucks() {
    try {
      const res = await api.get("/api/trucks");
      console.log(res.data);
      setData(res.data);
    } catch (err) {
      setListError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    setLoading(true);
    fetchTrucks();
  }, []);

  async function addTruck(e) {
    e.preventDefault();
    setFormError("");
    if (!formData.number || !formData.mpg) {
      setFormError("Truck Number and Truck MPG required");
      return;
    }
    try {
      const res = await api.post("/api/trucks", {
        number: Number(formData.number),
        mpg: Number(formData.mpg),
      });
      setOpen(false);
      fetchTrucks();
      setFormData({ number: "", mpg: "" });
    } catch (err) {
      setFormError(err.response?.data?.error || "Something went wrong");
    }
  }

  async function edit(e) {
    e.preventDefault();
    setFormError("");
    if (!formData.number && !formData.mpg) {
      setFormError("Truck Number or Truck MPG required");
      return;
    }
    try {
      const res = await api.patch(`/api/trucks/${selectedTruck._id}`, {
        number: Number(formData.number),
        mpg: Number(formData.mpg),
      });
      setOpen(false);
      fetchTrucks();
      setFormData({ number: "", mpg: "" });
      setSelectedTruck(null);
    } catch (err) {
      setFormError(err.response?.data?.error || "Something went wrong");
    }
  }
  async function remove(id) {
    try {
      await api.delete(`/api/trucks/${id}`);
      fetchTrucks();
    } catch (err) {
      setListError("Something went wrong");
    }
  }
  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          setFormError("");
          setSelectedTruck(null);
        }}
      >
        <DialogTrigger asChild>
          <Button>Add Truck</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>
            {selectedTruck ? "Edit Truck" : "Add Truck"}
          </DialogTitle>
          {selectedTruck ? (
            <form onSubmit={edit}>
              {formError && <p style={{ color: "red" }}>{formError}</p>}
              <div className="flex flex-col gap-3">
                <Input
                  placeholder="Enter Truck Number"
                  type="number"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                />
                <Input
                  placeholder="Enter Truck MPG"
                  type="number"
                  value={formData.mpg}
                  onChange={(e) =>
                    setFormData({ ...formData, mpg: e.target.value })
                  }
                />
                <Button type="submit">Edit Truck</Button>
              </div>
            </form>
          ) : (
            <form onSubmit={addTruck}>
              {formError && <p style={{ color: "red" }}>{formError}</p>}
              <div className="flex flex-col gap-3">
                <Input
                  placeholder="Enter Truck Number"
                  type="number"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                />
                <Input
                  placeholder="Enter Truck MPG"
                  type="number"
                  value={formData.mpg}
                  onChange={(e) =>
                    setFormData({ ...formData, mpg: e.target.value })
                  }
                />
                <Button type="submit">Add Truck</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <h2>Truck List</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Truck Number</TableHead>
            <TableHead>Truck MPG</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data &&
            data.map((d) => (
              <TableRow key={d._id}>
                <TableCell>{d.number}</TableCell>
                <TableCell>{d.mpg}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Pencil
                      onClick={() => {
                        setSelectedTruck(d);
                        setFormData({ number: d.number, mpg: d.mpg });
                        setOpen(true);
                      }}
                      size={16}
                    />
                    <Trash2 size={16} onClick={() => remove(d._id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {listError && <p style={{ color: "red" }}>{listError}</p>}
      {loading && <p>Loading...</p>}
    </div>
  );
}

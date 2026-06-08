import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
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

export default function LoadListPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchLoads() {
    try {
      const res = await api.get("/api/loads");
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    try {
      await api.delete(`/api/loads/${id}`);
      console.log("deleting", id);
      fetchLoads();
    } catch (err) {
      setError("Something went wrong");
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchLoads();
  }, []);

  const navigate = useNavigate();

  return (
    <div>
      {loading && <p>Loading ...</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Loaded Miles</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Rate Per Mile</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Full Info</TableHead>
            <TableHead>Delete Load</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((d) => (
            <TableRow key={d._id}>
              <TableCell>
                {new Date(d.createdAt).toLocaleDateString("en-US")}
              </TableCell>
              <TableCell>{d.loadedMiles}</TableCell>
              <TableCell>${d.rate}</TableCell>
              <TableCell>${(d.rate / d.loadedMiles).toFixed(2)}</TableCell>
              <TableCell>
                {d.status === "draft" ? "Draft" : "Accepted"}
              </TableCell>
              <TableCell>
                <ChevronRight
                  className="cursor-pointer"
                  onClick={() => navigate(`/loads/${d._id}`)}
                />
              </TableCell>
              <TableCell>
                <Trash2
                  className="cursor-pointer"
                  onClick={() => remove(d._id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

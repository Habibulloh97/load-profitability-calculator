import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api.js";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ChevronLeft } from "lucide-react";

export default function DriverDetailPage() {
  const [driver, setDriver] = useState({});
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  async function getDriver() {
    try {
      const res = await api.get(`/api/drivers/${id}`);
      setDriver(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  }

  async function getLoads() {
    try {
      const res = await api.get(`/api/loads?driverId=${id}`);
      setLoads(res.data.loads);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  }

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        await Promise.all([getDriver(), getLoads()]);
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 flex flex-col gap-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground w-fit"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm">
            {driver.name?.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-base">{driver.name}</p>
            <p className="text-sm text-muted-foreground">
              {driver.type === "company"
                ? "Company"
                : driver.type === "ownerOp"
                  ? "Owner Operator"
                  : "Lease"}{" "}
              · {driver.truckId?.number ?? "No truck assigned"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3">Loads</p>
          {loads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No loads found for this driver.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BOL</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Miles</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>RPM</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loads.map((load) => (
                  <TableRow
                    key={load._id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/loads/${load._id}`)}
                  >
                    <TableCell>
                      {load.bolNumber ?? "Not yet dispatched"}
                    </TableCell>
                    <TableCell>
                      {new Date(load.createdAt).toLocaleDateString("en-US")}
                    </TableCell>
                    <TableCell>{load.loadedMiles} mi</TableCell>
                    <TableCell>${load.rate}</TableCell>
                    <TableCell>${load.breakdown.ratePerMile}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md ${
                          load.status === "dispatched"
                            ? "bg-green-100 text-green-700"
                            : load.status === "booked"
                              ? "bg-yellow-100 text-yellow-700"
                              : load.status === "assigned"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {load.status.charAt(0).toUpperCase() +
                          load.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

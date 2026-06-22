import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api.js";
import { Button } from "@/components/ui/button";
import { buildMapUrl } from "@/lib/mapbox.js";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LoadDetailPage() {
  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [action, setAction] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const { id } = useParams();
  async function fetchLoad() {
    try {
      const res = await api.get(`/api/loads/${id}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchLoad();
  }, []);

  useEffect(() => {
    async function fetchDrivers() {
      const res = await api.get("/api/drivers");
      setDrivers(res.data);
    }
    fetchDrivers();
  }, []);
  async function updateLoadStatus(updates) {
    try {
      const res = await api.patch(`/api/loads/${data._id}`, updates);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  }
  const navigate = useNavigate();
  if (loading || !data.breakdown) return <p>Loading...</p>;
  return (
    <div className="p-6 flex flex-col gap-6">
      <button
        className="flex items-center gap-2 text-sm text-muted-foreground w-fit"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>
      <Card className=" max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            Full Load Info {data.bolNumber && `for load: ${data.bolNumber}`}
          </CardTitle>
          <CardDescription>
            This load was calculated for a{" "}
            <strong>
              {data.driverId
                ? drivers.find((d) => d._id === data.driverId)?.name + "."
                : data.driverType + " " + "driver."}{" "}
            </strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <img src={buildMapUrl(data)} className="w-full rounded-md" />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Driver's Current Loaction
              </span>
              <span className="font-semibold">
                {data.driverCurrentLocation?.address}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pick Up Address</span>
              <span className="font-semibold">{data.stops[0].address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Delivery Adrress(es)
              </span>
              {data.stops.slice(1).map((stop, i) => (
                <span key={i} className="font-semibold">
                  {stop.address}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Load Rate</span>
              <span className="font-semibold">${data.rate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Load RPM</span>
              <span className="font-semibold">
                ${data.breakdown.ratePerMile}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Net Profit</span>
              <span className="font-semibold">${data.breakdown.netProfit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit %</span>
              <span className="font-semibold">
                {data.breakdown.profitPercent}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Expenses</span>
              <span className="font-semibold">${data.breakdown.totalCost}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Miles</span>
            <span className="font-semibold">
              {data.breakdown.totalMiles} Miles
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deadhead Miles</span>
              <span className="font-semibold">{data.deadheadMiles} Miles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loaded Miles</span>
              <span className="font-semibold">{data.loadedMiles} Miles</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {data.driverType === "company" ? "Driver Pay" : "Dispatch Pay"}
            </span>
            <span className="font-semibold">
              $
              {data.driverType === "company"
                ? data.breakdown.driverPay
                : data.breakdown.dispatchFee}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Fuel Cost (Based on national average)
            </span>
            <span className="font-semibold">${data.breakdown.fuel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Maintenance Fee Cost</span>
            <span className="font-semibold">${data.breakdown.maintenance}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tolls</span>
            <span className="font-semibold">${data.breakdown.tolls}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setActionOpen(true)}
          >
            Action
          </Button>
        </CardFooter>
      </Card>
      <>
        <Dialog open={actionOpen} onOpenChange={setActionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Load Actions</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <Button
                variant={action === "assign" ? "default" : "outline"}
                onClick={() => setAction("assign")}
              >
                Assign Driver
              </Button>
              <Button
                variant={action === "book" ? "default" : "outline"}
                onClick={() => setAction("book")}
              >
                Book Load
              </Button>
              <Button
                variant={action === "dispatch" ? "default" : "outline"}
                onClick={() => setAction("dispatch")}
              >
                Dispatch
              </Button>
            </div>

            {action === "assign" && (
              <Select
                onValueChange={(id) =>
                  setSelectedDriver(drivers.find((d) => d._id === id))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {action === "book" && (
              <Input
                placeholder="Enter BOL number (Optional)"
                value={data.bolNumber || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    bolNumber: e.target.value,
                  }))
                }
              />
            )}

            {action === "dispatch" && (
              <div className="flex flex-col gap-3">
                <Input
                  placeholder="Enter BOL number"
                  value={data.bolNumber || ""}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      bolNumber: e.target.value,
                    }))
                  }
                />
                <Select
                  onValueChange={(id) =>
                    setSelectedDriver(drivers.find((d) => d._id === id))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((d) => (
                      <SelectItem key={d._id} value={d._id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              className="w-full mt-2"
              disabled={
                !action ||
                (action === "assign" && !selectedDriver) ||
                (action === "dispatch" && (!data.bolNumber || !selectedDriver))
              }
              onClick={async () => {
                const payloads = {
                  assign: {
                    driverId: selectedDriver?._id,
                    status: "assigned",
                  },
                  book: {
                    bolNumber: data.bolNumber,
                    status: "booked",
                  },
                  dispatch: {
                    bolNumber: data.bolNumber,
                    driverId: selectedDriver?._id,
                    status: "dispatched",
                  },
                };
                await updateLoadStatus(payloads[action]);
                setActionOpen(false);
              }}
            >
              Confirm
            </Button>
          </DialogContent>
        </Dialog>
      </>
    </div>
  );
}

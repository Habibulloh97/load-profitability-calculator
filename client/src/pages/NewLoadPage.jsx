import { useState, useRef, useEffect, act } from "react";
import { SearchBox } from "@mapbox/search-js-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { buildMapUrl } from "@/lib/mapbox.js";

import api from "@/lib/api.js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function NewLoadPage() {
  const [formData, setFormData] = useState({
    driverId: null,
    rate: "",
    tolls: 0,
    driverType: "",
    mpg: 6.5,
    stops: [null, null],
    driverCurrentLocation: null,
    bolNumber: null,
  });
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const [open, setOPen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [loadResult, setLoadResult] = useState(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [action, setAction] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef([]);

  async function createLoad(e) {
    e.preventDefault();
    setError("");
    const hasNullStops = formData.stops.some((s) => s === null);
    if (!formData.rate || !formData.driverType || hasNullStops) {
      setError("All fields are required");
      return;
    }
    try {
      const res = await api.post("/api/loads", {
        rate: formData.rate,
        driverType: formData.driverType,
        tolls: formData.tolls,
        stops: formData.stops,
        mpg: formData.mpg,
        driverCurrentLocation: formData.driverCurrentLocation,
      });
      setLoadResult(res.data);
      setOPen(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  }
  function updateStop(index, res) {
    setFormData((prev) => ({
      ...prev,
      stops: prev.stops.map((s, i) =>
        i === index
          ? {
              address: res.features[0].properties.full_address,
              lat: res.features[0].properties.coordinates.latitude,
              lng: res.features[0].properties.coordinates.longitude,
            }
          : s,
      ),
    }));
  }

  async function updateLoadStatus(updates) {
    try {
      const res = await api.patch(`/api/loads/${loadResult._id}`, updates);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  }

  useEffect(() => {
    async function fetchDrivers() {
      const res = await api.get("/api/drivers");
      console.log(res.data);
      setDrivers(res.data);
    }
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard",
      center: [-98.5, 39.8],
      zoom: 3,
      accessToken: import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN,
    });
    mapRef.current = map;
    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    markerRef.current.forEach((m) => m.remove());
    markerRef.current = [];

    if (formData.driverCurrentLocation) {
      const marker = new mapboxgl.Marker({ color: "#3B8BD4" })
        .setLngLat([
          formData.driverCurrentLocation.lng,
          formData.driverCurrentLocation.lat,
        ])
        .addTo(mapRef.current);
      markerRef.current.push(marker);
    }
    formData.stops.forEach((stop) => {
      if (stop) {
        const marker = new mapboxgl.Marker({ color: "#FF0000" })
          .setLngLat([stop.lng, stop.lat])
          .addTo(mapRef.current);
        markerRef.current.push(marker);
      }
    });
  }, [formData.stops]);

  useEffect(() => {
    const validStops = formData.stops.filter((s) => s !== null);
    if (validStops.length < 2) return;

    async function fetchRoute() {
      const coordinates = validStops.map((s) => `${s.lng},${s.lat}`).join(";");
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN}`,
      );
      const data = await res.json();

      const route = data.routes[0].geometry;

      if (mapRef.current.getSource("route")) {
        mapRef.current.getSource("route").setData(route);
      } else {
        mapRef.current.addSource("route", {
          type: "geojson",
          data: route,
        });
        mapRef.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#f44",
            "line-width": 4,
          },
        });
      }

      if (formData.driverCurrentLocation && validStops.length > 0) {
        const deadheadCoords = `${formData.driverCurrentLocation.lng},${formData.driverCurrentLocation.lat};${validStops[0].lng},${validStops[0].lat}`;
        const dhRes = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${deadheadCoords}?geometries=geojson&access_token=${import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN}`,
        );
        const dhData = await dhRes.json();
        const dhroute = dhData.routes[0].geometry;
        if (mapRef.current.getSource("deadhead")) {
          mapRef.current.getSource("deadhead").setData(dhroute);
        } else {
          mapRef.current.addSource("deadhead", {
            type: "geojson",
            data: dhroute,
          });
          mapRef.current.addLayer({
            id: "deadhead",
            type: "line",
            source: "deadhead",
            paint: {
              "line-color": "#44f",
              "line-width": 4,
            },
          });
        }
      }
    }
    fetchRoute();
  }, [formData.stops]);

  return (
    <div className="flex h-screen">
      <div className="w-[400px] overflow-y-auto ">
        <Card className="w-full min-h-full border-2 rounded-none">
          <CardHeader>
            <CardTitle>Load Details</CardTitle>
            <CardDescription>
              Enter the load's financial and distance metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-full">
            <form
              onSubmit={createLoad}
              className="flex flex-col h-full space-y-4"
            >
              <div className="w-full">
                <label htmlFor="deadhead">
                  Enter Driver's Current Location (Optional)
                </label>
                <SearchBox
                  id="deadhead"
                  key={`deadhead-${resetKey}`}
                  accessToken={import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN}
                  options={{ types: "place", debounce: 300 }}
                  onRetrieve={(res) => {
                    setFormData((prev) => ({
                      ...prev,
                      driverCurrentLocation: {
                        address: res.features[0].properties.full_address,
                        lat: res.features[0].properties.coordinates.latitude,
                        lng: res.features[0].properties.coordinates.longitude,
                      },
                    }));
                  }}
                />
              </div>
              <div className="w-full">
                <label htmlFor="pickUp">Enter Pick Up Address</label>
                <div
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                >
                  <SearchBox
                    id="pickUp"
                    key={`pickup-${resetKey}`}
                    accessToken={import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN}
                    options={{ types: "place", debounce: 300 }}
                    onRetrieve={(res) => {
                      updateStop(0, res);
                    }}
                  />
                </div>
              </div>
              <div className="w-full">
                <label htmlFor="delivery">Enter Delivery Destanation</label>
                <div
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                >
                  <SearchBox
                    id="delivery"
                    key={`delivery-${resetKey}`}
                    accessToken={import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN}
                    options={{ types: "place", debounce: 300 }}
                    onRetrieve={(res) => {
                      updateStop(1, res);
                    }}
                  />
                </div>
              </div>
              <div className="w-full">
                {formData.stops.slice(2).map((stop, index) => (
                  <div key={index + 2} className="w-full">
                    <label htmlFor="stop">Enter Delivery Destanation</label>
                    <div
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.preventDefault();
                      }}
                    >
                      <SearchBox
                        id="stop"
                        accessToken={import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN}
                        options={{ types: "place", debounce: 300 }}
                        onRetrieve={(res) => {
                          updateStop(index + 2, res);
                        }}
                      />
                    </div>
                  </div>
                ))}
                <hr className="mt-3" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      stops: [...prev.stops, null],
                    }))
                  }
                >
                  <Plus className="w-4 h-4 mr-1" /> Add a stop
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-auto pt-4">
                <div className="space-y-2 col-span-2">
                  <Select
                    onValueChange={(id) => {
                      if (id === "none") {
                        setSelectedDriver(null);
                        setFormData((prev) => ({ ...prev, driverType: "" }));
                        return;
                      }
                      const driver = drivers.find((d) => d._id === id);
                      setSelectedDriver(driver);
                      setFormData((prev) => ({
                        ...prev,
                        driverType: driver.type,
                        mpg: driver.truckId?.mpg || prev.mpg,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a driver (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No driver</SelectItem>
                      {drivers.map((d) => (
                        <SelectItem key={d._id} value={d._id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate ($)</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={formData.rate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tolls">Tolls ($)</Label>
                  <Input
                    id="tolls"
                    type="number"
                    value={formData.tolls}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tolls: e.target.value,
                      }))
                    }
                  />
                </div>
                {!selectedDriver?.truckId?.mpg && (
                  <div className="space-y-2">
                    <Label htmlFor="tolls">MPG (Optional) </Label>
                    <Input
                      id="tolls"
                      type="number"
                      value={formData.mpg}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          mpg: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                <div className="space-y-2 col-span-2">
                  {!selectedDriver && (
                    <RadioGroup
                      className="flex gap-6"
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          driverType: value,
                        }))
                      }
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="company" id="company" />
                        <Label htmlFor="company">Company Driver</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="lease" id="lease" />
                        <Label htmlFor="lease">Lease Driver</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="ownerOp" id="ownerOP" />
                        <Label htmlFor="ownerOp">Owner Operator</Label>
                      </div>
                    </RadioGroup>
                  )}
                </div>
              </div>
              <Button type="submit">Calulate The Load</Button>
              <Button
                type="button"
                onClick={() => {
                  setFormData({
                    rate: "",
                    driverCurrentLocation: null,
                    stops: [null, null],
                    tolls: 0,
                    driverType: "",
                    mpg: 6.5,
                    bolNumber: null,
                  });
                  setResetKey((prev) => prev + 1);
                  if (mapRef.current.getSource("route")) {
                    mapRef.current.removeLayer("route");
                    mapRef.current.removeSource("route");
                  }
                  if (mapRef.current.getSource("deadhead")) {
                    mapRef.current.removeLayer("deadhead");
                    mapRef.current.removeSource("deadhead");
                  }
                }}
              >
                Reset
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div ref={mapContainer} className="flex-1" />
      {loadResult && (
        <Dialog open={open} onOpenChange={setOPen}>
          <DialogContent
            showCloseButton={true}
            className="!max-w-[75vw] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle>Full Load Breakdown</DialogTitle>
              <DialogDescription>
                {loadResult.driverCurrentLocation?.address} →{" "}
                {loadResult.stops[0].address} →{" "}
                {loadResult.stops[loadResult.stops.length - 1].address}
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-6">
              {/* LEFT — map */}
              <div className="flex-[2]">
                {console.log(buildMapUrl(loadResult))}
                <img
                  src={buildMapUrl(loadResult)}
                  className="w-full rounded-md"
                />
              </div>

              {/* RIGHT — profit first, details secondary */}
              <div className="flex-[1] flex flex-col gap-6">
                {/* PRIMARY */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Net Profit
                  </span>
                  <span className="text-3xl font-bold text-green-600">
                    ${loadResult.breakdown.netProfit}
                  </span>
                  <span className="text-lg font-semibold text-muted-foreground">
                    {loadResult.breakdown.profitPercent}% margin
                  </span>
                </div>

                {/* SECONDARY */}
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-medium">${loadResult.rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RPM</span>
                    <span className="font-medium">
                      ${loadResult.breakdown.ratePerMile}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Miles</span>
                    <span className="font-medium">
                      {loadResult.breakdown.totalMiles} mi
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deadhead</span>
                    <span className="font-medium">
                      {loadResult.deadheadMiles} mi
                    </span>
                  </div>
                </div>

                {/* TERTIARY */}
                <div className="flex flex-col gap-2 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Expenses
                    </span>
                    <span className="font-medium">
                      ${loadResult.breakdown.totalCost}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fuel</span>
                    <span className="font-medium">
                      ${loadResult.breakdown.fuel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tolls</span>
                    <span className="font-medium">
                      ${loadResult.tollsEstimate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maintenance</span>
                    <span className="font-medium">
                      ${loadResult.breakdown.maintenance}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {loadResult.driverType === "company"
                        ? "Driver Pay"
                        : "Dispatch Fee"}
                    </span>
                    <span className="font-medium">
                      $
                      {loadResult.driverType === "company"
                        ? loadResult.breakdown.driverPay
                        : loadResult.breakdown.dispatchFee}
                    </span>
                  </div>
                </div>
                <div className="mt-auto">
                  <Button
                    className="w-full"
                    onClick={() => setActionOpen(true)}
                  >
                    Actions
                  </Button>
                </div>
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
                          variant={
                            action === "dispatch" ? "default" : "outline"
                          }
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
                          value={formData.bolNumber || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
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
                            value={formData.bolNumber || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                bolNumber: e.target.value,
                              }))
                            }
                          />
                          <Select
                            onValueChange={(id) =>
                              setSelectedDriver(
                                drivers.find((d) => d._id === id),
                              )
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
                          (action === "dispatch" &&
                            (!formData.bolNumber || !selectedDriver))
                        }
                        onClick={() => setConfirmOpen(true)}
                      >
                        Confirm
                      </Button>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {action === "assign" &&
                            `Assign this load to ${selectedDriver?.name}?`}
                          {action === "book" && "Mark this load as booked?"}
                          {action === "dispatch" &&
                            `Dispatch to ${selectedDriver?.name} with BOL ${formData.bolNumber}?`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            const payloads = {
                              assign: {
                                driverId: selectedDriver?._id,
                                status: "assigned",
                              },
                              book: {
                                bolNumber: formData.bolNumber,
                                status: "booked",
                              },
                              dispatch: {
                                bolNumber: formData.bolNumber,
                                driverId: selectedDriver?._id,
                                status: "dispatched",
                              },
                            };
                            await updateLoadStatus(payloads[action]);
                            setConfirmOpen(false);
                            setActionOpen(false);
                            setOPen(false);
                          }}
                        >
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}{" "}
    </div>
  );
}

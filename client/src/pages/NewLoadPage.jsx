import { useState } from "react";

import api from "@/lib/api.js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Button } from "@/components/ui/button";

export default function NewLoadPage() {
  const [formData, setFormData] = useState({
    rate: "",
    loadedMiles: "",
    deadheadMiles: 0,
    tolls: 0,
    driverType: "",
    mpg: 6.5,
  });
  const [breakdown, setBreakDown] = useState({});
  const [open, setOPen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createLoad(e) {
    e.preventDefault();
    setError("");
    if (
      !formData.rate ||
      !formData.loadedMiles ||
      !formData.driverType ||
      !formData.driverType
    ) {
      setError("All fields are required");
      return;
    }
    try {
      const res = await api.post("/api/loads", {
        rate: formData.rate,
        loadedMiles: formData.loadedMiles,
        deadheadMiles: formData.deadheadMiles,
        driverType: formData.driverType,
        tolls: formData.tolls,
        mpg: formData.mpg,
      });
      setBreakDown(res.data.breakdown);
      setOPen(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  }
  return (
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Load Details</CardTitle>
          <CardDescription>
            Enter the load's financial and distance metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createLoad} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">Rate ($)</Label>
                <Input
                  id="rate"
                  type="number"
                  value={formData.rate}
                  onChange={(e) =>
                    setFormData({ ...formData, rate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loadedMiles">Loaded Miles</Label>
                <Input
                  id="loadedMiles"
                  type="number"
                  value={formData.loadedMiles}
                  onChange={(e) =>
                    setFormData({ ...formData, loadedMiles: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadheadMiles">Deadhead Miles</Label>
                <Input
                  id="deadheadMiles"
                  type="number"
                  value={formData.deadheadMiles}
                  onChange={(e) =>
                    setFormData({ ...formData, deadheadMiles: e.target.value })
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
                    setFormData({ ...formData, tolls: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 col-span-2">
                <RadioGroup
                  className="flex gap-6"
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      driverType: value,
                    })
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
              </div>
            </div>
            <Button type="submit">Calulate The Load</Button>
            <Button
              type="button"
              onClick={() =>
                setFormData({
                  rate: "",
                  loadedMiles: "",
                  deadheadMiles: 0,
                  tolls: 0,
                  driverType: "",
                  mpg: 6.5,
                })
              }
            >
              Reset
            </Button>
          </form>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOPen}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Full Load Breakdown</DialogTitle>
            <DialogDescription>
              Full cost and profit breakdown for this load:
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Load Rate</span>
              <span className="font-semibold">${formData.rate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Load RPM</span>
              <span className="font-semibold">${breakdown.ratePerMile}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Net Profit</span>
              <span className="font-semibold">${breakdown.netProfit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit %</span>
              <span className="font-semibold">{breakdown.profitPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Expenses</span>
              <span className="font-semibold">${breakdown.totalCost}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Miles</span>
            <span className="font-semibold">{breakdown.totalMiles}Miles</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deadhead Miles</span>
              <span className="font-semibold">
                {formData.deadheadMiles} Miles
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loaded Miles</span>
              <span className="font-semibold">
                {formData.loadedMiles} Miles
              </span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {formData.driverType === "company"
                ? "Driver Pay"
                : "Dispatch Pay"}
            </span>
            <span className="font-semibold">
              $
              {formData.driverType === "company"
                ? breakdown.driverPay
                : breakdown.dispatchFee}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Fuel Cost (Based on national average)
            </span>
            <span className="font-semibold">${breakdown.fuel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Maintenance Fee Cost</span>
            <span className="font-semibold">${breakdown.maintenance}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tolls</span>
            <span className="font-semibold">${formData.tolls}</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

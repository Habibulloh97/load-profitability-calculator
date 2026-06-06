import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api.js";
import { Button } from "@/components/ui/button";
import { buildMapUrl } from "@/lib/mapbox.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoadDetailPage() {
  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  async function fetchLoad() {
    try {
      const res = await api.get(`/api/loads/${id}`);
      setData(res.data);
      console.log(res.data);
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
  const navigate = useNavigate();
  if (loading || !data.breakdown) return <p>Loading...</p>;
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <button
        className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-200"
        onClick={() => navigate("/loads")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        Back
      </button>
      <Card className=" h-4xl w-2xl flex flex-col justify-center">
        <CardHeader>
          <CardTitle>Full Load Info</CardTitle>
          <CardDescription>
            This load was calculated for a <strong>{data.driverType} </strong>
            driver.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <img src={buildMapUrl(data)} className="w-full rounded-md" />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pick Up Address</span>
              <span className="font-semibold">{data.stops[0].address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deliver Adrress</span>
              <span className="font-semibold">{data.stops[1].address}</span>
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
          <Button variant="outline" size="sm" className="w-full">
            Action
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

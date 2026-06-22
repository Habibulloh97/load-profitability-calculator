import { useState, useEffect } from "react";
import api from "@/lib/api.js";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
export default function DashboardPage() {
  const [loadTotal, setLoadTotal] = useState(0);
  const [netProfit, setNetProfit] = useState([]);
  const [averageRpm, setAverageRpm] = useState([]);
  const [loadData, setLoadData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const [profitRes, countRes, rpmRes, loadsRes, offsetRes] =
          await Promise.all([
            api.get(`/api/aggregation/weekly-profit?weekOffset=${weekOffset}`),
            api.get(`/api/aggregation/load-count?weekOffset=${weekOffset}`),
            api.get(`/api/aggregation/avgrpm?weekOffset=${weekOffset}`),
            api.get("/api/loads?limit=10"),
            api.get(`/api/aggregation/weekly-profit?weekOffset=${weekOffset}`),
          ]);
        setLoadTotal(countRes.data);
        setNetProfit(profitRes.data);
        setAverageRpm(rpmRes.data);
        setLoadData(loadsRes.data.loads);
        setOffset(offsetRes);
      } catch (err) {
        setError(err.response?.data?.error || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [weekOffset]);
  const totalProfit = netProfit.reduce(
    (sum, item) => sum + item.companyProfit,
    0,
  );
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => setWeekOffset((prev) => prev + 1)}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-muted-foreground">
          {weekOffset === 0
            ? "This week"
            : `${weekOffset} week${weekOffset > 1 ? "s" : ""} ago`}
        </span>
        <button
          onClick={() => setWeekOffset((prev) => prev - 1)}
          disabled={weekOffset === 0}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-3">
        <Card className="flex-1">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Loads this week
            </p>
            <p className="text-2xl font-medium">
              {loadTotal <= 0 ? "No Load Booked" : loadTotal}
            </p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
            <p className="text-2xl font-medium">${totalProfit}</p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Avg RPM</p>
            <p className="text-2xl font-medium">
              ${averageRpm[0]?.avgRpm ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3">Recent loads</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Miles</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadData.map((d) => (
                <TableRow key={d._id}>
                  <TableCell>
                    {new Date(d.createdAt).toLocaleDateString("en-US")}
                  </TableCell>
                  <TableCell>{d.loadedMiles} mi</TableCell>
                  <TableCell>${d.rate}</TableCell>
                  <TableCell className="text-green-600">
                    ${d.breakdown.netProfit}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md ${
                        d.status === "assigned"
                          ? "bg-blue-100 text-blue-700"
                          : d.status === "dispatched"
                            ? "bg-green-100 text-green-700"
                            : d.status === "booked"
                              ? "bg-yellow-100 text-yellow-700"
                              : d.status === "draft"
                                ? "bg-red-100 text-red-700"
                                : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

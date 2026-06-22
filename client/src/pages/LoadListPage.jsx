import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import api from "@/lib/api.js";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function LoadListPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLoadIds, setSelectedLoadIds] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function fetchLoads() {
    try {
      const res = await api.get(`/api/loads?page=${page}`);
      setData(res.data.loads);
      setTotal(res.data.total);
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
  }, [page]);

  const navigate = useNavigate();

  return (
    <div>
      {loading && <p>Loading ...</p>}
      {error && <p>{error}</p>}
      <div>
        <h1 className="text-center text-2xl font-bold py-4">Loads</h1>
        <div className="flex justify-between px-4 pb-4">
          <Button
            onClick={() => {
              setSelectedLoadIds([]);
              setCompareMode(!compareMode);
            }}
          >
            {compareMode ? "Compare Mode Off" : "Compare Mode On"}
          </Button>
          {compareMode && selectedLoadIds.length >= 2 && (
            <Button onClick={() => setCompareOpen(true)}>
              Compare ({selectedLoadIds.length})
            </Button>
          )}
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {compareMode && <TableHead>Compare</TableHead>}
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
              {compareMode && (
                <TableCell>
                  <Checkbox
                    checked={selectedLoadIds.includes(d._id)}
                    disabled={
                      selectedLoadIds.length >= 4 &&
                      !selectedLoadIds.includes(d._id)
                    }
                    onCheckedChange={(checked) => {
                      setSelectedLoadIds((prev) =>
                        checked
                          ? [...prev, d._id]
                          : prev.filter((id) => id !== d._id),
                      );
                    }}
                  />
                </TableCell>
              )}
              <TableCell>
                {new Date(d.createdAt).toLocaleDateString("en-US")}
              </TableCell>
              <TableCell>{d.loadedMiles}</TableCell>
              <TableCell>${d.rate}</TableCell>
              <TableCell>${(d.rate / d.loadedMiles).toFixed(2)}</TableCell>
              <TableCell>
                {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
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
      <div className="flex items-center justify-center gap-4 py-4">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {Math.ceil(total / 25)}
        </span>
        <Button
          variant="outline"
          disabled={page === Math.ceil(total / 25)}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="!max-w-[90vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>Load Comparison</DialogHeader>

          <div className="flex gap-4">
            {data
              .filter((d) => selectedLoadIds.includes(d._id))
              .map((d) => (
                <Card key={d._id} className="flex-1">
                  <CardContent className="flex flex-col gap-2 text-sm pt-4">
                    <span className="font-bold text-sm">
                      {d.driverCurrentLocation?.address}→
                    </span>
                    {d.stops.map((stop, i) => (
                      <span key={i}>
                        {stop.address}
                        {i < d.stops.length - 1 ? "→" : ""}
                      </span>
                    ))}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Profit</span>
                      <span className="font-bold text-lg">
                        ${d.breakdown.netProfit}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {d.breakdown.profitPercent}% margin
                    </span>
                    <hr />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate</span>
                      <span>${d.rate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RPM</span>
                      <span>${d.breakdown.ratePerMile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Miles</span>
                      <span>{d.breakdown.totalMiles} mi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deadhead</span>
                      <span>{d.deadheadMiles} mi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fuel</span>
                      <span>${d.breakdown.fuel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span>
                        {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

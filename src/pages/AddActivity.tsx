import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTIVITY_TYPES, addActivity, calculateEmission, getSession } from "@/lib/carbonData";
import { toast } from "sonner";

export default function AddActivity() {
  const navigate = useNavigate();
  const session = getSession()!;
  const [typeId, setTypeId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");

  const selectedType = ACTIVITY_TYPES.find((t) => t.activity_type_id === Number(typeId));
  const qNum = Number(quantity);
  const liveEmission = useMemo(() => {
    if (!selectedType || !qNum || qNum <= 0) return 0;
    return calculateEmission(qNum, selectedType.activity_type_id);
  }, [selectedType, qNum]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return toast.error("Please select an activity type");
    if (!qNum || qNum <= 0) return toast.error("Please enter a valid quantity");
    addActivity(session.user_id, selectedType.activity_type_id, qNum);
    toast.success(`Activity added — ${liveEmission.toFixed(2)} kg CO₂`);
    navigate("/dashboard");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Activity</h1>
        <p className="text-muted-foreground mt-1">Log a new activity to track its carbon emission</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
          <CardDescription>Emission is calculated automatically based on the type and quantity</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select value={typeId} onValueChange={setTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an activity type" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((t) => (
                    <SelectItem key={t.activity_type_id} value={String(t.activity_type_id)}>
                      {t.activity_name} ({t.unit}) — {t.emission_per_unit} kg CO₂/{t.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity {selectedType && <span className="text-muted-foreground">({selectedType.unit})</span>}
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="rounded-xl bg-gradient-primary text-primary-foreground p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-primary-foreground/80">
                    Estimated Emission
                  </div>
                  <div className="text-2xl font-bold">{liveEmission.toFixed(2)} kg CO₂</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" variant="hero" className="flex-1">
                Save Activity
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

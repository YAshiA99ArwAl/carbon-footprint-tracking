import { Link } from "react-router-dom";
import { PlusCircle, Cloud, Activity as ActivityIcon, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getActivities, getActivityType, getSession } from "@/lib/carbonData";

export default function Dashboard() {
  const session = getSession()!;
  const myActivities = getActivities()
    .filter((a) => a.user_id === session.user_id)
    .sort((a, b) => b.activity_date.localeCompare(a.activity_date));

  const totalEmission = myActivities.reduce((sum, a) => sum + a.total_emission, 0);
  const totalCount = myActivities.length;
  const avg = totalCount ? totalEmission / totalCount : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your carbon footprint at a glance</p>
        </div>
        <Button asChild variant="hero">
          <Link to="/add-activity">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Activity
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={<Cloud className="h-5 w-5" />}
          label="Total Emissions"
          value={`${totalEmission.toFixed(2)} kg`}
          hint="CO₂ equivalent"
          highlight
        />
        <SummaryCard
          icon={<ActivityIcon className="h-5 w-5" />}
          label="Activities Logged"
          value={String(totalCount)}
          hint="across all categories"
        />
        <SummaryCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Avg per Activity"
          value={`${avg.toFixed(2)} kg`}
          hint="CO₂ equivalent"
        />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Your Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {myActivities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No activities yet. Start tracking your footprint!</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/add-activity">Add your first activity</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Emission (kg CO₂)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myActivities.map((a) => {
                  const t = getActivityType(a.activity_type_id);
                  return (
                    <TableRow key={a.activity_id}>
                      <TableCell className="text-muted-foreground">{a.activity_date}</TableCell>
                      <TableCell className="font-medium">{t?.activity_name}</TableCell>
                      <TableCell className="text-right">
                        {a.quantity} {t?.unit}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {a.total_emission.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <Card className={`shadow-card ${highlight ? "bg-gradient-primary text-primary-foreground border-0" : ""}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
            {label}
          </span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              highlight ? "bg-primary-foreground/15" : "bg-accent text-accent-foreground"
            }`}
          >
            {icon}
          </div>
        </div>
        <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
        <div className={`text-xs mt-1 ${highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {hint}
        </div>
      </CardContent>
    </Card>
  );
}

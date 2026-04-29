import { useMemo, useState } from "react";
import { Search, Users as UsersIcon, Activity as ActivityIcon, Cloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getActivities, getActivityType, getUsers } from "@/lib/carbonData";

export default function Admin() {
  const users = getUsers();
  const activities = getActivities();
  const [userQuery, setUserQuery] = useState("");
  const [actQuery, setActQuery] = useState("");

  const totalEmissions = activities.reduce((s, a) => s + a.total_emission, 0);

  const filteredUsers = useMemo(() => {
    const q = userQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q),
    );
  }, [users, userQuery]);

  const filteredActivities = useMemo(() => {
    const q = actQuery.toLowerCase().trim();
    return activities
      .map((a) => {
        const u = users.find((x) => x.user_id === a.user_id);
        const t = getActivityType(a.activity_type_id);
        return { ...a, userName: u?.name || "Unknown", userEmail: u?.email || "", typeName: t?.activity_name || "", unit: t?.unit || "" };
      })
      .filter(
        (a) =>
          !q ||
          a.userName.toLowerCase().includes(q) ||
          a.userEmail.toLowerCase().includes(q) ||
          a.typeName.toLowerCase().includes(q),
      )
      .sort((a, b) => b.activity_date.localeCompare(a.activity_date));
  }, [activities, users, actQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">Oversee all users and activity logs</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<UsersIcon className="h-5 w-5" />} label="Total Users" value={String(users.length)} />
        <StatCard icon={<ActivityIcon className="h-5 w-5" />} label="Total Activities" value={String(activities.length)} />
        <StatCard icon={<Cloud className="h-5 w-5" />} label="Total Emissions" value={`${totalEmissions.toFixed(2)} kg`} highlight />
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <CardTitle>All Users</CardTitle>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="text-muted-foreground">{u.user_id}</TableCell>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="text-muted-foreground">{u.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "Admin" ? "default" : "secondary"}>{u.role}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <CardTitle>All Activities</CardTitle>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  className="pl-9"
                  value={actQuery}
                  onChange={(e) => setActQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Emission (kg CO₂)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((a) => (
                    <TableRow key={a.activity_id}>
                      <TableCell className="text-muted-foreground">{a.activity_date}</TableCell>
                      <TableCell className="font-medium">{a.userName}</TableCell>
                      <TableCell>{a.typeName}</TableCell>
                      <TableCell className="text-right">
                        {a.quantity} {a.unit}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {a.total_emission.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <Card className={`shadow-card ${highlight ? "bg-gradient-primary text-primary-foreground border-0" : ""}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{label}</span>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${highlight ? "bg-primary-foreground/15" : "bg-accent text-accent-foreground"}`}>
            {icon}
          </div>
        </div>
        <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

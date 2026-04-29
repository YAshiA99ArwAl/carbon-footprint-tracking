import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "@/lib/carbonData";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const session = login(email.trim(), password);
    if (!session) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success(`Welcome, ${session.name}!`);
    navigate(session.role === "Admin" ? "/admin" : "/dashboard");
  };

  const fill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-soft mb-4">
            <Leaf className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CarbonTrack</h1>
          <p className="text-sm text-muted-foreground mt-1">Carbon Footprint Tracking System</p>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="hero" className="w-full">
                Sign in
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Quick demo logins:</p>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => fill("shriya@email.com", "shriya123")}
                  className="text-left text-xs px-3 py-2 rounded-md bg-muted hover:bg-accent transition-colors"
                >
                  <span className="font-medium">User:</span> shriya@email.com / shriya123
                </button>
                <button
                  type="button"
                  onClick={() => fill("admin1@example.com", "admin123")}
                  className="text-left text-xs px-3 py-2 rounded-md bg-muted hover:bg-accent transition-colors"
                >
                  <span className="font-medium">Admin:</span> admin1@example.com / admin123
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { login, signup } from "@/lib/carbonData";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();

  // Sign in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign up state
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suPhone, setSuPhone] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const session = login(email.trim(), password);
    if (!session) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success(`Welcome, ${session.name}!`);
    navigate(session.role === "Admin" ? "/admin" : "/dashboard");
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const res = signup(suName, suEmail, suPassword, suPhone);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`Account created — welcome, ${res.session.name}!`);
    navigate(res.session.role === "Admin" ? "/admin" : "/dashboard");
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
          <Tabs defaultValue="signin" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="signin">
              <CardHeader className="pt-0">
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Enter your credentials to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
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
              </CardContent>
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader className="pt-0">
                <CardTitle>Create account</CardTitle>
                <CardDescription>Start tracking your carbon footprint today</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="su-name">Full name</Label>
                    <Input
                      id="su-name"
                      placeholder="Jane Doe"
                      value={suName}
                      onChange={(e) => setSuName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-email">Email</Label>
                    <Input
                      id="su-email"
                      type="email"
                      placeholder="you@example.com"
                      value={suEmail}
                      onChange={(e) => setSuEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-phone">Phone (optional)</Label>
                    <Input
                      id="su-phone"
                      placeholder="9876543210"
                      value={suPhone}
                      onChange={(e) => setSuPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-password">Password</Label>
                    <Input
                      id="su-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={suPassword}
                      onChange={(e) => setSuPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" variant="hero" className="w-full">
                    Create account
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

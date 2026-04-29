import { Navigate, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { getSession } from "@/lib/carbonData";

interface Props {
  requireAdmin?: boolean;
}

export default function AppLayout({ requireAdmin = false }: Props) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  if (requireAdmin && session.role !== "Admin") return <Navigate to="/dashboard" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-soft">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-background/60 backdrop-blur px-4">
            <SidebarTrigger />
            <h1 className="text-sm font-medium text-muted-foreground">
              Welcome back, <span className="text-foreground font-semibold">{session.name}</span>
            </h1>
            <span className="ml-auto rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-medium">
              {session.role}
            </span>
          </header>
          <main className="flex-1 p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Users, LogOut, Leaf, ShieldCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { getSession, logout } from "@/lib/carbonData";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const navigate = useNavigate();
  const session = getSession();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Add Activity", url: "/add-activity", icon: PlusCircle },
  ];

  const adminItems = [{ title: "Admin Panel", url: "/admin", icon: ShieldCheck }];

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary text-primary-foreground font-medium"
      : "hover:bg-accent hover:text-accent-foreground";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-soft">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">CarbonTrack</span>
              <span className="text-xs text-muted-foreground">Footprint System</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={linkCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {session?.role === "Admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={linkCls}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {session && !collapsed && (
          <div className="px-2 py-1.5 text-xs">
            <div className="font-medium truncate">{session.name}</div>
            <div className="text-muted-foreground truncate">{session.email}</div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout} className="justify-start gap-2">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

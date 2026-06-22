import { Outlet, Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import {
  Plus,
  List,
  Users,
  Truck,
  Settings,
  LayoutDashboard,
  LogOut,
  TruckIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarContent,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useState } from "react";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function logout() {
    await api.post("/api/auth/logout");
    navigate("/login");
  }
  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarHeader>
              <TruckIcon className="w-4 h-4" />
            </SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="gap-3 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="gap-3 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Link to="/load">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">New load</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="gap-3 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Link to="/loads">
                    <List className="w-4 h-4" />
                    <span className="text-sm font-medium">Loads</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="gap-3 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Link to="/drivers">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Drivers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="gap-3 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Link to="/Trucks">
                    <Truck className="w-4 h-4" />
                    <span className="text-sm font-medium">Trucks</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="gap-3 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Link to="/settings">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={logout}
                className="gap-3 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
      </div>
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </SidebarProvider>
  );
}

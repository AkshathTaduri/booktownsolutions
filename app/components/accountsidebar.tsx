"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button"; // Shadcn Button
import { Separator } from "@/components/ui/separator"; // Shadcn Separator

interface AppSidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  handleLogout: () => void;
}

export function AccountSidebar({
  activeMenu,
  setActiveMenu,
  handleLogout,
}: AppSidebarProps) {
  return (
    <Sidebar className="w-64 bg-white shadow-md">
      <SidebarHeader className="p-4 border-b">
        <h1 className="text-lg font-bold">My Account</h1>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <Button
            variant={activeMenu === "login-security" ? "default" : "ghost"}
            className="justify-start w-full"
            onClick={() => setActiveMenu("login-security")}
          >
            Login & Security
          </Button>
          <Separator className="my-2" />
          <Button
            variant={activeMenu === "your-orders" ? "default" : "ghost"}
            className="justify-start w-full"
            onClick={() => setActiveMenu("your-orders")}
          >
            Your Orders
          </Button>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <Button
          variant="destructive"
          className="justify-start w-full"
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

import React from "react";
import { useLocation } from "react-router-dom";
import BottomMenu from "./BottomMenu";
import {
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import { AppSidebar } from "../layout/app-sidebar";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">{children}</main>
    </SidebarProvider>
  );
}

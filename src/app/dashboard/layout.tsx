"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  User, 
  QrCode, 
  Settings, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  Heart
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Basic route guard
    const loggedIn = localStorage.getItem("vlink_logged_in") === "true";
    if (!loggedIn) {
      router.push("/auth/login");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("vlink_logged_in");
    localStorage.removeItem("vlink_user_profile");
    window.dispatchEvent(new Event("vlink_auth_change"));
    router.push("/");
  };

  const menuItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Emergency Profile", href: "/dashboard/profile", icon: User },
    { name: "QR Management", href: "/dashboard/qr", icon: QrCode },
    { name: "Admin Dashboard", href: "/admin", icon: ShieldAlert },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vlink-paper flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-vlink-trust border-t-vlink-pulse rounded-full animate-spin" />
        <p className="text-sm font-mono text-vlink-ink-soft">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vlink-paper/40 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-vlink-trust-deep text-white px-4 py-3 flex items-center justify-between border-b border-vlink-trust">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold font-display">
          <svg className="w-7 h-7" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="15" r="14" stroke="#9FC4BC" strokeWidth="2" />
            <path d="M5 15h6l2-6 4 12 2-6h6" stroke="#FF5A4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>VitalLink AI</span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 rounded-md hover:bg-white/10"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar navigation */}
      <aside className={`w-64 bg-vlink-trust-deep text-white flex-shrink-0 flex flex-col border-r border-vlink-trust/50 md:sticky md:top-0 md:h-screen fixed top-0 bottom-0 left-0 z-40 transition-transform duration-300 md:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-6 border-b border-vlink-trust flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold font-display">
            <svg className="w-8 h-8" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="14" stroke="#9FC4BC" strokeWidth="2" />
              <path d="M5 15h6l2-6 4 12 2-6h6" stroke="#FF5A4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>VitalLink AI</span>
          </Link>
          <button className="md:hidden text-vlink-paper/70 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl transition-all ${
                  isActive 
                    ? "bg-vlink-pulse text-white shadow-md shadow-vlink-pulse/20" 
                    : "text-vlink-paper/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-vlink-trust/50 space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex gap-2 items-center">
            <Sparkles className="w-5 h-5 text-vlink-pulse flex-shrink-0" />
            <div className="text-[10px] leading-relaxed">
              <span className="font-bold text-white block">VitalLink Premium</span>
              <span className="text-vlink-paper/60">AI features enabled</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-vlink-paper/85 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden min-h-screen">
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

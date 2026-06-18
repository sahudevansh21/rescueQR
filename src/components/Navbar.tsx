"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Heart, ShieldAlert, User, LogOut } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check local auth state (mock / supabase)
    const loggedIn = localStorage.getItem("vlink_logged_in") === "true";
    setIsLoggedIn(loggedIn);

    // Add listener for storage change events to keep sync
    const handleStorageChange = () => {
      const state = localStorage.getItem("vlink_logged_in") === "true";
      setIsLoggedIn(state);
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Add custom event listener for in-app page login/logout transitions
    window.addEventListener("vlink_auth_change", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("vlink_auth_change", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("vlink_logged_in");
    localStorage.removeItem("vlink_uid");
    localStorage.removeItem("vlink_user_profile");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("vlink_auth_change"));
    router.push("/");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Admin Portal", href: "/admin" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-vlink-paper/90 backdrop-blur-md border-b border-vlink-line/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-vlink-trust-deep font-display">
              <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 30 30" fill="none">
                <circle cx="15" cy="15" r="14" stroke="#1C5C53" strokeWidth="2" />
                <path d="M5 15h6l2-6 4 12 2-6h6" stroke="#FF5A4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>RescueQR</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-vlink-trust-deep bg-vlink-line/30"
                        : "text-vlink-ink-soft hover:text-vlink-trust-deep hover:bg-vlink-line/10"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-vlink-trust-deep border border-vlink-line hover:border-vlink-trust rounded-full transition-colors"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-vlink-pulse hover:bg-vlink-pulse/90 rounded-full transition-colors shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-semibold text-vlink-trust-deep hover:text-vlink-trust transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-vlink-pulse hover:bg-vlink-pulse/95 rounded-full transition-colors shadow-sm animate-pulse-glow"
                >
                  Get your tag
                </Link>
              </>
            )}
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-vlink-ink-soft hover:text-vlink-trust-deep hover:bg-vlink-line/20 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-vlink-paper border-b border-vlink-line" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? "text-vlink-trust-deep bg-vlink-line/50 font-bold"
                      : "text-vlink-ink-soft hover:text-vlink-trust-deep hover:bg-vlink-line/20"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-4 border-t border-vlink-line px-5">
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 border border-vlink-line hover:border-vlink-trust rounded-full text-base font-semibold text-vlink-trust-deep w-full text-center transition-colors"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-vlink-pulse text-white rounded-full text-base font-semibold w-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2 border border-vlink-line rounded-full text-base font-medium text-vlink-trust-deep hover:bg-vlink-line/20"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2 bg-vlink-pulse text-white rounded-full text-base font-bold shadow-md"
                >
                  Get your tag
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

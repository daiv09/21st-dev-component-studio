"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X, ChevronDown, LogOut, Settings, User } from "lucide-react";

// --- Configuration & Types ---
type NavItem =
  | {
      label: string;
      href: string;
      color: "red" | "blue" | "green" | "yellow" | "purple";
      children?: never;
      isActive?: boolean;
    }
  | {
      label: string;
      href?: string;
      color: "red" | "blue" | "green" | "yellow" | "purple";
      children: { label: string; href: string }[];
      isActive?: boolean;
    };

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    color: "red",
    isActive: true,
  },
  {
    label: "Products",
    color: "blue",
    children: [
      { label: "SaaS Platform", href: "/products/saas" },
      { label: "Mobile App", href: "/products/mobile" },
      { label: "API SDK", href: "/products/api" },
    ],
    isActive: false,
  },
  {
    label: "Resources",
    color: "yellow",
    children: [
      { label: "Blog", href: "/blog" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Documentation", href: "/docs" },
    ],
    isActive: false,
  },
  {
    label: "Community",
    href: "/community",
    color: "purple",
    isActive: false,
  },
  {
    label: "Contact",
    href: "/contact",
    color: "green",
    isActive: false,
  },
];

const colorClasses: Record<
  "red" | "blue" | "green" | "yellow" | "purple",
  { pill: string; hover: string; border: string }
> = {
  red: {
    pill: "bg-red-400",
    hover: "hover:text-red-600",
    border: "border-red-400",
  },
  blue: {
    pill: "bg-blue-400",
    hover: "hover:text-blue-600",
    border: "border-blue-400",
  },
  green: {
    pill: "bg-green-400",
    hover: "hover:text-green-600",
    border: "border-green-400",
  },
  yellow: {
    pill: "bg-yellow-400",
    hover: "hover:text-yellow-600",
    border: "border-yellow-400",
  },
  purple: {
    pill: "bg-purple-400",
    hover: "hover:text-purple-600",
    border: "border-purple-400",
  },
};

// --- Main Component ---
export default  function ElasticNavbar() {
  const [active, setActive] = useState<string>(
    NAV_ITEMS.find((item) => item.isActive)?.label ?? NAV_ITEMS[0].label
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const currentlyActive =
      NAV_ITEMS.find((item) => item.isActive)?.label ?? NAV_ITEMS[0].label;
    setActive(currentlyActive);
  }, []);

  const handleTabClick = (item: NavItem) => {
    setActive(item.label);
    if ("children" in item && item.children) {
      setOpenDropdown((prev) => (prev === item.label ? null : item.label));
      setProfileOpen(false); // Close profile if nav opens
    } else {
      setOpenDropdown(null);
      setProfileOpen(false);
    }
  };

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
    setOpenDropdown(null); // Close nav dropdowns if profile opens
  };

  return (
    <nav className="w-full flex items-center justify-center h-screen z-50 bg-white/90 backdrop-blur-md border-b-[3px] border-black">
      {/* Container: Flex Row with 3 Zones for perfect centering */}
      <div className="w-full max-w-[95%] mx-auto px-4 h-20 flex items-center justify-between relative">
        {/* ZONE 1: Brand / Logo (Left) */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-xl border-[3px] border-transparent group-hover:bg-white group-hover:text-black group-hover:border-black transition-colors">
              N
            </div>
            <span className="font-black text-xl tracking-tighter uppercase hidden sm:block">
              NeoCorp
            </span>
          </Link>
        </div>

        {/* ZONE 2: Navigation (Absolute Center) */}
        {/* Hidden on mobile/tablet, visible on large screens */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex gap-1 p-1.5 border-[3px] border-black bg-zinc-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {NAV_ITEMS.map((item) => {
              const colors = colorClasses[item.color];
              const isActive = active === item.label;

              return (
                <div key={item.label} className="relative">
                  <button
  onClick={() => handleTabClick(item)}
  className="relative px-4 py-2 text-xs md:text-sm lg:text-sm font-bold uppercase tracking-wide z-10 flex items-center gap-1.5 transition-colors"
>
  {isActive && (
    <motion.div
      layoutId="active-pill"
      className={`absolute inset-0 ${colors.pill} border-[3px] border-black -z-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
    />
  )}
  <span
    className={`relative z-20 ${
      isActive ? "text-black" : `text-zinc-600 ${colors.hover}`
    } text-xs md:text-sm`}
  >
    {item.label}
  </span>
  {"children" in item && item.children && (
    <ChevronDown
      size={12}
      strokeWidth={3}
      className={`relative z-20 transition-transform duration-300 ${
        openDropdown === item.label ? "rotate-180" : ""
      }`}
    />
  )}
</button>


                  {/* Desktop Dropdown */}
                  {"children" in item && item.children && (
                    <AnimatePresence>
                      {openDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="absolute left-0 top-full mt-4 min-w-[220px] bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden z-50"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block px-5 py-3 text-sm font-bold uppercase tracking-wide border-b-2 border-zinc-100 hover:bg-black hover:text-white transition-colors last:border-0`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ZONE 3: Profile & Mobile Toggle (Right) */}
        <div className="flex-1 flex justify-end items-center gap-4">
          {/* Profile Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleProfile}
              className="w-12 h-12 rounded-full border-[3px] border-black overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all bg-yellow-200"
            >
              <img
                src="https://api.dicebear.com/9.x/adventurer/svg?seed=Emery"
                alt="Profile"
                className="w-full h-full object-cover"
              />
              
            </motion.button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute right-0 top-full mt-4 w-56 bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50"
                >
                  <div className="p-4 border-b-[3px] border-black bg-zinc-50">
                    <p className="font-black uppercase text-sm">
                      Felix The Cat
                    </p>
                    <p className="text-xs font-mono text-zinc-500">
                      felix@neocorp.com
                    </p>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    <button className="flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase hover:bg-black hover:text-white transition-colors">
                      <User size={16} /> Profile
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase hover:bg-black hover:text-white transition-colors">
                      <Settings size={16} /> Settings
                    </button>
                    <div className="h-[2px] bg-black my-1" />
                    <button className="flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Toggle Button */}
          <button
            className="lg:hidden w-12 h-12 bg-white border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <motion.div
              key={mobileOpen ? "close" : "menu"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {mobileOpen ? (
                <X size={24} strokeWidth={3} />
              ) : (
                <Menu size={24} strokeWidth={3} />
              )}
            </motion.div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="lg:hidden overflow-hidden border-t-[3px] border-black bg-zinc-100"
          >
            <div className="p-4 space-y-3">
              {NAV_ITEMS.map((item) => {
                const colors = colorClasses[item.color];
                const isActive = active === item.label;
                const hasChildren = "children" in item && item.children;

                return (
                  <div key={item.label}>
                    <button
  onClick={() => {
    handleTabClick(item);
    if (!hasChildren) setMobileOpen(false);
  }}
  className={`w-full flex items-center justify-between p-3 text-xs font-black uppercase tracking-wide border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all ${
    isActive ? colors.pill : ""
  }`}
>
  <span className="text-xs">{item.label}</span>
  {hasChildren && (
    <ChevronDown
      size={16}
      className={`transition-transform duration-300 ${
        isActive ? "rotate-180" : ""
      }`}
    />
  )}
</button>


                    {/* Mobile Nested Menu */}
                    {hasChildren && isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-4 mt-2 border-l-[3px] border-black pl-4 space-y-2"
                      >
                        {item.children!.map((child) => (
                          <Link
  key={child.href}
  href={child.href}
  onClick={() => setMobileOpen(false)}
  className="block p-2 text-xs font-bold uppercase text-zinc-600 hover:text-black hover:underline decoration-2 underline-offset-4"
>
  {child.label}
</Link>

                        ))}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

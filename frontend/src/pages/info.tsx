import { motion } from "framer-motion";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

import { AuroraBackground } from "../components/ui/aurora-background";
import { HoveredLink, Menu, MenuItem } from "../components/ui/navbar-menu";
import "../globals.css";
import { cn } from "../lib/utils";

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <MenuItem
          setActive={setActive}
          active={active}
          item="About The Developers"
        >
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/web-dev">Web Development</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={null} item="Dashboard">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/home/index/" />
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={null} item="Log In">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/accounts/" />
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
}

function InfoPage() {
  return (
    <>
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-4 items-center justify-center px-4"
        >
          <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
            Atlanta Food Finder
          </div>
          <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
            CS2340 Group 39
          </div>
          <button className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
            Sign Up
          </button>
        </motion.div>
      </AuroraBackground>
      <Navbar className="top-2" />
    </>
  );
}

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <InfoPage />
  </StrictMode>
);

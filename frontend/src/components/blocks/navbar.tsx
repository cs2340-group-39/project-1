import { useState } from "react";

import "../../globals.css";
import { cn } from "../../lib/utils";
import { LinkPreview } from "../ui/link-preview";
import { Menu, MenuItem } from "../ui/navbar-menu";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import About from "./about";

export default function Navbar({ className }: { className?: string }) {
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
          <ScrollArea className="h-[50vh] w-[50vw] rounded-md border  gap-10 p-4">
            <About />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </MenuItem>
        <LinkPreview
          url="https://ui.aceternity.com"
          className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-300 to-blue-300 to-green-300"
        >
          Dashboard
        </LinkPreview>
        <LinkPreview
          url="https://github.com/cs2340-group-39/project-1"
          className="text-black"
        >
          GitHub
        </LinkPreview>
      </Menu>
    </div>
  );
}

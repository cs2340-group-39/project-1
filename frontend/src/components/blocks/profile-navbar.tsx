import { useState } from "react";

import "../../globals.css";
import { cn } from "../../lib/utils";
import { LinkPreview } from "../ui/link-preview";
import { Menu } from "../ui/navbar-menu";

interface NavbarData {
  className?: string;
  data?: {
    userLoggedIn: boolean;
  };
}

export default function ProfileNavbar({ className, data }: NavbarData) {
  const [active, setActive] = useState<string | null>(null);
  active;
  data;
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <LinkPreview
          url="https://github.com/cs2340-group-39/project-1"
          className="text-black"
        >
          Change Email
        </LinkPreview>
        <LinkPreview
          url="https://github.com/cs2340-group-39/project-1"
          className="text-black"
        >
          Change Password
        </LinkPreview>
        <LinkPreview
          url="https://github.com/cs2340-group-39/project-1"
          className="text-black"
        >
          Account Connections
        </LinkPreview>
        <LinkPreview
          url="https://github.com/cs2340-group-39/project-1"
          className="text-black"
        >
          Logout
        </LinkPreview>
      </Menu>
    </div>
  );
}

import { useState } from "react";
import axios from "axios";

import "../../globals.css";
import { cn } from "../../lib/utils";
import { LinkPreview } from "../ui/link-preview";
import { Menu, MenuItem } from "../ui/navbar-menu";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import About from "./about";

interface InfoNavbarData {
    className?: string;
    data: {
        userLoggedIn: boolean;
    };
}

export default function InfoNavbar({ className, data }: InfoNavbarData) {
    const [active, setActive] = useState<string | null>(null);

    const handleLogout = async () => {
        try {
            await axios.delete(
                "http://127.0.0.1:8000/_allauth/browser/v1/auth/session"
            ); // Lol this request throws a 401 every time so redirection must happen in catch block. 
        } catch (error) {
            window.location.replace("/users/accounts/login/");
        }
    };

    return (
        <div className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}>
            <Menu setActive={setActive}>
                <MenuItem setActive={setActive} active={active} item="About The Developers">
                    <ScrollArea className="h-[50vh] w-[50vw] rounded-md border  gap-10 p-4">
                        <About />
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </MenuItem>
                <LinkPreview url="https://github.com/cs2340-group-39/project-1" className="text-black">
                    GitHub
                </LinkPreview>
                {data.userLoggedIn ? (
                    <button onClick={handleLogout} className="text-black">
                    Log Out
                    </button>
                ) : null}
            </Menu>
        </div>
    );
}

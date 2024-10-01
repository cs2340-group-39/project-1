import axios from "axios";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { Menu, MenuItem } from "../ui/navbar-menu";

import "../../globals.css";

interface NavbarData {
    className?: string;
    setProfilePage: (page: string) => void;
}

export default function ProfileNavbar({ className, setProfilePage }: NavbarData) {
    const [active, setActive] = useState<string | null>(null);
    active;

    const handleLogout = async () => {
        try {
            await axios.delete("http://127.0.0.1:8000/_allauth/browser/v1/auth/session"); // Lol this request throws a 401 every time so redirection must happen in catch block.
        } catch (error) {
            window.location.replace("/users/accounts/login/");
        }
    };

    return (
        <div className={cn("fixed top-10 justify-center z-50", className)}>
            <Menu setActive={setActive}>
                <MenuItem
                    active={null}
                    setActive={setActive}
                    onClick={() => {
                        window.location.replace("/dashboard/index");
                    }}
                    item={"Dashboard"}
                />
                <MenuItem
                    active={null}
                    setActive={setActive}
                    onClick={() => {
                        setProfilePage("change-email-form");
                    }}
                    item={"Change Email"}
                />
                <MenuItem
                    active={null}
                    setActive={setActive}
                    onClick={() => {
                        setProfilePage("change-password-form");
                    }}
                    item={"Change Password"}
                />
                <MenuItem
                    active={null}
                    setActive={setActive}
                    onClick={() => {
                        setProfilePage("user-favorite-places-card");
                    }}
                    item={"Your Favorite Places"}
                />
                <MenuItem
                    active={null}
                    setActive={setActive}
                    onClick={() => {
                        setProfilePage("user-reviews-card");
                    }}
                    item={"Your Reviews"}
                />
                <button onClick={handleLogout} className="text-black dark:text-white">
                    Logout
                </button>
            </Menu>
        </div>
    );
}

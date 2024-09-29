import { useState } from "react";
import axios from "axios"; 

import "../../globals.css";
import { cn } from "../../lib/utils";
import { Menu, MenuItem } from "../ui/navbar-menu";

interface NavbarData {
    className?: string;
    setProfilePage: (page: string) => void;
}

export default function ProfileNavbar({ className, setProfilePage }: NavbarData) {
    const [active, setActive] = useState<string | null>(null);
    active;

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
                        setProfilePage("account-connections-form");
                    }}
                    item={"Account Connections"}
                />
                <button
                    onClick={handleLogout}
                    className="text-black"
                >
                    Logout
                </button>
            </Menu>
        </div>
    );
}

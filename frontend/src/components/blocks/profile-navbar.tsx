import { useState } from "react";

import "../../globals.css";
import { cn } from "../../lib/utils";
import { LinkPreview } from "../ui/link-preview";
import { Menu, MenuItem } from "../ui/navbar-menu";

interface NavbarData {
    className?: string;
    setProfilePage: (page: string) => void;
}

export default function ProfileNavbar({ className, setProfilePage }: NavbarData) {
    const [active, setActive] = useState<string | null>(null);
    active;

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
                <LinkPreview url="/users/accounts/logout/" className="text-black">
                    Logout
                </LinkPreview>
            </Menu>
        </div>
    );
}

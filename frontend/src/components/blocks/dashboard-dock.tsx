import { IconHome, IconUser } from "@tabler/icons-react";
import { FloatingDock } from "../ui/floating-dock";

export default function DashboardDock() {
    const links = [
        {
            title: "Info Page",
            icon: <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
            href: "/info/index",
        },
        {
            title: "Profile",
            icon: <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
            href: "/users/accounts/profile",
        },
    ];
    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
            <div className="pointer-events-auto">
                <FloatingDock items={links} />
            </div>
        </div>
    );
}

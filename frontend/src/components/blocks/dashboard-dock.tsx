import {
    IconBrandGithub,
    IconBrandX,
    IconExchange,
    IconHome,
    IconNewSection,
    IconTerminal2,
} from "@tabler/icons-react";
import { FloatingDock } from "../ui/floating-dock";

export default function DashboardDock() {
    const links = [
        {
            title: "Home",
            icon: <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
            href: "#",
        },

        {
            title: "Products",
            icon: <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
            href: "#",
        },
        {
            title: "Components",
            icon: <IconNewSection className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
            href: "#",
        },
        {
            title: "Changelog",
            icon: <IconExchange className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
            href: "#",
        },

        {
            title: "Twitter",
            icon: <IconBrandX className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
            href: "#",
        },
        {
            title: "GitHub",
            icon: <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
            href: "#",
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

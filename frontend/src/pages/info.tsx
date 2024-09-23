import { motion } from "framer-motion";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import InfoNavbar from "../components/blocks/info-navbar";
import { ThemeProvider } from "../components/theme-provider";
import { AuroraBackground } from "../components/ui/aurora-background";
import { HoverBorderGradient } from "../components/ui/hover-border-gradient";
import { TextHoverEffect } from "../components/ui/text-hover-effect";
import "../globals.css";

interface InfoPageData {
    data: {
        userLoggedIn: boolean;
        username: string;
    };
}

function InfoPage({ data }: InfoPageData) {
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
                    {data.userLoggedIn ? (
                        <>
                            <TextHoverEffect text={"Welcome " + data.username + "!"} />
                            <div>
                                <a href="/dashboard/index/">
                                    <HoverBorderGradient
                                        containerClassName="rounded-md border-transparent transition duration-1000 scale-100 hover:scale-110"
                                        className="inline-flex border-transparent h-12 animate-shimmer items-center justify-center rounded-md bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                                        as="button"
                                    >
                                        Continue to Dashboard
                                    </HoverBorderGradient>
                                </a>
                            </div>
                        </>
                    ) : (
                        <a href="/accounts/">
                            <HoverBorderGradient
                                containerClassName="rounded-md border-transparent transition duration-1000 scale-100 hover:scale-110"
                                className="inline-flex border-transparent h-12 animate-shimmer items-center justify-center rounded-md bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                                as="button"
                            >
                                Sign Up or Log In
                            </HoverBorderGradient>
                        </a>
                    )}
                </motion.div>
            </AuroraBackground>
            <InfoNavbar className="top-2" data={{ userLoggedIn: data.userLoggedIn }} />
        </>
    );
}

const rootElement = document.getElementById("root")!;
const data = JSON.parse(rootElement.getAttribute("data-context")!);

createRoot(rootElement).render(
    <StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <InfoPage data={data} />
        </ThemeProvider>
    </StrictMode>
);

import { AnimatePresence, motion, Variant } from "framer-motion";
import { Menu as MenuIcon, X } from "lucide-react";
import React, { ReactNode, useEffect, useState } from "react";

type AnimationVariants = {
    initial: Variant;
    animate: Variant;
    exit: Variant;
};

const mobileMenuVariants: AnimationVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

const desktopMenuVariants: AnimationVariants = {
    initial: {},
    animate: {},
    exit: {},
};

const transition = {
    type: "spring",
    mass: 0.5,
    damping: 11.5,
    stiffness: 100,
    restDelta: 0.001,
    restSpeed: 0.001,
    duration: 0.3,
};

interface MenuItemProps {
    setActive: (item: string | null) => void;
    active: string | null;
    item: string;
    children?: ReactNode;
    onClick?: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({ setActive, active, item, children, onClick }) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);

    return (
        <div
            onMouseEnter={() => {
                setActive(item);
                setIsHovered(true);
            }}
            onMouseLeave={() => {
                setActive(null);
                setIsHovered(false);
            }}
            onClick={onClick}
            className="relative"
        >
            <motion.p
                transition={{ duration: 0.3 }}
                className="cursor-pointer text-black text-nowrap hover:opacity-[0.9] dark:text-white"
            >
                {item}
            </motion.p>
            <AnimatePresence>
                {isHovered && active != null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 10 }}
                        transition={transition}
                    >
                        <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
                            <motion.div
                                transition={transition}
                                layoutId="active"
                                className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
                            >
                                <motion.div layout className="w-max h-full p-4">
                                    {children}
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface MenuProps {
    setActive: (item: string | null) => void;
    children: ReactNode;
}

export const Menu: React.FC<MenuProps> = ({ setActive, children }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    return (
        <nav className="w-full">
            {isMobile ? (
                <div className="flex justify-end p-4">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-black dark:text-white">
                        {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
                    </button>
                </div>
            ) : null}
            <AnimatePresence>
                {(!isMobile || isOpen) && (
                    <motion.div
                        variants={isMobile ? mobileMenuVariants : desktopMenuVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={transition}
                        className={`${
                            isMobile
                                ? "flex flex-col items-center space-y-4 py-4"
                                : "flex flex-row w-full justify-center items-center space-x-4 px-8 py-6"
                        } rounded-2xl backdrop-blur-xl dark:bg-black/65 dark:border-white/[0.2] bg-white/65 shadow-input shadow-md border-1 border-slate-300`}
                        onMouseLeave={() => setActive(null)}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

interface HoveredLinkProps {
    children: ReactNode;
}

export const HoveredLink: React.FC<HoveredLinkProps> = ({ children }) => {
    return <>{children}</>;
};

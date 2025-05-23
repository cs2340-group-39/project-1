import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import { AnimatePresence, MotionValue, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "../../lib/utils";

export const FloatingDock = ({
    items,
    desktopClassName,
    mobileClassName,
}: {
    items: { title: string; icon: React.ReactNode; href: string }[];
    desktopClassName?: string;
    mobileClassName?: string;
}) => {
    return (
        <>
            <FloatingDockDesktop items={items} className={desktopClassName} />
            <FloatingDockMobile items={items} className={mobileClassName} />
        </>
    );
};

const FloatingDockMobile = ({
    items,
    className,
}: {
    items: { title: string; icon: React.ReactNode; href: string }[];
    className?: string;
}) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={cn("relative block md:hidden", className)}>
            <AnimatePresence>
                {open && (
                    <motion.div layoutId="nav" className="absolute bottom-full mb-2 inset-x-0 flex flex-col gap-2">
                        {items.map((item, idx) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: 10,
                                    transition: {
                                        delay: idx * 0.05,
                                    },
                                }}
                                transition={{
                                    delay: (items.length - 1 - idx) * 0.05,
                                }}
                            >
                                <a
                                    href={item.href}
                                    key={item.title}
                                    className="h-10 w-10 rounded-xl bg-gray-50/75 dark:bg-neutral-900/75 flex items-center justify-center backdrop-blur-2xl border-2 border-zinc-500 shadow-lg shadow-zinc-300 dark:shadow-neutral-600"
                                >
                                    <div className="h-4 w-4 dark:text-slate-400 text-slate-600  [&>*]:text-slate-600 [&>*]:stroke-slate-600 dark:[&>*]:text-slate-400 dark:[&>*]:stroke-slate-400 [&>*]:fill-none">
                                        {item.icon}
                                    </div>
                                </a>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button
                onClick={() => setOpen(!open)}
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="relative h-10 w-10 rounded-xl overflow-hidden shadow-2xl shadow-zinc-300 dark:shadow-zinc-600"
            >
                <div className="absolute inset-0 border-2 border-zinc-500 rounded-xl bg-black" />
                <div className="relative z-10 h-full w-full flex items-center justify-center">
                    <IconLayoutNavbarCollapse className="h-5 w-5 text-slate-400 [&>*]:text-slate-400 [&>*]:stroke-slate-400 [&>*]:fill-none" />
                </div>
            </motion.button>
        </div>
    );
};

const FloatingDockDesktop = ({
    items,
    className,
}: {
    items: { title: string; icon: React.ReactNode; href: string }[];
    className?: string;
}) => {
    let mouseX = useMotionValue(Infinity);
    return (
        <motion.div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className={cn(
                "mx-auto hidden md:flex h-16 gap-4 items-end rounded-2xl bg-gray-50/75 dark:bg-neutral-900/75 px-4 pb-3 backdrop-blur-2xl border-2 border-zinc-500",
                className
            )}
        >
            {items.map((item) => (
                <IconContainer mouseX={mouseX} key={item.title} {...item} />
            ))}
        </motion.div>
    );
};

function IconContainer({
    mouseX,
    title,
    icon,
    href,
}: {
    mouseX: MotionValue;
    title: string;
    icon: React.ReactNode;
    href: string;
}) {
    let ref = useRef<HTMLDivElement>(null);

    let distance = useTransform(mouseX, (val) => {
        let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
    let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

    let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
    let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

    let width = useSpring(widthTransform, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });
    let height = useSpring(heightTransform, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });

    let widthIcon = useSpring(widthTransformIcon, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });
    let heightIcon = useSpring(heightTransformIcon, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });

    const [hovered, setHovered] = useState(false);

    return (
        <a href={href}>
            <motion.div
                ref={ref}
                style={{ width, height }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="aspect-square rounded-xl flex items-center justify-center relative shadow-md shadow-gray-300 dark:shadow-neutral-700"
            >
                {/* Shimmer background */}
                <div className="absolute inset-0 rounded-xl border-2 shadow-zinc-300 dark:shadow-zinc-600 border-zinc-500 text-white bg-black" />

                {/* Icon container */}
                <div className="relative z-10 flex items-center justify-center w-full h-full">
                    <motion.div
                        style={{ width: widthIcon, height: heightIcon }}
                        className="flex items-center justify-center text-slate-400 [&>*]:text-slate-400 [&>*]:stroke-slate-400 [&>*]:fill-none"
                    >
                        {icon}
                    </motion.div>
                </div>

                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, y: 2, x: "-50%" }}
                            className="px-2 py-0.5 whitespace-pre rounded-xl bg-gray-100 border dark:bg-neutral-800 dark:border-neutral-900 dark:text-white border-gray-200 text-neutral-700 absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs shadow-sm shadow-gray-200 dark:shadow-neutral-900"
                        >
                            {title}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </a>
    );
}

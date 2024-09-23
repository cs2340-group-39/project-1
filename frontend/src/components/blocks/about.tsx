import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { useOutsideClick } from "../hooks/use-outside-click";

export default function About() {
    const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const id = useId();

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setActive(false);
            }
        }

        if (active && typeof active === "object") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [active]);

    useOutsideClick(ref, () => setActive(null));

    return (
        <div className="min-w-[400px] min-h-[400px]">
            <AnimatePresence>
                {active && typeof active === "object" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 h-full w-full z-10"
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {active && typeof active === "object" ? (
                    <div className="fixed inset-0 grid place-items-center z-[100]">
                        <motion.button
                            key={`button-${active.title}-${id}`}
                            layout
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            exit={{
                                opacity: 0,
                                transition: {
                                    duration: 0.05,
                                },
                            }}
                            className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
                            onClick={() => setActive(null)}
                        >
                            <CloseIcon />
                        </motion.button>

                        <motion.div
                            layoutId={`card-${active.title}-${id}`}
                            ref={ref}
                            className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-2xl overflow-y-scroll"
                        >
                            <motion.div layoutId={`image-${active.title}-${id}`}>
                                <img
                                    width="200"
                                    height="200"
                                    src={active.src}
                                    alt={active.title}
                                    className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-center"
                                />
                            </motion.div>

                            <div>
                                <div className="flex justify-between items-start p-4">
                                    <div className="">
                                        <motion.h3
                                            layoutId={`title-${active.title}-${id}`}
                                            className="font-bold text-neutral-700 dark:text-neutral-200"
                                        >
                                            {active.title}
                                        </motion.h3>
                                        <motion.p
                                            layoutId={`description-${active.description}-${id}`}
                                            className="text-neutral-600 dark:text-neutral-400"
                                        >
                                            {active.description}
                                        </motion.p>
                                    </div>

                                    <motion.a
                                        layoutId={`button-${active.title}-${id}`}
                                        href={active.ctaLink}
                                        target="_blank"
                                        className="px-4 py-3 text-sm rounded-full font-bold bg-[#010305] text-white"
                                    >
                                        {active.ctaText}
                                    </motion.a>
                                </div>
                                <div className="pt-4 relative px-4">
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                                    >
                                        {typeof active.content === "function" ? active.content() : active.content}
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ) : null}
            </AnimatePresence>
            <ul className="w-full flex flex-col">
                {cards.map((card, _) => (
                    <motion.div
                        layoutId={`card-${card.title}-${id}`}
                        key={`card-${card.title}-${id}`}
                        onClick={() => setActive(card)}
                        className="p-4 flex justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                    >
                        <div className="flex gap-4 flex-col md:flex-row ">
                            <motion.div layoutId={`image-${card.title}-${id}`}>
                                <img
                                    width="200"
                                    height="200"
                                    src={card.src}
                                    alt={card.title}
                                    className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-center"
                                />
                            </motion.div>
                            <div className="">
                                <motion.h3
                                    layoutId={`title-${card.title}-${id}`}
                                    className="font-medium text-neutral-800 dark:text-neutral-200 md:text-left"
                                >
                                    {card.title}
                                </motion.h3>
                                <motion.p
                                    layoutId={`description-${card.description}-${id}`}
                                    className="text-neutral-600 dark:text-neutral-400  md:text-left"
                                >
                                    {card.description}
                                </motion.p>
                            </div>
                        </div>
                        <motion.button
                            layoutId={`button-${card.title}-${id}`}
                            className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-[#010305] hover:text-white text-black mt-4 md:mt-0"
                        >
                            {card.ctaText}
                        </motion.button>
                    </motion.div>
                ))}
            </ul>
        </div>
    );
}

export const CloseIcon = () => {
    return (
        <motion.svg
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            exit={{
                opacity: 0,
                transition: {
                    duration: 0.05,
                },
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-black"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
        </motion.svg>
    );
};

const arjunSheshadriURL = new URL("./profile-pictures/arjun-sheshadri.jpeg", import.meta.url).href;
const williamMcConnellURL = new URL("./profile-pictures/william-mcconnell.jpg", import.meta.url).href;
const nicholasNietscheURL = new URL("./profile-pictures/nicholas-neitsche.jpg", import.meta.url).href;

const cards = [
    {
        description: "Developer and Scrum Master",
        title: "William McConnell",
        src: williamMcConnellURL,
        ctaText: "View Bio",
        ctaLink: "#",
        content: () => {
            return (
                <p>
                    Hello, my name is Will! I'm a second year computer science major with concentrations in Intelligence
                    and System Architecture. Some of my hobbies include golfing, working out, and cooking. Throughout
                    this project, I have gained important web development and team skills, preparing me for real world
                    work.
                </p>
            );
        },
    },
    {
        description: "Developer 1",
        title: "Arjun Sheshadri",
        src: arjunSheshadriURL,
        ctaText: "View Bio",
        ctaLink: "#",
        content: () => {
            return (
                <p>
                    Hello, my name is Arjun! I am a sophomore computer science major and my threads are Intelligence and
                    Mod/Sim. I am very passionate about computer simulations, artificial intelligence, and biking. This
                    project has greatly helped me build my team building skills.
                </p>
            );
        },
    },
    {
        description: "Developer 2",
        title: "Muhammad Saad Ata",
        src: "https://assets.aceternity.com/demos/metallica.jpeg",
        ctaText: "View Bio",
        ctaLink: "#",
        content: () => {
            return (
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt mollit anim id est laborum.
                </p>
            );
        },
    },
    {
        description: "Developer 3",
        title: "Johnny Pham",
        src: "https://assets.aceternity.com/demos/led-zeppelin.jpeg",
        ctaText: "View Bio",
        ctaLink: "#",
        content: () => {
            return (
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt mollit anim id est laborum.
                </p>
            );
        },
    },
    {
        description: "Developer 4",
        title: "Nicholas Neitsche",
        src: nicholasNietscheURL,
        ctaText: "View Bio",
        ctaLink: "#",
        content: () => {
            return (
                <p>
                    Hi, I&apos;m Nicholas Nitsche. I have a passion for playing tennis; there&apos;s something
                    exhilarating about the competition and the skill involved in each match. I love the way it
                    challenges me both physically and mentally. In addition to tennis, I&apos;m also an avid gamer. I
                    enjoy immersing myself in different virtual worlds and experiencing the stories and challenges they
                    offer. Whether I&apos;m playing competitively or just for fun, video games provide a great way to
                    unwind and connect with friends. Balancing both sports and gaming keeps my life exciting and
                    engaging!
                </p>
            );
        },
    },
];

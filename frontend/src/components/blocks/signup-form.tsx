import axios from "axios";

import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { LinkPreview } from "../ui/link-preview";
import { MultiStepLoader } from "../ui/multi-step-loader";

interface ErrorMessagesProps {
    messages: string[];
}

const ErrorMessages: React.FC<ErrorMessagesProps> = ({ messages }) => {
    const [height, setHeight] = useState<number>(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            const newHeight = messages.length > 0 ? ref.current.scrollHeight : 0;
            setHeight(newHeight);
        }
    }, [messages]);

    return messages.length > 0 ? (
        <div className="transition-all duration-300 ease-in-out" style={{ height: height }}>
            <div ref={ref} className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 my-4">
                {messages.map((message, index) => (
                    <p key={index} className="text-red-600 dark:text-red-400 mb-2 last:mb-0">
                        {message}
                    </p>
                ))}
            </div>
        </div>
    ) : null;
};

export function SignupForm() {
    const [loading, setLoading] = useState(false);
    const defaultLoadingStates = [
        {
            text: "You cannot sign up with an email that already in use.",
            success: true,
        },
        {
            text: "You cannot sign up with a username that already in use.",
            success: true,
        },
        {
            text: "Your password can't be too similar to your other personal information.",
            success: true,
        },
        {
            text: "Your password must contain at least 8 characters.",
            success: true,
        },
        {
            text: "Your password can't be a commonly used password.",
            success: true,
        },
        {
            text: "Your password can't be entirely numeric.",
            success: true,
        },
    ];
    const [loadingStates, setLoadingStates] = useState([...defaultLoadingStates]);
    let [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [inputs, setInputs] = useState({
        userName: null,
        password: null,
        email: null,
        confirmPassword: null,
    });
    const [shouldRedirect, setShouldRedirect] = useState(false);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs((values) => ({ ...values, [name]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        errorMessages = [];

        const isValid = event.currentTarget.checkValidity();
        if (!isValid) {
            return;
        }

        let newErrorMessages: string[] = [...errorMessages];

        if (inputs.password !== inputs.confirmPassword) {
            newErrorMessages = [...newErrorMessages, "Your passwords do not match."];
        }

        const payload = {
            email: inputs.email,
            username: inputs.userName,
            password: inputs.password,
        };

        try {
            // @ts-ignore
            const response = await axios.post(
                "http://127.0.0.1:8000/_allauth/browser/v1/auth/signup", // TODO: Change this, don't hardcode the domain
                payload
            );
        } catch (error: any) {
            if (error.response.data.status === 401) {
                setShouldRedirect(true);
                return;
            }

            if (error.response.data.status == 409) {
                newErrorMessages.push("You are already authenticated. Log out to create a new account.");
            }

            let newLoadingStates = [...defaultLoadingStates];

            for (error of error.response.data.errors) {
                switch (error.code) {
                    case "password_too_short":
                        newLoadingStates[3].success = false;
                        break;
                    case "password_too_common":
                        newLoadingStates[4].success = false;
                        break;
                    case "password_entirely_numeric":
                        newLoadingStates[5].success = false;
                        break;
                }
                newErrorMessages.push(error.message);
            }
            setLoadingStates(newLoadingStates);
        } finally {
            setLoading(true);
            setErrorMessages(newErrorMessages);
        }
    };

    const handleAnimationComplete = () => {
        if (shouldRedirect) {
            window.location.href = "/users/accounts/code_form/";
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md w-full rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black overflow-auto max-h-[75vh] z-10 relative">
            <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                Welcome to the Atlanta Food Finder
            </h2>
            <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
                If you already have an account, you may login{" "}
                <LinkPreview url="/users/accounts/login/" className="text-black font-bold">
                    here
                </LinkPreview>
                .
            </p>
            <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
                Fields with a * next to them are required.
            </p>

            <form className="my-8" onSubmit={handleSubmit}>
                <LabelInputContainer className="mb-8">
                    <Label htmlFor="username">Username*</Label>
                    <Input
                        id="username"
                        name="userName"
                        placeholder="johndoe123"
                        type="username"
                        onChange={handleChange}
                        required={true}
                    />
                </LabelInputContainer>
                <LabelInputContainer className="mb-8">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        name="email"
                        placeholder="johndoe@gatech.edu"
                        type="email"
                        onChange={handleChange}
                        required={true}
                    />
                </LabelInputContainer>
                <LabelInputContainer className="mb-8">
                    <Label htmlFor="password">Password*</Label>
                    <Input
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        type="password"
                        onChange={handleChange}
                        required={true}
                    />
                </LabelInputContainer>
                <LabelInputContainer className="mb-8">
                    <Label htmlFor="confirm-password">Confirm Password*</Label>
                    <Input
                        id="confirm-password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        type="password"
                        onChange={handleChange}
                        required={true}
                    />
                </LabelInputContainer>

                <div className="mb-8">
                    <ErrorMessages messages={errorMessages} />
                </div>

                <MultiStepLoader
                    loadingStates={loadingStates}
                    loading={loading}
                    duration={1000}
                    loop={false}
                    onComplete={handleAnimationComplete}
                />

                <div className="mb-8">
                    <button
                        className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                        type="submit"
                    >
                        Sign up &rarr;
                        <BottomGradient />
                    </button>
                </div>

                {/* <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" /> */}

                {/* <div className="flex flex-col space-y-8">
                   
                    <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
                        You may choose to sign up with one of the below social account providers.
                    </p>
                    <button
                        className=" relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
                        type="submit"
                    >
                        <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                        <span className="text-neutral-700 dark:text-neutral-300 text-sm">Google</span>
                        <BottomGradient />
                    </button>
                </div> */}
            </form>
        </div>
    );
}

const BottomGradient = () => {
    return (
        <>
            <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        </>
    );
};

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>;
};

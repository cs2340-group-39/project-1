import axios from "axios";

import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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

export function CodeForm() {
    let [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [inputs, setInputs] = useState({
        code: null,
    });

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

        const payload = {
            key: inputs.code,
        };

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/_allauth/browser/v1/auth/email/verify", // TODO: Change this, don't hardcode the domain
                payload
            );

            if (response.data.status === 200) {
                window.location.href = "/";
            }
        } catch (error: any) {
            if (error.response.data.status == 409) {
                newErrorMessages.push("You are already authenticated. Log out to create a new account.");
            } else {
                newErrorMessages.push("Invalid Username or Password.");
            }
        } finally {
            setErrorMessages(newErrorMessages);
        }
    };

    return (
        <div className="max-w-md w-full rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black overflow-auto max-h-[75vh] z-10 relative">
            <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">Code Form</h2>
            <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
                Type the code you got in your email here.
            </p>

            <form className="my-8" onSubmit={handleSubmit}>
                <LabelInputContainer className="mb-8">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="code"
                        name="code"
                        placeholder="Code"
                        type="code"
                        onChange={handleChange}
                        required={true}
                    />
                </LabelInputContainer>

                <div className="mb-8">
                    <ErrorMessages messages={errorMessages} />
                </div>

                <div className="mb-8">
                    <button
                        className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                        type="submit"
                    >
                        Submit Code &rarr;
                        <BottomGradient />
                    </button>
                </div>
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

import { ReactNode } from "react";
import { Toaster } from "../components/ui/toaster";

export default function ToasterLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head />
            <body>
                <main>{children}</main>
                <Toaster />
            </body>
        </html>
    );
}

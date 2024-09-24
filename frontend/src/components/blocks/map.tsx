import { ReactNode } from "react";

interface MapData {
    apiKey: string;
}

export default function Map({ apiKey }: MapData): ReactNode {
    return (
        <>
            <p>{apiKey}</p>
        </>
    );
}

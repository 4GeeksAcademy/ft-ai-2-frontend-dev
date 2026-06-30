"use client";

export default function TestPage() {
    return <div>
        <h1>{process.env.NEXT_PUBLIC_CONFIG_SETTING}</h1>
    </div>
}
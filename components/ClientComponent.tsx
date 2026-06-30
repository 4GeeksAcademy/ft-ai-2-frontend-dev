'use client';

// Client components run all their code in the frontend.
// This means that client components are dynamic, i.e.
// they can update live and use React lifecycle components.

import { useEffect, useState } from "react";

export default function ClientComponent() {
    const getData = async () => {
        const resp = await fetch("https://library.dotlag.space/library/37");
        const data = await resp.json()
        setData(data);
    }

    const [data, setData] = useState({});

    useEffect(() => {
        getData();
    }, []);

    return <div>
        <h1>This doesn't have access to server-side data:</h1>
        <p>
            {data?.title}
        </p>
    </div>
}

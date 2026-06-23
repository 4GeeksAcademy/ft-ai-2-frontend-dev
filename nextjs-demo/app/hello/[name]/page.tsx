import Link from "next/link";

export default async function HelloPage({ params }: { params: { name: string } }) {

    const { name } = await params;
    return <div>
        <h1>Hello {name}</h1>
        <Link href="/">Home</Link>
        <Link href="/hello/Shane">Shane</Link>
        <Link href="/hello/Sombra">Sombra</Link>
        <Link href="/hello/Grizelle">Grizelle</Link>
    </div>
}
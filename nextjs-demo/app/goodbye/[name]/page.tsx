import Link from "next/link";

export default async function GoodbyePage({ params }: { params: { name: string } }) {

    const { name } = await params;
    return <div>
        <h1>Goodbye {name}</h1>
        <Link href="/">Home</Link>
        <Link href="/goodbye/Shane">Shane</Link>
        <Link href="/goodbye/Sombra">Sombra</Link>
        <Link href="/goodbye/Grizelle">Grizelle</Link>
    </div>
}
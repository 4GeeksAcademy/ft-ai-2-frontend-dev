import Link from "next/link";

export default function ProductPage({ params }: { params: { id: string } }) {
    return <div>
        <h1>Product {params.id}</h1>
        <Link href="/products/1">Product 1</Link>
        <Link href="/products/2">Product 2</Link>
        <Link href="/products/3">Product 3</Link>
    </div>
}
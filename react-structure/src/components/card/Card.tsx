import './Card.css';

export interface CardProps {
    title: string;
}

export default function Card({ title }: { title: string }) {
    return (
        <div className="card">
            <h1>{title}</h1>
        </div>
    )
}
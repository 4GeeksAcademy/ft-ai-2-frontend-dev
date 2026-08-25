interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
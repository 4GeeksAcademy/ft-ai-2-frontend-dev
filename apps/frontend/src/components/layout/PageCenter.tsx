interface PageCenterProps {
  children: React.ReactNode;
}

export function PageCenter({ children }: PageCenterProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      {children}
    </div>
  );
}
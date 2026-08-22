import { Card } from "@/components/ui/Card";
import { PageCenter } from "@/components/layout/PageCenter";

interface AuthFormProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Shared layout for auth form pages: centered page → card → title + children.
 */
export function AuthForm({ title, children }: AuthFormProps) {
  return (
    <PageCenter>
      <Card>
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">
          {title}
        </h1>
        {children}
      </Card>
    </PageCenter>
  );
}
type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold text-zinc-50">@{username}</h1>
      <p className="text-zinc-400">Profile UI lands in Session 2.</p>
    </main>
  );
}

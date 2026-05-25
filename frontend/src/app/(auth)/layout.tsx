export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-neutral-bg overflow-hidden">
      <div className="ambient-glow-wrapper" aria-hidden="true">
        <div className="ambient-glow-1" />
        <div className="ambient-glow-2" />
      </div>
      {children}
    </div>
  );
}

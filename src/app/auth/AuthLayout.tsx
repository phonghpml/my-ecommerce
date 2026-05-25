export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
      {/* Header */}
      <header className="py-4 border-b border-[color-mix(in srgb, var(--color-foreground) 30%, transparent)] text-center font-bold text-lg">
        My E‑Commerce
      </header>

      {/* Nội dung chính */}
      <main className="flex flex-1 items-center justify-center">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-[color-mix(in srgb, var(--color-foreground) 30%, transparent)] text-center text-sm">
        © 2026 My E‑Commerce. All rights reserved.
      </footer>
    </div>
  );
}

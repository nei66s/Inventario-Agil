import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import BackendSync from '@/components/backend-sync';
import SyncFab from '@/components/sync-fab';

export const metadata: Metadata = {
  title: 'Inventário Ágil',
  description: 'Gerencie eficientemente sua cadeia de suprimentos, do pedido a entrega.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const saved = localStorage.getItem('theme');
                  const theme = saved === 'dark' || saved === 'light'
                    ? saved
                    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                } catch {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <div className="relative min-h-screen bg-background text-foreground">
          <div className="fixed left-4 top-4 z-50 rounded-2xl border border-border bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground shadow-sm">
            SYNC TEST
          </div>
          {children}
        </div>
        <BackendSync />
        <SyncFab />
        <Toaster />
      </body>
    </html>
  );
}

import { AppShell } from '@/components/app-shell';

export default function PredictiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

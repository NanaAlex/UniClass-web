import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Uniclass - Notificações',
};

export default function LayoutNotificacoes({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
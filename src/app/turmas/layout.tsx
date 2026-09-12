import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Uniclass - Turmas',
};

export default function LayoutTurmas({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
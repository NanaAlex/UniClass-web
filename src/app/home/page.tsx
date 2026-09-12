import type { Metadata } from 'next';
import Home from '../components/Home';

export const metadata: Metadata = {
  title: 'Uniclass - Home',
};

export default function Page() {
  return (
    <Home />
  );
}
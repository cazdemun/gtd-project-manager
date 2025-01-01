import type { Metadata } from 'next'
import App from "@/components/app";

export const metadata: Metadata = {
  title: 'GTD Project Manager',
  description: 'Life is hit and miss and this',
}

export default function Home() {
  return (
    <App />
  );
}

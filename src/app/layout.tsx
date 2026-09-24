import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cyber Sentinel AI System - AI Cyber Threat & Scam Intelligence',
  description: 'AI-assisted threat detection, scam analysis, risk assessment, and role-specific cybersecurity platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}

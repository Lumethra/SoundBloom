import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SoundBloom",
  description: "Create your own ambient soundscapes",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const hasManualOverride = localStorage.getItem('manualOverride') === 'true';
                const savedTheme = localStorage.getItem('theme');
                
                if (hasManualOverride && (savedTheme === 'light' || savedTheme === 'dark')) {
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(savedTheme);
                } else {
                  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const systemTheme = isDark ? 'dark' : 'light';
                  
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(systemTheme);
                }
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}

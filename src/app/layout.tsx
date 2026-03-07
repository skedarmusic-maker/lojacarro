import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Plataforma Showroom",
    description: "Gerador de sites automotivos",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable}`}>
            <body className="antialiased font-sans bg-zinc-950" style={{ fontFamily: "var(--font-inter), sans-serif" }} suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}

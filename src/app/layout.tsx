import "./globals.css"; // Vamos importar se não apagamos
import type { Metadata } from "next";

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
        <html lang="pt-BR" suppressHydrationWarning>
            <body className="antialiased font-sans bg-zinc-950" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}

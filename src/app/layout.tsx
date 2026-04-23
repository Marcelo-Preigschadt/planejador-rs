import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planejador RS",
  description: "Sistema de planejamento docente da rede estadual do RS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
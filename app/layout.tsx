import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rafa Methods",
  description: "Panel de entrenamiento personal para clientes, rutinas y progreso."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

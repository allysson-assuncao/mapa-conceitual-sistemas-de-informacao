import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mapa Conceitual — Sistemas de Informação | IFMG Ouro Branco',
  description:
    'Explore o curso de Bacharelado em Sistemas de Informação do IFMG campus Ouro Branco: áreas de conhecimento, disciplinas, carreiras e conexões curriculares em um mapa interativo.',
  keywords: ['sistemas de informação', 'IFMG', 'mapa conceitual', 'currículo', 'carreiras TI'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

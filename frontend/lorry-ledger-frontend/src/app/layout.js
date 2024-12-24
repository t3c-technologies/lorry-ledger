import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Notification from "../components/Notification";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Lorry Ledger",
  description: "Lorry Ledger - Simplify Logistics and Fleet Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Notification />
        {children}
      </body>
    </html>
  );
}

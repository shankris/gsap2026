import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LastViewedTracker from "@/components/LastViewedTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GSAP Components",
  description: "A collection of GSAP animations and interactive demos.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang='en'
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <LastViewedTracker />
        {children}
      </body>
    </html>
  );
}

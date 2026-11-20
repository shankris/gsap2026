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
      <head>
        <link
          rel='preconnect'
          href='https://fonts.googleapis.com'
        />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Boldonse&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap'
          rel='stylesheet'
        />
      </head>
      <body>
        <LastViewedTracker />
        {children}
      </body>
    </html>
  );
}

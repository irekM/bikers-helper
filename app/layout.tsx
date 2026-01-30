import type { Metadata } from "next";
import Providers from "./providers";
import Navbar from "@/components/layout/Navbar";
import { Toolbar } from "@mui/material";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Bikers Helper",
  description: "Webscraper for motorcycle offers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <Toolbar />
          {children}
          <Footer />
          </Providers>
      </body>
    </html>
  );
}

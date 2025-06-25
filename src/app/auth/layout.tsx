import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "OncoVision - Autenticación",
  description: "Accede a tu cuenta de OncoVision",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
      <Toaster position="bottom-right" />
      <Footer />
    </div>
  );
}
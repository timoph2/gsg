import "./globals.css";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Providers } from "@/components/providers";
export const metadata = {
  title: "School Portal | GatherSG",
  description: "Teacher and class management",
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
          <header className="bg-white border-b border-gray-200">
            <nav className="max-w-[1140px] mx-auto px-6 flex items-center gap-12 h-17">
              <Link
                href="/classes"
                className="text-[#1260ba] font-bold flex items-center gap-2 text-sm"
              >
                <GraduationCap size={22} /> School Portal
              </Link>
              <div className="flex gap-8 h-full items-center text-sm font-semibold text-[#1260ba]">
                <Link href="/classes" className="hover:underline">
                  Classes
                </Link>
                <Link href="/teachers" className="hover:underline">
                  Teachers
                </Link>
              </div>
            </nav>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}

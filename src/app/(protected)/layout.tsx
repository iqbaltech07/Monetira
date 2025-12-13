import type { Metadata } from "next";
import { Navbar } from "~/components/shared/Navbar";
import { Sidebar } from "~/components/shared/Sidebar";
import { BottomNav } from "~/components/shared/BottomNav";

export const metadata: Metadata = {
  title: "Dasbor Keuangan",
  description: "Manajemen keuangan pribadi Anda.",
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Navbar />
        <main className="md:mx-4">
          <div className="mx-auto max-w-screen-2xl px-4 py-8 my-12 md:my-0 md:p-6 2xl:p-10 bg-slate-100 rounded-2xl">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

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
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Navbar />
        <main className="flex-1 px-4 py-6 pb-20 md:p-6 md:pb-8 2xl:p-8">
          <div className="mx-auto max-w-screen-2xl">{children}</div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

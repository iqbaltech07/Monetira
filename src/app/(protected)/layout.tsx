import type { Metadata } from "next";
import { Navbar } from "~/components/shared/Navbar";
import { Sidebar } from "~/components/shared/Sidebar";

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
        <main className="m-4">
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-slate-100 rounded-2xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

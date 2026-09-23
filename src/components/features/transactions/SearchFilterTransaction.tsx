import { Filter } from "lucide-react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface SearchFilterTransactionProps {
  className?: string;
}

const SearchFilterTransaction = ({
  className,
}: SearchFilterTransactionProps) => {
  return (
    <div
      className={`flex flex-col sm:flex-row w-full gap-3 bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800 ${
        className || ""
      }`}
    >
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <FaMagnifyingGlass size={14} />
        </span>
        <Input
          placeholder="Cari transaksi..."
          className="pl-9 h-10 text-sm bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"
        />
      </div>
      <div className="w-full sm:w-48 shrink-0 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10">
          <Filter size={14} />
        </span>
        <Select defaultValue="all">
          <SelectTrigger className="w-full pl-9 h-10 text-sm bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="Income">Pemasukan</SelectItem>
            <SelectItem value="Expense">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchFilterTransaction;

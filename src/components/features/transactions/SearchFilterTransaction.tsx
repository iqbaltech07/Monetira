"use client";

import { Download, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Category } from "~/types/database";

interface SearchFilterTransactionProps {
  className?: string;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  filterType: string;
  onFilterTypeChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  categories: Category[];
  onExportCSV?: () => void;
}

const SearchFilterTransaction = ({
  className,
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onExportCSV,
}: SearchFilterTransactionProps) => {
  return (
    <div
      className={`flex flex-col md:flex-row w-full gap-2.5 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 ${
        className || ""
      }`}
    >
      {/* Search Input */}
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <Search size={16} />
        </span>
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari catatan transaksi..."
          className="pl-9 h-10 text-sm bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl"
        />
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        {/* Filter Type */}
        <div className="w-full sm:w-36 shrink-0">
          <Select value={filterType} onValueChange={onFilterTypeChange}>
            <SelectTrigger className="w-full h-10 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl">
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="Income">Pemasukan</SelectItem>
              <SelectItem value="Expense">Pengeluaran</SelectItem>
              <SelectItem value="Transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Category */}
        <div className="w-full sm:w-44 shrink-0">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full h-10 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Export Button */}
        {onExportCSV && (
          <Button
            type="button"
            variant="outline"
            onClick={onExportCSV}
            className="h-10 px-3 shrink-0 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
            title="Ekspor CSV"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchFilterTransaction;

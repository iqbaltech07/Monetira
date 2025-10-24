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

const SearchFilterTransaction = () => {
  return (
    <div className="flex gap-4 bg-white p-4 rounded-lg shadow-xl shadow-slate-300/40">
      <div className="relative w-3/4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          <FaMagnifyingGlass size={16} className="text-gray-500" />
        </span>
        <Input placeholder="Search..." className="pl-9 font-medium" />
      </div>
      <div className="w-1/4 flex relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 z-50">
          <Filter size={16} className="text-gray-500" />
        </span>
        <Select>
          <SelectTrigger className="w-full pl-10">
            <SelectValue placeholder="Semua" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Semua</SelectItem>
            <SelectItem value="dark">Gaji</SelectItem>
            <SelectItem value="system">Freelance</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchFilterTransaction;

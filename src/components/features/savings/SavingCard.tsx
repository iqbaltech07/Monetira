import { Edit3, Trash2 } from "lucide-react";

const BadgeCard = ({ name, bgColor }: { name: string; bgColor: string }) => {
  return (
    <div
      className={`rounded-full py-1 px-3 text-xs text-purple-600 ${bgColor}`}
    >
      {name}
    </div>
  );
};

const SavingCard = () => {
  return (
    <div className="p-4 rounded-xl border bg-white">
      <div className="flex justify-between">
        <div className="">
          <h2 className="text-lg">Liburan ke Bali</h2>
          <p className="text-gray-500 text-sm">
            Tabungan untuk liburan keluarga ke Bali
          </p>
        </div>
        <div className="mx-2 flex items-center gap-4">
          <button type="button">
            <Edit3 size={18} />
          </button>
          <button type="button">
            <Trash2 size={18} color="red" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 my-3 font-semibold">
        <BadgeCard name="Liburan" bgColor="bg-purple-200" />
      </div>
    </div>
  );
};

export default SavingCard;

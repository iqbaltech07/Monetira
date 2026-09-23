"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { TransactionForm } from "~/components/features/transactions/TransactionForm";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import type { Category } from "~/types/database";

interface ButtonNewTransactionProps {
  categories: Category[];
}

const ButtonNewTransaction = ({ categories }: ButtonNewTransactionProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl text-sm sm:text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm cursor-pointer transition-all flex items-center gap-2 shrink-0">
          <PlusIcon className="size-4 sm:size-5" />
          <span>Buat Transaksi Baru</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Form Transaksi</DialogTitle>
          <DialogDescription>
            Masukkan detail transaksi baru Anda di sini.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          categories={categories}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ButtonNewTransaction;

"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { SavingForm } from "~/components/features/savings/SavingForm";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

const ButtonNewTarget = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl text-sm sm:text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm cursor-pointer transition-all flex items-center gap-2 shrink-0">
          <PlusIcon className="size-4 sm:size-5" />
          <span>Buat Target Baru</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Target Tabungan Baru</DialogTitle>
          <DialogDescription>
            Tentukan tujuan finansial Anda selanjutnya.
          </DialogDescription>
        </DialogHeader>
        <SavingForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default ButtonNewTarget;

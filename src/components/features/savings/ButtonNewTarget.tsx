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
        <Button className="flex gap-2 items-center px-4! py-4 lg:px-6! lg:py-6 rounded-full lg:text-lg bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary-light-active hover:opacity-80 cursor-pointer transition-all">
          <PlusIcon className="size-5 lg:size-6 -ml-1" /> Buat Target Baru
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

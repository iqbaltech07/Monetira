import { PlusIcon } from "lucide-react";
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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex gap-2 items-center px-4! py-4 lg:px-6! lg:py-6 rounded-full lg:text-lg bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary-light-active hover:opacity-80 cursor-pointer transition-all">
          <PlusIcon className="size-5 lg:size-6 -ml-1" /> Buat Target Baru
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Form Target</DialogTitle>
          <DialogDescription>
            Pengisian Target
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ButtonNewTarget;

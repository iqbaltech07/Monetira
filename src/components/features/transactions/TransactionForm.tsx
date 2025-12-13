"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import type { Category } from "~/types/database";

const formSchema = z.object({
  type: z.enum(["Income", "Expense"]),
  amount: z.coerce.number().min(1, "Jumlah harus lebih dari 0"),
  category_id: z.string().min(1, "Kategori harus dipilih"),
  date: z.date(),
  note: z.string().optional(),
});

interface TransactionFormProps {
  categories: Category[];
  onSuccess?: () => void;
}

export function TransactionForm({
  categories,
  onSuccess,
}: TransactionFormProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "Expense" as const,
      amount: 0,
      category_id: "",
      date: new Date(),
      note: "",
    },
  });

  const filteredCategories = categories.filter(
    (c) => c.type === form.watch("type"),
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // In a real app, this would call an API or Server Action
    // For now, we just log it and close the modal
    if (onSuccess) {
      onSuccess();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Transaksi</FormLabel>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={field.value === "Income" ? "default" : "outline"}
                  className={cn(
                    "w-full",
                    field.value === "Income" &&
                      "bg-emerald-600 hover:bg-emerald-700",
                  )}
                  onClick={() => {
                    field.onChange("Income");
                    form.setValue("category_id", ""); // Reset category on type change
                  }}
                >
                  Pemasukan
                </Button>
                <Button
                  type="button"
                  variant={field.value === "Expense" ? "default" : "outline"}
                  className={cn(
                    "w-full",
                    field.value === "Expense" &&
                      "bg-rose-600 hover:bg-rose-700",
                  )}
                  onClick={() => {
                    field.onChange("Expense");
                    form.setValue("category_id", "");
                  }}
                >
                  Pengeluaran
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  value={field.value as number}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan (Opsional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Contoh: Makan siang di warteg"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Simpan Transaksi
        </Button>
      </form>
    </Form>
  );
}

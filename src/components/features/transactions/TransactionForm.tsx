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
import { useMonetira } from "~/lib/store/monetira-context";
import { cn } from "~/lib/utils";
import type { Category, Transaction } from "~/types/database";

const formSchema = z.object({
  type: z.enum(["Income", "Expense"]),
  amount: z.coerce.number().min(1, "Jumlah harus lebih dari 0"),
  category_id: z.string().min(1, "Kategori harus dipilih"),
  date: z.string().min(1, "Tanggal harus diisi"),
  note: z.string().optional(),
});

interface TransactionFormProps {
  initialData?: Transaction | null;
  categories?: Category[];
  onSuccess?: () => void;
}

export function TransactionForm({
  initialData,
  categories: propCategories,
  onSuccess,
}: TransactionFormProps) {
  const {
    categories: storeCategories,
    addTransaction,
    updateTransaction,
  } = useMonetira();

  const categories = propCategories || storeCategories;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialData?.type || ("Expense" as const),
      amount: initialData?.amount || 0,
      category_id: initialData?.category_id || "",
      date: initialData?.date
        ? format(new Date(initialData.date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      note: initialData?.note || "",
    },
  });

  const selectedType = form.watch("type");
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const txDate = new Date(values.date);

    if (initialData) {
      updateTransaction(initialData.id, {
        type: values.type,
        amount: values.amount,
        category_id: values.category_id,
        date: txDate,
        note: values.note,
      });
    } else {
      addTransaction({
        type: values.type,
        amount: values.amount,
        category_id: values.category_id,
        date: txDate,
        note: values.note,
      });
    }

    if (onSuccess) {
      onSuccess();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Type Toggle */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Transaksi</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={field.value === "Expense" ? "default" : "outline"}
                  className={cn(
                    "w-full h-10 font-semibold cursor-pointer",
                    field.value === "Expense"
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "border-slate-200 dark:border-slate-800",
                  )}
                  onClick={() => {
                    field.onChange("Expense");
                    form.setValue("category_id", "");
                  }}
                >
                  Pengeluaran
                </Button>
                <Button
                  type="button"
                  variant={field.value === "Income" ? "default" : "outline"}
                  className={cn(
                    "w-full h-10 font-semibold cursor-pointer",
                    field.value === "Income"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "border-slate-200 dark:border-slate-800",
                  )}
                  onClick={() => {
                    field.onChange("Income");
                    form.setValue("category_id", "");
                  }}
                >
                  Pemasukan
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nominal Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nominal Transaksi (Rp)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  min="1"
                  step="500"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={
                    Number.isNaN(field.value) || !field.value
                      ? ""
                      : (field.value as number)
                  }
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  className="text-base font-semibold"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Select */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Kategori" />
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

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal Transaksi</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Note / Deskripsi */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan / Keterangan (Opsional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Contoh: Makan siang nasi padang, Gaji freelance..."
                  className="resize-none"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className={cn(
            "w-full h-11 text-base font-semibold text-white",
            selectedType === "Income"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-blue-600 hover:bg-blue-700",
          )}
        >
          {initialData ? "Simpan Perubahan Transaksi" : "Catat Transaksi"}
        </Button>
      </form>
    </Form>
  );
}

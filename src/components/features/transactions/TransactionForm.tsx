"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";
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
import { cn, formatCurrency } from "~/lib/utils";
import type { Category, Transaction } from "~/types/database";

const formSchema = z.object({
  type: z.enum(["Expense", "Income", "Transfer"]),
  amount: z.coerce.number().min(1, "Jumlah harus lebih dari 0"),
  source_account_id: z.string().optional(),
  destination_account_id: z.string().optional(),
  category_id: z.string().optional(),
  date: z.string().min(1, "Tanggal harus diisi"),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
    accounts,
    mainAccount,
    getAccountBalance,
    createIncome,
    createExpense,
    createTransfer,
    updateTransaction,
  } = useMonetira();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories = propCategories || storeCategories;

  const defaultMainId =
    mainAccount?.id ||
    accounts.find((a) => a.type === "MAIN")?.id ||
    "acc_main_default";

  const defaultSource =
    initialData?.source_account_id || initialData?.account_id || defaultMainId;

  const defaultDest =
    initialData?.destination_account_id ||
    (initialData?.type === "Income"
      ? initialData.account_id || defaultMainId
      : accounts.find((a) => a.id !== defaultSource)?.id || "");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: (initialData?.type || "Expense") as
        | "Expense"
        | "Income"
        | "Transfer",
      amount: initialData?.amount || 0,
      source_account_id: defaultSource,
      destination_account_id: defaultDest,
      category_id: initialData?.category_id || "",
      date: initialData?.date
        ? format(new Date(initialData.date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      note: initialData?.note || "",
    },
  });

  const selectedType = form.watch("type");
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  function onSubmit(values: FormValues) {
    setErrorMessage(null);

    if (
      values.type !== "Transfer" &&
      (!values.category_id || values.category_id.trim() === "")
    ) {
      setErrorMessage(
        "Kategori harus dipilih untuk pemasukan dan pengeluaran.",
      );
      return;
    }

    if (values.type === "Transfer") {
      if (!values.source_account_id || !values.destination_account_id) {
        setErrorMessage("Rekening sumber dan rekening tujuan harus dipilih.");
        return;
      }
      if (values.source_account_id === values.destination_account_id) {
        setErrorMessage("Rekening sumber dan tujuan tidak boleh sama.");
        return;
      }
    }

    const txDate = new Date(values.date);

    if (initialData) {
      const res = updateTransaction(initialData.id, {
        type: values.type,
        amount: values.amount,
        accountId:
          values.type === "Transfer"
            ? values.source_account_id
            : values.type === "Income"
              ? values.destination_account_id
              : values.source_account_id,
        sourceAccountId:
          values.type === "Transfer" || values.type === "Expense"
            ? values.source_account_id
            : null,
        destinationAccountId:
          values.type === "Transfer" || values.type === "Income"
            ? values.destination_account_id
            : null,
        categoryId: values.type === "Transfer" ? null : values.category_id,
        date: txDate,
        note: values.note,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal memperbarui transaksi.");
        return;
      }
    } else {
      let res: { success: boolean; error?: string };
      if (values.type === "Income") {
        res = createIncome({
          accountId: values.destination_account_id,
          amount: values.amount,
          categoryId: values.category_id,
          date: txDate,
          note: values.note,
        });
      } else if (values.type === "Transfer") {
        res = createTransfer({
          sourceAccountId: values.source_account_id || defaultMainId,
          destinationAccountId: values.destination_account_id || "",
          amount: values.amount,
          date: txDate,
          note: values.note,
        });
      } else {
        res = createExpense({
          accountId: values.source_account_id,
          amount: values.amount,
          categoryId: values.category_id,
          date: txDate,
          note: values.note,
        });
      }

      if (!res.success) {
        setErrorMessage(res.error || "Gagal membuat transaksi.");
        return;
      }
    }

    if (onSuccess) {
      onSuccess();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Error Banner */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Type Toggle: 3-way selection */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Transaksi</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={field.value === "Expense" ? "default" : "outline"}
                  className={cn(
                    "w-full h-10 text-xs sm:text-sm font-semibold cursor-pointer transition-all",
                    field.value === "Expense"
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300",
                  )}
                  onClick={() => {
                    field.onChange("Expense");
                    setErrorMessage(null);
                    form.setValue("category_id", "");
                    if (!form.getValues("source_account_id")) {
                      form.setValue("source_account_id", defaultMainId);
                    }
                  }}
                >
                  Pengeluaran
                </Button>
                <Button
                  type="button"
                  variant={field.value === "Income" ? "default" : "outline"}
                  className={cn(
                    "w-full h-10 text-xs sm:text-sm font-semibold cursor-pointer transition-all",
                    field.value === "Income"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300",
                  )}
                  onClick={() => {
                    field.onChange("Income");
                    setErrorMessage(null);
                    form.setValue("category_id", "");
                    if (!form.getValues("destination_account_id")) {
                      form.setValue("destination_account_id", defaultMainId);
                    }
                  }}
                >
                  Pemasukan
                </Button>
                <Button
                  type="button"
                  variant={field.value === "Transfer" ? "default" : "outline"}
                  className={cn(
                    "w-full h-10 text-xs sm:text-sm font-semibold cursor-pointer transition-all",
                    field.value === "Transfer"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300",
                  )}
                  onClick={() => {
                    field.onChange("Transfer");
                    setErrorMessage(null);
                    form.setValue("category_id", "");
                    if (!form.getValues("source_account_id")) {
                      form.setValue("source_account_id", defaultMainId);
                    }
                    if (
                      !form.getValues("destination_account_id") ||
                      form.getValues("destination_account_id") === defaultMainId
                    ) {
                      const otherAcc = accounts.find(
                        (a) => a.id !== defaultMainId,
                      );
                      if (otherAcc) {
                        form.setValue("destination_account_id", otherAcc.id);
                      }
                    }
                  }}
                >
                  Transfer
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
                  onChange={(e) => {
                    setErrorMessage(null);
                    field.onChange(Number(e.target.value) || 0);
                  }}
                  className="text-base font-semibold"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account Selection: Expense (Source), Income (Destination), Transfer (Source & Destination) */}
        {selectedType === "Expense" && (
          <FormField
            control={form.control}
            name="source_account_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rekening Sumber</FormLabel>
                <Select
                  onValueChange={(val) => {
                    setErrorMessage(null);
                    field.onChange(val);
                  }}
                  value={field.value || defaultMainId}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Rekening Sumber" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(getAccountBalance(acc.id))})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedType === "Income" && (
          <FormField
            control={form.control}
            name="destination_account_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rekening Tujuan</FormLabel>
                <Select
                  onValueChange={(val) => {
                    setErrorMessage(null);
                    field.onChange(val);
                  }}
                  value={field.value || defaultMainId}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Rekening Tujuan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(getAccountBalance(acc.id))})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedType === "Transfer" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="source_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dari Rekening</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      setErrorMessage(null);
                      field.onChange(val);
                    }}
                    value={field.value || defaultMainId}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Rekening Sumber" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} (
                          {formatCurrency(getAccountBalance(acc.id))})
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
              name="destination_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ke Rekening</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      setErrorMessage(null);
                      field.onChange(val);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Rekening Tujuan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} (
                          {formatCurrency(getAccountBalance(acc.id))})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Category Select (Only for Expense & Income) */}
        {selectedType !== "Transfer" && (
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
        )}

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
                  placeholder="Contoh: Makan siang nasi padang, Gaji freelance, Nabung emas..."
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
            "w-full h-11 text-base font-semibold text-white transition-all cursor-pointer",
            selectedType === "Income"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : selectedType === "Transfer"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-rose-600 hover:bg-rose-700",
          )}
        >
          {initialData
            ? "Simpan Perubahan Transaksi"
            : selectedType === "Income"
              ? "Catat Pemasukan"
              : selectedType === "Transfer"
                ? "Kirim Transfer Dana"
                : "Catat Pengeluaran"}
        </Button>
      </form>
    </Form>
  );
}

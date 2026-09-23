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
import { useMonetira } from "~/lib/store/monetira-context";
import type { Saving } from "~/types/database";

const formSchema = z.object({
  name: z.string().min(1, "Nama target harus diisi"),
  target_amount: z.coerce.number().min(1, "Target nominal harus lebih dari 0"),
  deadline: z.string().optional(),
  emoji: z.string().optional(),
});

interface SavingFormProps {
  initialData?: Saving | null;
  onSuccess?: () => void;
}

const EMOJI_OPTIONS = [
  "💰",
  "🛡️",
  "✈️",
  "💻",
  "🏠",
  "🚗",
  "💍",
  "🎓",
  "📱",
  "🏖️",
  "📈",
  "🎁",
];

export function SavingForm({ initialData, onSuccess }: SavingFormProps) {
  const { addSaving, updateSaving } = useMonetira();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      target_amount: initialData?.target_amount || 0,
      deadline: initialData?.deadline
        ? format(new Date(initialData.deadline), "yyyy-MM-dd")
        : "",
      emoji: initialData?.emoji || "💰",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const deadlineDate = values.deadline
      ? new Date(values.deadline)
      : undefined;

    if (initialData) {
      updateSaving(initialData.id, {
        name: values.name,
        target_amount: values.target_amount,
        deadline: deadlineDate,
        emoji: values.emoji || "💰",
      });
    } else {
      addSaving({
        name: values.name,
        target_amount: values.target_amount,
        deadline: deadlineDate,
        emoji: values.emoji || "💰",
      });
    }

    if (onSuccess) {
      onSuccess();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Nama Target */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Target Tabungan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: Dana Darurat, Liburan Jepang"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Target Nominal */}
        <FormField
          control={form.control}
          name="target_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Nominal (Rp)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Contoh: 10000000"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={
                    Number.isNaN(field.value) || !field.value
                      ? ""
                      : (field.value as number)
                  }
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Target Tanggal */}
        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Batas Waktu / Deadline (Opsional)</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Emoji Selector */}
        <FormField
          control={form.control}
          name="emoji"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pilih Ikon / Emoji</FormLabel>
              <div className="flex flex-wrap gap-2 pt-1">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => field.onChange(emoji)}
                    className={`h-9 w-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                      field.value === emoji
                        ? "border-blue-600 bg-blue-50 scale-110 shadow-xs dark:bg-blue-950/40"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-800"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
        >
          {initialData ? "Simpan Perubahan Target" : "Buat Target Tabungan"}
        </Button>
      </form>
    </Form>
  );
}

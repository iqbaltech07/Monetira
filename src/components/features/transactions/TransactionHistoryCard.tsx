"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import { mockDetailedTransactions } from "~/lib/placeholder-data";
import { TransactionItem } from "./TransactionItem";

type FilterType = "ALL" | "INCOME" | "EXPENSE";

export function TransactionHistoryCard() {
  const transactions = mockDetailedTransactions;

  const [filter, setFilter] = useState<FilterType>("ALL");

  const filteredTransactions = useMemo(() => {
    if (filter === "ALL") return transactions;

    return transactions.filter((tx) => tx.type.toUpperCase() === filter);
  }, [transactions, filter]);

  return (
    <Card className="shadow-xl shadow-slate-300/40 border-0 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800">
          Riwayat Transaksi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="ALL"
          onValueChange={(value) => setFilter(value as FilterType)}
        >
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100/80 p-1">
            <TabsTrigger
              value="ALL"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
            >
              Semua
            </TabsTrigger>
            <TabsTrigger
              value="INCOME"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 rounded-md transition-all"
            >
              Pemasukan
            </TabsTrigger>
            <TabsTrigger
              value="EXPENSE"
              className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 rounded-md transition-all"
            >
              Pengeluaran
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col gap-1">
            {filteredTransactions.map((tx, index) => (
              <div key={tx.id}>
                <TransactionItem tx={tx} />
                {index < filteredTransactions.length - 1 && (
                  <Separator className="my-2 bg-slate-100" />
                )}
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm">
                  Tidak ada transaksi ditemukan.
                </p>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

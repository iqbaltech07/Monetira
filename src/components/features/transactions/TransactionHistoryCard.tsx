"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import {
  mockDetailedTransactions,
  type DetailedTransaction,
} from "~/lib/placeholder-data";
import { TransactionItem } from "./TransactionItem";

export function TransactionHistoryCard() {
  const transactions = mockDetailedTransactions;
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  const filteredTransactions = useMemo(() => {
    if (filter === "ALL") return transactions;
    return transactions.filter((tx) => tx.type === filter);
  }, [transactions, filter]);

  return (
    <Card className="shadow-xl shadow-slate-300/40 border-0">
      <CardHeader>
        <CardTitle>Riwayat Transaksi</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="ALL"
          onValueChange={(value) => setFilter(value as any)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ALL">Semua</TabsTrigger>
            <TabsTrigger value="INCOME">Pemasukan</TabsTrigger>
            <TabsTrigger value="EXPENSE">Pengeluaran</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            {filteredTransactions.map((tx, index) => (
              <div key={tx.id}>
                <TransactionItem tx={tx} />
                {index < filteredTransactions.length - 1 && <Separator />}
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada transaksi.
              </p>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
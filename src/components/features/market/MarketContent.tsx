"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  LineChart,
  Search,
  Star,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Input } from "~/components/ui/input";
import { useGsapReveal } from "~/lib/gsap";
import { INITIAL_MARKET_ASSETS } from "~/lib/store/initial-data";
import { useMonetira } from "~/lib/store/monetira-context";
import { formatCurrency } from "~/lib/utils";
import type { MarketAsset } from "~/types/database";

export function MarketContent() {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.05, y: 15 });
  const { watchlist, toggleWatchlist, isWatchlisted } = useMonetira();

  const [selectedCategory, setSelectedCategory] = useState<
    "ALL" | "Crypto" | "Stock" | "Commodity" | "WATCHLIST"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset>(
    INITIAL_MARKET_ASSETS[0],
  );

  // Converter state
  const [convertAmount, setConvertAmount] = useState<number>(1000000);
  const [fromAsset, setFromAsset] = useState<string>("IDR");
  const [toAsset, setToAsset] = useState<string>("GOLD");

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return INITIAL_MARKET_ASSETS.filter((asset) => {
      // Category filter
      if (selectedCategory === "WATCHLIST") {
        if (!watchlist.includes(asset.symbol)) return false;
      } else if (
        selectedCategory !== "ALL" &&
        asset.category !== selectedCategory &&
        !(selectedCategory === "Commodity" && asset.category === "Forex")
      ) {
        return false;
      }

      // Search filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          asset.name.toLowerCase().includes(q) ||
          asset.symbol.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [selectedCategory, searchQuery, watchlist]);

  // Chart data for selected asset
  const chartData = useMemo(() => {
    return selectedAsset.sparkline.map((val, idx) => ({
      time: `H-${6 - idx}`,
      price: val,
    }));
  }, [selectedAsset]);

  // Converter logic
  const convertedResult = useMemo(() => {
    if (!convertAmount || convertAmount <= 0) return 0;

    // Convert from source to IDR first
    let amountInIDR = convertAmount;
    if (fromAsset === "USD") amountInIDR = convertAmount * 15850;
    else if (fromAsset !== "IDR") {
      const asset = INITIAL_MARKET_ASSETS.find((a) => a.symbol === fromAsset);
      if (asset) amountInIDR = convertAmount * asset.price;
    }

    // Convert from IDR to target asset
    if (toAsset === "IDR") return amountInIDR;
    if (toAsset === "USD") return amountInIDR / 15850;

    const target = INITIAL_MARKET_ASSETS.find((a) => a.symbol === toAsset);
    if (target && target.price > 0) {
      return amountInIDR / target.price;
    }

    return 0;
  }, [convertAmount, fromAsset, toAsset]);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="gsap-fade-up flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <LineChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>Pasar Finansial & Aset</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Pantau pergerakan harga kripto, saham IHSG, valuta asing, dan emas
            secara terintegrasi.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari simbol atau aset..."
            className="pl-9 h-10 text-xs sm:text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
          />
        </div>
      </div>

      {/* Featured Interactive Chart Card */}
      <div className="gsap-fade-up rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner">
              {selectedAsset.icon || "📈"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedAsset.name}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {selectedAsset.symbol}
                </span>
                <button
                  type="button"
                  onClick={() => toggleWatchlist(selectedAsset.symbol)}
                  className="p-1 rounded-md text-slate-400 hover:text-amber-500 transition-colors"
                  title="Bookmark Watchlist"
                >
                  <Star
                    className={`h-4 w-4 ${
                      isWatchlisted(selectedAsset.symbol)
                        ? "fill-amber-400 text-amber-400"
                        : ""
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Kategori: {selectedAsset.category} • Volume:{" "}
                {selectedAsset.volume}
              </p>
            </div>
          </div>

          <div className="flex items-baseline sm:items-end flex-col">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(selectedAsset.price)}
            </span>
            <div
              className={`inline-flex items-center gap-1 text-xs font-bold ${
                selectedAsset.change24h >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {selectedAsset.change24h >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              <span>
                {selectedAsset.change24h >= 0 ? "+" : ""}
                {selectedAsset.change24h}% (24 Jam)
              </span>
            </div>
          </div>
        </div>

        {/* Chart View */}
        <div className="pt-4 h-52 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="marketTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={
                      selectedAsset.change24h >= 0 ? "#10b981" : "#f43f5e"
                    }
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={
                      selectedAsset.change24h >= 0 ? "#10b981" : "#f43f5e"
                    }
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={["auto", "auto"]} hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg">
                        <p className="font-bold">Index: {payload[0]?.value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={selectedAsset.change24h >= 0 ? "#10b981" : "#f43f5e"}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#marketTrend)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid 2 Column: Asset Table + Currency Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Asset Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL" as const, label: "Semua Aset" },
              { id: "Crypto" as const, label: "Kripto" },
              { id: "Stock" as const, label: "Saham Indonesia" },
              { id: "Commodity" as const, label: "Komoditas & Valas" },
              {
                id: "WATCHLIST" as const,
                label: `Watchlist (${watchlist.length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                }`}
              >
                {tab.id === "WATCHLIST" ? "⭐ " : ""}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Asset List */}
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {filteredAssets.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p className="text-2xl mb-1">🔍</p>
                <p className="text-sm font-medium">Tidak ada aset ditemukan</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAsset.symbol === asset.symbol;
                  return (
                    <button
                      type="button"
                      key={asset.symbol}
                      onClick={() => setSelectedAsset(asset)}
                      className={`w-full text-left flex items-center justify-between p-3.5 sm:px-4 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50/60 dark:bg-blue-950/20"
                          : "hover:bg-slate-50/80 dark:hover:bg-slate-850/50"
                      }`}
                    >
                      {/* Asset Identity */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(asset.symbol);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              toggleWatchlist(asset.symbol);
                            }
                          }}
                          className="text-slate-300 hover:text-amber-400 transition-colors"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              isWatchlisted(asset.symbol)
                                ? "fill-amber-400 text-amber-400"
                                : ""
                            }`}
                          />
                        </span>
                        <span className="text-xl shrink-0">{asset.icon}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                            {asset.name}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-400 uppercase">
                            {asset.symbol} • {asset.category}
                          </p>
                        </div>
                      </div>

                      {/* Asset Price & 24h Change */}
                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          {formatCurrency(asset.price)}
                        </p>
                        <span
                          className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${
                            asset.change24h >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {asset.change24h >= 0 ? "+" : ""}
                          {asset.change24h}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Currency & Asset Converter (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Calculator className="h-4 w-4 text-blue-600" />
              <span>Kalkulator Konversi</span>
            </h3>

            <div className="space-y-3.5">
              {/* Dari */}
              <div>
                <label
                  htmlFor="convert-amount"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Dari
                </label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="convert-amount"
                    type="number"
                    min="1"
                    value={convertAmount || ""}
                    onChange={(e) => setConvertAmount(Number(e.target.value))}
                    className="flex-1 text-sm font-semibold"
                  />
                  <select
                    value={fromAsset}
                    onChange={(e) => setFromAsset(e.target.value)}
                    className="w-24 px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold dark:border-slate-800 dark:bg-slate-800"
                  >
                    <option value="IDR">IDR (Rp)</option>
                    <option value="USD">USD ($)</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="GOLD">Emas</option>
                  </select>
                </div>
              </div>

              {/* Ke */}
              <div>
                <label
                  htmlFor="to-asset-select"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Dikonversi Menjadi
                </label>
                <div className="flex gap-2 mt-1">
                  <select
                    id="to-asset-select"
                    value={toAsset}
                    onChange={(e) => setToAsset(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold dark:border-slate-800 dark:bg-slate-800"
                  >
                    <option value="IDR">Rupiah (IDR)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="GOLD">Emas Antam (Gram)</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="BBCA">Saham BBCA (Lembar)</option>
                  </select>
                </div>
              </div>

              {/* Hasil Estimasi */}
              <div className="rounded-xl bg-blue-50/60 p-3.5 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40">
                <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  Hasil Estimasi
                </p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {toAsset === "IDR"
                    ? formatCurrency(convertedResult)
                    : toAsset === "USD"
                      ? `$ ${convertedResult.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
                      : `${convertedResult.toLocaleString("id-ID", { maximumFractionDigits: 4 })} ${toAsset}`}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Berdasarkan kurs indikatif pasar terkini
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  LineChart,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
import Image from "next/image";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useGsapReveal } from "~/lib/gsap";
import { INITIAL_MARKET_ASSETS } from "~/lib/store/initial-data";
import { useMonetira } from "~/lib/store/monetira-context";
import { formatCurrency } from "~/lib/utils";
import type { MarketAsset } from "~/types/database";

export function formatMarketPrice(
  price: number,
  currency: string = "IDR",
): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }
  if (currency === "EUR") {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function MarketContent() {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.05, y: 15 });
  const { watchlist, toggleWatchlist, isWatchlisted } = useMonetira();

  const [marketAssets, setMarketAssets] = useState<MarketAsset[]>(
    INITIAL_MARKET_ASSETS,
  );
  const [selectedCategory, setSelectedCategory] = useState<
    "ALL" | "Crypto" | "Stock" | "Commodity" | "Forex" | "WATCHLIST"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>("BTC");

  // Live status
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [dataSource, setDataSource] = useState<"live" | "cache" | "mock">(
    "mock",
  );
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Forex rates mapping to IDR (default baselines)
  const [forexRates, setForexRates] = useState<Record<string, number>>({
    IDR: 1,
    USD: 16000,
    EUR: 17500,
    GBP: 20500,
    SGD: 12200,
    JPY: 110,
    AUD: 10500,
    CNY: 2200,
    MYR: 3600,
    SAR: 4260,
  });

  // Fetch real-time data from CoinGecko, ExchangeRate API, Gold API & Stock API
  const fetchMarketData = useCallback(async (customSearch?: string) => {
    setIsLoadingLive(true);
    try {
      const stockUrl =
        customSearch && customSearch.trim().length >= 2
          ? `/api/market/stocks?q=${encodeURIComponent(customSearch.trim())}`
          : "/api/market/stocks";

      const [cryptoRes, forexRes, goldRes, stockRes] = await Promise.allSettled(
        [
          fetch("/api/market/crypto"),
          fetch("/api/market/forex"),
          fetch("/api/market/gold"),
          fetch(stockUrl),
        ],
      );

      let newCryptoAssets: MarketAsset[] = [];
      let newForexAssets: MarketAsset[] = [];
      let newGoldAssets: MarketAsset[] = [];
      let newStockAssets: MarketAsset[] = [];

      if (cryptoRes.status === "fulfilled" && cryptoRes.value.ok) {
        const json = await cryptoRes.value.json();
        if (json.success && Array.isArray(json.assets)) {
          newCryptoAssets = json.assets;
        }
      }

      if (forexRes.status === "fulfilled" && forexRes.value.ok) {
        const json = await forexRes.value.json();
        if (json.success && Array.isArray(json.assets)) {
          newForexAssets = json.assets;
        }
        if (json.rates) {
          setForexRates(json.rates);
        }
      }

      if (goldRes.status === "fulfilled" && goldRes.value.ok) {
        const json = await goldRes.value.json();
        if (json.success && Array.isArray(json.assets)) {
          newGoldAssets = json.assets;
        }
      }

      if (stockRes.status === "fulfilled" && stockRes.value.ok) {
        const json = await stockRes.value.json();
        if (json.success && Array.isArray(json.assets)) {
          newStockAssets = json.assets;
        }
      }

      const hasNewData =
        newCryptoAssets.length > 0 ||
        newForexAssets.length > 0 ||
        newGoldAssets.length > 0 ||
        newStockAssets.length > 0;

      if (hasNewData) {
        setDataSource("live");
        setLastUpdated(new Date().toISOString());

        setMarketAssets((prev) => {
          const cryptoList =
            newCryptoAssets.length > 0
              ? newCryptoAssets
              : prev.filter((a) => a.category === "Crypto");
          const forexList =
            newForexAssets.length > 0
              ? newForexAssets
              : prev.filter((a) => a.category === "Forex");
          const goldList =
            newGoldAssets.length > 0
              ? newGoldAssets
              : prev.filter((a) => a.category === "Commodity");
          const stockList =
            newStockAssets.length > 0
              ? newStockAssets
              : prev.filter((a) => a.category === "Stock");

          return [...cryptoList, ...goldList, ...stockList, ...forexList];
        });
      }
    } catch (err) {
      console.error("Market data fetch failed:", err);
    } finally {
      setIsLoadingLive(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  // Debounced search for stocks when search query is entered and Stock tab is active
  useEffect(() => {
    if (selectedCategory === "Stock" && searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        fetchMarketData(searchQuery.trim());
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, selectedCategory, fetchMarketData]);

  // Selected asset
  const selectedAsset = useMemo(() => {
    return (
      marketAssets.find((a) => a.symbol === selectedAssetSymbol) ||
      marketAssets[0]
    );
  }, [marketAssets, selectedAssetSymbol]);

  // Converter state
  const [convertAmount, setConvertAmount] = useState<number>(1000000);
  const [fromAsset, setFromAsset] = useState<string>("IDR");
  const [toAsset, setToAsset] = useState<string>("USD");

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return marketAssets.filter((asset) => {
      // Category filter
      if (selectedCategory === "WATCHLIST") {
        if (!watchlist.includes(asset.symbol)) return false;
      } else if (selectedCategory !== "ALL") {
        if (asset.category !== selectedCategory) return false;
      }

      // Search filter (client-side text match)
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          asset.name.toLowerCase().includes(q) ||
          asset.symbol.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [marketAssets, selectedCategory, searchQuery, watchlist]);

  // Chart data for selected asset
  const chartData = useMemo(() => {
    const len = selectedAsset.sparkline.length;
    return selectedAsset.sparkline.map((val, idx) => ({
      time: len > 10 ? `T-${len - idx}` : `H-${len - 1 - idx}`,
      price: val,
    }));
  }, [selectedAsset]);

  // Converter logic using live forex & crypto prices
  const convertedResult = useMemo(() => {
    if (!convertAmount || convertAmount <= 0) return 0;

    // Convert from source to IDR first
    let amountInIDR = convertAmount;
    if (fromAsset === "IDR") {
      amountInIDR = convertAmount;
    } else if (forexRates[fromAsset]) {
      amountInIDR = convertAmount * forexRates[fromAsset];
    } else {
      const asset = marketAssets.find((a) => a.symbol === fromAsset);
      if (asset && asset.price > 0) {
        amountInIDR = convertAmount * asset.price;
      }
    }

    // Convert from IDR to target asset
    if (toAsset === "IDR") return amountInIDR;
    if (forexRates[toAsset] && forexRates[toAsset] > 0) {
      return amountInIDR / forexRates[toAsset];
    }

    const target = marketAssets.find((a) => a.symbol === toAsset);
    if (target && target.price > 0) {
      return amountInIDR / target.price;
    }

    return 0;
  }, [marketAssets, forexRates, convertAmount, fromAsset, toAsset]);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="gsap-fade-up flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <LineChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>Pasar Finansial & Aset</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Pantau pergerakan harga kripto via CoinGecko, valuta asing via
            ExchangeRate-API, emas spot dunia, dan saham secara real-time.
          </p>
        </div>

        {/* Live status badge & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span
              className={`h-2 w-2 rounded-xs ${
                dataSource === "live"
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-blue-500"
              }`}
            />
            <span className="border-b border-slate-300 dark:border-slate-700 pb-0.5 font-medium">
              {dataSource === "live"
                ? "Pasar Live (Kripto, Valas, Emas, Saham)"
                : "Mode Standar"}
            </span>
            {lastUpdated && (
              <span className="text-[11px] text-slate-400">
                •{" "}
                {new Date(lastUpdated).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchMarketData()}
            disabled={isLoadingLive}
            className="h-9 rounded-xl text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoadingLive ? "animate-spin text-blue-600" : ""}`}
            />
            <span>{isLoadingLive ? "Memuat..." : "Segarkan"}</span>
          </Button>

          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari simbol atau aset..."
              className="pl-9 h-9 text-xs sm:text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Featured Interactive Chart Card */}
      <div className="gsap-fade-up rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner shrink-0 overflow-hidden">
              {selectedAsset.image ? (
                <Image
                  src={selectedAsset.image}
                  alt={selectedAsset.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                />
              ) : (
                <span>{selectedAsset.icon || "📈"}</span>
              )}
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
              {formatMarketPrice(
                selectedAsset.price,
                selectedAsset.currency || "IDR",
              )}
            </span>
            {selectedAsset.currency === "USD" && (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                ≈ Rp
                {Math.round(
                  selectedAsset.price * (forexRates.USD || 16000),
                ).toLocaleString("id-ID")}
              </span>
            )}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-xs font-bold flex items-center gap-0.5 ${
                  selectedAsset.change24h >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {selectedAsset.change24h >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {selectedAsset.change24h >= 0 ? "+" : ""}
                {selectedAsset.change24h}% (24 Jam)
              </span>
            </div>
          </div>
        </div>

        {/* 24h High/Low Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <p className="text-[11px] font-semibold text-slate-400">
              Tertinggi 24 Jam
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              {formatMarketPrice(
                selectedAsset.high24h,
                selectedAsset.currency || "IDR",
              )}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">
              Terendah 24 Jam
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              {formatMarketPrice(
                selectedAsset.low24h,
                selectedAsset.currency || "IDR",
              )}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">
              Total Volume
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {selectedAsset.volume}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">
              Satuan / Unit
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              1 {selectedAsset.unit || selectedAsset.symbol}
            </p>
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
                        <p className="font-bold">
                          {typeof payload[0]?.value === "number"
                            ? formatCurrency(payload[0].value)
                            : payload[0]?.value}
                        </p>
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
              { id: "Stock" as const, label: "Saham" },
              { id: "Commodity" as const, label: "Emas & Logam" },
              { id: "Forex" as const, label: "Valas / Forex" },
              { id: "WATCHLIST" as const, label: "Watchlist Saya" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                }`}
              >
                {tab.id === "WATCHLIST" && (
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                )}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Asset List */}
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {filteredAssets.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="flex justify-center mb-2">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <Search className="h-5 w-5" />
                  </div>
                </div>
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
                      onClick={() => setSelectedAssetSymbol(asset.symbol)}
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
                        {asset.image ? (
                          <Image
                            src={asset.image}
                            alt={asset.name}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-md object-contain shrink-0"
                          />
                        ) : (
                          <span className="text-xl shrink-0">{asset.icon}</span>
                        )}
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
                          {formatMarketPrice(
                            asset.price,
                            asset.currency || "IDR",
                          )}
                        </p>
                        {asset.currency === "USD" && (
                          <p className="text-[10px] text-slate-400 font-medium">
                            ≈ Rp
                            {Math.round(
                              asset.price * (forexRates.USD || 16000),
                            ).toLocaleString("id-ID")}
                          </p>
                        )}
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
              <span>Kalkulator Konversi Real-Time</span>
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
                    className="w-28 px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold dark:border-slate-800 dark:bg-slate-800"
                  >
                    <optgroup label="Valuta Asing">
                      <option value="IDR">IDR (Rp)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="SGD">SGD (S$)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="AUD">AUD (A$)</option>
                      <option value="MYR">MYR (RM)</option>
                      <option value="SAR">SAR (SR)</option>
                    </optgroup>
                    <optgroup label="Kripto & Emas">
                      <option value="GOLD">Emas (Gram)</option>
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="SOL">Solana (SOL)</option>
                      <option value="BNB">BNB</option>
                      <option value="XRP">XRP</option>
                    </optgroup>
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
                    <optgroup label="Valuta Asing">
                      <option value="IDR">Rupiah Indonesia (IDR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="SGD">Singapore Dollar (SGD)</option>
                      <option value="JPY">Japanese Yen (JPY)</option>
                      <option value="GBP">British Pound (GBP)</option>
                      <option value="AUD">Australian Dollar (AUD)</option>
                      <option value="MYR">Malaysian Ringgit (MYR)</option>
                      <option value="SAR">Saudi Riyal (SAR)</option>
                    </optgroup>
                    <optgroup label="Kripto">
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="SOL">Solana (SOL)</option>
                      <option value="BNB">BNB</option>
                      <option value="XRP">Ripple (XRP)</option>
                    </optgroup>
                    <optgroup label="Komoditas & Saham">
                      <option value="GOLD">Emas Antam (Gram)</option>
                      <option value="BBCA">Saham BBCA (Lembar)</option>
                      <option value="BBRI">Saham BBRI (Lembar)</option>
                      <option value="BMRI">Saham BMRI (Lembar)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Hasil Estimasi */}
              <div className="rounded-xl bg-blue-50/60 p-3.5 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40">
                <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  Hasil Estimasi Real-Time
                </p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {toAsset === "IDR"
                    ? formatCurrency(convertedResult)
                    : [
                          "USD",
                          "EUR",
                          "GBP",
                          "SGD",
                          "JPY",
                          "AUD",
                          "MYR",
                          "SAR",
                          "CNY",
                        ].includes(toAsset)
                      ? `${toAsset} ${convertedResult.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })}`
                      : `${convertedResult.toLocaleString("id-ID", {
                          maximumFractionDigits: 6,
                        })} ${toAsset}`}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Kurs resmi ExchangeRate-API & CoinGecko
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

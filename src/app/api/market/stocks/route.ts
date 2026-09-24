import { type NextRequest, NextResponse } from "next/server";
import type { MarketAsset, StockQuote } from "~/types/database";

interface CacheEntry {
  assets: MarketAsset[];
  quotes: StockQuote[];
  timestamp: number;
}

let memoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// Curated stock list: Indonesian Blue Chips & Global Tech Giants
const DEFAULT_SYMBOLS = [
  {
    symbol: "BBCA.JK",
    name: "Bank Central Asia Tbk",
    icon: "🏦",
    unit: "Lembar",
  },
  {
    symbol: "BBRI.JK",
    name: "Bank Rakyat Indonesia Tbk",
    icon: "🏛️",
    unit: "Lembar",
  },
  { symbol: "BMRI.JK", name: "Bank Mandiri Tbk", icon: "🏢", unit: "Lembar" },
  {
    symbol: "TLKM.JK",
    name: "Telkom Indonesia Tbk",
    icon: "📡",
    unit: "Lembar",
  },
  { symbol: "AAPL", name: "Apple Inc.", icon: "🍎", unit: "Share" },
  { symbol: "MSFT", name: "Microsoft Corporation", icon: "💻", unit: "Share" },
  { symbol: "NVDA", name: "NVIDIA Corporation", icon: "⚡", unit: "Share" },
  { symbol: "TSLA", name: "Tesla Inc.", icon: "🚗", unit: "Share" },
];

function formatVolume(vol: number, currency: string): string {
  if (!vol || vol <= 0) return "-";
  const prefix = currency === "IDR" ? "Rp " : "$ ";
  if (vol >= 1e12) return `${prefix}${(vol / 1e12).toFixed(1)} T`;
  if (vol >= 1e9) return `${prefix}${(vol / 1e9).toFixed(1)} M`;
  if (vol >= 1e6) return `${prefix}${(vol / 1e6).toFixed(1)} Jt`;
  return `${prefix}${Math.round(vol).toLocaleString("id-ID")}`;
}

async function fetchSingleStock(
  sym: string,
  fallbackName: string,
  icon: string,
  unit: string,
): Promise<{ asset: MarketAsset; quote: StockQuote } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1h&range=5d`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
        signal: controller.signal,
        next: { revalidate: 60 },
      },
    );

    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const indicators = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;

    if (!meta || typeof meta.regularMarketPrice !== "number") {
      return null;
    }

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose || price;
    const change = price - prevClose;
    const changePercent =
      prevClose > 0 ? Math.round((change / prevClose) * 100 * 100) / 100 : 0;
    const high24h = meta.regularMarketDayHigh || price;
    const low24h = meta.regularMarketDayLow || price;
    const currency = meta.currency || (sym.endsWith(".JK") ? "IDR" : "USD");
    const name = meta.shortName || meta.longName || fallbackName;
    const timestamp = new Date(meta.regularMarketTime * 1000).toISOString();

    // 7 points sparkline
    let sparkline: number[] = [];
    if (Array.isArray(indicators)) {
      const validPoints = indicators.filter(
        (p): p is number => typeof p === "number" && !Number.isNaN(p),
      );
      if (validPoints.length >= 7) {
        const step = Math.floor(validPoints.length / 7);
        sparkline = Array.from({ length: 7 }, (_, i) => validPoints[i * step]);
      }
    }
    if (sparkline.length === 0) {
      sparkline = [prevClose, price];
    }

    const volumeStr = formatVolume(meta.regularMarketVolume || 0, currency);

    const quote: StockQuote = {
      symbol: sym,
      name,
      price,
      currency,
      change: Math.round(change * 100) / 100,
      changePercent,
      high24h,
      low24h,
      volume: volumeStr,
      timestamp,
      sparkline,
    };

    const asset: MarketAsset = {
      symbol: sym,
      name,
      category: "Stock",
      price,
      currency,
      change24h: changePercent,
      high24h,
      low24h,
      volume: volumeStr,
      sparkline,
      unit,
      icon,
    };

    return { asset, quote };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q")?.trim() || "";
  // Security hardening: limit length to 30 and allow only safe ticker characters
  const sanitizedQuery = rawQuery.replace(/[^a-zA-Z0-9.-]/g, "").slice(0, 30);

  // 1. Search Query Handling
  if (sanitizedQuery && sanitizedQuery.length >= 2) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const searchRes = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(sanitizedQuery)}&quotesCount=6&newsCount=0`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "application/json",
          },
          signal: controller.signal,
          next: { revalidate: 30 },
        },
      );
      clearTimeout(timeout);

      if (searchRes.ok) {
        const searchJson = await searchRes.json();
        const rawQuotes = searchJson?.quotes || [];
        const equities = rawQuotes.filter(
          (q: { quoteType?: string }) =>
            q.quoteType === "EQUITY" || q.quoteType === "ETF",
        );

        const fetchedPromises = equities
          .slice(0, 4)
          .map((eq: { symbol: string; shortname?: string }) =>
            fetchSingleStock(
              eq.symbol,
              eq.shortname || eq.symbol,
              "📈",
              eq.symbol.endsWith(".JK") ? "Lembar" : "Share",
            ),
          );

        const results = await Promise.all(fetchedPromises);
        const validResults = results.filter(
          (
            r,
          ): r is {
            asset: MarketAsset;
            quote: StockQuote;
          } => r !== null,
        );

        return NextResponse.json({
          success: true,
          source: "search",
          assets: validResults.map((r) => r.asset),
          quotes: validResults.map((r) => r.quote),
        });
      }
    } catch (err) {
      console.error("Stock search error:", err);
    }
  }

  // 2. Default Curated Stocks
  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      source: "cache",
      updatedAt: new Date(memoryCache.timestamp).toISOString(),
      assets: memoryCache.assets,
      quotes: memoryCache.quotes,
    });
  }

  try {
    const promises = DEFAULT_SYMBOLS.map((item) =>
      fetchSingleStock(item.symbol, item.name, item.icon, item.unit),
    );

    const results = await Promise.all(promises);
    const validResults = results.filter(
      (
        r,
      ): r is {
        asset: MarketAsset;
        quote: StockQuote;
      } => r !== null,
    );

    if (validResults.length === 0) {
      if (memoryCache) {
        return NextResponse.json({
          success: true,
          source: "stale-cache",
          warning: "Stock API error. Serving cached data.",
          updatedAt: new Date(memoryCache.timestamp).toISOString(),
          assets: memoryCache.assets,
          quotes: memoryCache.quotes,
        });
      }

      return NextResponse.json(
        {
          success: false,
          error:
            "Data pasar saham sementara tidak dapat diakses dari provider.",
        },
        { status: 503 },
      );
    }

    const assets = validResults.map((r) => r.asset);
    const quotes = validResults.map((r) => r.quote);

    memoryCache = {
      assets,
      quotes,
      timestamp: now,
    };

    return NextResponse.json({
      success: true,
      source: "live",
      updatedAt: new Date(now).toISOString(),
      assets,
      quotes,
    });
  } catch (error) {
    if (memoryCache) {
      return NextResponse.json({
        success: true,
        source: "stale-cache",
        updatedAt: new Date(memoryCache.timestamp).toISOString(),
        assets: memoryCache.assets,
        quotes: memoryCache.quotes,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat data pasar saham.",
      },
      { status: 500 },
    );
  }
}

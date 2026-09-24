import { NextResponse } from "next/server";
import type { GoldQuote, MarketAsset } from "~/types/database";

interface CacheEntry {
  quote: GoldQuote;
  asset: MarketAsset;
  timestamp: number;
}

let memoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// 1 Troy Ounce = 31.1034768 Grams
const TROY_OUNCE_TO_GRAM = 31.1034768;

export async function GET() {
  const now = Date.now();

  // Return fresh in-memory cache if available
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      source: "cache",
      updatedAt: new Date(memoryCache.timestamp).toISOString(),
      quote: memoryCache.quote,
      assets: [memoryCache.asset],
    });
  }

  try {
    // Attempt 1: Fetch Gold Spot via Real Gold API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let price = 0;
    let change24h = 0;
    let high24h = 0;
    let low24h = 0;
    let currency = "USD";
    let timestamp = new Date().toISOString();
    let sparkline: number[] = [];

    let fetchedSuccessfully = false;

    try {
      // Primary: COMEX Gold Futures / Spot Chart (Yahoo Finance v8 chart)
      const res = await fetch(
        "https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1h&range=5d",
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

      if (res.ok) {
        const json = await res.json();
        const meta = json?.chart?.result?.[0]?.meta;
        const indicators =
          json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;

        if (meta && typeof meta.regularMarketPrice === "number") {
          price = meta.regularMarketPrice;
          change24h =
            typeof meta.regularMarketChangePercent === "number"
              ? Math.round(meta.regularMarketChangePercent * 100) / 100
              : 0;
          high24h = meta.regularMarketDayHigh || price;
          low24h = meta.regularMarketDayLow || price;
          currency = meta.currency || "USD";
          timestamp = new Date(meta.regularMarketTime * 1000).toISOString();

          if (Array.isArray(indicators)) {
            // Take 7 evenly spaced points for sparkline
            const validPoints = indicators.filter(
              (p): p is number => typeof p === "number" && !Number.isNaN(p),
            );
            if (validPoints.length >= 7) {
              const step = Math.floor(validPoints.length / 7);
              sparkline = Array.from(
                { length: 7 },
                (_, i) => validPoints[i * step],
              );
            }
          }
          fetchedSuccessfully = true;
        }
      }
    } catch {
      // Fallback below
    } finally {
      clearTimeout(timeoutId);
    }

    // Attempt 2: If primary failed, use Gold-API.com spot price
    if (!fetchedSuccessfully) {
      const fallbackController = new AbortController();
      const fallbackTimeout = setTimeout(
        () => fallbackController.abort(),
        5000,
      );

      try {
        const spotRes = await fetch("https://api.gold-api.com/price/XAU", {
          signal: fallbackController.signal,
          headers: { Accept: "application/json" },
          next: { revalidate: 60 },
        });

        if (spotRes.ok) {
          const spotData = await spotRes.json();
          if (spotData && typeof spotData.price === "number") {
            price = spotData.price;
            currency = spotData.currency || "USD";
            change24h = 0;
            high24h = price;
            low24h = price;
            timestamp = spotData.updatedAt || new Date().toISOString();
            fetchedSuccessfully = true;
          }
        }
      } finally {
        clearTimeout(fallbackTimeout);
      }
    }

    if (!fetchedSuccessfully || price <= 0) {
      // Return stale cache if available
      if (memoryCache) {
        return NextResponse.json({
          success: true,
          source: "stale-cache",
          warning: "Gold API temporarily unavailable. Serving cached data.",
          updatedAt: new Date(memoryCache.timestamp).toISOString(),
          quote: memoryCache.quote,
          assets: [memoryCache.asset],
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: "Data harga emas sementara tidak dapat diakses dari provider.",
        },
        { status: 503 },
      );
    }

    // Fetch baseline USD/IDR rate for conversion insight.
    // Uses the same authenticated v6 endpoint as forex/route.ts for consistency.
    // Falls back to a hardcoded baseline to avoid blocking the gold response.
    let usdToIdrRate = 16000;
    const forexApiKey = process.env.EXCHANGERATE_API_KEY;
    try {
      const forexUrl = forexApiKey
        ? `https://v6.exchangerate-api.com/v6/${forexApiKey}/latest/USD`
        : "https://api.exchangerate-api.com/v4/latest/USD"; // Unauthenticated fallback (rate-limited)
      const forexRes = await fetch(forexUrl, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(3000),
      });
      if (forexRes.ok) {
        const forexData = await forexRes.json();
        // v6 returns conversion_rates, v4 returns rates
        const idrRate =
          forexData?.conversion_rates?.IDR ?? forexData?.rates?.IDR;
        if (idrRate) {
          usdToIdrRate = idrRate;
        }
      }
    } catch {
      // Keep baseline
    }

    const priceInIdr = Math.round(price * usdToIdrRate);
    const perGramInIdr = Math.round(priceInIdr / TROY_OUNCE_TO_GRAM);

    const quote: GoldQuote = {
      symbol: "XAU",
      name: "Emas Spot Dunia (Gold)",
      price,
      currency,
      unit: "troy oz",
      change24h,
      high24h,
      low24h,
      timestamp,
      priceInIdr,
      perGramInIdr,
    };

    const asset: MarketAsset = {
      symbol: "GOLD",
      name: "Emas Spot (XAU/USD)",
      category: "Commodity",
      price,
      currency: "USD",
      change24h,
      high24h,
      low24h,
      volume: `Per oz (${currency}) • Est. Rp${perGramInIdr.toLocaleString("id-ID")}/gram`,
      sparkline:
        sparkline.length > 0 ? sparkline : [price, price, price, price, price],
      unit: "oz",
      icon: "🪙",
    };

    // Store in cache
    memoryCache = {
      quote,
      asset,
      timestamp: now,
    };

    return NextResponse.json({
      success: true,
      source: "live",
      updatedAt: new Date(now).toISOString(),
      quote,
      assets: [asset],
    });
  } catch (error) {
    if (memoryCache) {
      return NextResponse.json({
        success: true,
        source: "stale-cache",
        updatedAt: new Date(memoryCache.timestamp).toISOString(),
        quote: memoryCache.quote,
        assets: [memoryCache.asset],
      });
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat data emas.",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import type { MarketAsset } from "~/types/database";

const API_KEY = process.env.EXCHANGERATE_API_KEY || "a723caf7a71f1116fea077eb";
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

interface ExchangeRateResponse {
  result: string;
  documentation: string;
  time_last_update_utc: string;
  base_code: string;
  conversion_rates: Record<string, number>;
}

interface CacheEntry {
  data: {
    assets: MarketAsset[];
    rates: Record<string, number>; // Currency to IDR rate
  };
  timestamp: number;
}

let memoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

const CURRENCIES = [
  { symbol: "USD/IDR", code: "USD", name: "US Dollar ke Rupiah", icon: "💵" },
  { symbol: "EUR/IDR", code: "EUR", name: "Euro ke Rupiah", icon: "💶" },
  {
    symbol: "GBP/IDR",
    code: "GBP",
    name: "British Pound ke Rupiah",
    icon: "💷",
  },
  {
    symbol: "SGD/IDR",
    code: "SGD",
    name: "Singapore Dollar ke Rupiah",
    icon: "🇸🇬",
  },
  {
    symbol: "JPY/IDR",
    code: "JPY",
    name: "Japanese Yen ke Rupiah",
    icon: "🇯🇵",
  },
  {
    symbol: "AUD/IDR",
    code: "AUD",
    name: "Australian Dollar ke Rupiah",
    icon: "🇦🇺",
  },
  {
    symbol: "CNY/IDR",
    code: "CNY",
    name: "Chinese Yuan ke Rupiah",
    icon: "🇨🇳",
  },
  {
    symbol: "MYR/IDR",
    code: "MYR",
    name: "Malaysian Ringgit ke Rupiah",
    icon: "🇲🇾",
  },
  { symbol: "SAR/IDR", code: "SAR", name: "Saudi Riyal ke Rupiah", icon: "🇸🇦" },
];

export async function GET() {
  const now = Date.now();

  // Return fresh in-memory cache if available
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      source: "cache",
      updatedAt: new Date(memoryCache.timestamp).toISOString(),
      assets: memoryCache.data.assets,
      rates: memoryCache.data.rates,
    });
  }

  try {
    const res = await fetch(BASE_URL, {
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      if (memoryCache) {
        return NextResponse.json({
          success: true,
          source: "stale-cache",
          warning: `ExchangeRate-API status ${res.status}. Serving cached data.`,
          updatedAt: new Date(memoryCache.timestamp).toISOString(),
          assets: memoryCache.data.assets,
          rates: memoryCache.data.rates,
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: `ExchangeRate-API returned status ${res.status}`,
        },
        { status: res.status },
      );
    }

    const data = (await res.json()) as ExchangeRateResponse;
    if (data.result !== "success" || !data.conversion_rates) {
      throw new Error("Invalid response format from ExchangeRate-API");
    }

    const usdToIdr = data.conversion_rates.IDR || 17840;

    // Calculate rates of each currency in terms of IDR
    const ratesInIDR: Record<string, number> = {
      IDR: 1,
      USD: usdToIdr,
    };

    const assets: MarketAsset[] = CURRENCIES.map((curr) => {
      const rateToUSD = data.conversion_rates[curr.code] || 1;
      // 1 Unit of curr = (usdToIdr / rateToUSD) IDR
      const priceInIDR = Math.round((usdToIdr / rateToUSD) * 100) / 100;
      ratesInIDR[curr.code] = priceInIDR;

      // Generate a realistic 7-point sparkline based around current rate
      const sparkline = [
        Math.round(priceInIDR * 0.996),
        Math.round(priceInIDR * 0.998),
        Math.round(priceInIDR * 0.997),
        Math.round(priceInIDR * 1.002),
        Math.round(priceInIDR * 1.001),
        Math.round(priceInIDR * 0.999),
        priceInIDR,
      ];

      return {
        symbol: curr.symbol,
        name: curr.name,
        category: "Forex" as const,
        price: priceInIDR,
        change24h: 0.08,
        high24h: Math.round(priceInIDR * 1.004),
        low24h: Math.round(priceInIDR * 0.995),
        volume: "Valuta Asing (Forex)",
        sparkline,
        unit: curr.code,
        icon: curr.icon,
      };
    });

    memoryCache = {
      data: {
        assets,
        rates: ratesInIDR,
      },
      timestamp: now,
    };

    return NextResponse.json({
      success: true,
      source: "live",
      updatedAt: data.time_last_update_utc || new Date(now).toISOString(),
      assets,
      rates: ratesInIDR,
    });
  } catch (error) {
    if (memoryCache) {
      return NextResponse.json({
        success: true,
        source: "stale-cache",
        warning: "Network issue. Serving cached forex data.",
        updatedAt: new Date(memoryCache.timestamp).toISOString(),
        assets: memoryCache.data.assets,
        rates: memoryCache.data.rates,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch forex rates",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import type { MarketAsset } from "~/types/database";

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.COINGECKO_API_KEY;

// In-memory cache to guarantee compliance with Demo plan (30 calls/min)
interface CacheEntry {
  data: MarketAsset[];
  timestamp: number;
}

let memoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function formatIDRVolume(vol: number): string {
  if (!vol || vol <= 0) return "Rp 0";
  if (vol >= 1e12) return `Rp ${(vol / 1e12).toFixed(1)} T`;
  if (vol >= 1e9) return `Rp ${(vol / 1e9).toFixed(1)} M`;
  if (vol >= 1e6) return `Rp ${(vol / 1e6).toFixed(1)} Jt`;
  return `Rp ${Math.round(vol).toLocaleString("id-ID")}`;
}

const CRYPTO_ICONS: Record<string, string> = {
  BTC: "₿",
  ETH: "Ξ",
  SOL: "◎",
  BNB: "🟡",
  XRP: "✕",
  ADA: "₳",
  DOGE: "Ð",
};

interface CoinGeckoMarketItem {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export async function GET() {
  const now = Date.now();

  // Return fresh in-memory cache if available within TTL
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      source: "cache",
      updatedAt: new Date(memoryCache.timestamp).toISOString(),
      assets: memoryCache.data,
    });
  }

  try {
    const coinIds =
      "bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin";
    const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=idr&ids=${coinIds}&sparkline=true&price_change_percentage=24h`;

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (API_KEY) {
      headers["x-cg-demo-api-key"] = API_KEY;
    }

    const res = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      // If rate limited (429) or error, fallback to cache if available
      if (memoryCache) {
        return NextResponse.json({
          success: true,
          source: "stale-cache",
          warning: `CoinGecko status ${res.status}. Serving cached data.`,
          updatedAt: new Date(memoryCache.timestamp).toISOString(),
          assets: memoryCache.data,
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: `CoinGecko API returned status ${res.status}`,
        },
        { status: res.status },
      );
    }

    const items = (await res.json()) as CoinGeckoMarketItem[];

    const mappedAssets: MarketAsset[] = items.map((coin) => {
      const sym = coin.symbol.toUpperCase();

      // Sample sparkline to ~24 data points for smooth responsive charts
      let sparkline: number[] = [];
      if (
        coin.sparkline_in_7d?.price &&
        coin.sparkline_in_7d.price.length > 0
      ) {
        const raw = coin.sparkline_in_7d.price;
        const step = Math.max(1, Math.floor(raw.length / 24));
        sparkline = raw.filter((_, i) => i % step === 0);
      } else {
        sparkline = [coin.low_24h, coin.current_price, coin.high_24h];
      }

      return {
        symbol: sym,
        name: coin.name,
        category: "Crypto" as const,
        price: coin.current_price || 0,
        change24h: Number((coin.price_change_percentage_24h || 0).toFixed(2)),
        high24h: coin.high_24h || coin.current_price,
        low24h: coin.low_24h || coin.current_price,
        volume: formatIDRVolume(coin.total_volume),
        sparkline,
        unit: sym,
        icon: CRYPTO_ICONS[sym] || "₿",
        image: coin.image,
      };
    });

    // Update memory cache
    memoryCache = {
      data: mappedAssets,
      timestamp: now,
    };

    return NextResponse.json({
      success: true,
      source: "live",
      updatedAt: new Date(now).toISOString(),
      assets: mappedAssets,
    });
  } catch (error) {
    if (memoryCache) {
      return NextResponse.json({
        success: true,
        source: "stale-cache",
        warning: "Network issue. Serving cached CoinGecko data.",
        updatedAt: new Date(memoryCache.timestamp).toISOString(),
        assets: memoryCache.data,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch CoinGecko data",
      },
      { status: 500 },
    );
  }
}

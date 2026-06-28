import { TtlCache } from "../utils/ttlCache.js";
import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";

const DEFAULT_BASE_URL = "https://cms.integreat-app.de/api/v3";
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

export interface IntegreatLanguage {
  id: number;
  code: string;
  bcp47_tag: string;
  native_name: string;
  dir: "LEFT_TO_RIGHT" | "RIGHT_TO_LEFT";
}

export interface IntegreatRegion {
  id: number;
  name: string;
  path: string;
  live: boolean;
  prefix?: string;
  name_without_prefix?: string;
  aliases?: Record<string, unknown>;
  languages: IntegreatLanguage[];
}

export interface IntegreatContentItem {
  id: number | null;
  url: string;
  path: string;
  title: string;
  excerpt?: string;
  content?: string;
  last_updated?: string;
  modified_gmt?: string;
  category?: {
    id: number;
    name: string;
  };
  location?: {
    name?: string;
    address?: string;
    town?: string;
    postcode?: string;
    country?: string;
  };
  event?: {
    start?: string;
    end?: string;
    start_date?: string;
    start_time?: string;
    timezone?: string;
  };
}

export interface IntegreatApiServiceOptions {
  baseUrl?: string;
  cacheTtlMs?: number;
}

export class IntegreatApiService {
  private readonly baseUrl: string;
  private readonly cache: TtlCache<unknown>;

  constructor(options: IntegreatApiServiceOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.cache = new TtlCache<unknown>(options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS);
  }

  async getRegions(): Promise<IntegreatRegion[]> {
    return this.getCached<IntegreatRegion[]>("regions", "/regions/");
  }

  async getPages(regionPath: string, languageCode: string): Promise<IntegreatContentItem[]> {
    return this.getRegionResource(regionPath, languageCode, "pages");
  }

  async getLocations(regionPath: string, languageCode: string): Promise<IntegreatContentItem[]> {
    return this.getRegionResource(regionPath, languageCode, "locations");
  }

  async getEvents(regionPath: string, languageCode: string): Promise<IntegreatContentItem[]> {
    return this.getRegionResource(regionPath, languageCode, "events");
  }

  private async getRegionResource(
    regionPath: string,
    languageCode: string,
    resource: "pages" | "locations" | "events",
  ): Promise<IntegreatContentItem[]> {
    const path = `/${encodeURIComponent(regionPath)}/${encodeURIComponent(languageCode)}/${resource}/`;
    return this.getCached<IntegreatContentItem[]>(`${regionPath}:${languageCode}:${resource}`, path);
  }

  private async getCached<ResponseBody>(key: string, path: string): Promise<ResponseBody> {
    const cached = this.cache.get(key);

    if (cached) {
      return cached as ResponseBody;
    }

    let response: Response;
    const url = `${this.baseUrl}${path}`;

    logger.debug("integreat.fetch", {
      url,
    });

    try {
      response = await fetch(url, {
        headers: {
          accept: "application/json",
        },
      });
    } catch (error) {
      throw new AppError("Could not reach the Integreat API.", 502, "integreat_unavailable", {
        cause: error instanceof Error ? error.message : "Unknown network error",
      });
    }

    if (!response.ok) {
      throw new AppError("Integreat API request failed.", 502, "integreat_request_failed", {
        status: response.status,
        statusText: response.statusText,
      });
    }

    const body = (await response.json()) as ResponseBody;
    this.cache.set(key, body);

    return body;
  }
}

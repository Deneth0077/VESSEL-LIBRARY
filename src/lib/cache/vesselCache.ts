import { IVessel } from '@/types';

let cachedVessels: IVessel[] | null = null;
let lastFetched: number = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute fresh TTL

export function getCachedVessels(): IVessel[] | null {
  return cachedVessels;
}

export function isCacheFresh(): boolean {
  return cachedVessels !== null && Date.now() - lastFetched < CACHE_TTL_MS;
}

export function setCachedVessels(vessels: IVessel[]): void {
  cachedVessels = vessels;
  lastFetched = Date.now();
}

export function invalidateVesselCache(): void {
  cachedVessels = null;
  lastFetched = 0;
}


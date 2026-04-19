// Simulated Polygon Amoy testnet on-chain layer.
// Generates realistic-looking 0x... 64-hex-char tx hashes and links to the
// Amoy block explorer. No real chain interaction — purely cosmetic for the
// prototype. Hashes are deterministic per signal id so they survive reloads.

const AMOY_EXPLORER = "https://amoy.polygonscan.com";

function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return h >>> 0;
}

/** Deterministic 0x + 64 hex chars derived from the signal id + a salt. */
export function fakeAmoyTxHash(seed: string): string {
  let s = `${seed}:atlas-sanctum:amoy:v1`;
  let out = "0x";
  // produce 64 hex chars (32 bytes) by chaining djb2 hashes
  for (let i = 0; i < 8; i++) {
    s = `${s}:${i}`;
    out += djb2(s).toString(16).padStart(8, "0");
  }
  return out.slice(0, 66);
}

export function amoyTxUrl(hash: string): string {
  return `${AMOY_EXPLORER}/tx/${hash}`;
}

export function amoyAddressUrl(addr: string): string {
  return `${AMOY_EXPLORER}/address/${addr}`;
}

export function shortHash(hash: string): string {
  if (!hash || hash.length < 12) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

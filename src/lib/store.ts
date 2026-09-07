import fs from "fs";
import path from "path";
import type { StoreData } from "./types";
import { buildSeedData } from "./seed";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getStore(): StoreData {
  ensureDataDir();
  if (!fs.existsSync(STORE_FILE)) {
    const seed = buildSeedData();
    fs.writeFileSync(STORE_FILE, JSON.stringify(seed, null, 2), "utf-8");
    return seed;
  }
  const raw = fs.readFileSync(STORE_FILE, "utf-8");
  return JSON.parse(raw) as StoreData;
}

export function saveStore(data: StoreData): void {
  ensureDataDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function resetStore(): StoreData {
  ensureDataDir();
  const seed = buildSeedData();
  fs.writeFileSync(STORE_FILE, JSON.stringify(seed, null, 2), "utf-8");
  return seed;
}

export function appendLog(
  category: StoreData["logs"][0]["category"],
  severity: StoreData["logs"][0]["severity"],
  message: string,
  meta?: Record<string, unknown>
) {
  const store = getStore();
  store.logs.unshift({
    id: `log_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    category,
    severity,
    message,
    meta,
    createdAt: new Date().toISOString(),
  });
  if (store.logs.length > 2000) store.logs = store.logs.slice(0, 2000);
  saveStore(store);
}

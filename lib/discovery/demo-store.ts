import type { DiscoveryActions, DiscoveryAction } from "@/lib/discovery/types";

const STORAGE_KEY = "mingle-demo-discovery-actions-v1";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function readDiscoveryActions(): DiscoveryActions {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, DiscoveryAction] =>
        typeof entry[0] === "string" && ["liked", "passed", "saved", "blocked"].includes(String(entry[1])),
      ),
    );
  } catch {
    return {};
  }
}

export function subscribeDiscoveryActions(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setDiscoveryAction(id: string, action: DiscoveryAction | null) {
  const current = readDiscoveryActions();
  if (action) current[id] = action;
  else delete current[id];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    emit();
    return true;
  } catch {
    return false;
  }
}

export function clearDiscoveryActions() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Demo reset is best-effort only.
  }
  emit();
}

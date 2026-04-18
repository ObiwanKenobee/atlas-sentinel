import { useSyncExternalStore } from "react";
import { liveSignalStore } from "@/data/liveSignalStore";
import { signals as seedSignals, interventions as seedInterventions } from "@/data/signals";

export function useAllSignals() {
  const live = useSyncExternalStore(
    (l) => liveSignalStore.subscribe(l),
    () => liveSignalStore.getSignals(),
    () => liveSignalStore.getSignals(),
  );
  return [...live, ...seedSignals];
}

export function useAllInterventions() {
  const live = useSyncExternalStore(
    (l) => liveSignalStore.subscribe(l),
    () => liveSignalStore.getInterventions(),
    () => liveSignalStore.getInterventions(),
  );
  return { ...seedInterventions, ...live };
}

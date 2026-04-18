// Client-side store for user-submitted signals so they show up across pages within a session.
import type { Signal, Intervention } from "./signals";

type Listener = () => void;

class SignalStore {
  private signals: Signal[] = [];
  private interventions: Record<string, Intervention> = {};
  private listeners = new Set<Listener>();

  getSignals() { return this.signals; }
  getInterventions() { return this.interventions; }

  add(signal: Signal, intervention: Intervention) {
    this.signals = [signal, ...this.signals];
    this.interventions = { ...this.interventions, [signal.id]: intervention };
    this.listeners.forEach((l) => l());
  }

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }
}

export const liveSignalStore = new SignalStore();

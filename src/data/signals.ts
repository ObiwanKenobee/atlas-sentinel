export type Severity = "low" | "medium" | "high" | "critical";
export type SignalType = "water" | "health" | "climate" | "infrastructure" | "food";

export interface Signal {
  id: string;
  location: string;
  region: string;
  coords: [number, number]; // [lng, lat] approx, used for relative map positioning
  type: SignalType;
  severity: Severity;
  severityScore: number;
  affected: number;
  reportedAt: string;
  source: "community" | "satellite" | "sensor" | "ngo";
  summary: string;
}

export interface Intervention {
  signalId: string;
  recommendedAction: string;
  estimatedCost: number;
  impactScore: number;
  matchedActor: string;
  fundingSource: string;
  executionDays: number;
}

export interface ImpactRecord {
  id: string;
  location: string;
  intervention: string;
  cost: number;
  beneficiaries: number;
  verifiedAt: string;
  txHash: string;
  beforeNote: string;
  afterNote: string;
}

export const signals: Signal[] = [
  {
    id: "sig-001",
    location: "Kibera, Nairobi",
    region: "Kenya",
    coords: [36.78, -1.31],
    type: "water",
    severity: "critical",
    severityScore: 0.92,
    affected: 18400,
    reportedAt: "2h ago",
    source: "community",
    summary: "Borehole pump failure — three days without potable water reported across four blocks.",
  },
  {
    id: "sig-002",
    location: "Cox's Bazar",
    region: "Bangladesh",
    coords: [92.0, 21.4],
    type: "health",
    severity: "high",
    severityScore: 0.81,
    affected: 9200,
    reportedAt: "5h ago",
    source: "ngo",
    summary: "Cholera cases rising in camp 4E. Oral rehydration stocks depleted.",
  },
  {
    id: "sig-003",
    location: "Sahel Belt",
    region: "Niger",
    coords: [8.0, 15.5],
    type: "food",
    severity: "high",
    severityScore: 0.78,
    affected: 42000,
    reportedAt: "1d ago",
    source: "satellite",
    summary: "Sustained rainfall deficit; millet yields projected 38% below five-year average.",
  },
  {
    id: "sig-004",
    location: "Tacloban",
    region: "Philippines",
    coords: [125.0, 11.25],
    type: "climate",
    severity: "medium",
    severityScore: 0.62,
    affected: 5400,
    reportedAt: "3h ago",
    source: "sensor",
    summary: "Coastal flood sensors trending upward ahead of incoming low-pressure system.",
  },
  {
    id: "sig-005",
    location: "Goma",
    region: "DR Congo",
    coords: [29.23, -1.67],
    type: "infrastructure",
    severity: "medium",
    severityScore: 0.55,
    affected: 3100,
    reportedAt: "8h ago",
    source: "community",
    summary: "Bridge collapse on N2 cuts off two clinics from supply route.",
  },
  {
    id: "sig-006",
    location: "Quetta",
    region: "Pakistan",
    coords: [67.0, 30.18],
    type: "water",
    severity: "high",
    severityScore: 0.74,
    affected: 12700,
    reportedAt: "6h ago",
    source: "community",
    summary: "Aquifer drawdown accelerating; tankers now serving only half of registered households.",
  },
  {
    id: "sig-007",
    location: "Antofagasta",
    region: "Chile",
    coords: [-70.4, -23.65],
    type: "climate",
    severity: "low",
    severityScore: 0.34,
    affected: 800,
    reportedAt: "12h ago",
    source: "sensor",
    summary: "Air-quality particulate spike near port — sustained but within safe range.",
  },
  {
    id: "sig-008",
    location: "Maiduguri",
    region: "Nigeria",
    coords: [13.15, 11.85],
    type: "health",
    severity: "critical",
    severityScore: 0.89,
    affected: 22300,
    reportedAt: "1h ago",
    source: "ngo",
    summary: "Measles outbreak confirmed; cold-chain vaccine stock insufficient for projected need.",
  },
];

export const interventions: Record<string, Intervention> = {
  "sig-001": {
    signalId: "sig-001",
    recommendedAction: "Deploy two 10,000L water tanks + emergency pump repair crew",
    estimatedCost: 12400,
    impactScore: 0.87,
    matchedActor: "Maji Safi Kenya",
    fundingSource: "Impact Pool A · East Africa",
    executionDays: 4,
  },
  "sig-002": {
    signalId: "sig-002",
    recommendedAction: "Airlift 40,000 ORS sachets and dispatch mobile rehydration unit",
    estimatedCost: 38500,
    impactScore: 0.91,
    matchedActor: "MSF Bangladesh",
    fundingSource: "Rapid Health Reserve",
    executionDays: 3,
  },
  "sig-003": {
    signalId: "sig-003",
    recommendedAction: "Pre-position drought-resistant seed packs and cash transfers to 8,000 households",
    estimatedCost: 215000,
    impactScore: 0.74,
    matchedActor: "ACF Sahel",
    fundingSource: "Resilience Fund · Sahel",
    executionDays: 21,
  },
  "sig-004": {
    signalId: "sig-004",
    recommendedAction: "Activate barangay early-warning network; pre-stage shelter kits",
    estimatedCost: 9800,
    impactScore: 0.69,
    matchedActor: "PH Red Cross",
    fundingSource: "Climate Readiness Pool",
    executionDays: 2,
  },
  "sig-005": {
    signalId: "sig-005",
    recommendedAction: "Charter river crossing + temporary supply rerouting for 14 days",
    estimatedCost: 6200,
    impactScore: 0.58,
    matchedActor: "Caritas Goma",
    fundingSource: "Local Logistics Reserve",
    executionDays: 5,
  },
  "sig-006": {
    signalId: "sig-006",
    recommendedAction: "Subsidise tanker fleet expansion + rainwater capture for 1,200 households",
    estimatedCost: 47000,
    impactScore: 0.71,
    matchedActor: "WaterAid Pakistan",
    fundingSource: "Impact Pool B · South Asia",
    executionDays: 12,
  },
  "sig-007": {
    signalId: "sig-007",
    recommendedAction: "Continue passive monitoring; alert local clinics of mild advisory",
    estimatedCost: 0,
    impactScore: 0.22,
    matchedActor: "Local sensor network",
    fundingSource: "—",
    executionDays: 0,
  },
  "sig-008": {
    signalId: "sig-008",
    recommendedAction: "Emergency cold-chain delivery + 3-day vaccination campaign in 6 wards",
    estimatedCost: 68000,
    impactScore: 0.93,
    matchedActor: "UNICEF Nigeria",
    fundingSource: "Outbreak Response Fund",
    executionDays: 6,
  },
};

export const impactRecords: ImpactRecord[] = [
  {
    id: "imp-101",
    location: "Turkana, Kenya",
    intervention: "Solar borehole installation",
    cost: 18400,
    beneficiaries: 4200,
    verifiedAt: "Mar 14",
    txHash: "0x8f4a…c1d2",
    beforeNote: "12 km daily walk for water; 3 boreholes failing.",
    afterNote: "Reliable yield 14,000 L/day; child-clinic visits down 22%.",
  },
  {
    id: "imp-102",
    location: "Beira, Mozambique",
    intervention: "Cyclone shelter retrofit",
    cost: 56000,
    beneficiaries: 9800,
    verifiedAt: "Feb 28",
    txHash: "0x21be…77a4",
    beforeNote: "Roof failure in 2 of 3 prior storm seasons.",
    afterNote: "Held during Cyclone Ilan; zero displacement reported.",
  },
  {
    id: "imp-103",
    location: "Rohingya Camp 4E",
    intervention: "ORS airlift + mobile rehydration",
    cost: 38500,
    beneficiaries: 9200,
    verifiedAt: "Apr 02",
    txHash: "0xa1c0…9ef3",
    beforeNote: "Suspected cholera cases doubling every 36 hours.",
    afterNote: "Case curve flattened within 5 days; 0 fatalities recorded.",
  },
];

export const severityColor: Record<Severity, string> = {
  low: "var(--severity-low)",
  medium: "var(--severity-medium)",
  high: "var(--severity-high)",
  critical: "var(--severity-critical)",
};

export const severityLabel: Record<Severity, string> = {
  low: "Low",
  medium: "Moderate",
  high: "High",
  critical: "Critical",
};

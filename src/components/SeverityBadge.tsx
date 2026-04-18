import type { Severity } from "@/data/signals";
import { severityColor, severityLabel } from "@/data/signals";

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
      style={{
        color: severityColor[severity],
        borderColor: severityColor[severity],
        backgroundColor: `color-mix(in oklab, ${severityColor[severity]} 12%, transparent)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: severityColor[severity] }}
      />
      {severityLabel[severity]}
    </span>
  );
}

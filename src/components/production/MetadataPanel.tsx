import { productionPhases } from "@/lib/production-data";
import { Factory, Calendar, AlertTriangle } from "lucide-react";

interface MetadataPanelProps {
  selectedPhase: string;
}

export function MetadataPanel({ selectedPhase }: MetadataPanelProps) {
  const phaseData = productionPhases[selectedPhase];

  if (!phaseData) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Factory className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Mockup Level</p>
          <p className="text-sm text-muted-foreground">{phaseData.mockupLevel}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Calendar className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Timeline</p>
          <p className="text-sm text-muted-foreground">{phaseData.timeline}</p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
        <p className="text-sm text-foreground">{phaseData.caution}</p>
      </div>
    </div>
  );
}

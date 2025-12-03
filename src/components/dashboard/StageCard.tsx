import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scissors, Printer, Shirt, Sparkles, Package, Truck } from "lucide-react";
import { ProgressStage } from "@/hooks/use-work-items";

interface StageCardProps {
  stage: ProgressStage;
  count: number;
  onClick?: () => void;
}

const stageConfig: Record<ProgressStage, { icon: React.ElementType; color: string; bgColor: string }> = {
  Cutting: { icon: Scissors, color: "text-red-600", bgColor: "bg-red-100" },
  Printing: { icon: Printer, color: "text-blue-600", bgColor: "bg-blue-100" },
  Sewing: { icon: Shirt, color: "text-purple-600", bgColor: "bg-purple-100" },
  Finishing: { icon: Sparkles, color: "text-amber-600", bgColor: "bg-amber-100" },
  Packing: { icon: Package, color: "text-green-600", bgColor: "bg-green-100" },
  Delivery: { icon: Truck, color: "text-cyan-600", bgColor: "bg-cyan-100" },
};

export function StageCard({ stage, count, onClick }: StageCardProps) {
  const config = stageConfig[stage];
  const Icon = config.icon;

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{stage}</CardTitle>
        <div className={`p-2 rounded-full ${config.bgColor}`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{count}</span>
          <Badge variant="secondary">items</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

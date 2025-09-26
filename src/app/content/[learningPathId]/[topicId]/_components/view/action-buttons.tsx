import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";

type ActionButtonsProps = {
  onBackToDashboard: () => void;
  onMarkAsCompleted: () => void;
};

export function ActionButtons({
  onBackToDashboard,
  onMarkAsCompleted
}: ActionButtonsProps) {
  return (
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        onClick={onBackToDashboard}
        className="cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver al Dashboard
      </Button>

      <Button
        className="bg-green-600 hover:bg-green-700 cursor-pointer"
        onClick={onMarkAsCompleted}
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Marcar como Completado
      </Button>
    </div>
  );
}

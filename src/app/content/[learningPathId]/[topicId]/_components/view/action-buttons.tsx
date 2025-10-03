import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type ActionButtonsProps = {
  onBackToDashboard: () => void;
};

export function ActionButtons({
  onBackToDashboard
}: ActionButtonsProps) {
  return (
    <div className="flex justify-start items-center">
      <Button
        variant="outline"
        onClick={onBackToDashboard}
        className="cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver al Dashboard
      </Button>
    </div>
  );
}

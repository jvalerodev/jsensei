"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleLogout}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoading ? "Saliendo..." : "Cerrar Sesión"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Salir de tu cuenta</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

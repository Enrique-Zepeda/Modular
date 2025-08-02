import type React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GoogleAuthButtonProps {
  onClick: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

export function GoogleAuthButton({ onClick, loading = false, children }: GoogleAuthButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={loading}
      variant="outline"
      className="w-full flex items-center justify-center gap-2 bg-white text-black dark:bg-muted dark:text-white border border-input hover:bg-muted/40 transition-all rounded-md px-4 py-5 font-medium"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#4285F4"
            d="M533.5 278.4c0-18.7-1.5-37.6-4.7-55.9H272v105.8h147.3c-6.3 34.6-25 63.7-53.4 83.4l86.2 66.9c50.3-46.4 81.4-114.8 81.4-200.2z"
          />
          <path
            fill="#34A853"
            d="M272 544.3c72.6 0 133.6-24 178.2-65.5l-86.2-66.9c-24 16.2-54.5 25.8-92 25.8-70.7 0-130.7-47.6-152.1-111.5H32.6v69.9C77.3 482.6 168.5 544.3 272 544.3z"
          />
          <path
            fill="#FBBC05"
            d="M119.9 326.2c-10.3-30.2-10.3-62.6 0-92.8V163.5H32.6c-40.6 80.9-40.6 177.2 0 258.1l87.3-69.9z"
          />
          <path
            fill="#EA4335"
            d="M272 107.7c39.5-.6 77.6 13.9 106.6 40.8l79.8-79.8C407.1 24.2 340.9-.7 272 0 168.5 0 77.3 61.7 32.6 163.5l87.3 69.9c21.4-63.9 81.4-111.5 152.1-111.5z"
          />
        </svg>
      )}
      <span>{children}</span>
    </Button>
  );
}

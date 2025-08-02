import { Check, X } from "lucide-react";
import { authText } from "@/lib/constants/authText";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export function FormPasswordStrengthIndicator({ password, showRequirements = true }: PasswordStrengthIndicatorProps) {
  const requirements = [
    {
      key: "minLength",
      label: authText.register.passwordRequirements.minLength,
      test: (pwd: string) => pwd.length >= 8,
    },
    {
      key: "uppercase",
      label: authText.register.passwordRequirements.uppercase,
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      key: "lowercase",
      label: authText.register.passwordRequirements.lowercase,
      test: (pwd: string) => /[a-z]/.test(pwd),
    },
    {
      key: "number",
      label: authText.register.passwordRequirements.number,
      test: (pwd: string) => /\d/.test(pwd),
    },
    {
      key: "specialChar",
      label: authText.register.passwordRequirements.specialChar,
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    },
  ];

  const metRequirements = requirements.filter((req) => req.test(password)).length;
  const strength = (metRequirements / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strength < 40) return "bg-destructive";
    if (strength < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (strength < 40) return "Weak";
    if (strength < 80) return "Medium";
    return "Strong";
  };

  if (!password && !showRequirements) return null;

  return (
    <div className="space-y-3">
      {password && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Password strength</span>
            <span
              className={`font-medium ${
                strength >= 80 ? "text-green-600" : strength >= 40 ? "text-yellow-600" : "text-destructive"
              }`}
            >
              {getStrengthText()}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>
      )}

      {showRequirements && (
        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{authText.register.passwordRequirements.title}</p>
          <div className="space-y-1">
            {requirements.map((req) => {
              const isMet = req.test(password);
              return (
                <div key={req.key} className="flex items-center gap-2 text-xs">
                  {isMet ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <X className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className={isMet ? "text-green-600" : "text-muted-foreground"}>{req.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export function FormPasswordStrengthIndicator({ password, showRequirements = true }: PasswordStrengthIndicatorProps) {
  const requirements = [
    {
      key: "minLength",
      label: "Mínimo 8 caracteres",
      test: (pwd: string) => pwd.length >= 8,
    },
    {
      key: "uppercase",
      label: "Al menos una letra mayúscula",
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      key: "lowercase",
      label: "Al menos una letra minúscula",
      test: (pwd: string) => /[a-z]/.test(pwd),
    },
    {
      key: "number",
      label: "Al menos un número",
      test: (pwd: string) => /\d/.test(pwd),
    },
    {
      key: "specialChar",
      label: "Al menos un carácter especial",
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
    </div>
  );
}

import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "@/features/auth/thunks/authThunks";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useAuthForm } from "@/hooks/useAuthForm";
import { ThemeToggleButton } from "@/features/theme/components/ThemeToggleButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormBuilder } from "@/components/form/FormBuilder";
import { Dumbbell, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.auth);

  const form = useAuthForm(loginSchema);

  const onSubmit = async (data: LoginFormData) => {
    await dispatch(loginUser(data.email, data.password));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggleButton />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Logo and Brand */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">FitTracker</h1>
          <p className="text-sm text-muted-foreground">Transform your fitness journey</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl font-semibold">Welcome back</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormBuilder
                fields={[
                  {
                    name: "email",
                    label: "Email",
                    type: "email",
                    placeholder: "Enter your email address",
                  },
                  {
                    name: "password",
                    label: "Password",
                    type: "password",
                    placeholder: "Enter your password",
                  },
                ]}
                form={form}
              />

              <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Don't have an account?</span>
              </div>
            </div>

            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link to="/register">Create new account</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <button className="underline underline-offset-4 hover:text-primary">Terms of Service</button> and{" "}
            <button className="underline underline-offset-4 hover:text-primary">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  );
}

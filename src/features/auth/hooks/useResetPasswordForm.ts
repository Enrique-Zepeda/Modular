import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/schemas";
import { resetPassword } from "../thunks";

export function useResetPasswordForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");

      if (!accessToken) {
        navigate("/login");
        return;
      }

      const result = await dispatch(resetPassword({ password: data.password }));

      if (resetPassword.fulfilled.match(result)) {
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate("/login");
      }
    } catch (error) {
      console.error("Reset password error:", error);
    }
  };

  return {
    form,
    onSubmit,
  };
}

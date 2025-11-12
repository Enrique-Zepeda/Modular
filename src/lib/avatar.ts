export type Sexo = "masculino" | "femenino" | null | undefined;

const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

export const DEFAULT_AVATARS = {
  masculino: `${base}/avatars/male.png`,
  femenino: `${base}/avatars/female.png`,
} as const;

export function getDefaultAvatarForSexo(sexo?: Sexo): string {
  return sexo === "femenino" ? DEFAULT_AVATARS.femenino : DEFAULT_AVATARS.masculino;
}

export function getAvatarUrl(params: { url_avatar?: string | null; sexo?: Sexo }): string {
  const { url_avatar, sexo } = params;
  const u = (url_avatar ?? "").trim();
  return u !== "" ? u : getDefaultAvatarForSexo(sexo);
}

import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase/client";

export type DashboardKpis = {
  routineCount: number;
  workoutsThisMonth: number;
  totalVolumeThisMonth: number;
  monthStartISO: string;
  monthEndISO: string;
};

function getMonthBoundsNow() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  return { monthStartISO: monthStart.toISOString(), monthEndISO: monthEnd.toISOString() };
}

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Kpis"], // 👈 importante
  endpoints: (builder) => ({
    getDashboardKpis: builder.query<DashboardKpis, void>({
      async queryFn() {
        try {
          const { data: userData, error: userErr } = await supabase.auth.getUser();
          if (userErr) throw userErr;
          const uid = userData.user?.id;
          if (!uid) throw new Error("No authenticated user");

          const { monthStartISO, monthEndISO } = getMonthBoundsNow();

          // 1) Rutinas creadas
          const r1 = await supabase
            .from("Rutinas")
            .select("id_rutina", { count: "exact", head: true })
            .eq("owner_uid", uid);
          const routineCount = r1.count ?? 0;

          // 2) Entrenamientos completados este mes
          const r2 = await supabase
            .from("Entrenamientos")
            .select("id_sesion", { count: "exact", head: true })
            .eq("owner_uid", uid)
            .not("ended_at", "is", null)
            .gte("started_at", monthStartISO)
            .lt("started_at", monthEndISO);
          const workoutsThisMonth = r2.count ?? 0;

          // 3) Volumen total del mes (solo sets done)
          const r3 = await supabase
            .from("Entrenamientos")
            .select(
              `
              id_sesion,
              started_at,
              owner_uid,
              sets:EntrenamientoSets( kg, reps, done )
            `
            )
            .eq("owner_uid", uid)
            .gte("started_at", monthStartISO)
            .lt("started_at", monthEndISO);

          if (r3.error) throw r3.error;

          const totalVolumeThisMonth = (r3.data ?? []).reduce((acc: number, ses: any) => {
            const sets = ses.sets ?? [];
            let sessionVol = 0;
            for (const s of sets) {
              if (!s?.done) continue;
              const kg = typeof s.kg === "string" ? parseFloat(s.kg) : Number(s.kg ?? 0);
              const reps = Number(s.reps ?? 0);
              if (!Number.isFinite(kg) || !Number.isFinite(reps)) continue;
              sessionVol += kg * reps;
            }
            return acc + sessionVol;
          }, 0);

          return {
            data: {
              routineCount,
              workoutsThisMonth,
              totalVolumeThisMonth,
              monthStartISO,
              monthEndISO,
            },
          };
        } catch (error) {
          return { error: error as any };
        }
      },
      // 👇 esto permite que otras slices invaliden estas KPIs
      providesTags: (_res) => [{ type: "Kpis", id: "MONTH" }],
    }),
  }),
});

export const { useGetDashboardKpisQuery } = dashboardApi;

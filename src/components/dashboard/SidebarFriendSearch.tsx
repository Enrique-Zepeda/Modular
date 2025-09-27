import { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

/**
 * Buscador en el sidebar que navega a:
 *   /dashboard/friends?scope=users&q=<termino>
 * para abrir la pestaña "Buscar" con el término cargado.
 */
export default function SidebarFriendSearch() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    const url = `/dashboard/friends?scope=users&q=${encodeURIComponent(term)}`;
    navigate(url, { replace: pathname.startsWith("/dashboard") });
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar usuarios…" className="pl-8 h-9" />
      </div>
      <Button type="submit" size="sm" variant="secondary">
        Buscar
      </Button>
    </form>
  );
}

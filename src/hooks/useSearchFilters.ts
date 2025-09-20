import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Hook genérico para búsqueda con debounce.
 * @param initial Valor inicial del término de búsqueda.
 * @param delay   ms para el debounce (default 300).
 */

export function useSearchFilters(initial = "", delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initial);
  const debouncedSearch = useDebounce(searchTerm, delay);
  const clearSearch = () => setSearchTerm("");

  return { searchTerm, setSearchTerm, debouncedSearch, clearSearch };
}

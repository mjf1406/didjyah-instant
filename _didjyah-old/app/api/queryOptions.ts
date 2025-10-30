import type { DidjyahDb } from "@/server/db/types";
import { queryOptions } from "@tanstack/react-query";

export const DidjyahOptions = queryOptions<DidjyahDb[]>({
    queryKey: ["didjyahs"],
    queryFn: async () => {
      const response = await fetch("/api/didjyahs");
      return response.json() as unknown as DidjyahDb[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
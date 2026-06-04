import TrainingApiClient from "@/api/training/training.api";
import { TrainingCalendarItem } from "@/api/training/training.types";
import { useCallback, useEffect, useRef, useState } from "react";

export type SessionsByDate = Record<string, TrainingCalendarItem[]>;

export function useCalendarSessions(dateFrom: string, dateTo: string, isCoach: boolean) {
  const [sessions, setSessions] = useState<SessionsByDate>({});
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async () => {
    if (!dateFrom || !dateTo) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    try {
      const client = TrainingApiClient.getInstance();
      const items = isCoach
        ? await client.getCalendar(dateFrom, dateTo)
        : await client.getMyCalendar(dateFrom, dateTo);

      const grouped: SessionsByDate = {};
      for (const item of items) {
        const day = item.date.split("T")[0];
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(item);
      }
      setSessions(grouped);
    } catch {
      // swallow abort errors
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, isCoach]);

  useEffect(() => {
    fetch();
    return () => abortRef.current?.abort();
  }, [fetch]);

  return { sessions, isLoading, refetch: fetch };
}
